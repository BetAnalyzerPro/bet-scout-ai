import { Brain, SlidersHorizontal, Compass, Layers } from "lucide-react";

// Database enum values
export type DatabasePlan = "free" | "intermediate" | "advanced" | "elite";

// Extended plan types for UI
export type PlanType = "free" | "basic" | "pro" | "elite";

// Map database values to UI plan types
export const dbPlanToUiPlan: Record<DatabasePlan, PlanType> = {
  free: "free",
  intermediate: "basic",
  advanced: "pro",
  elite: "elite",
};

// Plan configuration
export interface PlanConfig {
  id: PlanType;
  dbValue: DatabasePlan | null; // null for plans not yet in DB
  name: string;
  subtitle: string;
  icon: typeof Brain;
  price: string;
  priceValue: number;
  period: string;
  dailyLimit: number;
  historyDays: number | null; // null = unlimited
  features: string[];
  description: string;
  cta: string;
  isPopular: boolean;
  isHighlight: boolean;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  // Bankroll limits
  bankrollEntriesPerDay: number;
  canSeeAlerts: boolean;
  canUseSmartRisk: boolean;
  canExportCSV: boolean;
}

export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    id: "free",
    dbValue: "free",
    name: "Free",
    subtitle: "Consciência Inicial",
    icon: Brain,
    price: "Gratuito",
    priceValue: 0,
    period: "",
    dailyLimit: 1,
    historyDays: 3,
    features: [
      "1 análise por dia",
      "Histórico limitado (3 dias)",
      "Análise essencial do bilhete",
      "Índice de risco simplificado",
      "Sugestões básicas de ajuste",
    ],
    description: "Entenda onde suas apostas podem falhar antes de continuar perdendo dinheiro.",
    cta: "Começar Grátis",
    isPopular: false,
    isHighlight: false,
    colorClass: "text-success",
    bgClass: "bg-success/10",
    borderClass: "border-success/30",
    bankrollEntriesPerDay: 1,
    canSeeAlerts: false,
    canUseSmartRisk: false,
    canExportCSV: false,
  },
  basic: {
    id: "basic",
    dbValue: "intermediate",
    name: "Basic",
    subtitle: "Aposta com Critério",
    icon: SlidersHorizontal,
    price: "R$ 49,90",
    priceValue: 49.90,
    period: "/mês",
    dailyLimit: 2,
    historyDays: 15,
    features: [
      "2 análises por dia",
      "Histórico expandido (15 dias)",
      "Análise completa com contexto estatístico",
      "Índice de risco detalhado",
      "Sugestões estratégicas de ajuste",
      "Checklist inteligente de decisão",
    ],
    description: "Mais análises, mais contexto e menos decisões emocionais.",
    cta: "Assinar Basic",
    isPopular: false,
    isHighlight: false,
    colorClass: "text-warning",
    bgClass: "bg-warning/10",
    borderClass: "border-warning/30",
    bankrollEntriesPerDay: 10,
    canSeeAlerts: true,
    canUseSmartRisk: false,
    canExportCSV: false,
  },
  pro: {
    id: "pro",
    dbValue: "advanced",
    name: "Pro",
    subtitle: "Decisão Profissional",
    icon: Compass,
    price: "R$ 119,90",
    priceValue: 119.90,
    period: "/mês",
    dailyLimit: 10,
    historyDays: null,
    features: [
      "10 análises por dia",
      "Histórico ilimitado",
      "Análise avançada com múltiplas fontes",
      "Índice de risco aprofundado",
      "Sugestões estratégicas avançadas",
      "Relatório semanal de padrões",
      "Comparação inteligente de bilhetes",
    ],
    description: "Transforme dados em decisões conscientes e construa uma estratégia de longo prazo.",
    cta: "Assinar Pro",
    isPopular: true,
    isHighlight: true,
    colorClass: "text-info",
    bgClass: "bg-info/10",
    borderClass: "border-info/30",
    bankrollEntriesPerDay: 50,
    canSeeAlerts: true,
    canUseSmartRisk: true,
    canExportCSV: false,
  },
  elite: {
    id: "elite",
    dbValue: "elite",
    name: "Elite",
    subtitle: "Controle Estratégico",
    icon: Layers,
    price: "R$ 249,90",
    priceValue: 249.90,
    period: "/mês",
    dailyLimit: Infinity,
    historyDays: null,
    features: [
      "Análises ilimitadas",
      "Histórico ilimitado",
      "Tudo do plano Pro",
      "Relatórios avançados por liga e mercado",
      "Exportação completa de dados",
      "Prioridade máxima de processamento",
    ],
    description: "Análises ilimitadas, relatórios avançados e controle total sobre seu desempenho.",
    cta: "Assinar Elite",
    isPopular: false,
    isHighlight: false,
    colorClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-600/10 dark:bg-purple-400/10",
    borderClass: "border-purple-600/30 dark:border-purple-400/30",
    bankrollEntriesPerDay: 200,
    canSeeAlerts: true,
    canUseSmartRisk: true,
    canExportCSV: true,
  },
};

// Get plan config from database value
export function getPlanFromDbValue(dbValue: DatabasePlan | string): PlanConfig {
  const uiPlan = dbPlanToUiPlan[dbValue as DatabasePlan];
  return PLANS[uiPlan] || PLANS.free;
}

// Get daily limit from database plan value
export function getDailyLimit(dbValue: DatabasePlan | string): number {
  const plan = getPlanFromDbValue(dbValue);
  return plan.dailyLimit;
}

// Get display limit (for UI - shows ∞ for unlimited)
export function getDisplayLimit(dbValue: DatabasePlan | string): string | number {
  const limit = getDailyLimit(dbValue);
  return limit === Infinity ? "∞" : limit;
}

// Check if plan is free tier
export function isFreePlan(dbValue: DatabasePlan | string): boolean {
  return dbValue === "free";
}

// Microcopy for paywall
export const PAYWALL_MESSAGES = {
  limitReached: "Você atingiu o limite do seu plano. Isso existe para evitar decisões impulsivas.",
  upgradeTitle: "Desbloquear mais clareza",
  upgradeDescription: "Desbloqueie mais análises e recursos avançados para tomar decisões mais conscientes.",
  disclaimer: "Apostas envolvem risco. O Bet Analizer não garante resultados.",
};

// Plans to show on pricing page (ordered)
export const PRICING_PLANS: PlanType[] = ["free", "basic", "pro", "elite"];
