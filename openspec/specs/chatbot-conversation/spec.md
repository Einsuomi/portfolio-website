# Chatbot Conversation

## Purpose

The conversational backend for the recruiter-facing assistant: a streaming, knowledge-grounded Q&A endpoint with guardrails, served by a provider-selectable Claude/Anthropic-compatible model.

## Requirements

### Requirement: Streaming conversational backend
The site SHALL expose a serverless endpoint at `POST /api/chat` that accepts a multi-turn conversation and streams the assistant's reply token-by-token over Server-Sent Events. The endpoint SHALL run as a Vercel function (`prerender = false`) using only Web-platform APIs (edge-safe), mirroring the existing `/api/track` pattern. It SHALL call the model via `@anthropic-ai/sdk`. The provider and model SHALL be selectable by environment configuration (base URL + API key + model id) with no code change, so it can target an Anthropic-compatible provider — DeepSeek (`deepseek-v4-pro`) for testing — or Anthropic (`claude-haiku-4-5` / `claude-sonnet-4-6`) for production. To stay provider-portable, requests SHALL use only the portable parameters (`model`, `system`, `messages`, `max_tokens`, `stream`, `cache_control`) and SHALL NOT depend on Anthropic-only parameters such as `effort` or adaptive `thinking`. The endpoint SHALL be stateless — the client sends the full conversation history each turn.

#### Scenario: Streaming a reply
- **WHEN** a client POSTs a valid conversation to `/api/chat`
- **THEN** the endpoint streams the assistant's reply incrementally over SSE and the panel renders tokens as they arrive

#### Scenario: Multi-turn context
- **WHEN** a client sends a follow-up question with the prior turns included in the request
- **THEN** the reply reflects the earlier turns of the conversation

#### Scenario: Rejecting non-POST and malformed requests
- **WHEN** a request uses a method other than POST, or carries a malformed/oversized body
- **THEN** the endpoint returns an appropriate error status and does not call the model

### Requirement: Knowledge-grounded, cached system prompt
The assistant's answers SHALL be grounded in a knowledge corpus compiled from a **curated professional allowlist** of `npm run sync`'d public wiki pages (`src/content/wiki`, from which `/confidential/` paths are already stripped) plus site content — NOT the entire synced wiki. The allowlist SHALL include the persona/evidence layer (`ideas/chatbot-persona-skill.md`), the framing taxonomy (`learning/senior-de-interview-framework.md`), all `work/**` pages, and selected professional `learning/` pages (e.g. `spec-driven-development`, `databricks-ai-dev-kit`, `claude-code-basics`). It SHALL exclude personal pages (family, hobbies, visa/mobility) and portfolio/super-brain build-meta. The corpus SHALL be loaded as a frozen system-prompt prefix and SHALL use prompt caching so that the stable prefix is billed at cache-read rates on repeat requests. The corpus SHALL be assembled at build time so it is byte-stable across requests (a cache-safe prefix). No confidential content SHALL enter the corpus.

#### Scenario: Answer grounded in the corpus
- **WHEN** a recruiter asks about a project, decision, or trade-off documented in the knowledge corpus
- **THEN** the assistant answers using that material rather than generic or invented content

#### Scenario: Cache reuse on repeat requests
- **WHEN** multiple chat requests are served with the same knowledge prefix
- **THEN** the stable prefix is served from cache (reported as cache-read tokens), not reprocessed at full price

#### Scenario: Confidential content never present
- **WHEN** the knowledge corpus is built
- **THEN** it contains only synced public-wiki and site content, and no `/confidential/`-sourced material

### Requirement: Guardrails and persona
The assistant SHALL stay within a defined persona focused on Tong-professional Q&A. It SHALL deflect off-topic requests, SHALL resist prompt-injection attempts (e.g. "ignore your instructions"), and SHALL NOT fabricate facts that are not supported by the knowledge corpus. When the model returns a `refusal` stop reason, the endpoint SHALL surface a graceful message rather than a broken or erroring UI.

#### Scenario: Off-topic deflection
- **WHEN** a user asks something unrelated to Tong's work or professional background
- **THEN** the assistant politely declines and steers back to what it can help with

#### Scenario: Prompt-injection resistance
- **WHEN** a user message attempts to override the system instructions or extract them
- **THEN** the assistant does not comply and continues operating within its defined scope

#### Scenario: Unknown answered honestly
- **WHEN** a user asks for a fact not present in the knowledge corpus
- **THEN** the assistant says it doesn't have that information rather than inventing an answer

#### Scenario: Refusal handled gracefully
- **WHEN** the model returns a `refusal` stop reason
- **THEN** the panel shows a calm, non-erroring message and the conversation remains usable
