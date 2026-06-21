## ADDED Requirements

### Requirement: Per-IP rate limiting
The chat endpoint SHALL enforce a per-IP request rate limit backed by a shared store (Vercel KV / Upstash). When a client exceeds the limit, the endpoint SHALL reject further requests with a clear, non-erroring signal the UI can present, until the window resets.

#### Scenario: Within the limit
- **WHEN** a visitor sends requests within the allowed rate
- **THEN** the requests are served normally

#### Scenario: Over the limit
- **WHEN** a visitor exceeds the per-IP rate
- **THEN** the endpoint refuses additional requests and the panel shows a calm "slow down / try again shortly" message

### Requirement: Input and output caps
The endpoint SHALL cap the size of an incoming message (and total conversation) and SHALL cap the model's `max_tokens` per reply. The endpoint SHALL also cap the number of turns per session. Requests exceeding the input cap SHALL be rejected before the model is called.

#### Scenario: Oversized input rejected pre-model
- **WHEN** a request carries a message or history beyond the input cap
- **THEN** the endpoint rejects it without calling the model

#### Scenario: Bounded reply length
- **WHEN** the model generates a reply
- **THEN** its length is bounded by the configured `max_tokens` cap

#### Scenario: Turn cap reached
- **WHEN** a session reaches the per-session turn cap
- **THEN** further turns are declined with a clear message

### Requirement: Global daily budget ceiling
The endpoint SHALL track aggregate usage against a configurable global daily ceiling. When the ceiling is exceeded, the chat SHALL degrade gracefully to the "coming soon"-style unavailable state rather than continuing to spend on the API key.

#### Scenario: Under the ceiling
- **WHEN** aggregate daily usage is below the ceiling
- **THEN** chat operates normally

#### Scenario: Ceiling exceeded
- **WHEN** aggregate daily usage exceeds the ceiling
- **THEN** the chat presents the unavailable/"coming soon" state and stops making model calls until the ceiling resets
