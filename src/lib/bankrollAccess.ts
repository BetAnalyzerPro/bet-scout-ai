import type { DatabasePlan } from "@/config/plans";

export type BankrollFeature =
  | "register_entry"
  | "view_history"
  | "smart_risk"
  | "advanced_stats"
  | "csv_export";

type PlanTier = 0 | 1 | 2 | 3;

const PLAN_TIER: Record<DatabasePlan, PlanTier> = {
  free: 0,
  intermediate: 1,
  advanced: 2,
  elite: 3,
};

const FEATURE_MIN_TIER: Record<BankrollFeature, PlanTier> = {
  register_entry: 1,     // Basic+
  view_history: 1,       // Basic+
  smart_risk: 2,         // Pro+
  advanced_stats: 2,     // Pro+
  csv_export: 3,         // Elite
};

export function canAccessBankrollFeature(
  feature: BankrollFeature,
  plan: DatabasePlan | string,
): boolean {
  const tier = PLAN_TIER[plan as DatabasePlan] ?? 0;
  const minTier = FEATURE_MIN_TIER[feature];
  return tier >= minTier;
}

export function getBankrollTier(plan: DatabasePlan | string): "free" | "basic" | "pro" | "elite" {
  const tier = PLAN_TIER[plan as DatabasePlan] ?? 0;
  if (tier === 0) return "free";
  if (tier === 1) return "basic";
  if (tier === 2) return "pro";
  return "elite";
}
