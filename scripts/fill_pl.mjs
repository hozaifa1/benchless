// Fills the official Build with Gemini XPRIZE P&L template.
//
// Why this patches the XML instead of rewriting the workbook: the template carries the
// organiser's formatting, its shared formulas and the CONFIDENTIAL footer, and a rewrite
// through a spreadsheet library drops all of that. Every cell here is set to an explicit
// zero rather than left blank, because a blank cell reads as "not filled in" and a zero
// reads as "checked, and it was nothing" — which is the actual claim being made.
//
// Cash basis, as the template's legend requires: cash received, cash paid out.
//
//   node scripts/fill_pl.mjs
//
// Reads  submission/official-PL-template-unmodified.xlsx   (downloaded from the Resources page, unmodified)
// Writes submission/Benchless-PL-Statement.xlsx

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const MONTHS = ['C', 'D', 'E', 'F']; // May, June, July, August

// Every line the entrant fills in. Benchless was started on 11 August 2026, inside the
// August column; the three earlier months predate the business entirely.
const LINES = {
  9: 'Independent Sales',
  10: 'Related Party Revenue',
  15: 'COGS · Personnel',
  16: 'COGS · Software Subscriptions',
  17: 'COGS · Tokens',
  19: 'SG&A · Personnel',
  20: 'SG&A · Software Subscriptions',
  21: 'SG&A · Tokens',
  23: 'Other expenses'
};

const VALUE = 0;

const src = 'submission/official-PL-template-unmodified.xlsx';
const out = 'submission/Benchless-PL-Statement.xlsx';
const work = join(tmpdir(), `pl-fill-${Date.now()}`);

mkdirSync(work, { recursive: true });
execFileSync('unzip', ['-o', '-q', src, '-d', work]);

const sheetPath = join(work, 'xl/worksheets/sheet1.xml');
let xml = readFileSync(sheetPath, 'utf8');
let filled = 0;

for (const row of Object.keys(LINES)) {
  for (const col of MONTHS) {
    const ref = `${col}${row}`;
    // The template leaves these as self-closing styled cells: <c r="C9" s="20"/>
    const empty = new RegExp(`<c r="${ref}"([^>]*?)/>`);
    if (!empty.test(xml)) throw new Error(`${ref} is not an empty styled cell — template changed, check it by hand`);
    xml = xml.replace(empty, `<c r="${ref}"$1><v>${VALUE}</v></c>`);
    filled++;
  }
}

writeFileSync(sheetPath, xml);
execFileSync('zip', ['-r', '-q', '-X', join(process.cwd(), out), '.'], { cwd: work });

console.log(`filled ${filled} cells across ${Object.keys(LINES).length} lines -> ${out}`);
for (const [row, label] of Object.entries(LINES)) console.log(`  ${label.padEnd(32)} 0 / 0 / 0 / 0`);
console.log('\nTotal revenue $0 · total expenses $0 · profit (loss) $0.');
console.log('Marketing and customer acquisition spend: $0. The template has no line for it;');
console.log('it is disclosed on the Devpost form and in submission/EVIDENCE.md.');
