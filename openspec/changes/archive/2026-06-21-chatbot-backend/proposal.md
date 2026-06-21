## Why

The chatbot is the site's differentiator — "ask it what a CV can't tell you" — but today it's only a shell: a launcher and a climax section showing "Coming soon" (the `chatbot-entry` spec scoped the backend out). This change makes it real: a recruiter can actually converse with an assistant grounded in Tong's work, reasoning, and trade-offs. It also turns those conversations into a feedback loop (logged, reviewable) so the knowledge can be improved over time.

## What Changes

- **New streaming backend** `src/pages/api/chat.ts` — a Vercel serverless function (mirrors the existing `track.ts` shape), calling Claude via `@anthropic-ai/sdk` with SSE streaming. Starts on `claude-haiku-4-5` (trivially swappable to `claude-sonnet-4-6`).
- **Knowledge grounding via a cached system prompt, not RAG** — the `npm run sync`'d public wiki (`src/content/wiki`, already strips `/confidential/`) plus site content are compiled into one corpus loaded as a frozen, prompt-cached system prefix.
- **Guardrails** — scope to Tong-professional Q&A, deflect off-topic, resist prompt injection, never fabricate beyond the knowledge file, defined persona; graceful handling of the API `refusal` stop reason (never a broken/erroring UI).
- **Floating chat panel UI** — the existing "Talk" launcher opens an overlay panel reachable from anywhere; the climax section's input also opens/focuses it. Reduced-motion + no-JS fallbacks consistent with the current shell.
- **In-chat privacy notice line** (legitimate-interest basis, not a consent wall) linking to `/privacy`.
- **Download transcript** — PDF + Markdown, with the PDF library lazy-loaded only on click (no LCP impact).
- **Supabase chat logging** — two new tables (`chat_sessions`, `chat_messages`) written server-side per turn, IP hashed with `IP_HASH_SALT`, plus analytics fields (country, device, page opened-from, turn count, derived duration) and a retention policy.
- **New `/privacy` page** — what's collected, why, retention, deletion-request contact.
- **Abuse controls** — per-IP rate limit (Vercel KV/Upstash), input-length cap, `max_tokens` cap, per-session turn cap, and a global daily budget ceiling that degrades to the "coming soon" state when exceeded.
- **BREAKING (spec-level):** supersedes the `chatbot-entry` "backend out of scope" / "coming soon placeholder" requirements — the launcher and section composer become live controls.

## Capabilities

### New Capabilities
- `chatbot-conversation`: the streaming Q&A backend — model invocation, SSE, cached knowledge-grounded system prompt, guardrails, and refusal handling.
- `chatbot-ui`: the floating chat panel — opened by the launcher and the section input, message exchange, reduced-motion/no-JS fallbacks, and the transcript download (PDF + Markdown).
- `chat-logging`: server-side Supabase logging of sessions and messages, the analytics fields, and the retention policy.
- `chat-abuse-controls`: per-IP rate limiting, input/output caps, per-session turn cap, and the global daily budget ceiling with graceful degradation.
- `privacy-disclosure`: the `/privacy` page and the in-chat notice line that links to it.

### Modified Capabilities
- `chatbot-entry`: the persistent launcher becomes a panel toggle and the climax section presents a live composer; the "backend out of scope" and "coming soon placeholder" requirements are superseded.

## Impact

- **New code:** `src/pages/api/chat.ts`; chat panel + transcript components/scripts; a build-time knowledge-corpus compile step; `src/pages/privacy.astro`.
- **Modified code:** `src/components/ChatLauncher.astro`, `src/components/Chatbot.astro` (faux composer → live), wherever the launcher mounts.
- **Data:** new `supabase/migrations` for `chat_sessions` + `chat_messages` (anon INSERT-only RLS, like `events`); a retention purge job/policy.
- **Dependencies:** `@anthropic-ai/sdk`; a Vercel KV/Upstash client; a lazy-loaded PDF lib.
- **Infra / ops (Tong):** provision Vercel KV/Upstash (now via Vercel Marketplace); confirm `ANTHROPIC_API_KEY` set in `.env.local` + Vercel; run `npm run sync` to populate the knowledge corpus.
- **Content rule:** knowledge enters only via `npm run sync` (strips `/confidential/`); inspect diff + `npm run check-leaks` before push.
