## Context

The chatbot shell already exists (`ChatLauncher.astro`, `Chatbot.astro`) and is spec'd in `chatbot-entry` as placeholder-only. Infrastructure survived the clean start: Vercel serverless functions work (the `src/pages/api/track.ts` pattern — `prerender = false`, Web-APIs only, edge-safe), env var names are declared in `.env.example` (`ANTHROPIC_API_KEY`, `SUPABASE_*`, `VERCEL_KV_REST_API_*`, `IP_HASH_SALT`), and Supabase is live with an anonymous INSERT-only `events` table. The site is a public GitHub repo on Vercel; content enters only via `npm run sync` (strips `/confidential/`). The bot must work for a recruiter on a phone, with reduced-motion and no-JS fallbacks. The model/cost/caching facts here are grounded against the current Anthropic API reference.

## Goals / Non-Goals

**Goals:**
- A working, streaming, knowledge-grounded recruiter Q&A assistant with a coherent floating panel UI.
- Strong cost/abuse protection on a public endpoint that spends Tong's API key.
- A reviewable feedback loop (Supabase logging) so the knowledge file improves over time.
- Proportionate GDPR posture: transparency via notice + `/privacy`, IP minimization, retention.
- Leave the backbone structure and the `chatbot-entry` visual design intact.

**Non-Goals:**
- No RAG / vector DB / embeddings — the corpus fits in a cached system prompt.
- No server-side conversation memory across visits (stateless; client resends history).
- No authentication or accounts.
- No precise sub-second dwell-time tracking in this change (duration is derived from timestamps; a client-timer beacon is a possible later add).
- No model auto-selection / fallback chain (single configurable model).

## Decisions

**1. Grounding = cached system prompt, not RAG.** A portfolio's content (~4 projects, 2 writes, experience, CV) is ~10–20K tokens — it fits comfortably in one system prompt. Loaded as a frozen prefix with prompt caching, the corpus bills at ~0.1× on cache reads, so it's near-free per turn. Alternative considered: embeddings + retrieval — rejected as large overengineering for single-person content with no scaling need.

**2. Corpus compiled at build time into the bundle.** A build step reads `src/content/wiki` (post-`sync`) + site content and emits a single stable string module imported by the function. Byte-stability is required for the cache prefix to hit; reading files at runtime in a bundled function is fragile and risks prefix drift. Trade-off: re-running `sync` + build is required to refresh knowledge (acceptable — knowledge changes are deliberate).

**3. Streaming over SSE.** Replies stream token-by-token, which feels alive and avoids HTTP timeouts on longer answers. The function returns a `ReadableStream`; the client reads it incrementally. Matches the `@anthropic-ai/sdk` streaming helper.

**4. Provider-agnostic via the Anthropic-compatible API, env-configured.** DeepSeek V4 exposes an Anthropic-compatible endpoint, so a single `@anthropic-ai/sdk` client serves both providers — only `baseURL` + `apiKey` + `model` differ, all from env (`CHAT_BASE_URL`, `CHAT_API_KEY` falling back to `ANTHROPIC_API_KEY`, `CHAT_MODEL`). Testing uses `deepseek-v4-pro` (cheap, 1M context, automatic prefix caching); production swaps to `claude-haiku-4-5` (then `claude-sonnet-4-6` if quality is flat) by changing env only — no code change. Requests stay portable: only `model/system/messages/max_tokens/stream/cache_control` (cache_control is harmless on DeepSeek, which auto-caches; the knowledge prefix still gets ~0.1× cache reads on both). Anthropic-only params (`effort`, adaptive `thinking`) are avoided. Opus rejected as overkill for short grounded Q&A. Note: visitors cannot detect the backend (server-side); the system prompt also instructs the bot not to disclose it — relevant since DeepSeek would otherwise be an EU-recruiter trust flag.

**5. One panel, two entry points.** Both the launcher and the section input open the *same* floating panel — avoids two divergent chat UIs. The section's existing glass composer becomes a button that opens/focuses the panel rather than a separate inline chat.

**6. Logging server-side, per turn, reusing the `track.ts` pattern.** The function writes `chat_sessions` + `chat_messages` via the anon key under INSERT-only RLS — content is never written from the browser, and the anon key isn't exposed for chat. Per-turn writes mean no data loss on tab close. IP is hashed with `IP_HASH_SALT` (never raw), matching the existing analytics privacy posture. Duration is derived from `started_at`/`last_at` — no client timer needed.

**7. Abuse controls layered.** Per-IP rate limit (Vercel KV/Upstash) + input-size cap (reject pre-model) + `max_tokens` cap + per-session turn cap + a global daily budget ceiling that flips the UI to the "coming soon"-style unavailable state. The ceiling is the backstop that bounds worst-case spend.

**8. GDPR: notice + `/privacy`, not a consent wall.** Logging hashed IP + free-text chat is processing personal data, so transparency is required — but a one-line in-chat notice under a legitimate-interest basis is proportionate for a portfolio. Plus a `/privacy` page (collection, purpose, retention, deletion contact), retention purge, and single-session deletion. Alternative considered: explicit "Start chat" accept button — rejected as heavier than warranted (Tong's call, already decided).

**9. Transcript: PDF + Markdown, PDF lazy-loaded.** The client holds the full conversation, so Markdown is a trivial Blob. PDF needs a library, lazy-loaded only on click so it never touches initial load / LCP. JSON dropped — no recruiter use case (Tong has structured data in Supabase).

## Risks / Trade-offs

- **Public endpoint spends Tong's API key** → layered abuse controls (rate limit + caps + turn cap + global daily ceiling with graceful degradation) bound worst-case spend; the ceiling is the hard backstop.
- **Knowledge leak on a public repo** → corpus is built only from `npm run sync` output (strips `/confidential/`); inspect diff + `npm run check-leaks` before push; nothing confidential enters the bundle.
- **Prompt-cache miss from prefix drift** → corpus compiled to a byte-stable build artifact; verify `cache_read_input_tokens > 0` on repeat requests during testing.
- **Free-text chat is personal data (GDPR)** → notice + `/privacy` + hashed-IP minimization + retention purge + per-session deletion; flag I'm not a lawyer.
- **Vercel KV is now provisioned via Vercel Marketplace/Upstash** → Tong must provision the store and confirm `VERCEL_KV_REST_API_*` values; design the rate-limiter behind a thin interface so the exact provider is swappable.
- **Recruiter on a phone / no-JS / reduced-motion** → panel respects `prefers-reduced-motion`; without JS the launcher/section stay non-deceptive controls; the page remains fully usable.
- **Model could disclose its own backend** → guardrail in the system prompt controls whether/how it identifies itself.

## Migration Plan

1. Tong provisions Vercel KV/Upstash and confirms `ANTHROPIC_API_KEY` in `.env.local` + Vercel env.
2. Add Supabase migrations for `chat_sessions` + `chat_messages` (anon INSERT-only RLS, like `events`); apply.
3. `npm run sync` to populate `src/content/wiki`; build the knowledge corpus artifact.
4. Implement function, panel, logging, abuse controls, `/privacy`, transcript download.
5. Verify locally (stream, cache hits, rate-limit, caps, fallbacks), then deploy.
6. Rollback: the chat degrades to the existing "coming soon" state if the function is disabled or the budget ceiling trips — the shell remains intact, so disabling the backend reverts UX safely.

## Open Questions

- Exact numeric values for the caps (per-IP rate, input length, `max_tokens`, per-session turns, daily budget ceiling) and retention period (~6–12 months) — to be set during implementation with sensible defaults Tong can tune.
- Whether the bot should identify its model when asked, or stay silent on its backend — a one-line system-prompt choice; defaulting to not advertising the backend unless Tong wants otherwise.
