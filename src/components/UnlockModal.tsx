import { useNavigate } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type FeatureKey, getFeatureConfig } from "@/lib/featureAccess";

interface UnlockModalProps {
  feature: FeatureKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnlockModal({ feature, open, onOpenChange }: UnlockModalProps) {
  const navigate = useNavigate();

  if (!feature) return null;

  const config = getFeatureConfig(feature);

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/#planos");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg">
                Desbloquear {config.label}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Disponível em: {config.availableIn}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            Esse recurso ajuda a tomar decisões com mais contexto e controle.
          </p>
          <ul className="space-y-2">
            {config.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleUpgrade}>
            Ver planos
          </Button>
          <Button className="w-full sm:w-auto gradient-primary text-primary-foreground" onClick={handleUpgrade}>
            Desbloquear agora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
