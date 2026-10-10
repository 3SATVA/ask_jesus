"use client";

import { useState } from "react";
import { Copy, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReplyText } from "@/components/reply-text";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DISCLAIMER } from "@/lib/messages";
import { replyToPlainText } from "@/lib/scripture";

function shareText(question: string, answer: string) {
  return `ASK JESUS\n\n${question}\n\n${replyToPlainText(answer)}\n\n${DISCLAIMER}`;
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
) {
  const paragraphs = text.split(/\n+/);
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > maxWidth && line) {
        lines.push(line);
        line = word;
        if (lines.length >= maxLines) return trimLines(lines, maxLines);
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    if (lines.length >= maxLines) return trimLines(lines, maxLines);
    lines.push("");
  }

  return trimLines(lines.filter((line, index, all) => line !== "" || all[index + 1] !== ""), maxLines);
}

function trimLines(lines: string[], maxLines: number) {
  const trimmed = lines.slice(0, maxLines);
  if (lines.length > maxLines && trimmed.length > 0) {
    const last = trimmed[trimmed.length - 1] ?? "";
    trimmed[trimmed.length - 1] = last.replace(/[.,;:\s]+$/, "") + "…";
  }
  return trimmed;
}

async function renderCard(question: string, answer: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1440;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");

  await document.fonts.ready;
  const display =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--font-display")
      .trim() || "Georgia, serif";
  const sans =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--font-sans")
      .trim() || "sans-serif";

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#1a2744");
  sky.addColorStop(0.45, "#0c1220");
  sky.addColorStop(1, "#07090f");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glow = ctx.createRadialGradient(540, 280, 20, 540, 320, 420);
  glow.addColorStop(0, "rgba(240, 212, 138, 0.38)");
  glow.addColorStop(1, "rgba(240, 212, 138, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(240, 212, 138, 0.7)";
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

  ctx.fillStyle = "#f0d48a";
  ctx.font = `600 72px ${display}`;
  ctx.textAlign = "center";
  ctx.fillText("ASK JESUS", 540, 180);

  ctx.strokeStyle = "rgba(240, 212, 138, 0.45)";
  ctx.beginPath();
  ctx.moveTo(390, 220);
  ctx.lineTo(690, 220);
  ctx.stroke();

  ctx.fillStyle = "#f7f1e4";
  ctx.font = `italic 500 40px ${display}`;
  const questionLines = wrapLines(ctx, question, 860, 4);
  let y = 300;
  for (const line of questionLines) {
    ctx.fillText(line, 540, y);
    y += 52;
  }

  y += 24;
  ctx.textAlign = "left";
  ctx.fillStyle = "#f6efe2";
  ctx.font = `500 36px ${display}`;
  const answerLines = wrapLines(ctx, replyToPlainText(answer), 860, 16);
  for (const line of answerLines) {
    if (!line) {
      y += 18;
      continue;
    }
    ctx.fillText(line, 110, y);
    y += 50;
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#cbbfa8";
  ctx.font = `400 24px ${sans}`;
  const note = wrapLines(ctx, DISCLAIMER, 820, 2);
  let noteY = 1320;
  for (const line of note) {
    ctx.fillText(line, 540, noteY);
    noteY += 34;
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Could not draw the card.");
  return blob;
}

export function ShareCard({
  question,
  answer,
  open,
  onOpenChange,
}: {
  question: string;
  answer: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(shareText(question, answer));
      setNotice("Copied.");
    } catch {
      setNotice("Copy was blocked by the browser.");
    }
  }

  async function onDownload() {
    setBusy(true);
    setNotice("");
    try {
      const blob = await renderCard(question, answer);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ask-jesus.png";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setNotice("The card could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function onShare() {
    setBusy(true);
    setNotice("");
    try {
      const text = shareText(question, answer);
      if (typeof navigator.share === "function") {
        const blob = await renderCard(question, answer);
        const file = new File([blob], "ask-jesus.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title: "ASK JESUS", text, files: [file] });
        } else {
          await navigator.share({ title: "ASK JESUS", text });
        }
      } else {
        await navigator.clipboard.writeText(text);
        setNotice("Sharing isn’t available here. The words were copied instead.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setNotice("Sharing didn’t finish. You can still copy or download.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90dvh,860px)] overflow-y-auto border border-[rgba(240,212,138,0.35)] bg-[#121826] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-[0.18em] text-[#f0d48a]">
            Share this answer
          </DialogTitle>
          <DialogDescription className="text-[#cbbfa8]">
            A card you can send on, with the question and the reply.
          </DialogDescription>
        </DialogHeader>

        <article className="rounded-2xl border border-[rgba(240,212,138,0.35)] bg-[radial-gradient(circle_at_top,rgba(240,212,138,0.18),transparent_42%),linear-gradient(180deg,#1a2744,#0c1220)] px-5 py-6 text-center">
          <p className="font-display text-2xl tracking-[0.22em] text-[#f0d48a]">
            ASK JESUS
          </p>
          <p className="mt-4 font-display text-lg italic leading-snug text-[#f7f1e4]">
            {question}
          </p>
          <div className="mt-4 text-left font-display text-base leading-7 text-[#f6efe2]">
            <ReplyText text={answer} />
          </div>
          <p className="mt-5 text-xs leading-5 text-[#cbbfa8]">{DISCLAIMER}</p>
        </article>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" className="flex-1" onClick={onCopy}>
            <Copy />
            Copy
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={busy}
            onClick={onDownload}
          >
            <Download />
            Download
          </Button>
          <Button type="button" className="flex-1" disabled={busy} onClick={onShare}>
            <Share2 />
            Share
          </Button>
        </div>
        {notice ? (
          <p className="text-center text-sm text-[#f0d48a]" role="status">
            {notice}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
