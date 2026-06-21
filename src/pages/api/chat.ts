// POST /api/chat — streaming, knowledge-grounded recruiter Q&A.
// Vercel serverless function (edge-safe: Web APIs only). Validates + rate-limits the
// request, streams the model reply over SSE, and logs the turn to Supabase. Provider
// (DeepSeek for testing / Anthropic for production) is env-selected — see config.ts.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getChatClient } from '../../lib/chatbot/config';
import { SYSTEM_PROMPT } from '../../lib/chatbot/knowledge.generated';
import { LIMITS, checkRate, checkBudget } from '../../lib/chatbot/limits';
import { hashIp, logSession, logMessages } from '../../lib/chatbot/logging';

type Role = 'user' | 'assistant';
interface Msg { role: Role; content: string }

function getDevice(ua: string | null): 'mobile' | 'desktop' {
  return ua && /Mobi|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop';
}

// One SSE event line.
function sse(obj: unknown): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

export const POST: APIRoute = async ({ request }) => {
  // --- parse + validate ------------------------------------------------------
  let body: {
    messages?: unknown;
    sessionId?: unknown;
    openedFrom?: unknown;
    optOut?: unknown;
  };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return Response.json({ error: 'Bad JSON' }, { status: 400 });
  }

  const raw = Array.isArray(body.messages) ? body.messages : null;
  if (!raw || raw.length === 0) {
    return Response.json({ error: 'No messages' }, { status: 400 });
  }
  // Coerce + check each message shape.
  const messages: Msg[] = [];
  for (const m of raw) {
    if (
      !m || typeof m !== 'object' ||
      (m.role !== 'user' && m.role !== 'assistant') ||
      typeof m.content !== 'string'
    ) {
      return Response.json({ error: 'Bad message' }, { status: 400 });
    }
    messages.push({ role: m.role, content: m.content });
  }
  if (messages[messages.length - 1].role !== 'user') {
    return Response.json({ error: 'Last message must be from the user' }, { status: 400 });
  }

  // Caps: per-message, whole-history, and turn count.
  const lastUser = messages[messages.length - 1].content;
  if (lastUser.length > LIMITS.MAX_MESSAGE_CHARS) {
    return Response.json({ error: 'Message too long' }, { status: 400 });
  }
  const totalChars = messages.reduce((n, m) => n + m.content.length, 0);
  if (totalChars > LIMITS.MAX_HISTORY_CHARS) {
    return Response.json({ error: 'Conversation too long' }, { status: 400 });
  }
  const userTurns = messages.filter((m) => m.role === 'user').length;
  if (userTurns > LIMITS.MAX_TURNS) {
    return Response.json({ blocked: 'turns' }, { status: 429 });
  }

  const sessionId = typeof body.sessionId === 'string' ? body.sessionId.slice(0, 64) : '';
  if (!sessionId) return Response.json({ error: 'No session' }, { status: 400 });
  const openedFrom =
    typeof body.openedFrom === 'string' ? body.openedFrom.slice(0, 128) : null;
  const optOut = body.optOut === true;

  // --- request metadata (same headers as /api/track) -------------------------
  const salt = import.meta.env.IP_HASH_SALT as string;
  const xfwd = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const rawIp = xfwd ? xfwd.split(',')[0].trim() : realIp || '';
  const ip_hash = rawIp && salt ? await hashIp(rawIp, salt) : 'anon';
  const country = request.headers.get('x-vercel-ip-country');
  const device = getDevice(request.headers.get('user-agent'));

  // --- abuse controls --------------------------------------------------------
  const budget = await checkBudget();
  if (!budget.ok) return Response.json({ blocked: 'budget' }, { status: 503 });
  const rate = await checkRate(ip_hash);
  if (!rate.ok) return Response.json({ blocked: 'rate' }, { status: 429 });

  // --- provider client -------------------------------------------------------
  let client, model, provider;
  try {
    ({ client, model, provider } = getChatClient());
  } catch {
    // No key configured → present the unavailable state, never a hard error.
    return Response.json({ blocked: 'unavailable' }, { status: 503 });
  }

  // --- stream the reply over SSE --------------------------------------------
  const encoder = new TextEncoder();
  const isFirstTurn = userTurns === 1;

  const stream = new ReadableStream({
    async start(controller) {
      let assistantText = '';
      try {
        const modelStream = client.messages.stream({
          model,
          max_tokens: LIMITS.MAX_TOKENS,
          // Frozen, cache-controlled knowledge prefix (cache_read ~0.1x; DeepSeek auto-caches too).
          system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
          messages,
        });

        for await (const event of modelStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            assistantText += event.delta.text;
            controller.enqueue(encoder.encode(sse({ type: 'token', text: event.delta.text })));
          }
        }

        const final = await modelStream.finalMessage();
        if (final.stop_reason === 'refusal' && !assistantText) {
          controller.enqueue(
            encoder.encode(
              sse({
                type: 'refusal',
                text: "I can't help with that one — ask me about Tong's work, projects, or how he approaches problems.",
              }),
            ),
          );
        }
        controller.enqueue(encoder.encode(sse({ type: 'done' })));
      } catch {
        controller.enqueue(
          encoder.encode(sse({ type: 'error', text: 'Something went wrong — please try again.' })),
        );
      }

      // Best-effort logging (unless the visitor opted out). Awaited so it runs
      // inside the request lifecycle; failures are swallowed in logging.ts.
      if (!optOut && assistantText) {
        if (isFirstTurn) {
          await logSession({
            session_id: sessionId,
            ip_hash,
            country,
            device,
            opened_from: openedFrom,
            model,
            provider,
          });
        }
        await logMessages(sessionId, lastUser, assistantText);
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
};

// Reject other methods.
export const ALL: APIRoute = () => Response.json({ error: 'Method not allowed' }, { status: 405 });
