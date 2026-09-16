// voice-brain-proxy — thin secure proxy to Cloudflare Workers AI.
// Keeps the CF API token server-side (Worker secret); the browser only ever holds the proxy key.
// Endpoints: POST /chat {model, messages} with header x-proxy-key. Streams the SSE response.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Proxy-Key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/chat')
      return new Response('not found', { status: 404, headers: CORS });

    const key = request.headers.get('x-proxy-key');
    if (!env.PROXY_KEY || !key || key !== env.PROXY_KEY)
      return new Response('unauthorized', { status: 401, headers: CORS });

    let body;
    try { body = await request.json(); } catch { return new Response('bad json', { status: 400, headers: CORS }); }

    const model = String(body.model || '@cf/meta/llama-3.1-8b-instruct-fp8-fast');
    if (!/^@cf\//.test(model)) return new Response('model must start with @cf/', { status: 400, headers: CORS });
    const messages = Array.isArray(body.messages) ? body.messages.slice(-40) : [];

    const upstream = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/run/${model}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.CF_API_TOKEN}` },
        body: JSON.stringify({ stream: true, messages }),
      }
    );

    return new Response(upstream.body, {
      status: upstream.status,
      headers: { ...CORS, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' },
    });
  },
};
