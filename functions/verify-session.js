// Cloudflare Pages Function — becomes available at /verify-session
// Reads from the same KV namespace that stripe-webhook.js writes to.

export async function onRequestGet(context) {
  const { request, env } = context;

  // Debugging: Log what environment bindings are available
  console.log("Available environment bindings:", Object.keys(env));

  // Critical check: Ensure the binding exists before using it
  if (!env.SESSIONS) {
    console.error("CRITICAL: SESSIONS binding is missing in the production environment.");
    return new Response(JSON.stringify({ error: "Server misconfiguration: SESSIONS binding not found" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Missing session_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Attempt to retrieve record from KV
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
    
  } catch (err) {
    console.error("Verification error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}