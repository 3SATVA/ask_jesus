"use client";

import { DAY_PASS, MONTHLY_PRODUCT, PRODUCT_IDS, isMonthlyProduct } from "@/lib/products";

export type UnlockKind = "day" | "subscription";

async function nativePurchases() {
  const { NativePurchases, PURCHASE_TYPE } = await import("@capgo/native-purchases");
  return { NativePurchases, PURCHASE_TYPE };
}

export async function isIosNative() {
  if (typeof window === "undefined") return false;
  const { Capacitor } = await import("@capacitor/core");
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
}

function signedFrom(purchases: { jwsRepresentation?: string }[]) {
  return purchases
    .map((purchase) => purchase.jwsRepresentation)
    .filter((signed): signed is string => Boolean(signed));
}

export async function postSignedTransactions(signedTransactions: string[], replace = false) {
  const response = await fetch("/api/iap/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signedTransactions, replace }),
  });
  const data = (await response.json().catch(() => null)) as { message?: string; unlocked?: boolean } | null;
  if (!response.ok) {
    throw new Error(data?.message || "That purchase could not be confirmed.");
  }
  return data;
}

export async function loadStorePrices() {
  const prices: Record<string, string> = {};
  try {
    const { NativePurchases, PURCHASE_TYPE } = await nativePurchases();
    const dayPass = await NativePurchases.getProducts({
      productIdentifiers: [DAY_PASS.id],
      productType: PURCHASE_TYPE.INAPP,
    });
    const monthly = await NativePurchases.getProducts({
      productIdentifiers: [MONTHLY_PRODUCT.id],
      productType: PURCHASE_TYPE.SUBS,
    });
    for (const product of [...dayPass.products, ...monthly.products]) {
      if (product.identifier && product.priceString) prices[product.identifier] = product.priceString;
    }
  } catch {
    // StoreKit prices are optional. The buttons keep the suggested prices.
  }
  return prices;
}

async function finishTransaction(transactionId: string) {
  const { NativePurchases } = await nativePurchases();
  await NativePurchases.acknowledgePurchase({ purchaseToken: transactionId });
}

export async function purchaseProduct(productId: string) {
  if (!PRODUCT_IDS.includes(productId as (typeof PRODUCT_IDS)[number])) {
    throw new Error("That purchase is not available.");
  }
  const { NativePurchases, PURCHASE_TYPE } = await nativePurchases();
  const billing = await NativePurchases.isBillingSupported();
  if (!billing.isBillingSupported) throw new Error("Purchases are not available on this device.");
  await NativePurchases.configure({ autoFinishTransactions: false });
  const transaction = await NativePurchases.purchaseProduct({
    productIdentifier: productId,
    productType: isMonthlyProduct(productId) ? PURCHASE_TYPE.SUBS : PURCHASE_TYPE.INAPP,
    quantity: 1,
    autoAcknowledgePurchases: false,
  });
  if (!transaction.jwsRepresentation) {
    throw new Error("Apple did not return a signed transaction.");
  }
  await postSignedTransactions([transaction.jwsRepresentation], false);
  if (transaction.transactionId) await finishTransaction(transaction.transactionId);
}

export async function restorePurchases() {
  const { NativePurchases, PURCHASE_TYPE } = await nativePurchases();
  await NativePurchases.configure({ autoFinishTransactions: false });
  await NativePurchases.restorePurchases();
  const subscriptions = await NativePurchases.getPurchases({
    productType: PURCHASE_TYPE.SUBS,
    onlyCurrentEntitlements: true,
  });
  const inApp = await NativePurchases.getPurchases({
    productType: PURCHASE_TYPE.INAPP,
    onlyCurrentEntitlements: true,
  });
  const signed = signedFrom([...subscriptions.purchases, ...inApp.purchases]);
  if (signed.length === 0) {
    const data = await postSignedTransactions([], true);
    if (data?.unlocked) return;
    throw new Error("Nothing active to restore. Unlimited today lasts until the day ends.");
  }
  await postSignedTransactions(signed, true);
}

/** Refresh a subscription the device already has. A finished tip stays on its cookie. */
export async function refreshIosEntitlement(unlockKind: UnlockKind | null) {
  const { NativePurchases, PURCHASE_TYPE } = await nativePurchases();
  await NativePurchases.configure({ autoFinishTransactions: false });
  const subscriptions = await NativePurchases.getPurchases({
    productType: PURCHASE_TYPE.SUBS,
    onlyCurrentEntitlements: true,
  });
  const inApp = await NativePurchases.getPurchases({
    productType: PURCHASE_TYPE.INAPP,
    onlyCurrentEntitlements: true,
  });
  const signed = signedFrom([...subscriptions.purchases, ...inApp.purchases]);
  if (signed.length > 0) {
    await postSignedTransactions(signed, false);
    return;
  }
  if (unlockKind === "subscription") await postSignedTransactions([], true);
}

export async function listenForUnfinishedTransactions(onGranted: () => void) {
  const { NativePurchases } = await nativePurchases();
  await NativePurchases.configure({ autoFinishTransactions: false });
  return NativePurchases.addListener("transactionUpdated", async (transaction) => {
    if (!transaction.jwsRepresentation) return;
    try {
      await postSignedTransactions([transaction.jwsRepresentation], false);
      if (transaction.transactionId) await finishTransaction(transaction.transactionId);
      onGranted();
    } catch {
      // Leave the transaction unfinished so a later launch can try again.
    }
  });
}

export async function manageSubscriptions() {
  const { NativePurchases } = await nativePurchases();
  await NativePurchases.manageSubscriptions();
}

export function purchaseWasCancelled(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /cancel/i.test(message);
}
