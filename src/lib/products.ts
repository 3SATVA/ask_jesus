/** App Store bundle id for the Capacitor shell. */
export const IOS_BUNDLE_ID = "com.starseedsquad.askjesus";

/**
 * Consumable day pass. It unlocks unlimited messages until the end of the
 * UTC day of the purchase. The price is a suggestion for App Store Connect;
 * the paywall shows the price StoreKit returns when it has one.
 */
export const DAY_PASS = {
  id: "com.starseedsquad.askjesus.unlimited.today",
  fallbackPrice: "$0.99",
  title: "Unlimited today",
  detail: "Unlimited messages until midnight UTC",
} as const;

/** Auto-renewable monthly subscription. Suggested price: $6.99 per month. */
export const MONTHLY_PRODUCT = {
  id: "com.starseedsquad.askjesus.unlimited.monthly",
  fallbackPrice: "$6.99/month",
  title: "Monthly",
  detail: "Unlimited messages, renewing every month",
} as const;

export const SUBSCRIPTION_GROUP = "Ask Jesus Unlimited";

export const PRODUCT_IDS = [DAY_PASS.id, MONTHLY_PRODUCT.id] as const;

export function isDayPass(productId: string) {
  return productId === DAY_PASS.id;
}

export function isMonthlyProduct(productId: string) {
  return productId === MONTHLY_PRODUCT.id;
}

export function isKnownProduct(productId: string) {
  return isDayPass(productId) || isMonthlyProduct(productId);
}
