/** Default OpenAI chat model. Override with OPENAI_MODEL. */
export const DEFAULT_MODEL = "gpt-6-luna";

export const DEFAULT_DAILY_LIMIT = 5;

export const MAX_QUESTION_LENGTH = 600;

export function dailyLimit() {
  const raw = process.env.DAILY_QUESTION_LIMIT;
  if (!raw) return DEFAULT_DAILY_LIMIT;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 100) return DEFAULT_DAILY_LIMIT;
  return n;
}

export function openaiModel() {
  const raw = process.env.OPENAI_MODEL?.trim();
  return raw || DEFAULT_MODEL;
}

/** The AI SDK reads OPENAI_API_KEY. It stays on the server. */
export function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function supportUrl() {
  return process.env.NEXT_PUBLIC_SUPPORT_URL?.trim() ?? "";
}
