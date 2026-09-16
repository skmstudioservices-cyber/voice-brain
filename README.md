# Voice Brain

Personal voice-based thinking partner — brain dump + brainstorm, ~₹0.

- **STT**: browser Web Speech API (Chrome/Edge) — free, zero setup. (Upgrade path: local Whisper for better accuracy.)
- **LLM**: your choice — Groq (free, fastest), **Cloudflare Workers AI (free 10k neurons/day)**, Google Gemini free tier, or OpenAI. Streaming responses.
- **TTS**: browser speech synthesis.
- **Memory**: conversation (last 40 turns) + notes stored in **browser localStorage** — nothing leaves your machine except the LLM API calls. 📌 Save pins any exchange as a note; export all notes as markdown.

## Setup
1. Get a free API key:
   - **Groq** (recommended): https://console.groq.com — API Keys
   - **Cloudflare Workers AI**: dashboard → My Profile → **API Tokens → Create Token** → Custom token with permission **Account → Workers AI → Read** ONLY. Never paste your main CF token (it can manage your whole infra). Also copy your **Account ID** (dashboard home, right sidebar).
   - or **Gemini**: https://aistudio.google.com — "Get API key"
2. Open the app → ⚙ Settings → provider select karo → key paste karo (CF ke case mein Account ID bhi) → Save. Keys sirf browser ke localStorage mein rehti hain.
3. Press **Space** (or the 🎙 button), talk, pause — it auto-sends. Reply is spoken back.

## Cloudflare Workers AI models
- Quick checks (neuron-cheap): `@cf/meta/llama-3.1-8b-instruct-fp8-fast`
- Full use (default): `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- Free tier: 10,000 neurons/day. Agar CORS error aaye (browser se direct call block ho) to batana — chhota proxy Worker laga denge jisme token secret rahega (wo zyada secure bhi hai).

## Deploy
Live at https://voice-brain.pages.dev — deployed via the `deploy-voicebrain.yml` workflow in the `digipincode-india` repo (Cloudflare free tier, no secrets stored in this repo).

Local run: just open `index.html` in Chrome, or `npx serve .` for a proper localhost.

## Notes
- Works best in Chrome/Edge (Speech API). Mic requires https or localhost.
- Hinglish input works well with `en-IN` language setting; for pure Hindi speech change it to `hi-IN` in settings.
- There is NO server component — if you clear browser data, history/notes go too. Export notes regularly. (Phase 2 idea: sync notes to a Cloudflare KV/D1 via a small worker, or append to a GitHub file.)
