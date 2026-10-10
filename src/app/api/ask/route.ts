import { openai } from "@ai-sdk/openai";
import { createTextStreamResponse, streamText, type ModelMessage } from "ai";
import { NextResponse, type NextRequest } from "next/server";
import {
  INVALID_MESSAGE,
  LIMIT_MESSAGE,
  MISSING_KEY_MESSAGE,
  UPSTREAM_MESSAGE,
  decideAsk,
} from "@/lib/ask";
import { normalizeConversation } from "@/lib/conversation";
import { crisisMessage } from "@/lib/crisis";
import {
  dailyLimit,
  hasOpenAIKey,
  openaiModel,
  supportUrl,
} from "@/lib/config";
import { loadJesusPrompt } from "@/lib/prompt";
import { QUOTA_COOKIE, parseQuota, quotaSetCookie } from "@/lib/quota";

export const maxDuration = 60;

function quotaPayload(used: number) {
  const limit = dailyLimit();
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    supportUrl: supportUrl(),
  };
}

export async function GET(request: NextRequest) {
  const used = parseQuota(request.cookies.get(QUOTA_COOKIE)?.value);
  return NextResponse.json(quotaPayload(used), {
    headers: { "Cache-Control": "no-store" },
  });
}

function jsonError(
  status: number,
  error: "invalid" | "limit" | "missing_key" | "upstream",
  message: string,
  used: number,
) {
  return NextResponse.json(
    { error, message, ...quotaPayload(used) },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function textStream(text: string, headers?: HeadersInit) {
  const stream = new ReadableStream<string>({
    async start(controller) {
      const parts = text.split(/(\s+)/);
      for (const part of parts) {
        controller.enqueue(part);
        await new Promise((resolve) => setTimeout(resolve, 14));
      }
      controller.close();
    },
  });

  return createTextStreamResponse({
    stream,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const conversation = normalizeConversation(body);
  const question = conversation?.question ?? null;
  const used = parseQuota(request.cookies.get(QUOTA_COOKIE)?.value);
  const limit = dailyLimit();
  const decision = decideAsk({
    question,
    used,
    limit,
    hasKey: hasOpenAIKey(),
  });

  if (decision.type === "invalid") {
    return jsonError(400, "invalid", INVALID_MESSAGE, used);
  }

  if (decision.type === "crisis") {
    return textStream(crisisMessage(decision.kind), {
      "X-Questions-Remaining": String(Math.max(0, limit - used)),
    });
  }

  if (decision.type === "limit") {
    return jsonError(429, "limit", LIMIT_MESSAGE, used);
  }

  if (decision.type === "missing_key") {
    return jsonError(503, "missing_key", MISSING_KEY_MESSAGE, used);
  }

  if (!conversation) {
    return jsonError(400, "invalid", INVALID_MESSAGE, used);
  }

  const nextUsed = used + 1;
  const messages: ModelMessage[] = [
    ...conversation.history,
    { role: "user", content: conversation.question },
  ];
  const result = streamText({
    model: openai(openaiModel()),
    instructions: loadJesusPrompt(),
    messages,
    maxOutputTokens: 420,
    providerOptions: {
      openai: { reasoningEffort: "low" },
    },
    maxRetries: 1,
    abortSignal: request.signal,
    onError({ error }) {
      const message = error instanceof Error ? error.message : "unknown error";
      console.error("ASK JESUS model error:", message);
    },
  });

  let sawText = false;
  let failed = false;
  const stream = new ReadableStream<string>({
    async start(controller) {
      const reader = result.stream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value.type === "text-delta") {
            sawText = true;
            controller.enqueue(value.text);
          } else if (value.type === "error") {
            failed = true;
            break;
          }
        }
      } catch (error) {
        failed = true;
        const message = error instanceof Error ? error.message : "unknown error";
        console.error("ASK JESUS stream error:", message);
      } finally {
        try {
          if (!sawText) controller.enqueue(UPSTREAM_MESSAGE);
          else if (failed) controller.enqueue(`\n\n${UPSTREAM_MESSAGE}`);
        } catch {
          // The client may already have gone.
        }
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return createTextStreamResponse({
    stream,
    headers: {
      "Cache-Control": "no-store",
      "Set-Cookie": quotaSetCookie(nextUsed),
      "X-Questions-Remaining": String(Math.max(0, limit - nextUsed)),
    },
  });
}
