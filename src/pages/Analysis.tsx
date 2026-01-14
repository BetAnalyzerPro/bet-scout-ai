import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  TrendingUp,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RiskBadge } from "@/components/RiskBadge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ExtractedBet {
  homeTeam: string;
  awayTeam: string;
  market: string;
  line: string;
  odds: number;
  competition?: string;
  matchDate?: string;
}

interface AnalyzedBet extends ExtractedBet {
  risk: "low" | "medium" | "high";
  confidence: number;
  reasoning: string;
  suggestion?: string;
  suggestedLine?: string;
}

interface AnalysisData {
  extractedData: {
    bets: ExtractedBet[];
    totalOdds: number;
    stake?: number;
    potentialReturn?: number;
  };
  analysis: {
    bets: AnalyzedBet[];
    overallRisk: "low" | "medium" | "high";
    summary: string;
    recommendations: string[];
  };
}

export default function Analysis() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [expandedBets, setExpandedBets] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    if (id) {
      fetchAnalysis();
    }
  }, [id]);

  const fetchAnalysis = async () => {
    try {
      const { data, error } = await supabase
        .from("bet_analyses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setAnalysis(data);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      toast({
        title: "Erro ao carregar análise",
        description: "Não foi possível carregar os dados da análise.",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const toggleBet = (index: number) => {
    const newExpanded = new Set(expandedBets);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedBets(newExpanded);
  };

  const markResult = async (isGreen: boolean) => {
    try {
      const { error } = await supabase
        .from("bet_analyses")
        .update({ is_green: isGreen })
        .eq("id", id);

      if (error) throw error;

      setAnalysis((prev: any) => ({ ...prev, is_green: isGreen }));
      
      toast({
        title: isGreen ? "GREEN marcado! 🎉" : "RED marcado",
        description: "Resultado registrado no seu histórico.",
      });
    } catch (error) {
      console.error("Error updating result:", error);
      toast({
        title: "Erro ao marcar resultado",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Carregando análise..." />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Análise não encontrada</h2>
            <p className="text-muted-foreground mb-4">
              Esta análise pode ter sido removida ou não existe.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const extractedData = analysis.extracted_data as AnalysisData["extractedData"] | null;
  const analysisResult = analysis.analysis_result as AnalysisData["analysis"] | null;

  // Handle pending/processing status
  if (analysis.status === "pending" || analysis.status === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">
              {analysis.status === "pending" ? "Aguardando processamento..." : "Analisando bilhete..."}
            </h2>
            <p className="text-muted-foreground mb-4">
              Nossa IA está extraindo e analisando as apostas do seu bilhete.
              Isso pode levar alguns segundos.
            </p>
            <Button variant="outline" onClick={() => fetchAnalysis()}>
              Atualizar Status
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle failed status
  if (analysis.status === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Falha na análise</h2>
            <p className="text-muted-foreground mb-4">
              Não foi possível analisar este bilhete. Tente novamente com uma imagem mais clara.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bets = analysisResult?.bets || [];
  const overallRisk = analysisResult?.overallRisk || analysis.overall_risk || "medium";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="flex items-center justify-between p-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Análise do Bilhete</h1>
              <p className="text-sm text-muted-foreground">
                {new Date(analysis.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        {/* Overall Summary */}
        <Card className={`border-2 ${
          overallRisk === "low" ? "border-risk-low/30 bg-risk-low/5" :
          overallRisk === "high" ? "border-risk-high/30 bg-risk-high/5" :
          "border-risk-medium/30 bg-risk-medium/5"
        }`}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${
                  overallRisk === "low" ? "bg-risk-low/20" :
                  overallRisk === "high" ? "bg-risk-high/20" :
                  "bg-risk-medium/20"
                }`}>
                  {overallRisk === "low" ? (
                    <CheckCircle2 className="h-8 w-8 text-risk-low" />
                  ) : overallRisk === "high" ? (
                    <XCircle className="h-8 w-8 text-risk-high" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-risk-medium" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">
                      Risco {overallRisk === "low" ? "Baixo" : overallRisk === "high" ? "Alto" : "Médio"}
                    </h2>
                    <RiskBadge level={overallRisk} />
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {analysisResult?.summary || "Análise concluída com sucesso."}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Odd Total</p>
                  <p className="text-2xl font-bold">{extractedData?.totalOdds?.toFixed(2) || "N/A"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{bets.length} seleções</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mark Result */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marcar Resultado</p>
                <p className="text-sm text-muted-foreground">
                  Registre se o bilhete deu Green ou Red
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={analysis.is_green === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => markResult(true)}
                  className={analysis.is_green === true ? "bg-risk-low hover:bg-risk-low/90" : ""}
                >
                  <Check className="h-4 w-4 mr-1" />
                  GREEN
                </Button>
                <Button
                  variant={analysis.is_green === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => markResult(false)}
                  className={analysis.is_green === false ? "bg-risk-high hover:bg-risk-high/90" : ""}
                >
                  <X className="h-4 w-4 mr-1" />
                  RED
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {analysisResult?.recommendations && analysisResult.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-warning" />
                Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-primary mt-1 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Individual Bets Analysis */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Análise por Seleção</h3>
          
          {bets.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Nenhuma aposta foi extraída do bilhete.
                </p>
              </CardContent>
            </Card>
          ) : (
            bets.map((bet, index) => (
              <Collapsible
                key={index}
                open={expandedBets.has(index)}
                onOpenChange={() => toggleBet(index)}
              >
                <Card className={`transition-all ${
                  bet.risk === "high" ? "border-risk-high/30" :
                  bet.risk === "low" ? "border-risk-low/30" :
                  "border-risk-medium/30"
                }`}>
                  <CollapsibleTrigger className="w-full">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <RiskBadge level={bet.risk} size="sm" showLabel={false} />
                          <div className="text-left">
                            <p className="font-medium">
                              {bet.homeTeam} vs {bet.awayTeam}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {bet.market}: {bet.line}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary">@{bet.odds?.toFixed(2)}</Badge>
                          {expandedBets.has(index) ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-4 px-4 border-t border-border">
                      <div className="mt-4 space-y-4">
                        {/* Confidence */}
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          <span className="text-sm">Confiança:</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                bet.confidence >= 70 ? "bg-risk-low" :
                                bet.confidence >= 40 ? "bg-risk-medium" :
                                "bg-risk-high"
                              }`}
                              style={{ width: `${bet.confidence || 50}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{bet.confidence || 50}%</span>
                        </div>

                        {/* Reasoning */}
                        <div>
                          <p className="text-sm font-medium mb-1">Análise:</p>
                          <p className="text-sm text-muted-foreground">
                            {bet.reasoning || "Sem análise disponível."}
                          </p>
                        </div>

                        {/* Suggestion */}
                        {bet.suggestion && (
                          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-primary">Sugestão</p>
                                <p className="text-sm">{bet.suggestion}</p>
                                {bet.suggestedLine && (
                                  <Badge variant="outline" className="mt-2">
                                    Linha sugerida: {bet.suggestedLine}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Match info */}
                        {(bet.competition || bet.matchDate) && (
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {bet.competition && (
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {bet.competition}
                              </span>
                            )}
                            {bet.matchDate && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {bet.matchDate}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))
          )}
        </div>

        {/* Original Image */}
        {analysis.original_image_url && (
          <Card>
            <CardHeader>
              <CardTitle>Bilhete Original</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={analysis.original_image_url}
                alt="Bilhete original"
                className="max-w-full h-auto rounded-lg border"
              />
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4 pt-4">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate("/history")}>
            Ver Histórico
          </Button>
        </div>
      </main>
    </div>
  );
}
