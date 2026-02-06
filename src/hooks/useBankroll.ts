import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getPlanFromDbValue } from "@/config/plans";

export interface BankrollSettings {
  id: string;
  user_id: string;
  banca_atual: number;
  limite_mensal_exposicao: number | null;
  percentual_stake_base: number;
  smart_risk_adjustment: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankrollEntry {
  id: string;
  user_id: string;
  stake: number;
  odd_total: number | null;
  bet_type: "simples" | "multipla";
  status: "open" | "green" | "red";
  linked_analysis_id: string | null;
  risk_level: "low" | "medium" | "high" | null;
  profit_loss: number;
  created_at: string;
  updated_at: string;
}

export function useBankroll() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<BankrollSettings | null>(null);
  const [entries, setEntries] = useState<BankrollEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentPlan = profile?.current_plan || "free";
  const planConfig = getPlanFromDbValue(currentPlan);

  // Calculate daily entries limit
  const getDailyEntriesLimit = useCallback(() => {
    return planConfig.bankrollEntriesPerDay;
  }, [planConfig]);

  // Get today's entries count
  const getTodayEntriesCount = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return entries.filter(e => new Date(e.created_at) >= today).length;
  }, [entries]);

  // Check if can add more entries
  const canAddEntry = useCallback(() => {
    return getTodayEntriesCount() < getDailyEntriesLimit();
  }, [getTodayEntriesCount, getDailyEntriesLimit]);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("bankroll_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error("Error fetching bankroll settings:", error);
    }
  }, [user]);

  // Fetch entries
  const fetchEntries = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("bankroll_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries((data || []) as BankrollEntry[]);
    } catch (error) {
      console.error("Error fetching bankroll entries:", error);
    }
  }, [user]);

  // Load all data
  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchSettings(), fetchEntries()]);
    setLoading(false);
  }, [fetchSettings, fetchEntries]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save or update settings
  const saveSettings = async (newSettings: Partial<BankrollSettings>) => {
    if (!user) return;
    
    setSaving(true);
    try {
      if (settings) {
        // Update existing
        const { error } = await supabase
          .from("bankroll_settings")
          .update({
            banca_atual: newSettings.banca_atual ?? settings.banca_atual,
            limite_mensal_exposicao: newSettings.limite_mensal_exposicao ?? settings.limite_mensal_exposicao,
            percentual_stake_base: newSettings.percentual_stake_base ?? settings.percentual_stake_base,
            smart_risk_adjustment: newSettings.smart_risk_adjustment ?? settings.smart_risk_adjustment,
          })
          .eq("id", settings.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from("bankroll_settings")
          .insert({
            user_id: user.id,
            banca_atual: newSettings.banca_atual ?? 0,
            limite_mensal_exposicao: newSettings.limite_mensal_exposicao ?? null,
            percentual_stake_base: newSettings.percentual_stake_base ?? 1,
            smart_risk_adjustment: newSettings.smart_risk_adjustment ?? false,
          });

        if (error) throw error;
      }

      await fetchSettings();
      toast({
        title: "Configurações salvas",
        description: "Suas configurações de banca foram atualizadas.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Add new entry
  const addEntry = async (entry: Omit<BankrollEntry, "id" | "user_id" | "profit_loss" | "created_at" | "updated_at">) => {
    if (!user) return;

    if (!canAddEntry()) {
      toast({
        title: "Limite atingido",
        description: `Você atingiu o limite de ${getDailyEntriesLimit()} registros por dia do seu plano.`,
        variant: "destructive",
      });
      return false;
    }
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("bankroll_entries")
        .insert({
          user_id: user.id,
          stake: entry.stake,
          odd_total: entry.odd_total || null,
          bet_type: entry.bet_type,
          status: entry.status || "open",
          linked_analysis_id: entry.linked_analysis_id || null,
          risk_level: entry.risk_level || null,
        });

      if (error) throw error;

      await fetchEntries();
      toast({
        title: "Aposta registrada",
        description: "Sua aposta foi adicionada ao histórico.",
      });
      return true;
    } catch (error) {
      console.error("Error adding entry:", error);
      toast({
        title: "Erro ao registrar",
        description: "Não foi possível registrar a aposta.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Update entry status (mark as green/red)
  const updateEntryStatus = async (entryId: string, status: "green" | "red") => {
    if (!user) return;
    
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    let profitLoss = 0;
    if (status === "green" && entry.odd_total) {
      profitLoss = entry.stake * (entry.odd_total - 1);
    } else if (status === "red") {
      profitLoss = -entry.stake;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("bankroll_entries")
        .update({ status, profit_loss: profitLoss })
        .eq("id", entryId);

      if (error) throw error;

      await fetchEntries();
      toast({
        title: status === "green" ? "GREEN marcado! 🎉" : "RED marcado",
        description: status === "green" 
          ? `Lucro: R$ ${profitLoss.toFixed(2)}`
          : `Prejuízo: R$ ${Math.abs(profitLoss).toFixed(2)}`,
      });
    } catch (error) {
      console.error("Error updating entry:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Calculate exposure
  const calculateExposure = useCallback((days: number) => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    return entries
      .filter(e => new Date(e.created_at) >= startDate)
      .reduce((sum, e) => sum + e.stake, 0);
  }, [entries]);

  // Get exposure for different periods
  const exposureToday = calculateExposure(0);
  const exposureWeek = calculateExposure(7);
  const exposureMonth = (() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return entries
      .filter(e => new Date(e.created_at) >= startOfMonth)
      .reduce((sum, e) => sum + e.stake, 0);
  })();

  // Calculate recommended stake
  const stakeBase = settings 
    ? (settings.banca_atual * settings.percentual_stake_base) / 100 
    : 0;

  const getAdjustedStake = (riskLevel?: "low" | "medium" | "high") => {
    if (!settings?.smart_risk_adjustment || !riskLevel) return stakeBase;
    
    const multipliers = { low: 1.0, medium: 0.7, high: 0.4 };
    return stakeBase * multipliers[riskLevel];
  };

  // Calculate suggested limits
  const dailyLimit = stakeBase * 5;
  const weeklyLimit = stakeBase * 20;
  const monthlyLimit = settings?.limite_mensal_exposicao ?? stakeBase * 60;

  // Get exposure status
  const getExposureStatus = (exposure: number, limit: number): "green" | "yellow" | "red" => {
    const ratio = limit > 0 ? (exposure / limit) * 100 : 0;
    if (ratio <= 80) return "green";
    if (ratio <= 100) return "yellow";
    return "red";
  };

  // Monthly stats
  const monthlyStats = (() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEntries = entries.filter(e => new Date(e.created_at) >= startOfMonth);
    
    return {
      totalStaked: monthEntries.reduce((sum, e) => sum + e.stake, 0),
      totalEntries: monthEntries.length,
      greens: monthEntries.filter(e => e.status === "green").length,
      reds: monthEntries.filter(e => e.status === "red").length,
      netResult: monthEntries.reduce((sum, e) => sum + e.profit_loss, 0),
    };
  })();

  // Generate alerts
  const generateAlerts = useCallback(() => {
    const alerts: { type: string; message: string; severity: "warning" | "danger" }[] = [];
    
    // Only show alerts for paid plans (basic+)
    if (currentPlan === "free") {
      if (exposureToday > dailyLimit) {
        alerts.push({
          type: "exposure",
          message: "Exposição do dia acima do sugerido.",
          severity: "warning",
        });
      }
      return alerts;
    }

    // Stake above recommended (basic+)
    // Check last entry
    if (entries.length > 0) {
      const lastEntry = entries[0];
      if (lastEntry.stake > stakeBase * 1.5) {
        alerts.push({
          type: "stake_high",
          message: "Você está apostando acima do recomendado.",
          severity: "warning",
        });
      }
    }

    // Exposure alerts
    if (exposureToday > dailyLimit) {
      alerts.push({
        type: "exposure_daily",
        message: "Exposição do dia acima do sugerido.",
        severity: "danger",
      });
    }

    // Pro+ alerts
    if (currentPlan === "advanced" || currentPlan === "elite") {
      // Recovery pattern
      const last24h = new Date();
      last24h.setHours(last24h.getHours() - 24);
      const recent = entries.filter(e => new Date(e.created_at) >= last24h);
      const recentReds = recent.filter(e => e.status === "red").length;
      
      if (recentReds >= 2 && recent.length >= 3) {
        const avgStakeBefore = recent.slice(2).reduce((s, e) => s + e.stake, 0) / Math.max(1, recent.length - 2);
        const lastStake = recent[0]?.stake || 0;
        if (lastStake > avgStakeBefore * 1.5) {
          alerts.push({
            type: "recovery_pattern",
            message: "Padrão de recuperação identificado. Cuidado com decisões impulsivas.",
            severity: "danger",
          });
        }
      }

      // Multiple bets frequency
      const last7days = new Date();
      last7days.setDate(last7days.getDate() - 7);
      const weekEntries = entries.filter(e => new Date(e.created_at) >= last7days);
      const multiplas = weekEntries.filter(e => e.bet_type === "multipla").length;
      if (weekEntries.length >= 5 && multiplas / weekEntries.length >= 0.7) {
        alerts.push({
          type: "multiplas_frequency",
          message: "Múltiplas frequentes aumentam variância e risco.",
          severity: "warning",
        });
      }
    }

    return alerts;
  }, [entries, stakeBase, dailyLimit, exposureToday, currentPlan]);

  return {
    settings,
    entries,
    loading,
    saving,
    saveSettings,
    addEntry,
    updateEntryStatus,
    refetch: loadData,
    stakeBase,
    getAdjustedStake,
    dailyLimit,
    weeklyLimit,
    monthlyLimit,
    exposureToday,
    exposureWeek,
    exposureMonth,
    getExposureStatus,
    monthlyStats,
    generateAlerts,
    canAddEntry,
    getDailyEntriesLimit,
    getTodayEntriesCount,
    planConfig,
    currentPlan,
  };
}
