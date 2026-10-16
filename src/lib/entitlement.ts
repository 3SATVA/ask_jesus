import { IOS_BUNDLE_ID, isMonthlyProduct, isTipProduct } from "./products";

/** Apple's transaction type string for a consumable. */
export const APPLE_CONSUMABLE = "Consumable";

/** Apple's transaction type string for an auto-renewable subscription. */
export const APPLE_SUBSCRIPTION = "Auto-Renewable Subscription";

/** App Store subscription status values from the App Store Server API. */
export const SUBSCRIPTION_STATUS = {
  active: 1,
  expired: 2,
  billingRetry: 3,
  gracePeriod: 4,
  revoked: 5,
} as const;

export type StoreTransaction = {
  productId: string;
  transactionId: string;
  bundleId: string;
  purchaseDateMs: number;
  expiresDateMs: number | null;
  revocationDateMs: number | null;
  type: string;
};

export type GrantedEntitlement = {
  kind: "day" | "subscription";
  until: Date;
  transactionId: string;
  productId: string;
};

/** Last millisecond of the purchase's UTC day. The free quota uses the same day. */
export function endOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999),
  );
}

export function storeTransactionFromDecoded(payload: {
  productId?: string;
  transactionId?: string;
  bundleId?: string;
  purchaseDate?: number;
  expiresDate?: number;
  revocationDate?: number;
  type?: string;
}): StoreTransaction | null {
  if (!payload.productId || !payload.transactionId || !payload.bundleId) return null;
  if (typeof payload.purchaseDate !== "number" || !Number.isFinite(payload.purchaseDate)) return null;
  return {
    productId: payload.productId,
    transactionId: payload.transactionId,
    bundleId: payload.bundleId,
    purchaseDateMs: payload.purchaseDate,
    expiresDateMs: typeof payload.expiresDate === "number" ? payload.expiresDate : null,
    revocationDateMs: typeof payload.revocationDate === "number" ? payload.revocationDate : null,
    type: payload.type ?? "",
  };
}

/**
 * A verified transaction becomes an unlock, or nothing.
 * Tips last until the end of the UTC day they were bought. The monthly
 * subscription lasts until Apple's expiry, including a grace period the
 * caller has already folded into expiresDateMs.
 */
export function entitlementForTransaction(
  transaction: StoreTransaction,
  now: Date,
  bundleId = IOS_BUNDLE_ID,
): GrantedEntitlement | null {
  if (transaction.bundleId !== bundleId) return null;
  if (!transaction.transactionId) return null;
  if (transaction.revocationDateMs != null) return null;

  if (isTipProduct(transaction.productId)) {
    if (transaction.type !== APPLE_CONSUMABLE) return null;
    const until = endOfUtcDay(new Date(transaction.purchaseDateMs));
    if (now.getTime() > until.getTime()) return null;
    return {
      kind: "day",
      until,
      transactionId: transaction.transactionId,
      productId: transaction.productId,
    };
  }

  if (isMonthlyProduct(transaction.productId)) {
    if (transaction.type !== APPLE_SUBSCRIPTION) return null;
    if (transaction.expiresDateMs == null) return null;
    const until = new Date(transaction.expiresDateMs);
    if (now.getTime() > until.getTime()) return null;
    return {
      kind: "subscription",
      until,
      transactionId: transaction.transactionId,
      productId: transaction.productId,
    };
  }

  return null;
}

/**
 * Apply App Store subscription status before granting.
 * Expired and revoked statuses grant nothing. Billing retry and grace use
 * Apple's grace-period end when it is present.
 */
export function entitlementAfterStatus(
  transaction: StoreTransaction,
  status: number | undefined,
  gracePeriodExpiresMs: number | null,
  now: Date,
  bundleId = IOS_BUNDLE_ID,
): GrantedEntitlement | null {
  if (!isMonthlyProduct(transaction.productId)) {
    return entitlementForTransaction(transaction, now, bundleId);
  }
  if (status === SUBSCRIPTION_STATUS.expired || status === SUBSCRIPTION_STATUS.revoked) {
    return null;
  }
  let next = transaction;
  if (status === SUBSCRIPTION_STATUS.gracePeriod || status === SUBSCRIPTION_STATUS.billingRetry) {
    const untilMs = gracePeriodExpiresMs ?? transaction.expiresDateMs;
    if (untilMs == null) return null;
    next = { ...transaction, expiresDateMs: untilMs, revocationDateMs: null };
  }
  return entitlementForTransaction(next, now, bundleId);
}

export function pickEntitlement(grants: GrantedEntitlement[]) {
  return grants.reduce<GrantedEntitlement | null>((best, grant) => {
    if (!best || grant.until.getTime() > best.until.getTime()) return grant;
    return best;
  }, null);
}
