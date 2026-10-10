"use client";

import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import Link from "next/link";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShareCard } from "@/components/share-card";
import { LIMIT_MESSAGE } from "@/lib/messages";

type AskError = "invalid" | "limit" | "missing_key" | "upstream" | "network";

const DISCLAIMER =
  "Answers are an AI interpretation inspired by the Gospels, not scripture.";

function remainingLabel(remaining: number | null, limit: number) {
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
  const [asked, setAsked] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"idle" | "streaming" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<AskError | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState(initialLimit);
  const [shareOpen, setShareOpen] = useState(false);
  const [supportNote, setSupportNote] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ask")
      .then((response) => response.json())
      .then((data: { remaining?: number; limit?: number }) => {
        if (cancelled) return;
        if (typeof data.remaining === "number") setRemaining(data.remaining);
        if (typeof data.limit === "number") setLimit(data.limit);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const streaming = status === "streaming";
  const atLimit = remaining === 0;
  const canAsk = question.trim().length >= 2 && !streaming && !atLimit;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuestion = question.trim();
    if (nextQuestion.length < 2 || streaming || atLimit) return;

    setAsked(nextQuestion);
    setAnswer("");
    setError("");
    setErrorCode(null);
    setStatus("streaming");
    setShareOpen(false);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: nextQuestion }),
      });

      const remainingHeader = response.headers.get("x-questions-remaining");
      if (remainingHeader != null && remainingHeader !== "") {
        const nextRemaining = Number(remainingHeader);
        if (Number.isInteger(nextRemaining)) setRemaining(nextRemaining);
      }

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: AskError;
          message?: string;
        } | null;
        setStatus("error");
        setErrorCode(data?.error ?? "upstream");
        setError(data?.message ?? "Something went quiet. Please try again.");
        if (data?.error === "limit") setRemaining(0);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setStatus("error");
        setErrorCode("upstream");
        setError("The answer did not come through. Please try again.");
        return;
      }

      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setAnswer(full);
      }
      full += decoder.decode();
      setAnswer(full);
      setStatus(full.trim() ? "done" : "error");
      if (!full.trim()) {
        setErrorCode("upstream");
        setError("The answer did not come through. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorCode("network");
      setError("The connection stopped. Please try again.");
    }
  }

  function onSupportClick(event: MouseEvent<HTMLAnchorElement>) {
    if (supportUrl) return;
    event.preventDefault();
    setSupportNote(true);
  }

  return (
    <div className="flex flex-1 flex-col pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <form onSubmit={onSubmit} className="glass-panel mt-14 rounded-3xl p-4 sm:p-5">
        <label htmlFor="question" className="sr-only">
          Your question
        </label>
        <Textarea
          id="question"
          name="question"
          value={question}
          maxLength={600}
          placeholder="What is on your heart?"
          disabled={streaming || atLimit}
          className="min-h-24 resize-none border-[rgba(240,212,138,0.28)] bg-black/25 px-3 py-3 text-base text-[#f6efe2] placeholder:text-[#cbbfa8]/80 md:text-base"
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs tracking-wide text-[#cbbfa8]">
            {remainingLabel(remaining, limit)}
          </p>
          <Button
            type="submit"
            disabled={!canAsk}
            className="h-11 px-6 text-base sm:min-w-28"
          >
            {streaming ? "Listening…" : "Ask"}
          </Button>
        </div>

        {streaming && !answer ? (
          <p className="mt-5 font-display text-lg text-[#f0d48a] italic">Listening…</p>
        ) : null}

        {asked && (answer || status === "error") ? (
          <div className="mt-5 border-t border-[rgba(240,212,138,0.2)] pt-4" aria-live="polite">
            <p className="font-display text-base text-[#f0d48a] italic">{asked}</p>
            {answer ? (
              <p className="mt-3 font-display text-lg leading-8 whitespace-pre-wrap text-[#f7f1e4]">
                {answer}
                {streaming ? <span className="caret" aria-hidden="true" /> : null}
              </p>
            ) : null}
            {error ? (
              <p className="mt-3 text-sm leading-6 text-[#f6efe2]" role="alert">
                {error}
              </p>
            ) : null}
            {status === "done" && answer ? (
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => setShareOpen(true)}
              >
                <Share2 />
                Share this answer
              </Button>
            ) : null}
          </div>
        ) : null}

        {atLimit && status !== "streaming" ? (
          <p className="mt-4 text-sm leading-6 text-[#f7f1e4]" role="status">
            {LIMIT_MESSAGE}
          </p>
        ) : null}

        {(errorCode === "limit" || atLimit) && (
          <SupportLink
            supportUrl={supportUrl}
            supportNote={supportNote}
            onSupportClick={onSupportClick}
            emphasized
          />
        )}
      </form>

      <footer className="mx-auto mt-5 flex w-full max-w-md flex-col items-center gap-3 text-center">
        <p className="text-xs leading-5 text-[#f6efe2]/80">{DISCLAIMER}</p>
        <div className="flex items-center gap-4">
          <Link
            href="/about"
            className="text-xs tracking-[0.16em] text-[#cbbfa8]/80 uppercase hover:text-[#f0d48a]"
          >
            About
          </Link>
          {errorCode !== "limit" && !atLimit ? (
          <SupportLink
            supportUrl={supportUrl}
            supportNote={supportNote}
            onSupportClick={onSupportClick}
          />
          ) : null}
        </div>
      </footer>

      <ShareCard
        question={asked}
        answer={answer}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </div>
  );
}

function SupportLink({
  supportUrl,
  supportNote,
  onSupportClick,
  emphasized = false,
}: {
  supportUrl: string;
  supportNote: boolean;
  onSupportClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  emphasized?: boolean;
}) {
  return (
    <div className={emphasized ? "mt-3 text-center" : ""}>
      <a
        href={supportUrl || "#support"}
        onClick={onSupportClick}
        target={supportUrl ? "_blank" : undefined}
        rel={supportUrl ? "noopener noreferrer" : undefined}
        className="text-sm text-[#f0d48a] underline decoration-[rgba(240,212,138,0.45)] underline-offset-4"
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
