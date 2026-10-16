"use client";

import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paywall } from "@/components/paywall";
import { ReplyText } from "@/components/reply-text";
import { LIMIT_MESSAGE } from "@/lib/messages";
import {
  isIosNative,
  listenForUnfinishedTransactions,
  refreshIosEntitlement,
  type UnlockKind,
} from "@/lib/storekit";

type AskError = "invalid" | "limit" | "missing_key" | "upstream" | "network";

type ChatMessage = {
  id: string;
  role: "user" | "jesus";
  text: string;
};

const STORAGE_KEY = "ask_jesus_conversation";
const OPENING_TEXT = "My child, tell me what is on your mind?";

function openingMessage(): ChatMessage {
  return { id: "opening", role: "jesus", text: OPENING_TEXT };
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as ChatMessage;
  return (
    typeof message.id === "string" &&
    (message.role === "user" || message.role === "jesus") &&
    typeof message.text === "string"
  );
}

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data
      .filter(isChatMessage)
      .filter((message) => message.role === "user" || message.text.trim())
      .slice(-40);
  } catch {
    return [];
  }
}

function remainingLabel(
  remaining: number | null,
  limit: number,
  unlockKind: UnlockKind | null,
) {
  if (unlockKind === "subscription") return "Unlimited this month";
  if (unlockKind === "day") return "Unlimited for the rest of today";
  if (remaining == null) return "A few quiet questions, each day.";
  if (remaining === 1) return "1 question left today";
  return `${remaining} of ${limit} questions left today`;
}

export function AskPanel({
  supportUrl,
  initialLimit,
}: {
  supportUrl: string;
  initialLimit: number;
}) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [openingMessage()]);
  const [hydrated, setHydrated] = useState(false);
  const [status, setStatus] = useState<"idle" | "streaming" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState(initialLimit);
  const [unlockKind, setUnlockKind] = useState<UnlockKind | null>(null);
  const [platform, setPlatform] = useState<"unknown" | "ios" | "web">("unknown");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<"limit" | "support">("support");
  const [supportNote, setSupportNote] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  function applyQuota(data: {
    remaining?: number;
    limit?: number;
    unlocked?: boolean;
    unlockKind?: UnlockKind | null;
  }) {
    if (typeof data.remaining === "number") setRemaining(data.remaining);
    if (typeof data.limit === "number") setLimit(data.limit);
    if (typeof data.unlocked === "boolean") {
      setUnlockKind(data.unlocked ? data.unlockKind ?? "day" : null);
    }
  }

  function reloadQuota() {
    return fetch("/api/ask")
      .then((response) => response.json())
      .then((data: { remaining?: number; limit?: number; unlocked?: boolean; unlockKind?: UnlockKind | null }) => {
        applyQuota(data);
        return data.unlockKind ?? null;
      });
  }

  useEffect(() => {
    const stored = loadMessages();
    setMessages(stored.length > 0 ? stored : [openingMessage()]);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [hydrated, messages]);

  useEffect(() => {
    reloadQuota().catch(() => {});
    // Quota is loaded once when the screen opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    let removeListener = () => {};
    (async () => {
      if (
        process.env.NODE_ENV === "development" &&
        new URLSearchParams(window.location.search).get("preview") === "paywall"
      ) {
        setPlatform("ios");
        setRemaining(0);
        setUnlockKind(null);
        setPaywallReason("limit");
        setPaywallOpen(true);
        return;
      }
      const ios = await isIosNative();
      if (cancelled) return;
      setPlatform(ios ? "ios" : "web");
      if (!ios) return;
      try {
        const quota = await fetch("/api/ask").then((response) => response.json());
        if (cancelled) return;
        applyQuota(quota);
        await refreshIosEntitlement(
          quota.unlockKind === "subscription" ? "subscription" : quota.unlockKind === "day" ? "day" : null,
        );
        if (!cancelled) await reloadQuota();
        const handle = await listenForUnfinishedTransactions(() => {
          void reloadQuota();
        });
        removeListener = () => {
          void handle.remove();
        };
      } catch {
        // A failed refresh leaves the free quota in place.
      }
    })();
    return () => {
      cancelled = true;
      removeListener();
    };
    // The native bridge is checked once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    log.scrollTop = log.scrollHeight;
  }, [messages, status, error]);

  const streaming = status === "streaming";
  const iosApp = platform === "ios";
  const atLimit = remaining === 0 && !unlockKind;
  const canAsk = question.trim().length >= 2 && !streaming && !atLimit;
  const hasConversation = messages.some((message) => message.text.trim());

  useEffect(() => {
    if (iosApp && atLimit && !streaming) {
      setPaywallReason("limit");
      setPaywallOpen(true);
    }
  }, [iosApp, atLimit, streaming]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuestion = question.trim();
    if (nextQuestion.length < 2 || streaming || atLimit) return;

    const history = messages
      .filter((message) => message.text.trim())
      .map((message) => ({
        role: message.role === "jesus" ? ("assistant" as const) : ("user" as const),
        content: message.text,
      }));
    const userId = crypto.randomUUID();
    const jesusId = crypto.randomUUID();

    setMessages((current) => [
      ...current,
      { id: userId, role: "user", text: nextQuestion },
      { id: jesusId, role: "jesus", text: "" },
    ]);
    setQuestion("");
    setError("");
    setStatus("streaming");

    const rollback = (message: string, code: AskError) => {
      setMessages((current) => current.filter((item) => item.id !== jesusId && item.id !== userId));
      setQuestion(nextQuestion);
      setStatus("error");
      setError(message);
      if (code === "limit") setRemaining(0);
    };

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: nextQuestion }],
        }),
      });

      const remainingHeader = response.headers.get("x-questions-remaining");
      if (remainingHeader != null && remainingHeader !== "") {
        const nextRemaining = Number(remainingHeader);
        if (Number.isInteger(nextRemaining)) setRemaining(nextRemaining);
      }
      const unlockedHeader = response.headers.get("x-questions-unlocked");
      if (unlockedHeader === "0") setUnlockKind(null);

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: AskError;
          message?: string;
          remaining?: number;
          unlocked?: boolean;
          unlockKind?: UnlockKind | null;
        } | null;
        if (typeof data?.remaining === "number") setRemaining(data.remaining);
        if (typeof data?.unlocked === "boolean") {
          setUnlockKind(data.unlocked ? data.unlockKind ?? "day" : null);
        }
        rollback(
          data?.message ?? "Something went quiet. Please try again.",
          data?.error ?? "upstream",
        );
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        rollback("The answer did not come through. Please try again.", "upstream");
        return;
      }

      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        const next = full;
        setMessages((current) =>
          current.map((item) => (item.id === jesusId ? { ...item, text: next } : item)),
        );
      }
      full += decoder.decode();
      if (!full.trim()) {
        rollback("The answer did not come through. Please try again.", "upstream");
        return;
      }
      setMessages((current) =>
        current.map((item) => (item.id === jesusId ? { ...item, text: full } : item)),
      );
      setStatus("done");
    } catch {
      rollback("The connection stopped. Please try again.", "network");
    }
  }

  function startFresh() {
    if (streaming) return;
    setMessages([openingMessage()]);
    setQuestion("");
    setError("");
    setStatus("idle");
  }

  function onSupportClick(event: MouseEvent<HTMLAnchorElement>) {
    if (supportUrl) return;
    event.preventDefault();
    setSupportNote(true);
  }

  return (
    <div className="chat-column flex min-h-0 w-full flex-col px-3">
      <div
        ref={logRef}
        className="chat-log min-h-0 overflow-y-auto"
        role="log"
        aria-label="Conversation"
        aria-busy={streaming}
      >
        <div className="flex flex-col gap-3">
          {messages.map((message, index) => {
            if (message.role === "jesus" && !message.text && status !== "streaming") return null;
            const mine = message.role === "user";
            const isStreaming = streaming && index === messages.length - 1 && !mine;
            return (
              <div key={message.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                <div className={mine ? "chat-bubble chat-bubble-user" : "chat-bubble chat-bubble-jesus"}>
                  <span className="sr-only">{mine ? "You" : "Jesus"}</span>
                  {mine ? (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  ) : (
                    <ReplyText text={message.text} streaming={isStreaming} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="composer pointer-events-auto flex shrink-0 flex-col pb-[max(0.6rem,env(safe-area-inset-bottom))]">
        {error ? (
          <p className="mb-2 px-1 text-sm leading-6 text-[#f6efe2]" role="alert">
            {error}
          </p>
        ) : null}
        {atLimit && !streaming && !iosApp ? (
          <p className="mb-2 px-1 text-sm leading-6 text-[#f7f1e4]" role="status">
            {LIMIT_MESSAGE}
          </p>
        ) : null}

        <form onSubmit={onSubmit} className="prompt-shell rounded-[1.15rem] px-4 py-2.5 sm:px-5 sm:py-3">
          <div className="flex items-center gap-2">
            <label htmlFor="question" className="sr-only">
              Your message
            </label>
            <Textarea
              id="question"
              name="question"
              value={question}
              rows={1}
              maxLength={600}
              disabled={streaming || atLimit}
              className="prompt-input max-h-24 min-h-0 flex-1 resize-none border-0 bg-transparent px-1 py-1 text-[16px] text-[#f4f7fb] shadow-none placeholder:text-[#b7c0ca] focus-visible:ring-0 md:text-[16px]"
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <Button
              type="submit"
              disabled={!canAsk}
              className="h-9 shrink-0 px-3"
            >
              {streaming ? "Listening…" : "Ask"}
            </Button>
          </div>
        </form>

        <footer className="composer-footer mt-2 flex flex-col items-center gap-1 px-2 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-white/75">
            <span className="drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)]">
              {remainingLabel(remaining, limit, unlockKind)}
            </span>
            {hasConversation ? (
              <button
                type="button"
                onClick={startFresh}
                disabled={streaming}
                className="tracking-[0.14em] uppercase drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)] hover:text-white disabled:opacity-50"
              >
                New conversation
              </button>
            ) : null}
            <Link
              href="/about"
              className="tracking-[0.14em] uppercase drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)] hover:text-white"
            >
              About
            </Link>
            {iosApp ? (
              <button
                type="button"
                onClick={() => {
                  setPaywallReason(atLimit ? "limit" : "support");
                  setPaywallOpen(true);
                }}
                className="tracking-[0.14em] uppercase drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)] hover:text-white"
              >
                Support
              </button>
            ) : platform === "web" ? (
              <SupportLink
                supportUrl={supportUrl}
                supportNote={supportNote}
                onSupportClick={onSupportClick}
              />
            ) : (
              <span className="tracking-[0.14em] uppercase opacity-0">Support</span>
            )}
          </div>
        </footer>
      </div>
      {iosApp ? (
        <Paywall
          open={paywallOpen}
          reason={paywallReason}
          subscriptionActive={unlockKind === "subscription"}
          onOpenChange={setPaywallOpen}
          onUnlocked={() => {
            void reloadQuota();
          }}
        />
      ) : null}
    </div>
  );
}

function SupportLink({
  supportUrl,
  supportNote,
  onSupportClick,
}: {
  supportUrl: string;
  supportNote: boolean;
  onSupportClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <div>
      <a
        href={supportUrl || "#support"}
        onClick={onSupportClick}
        target={supportUrl ? "_blank" : undefined}
        rel={supportUrl ? "noopener noreferrer" : undefined}
        className="drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)] hover:text-white"
      >
        Support this ministry
      </a>
      {supportNote ? (
        <p className="mt-2 text-xs leading-5 text-[#cbbfa8]">
          A giving page can be connected with NEXT_PUBLIC_SUPPORT_URL.
        </p>
      ) : null}
    </div>
  );
}
