/** Default language model. Override with AI_GATEWAY_MODEL (an ID from /v1/models). */
export const DEFAULT_MODEL = "google/gemini-3.8-flash";

export const DEFAULT_DAILY_LIMIT = 5;

export const MAX_QUESTION_LENGTH = 600;

export function dailyLimit() {
  const raw = process.env.DAILY_QUESTION_LIMIT;
  if (!raw) return DEFAULT_DAILY_LIMIT;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 100) return DEFAULT_DAILY_LIMIT;
  return n;
}

export function gatewayModel() {
  const raw = process.env.AI_GATEWAY_MODEL?.trim();
  return raw || DEFAULT_MODEL;
}

/** Local dev uses AI_GATEWAY_API_KEY. Vercel deployments can use OIDC instead. */
export function hasGatewayCredentials() {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY?.trim() ||
      process.env.VERCEL_OIDC_TOKEN?.trim(),
  );
}

export function supportUrl() {
  return process.env.NEXT_PUBLIC_SUPPORT_URL?.trim() ?? "";
}
