// Polar client and the shared bits every payment endpoint needs.
//
// The API key never leaves the server. Entitlement is decided by asking Polar about the
// order, never by trusting anything the browser sends beyond an opaque id — the same rule
// the venue checker follows, applied to money: the authority is the record, not the claim.

const API = 'https://api.polar.sh/v1';

// Hardcoded rather than read from the request, so a crafted call cannot check out against
// some other product or price. The browser picks a KEY from this map; it never sends an id.
// Anything not in the map falls back to the kit, so an unknown key cannot select a price.
export const PRODUCTS = {
  kit: process.env.POLAR_PRODUCT_ID || 'e97e2976-2bde-49ac-9e75-945769c95923',
  session: process.env.POLAR_SESSION_PRODUCT_ID || 'af6ac36b-7891-4a7f-a1ca-ea838682786e'
};

// Kit entitlement is decided against this one specifically: a session order must not
// unlock the kit, and api/kit.mjs compares the paid order's product against it.
export const PRODUCT_ID = PRODUCTS.kit;

export const ALLOWED_ORIGINS = [
  'https://benchless-app.web.app',
  'https://benchless-app.firebaseapp.com',
  'http://localhost:5000'
];

export function corsHeaders(origin) {
  const h = {
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  if (ALLOWED_ORIGINS.includes(origin)) h['Access-Control-Allow-Origin'] = origin;
  return h;
}

export function json(body, { status = 200, origin, headers = {} } = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...corsHeaders(origin), ...headers }
  });
}

class PolarError extends Error {
  constructor(status, body) {
    super(`Polar ${status}`);
    this.status = status;
    this.body = body;
  }
}

export async function polar(path, init = {}) {
  const key = process.env.POLAR_API_KEY;
  if (!key) throw new Error('POLAR_API_KEY is not configured');

  const r = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });

  const text = await r.text();
  const body = text ? safeParse(text) : null;
  // Truncated: Polar error envelopes can echo request content back.
  if (!r.ok) throw new PolarError(r.status, typeof body === 'object' ? body : String(text).slice(0, 300));
  return body;
}

export { PolarError };

export function safeParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}
