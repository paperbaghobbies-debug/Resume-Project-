// The browser asks "has this session been marked paid?" — it never gets to
// declare that itself. Only stripe-webhook.js can write that record.

const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  const sessionId = event.queryStringParameters && event.queryStringParameters.session_id;

  if (!sessionId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing session_id' }) };
  }

  const store = getStore('sandbox-sessions');
  const record = await store.get(sessionId, { type: 'json' });

  if (record && record.status === 'paid') {
    return {
      statusCode: 200,
      body: JSON.stringify({ authorized: true, role: record.role }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ authorized: false }),
  };
};
