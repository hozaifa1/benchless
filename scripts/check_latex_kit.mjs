// Compiles the kit's LaTeX template and fails if it does not build clean.
//
// This exists because structural checks were not enough. Balanced braces and balanced
// environments all passed while the abstract still rendered "We find ¡the number¿" — LaTeX
// typesets a bare < as an inverted exclamation mark in text mode. Nothing short of running
// pdflatex and looking at the output would have caught it, and it would have shipped inside
// a paid product.
//
//   node scripts/check_latex_kit.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// api/_kit/latex.mjs is paid material and is not in the public repo — see api/_kit/README.md.
// Say so plainly rather than dying on a module-resolution error.
let latexKit;
try {
  ({ latexKit } = await import('../api/_kit/latex.mjs'));
} catch (e) {
  if (e?.code !== 'ERR_MODULE_NOT_FOUND') throw e;
  console.log('SKIP — api/_kit/latex.mjs is not present.');
  console.log('       The LaTeX kit is paid material and is kept out of the public repo.');
  console.log('       See api/_kit/README.md.');
  process.exit(0);
}

const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'benchless-tex-'));
let failures = 0;
const fail = m => { console.error(`FAIL ${m}`); failures++; };
const ok = m => console.log(`ok   ${m}`);

for (const f of latexKit.files) fs.writeFileSync(path.join(WORK, f.name), f.content);

const tex = fs.readFileSync(path.join(WORK, 'main.tex'), 'utf8');

// Characters that are legal in a source file and wrong in the output. Only lines that
// actually typeset are checked; comments never reach the page.
const rendering = tex.split('\n').filter(l => !l.trimStart().startsWith('%'));
const angled = rendering.filter(l => /<[^>]*>/.test(l));
if (angled.length) fail(`angle-bracket placeholders typeset as inverted punctuation:\n     ${angled.join('\n     ')}`);
else ok('no angle-bracket placeholders on typesetting lines');

const pdflatex = findBinary('pdflatex');
const bibtex = findBinary('bibtex');

if (!pdflatex) {
  console.log('\nSKIP compile — no pdflatex on PATH.');
  console.log('     Install one: winget install MiKTeX.MiKTeX   (or apt/brew install texlive)');
  console.log('     The template is NOT verified without it.');
  process.exit(failures ? 1 : 0);
}

const run = (bin, args) => execFileSync(bin, args, { cwd: WORK, stdio: 'pipe', encoding: 'utf8' });

try {
  run(pdflatex, ['-interaction=nonstopmode', '-halt-on-error', 'main.tex']);
  if (bibtex) run(bibtex, ['main']);
  run(pdflatex, ['-interaction=nonstopmode', 'main.tex']);
  run(pdflatex, ['-interaction=nonstopmode', 'main.tex']);
} catch (e) {
  // pdflatex writes its real diagnosis to the log, not to stderr.
  const log = readIfPresent(path.join(WORK, 'main.log'));
  const errs = log.split('\n').filter(l => l.startsWith('!')).slice(0, 10);
  fail(`compile failed:\n     ${errs.join('\n     ') || String(e.message).slice(0, 300)}`);
}

const pdf = path.join(WORK, 'main.pdf');
if (!fs.existsSync(pdf)) fail('no main.pdf produced');
else ok(`main.pdf produced (${fs.statSync(pdf).size} bytes)`);

const log = readIfPresent(path.join(WORK, 'main.log'));
const hard = log.split('\n').filter(l => l.startsWith('!'));
if (hard.length) fail(`${hard.length} LaTeX error(s): ${hard.slice(0, 3).join(' | ')}`);
else ok('zero LaTeX errors');

if (/Undefined control sequence/i.test(log)) fail('undefined control sequence in the log');
else ok('no undefined control sequences');

// Unresolved \ref or \cite means the skeleton ships with broken cross-references.
if (/There were undefined references/i.test(log)) fail('undefined references after the bibtex pass');
else ok('all references and citations resolve');

console.log(`\nbuild dir: ${WORK}`);
console.log(failures ? `\n${failures} check(s) failed.` : '\nLaTeX kit compiles clean.');
process.exit(failures ? 1 : 0);

function readIfPresent(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

// MiKTeX's user-scope install does not put itself on PATH on Windows.
function findBinary(name) {
  const exe = process.platform === 'win32' ? `${name}.exe` : name;
  const candidates = [
    ...(process.env.PATH || '').split(path.delimiter).map(d => path.join(d, exe)),
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'MiKTeX', 'miktex', 'bin', 'x64', exe),
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'MiKTeX', 'miktex', 'bin', exe)
  ];
  return candidates.find(p => { try { return fs.existsSync(p); } catch { return false; } }) || null;
}
