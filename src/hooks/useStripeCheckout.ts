import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getStripePrice, StripePlanKey } from "@/config/stripe";

export function useStripeCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCheckout = async (planKey: StripePlanKey) => {
    // Validate user is logged in
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para assinar um plano.",
        variant: "destructive",
      });
      navigate("/login", { state: { from: "/#planos", planKey } });
      return;
    }

    const stripePrice = getStripePrice(planKey);
    if (!stripePrice) {
      toast({
        title: "Erro",
        description: "Plano inválido selecionado.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLoadingPlan(planKey);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          priceId: stripePrice.priceId,
          planKey: planKey,
        },
      });

      if (error) {
        throw new Error(error.message || "Erro ao criar sessão de checkout");
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("URL de checkout não retornada");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Erro no checkout",
        description: error instanceof Error ? error.message : "Não foi possível iniciar o checkout. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoadingPlan(null);
    }
  };

  const handleCustomerPortal = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para gerenciar sua assinatura.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) {
        throw new Error(error.message || "Erro ao abrir portal do cliente");
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL do portal não retornada");
      }
    } catch (error) {
      console.error("Customer portal error:", error);
      toast({
        title: "Erro ao abrir portal",
        description: error instanceof Error ? error.message : "Não foi possível abrir o portal. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    loadingPlan,
    handleCheckout,
    handleCustomerPortal,
  };
}
