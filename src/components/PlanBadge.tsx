import { cn } from "@/lib/utils";
import { Zap, Shield, TrendingUp } from "lucide-react";

type Plan = "start" | "control" | "pro_analysis" | "free" | "intermediate" | "advanced";

interface PlanBadgeProps {
  plan: Plan;
  size?: "sm" | "md" | "lg";
}

const planConfig = {
  // New plan names
  start: {
    label: "Start",
    icon: Zap,
    className: "bg-success/10 text-success border-success/30",
  },
  control: {
    label: "Control",
    icon: Shield,
    className: "bg-info/10 text-info border-info/30",
  },
  pro_analysis: {
    label: "Pro Analysis",
    icon: TrendingUp,
    className: "bg-primary/10 text-primary border-primary/30",
  },
  // Legacy plan names (for backwards compatibility)
  free: {
    label: "Start",
    icon: Zap,
    className: "bg-success/10 text-success border-success/30",
  },
  intermediate: {
    label: "Control",
    icon: Shield,
    className: "bg-info/10 text-info border-info/30",
  },
  advanced: {
    label: "Pro Analysis",
    icon: TrendingUp,
    className: "bg-primary/10 text-primary border-primary/30",
  },
};

export function PlanBadge({ plan, size = "md" }: PlanBadgeProps) {
  const config = planConfig[plan] || planConfig.start;
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
