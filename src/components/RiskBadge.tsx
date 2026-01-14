import { cn } from "@/lib/utils";

type RiskLevel = "low" | "medium" | "high";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const riskConfig = {
  low: {
    label: "Baixo",
    emoji: "🟢",
    className: "bg-risk-low/10 text-risk-low border-risk-low/30",
  },
  medium: {
    label: "Médio",
    emoji: "🟡",
    className: "bg-risk-medium/10 text-risk-medium border-risk-medium/30",
  },
  high: {
    label: "Alto",
    emoji: "🔴",
    className: "bg-risk-high/10 text-risk-high border-risk-high/30",
  },
};

export function RiskBadge({ level, size = "md", showLabel = true }: RiskBadgeProps) {
  const config = riskConfig[level];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        config.className,
        sizeClasses[size]
      )}
    >
      <span>{config.emoji}</span>
      {showLabel && <span>Risco {config.label}</span>}
    </span>
  );
}