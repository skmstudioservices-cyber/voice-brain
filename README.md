# Voice Brain

Personal voice-based thinking partner — brain dump + brainstorm, ~₹0.

- **STT**: browser Web Speech API (Chrome/Edge) — free, zero setup. (Upgrade path: local Whisper for better accuracy.)
- **LLM**: your choice — Groq (free, fastest), Google Gemini free tier, or OpenAI. Streaming responses.
- **TTS**: browser speech synthesis.
- **Memory**: conversation (last 40 turns) + notes stored in **browser localStorage** — nothing leaves your machine except the LLM API calls. 📌 Save pins any exchange as a note; export all notes as markdown.

## Setup
1. Get a free API key:
   - Groq (recommended): https://console.groq.com — key in API Keys
   - or Gemini: https://aistudio.google.com — "Get API key"
2. Open the app → ⚙ Settings → paste key → Save (key stays in your browser's localStorage only).
3. Press **Space** (or the 🎙 button), talk, pause — it auto-sends. Reply is spoken back.

## Deploy
Live at https://voice-brain.pages.dev — deployed via the `deploy-voicebrain.yml` workflow in the `digipincode-india` repo (Cloudflare free tier, no secrets stored in this repo).

Local run: just open `index.html` in Chrome, or `npx serve .` for a proper localhost.

## Notes
- Works best in Chrome/Edge (Speech API). Mic requires https or localhost.
- Hinglish input works well with `en-IN` language setting; for pure Hindi speech change it to `hi-IN` in settings.
- There is NO server component — if you clear browser data, history/notes go too. Export notes regularly. (Phase 2 idea: sync notes to a Cloudflare KV/D1 via a small worker, or append to a GitHub file.)
