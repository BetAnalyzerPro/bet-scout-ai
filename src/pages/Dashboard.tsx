import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  LogOut,
  Menu,
  X,
  Plus,
  Clock,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { PlanBadge } from "@/components/PlanBadge";
import { SidebarNav, MobileSidebarNav } from "@/components/SidebarNav";
import { RiskBadge } from "@/components/RiskBadge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useAnalyses } from "@/hooks/useAnalyses";
import { uploadTicketImage, createAnalysis, fileToBase64, analyzeTicket } from "@/lib/uploadTicket";
import { supabase } from "@/integrations/supabase/client";
import { getDailyLimit, getDisplayLimit, isFreePlan, getPlanFromDbValue, PAYWALL_MESSAGES } from "@/config/plans";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const { recentAnalyses, stats, refetch } = useAnalyses();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0 || !user) return;
    
    const file = acceptedFiles[0];
    
    // Check daily limit using centralized config
    const limit = getDailyLimit(profile?.current_plan || 'free');
    
    if ((profile?.daily_analyses_used ?? 0) >= limit) {
      toast({
        title: "Limite diário atingido",
        description: PAYWALL_MESSAGES.limitReached,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Convert file to base64 for the AI
      const base64 = await fileToBase64(file);

      // Upload image to storage
      toast({
        title: "Enviando imagem...",
        description: "Aguarde enquanto processamos sua imagem.",
      });
      
      const imageUrl = await uploadTicketImage(file, user.id);
      
      // Create analysis record
      const analysisId = await createAnalysis(user.id, imageUrl);

      // Analyze with AI
      toast({
        title: "Analisando bilhete...",
        description: "Nossa IA está processando suas apostas.",
      });

      await analyzeTicket(base64, analysisId, session.access_token);

      toast({
        title: "Análise concluída! ✓",
        description: "Redirecionando para os resultados...",
      });

      // Refetch analyses and redirect
      refetch();
      navigate(`/analysis/${analysisId}`);
      
    } catch (error) {
      console.error("Error analyzing ticket:", error);
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Tente novamente com uma imagem mais clara.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [user, profile, toast, navigate, refetch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".heic", ".webp"],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Até logo!",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getAnalysesLimit = () => {
    return getDisplayLimit(profile?.current_plan || 'free');
  };

  const getPlanDisplayName = () => {
    const planConfig = getPlanFromDbValue(profile?.current_plan || 'free');
    return planConfig.name;
  };

  const checkIsFreePlan = () => {
    return isFreePlan(profile?.current_plan || 'free');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-6">
          <Logo size="lg" />
        </div>

        <SidebarNav
          activePage="dashboard"
          userPlan={profile?.current_plan || "free"}
          userName={profile?.full_name || "Usuário"}
          userInitial={profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
          onSignOut={handleSignOut}
        />

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {profile?.full_name || "Usuário"}
              </p>
              <PlanBadge plan={profile?.current_plan || "free"} size="sm" />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border animate-slide-in-from-left">
            <div className="flex items-center justify-between p-6">
              <Logo size="lg" />
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <MobileSidebarNav
              activePage="dashboard"
              userPlan={profile?.current_plan || "free"}
              userName={profile?.full_name || "Usuário"}
              userInitial={profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
              onSignOut={handleSignOut}
              onClose={() => setSidebarOpen(false)}
            />

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {profile?.full_name || "Usuário"}
                  </p>
                  <PlanBadge plan={profile?.current_plan || "free"} size="sm" />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b border-border/50">
          <div className="flex items-center justify-between p-3 sm:p-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-10 w-10"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              {/* Reforço de posicionamento */}
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold">Dashboard</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {getAnalysesLimit() === "∞" 
                    ? "Você possui análises ilimitadas hoje."
                    : getDailyLimit(profile?.current_plan || 'free') - (profile?.daily_analyses_used || 0) > 0 
                    ? `Você ainda pode analisar mais ${getDailyLimit(profile?.current_plan || 'free') - (profile?.daily_analyses_used || 0)} bilhetes hoje.`
                    : "Limite diário atingido. Volte amanhã ou faça upgrade."
                  }
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-0.5 hidden sm:block">
                  Decidir com mais consciência é melhor do que apostar por impulso.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          {/* Welcome Message for First-Time Users */}
          {stats.total === 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 sm:p-5">
                <h3 className="font-semibold text-sm sm:text-base mb-1">Bem-vindo ao Bet Analizer.</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  O primeiro passo não é apostar — é entender os riscos do seu bilhete.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Upload Zone */}
          <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
            <div
              {...getRootProps()}
              className={`p-6 sm:p-8 md:p-12 text-center cursor-pointer transition-all ${
                isDragActive ? "bg-primary/5" : ""
              }`}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <LoadingSpinner size="lg" text="Estamos analisando seu bilhete com base em dados e contexto, não em promessas." />
              ) : (
                <>
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2">
                    {isDragActive ? "Solte a imagem aqui" : "Analise os riscos do seu bilhete"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 sm:mb-4 px-2">
                    {stats.total === 0 
                      ? "Escolha um bilhete que você está pensando em apostar ou já apostou."
                      : "Envie uma imagem e descubra onde sua aposta pode falhar"
                    }
                  </p>
                  <Button className="gradient-primary text-primary-foreground h-11 sm:h-10">
                    <Plus className="h-4 w-4 mr-2" />
                    Analisar Bilhete
                  </Button>
                  {stats.total === 0 && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-3">
                      Envie a imagem do seu bilhete para identificar riscos antes de apostar.
                    </p>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
                <CardDescription className="text-xs sm:text-sm">Análises Hoje</CardDescription>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl">
                  {profile?.daily_analyses_used || 0}
                  <span className="text-sm sm:text-lg text-muted-foreground">/{getAnalysesLimit()}</span>
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
                <CardDescription className="text-xs sm:text-sm">Taxa de Acerto</CardDescription>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl text-primary">{stats.winRate}%</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
                <CardDescription className="text-xs sm:text-sm flex items-center gap-1">
                  Greens
                  <span className="text-[10px] text-muted-foreground/70 hidden sm:inline">(Positivo)</span>
                </CardDescription>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl text-risk-low">{stats.thisMonthGreens}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
                <CardDescription className="text-xs sm:text-sm flex items-center gap-1">
                  Reds
                  <span className="text-[10px] text-muted-foreground/70 hidden sm:inline">(Negativo)</span>
                </CardDescription>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl text-risk-high">{stats.thisMonthReds}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Contextual Microfeedback */}
          {stats.total < 5 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Você ainda não tem dados suficientes para análises confiáveis. Continue analisando seus bilhetes para construir seu perfil.
                </p>
              </CardContent>
            </Card>
          )}
          
          {stats.total >= 5 && stats.winRate < 40 && (
            <Card className="border-risk-medium/20 bg-risk-medium/5">
              <CardContent className="p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Seu padrão atual indica maior exposição ao risco. Considere revisar suas escolhas com mais atenção.
                </p>
              </CardContent>
            </Card>
          )}
          
          {stats.total >= 10 && (
            <Card className="border-primary/10 bg-muted/30">
              <CardContent className="p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Você está construindo seu perfil de apostador. Seus dados estão ficando mais consistentes.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Recent Analyses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
              <div>
                <CardTitle className="text-base sm:text-lg">Análises Recentes</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Suas últimas análises de bilhetes</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1 h-9 px-2 sm:px-3"
                onClick={() => navigate("/history")}
              >
                <span className="hidden sm:inline">Ver todas</span>
                <span className="sm:hidden">Ver</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {recentAnalyses.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Você ainda não fez nenhuma análise.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Quanto mais bilhetes você analisa e registra, mais precisas ficam suas estatísticas.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-4">
                  {recentAnalyses.map((analysis) => {
                    const betsCount = analysis.extracted_data?.bets?.length || 0;
                    
                    return (
                      <div
                        key={analysis.id}
                        className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer min-h-[56px] active:bg-muted/80"
                        onClick={() => navigate(`/analysis/${analysis.id}`)}
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm sm:text-base truncate">
                              {betsCount > 0 ? `${betsCount} jogos` : "Análise"}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {new Date(analysis.created_at).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                          {analysis.overall_risk && (
                            <RiskBadge level={analysis.overall_risk} size="sm" showLabel={false} />
                          )}
                          {analysis.is_green !== null && (
                            <span
                              className={`text-xs sm:text-sm font-medium ${
                                analysis.is_green ? "text-risk-low" : "text-risk-high"
                              }`}
                            >
                              {analysis.is_green ? "GREEN ✓" : "RED ✗"}
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Post First Analysis Feedback */}
          {stats.total === 1 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Este é apenas o começo. Quanto mais bilhetes você analisa, mais claros ficam seus padrões.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Free Plan Context Message */}
          {checkIsFreePlan() && stats.total >= 1 && stats.total <= 3 && (
            <Card className="border-muted bg-muted/30">
              <CardContent className="p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Seu plano permite análises limitadas por dia para incentivar decisões conscientes.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Upgrade Banner for Free Users */}
          {checkIsFreePlan() && (
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6">
                <div className="text-center sm:text-left">
                  <h3 className="font-semibold text-base sm:text-lg">{PAYWALL_MESSAGES.upgradeTitle}</h3>
                  <p className="text-sm text-muted-foreground">
                    {PAYWALL_MESSAGES.upgradeDescription}
                  </p>
                </div>
                <Button className="gradient-primary text-primary-foreground whitespace-nowrap w-full sm:w-auto h-11 sm:h-10">
                  Conhecer Planos
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
