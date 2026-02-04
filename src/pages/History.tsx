import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  ChevronRight,
  Clock,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Logo } from "@/components/Logo";
import { RiskBadge } from "@/components/RiskBadge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type RiskLevel = "low" | "medium" | "high";

interface Analysis {
  id: string;
  created_at: string;
  status: string;
  overall_risk: RiskLevel | null;
  is_green: boolean | null;
  extracted_data: any;
  analysis_result: any;
}

export default function History() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [filterResult, setFilterResult] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from("bet_analyses")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      toast({
        title: "Erro ao carregar histórico",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAnalyses = analyses.filter((analysis) => {
    // Filter by risk
    if (filterRisk !== "all" && analysis.overall_risk !== filterRisk) {
      return false;
    }

    // Filter by result
    if (filterResult === "green" && analysis.is_green !== true) {
      return false;
    }
    if (filterResult === "red" && analysis.is_green !== false) {
      return false;
    }
    if (filterResult === "pending" && analysis.is_green !== null) {
      return false;
    }

    return true;
  });

  const stats = {
    total: analyses.length,
    greens: analyses.filter((a) => a.is_green === true).length,
    reds: analyses.filter((a) => a.is_green === false).length,
    pending: analyses.filter((a) => a.is_green === null).length,
  };

  const winRate = stats.greens + stats.reds > 0
    ? Math.round((stats.greens / (stats.greens + stats.reds)) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Carregando histórico..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="flex items-center justify-between p-3 sm:p-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-base sm:text-lg font-semibold">Histórico de Análises</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {analyses.length} análises realizadas
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
              <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-muted-foreground">Taxa de Acerto</p>
              <p className="text-xl sm:text-2xl font-bold text-primary">{winRate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-muted-foreground">Greens</p>
              <p className="text-xl sm:text-2xl font-bold text-risk-low">{stats.greens}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground/70">Resultado Positivo</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-muted-foreground">Reds</p>
              <p className="text-xl sm:text-2xl font-bold text-risk-high">{stats.reds}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground/70">Resultado Negativo</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="flex-1">
                <Select value={filterRisk} onValueChange={setFilterRisk}>
                  <SelectTrigger className="h-11 sm:h-10">
                    <SelectValue placeholder="Filtrar por risco" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os riscos</SelectItem>
                    <SelectItem value="low">Risco Baixo</SelectItem>
                    <SelectItem value="medium">Risco Médio</SelectItem>
                    <SelectItem value="high">Risco Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={filterResult} onValueChange={setFilterResult}>
                  <SelectTrigger className="h-11 sm:h-10">
                    <SelectValue placeholder="Filtrar por resultado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os resultados</SelectItem>
                    <SelectItem value="green">Greens</SelectItem>
                    <SelectItem value="red">Reds</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analyses List */}
        <div className="space-y-2 sm:space-y-4">
          {filteredAnalyses.length === 0 ? (
            <Card>
              <CardContent className="p-6 sm:p-8 text-center">
                <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium mb-2">Nenhuma análise encontrada</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {analyses.length === 0
                    ? "Você ainda não fez nenhuma análise."
                    : "Nenhuma análise corresponde aos filtros selecionados."}
                </p>
                {analyses.length === 0 && (
                  <>
                    <p className="text-xs text-muted-foreground mb-4">
                      Quanto mais bilhetes você analisa e registra, mais precisas ficam suas estatísticas.
                    </p>
                    <Button onClick={() => navigate("/dashboard")} className="h-11 sm:h-10">
                      Fazer Primeira Análise
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredAnalyses.map((analysis) => {
              const betsCount = analysis.extracted_data?.bets?.length || 0;
              const totalOdds = analysis.extracted_data?.totalOdds;

              return (
                <Card
                  key={analysis.id}
                  className="hover:bg-muted/50 transition-colors cursor-pointer active:bg-muted/80"
                  onClick={() => navigate(`/analysis/${analysis.id}`)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${
                          analysis.status === "completed"
                            ? analysis.is_green === true
                              ? "bg-risk-low/20"
                              : analysis.is_green === false
                              ? "bg-risk-high/20"
                              : "bg-primary/10"
                            : analysis.status === "processing"
                            ? "bg-warning/20"
                            : "bg-muted"
                        }`}>
                          {analysis.status === "processing" ? (
                            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-warning animate-spin" />
                          ) : analysis.is_green === true ? (
                            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-risk-low" />
                          ) : analysis.is_green === false ? (
                            <X className="h-4 w-4 sm:h-5 sm:w-5 text-risk-high" />
                          ) : (
                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm sm:text-base truncate">
                              {betsCount > 0 ? `${betsCount} seleções` : "Análise"}
                            </p>
                            {analysis.overall_risk && (
                              <RiskBadge level={analysis.overall_risk} size="sm" showLabel={false} />
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {new Date(analysis.created_at).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        {totalOdds && (
                          <Badge variant="secondary" className="text-xs">@{totalOdds.toFixed(2)}</Badge>
                        )}
                        {analysis.is_green !== null && (
                          <span className={`text-xs sm:text-sm font-medium ${
                            analysis.is_green ? "text-risk-low" : "text-risk-high"
                          }`}>
                            {analysis.is_green ? "GREEN" : "RED"}
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
