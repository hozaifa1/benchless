// Polar webhook receiver.
//
// DESIGN NOTE, because it is not the obvious arrangement and the reason matters:
// access to the kit is NOT granted by this webhook. api/kit.mjs asks Polar directly whether
// the order is paid, every time the page loads. That is deliberate — a webhook that is
// delayed, retried or dropped would otherwise leave a paying student locked out of the
// thing they just bought, and the failure would be invisible to them and to me.
//
// So this endpoint does the two jobs a webhook is actually good at: it is the audit record
// that a sale happened, and it is where fulfilment side-effects hang once there are any.
// Polar remains the system of record for revenue. Nothing here is trusted without a valid
// signature, and an unsigned or mis-signed request is refused rather than logged as real.

// Edge runtime, deliberately: Vercel's Node runtime hands the handler (req, res) with the
// body already parsed, and JSON.stringify of a parsed object is not byte-identical to what
// was signed. Edge gives a real Request, so request.text() is exactly the bytes Polar sent.
export const config = { runtime: 'edge' };

import { safeParse } from './_polar.mjs';

const TOLERANCE_SECONDS = 5 * 60;

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), {
      status: 405, headers: { 'Content-Type': 'application/json' }
    });
  }

  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    console.error('polar-webhook: POLAR_WEBHOOK_SECRET is not configured; refusing');
    return new Response(JSON.stringify({ error: 'not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Raw bytes, before any parsing. The signature is over the exact body Polar sent, and
  // JSON.stringify of a parsed object is not byte-identical to it.
  const raw = await request.text();

  const id = request.headers.get('webhook-id');
  const timestamp = request.headers.get('webhook-timestamp');
  const signature = request.headers.get('webhook-signature');

  const verdict = await verify({ raw, id, timestamp, signature, secret });
  if (!verdict.ok) {
    console.warn('polar-webhook: rejected —', verdict.reason);
    return new Response(JSON.stringify({ error: 'invalid signature' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  const event = safeParse(raw);
  if (!event?.type) {
    console.warn('polar-webhook: signed but unparseable body');
    return new Response(JSON.stringify({ error: 'bad payload' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // The delivery id lives in the header, not the payload — Polar's body carries only
    // type/timestamp/data. It is the idempotency key for retries, so it belongs in the log.
    handleEvent(event, id);
  } catch (e) {
    // Never 500 on a successfully verified event: Polar would retry it, and a bug in our
    // logging is not a reason to reprocess a payment event.
    console.error('polar-webhook: handler threw on', event.type, e);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' }
  });
}

function handleEvent(event, deliveryId) {
  const d = event.data || {};

  switch (event.type) {
    case 'order.paid': {
      // One structured line per sale. This is the record I read to know a stranger bought
      // it, and the one that reconciles against the Polar dashboard.
      console.log('SALE ' + JSON.stringify({
        event: 'order.paid',
        deliveryId: deliveryId || null,
        eventAt: event.timestamp ?? null,
        orderId: d.id,
        checkoutId: d.checkout_id ?? null,
        productId: d.product_id ?? d.product?.id ?? null,
        amount: d.net_amount ?? d.total_amount ?? d.amount ?? null,
        currency: d.currency ?? null,
        customerEmail: d.customer?.email ?? d.user?.email ?? null,
        country: d.customer?.billing_address?.country ?? null,
        // Channel of origin, set at checkout creation. Related-party sales get disclosed
        // separately, and this is what makes that possible after the fact.
        source: d.metadata?.source ?? null,
        referrer: d.metadata?.referrer ?? null,
        createdAt: d.created_at ?? null
      }));
      break;
    }

    case 'order.refunded':
    case 'refund.created': {
      console.log('REFUND ' + JSON.stringify({
        event: event.type,
        orderId: d.order_id ?? d.id,
        amount: d.amount ?? null,
        currency: d.currency ?? null
      }));
      break;
    }

    default:
      console.log(`polar-webhook: ${event.type} (no handler, acknowledged)`);
  }
}

// Standard Webhooks verification, as Polar implements it.
//   signed content = `${id}.${timestamp}.${body}`
//   header         = space-separated list of `v1,<base64 hmac-sha256>`
// Polar's own SDK base64-encodes the raw secret before handing it to the standardwebhooks
// library, which then base64-decodes it — so the HMAC key is the secret's raw bytes. A
// secret that was configured as base64 (the `whsec_` convention) is also accepted, because
// both are a real HMAC against the shared secret and getting this wrong silently rejects
// every live event.
async function verify({ raw, id, timestamp, signature, secret }) {
  if (!id || !timestamp || !signature) return { ok: false, reason: 'missing webhook-id/timestamp/signature header' };

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return { ok: false, reason: 'non-numeric timestamp' };
  const skew = Math.abs(Math.floor(Date.now() / 1000) - ts);
  if (skew > TOLERANCE_SECONDS) return { ok: false, reason: `timestamp outside tolerance (${skew}s)` };

  const signed = `${id}.${timestamp}.${raw}`;

  const enc = new TextEncoder();
  const bare = secret.startsWith('whsec_') ? secret.slice(6) : secret;

  // Key derivation, in the order Polar actually uses it. This was worth getting wrong once
  // to write down: Polar hands the standardwebhooks library base64(secret) using the WHOLE
  // stored secret string, prefix included. The library only strips a `whsec_` prefix before
  // base64-decoding, and a base64 blob never starts with `whsec_` — so the prefix survives
  // into the HMAC key. Stripping it first, which is the obvious reading, silently fails
  // every real delivery while passing any test you sign yourself.
  const keys = [
    enc.encode(secret),   // full stored secret, prefix included — what Polar signs with
    enc.encode(bare)      // prefix stripped, for a secret configured without one
  ];
  const decoded = tryBase64(bare);
  if (decoded) keys.push(decoded); // secret configured as raw base64

  const expected = [];
  for (const k of keys) expected.push(await hmacBase64(k, signed));

  // Header carries one or more versioned signatures; any match is a pass.
  const provided = signature.split(' ')
    .map(part => part.split(','))
    .filter(([v]) => v === 'v1')
    .map(([, sig]) => sig)
    .filter(Boolean);

  if (!provided.length) return { ok: false, reason: 'no v1 signature in header' };

  for (const p of provided) {
    for (const e of expected) {
      if (constantTimeEqual(p, e)) return { ok: true };
    }
  }
  return { ok: false, reason: 'signature mismatch' };
}

async function hmacBase64(keyBytes, message) {
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  let bin = '';
  for (const b of new Uint8Array(sig)) bin += String.fromCharCode(b);
  return btoa(bin);
}

function tryBase64(s) {
  if (!/^[A-Za-z0-9+/=_-]+$/.test(s)) return null;
  try {
    const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
    if (!bin.length) return null;
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch { return null; }
}

// Length is not secret here (it is a fixed-width base64 SHA-256), so an early length
// return is fine; the byte comparison itself does not short-circuit.
function constantTimeEqual(a, b) {
  const x = String(a), y = String(b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}
