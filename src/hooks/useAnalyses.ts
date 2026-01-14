import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type RiskLevel = "low" | "medium" | "high";

export interface Analysis {
  id: string;
  created_at: string;
  status: string;
  overall_risk: RiskLevel | null;
  is_green: boolean | null;
  extracted_data: any;
  analysis_result: any;
  original_image_url: string;
}

export function useAnalyses() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalyses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("bet_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      setAnalyses(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching analyses:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch analyses"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, [user]);

  const recentAnalyses = analyses.slice(0, 5);

  const stats = {
    total: analyses.length,
    greens: analyses.filter((a) => a.is_green === true).length,
    reds: analyses.filter((a) => a.is_green === false).length,
    pending: analyses.filter((a) => a.is_green === null && a.status === "completed").length,
    todayCount: analyses.filter((a) => {
      const today = new Date();
      const analysisDate = new Date(a.created_at);
      return (
        analysisDate.getDate() === today.getDate() &&
        analysisDate.getMonth() === today.getMonth() &&
        analysisDate.getFullYear() === today.getFullYear()
      );
    }).length,
    winRate: (() => {
      const completed = analyses.filter((a) => a.is_green !== null);
      if (completed.length === 0) return 0;
      const greens = completed.filter((a) => a.is_green === true).length;
      return Math.round((greens / completed.length) * 100);
    })(),
    thisMonthGreens: analyses.filter((a) => {
      const now = new Date();
      const analysisDate = new Date(a.created_at);
      return (
        a.is_green === true &&
        analysisDate.getMonth() === now.getMonth() &&
        analysisDate.getFullYear() === now.getFullYear()
      );
    }).length,
    thisMonthReds: analyses.filter((a) => {
      const now = new Date();
      const analysisDate = new Date(a.created_at);
      return (
        a.is_green === false &&
        analysisDate.getMonth() === now.getMonth() &&
        analysisDate.getFullYear() === now.getFullYear()
      );
    }).length,
  };

  return {
    analyses,
    recentAnalyses,
    stats,
    loading,
    error,
    refetch: fetchAnalyses,
  };
}
