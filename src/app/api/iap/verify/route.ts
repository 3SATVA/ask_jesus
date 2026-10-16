import { NextResponse, type NextRequest } from "next/server";
import { confirmSignedTransactions, readAppleIapConfig } from "@/lib/apple-iap";
import {
  UNLOCK_COOKIE,
  readUnlock,
  sealUnlock,
  unlockClearCookie,
  unlockMaxAgeSeconds,
  unlockSecret,
  unlockSetCookie,
} from "@/lib/unlock-cookie";

export const maxDuration = 30;

const NOT_CONFIRMED = "That purchase could not be confirmed. You can try again.";
const NOT_READY = "Purchases are not available just yet.";

export async function POST(request: NextRequest) {
  const config = readAppleIapConfig();
  const secret = unlockSecret();
  if (!config || !secret) {
    return NextResponse.json(
      { error: "not_configured", message: NOT_READY },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  let body: { signedTransactions?: unknown; replace?: unknown };
  try {
    body = (await request.json()) as { signedTransactions?: unknown; replace?: unknown };
  } catch {
    body = {};
  }

  const signedTransactions = Array.isArray(body.signedTransactions)
    ? body.signedTransactions.filter((item): item is string => typeof item === "string").slice(0, 20)
    : [];
  const replace = body.replace === true;
  const now = new Date();

  if (signedTransactions.length === 0) {
    if (!replace) {
      return NextResponse.json(
        { error: "invalid", message: NOT_CONFIRMED },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    const existing = readUnlock(request.cookies.get(UNLOCK_COOKIE)?.value, secret, now);
    if (existing?.kind === "subscription") {
      return NextResponse.json(
        { unlocked: false, unlockKind: null },
        { headers: { "Cache-Control": "no-store", "Set-Cookie": unlockClearCookie() } },
      );
    }
    return NextResponse.json(
      { unlocked: Boolean(existing), unlockKind: existing?.kind ?? null },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const result = await confirmSignedTransactions(signedTransactions, config, now);
  if (!result.ok) {
    const existing = readUnlock(request.cookies.get(UNLOCK_COOKIE)?.value, secret, now);
    if (replace && existing?.kind === "subscription") {
      return NextResponse.json(
        { error: "not_confirmed", message: NOT_CONFIRMED, unlocked: false, unlockKind: null },
        { status: 402, headers: { "Cache-Control": "no-store", "Set-Cookie": unlockClearCookie() } },
      );
    }
    return NextResponse.json(
      { error: "not_confirmed", message: NOT_CONFIRMED },
      { status: 402, headers: { "Cache-Control": "no-store" } },
    );
  }

  const payload = {
    kind: result.entitlement.kind,
    until: result.entitlement.until.toISOString(),
    transactionId: result.entitlement.transactionId,
    productId: result.entitlement.productId,
  };
  return NextResponse.json(
    {
      unlocked: true,
      unlockKind: payload.kind,
      until: payload.until,
      productId: payload.productId,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": unlockSetCookie(
          sealUnlock(payload, secret),
          unlockMaxAgeSeconds(result.entitlement.until, now),
        ),
      },
    },
  );
}
