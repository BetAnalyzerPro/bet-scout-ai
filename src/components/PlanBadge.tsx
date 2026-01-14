import { cn } from "@/lib/utils";
import { Crown, Zap, Sparkles } from "lucide-react";

type Plan = "free" | "intermediate" | "advanced";

interface PlanBadgeProps {
  plan: Plan;
  size?: "sm" | "md" | "lg";
}

const planConfig = {
  free: {
    label: "Free",
    icon: Zap,
    className: "bg-muted text-muted-foreground border-border",
  },
  intermediate: {
    label: "Intermediário",
    icon: Sparkles,
    className: "bg-info/10 text-info border-info/30",
  },
  advanced: {
    label: "Avançado",
    icon: Crown,
    className: "bg-primary/10 text-primary border-primary/30",
  },
};

export function PlanBadge({ plan, size = "md" }: PlanBadgeProps) {
  const config = planConfig[plan];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        config.className,
        sizeClasses[size]
      )}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
    </span>
  );
}