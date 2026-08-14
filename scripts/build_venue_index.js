// Builds the lookup the venue checker reads. Code decides; nothing here consults a model.
//
// Storage note: the corpus is ~89k venues. Firestore on the Spark plan caps at 20k document
// writes/day, so loading the corpus there takes five days and then bills a read per lookup.
// Static shards on Firebase Hosting are the same Google Cloud product, cost nothing, and a
// lookup fetches exactly one ~60KB file. Firestore keeps what it is actually for: decision_logs.
//
// ponytail: exact normalised-title and ISSN matching only, sharded by hash. Fuzzy matching
// across 89k titles cannot work shard-by-shard, so near-miss detection is applied only to the
// predatory list (loaded whole, ~4k entries) — the case where a lookalike name is the attack.
// Add a real fuzzy index when a legitimate venue is measurably being missed by typos.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA = path.join(__dirname, '..', 'public', 'data');
const INDEX_DIR = path.join(DATA, 'index');
const SHARD_BITS = 8; // 256 shards

const normalise = s =>
  String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const shardOf = key =>
  crypto.createHash('sha1').update(key).digest()[0].toString(16).padStart(2, '0').slice(0, SHARD_BITS / 4);

const read = f => {
  const p = path.join(DATA, f);
  if (!fs.existsSync(p)) throw new Error(`Missing ${f} — run the fetch_* scripts first.`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
};

// Conference proceedings are indexed per edition, so the Scopus title carries an ordinal,
// a year and often that year's theme: "9th IEEE Electron Devices Technology and Manufacturing
// Conference Shaping the Future … EDTM 2025". A student types the conference name. Two aliases
// bridge that, both derived by rule, never by guess:
//   series   — leading ordinal/year stripped, truncated at the word "conference"
//   acronym  — the trailing all-caps token before the year (EDTM), kept in its own map because
//              an acronym alone collides and must be corroborated before it counts as evidence.
const SERIES = /^(?:\d{4}\s+)?(?:\d+\s*(?:st|nd|rd|th)\s+)?(?:\d{4}\s+)?(.*?\bconference)\b/;
const ACRONYM = /\b([a-z]{3,10})\s+(?:19|20)\d{2}\b(?:\s+proceedings)?$/;

function aliasesFor(key) {
  const series = key.match(SERIES);
  return series && series[1] !== key ? [series[1]] : [];
}

// One entry per (venue, source). A venue found in three lists gets three pieces of
// evidence, which is the point: the student is shown who says so, not a single verdict.
function entriesFrom(rows, mapper) {
  const out = [];
  for (const r of rows) {
    const e = mapper(r);
    if (!e || !e.title) continue;
    const key = normalise(e.title);
    if (key.length < 4) continue;
    out.push({ ...e, key, issn: e.issn || [] });
  }
  return out;
}

function build() {
  const entries = [
    ...entriesFrom(read('doaj_venues.json'), r => ({
      title: r.title,
      status: 'indexed',
      source: 'DOAJ',
      sourceUrl: r.sourceUrl || 'https://doaj.org/'
    })),
    ...entriesFrom(read('scopus_venues.json'), r => ({
      title: r.title,
      issn: r.issn,
      status: r.active ? 'indexed' : 'inactive',
      source: 'Scopus',
      sourceUrl: r.sourceUrl,
      publisher: r.publisher
    })),
    ...entriesFrom(read('ieee_venues.json'), r => ({
      title: r.title,
      issn: r.issn,
      status: 'indexed',
      source: r.source,
      sourceUrl: r.sourceUrl
    })),
    ...entriesFrom(read('predatory_venues.json'), r => ({
      title: r.title,
      issn: r.issn,
      status: r.signal, // 'flagged' | 'delisted'
      source: r.listing,
      sourceUrl: r.sourceUrl,
      publisher: r.publisher
    }))
  ];

  const shards = new Map();
  const issnIndex = new Map();
  const acronyms = new Map();
  const put = (key, rec) => {
    const s = shardOf(key);
    if (!shards.has(s)) shards.set(s, {});
    const bucket = shards.get(s);
    (bucket[key] ||= []).push(rec);
  };

  for (const e of entries) {
    const rec = {
      t: e.title,
      st: e.status,
      s: e.source,
      u: e.sourceUrl,
      ...(e.publisher ? { p: e.publisher } : {})
    };
    put(e.key, rec);
    for (const alias of aliasesFor(e.key)) put(alias, { ...rec, alias: 'series' });

    const acro = e.key.match(ACRONYM);
    if (acro) {
      const a = acro[1];
      if (!acronyms.has(a)) acronyms.set(a, []);
      // One row per series, not per edition — 8 EDTM years are one conference.
      const series = aliasesFor(e.key)[0] || e.key;
      if (!acronyms.get(a).some(x => x.k === series)) {
        acronyms.get(a).push({ k: series, t: e.title, st: e.status, s: e.source, u: e.sourceUrl });
      }
    }

    for (const i of e.issn) {
      if (!issnIndex.has(i)) issnIndex.set(i, []);
      issnIndex.get(i).push({ t: e.title, st: e.status, s: e.source, u: e.sourceUrl });
    }
  }

  fs.rmSync(INDEX_DIR, { recursive: true, force: true });
  fs.mkdirSync(INDEX_DIR, { recursive: true });
  for (const [s, bucket] of shards) {
    fs.writeFileSync(path.join(INDEX_DIR, `${s}.json`), JSON.stringify(bucket));
  }
  fs.writeFileSync(path.join(INDEX_DIR, 'issn.json'), JSON.stringify(Object.fromEntries(issnIndex)));
  fs.writeFileSync(path.join(INDEX_DIR, 'acronyms.json'), JSON.stringify(Object.fromEntries(acronyms)));

  // Loaded whole by the checker for lookalike-name detection.
  const predatory = read('predatory_venues.json').map(r => ({
    k: normalise(r.title),
    t: r.title,
    st: r.signal,
    s: r.listing,
    u: r.sourceUrl
  }));
  fs.writeFileSync(path.join(INDEX_DIR, 'predatory.json'), JSON.stringify(predatory));

  const manifest = {
    builtAt: new Date().toISOString(),
    shards: shards.size,
    entries: entries.length,
    uniqueTitles: new Set(entries.map(e => e.key)).size,
    issns: issnIndex.size,
    acronyms: acronyms.size,
    sources: entries.reduce((acc, e) => ((acc[e.source] = (acc[e.source] || 0) + 1), acc), {})
  };
  fs.writeFileSync(path.join(INDEX_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  const bytes = fs
    .readdirSync(INDEX_DIR)
    .reduce((n, f) => n + fs.statSync(path.join(INDEX_DIR, f)).size, 0);
  console.log(JSON.stringify(manifest, null, 2));
  console.log(`Index: ${shards.size} shards, ${(bytes / 1e6).toFixed(1)} MB total, ` +
    `~${Math.round(bytes / shards.size / 1024)} KB fetched per lookup.`);
}

build();
