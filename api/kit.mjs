// Serves the paid kit, gated on Polar confirming the order is actually paid.
//
// Entitlement is checked live against Polar on every request rather than read from a
// local grant table. It costs one API call and it means there is no state to get out of
// sync with the thing that actually took the money.
//
//   GET /api/kit?checkout_id=<uuid>   after checkout, via the success URL
//   GET /api/kit?order_id=<uuid>      recovery path, from the Polar receipt email

export const config = { runtime: 'edge' };

import { polar, PRODUCT_ID, json, corsHeaders, PolarError } from './_polar.mjs';
import { buildKit } from './_kit/index.mjs';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(request) {
  const origin = request.headers.get('origin');

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (request.method !== 'GET') return json({ error: 'GET only' }, { status: 405, origin });

  const url = new URL(request.url);
  const checkoutId = url.searchParams.get('checkout_id');
  const orderId = url.searchParams.get('order_id');

  if (!checkoutId && !orderId) {
    return json({ error: 'Missing checkout_id.', state: 'no_reference' }, { status: 400, origin });
  }
  const ref = checkoutId || orderId;
  if (!UUID.test(ref)) {
    return json({ error: 'That does not look like a valid reference.', state: 'bad_reference' }, { status: 400, origin });
  }

  try {
    const entitled = checkoutId
      ? await checkByCheckout(checkoutId)
      : await checkByOrder(orderId);

    if (!entitled.ok) return json(entitled.body, { status: entitled.status, origin });

    return json({ state: 'paid', purchasedBy: entitled.email || null, kit: buildKit() }, { origin });
  } catch (e) {
    if (e instanceof PolarError) {
      // 404 is a real miss; 422 is Polar refusing the id itself (it validates that the
      // path parameter is a v4 UUID). Both mean the same thing to a student holding a bad
      // link, so both get the answer that tells them what to do about it.
      if (e.status === 404 || e.status === 422) {
        return json({
          error: 'No order found for that link. Check the link in your receipt email, or email 20hozaifa02@gmail.com.',
          state: 'not_found'
        }, { status: 404, origin });
      }
      console.error('kit: polar rejected', e.status, JSON.stringify(e.body).slice(0, 300));
      return json({ error: 'Could not confirm your order right now. Try again in a moment.', state: 'upstream_error' }, { status: 502, origin });
    }
    console.error('kit: handler', e);
    return json({ error: 'Could not confirm your order right now.', state: 'error' }, { status: 500, origin });
  }
}

async function checkByCheckout(id) {
  const c = await polar(`/checkouts/${id}`);

  if (!productMatches(c?.product_id ?? c?.product?.id)) {
    return { ok: false, status: 403, body: { error: 'That order is not for the First Paper Kit.', state: 'wrong_product' } };
  }

  const status = String(c?.status || '').toLowerCase();

  if (status === 'succeeded') return { ok: true, email: c?.customer_email ?? c?.customer?.email ?? null };

  // Payment taken, order still being created upstream. The buyer is legitimately entitled
  // and is staring at the page right now, so tell the page to retry rather than refuse.
  if (status === 'confirmed') {
    return { ok: false, status: 202, body: { state: 'processing', retryAfterMs: 2000, error: 'Payment confirmed, finishing up. This page will retry.' } };
  }

  if (status === 'expired') {
    return { ok: false, status: 410, body: { state: 'expired', error: 'That checkout expired before it was paid.' } };
  }

  return { ok: false, status: 402, body: { state: 'unpaid', error: 'That checkout has not been paid.' } };
}

async function checkByOrder(id) {
  const o = await polar(`/orders/${id}`);

  if (!productMatches(o?.product_id ?? o?.product?.id)) {
    return { ok: false, status: 403, body: { error: 'That order is not for the First Paper Kit.', state: 'wrong_product' } };
  }

  const status = String(o?.status || '').toLowerCase();
  const paid = o?.paid === true || status === 'paid';

  if (status === 'refunded') {
    return { ok: false, status: 403, body: { state: 'refunded', error: 'That order was refunded.' } };
  }
  if (!paid) {
    return { ok: false, status: 402, body: { state: 'unpaid', error: 'That order has not been paid.' } };
  }
  return { ok: true, email: o?.customer?.email ?? o?.user?.email ?? null };
}

// A paid order for some other product must not unlock this one. Fails closed: a response
// with no product id on it does not get the benefit of the doubt.
function productMatches(id) {
  return id === PRODUCT_ID;
}
