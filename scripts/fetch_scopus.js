// Real Scopus source list. Elsevier publishes the master xlsx from its Contentful CDN;
// the filename carries the month, so the landing page is scraped for the current link
// rather than hardcoding one that goes stale every 30 days.
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const CONTENT_PAGE = 'https://www.elsevier.com/products/scopus/content';
const XLSX_PATH = path.join(__dirname, '..', 'public', 'data', 'scopus_source_list.xlsx');
const OUT_SERIAL = path.join(__dirname, '..', 'public', 'data', 'scopus_venues.json');
const OUT_DISCONTINUED = path.join(__dirname, '..', 'public', 'data', 'scopus_discontinued.json');

// Elsevier serves a different, link-free page to unbranded clients.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';

async function resolveSourceListUrl() {
  const res = await fetch(CONTENT_PAGE, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`Elsevier content page ${res.status}`);
  const html = await res.text();
  // Links are emitted protocol-relative (//downloads.ctfassets.net/…).
  const links = [...html.matchAll(/(?:https:)?\/\/downloads\.ctfassets\.net\/[^"'\\ ]+?\.xlsx/g)].map(m =>
    m[0].startsWith('//') ? `https:${m[0]}` : m[0]
  );
  const sourceList = links.find(u => /ext.?list/i.test(decodeURIComponent(u)));
  if (!sourceList) throw new Error(`No ext_list xlsx found on ${CONTENT_PAGE}. Links seen: ${links.join(', ')}`);
  return sourceList;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`Download failed ${res.status} for ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

function sheetRows(book, namePrefix) {
  const name = book.SheetNames.find(n => n.startsWith(namePrefix));
  if (!name) throw new Error(`Sheet "${namePrefix}*" missing. Sheets: ${book.SheetNames.join(' | ')}`);
  return { name, rows: xlsx.utils.sheet_to_json(book.Sheets[name]) };
}

function issnList(...vals) {
  return vals
    .filter(Boolean)
    .map(v => String(v).replace(/[^0-9Xx]/g, '').toUpperCase())
    .filter(v => v.length === 8);
}

async function main() {
  const url = await resolveSourceListUrl();
  console.log(`Scopus source list: ${decodeURIComponent(url.split('/').pop())}`);
  await download(url, XLSX_PATH);

  const book = xlsx.readFile(XLSX_PATH);
  const fetchedAt = new Date().toISOString();

  const active = sheetRows(book, 'Scopus Sources');
  const venues = active.rows
    .filter(r => r['Source Title'])
    .map(r => ({
      title: String(r['Source Title']).trim(),
      issn: issnList(r['ISSN'], r['EISSN']),
      publisher: r['Publisher'] ? String(r['Publisher']).trim() : null,
      sourceType: r['Source Type'] || null,
      active: String(r['Active or Inactive'] || '').toLowerCase().startsWith('active'),
      scopusSourceId: r['Sourcerecord ID'] ? String(r['Sourcerecord ID']) : null,
      source: 'Scopus',
      // Per-title Scopus page. Deterministic from the record id, so the evidence link
      // a student is shown always resolves to the row it was matched against.
      sourceUrl: r['Sourcerecord ID']
        ? `https://www.scopus.com/sourceid/${r['Sourcerecord ID']}`
        : 'https://www.elsevier.com/products/scopus/content',
      fetchedAt
    }));

  // Delisted titles. Scopus removes sources for quality/publication-concern reasons,
  // so "was indexed, no longer is" is a warning a student must see, not a pass.
  const gone = sheetRows(book, 'Discontinued Titles');
  const goneRows = xlsx.utils.sheet_to_json(book.Sheets[gone.name], { header: 1 });
  const header = goneRows.findIndex(r => String(r[1] || '').startsWith('Source Title'));
  if (header === -1) throw new Error('Discontinued sheet: header row not found');
  const discontinued = goneRows
    .slice(header + 1)
    .filter(r => r[1])
    .map(r => ({
      scopusSourceId: r[0] ? String(r[0]) : null,
      title: String(r[1]).trim(),
      issn: issnList(r[2], r[3]),
      publisher: r[4] ? String(r[4]).trim() : null,
      reason: r[5] ? String(r[5]).trim() : 'Discontinued',
      finalCoverageYear: r[6] || null,
      source: 'Scopus (discontinued)',
      sourceUrl: 'https://www.elsevier.com/products/scopus/content',
      fetchedAt
    }));

  fs.writeFileSync(OUT_SERIAL, JSON.stringify(venues));
  fs.writeFileSync(OUT_DISCONTINUED, JSON.stringify(discontinued));
  console.log(`Scopus: ${venues.length} indexed sources, ${discontinued.length} discontinued.`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
