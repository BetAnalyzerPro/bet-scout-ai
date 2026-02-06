// Stripe Price IDs mapped to plan keys
// These are the actual Stripe price IDs from the connected account

export const STRIPE_PRICES = {
  basic: {
    priceId: "price_1Sxe4kRwAhX06SSdjtd46Hiu",
    productId: "prod_TvV4mUHQqbMBG4",
    amount: 4990, // R$ 49,90 in centavos
    planKey: "basic",
    dbPlan: "intermediate", // Database enum value
  },
  pro: {
    priceId: "price_1Sxe5JRwAhX06SSd1xJqgQZg",
    productId: "prod_TvV5jk5hUrGLnH",
    amount: 11990, // R$ 119,90 in centavos
    planKey: "pro",
    dbPlan: "advanced", // Database enum value
  },
  elite: {
    priceId: "price_1Sxe5tRwAhX06SSdxzdFb1Bh",
    productId: "prod_TvV6VYdHaXgKq1",
    amount: 24990, // R$ 249,90 in centavos
    planKey: "elite",
    dbPlan: "elite", // Database enum value
  },
} as const;

export type StripePlanKey = keyof typeof STRIPE_PRICES;

// Helper function to get stripe price config from plan key
export function getStripePrice(planKey: string) {
  return STRIPE_PRICES[planKey as StripePlanKey] || null;
}

// Helper function to get plan key from price ID
export function getPlanKeyFromPriceId(priceId: string): string | null {
  const entry = Object.entries(STRIPE_PRICES).find(
    ([, config]) => config.priceId === priceId
  );
  return entry ? entry[0] : null;
}
