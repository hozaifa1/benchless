// Known-predatory signal, from public lists only. Two kinds, kept apart because they
// carry different weight and the student is shown which one fired:
//   flagged    — named on Beall's list (standalone journals, and publishers)
//   delisted   — was Scopus-indexed and was removed (from fetch_scopus.js)
// Neither is proof on its own. The checker reports the listing and its URL; it does not
// upgrade a listing into a verdict of fraud.
const fs = require('fs');
const path = require('path');

const PAGES = [
  { url: 'https://beallslist.net/standalone-journals/', kind: 'journal' },
  { url: 'https://beallslist.net/', kind: 'publisher' }
];
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'data', 'predatory_venues.json');

// Beall's list renders each entry as a single <li><a href=…>Name</a>. Anything outside
// that shape (nav, footer) is not an entry and is dropped rather than guessed at.
const ENTRY = /<li>\s*<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&#039;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

async function scrape({ url, kind }) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Beall's list ${res.status} for ${url}`);
  const html = await res.text();
  const out = [];
  for (const [, href, name] of html.matchAll(ENTRY)) {
    const title = decode(name);
    if (!title || title.length < 3) continue;
    out.push({ title, kind, homepage: href, listing: 'Beall\'s List', sourceUrl: url });
  }
  if (!out.length) throw new Error(`Parsed 0 entries from ${url} — page structure changed, not an empty list`);
  return out;
}

async function main() {
  const fetchedAt = new Date().toISOString();
  const scraped = (await Promise.all(PAGES.map(scrape))).flat();

  const seen = new Set();
  const flagged = [];
  for (const e of scraped) {
    const key = `${e.kind}:${e.title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    flagged.push({ ...e, signal: 'flagged', fetchedAt });
  }

  const discontinuedPath = path.join(__dirname, '..', 'public', 'data', 'scopus_discontinued.json');
  let delisted = [];
  if (fs.existsSync(discontinuedPath)) {
    delisted = JSON.parse(fs.readFileSync(discontinuedPath, 'utf8')).map(d => ({
      title: d.title,
      kind: 'journal',
      issn: d.issn,
      publisher: d.publisher,
      listing: `Scopus discontinued — ${d.reason}`,
      sourceUrl: d.sourceUrl,
      signal: 'delisted',
      fetchedAt
    }));
  } else {
    console.warn('No scopus_discontinued.json — run fetch_scopus.js first for delisting coverage.');
  }

  const all = [...flagged, ...delisted];
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(all));
  console.log(`Predatory signals: ${flagged.length} Beall's-listed, ${delisted.length} Scopus-delisted = ${all.length}.`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
