/** App Store bundle id for the Capacitor shell. */
export const IOS_BUNDLE_ID = "com.starseedsquad.askjesus";

/**
 * Consumable tips. Each one unlocks unlimited messages until the end of the
 * UTC day of the purchase. Prices are suggestions for App Store Connect; the
 * paywall shows the price StoreKit returns when it has one.
 */
export const TIP_PRODUCTS = [
  {
    id: "com.starseedsquad.askjesus.tip.299",
    fallbackPrice: "$2.99",
    title: "A small gift",
    detail: "Unlimited messages for the rest of today",
  },
  {
    id: "com.starseedsquad.askjesus.tip.499",
    fallbackPrice: "$4.99",
    title: "A gift",
    detail: "Unlimited messages for the rest of today",
  },
  {
    id: "com.starseedsquad.askjesus.tip.999",
    fallbackPrice: "$9.99",
    title: "A generous gift",
    detail: "Unlimited messages for the rest of today",
  },
] as const;

/** Auto-renewable monthly subscription. Suggested price: $4.99 per month. */
export const MONTHLY_PRODUCT = {
  id: "com.starseedsquad.askjesus.unlimited.monthly",
  fallbackPrice: "$4.99/month",
  title: "Unlimited",
  detail: "Unlimited messages, renewing every month",
} as const;

export const SUBSCRIPTION_GROUP = "Ask Jesus Unlimited";

export const PRODUCT_IDS = [
  ...TIP_PRODUCTS.map((product) => product.id),
  MONTHLY_PRODUCT.id,
] as const;

export function isTipProduct(productId: string) {
  return TIP_PRODUCTS.some((product) => product.id === productId);
}

export function isMonthlyProduct(productId: string) {
  return productId === MONTHLY_PRODUCT.id;
}

export function isKnownProduct(productId: string) {
  return isTipProduct(productId) || isMonthlyProduct(productId);
}
