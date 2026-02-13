import type { DatabasePlan } from "@/config/plans";

export type FeatureKey =
  | "bankroll_management"
  | "scenarios"
  | "advanced_profile"
  | "export_data"
  | "priority_processing";

interface FeatureConfig {
  label: string;
  minPlans: DatabasePlan[];
  availableIn: string;
  benefits: string[];
}

const FEATURE_ACCESS: Record<FeatureKey, FeatureConfig> = {
  bankroll_management: {
    label: "Gestão de Banca",
    minPlans: ["intermediate", "advanced", "elite"],
    availableIn: "Basic, Pro ou Elite",
    benefits: [
      "Controle de banca e exposição ao risco",
      "Sugestão de stake baseada no seu perfil",
      "Alertas de padrão de risco",
    ],
  },
  scenarios: {
    label: "Cenários Alternativos",
    minPlans: ["advanced", "elite"],
    availableIn: "Pro ou Elite",
    benefits: [
      "2º cenário provável + explicação",
      "Risco oculto detectado",
      "Comparação de cenários",
    ],
  },
  advanced_profile: {
    label: "Perfil Avançado",
    minPlans: ["advanced", "elite"],
    availableIn: "Pro ou Elite",
    benefits: [
      "Tendência de risco e padrão emocional",
      "Consistência e evolução mensal",
      "Alertas personalizados",
    ],
  },
  export_data: {
    label: "Exportação de Dados",
    minPlans: ["elite"],
    availableIn: "Elite",
    benefits: [
      "Exportação em CSV de todas as análises",
      "Relatórios detalhados por período",
      "Dados completos de banca e desempenho",
    ],
  },
  priority_processing: {
    label: "Processamento Prioritário",
    minPlans: ["elite"],
    availableIn: "Elite",
    benefits: [
      "Análises processadas com prioridade",
      "Menor tempo de espera",
      "Suporte prioritário",
    ],
  },
};

export function canAccess(feature: FeatureKey, plan: DatabasePlan | string): boolean {
  const config = FEATURE_ACCESS[feature];
  if (!config) return true;
  return config.minPlans.includes(plan as DatabasePlan);
}

export function getFeatureConfig(feature: FeatureKey): FeatureConfig {
  return FEATURE_ACCESS[feature];
}
