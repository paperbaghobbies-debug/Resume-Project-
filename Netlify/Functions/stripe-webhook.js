// Stripe calls THIS function directly (server-to-server), not the browser.
// We verify the signature to prove the request genuinely came from Stripe,
// then record the paid session in Netlify Blobs so the browser can't fake it.

const Stripe = require('stripe');
const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return { statusCode: 500, body: 'Server is missing Stripe environment variables' };
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = event.headers['stripe-signature'];

  let stripeEvent;
  try {
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : event.body;

    // This throws if the signature doesn't match — i.e. if the request
    // didn't really come from Stripe. That's the core security check.
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return { statusCode: 400, body: `Webhook signature verification failed: ${err.message}` };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    const store = getStore('sandbox-sessions');

    await store.setJSON(session.id, {
      status: 'paid',
      role: 'Premium_Inspector',
      paidAt: new Date().toISOString(),
    });
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
