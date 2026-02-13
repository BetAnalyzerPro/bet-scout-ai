import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Bug, X, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DatabasePlan } from "@/config/plans";

const PLANS: { value: DatabasePlan | null; label: string }[] = [
  { value: null, label: "Real (DB)" },
  { value: "free", label: "Free" },
  { value: "intermediate", label: "Basic" },
  { value: "advanced", label: "Pro" },
  { value: "elite", label: "Elite" },
];

export function DevPlanSwitcher() {
  const { devPlanOverride, setDevPlanOverride, profile } = useAuth();
  const [open, setOpen] = useState(false);

  // Only show in development
  if (import.meta.env.PROD) return null;

  const currentLabel = PLANS.find((p) => p.value === devPlanOverride)?.label ?? "Real (DB)";
  const realPlan = profile?.current_plan ?? "free";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[9999] h-10 w-10 rounded-full bg-orange-500 text-white shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors"
        title="Dev Plan Switcher"
      >
        <Bug className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-56 rounded-xl border bg-background shadow-2xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-orange-500 flex items-center gap-1">
          <Bug className="h-3.5 w-3.5" /> DEV MODE
        </span>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Plano real: <strong>{realPlan}</strong>
      </p>

      <div className="space-y-1">
        {PLANS.map((p) => (
          <Button
            key={p.label}
            size="sm"
            variant={devPlanOverride === p.value ? "default" : "outline"}
            className="w-full justify-start text-xs h-7"
            onClick={() => setDevPlanOverride(p.value)}
          >
            {p.label}
            {devPlanOverride === p.value && <ChevronUp className="h-3 w-3 ml-auto" />}
          </Button>
        ))}
      </div>
    </div>
  );
}
