// Browser loader for the venue index. Fetches exactly one ~120 KB shard per lookup from
// Firebase Hosting. No Firestore reads, no server, no model.
import {
  VERDICTS, normalise, shardOf, issnDigits, verdictFor, toEvidence, REFUSAL
} from './venue-core.mjs';

const BASE = '/data/index';
const cache = new Map();

async function loadJson(name) {
  if (cache.has(name)) return cache.get(name);
  // One retry: a dropped connection here fails the venue check, which is the answer a
  // student most needs. Observed ERR_CONNECTION_CLOSED once against Hosting in testing.
  const p = fetchOnce(name).catch(() => fetchOnce(name));
  // Don't cache a rejection, or the retry is wasted for the rest of the session.
  p.catch(() => cache.delete(name));
  cache.set(name, p);
  return p;
}

async function fetchOnce(name) {
  const r = await fetch(`${BASE}/${name}`);
  if (!r.ok) throw new Error(`Venue index unavailable (${name}: ${r.status})`);
  return r.json();
}

export async function checkVenue(input) {
  const query = String(input || '').trim();
  const key = normalise(query);
  if (key.length < 4) {
    return { verdict: VERDICTS.UNKNOWN, query, reason: 'Query too short to match safely.', evidence: [] };
  }

  const bucket = await loadJson(`${shardOf(key)}.json`);
  let hits = bucket[key] || [];

  const issn = issnDigits(query);
  if (!hits.length && issn.length === 8) {
    hits = (await loadJson('issn.json'))[issn] || [];
  }

  // An acronym is accepted only when it resolves to exactly one conference series.
  // Ambiguity is a refusal, not a coin flip.
  let viaAcronym = false;
  if (!hits.length && /^[a-z]{3,10}$/.test(key)) {
    const series = (await loadJson('acronyms.json'))[key] || [];
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
    // A near-miss against the predatory list is the lookalike-name attack. Report it as a
    // warning attached to a refusal, never as a verdict about the venue actually typed.
    const near = (await loadJson('predatory.json')).filter(p => p.k.includes(key) || key.includes(p.k));
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

export { VERDICTS };
