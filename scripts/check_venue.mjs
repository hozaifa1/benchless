// Deterministic venue check, CLI side. Shares its logic with the browser app via
// venue-core.mjs, so the self-check below covers the code students actually hit.
// No model is consulted here and none ever should be.
//
//   node scripts/check_venue.mjs "IEEE Transactions on Electron Devices"
//   node scripts/check_venue.mjs --selfcheck
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  VERDICTS, normalise, shardOf, issnDigits, verdictFor, toEvidence, REFUSAL
} from '../public/js/venue-core.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const INDEX_DIR = path.join(HERE, '..', 'public', 'data', 'index');
const load = f => JSON.parse(fs.readFileSync(path.join(INDEX_DIR, f), 'utf8'));

export function checkVenue(input) {
  const query = String(input || '').trim();
  const key = normalise(query);
  if (key.length < 4) {
    return { verdict: VERDICTS.UNKNOWN, query, reason: 'Query too short to match safely.', evidence: [] };
  }

  const bucket = load(`${shardOf(key)}.json`);
  let hits = bucket[key] || [];

  const issn = issnDigits(query);
  if (!hits.length && issn.length === 8) hits = load('issn.json')[issn] || [];

  let viaAcronym = false;
  if (!hits.length && /^[a-z]{3,10}$/.test(key)) {
    const series = load('acronyms.json')[key] || [];
    if (series.length === 1) {
      hits = [series[0]];
      viaAcronym = true;
    } else if (series.length > 1) {
      return {
        verdict: VERDICTS.UNKNOWN,
        query,
        reason: `"${query}" matches ${series.length} different conference series. Give the full name.`,
        evidence: []
      };
    }
  }

  if (!hits.length) {
    const near = load('predatory.json').filter(p => p.k.includes(key) || key.includes(p.k));
    return {
      verdict: VERDICTS.UNKNOWN,
      query,
      reason: REFUSAL,
      lookalikes: near.slice(0, 5).map(p => ({ title: p.t, listing: p.s, sourceUrl: p.u })),
      evidence: []
    };
  }

  const evidence = toEvidence(hits, { viaAcronym });
  return { verdict: verdictFor(new Set(evidence.map(e => e.status))), query, evidence };
}

function selfcheck() {
  // Five hand-verified fixtures: three legitimate, two on Beall's list.
  const legit = [
    'IEEE Transactions on Electron Devices',
    'IEEE Transactions on Computer-Aided Design of Integrated Circuits and Systems',
    'IEEE Electron Devices Technology and Manufacturing Conference'
  ];
  const predatory = ['International Journal of Advanced Research', 'Academic Exchange Quarterly'];

  for (const v of legit) {
    const r = checkVenue(v);
    assert.strictEqual(r.verdict, VERDICTS.INDEXED, `${v} -> ${r.verdict}`);
    assert.ok(r.evidence.length && r.evidence.every(e => e.sourceUrl), `${v}: evidence missing a source URL`);
    console.log(`ok  INDEXED  ${v}  (${r.evidence.length} sources)`);
  }
  for (const v of predatory) {
    const r = checkVenue(v);
    assert.strictEqual(r.verdict, VERDICTS.FLAGGED, `${v} -> ${r.verdict}`);
    console.log(`ok  FLAGGED  ${v}  (${r.evidence[0].source})`);
  }

  const unknown = checkVenue('Journal of Nonexistent Studies in Nothing');
  assert.strictEqual(unknown.verdict, VERDICTS.UNKNOWN);
  assert.strictEqual(unknown.evidence.length, 0);
  console.log('ok  UNKNOWN  refusal path returns no evidence and no guess');

  const byIssn = checkVenue('0018-9383');
  assert.strictEqual(byIssn.verdict, VERDICTS.INDEXED, `ISSN 0018-9383 -> ${byIssn.verdict}`);
  console.log('ok  INDEXED  0018-9383 resolves by ISSN');

  // The browser ships the same core. If its shard maths ever diverges from the index
  // builder, every lookup silently misses and every venue becomes UNKNOWN.
  const key = normalise('IEEE Transactions on Electron Devices');
  assert.ok(fs.existsSync(path.join(INDEX_DIR, `${shardOf(key)}.json`)), 'shardOf points at a missing shard');
  console.log('ok  shared core resolves to a shard that exists on disk');

  console.log('\nAll venue-checker self-checks passed.');
}

// Only act as a CLI when run directly. build_kit_shortlist.mjs imports checkVenue from
// here, and a bare import must not print usage or exit.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = process.argv[2];
  if (arg === '--selfcheck') selfcheck();
  else if (!arg) console.error('usage: node scripts/check_venue.mjs "<venue name or ISSN>" | --selfcheck');
  else console.log(JSON.stringify(checkVenue(arg), null, 2));
}
