// Cloudflare Pages Function — becomes available at /verify-session
// Reads from the same KV namespace that stripe-webhook.js writes to.

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');

  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Missing session_id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const record = await env.SESSIONS.get(sessionId, { type: 'json' });

  if (record && record.status === 'paid') {
    return new Response(JSON.stringify({ authorized: true, role: record.role }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ authorized: false }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
