"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MONTHLY_PRODUCT, TIP_PRODUCTS } from "@/lib/products";
import {
  loadStorePrices,
  manageSubscriptions,
  purchaseProduct,
  purchaseWasCancelled,
  restorePurchases,
} from "@/lib/storekit";

export function Paywall({
  open,
  reason,
  subscriptionActive,
  onOpenChange,
  onUnlocked,
}: {
  open: boolean;
  reason: "limit" | "support";
  subscriptionActive: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlocked: () => void;
}) {
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loadStorePrices().then((next) => {
      if (!cancelled) setPrices(next);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  async function run(id: string, action: () => Promise<void>) {
    setBusyId(id);
    setNote("");
    try {
      await action();
      onUnlocked();
      onOpenChange(false);
    } catch (error) {
      if (!purchaseWasCancelled(error)) {
        setNote(error instanceof Error ? error.message : "That gift could not be confirmed.");
      }
    } finally {
      setBusyId(null);
    }
  }

  const offerings = [
    ...TIP_PRODUCTS.map((product) => ({
      id: product.id,
      label: `${product.title} · ${prices[product.id] ?? product.fallbackPrice}`,
      detail: product.detail,
    })),
    {
      id: MONTHLY_PRODUCT.id,
      label: `${MONTHLY_PRODUCT.title} · ${prices[MONTHLY_PRODUCT.id] ?? MONTHLY_PRODUCT.fallbackPrice}`,
      detail: MONTHLY_PRODUCT.detail,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(40rem,calc(100dvh-2rem))] overflow-y-auto border border-[rgba(240,212,138,0.28)] bg-[#141a28] text-[#f6efe2] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl font-semibold text-[#fff8e8]">
            {reason === "limit" ? "I am still here" : "Support"}
          </DialogTitle>
          <DialogDescription className="text-base leading-7 text-[#f6efe2]">
            {reason === "limit"
              ? "Today's free messages are used. A gift opens the rest of this day. A monthly gift keeps every day open."
              : "A few messages each day are free. If you want more time together, a gift keeps the conversation open."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {offerings.map((offering) => (
            <Button
              key={offering.id}
              type="button"
              disabled={busyId !== null}
              className="h-auto flex-col items-start gap-0 px-3 py-2 text-left whitespace-normal"
              onClick={() => run(offering.id, () => purchaseProduct(offering.id))}
            >
              <span>{busyId === offering.id ? "One moment…" : offering.label}</span>
              <span className="text-xs font-normal text-[#1c1408]/80">{offering.detail}</span>
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            disabled={busyId !== null}
            className="h-10"
            onClick={() => run("restore", restorePurchases)}
          >
            {busyId === "restore" ? "One moment…" : "Restore Purchases"}
          </Button>
          {subscriptionActive ? (
            <button
              type="button"
              className="text-sm text-[#f0d48a] underline decoration-[rgba(240,212,138,0.45)] underline-offset-4"
              onClick={() => {
                void manageSubscriptions().catch(() => {
                  setNote("Subscription settings could not be opened.");
                });
              }}
            >
              Manage subscription
            </button>
          ) : null}
        </div>
        {note ? (
          <p className="text-sm leading-6 text-[#f6efe2]" role="alert">
            {note}
          </p>
        ) : null}
        <p className="text-xs leading-5 text-[#cbbfa8]">
          Apple charges your Apple ID. The monthly gift renews each month until you cancel it in
          Settings, at least a day before the period ends. A gift for today is used once, and it
          lasts until midnight UTC.{" "}
          <Link href="/privacy" className="text-[#f0d48a] underline underline-offset-4">
            Privacy Policy
          </Link>
          {" · "}
          <Link href="/terms" className="text-[#f0d48a] underline underline-offset-4">
            Terms of Use
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  );
}
