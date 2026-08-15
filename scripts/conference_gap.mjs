// Measures how much the venue checker can actually tell you about a CONFERENCE.
//
// Journals have ISSNs and DOAJ. Conferences have neither, and the public indexes
// list them under library-catalogue strings ("Technical Digest - International
// Electron Devices Meeting") rather than the names humans type. The question this
// answers: does a verdict on a conference name carry any information at all?
//
//   node scripts/conference_gap.mjs
//
// ponytail: two hand-built lists, not a sampling frame. Enough to establish the
// gap exists and size it; a real study would sample CFP spam over a fixed window.
import { checkVenue } from './check_venue.mjs';

// Flagship, unambiguously legitimate series across the fields Benchless targets.
const REAL = [
  'IEEE International Electron Devices Meeting',
  'IEDM',
  'IEEE Symposium on VLSI Technology and Circuits',
  'IEEE International Reliability Physics Symposium',
  'IEEE Electron Devices Technology and Manufacturing Conference',
  'International Conference on Simulation of Semiconductor Processes and Devices',
  'IEEE International Solid-State Circuits Conference',
  'Design Automation Conference',
  'IEEE International Conference on Computer-Aided Design',
  'Design Automation and Test in Europe',
  'IEEE Custom Integrated Circuits Conference',
  'IEEE Photonics Conference',
  'Conference on Lasers and Electro-Optics',
  'IEEE International Conference on Communications',
  'IEEE Global Communications Conference',
  'Conference on Neural Information Processing Systems',
  'International Conference on Machine Learning',
  'IEEE Conference on Computer Vision and Pattern Recognition',
  'IEEE International Symposium on Circuits and Systems',
  'IEEE Sensors Conference',
];

// Names in the house style of the CFP spam that reaches unsupervised students:
// maximally broad scope, "International Conference on <two whole disciplines>".
const SPAM_SHAPED = [
  'International Conference on Recent Innovations in Engineering and Technology',
  'World Academy of Science Engineering and Technology',
  'International Conference on Advances in Engineering and Technology',
  'International Conference on Innovative Research in Science Technology and Management',
  'International Conference on Studies in Engineering Science and Technology',
  'International Conference on Emerging Trends in Engineering and Technology',
  'World Congress on Engineering and Computer Science',
  'International Conference on Chemical and Biological Engineering',
  'International Conference on Nanoscience and Nanotechnology',
  'Global Summit on Materials Science and Engineering',
];

const run = names => names.map(name => ({ name, verdict: checkVenue(name).verdict }));

function report(label, rows) {
  console.log(`\n${label}`);
  for (const { name, verdict } of rows) console.log(`  ${verdict.padEnd(9)} ${name}`);
  const unknown = rows.filter(r => r.verdict === 'UNKNOWN').length;
  const pct = (100 * unknown / rows.length).toFixed(0);
  console.log(`  -> ${unknown}/${rows.length} (${pct}%) returned no usable verdict`);
  return unknown / rows.length;
}

const real = run(REAL);
const spam = run(SPAM_SHAPED);

const realBlind = report('LEGITIMATE FLAGSHIP CONFERENCE SERIES', real);
const spamBlind = report('SPAM-SHAPED CONFERENCE NAMES', spam);

console.log(`
FINDING
  A conference name returns UNKNOWN ${(100 * realBlind).toFixed(0)}% of the time when it is real
  and ${(100 * spamBlind).toFixed(0)}% of the time when it is not. The verdict does not separate
  the two cases, so for conferences it carries close to zero information.

  This is not a bug in the matcher. The public sources it queries -- DOAJ, the
  Scopus source list, IEEE/OpenAlex titles -- have good coverage of journals and
  no machine-readable registry of legitimate conference SERIES. Conferences are
  where predatory publishing actually reaches unsupervised students, and they are
  the case the free public data does not cover.
`);

// Self-check: the whole point is that the two distributions are not separable.
// If a future index fixes conferences, realBlind drops and this assertion fires,
// which is the signal to rewrite this file rather than a regression.
import assert from 'node:assert';
assert.ok(realBlind > 0.5, 'real-conference blindness dropped below 50% -- re-measure and update the application');
assert.ok(Math.abs(realBlind - spamBlind) < 0.35, 'verdicts now separate real from spam -- the gap claim needs revising');
console.log('self-check passed: gap still present.\n');
