// Real IEEE venue list, from two independent public sources so a match is corroborated
// rather than taken on one provider's word:
//   1. OpenAlex  — every source whose host organisation sits under an IEEE publisher (free API)
//   2. Scopus    — IEEE-published conference proceedings, from the workbook fetch_scopus.js saves
// Run fetch_scopus.js first; without the workbook this emits OpenAlex only and says so.
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const MAILTO = 'hozaifa.kgl@gmail.com'; // OpenAlex polite pool — higher rate limit, no key
const IEEE_PUBLISHERS = ['P4310319808', 'P4322697011'];
const XLSX_PATH = path.join(__dirname, '..', 'public', 'data', 'scopus_source_list.xlsx');
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'data', 'ieee_venues.json');

const PER_PAGE = 200;

async function openAlexSources(publisherId) {
  const out = [];
  let cursor = '*';
  while (cursor) {
    const url =
      `https://api.openalex.org/sources?filter=host_organization_lineage:${publisherId}` +
      `&per-page=${PER_PAGE}&cursor=${encodeURIComponent(cursor)}&mailto=${MAILTO}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenAlex ${res.status} for ${publisherId}`);
    const body = await res.json();
    out.push(...body.results);
    cursor = body.results.length ? body.meta.next_cursor : null;
  }
  return out;
}

function ieeeConferencesFromScopus() {
  if (!fs.existsSync(XLSX_PATH)) return [];
  const book = xlsx.readFile(XLSX_PATH);
  const name = book.SheetNames.find(n => n.startsWith('All Conf. Proceedings'));
  if (!name) return [];
  const rows = xlsx.utils.sheet_to_json(book.Sheets[name]);
  const seen = new Set();
  const out = [];
  for (const r of rows) {
    const title = String(r['Source Title'] || '').trim();
    // Publisher is sparsely filled on this sheet, so fall back to the IEEE-in-title test
    // that the proceedings naming convention makes reliable for this one publisher.
    const isIeee = /\bIEEE\b/i.test(r['Publisher'] || '') || /\bIEEE\b/.test(title);
    if (!title || !isIeee) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      title,
      issn: [],
      isbn: r['ISBN'] ? String(r['ISBN']) : null,
      type: 'conference',
      source: 'Scopus conference proceedings',
      sourceUrl: 'https://www.elsevier.com/products/scopus/content',
      year: r['Year'] || null
    });
  }
  return out;
}

async function main() {
  const fetchedAt = new Date().toISOString();

  const oa = (await Promise.all(IEEE_PUBLISHERS.map(openAlexSources))).flat();
  const openAlexVenues = oa.map(s => ({
    title: s.display_name,
    issn: (s.issn || []).map(i => i.replace('-', '').toUpperCase()),
    type: s.type || null,
    source: 'OpenAlex (IEEE)',
    sourceUrl: s.id,
    worksCount: s.works_count,
    hostOrganization: s.host_organization_name || null
  }));

  const scopusConfs = ieeeConferencesFromScopus();
  if (!scopusConfs.length) {
    console.warn(`No Scopus workbook at ${XLSX_PATH} — run fetch_scopus.js first for conference coverage.`);
  }

  const venues = [...openAlexVenues, ...scopusConfs].map(v => ({ ...v, fetchedAt }));
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(venues));
  console.log(`IEEE: ${openAlexVenues.length} OpenAlex sources + ${scopusConfs.length} Scopus conference titles = ${venues.length}.`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
