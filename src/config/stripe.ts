// Stripe Price IDs mapped to plan keys
// These are the actual Stripe price IDs from the connected account

export const STRIPE_PRICES = {
  basic: {
    priceId: "price_1T0XphRwAhX06SSdYKwWEfKv",
    productId: "prod_TyUpjaqtvGjH8X",
    amount: 3700, // R$ 37,00 in centavos
    planKey: "basic",
    dbPlan: "intermediate", // Database enum value
  },
  pro: {
    priceId: "price_1T0XpxRwAhX06SSd7YZZsMea",
    productId: "prod_TyUpkc1WKLaQUq",
    amount: 9700, // R$ 97,00 in centavos
    planKey: "pro",
    dbPlan: "advanced", // Database enum value
  },
  elite: {
    priceId: "price_1T0XqFRwAhX06SSdVFjpWbnI",
    productId: "prod_TyUpz2QkrZxRnd",
    amount: 19700, // R$ 197,00 in centavos
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
