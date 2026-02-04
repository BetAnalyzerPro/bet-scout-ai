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
      "Histórico dos últimos 3 dias",
      "Análise básica do bilhete",
      "Índice de Consciência",
      "Sugestões de ajuste simples",
    ],
    description: "Para entender os riscos antes de apostar",
    cta: "Começar Grátis",
    isPopular: false,
    isHighlight: false,
    colorClass: "text-success",
    bgClass: "bg-success/10",
    borderClass: "border-success/30",
  },
  basic: {
    id: "basic",
    dbValue: "intermediate",
    name: "Basic",
    subtitle: "Aposta Controlada",
    icon: SlidersHorizontal,
    price: "R$ 49,90",
    priceValue: 49.90,
    period: "/mês",
    dailyLimit: 2,
    historyDays: 15,
    features: [
      "2 análises por dia",
      "Histórico dos últimos 15 dias",
      "Análise completa do bilhete",
      "Índice de Consciência",
      "Sugestões de ajuste",
      "Checklist básico do bilhete",
    ],
    description: "Para apostar com mais critério e menos impulso",
    cta: "Assinar Basic",
    isPopular: false,
    isHighlight: false,
    colorClass: "text-warning",
    bgClass: "bg-warning/10",
    borderClass: "border-warning/30",
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
      "Análise avançada do bilhete",
      "Índice de Consciência detalhado",
      "Sugestões de ajuste avançadas",
      "Relatório semanal de padrões e erros",
      "Comparação de bilhetes",
    ],
    description: "O plano ideal para quem quer tomar decisões mais conscientes",
    cta: "Assinar Pro",
    isPopular: true,
    isHighlight: true,
    colorClass: "text-info",
    bgClass: "bg-info/10",
    borderClass: "border-info/30",
  },
  elite: {
    id: "elite",
    dbValue: "elite",
    name: "Elite",
    subtitle: "Controle Total",
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
      "Exportação de dados",
      "Prioridade de processamento",
    ],
    description: "Para usuários avançados que buscam controle total",
    cta: "Assinar Elite",
    isPopular: false,
    isHighlight: false,
    colorClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-600/10 dark:bg-purple-400/10",
    borderClass: "border-purple-600/30 dark:border-purple-400/30",
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
