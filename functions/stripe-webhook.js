// Cloudflare Pages Function — becomes available at /stripe-webhook
// This is the URL you register in Stripe's webhook settings.
// env.SESSIONS is a KV namespace binding (set up in the Cloudflare dashboard).

import Stripe from 'stripe';

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Server is missing Stripe environment variables', { status: 500 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  const sig = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  let stripeEvent;
  try {
    // Cloudflare Workers don't have Node's crypto module, so Stripe's SDK
    // uses the async/WebCrypto variant here instead of constructEvent().
    stripeEvent = await stripe.webhooks.constructEventAsync(
      rawBody,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook signature verification failed: ${err.message}`, {
      status: 400,
    });
  }

  // Debug: Log the incoming event type
  console.log("Webhook received event type:", stripeEvent.type);

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    // Debug: Log the ID being saved
    console.log("Processing session ID for KV:", session.id);

    try {
      await env.SESSIONS.put(
        session.id,
        JSON.stringify({
          status: 'paid',
          role: 'Premium_Inspector',
          paidAt: new Date().toISOString(),
        })
      );
      console.log("Successfully saved session to KV!");
    } catch (err) {
      console.error("KV Put Error:", err.message);
      return new Response(`KV Save failed: ${err.message}`, { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}