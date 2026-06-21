// Chat provider connectors. Two are wired — DeepSeek (testing) and Anthropic
// (production) — and selected by the CHAT_PROVIDER env var, so both API keys can
// live in env at once and switching providers is a one-variable change, no code edit.
//
// DeepSeek exposes an Anthropic-compatible endpoint, so a single @anthropic-ai/sdk
// client serves both — only baseURL + apiKey + default model differ.

import Anthropic from '@anthropic-ai/sdk';

export type ChatProvider = 'deepseek' | 'anthropic';

interface Connector {
  apiKey: string | undefined;
  baseURL?: string; // undefined → SDK default (Anthropic)
  defaultModel: string;
}

// Per-provider connector config, all env-driven.
const CONNECTORS: Record<ChatProvider, Connector> = {
  deepseek: {
    apiKey: import.meta.env.DEEPSEEK_API_KEY,
    // DeepSeek's Anthropic-compatible base; override via env if the path changes.
    baseURL: import.meta.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/anthropic',
    defaultModel: 'deepseek-v4-pro',
  },
  anthropic: {
    apiKey: import.meta.env.ANTHROPIC_API_KEY,
    baseURL: undefined,
    defaultModel: 'claude-haiku-4-5', // swap to claude-sonnet-4-6 via CHAT_MODEL if needed
  },
};

/** Resolve the active provider from env, defaulting to DeepSeek for testing. */
export function getProvider(): ChatProvider {
  const p = (import.meta.env.CHAT_PROVIDER || 'deepseek').toLowerCase();
  return p === 'anthropic' ? 'anthropic' : 'deepseek';
}

/**
 * Build the configured chat client + model. Throws if the selected provider has no
 * API key so the caller can degrade gracefully instead of making a doomed request.
 */
export function getChatClient(): { client: Anthropic; model: string; provider: ChatProvider } {
  const provider = getProvider();
  const conn = CONNECTORS[provider];
  if (!conn.apiKey) {
    throw new Error(`Chat provider "${provider}" selected but its API key is not set.`);
  }
  const client = new Anthropic({ apiKey: conn.apiKey, baseURL: conn.baseURL });
  const model = import.meta.env.CHAT_MODEL || conn.defaultModel;
  return { client, model, provider };
}
