> Status: code complete on branch `feat/chatbot-backend` (build green, `astro check` 0 errors, no leaks).
> Tasks left unchecked need Tong's live credentials (API key, KV, applied DB) and can't be verified locally yet.

## 1. Prerequisites & infra (Tong + setup)

- [ ] 1.1 Confirm `ANTHROPIC_API_KEY` is set in `.env.local` and Vercel env  *(Tong — also add `DEEPSEEK_API_KEY` + set `CHAT_PROVIDER`)*
- [ ] 1.2 Provision Vercel KV / Upstash store; confirm `VERCEL_KV_REST_API_URL` + `VERCEL_KV_REST_API_TOKEN` in `.env.local` and Vercel  *(Tong)*
- [x] 1.3 Add `@anthropic-ai/sdk` and a KV/Upstash client to dependencies
- [x] 1.4 Run `npm run sync` to populate `src/content/wiki`; inspect `git diff src/content/`

## 2. Knowledge corpus (build-time)

- [x] 2.1 Write a build step that compiles `src/content/wiki` + site content into one stable knowledge string module
- [x] 2.2 Add a brief persona/guardrail preamble around the corpus (scope, anti-injection, no-fabrication, backend-disclosure choice)
- [x] 2.3 Verify the artifact is byte-stable across builds (cache-safe prefix) and contains no `/confidential/` material

## 3. Supabase logging schema

- [x] 3.1 Add migration for `chat_sessions` (session_id, ip_hash, country, device, opened_from, started_at, model, provider)
- [x] 3.2 Add migration for `chat_messages` (session_id, role, content, created_at)
- [x] 3.3 Add anon INSERT-only RLS policies mirroring the `events` table  *(authored in 0002_chat.sql; Tong applies over the admin connection)*
- [x] 3.4 Add the retention mechanism (purge after the chosen period) and single-session deletion

## 4. Chat backend (`src/pages/api/chat.ts`)

- [x] 4.1 Scaffold the Vercel function (`prerender = false`, Web-APIs only, POST handler, reject other methods/malformed bodies)
- [x] 4.2 Build the request: cached system prefix (corpus) + client-sent history; call via `@anthropic-ai/sdk` with streaming
- [x] 4.3 Return an SSE stream of reply tokens to the client
- [x] 4.4 Set the provider/model via env config (DeepSeek `deepseek-v4-pro` default; Anthropic for prod) and apply the `max_tokens` cap
- [x] 4.5 Handle the `refusal` stop reason → emit a graceful, non-erroring message
- [x] 4.6 Derive hashed IP, country, device, opened-from; write `chat_sessions` (first turn) + `chat_messages` per turn
- [ ] 4.7 Verify prompt caching is active (`cache_read_input_tokens > 0` on repeat requests)  *(needs a live API key)*

## 5. Abuse controls

- [x] 5.1 Implement per-IP rate limiting behind a thin interface backed by KV/Upstash
- [x] 5.2 Enforce input-size cap (reject pre-model) and per-session turn cap
- [x] 5.3 Implement the global daily budget ceiling; when exceeded, signal the UI to show the unavailable state
- [x] 5.4 Ensure all limit responses are clear, non-erroring signals the panel can render calmly

## 6. Floating chat panel UI

- [x] 6.1 Build the floating panel component (overlay, message list, input, send, close); phone-friendly
- [x] 6.2 Wire the SSE client to render streamed tokens incrementally into the panel
- [x] 6.3 Make the "Talk" launcher open the panel (JS); keep the no-JS anchor fallback
- [x] 6.4 Make the climax-section composer open/focus the same panel (replace the faux "coming soon" composer)
- [x] 6.5 Add the in-chat privacy notice line linking to `/privacy` (visible before first input, non-blocking)
- [x] 6.6a Acceptance-by-use notice ("By chatting, you agree…") — no in-chat toggle; objection handled via the /privacy contact
- [x] 6.6 Respect `prefers-reduced-motion`; no-JS leaves non-deceptive controls and a usable page
- [x] 6.7 Render the abuse-control / unavailable states (rate-limited, turn cap, budget ceiling) gracefully

## 7. Transcript download

- [x] 7.1 Add a Markdown export of the current conversation (Blob download)
- [x] 7.2 Add a PDF export with the PDF library lazy-loaded only on click

## 8. Privacy page

- [x] 8.1 Create `src/pages/privacy.astro` (collection, purpose, retention, deletion contact); phone-friendly, on-brand
- [x] 8.2 State controller + contact + rights; name processors (AI provider, DB, host) and note DPAs + transfer safeguards
- [x] 8.3 Verify disclosure matches actual behavior — covers `/api/track` analytics and chat logging, claims nothing extra

## 9. Verification & ship

- [ ] 9.1 Local end-to-end: stream a multi-turn conversation; confirm grounding, persona, deflection, injection resistance  *(needs live key)*
- [ ] 9.2 Confirm logging rows land in Supabase  *(needs applied DB)*
- [ ] 9.3 Exercise abuse controls: rate limit, oversized input, turn cap, budget ceiling  *(needs KV)*
- [ ] 9.4 Verify reduced-motion + no-JS fallbacks and phone layout in a browser
- [x] 9.5 `npm run build` + `npm run check-leaks` + `astro check` green
- [ ] 9.6 Open a PR (feature branch); Tong reviews and merges
