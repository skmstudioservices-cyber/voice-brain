// voice-brain-proxy — thin secure proxy to Cloudflare Workers AI + static app host.
// - GET /*  : serves the app from voice-brain.pages.dev, injecting the proxy key (zero-setup, auto-rotate friendly)
// - POST /chat {model, messages} with header x-proxy-key : streams Workers AI SSE
// Secrets (set via deploy-voicebrain.yml): CF_ACCOUNT_ID, CF_API_TOKEN, PROXY_KEY

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Proxy-Key',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(request.url);

    if (request.method === 'GET') return serveApp(url, env);

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

async function serveApp(url, env) {
  const upstream = await fetch('https://voice-brain.pages.dev' + url.pathname);
  const ct = upstream.headers.get('content-type') || 'text/html; charset=utf-8';
  if (ct.includes('text/html')) {
    let html = await upstream.text();
    // inject the current PROXY_KEY — rotating the key via the deploy workflow auto-propagates on reload
    html = html.replaceAll('__VB_PROXY_KEY__', env.PROXY_KEY || '__VB_PROXY_KEY__');
    return new Response(html, {
      status: upstream.status,
      headers: { 'Content-Type': ct, 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' },
    });
  }
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'Content-Type': ct, 'Cache-Control': 'public, max-age=3600', 'Access-Control-Allow-Origin': '*' },
  });
}
