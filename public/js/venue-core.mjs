// Shared venue-checking logic. Imported by BOTH the Node CLI (scripts/check_venue.mjs)
// and the browser app, so a verdict shown to a student is produced by the same code the
// self-check runs against. Duplicating this would let the two drift, and a drift here is
// the exact failure the product exists to prevent.
//
// Pure functions only. No fetch, no fs. Loaders live alongside.

export const VERDICTS = {
  INDEXED: 'INDEXED',   // present in at least one recognised index
  FLAGGED: 'FLAGGED',   // named on a public predatory list
  DELISTED: 'DELISTED', // was Scopus-indexed and was removed
  UNKNOWN: 'UNKNOWN'    // not covered — refuse, never infer
};

export const normalise = s =>
  String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

// SHA-1 of the key, first byte as hex — must match scripts/build_venue_index.js exactly.
// Implemented without crypto so the same function runs in Node and the browser.
export function shardOf(key) {
  const h = sha1(key);
  return h.slice(0, 2);
}

export const issnDigits = q => String(q).replace(/[^0-9Xx]/g, '').toUpperCase();

// Precedence is deliberate: a predatory listing outranks an indexing record. A venue can be
// both indexed somewhere and listed as predatory, and the student must be told the bad news.
export function verdictFor(statuses) {
  if (statuses.has('flagged')) return VERDICTS.FLAGGED;
  if (statuses.has('delisted')) return VERDICTS.DELISTED;
  if (statuses.has('indexed')) return VERDICTS.INDEXED;
  return VERDICTS.UNKNOWN;
}

export function toEvidence(hits, { viaAcronym = false } = {}) {
  return hits.map(h => ({
    title: h.t,
    status: h.st,
    source: h.s,
    sourceUrl: h.u,
    ...(h.p ? { publisher: h.p } : {}),
    ...(h.alias ? { matchedVia: h.alias } : {}),
    ...(viaAcronym ? { matchedVia: 'acronym' } : {})
  }));
}

export const REFUSAL =
  'Not found in DOAJ, Scopus, IEEE/OpenAlex or the predatory lists. Benchless will not guess.';

// Minimal SHA-1. The index is keyed by it, and pulling in a dependency to hash one short
// string in two runtimes costs more than the twenty lines.
function sha1(str) {
  const bytes = new TextEncoder().encode(str);
  const ml = bytes.length * 8;
  const withPad = new Uint8Array((((bytes.length + 8) >> 6) + 1) * 64);
  withPad.set(bytes);
  withPad[bytes.length] = 0x80;
  const dv = new DataView(withPad.buffer);
  dv.setUint32(withPad.length - 4, ml >>> 0, false);
  dv.setUint32(withPad.length - 8, Math.floor(ml / 0x100000000), false);

  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;
  const w = new Uint32Array(80);

  for (let i = 0; i < withPad.length; i += 64) {
    for (let j = 0; j < 16; j++) w[j] = dv.getUint32(i + j * 4, false);
    for (let j = 16; j < 80; j++) w[j] = rotl(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);

    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let j = 0; j < 80; j++) {
      let f, k;
      if (j < 20) { f = (b & c) | (~b & d); k = 0x5a827999; }
      else if (j < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
      else if (j < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
      else { f = b ^ c ^ d; k = 0xca62c1d6; }
      const t = (rotl(a, 5) + f + e + k + w[j]) >>> 0;
      e = d; d = c; c = rotl(b, 30); b = a; a = t;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0;
  }
  return [h0, h1, h2, h3, h4].map(x => x.toString(16).padStart(8, '0')).join('');
}

const rotl = (n, b) => ((n << b) | (n >>> (32 - b))) >>> 0;
