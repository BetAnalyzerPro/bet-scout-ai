import { cn } from "@/lib/utils";
import { getPlanFromDbValue, type DatabasePlan } from "@/config/plans";

interface PlanBadgeProps {
  plan: DatabasePlan | string;
  size?: "sm" | "md" | "lg";
}

export function PlanBadge({ plan, size = "md" }: PlanBadgeProps) {
  const config = getPlanFromDbValue(plan as DatabasePlan);
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
        config.bgClass,
        config.colorClass,
        config.borderClass,
        sizeClasses[size]
      )}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.name}</span>
    </span>
  );
}
