import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Calendar,
  PieChart,
  BarChart3,
  Trophy,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalyses } from "@/hooks/useAnalyses";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

const chartConfig: ChartConfig = {
  greens: {
    label: "Greens",
    color: "hsl(var(--chart-2))",
  },
  reds: {
    label: "Reds",
    color: "hsl(var(--chart-1))",
  },
  analyses: {
    label: "Análises",
    color: "hsl(var(--primary))",
  },
};

export default function Statistics() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { allAnalyses, stats } = useAnalyses();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "all">("month");

  // Calculate filtered data based on period
  const filteredAnalyses = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0);
    }

    return allAnalyses.filter(
      (a) => new Date(a.created_at) >= startDate && a.is_green !== null
    );
  }, [allAnalyses, selectedPeriod]);

  // Calculate stats
  const periodStats = useMemo(() => {
    const greens = filteredAnalyses.filter((a) => a.is_green === true).length;
    const reds = filteredAnalyses.filter((a) => a.is_green === false).length;
    const total = greens + reds;
    const winRate = total > 0 ? Math.round((greens / total) * 100) : 0;

    return { greens, reds, total, winRate };
  }, [filteredAnalyses]);

  // Risk distribution
  const riskDistribution = useMemo(() => {
    const completed = allAnalyses.filter((a) => a.overall_risk);
    const low = completed.filter((a) => a.overall_risk === "low").length;
    const medium = completed.filter((a) => a.overall_risk === "medium").length;
    const high = completed.filter((a) => a.overall_risk === "high").length;

    return [
      { name: "Baixo Risco", value: low, color: "hsl(142, 76%, 36%)" },
      { name: "Risco Médio", value: medium, color: "hsl(38, 92%, 50%)" },
      { name: "Alto Risco", value: high, color: "hsl(0, 84%, 60%)" },
    ];
  }, [allAnalyses]);

  // Weekly performance data
  const weeklyData = useMemo(() => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const data: { name: string; greens: number; reds: number }[] = days.map((name) => ({
      name,
      greens: 0,
      reds: 0,
    }));

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    allAnalyses
      .filter((a) => new Date(a.created_at) >= oneWeekAgo && a.is_green !== null)
      .forEach((analysis) => {
        const dayIndex = new Date(analysis.created_at).getDay();
        if (analysis.is_green) {
          data[dayIndex].greens++;
        } else {
          data[dayIndex].reds++;
        }
      });

    return data;
  }, [allAnalyses]);

  // Determine bettor profile
  const bettorProfile = useMemo(() => {
    const completed = allAnalyses.filter((a) => a.overall_risk && a.is_green !== null);
    if (completed.length < 5) return null;

    const lowRiskCount = completed.filter((a) => a.overall_risk === "low").length;
    const highRiskCount = completed.filter((a) => a.overall_risk === "high").length;

    const lowRatio = lowRiskCount / completed.length;
    const highRatio = highRiskCount / completed.length;

    if (lowRatio >= 0.5) {
      return {
        type: "conservador" as const,
        label: "Conservador",
        description: "Você prefere apostas de menor risco e maior probabilidade.",
        icon: Target,
        color: "text-risk-low",
        bgColor: "bg-risk-low/10",
      };
    } else if (highRatio >= 0.4) {
      return {
        type: "agressivo" as const,
        label: "Agressivo",
        description: "Você busca odds mais altas e aceita maior exposição ao risco.",
        icon: AlertTriangle,
        color: "text-risk-high",
        bgColor: "bg-risk-high/10",
      };
    } else {
      return {
        type: "moderado" as const,
        label: "Moderado",
        description: "Você equilibra risco e probabilidade nas suas escolhas.",
        icon: BarChart3,
        color: "text-risk-medium",
        bgColor: "bg-risk-medium/10",
      };
    }
  }, [allAnalyses]);

  const isProPlan = ["advanced", "pro_analysis"].includes(profile?.current_plan || "");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Estatísticas</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe seu desempenho e exposição ao risco
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        {/* Period Filter */}
        <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as typeof selectedPeriod)}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mês</TabsTrigger>
            <TabsTrigger value="all">Geral</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Taxa de Acerto
              </CardDescription>
              <CardTitle className="text-3xl text-primary">{periodStats.winRate}%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={periodStats.winRate} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-risk-low" />
                Greens
              </CardDescription>
              <CardTitle className="text-3xl text-risk-low">{periodStats.greens}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {periodStats.total > 0
                  ? `${Math.round((periodStats.greens / periodStats.total) * 100)}% das apostas`
                  : "Sem dados"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-risk-high" />
                Reds
              </CardDescription>
              <CardTitle className="text-3xl text-risk-high">{periodStats.reds}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {periodStats.total > 0
                  ? `${Math.round((periodStats.reds / periodStats.total) * 100)}% das apostas`
                  : "Sem dados"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Total Analisado
              </CardDescription>
              <CardTitle className="text-3xl">{periodStats.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Bilhetes com resultado registrado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Desempenho Semanal</CardTitle>
              <CardDescription>Greens vs Reds nos últimos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="greens" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="reds" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribuição de Risco</CardTitle>
              <CardDescription>Classificação das suas apostas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <RechartsPie>
                    <Pie
                      data={riskDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={false}
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RechartsPie>
                </ChartContainer>
              </div>
              {/* Custom Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {riskDistribution.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {entry.name}: {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bettor Profile (Pro Plan) */}
        {isProPlan ? (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Seu Perfil de Apostador
              </CardTitle>
              <CardDescription>
                Baseado no seu histórico de análises
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bettorProfile ? (
                <div className="flex items-center gap-4">
                  <div className={`h-16 w-16 rounded-2xl ${bettorProfile.bgColor} flex items-center justify-center`}>
                    <bettorProfile.icon className={`h-8 w-8 ${bettorProfile.color}`} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-semibold ${bettorProfile.color}`}>
                      {bettorProfile.label}
                    </h3>
                    <p className="text-muted-foreground">{bettorProfile.description}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Analise pelo menos 5 bilhetes para descobrir seu perfil.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
              <div>
                <h3 className="font-semibold text-lg">Descubra seu perfil de apostador</h3>
                <p className="text-sm text-muted-foreground">
                  Esse recurso ajuda a tomar decisões com mais contexto. Disponível no plano PRO.
                </p>
              </div>
              <Button className="gradient-primary text-primary-foreground whitespace-nowrap">
                Upgrade para Pro
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tips Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dicas de Performance</CardTitle>
            <CardDescription>Recomendações baseadas nas suas estatísticas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {periodStats.winRate < 50 && periodStats.total >= 5 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-risk-high/10 border border-risk-high/20">
                <AlertTriangle className="h-5 w-5 text-risk-high flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-risk-high">Taxa de acerto abaixo de 50%</p>
                  <p className="text-sm text-muted-foreground">
                    Considere reduzir o número de seleções por bilhete ou focar em mercados com maior probabilidade.
                  </p>
                </div>
              </div>
            )}
            {riskDistribution[2].value > riskDistribution[0].value && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-risk-medium/10 border border-risk-medium/20">
                <Target className="h-5 w-5 text-risk-medium flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-risk-medium">Muitas apostas de alto risco</p>
                  <p className="text-sm text-muted-foreground">
                    Seu histórico mostra preferência por apostas arriscadas. Diversifique com opções mais conservadoras.
                  </p>
                </div>
              </div>
            )}
            {periodStats.total === 0 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted border">
                <BarChart3 className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Registre seus resultados</p>
                  <p className="text-sm text-muted-foreground">
                    Registre o resultado dos seus bilhetes para que o sistema identifique padrões de risco.
                  </p>
                </div>
              </div>
            )}
            {periodStats.winRate >= 50 && periodStats.total >= 5 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-risk-low/10 border border-risk-low/20">
                <Trophy className="h-5 w-5 text-risk-low flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-risk-low">Bom desempenho!</p>
                  <p className="text-sm text-muted-foreground">
                    Continue mantendo a disciplina e seguindo as análises de risco.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
