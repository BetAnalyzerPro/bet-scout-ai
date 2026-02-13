import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  History,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  Wallet,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { PlanBadge } from "@/components/PlanBadge";
import { UnlockModal } from "@/components/UnlockModal";
import { canAccess, type FeatureKey } from "@/lib/featureAccess";
import type { DatabasePlan } from "@/config/plans";

type SidebarPage = "dashboard" | "history" | "statistics" | "bankroll" | "learning" | "settings";

interface NavItem {
  id: SidebarPage;
  label: string;
  icon: typeof Upload;
  route: string;
  feature?: FeatureKey;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Nova Análise", icon: Upload, route: "/dashboard" },
  { id: "history", label: "Histórico", icon: History, route: "/history" },
  { id: "statistics", label: "Estatísticas", icon: BarChart3, route: "/statistics" },
  { id: "bankroll", label: "Gestão de Banca", icon: Wallet, route: "/bankroll", feature: "bankroll_management" },
  { id: "learning", label: "Aprendizado da IA", icon: GraduationCap, route: "/learning" },
  { id: "settings", label: "Configurações", icon: Settings, route: "/settings" },
];

interface SidebarNavProps {
  activePage: SidebarPage;
  userPlan: DatabasePlan | string;
  userName: string;
  userInitial: string;
  onSignOut: () => void;
}

export function SidebarNav({ activePage, userPlan, userName, userInitial, onSignOut }: SidebarNavProps) {
  const navigate = useNavigate();
  const [unlockFeature, setUnlockFeature] = useState<FeatureKey | null>(null);

  const handleNavClick = (item: NavItem) => {
    if (item.feature && !canAccess(item.feature, userPlan)) {
      setUnlockFeature(item.feature);
      return;
    }
    navigate(item.route);
  };

  return (
    <>
      <nav className="flex-1 px-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activePage;
          const isLocked = item.feature ? !canAccess(item.feature, userPlan) : false;
          const Icon = item.icon;

          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => {
                if (!isActive) handleNavClick(item);
              }}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {isLocked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
            </Button>
          );
        })}
      </nav>

      <UnlockModal
        feature={unlockFeature}
        open={!!unlockFeature}
        onOpenChange={(open) => !open && setUnlockFeature(null)}
      />
    </>
  );
}

interface MobileSidebarNavProps extends SidebarNavProps {
  onClose: () => void;
}

export function MobileSidebarNav({ activePage, userPlan, userName, userInitial, onSignOut, onClose }: MobileSidebarNavProps) {
  const navigate = useNavigate();
  const [unlockFeature, setUnlockFeature] = useState<FeatureKey | null>(null);

  const handleNavClick = (item: NavItem) => {
    if (item.feature && !canAccess(item.feature, userPlan)) {
      onClose();
      setUnlockFeature(item.feature);
      return;
    }
    onClose();
    navigate(item.route);
  };

  return (
    <>
      <nav className="px-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activePage;
          const isLocked = item.feature ? !canAccess(item.feature, userPlan) : false;
          const Icon = item.icon;

          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => {
                if (isActive) {
                  onClose();
                } else {
                  handleNavClick(item);
                }
              }}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {isLocked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
            </Button>
          );
        })}
      </nav>

      <UnlockModal
        feature={unlockFeature}
        open={!!unlockFeature}
        onOpenChange={(open) => !open && setUnlockFeature(null)}
      />
    </>
  );
}
