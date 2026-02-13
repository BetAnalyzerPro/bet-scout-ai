import type { DatabasePlan } from "@/config/plans";

export type LearningFeature =
  | "register_result"
  | "view_history"
  | "full_history"
  | "detected_patterns"
  | "emotional_tendency"
  | "behavior_suggestions"
  | "monthly_evolution"
  | "comparative_report"
  | "export_learning_data"
  | "consistency_analysis";

type PlanTier = 0 | 1 | 2 | 3;

const PLAN_TIER: Record<DatabasePlan, PlanTier> = {
  free: 0,
  intermediate: 1,
  advanced: 2,
  elite: 3,
};

const FEATURE_MIN_TIER: Record<LearningFeature, PlanTier> = {
  register_result: 1,        // Basic+
  view_history: 1,           // Basic+
  full_history: 2,           // Pro+
  detected_patterns: 2,      // Pro+
  emotional_tendency: 2,     // Pro+
  behavior_suggestions: 2,   // Pro+
  monthly_evolution: 2,      // Pro+
  comparative_report: 3,     // Elite
  export_learning_data: 3,   // Elite
  consistency_analysis: 3,   // Elite
};

export function canAccessLearningFeature(
  feature: LearningFeature,
  plan: DatabasePlan | string,
): boolean {
  const tier = PLAN_TIER[plan as DatabasePlan] ?? 0;
  const minTier = FEATURE_MIN_TIER[feature];
  return tier >= minTier;
}

export function getLearningTier(plan: DatabasePlan | string): "free" | "basic" | "pro" | "elite" {
  const tier = PLAN_TIER[plan as DatabasePlan] ?? 0;
  if (tier === 0) return "free";
  if (tier === 1) return "basic";
  if (tier === 2) return "pro";
  return "elite";
}
