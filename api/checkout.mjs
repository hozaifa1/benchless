// Creates a Polar checkout session and hands back the hosted checkout URL.
//
// Server-side because the API key must stay off the client, and because the product and
// price are fixed here rather than passed in — the browser chooses whether to buy, not
// what it pays.

// Edge runtime so the handler receives a real Request, matching the webhook and the kit
// endpoint. Nothing here needs a Node built-in.
export const config = { runtime: 'edge' };

import { polar, PRODUCTS, json, corsHeaders, safeParse, PolarError } from './_polar.mjs';

// Where each product lands after payment. The kit unlocks a page; the session cannot,
// because what was bought is an hour of my time and the next step is an email from me.
const SUCCESS_URL = {
  kit: 'https://benchless-app.web.app/kit.html?checkout_id={CHECKOUT_ID}',
  session: 'https://benchless-app.web.app/booked.html?checkout_id={CHECKOUT_ID}'
};

export default async function handler(request) {
  const origin = request.headers.get('origin');

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (request.method !== 'POST') return json({ error: 'POST only' }, { status: 405, origin });

  const body = safeParse(await request.text()) || {};

  // Optional: prefills the checkout form. Validated loosely — Polar rejects a bad address
  // and there is no reason to be stricter here than the payment processor is.
  const email = typeof body.email === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email.trim())
    ? body.email.trim().slice(0, 254)
    : undefined;

  // Carried through to the order and into the webhook, so channel-of-origin per customer
  // is recorded at the point of sale rather than reconstructed later.
  // Empty values are omitted, not sent blank: Polar rejects zero-length metadata strings
  // and would fail the whole checkout over a missing referrer.
  const metadata = {};
  const source = String(body.source || 'site').trim().slice(0, 60);
  const referrer = String(body.referrer || '').trim().slice(0, 200);
  if (source) metadata.source = source;
  if (referrer) metadata.referrer = referrer;

  // Allowlisted key, never an id. An unrecognised value buys the kit rather than erroring,
  // which is the safe direction: the cheaper product, at a price fixed on the server.
  const productKey = Object.hasOwn(PRODUCTS, body.product) ? body.product : 'kit';
  metadata.product = productKey;

  try {
    const checkout = await polar('/checkouts/', {
      method: 'POST',
      body: JSON.stringify({
        products: [PRODUCTS[productKey]],
        success_url: SUCCESS_URL[productKey],
        ...(email ? { customer_email: email } : {}),
        metadata
      })
    });

    if (!checkout?.url) {
      console.error('checkout: no url in Polar response', JSON.stringify(checkout).slice(0, 300));
      return json({ error: 'Checkout could not be created. Try again in a moment.' }, { status: 502, origin });
    }

    return json({ url: checkout.url, checkoutId: checkout.id }, { origin });
  } catch (e) {
    if (e instanceof PolarError) {
      console.error('checkout: polar rejected', e.status, JSON.stringify(e.body).slice(0, 400));
      return json({ error: 'Checkout could not be created. Try again in a moment.' }, { status: 502, origin });
    }
    console.error('checkout: handler', e);
    return json({ error: 'Checkout is not configured on the server.' }, { status: 500, origin });
  }
}
