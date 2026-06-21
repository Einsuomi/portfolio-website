## ADDED Requirements

### Requirement: Server-side conversation logging
The chat backend SHALL persist conversations to Supabase so they can be reviewed and used to improve the assistant. Writes SHALL happen server-side from the chat function (never directly from the browser), reusing the existing anonymous, INSERT-only RLS pattern used by `/api/track`. Logging SHALL occur per turn (after each assistant reply) so data is retained even if the recruiter closes the tab mid-conversation. Two tables SHALL be used: `chat_sessions` (one immutable row per conversation, inserted on the first turn) and `chat_messages` (one row per message). To preserve the INSERT-only security posture, the session row SHALL NOT be updated after creation; turn count and duration SHALL be derived from `chat_messages` timestamps.

#### Scenario: Turn persisted
- **WHEN** an assistant reply completes for a turn
- **THEN** the user message and assistant reply for that turn are written to `chat_messages`, and on the first turn the session row is inserted in `chat_sessions`

#### Scenario: Survives early exit
- **WHEN** the recruiter closes the tab after one exchange
- **THEN** that exchange is already persisted (no end-of-session flush required)

#### Scenario: Content written server-side only
- **WHEN** chat content is stored
- **THEN** it is inserted by the server function using the INSERT-only key, and no chat content is written from the browser

### Requirement: Privacy-preserving analytics fields
Each logged session SHALL capture analytics that help Tong understand engagement: a salted hash of the visitor IP (using `IP_HASH_SALT`, never the raw IP), country, device bucket, the page/section the chat was opened from, the turn count, and timestamps from which conversation duration can be derived. Raw IP addresses SHALL NOT be stored.

#### Scenario: Hashed IP, never raw
- **WHEN** a session is logged
- **THEN** the IP is stored only as a salted hash and the raw IP is never persisted

#### Scenario: Engagement fields captured
- **WHEN** a session is logged
- **THEN** country, device, opened-from page/section, and turn count are recorded, and start/last timestamps allow duration to be derived

### Requirement: Right to object
Because logging relies on a legitimate-interest basis with acceptance-by-use, the recruiter SHALL be able to object to having their conversation logged. Objection is exercised via the `/privacy` contact (a deletion/objection request by email), not an in-chat toggle; such requests SHALL be honoured by deleting the session's data (see Retention policy).

#### Scenario: Objection honoured
- **WHEN** a recruiter emails the `/privacy` contact objecting to logging or requesting deletion, identifying roughly when they visited
- **THEN** their session data can be removed (single-session deletion)

### Requirement: Retention policy
Chat logs SHALL be subject to a defined retention period after which rows are purged, and the mechanism SHALL allow deleting an individual session on request (keyed by session identifier).

#### Scenario: Old rows purged
- **WHEN** chat rows exceed the retention period
- **THEN** they are removed by the retention mechanism

#### Scenario: Deletion on request
- **WHEN** a deletion request identifies a session
- **THEN** that session's rows can be removed in a single operation
