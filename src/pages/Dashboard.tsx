import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  History,
  BarChart3,
  Settings,
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
import { ThemeToggle } from "@/components/ThemeToggle";
import { PlanBadge } from "@/components/PlanBadge";
import { RiskBadge } from "@/components/RiskBadge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useAnalyses } from "@/hooks/useAnalyses";
import { uploadTicketImage, createAnalysis, fileToBase64, analyzeTicket } from "@/lib/uploadTicket";
import { supabase } from "@/integrations/supabase/client";

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
    
    // Check daily limit - map legacy plan names
    const planLimits: Record<string, number> = {
      'free': 1,
      'start': 1,
      'intermediate': 10,
      'control': 10,
      'advanced': Infinity,
      'pro_analysis': Infinity,
    };
    const limit = planLimits[profile?.current_plan || 'free'] ?? 1;
    
    if ((profile?.daily_analyses_used ?? 0) >= limit) {
      toast({
        title: "Limite diário atingido",
        description: "Considere fazer upgrade para mais análises diárias.",
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
    const plan = profile?.current_plan || 'free';
    const limits: Record<string, string | number> = {
      'free': 1,
      'start': 1,
      'intermediate': 10,
      'control': 10,
      'advanced': '∞',
      'pro_analysis': '∞',
    };
    return limits[plan] ?? 1;
  };

  const getPlanDisplayName = () => {
    const plan = profile?.current_plan || 'free';
    const names: Record<string, string> = {
      'free': 'Start',
      'start': 'Start',
      'intermediate': 'Control',
      'control': 'Control',
      'advanced': 'Pro Analysis',
      'pro_analysis': 'Pro Analysis',
    };
    return names[plan] ?? 'Start';
  };

  const isFreePlan = () => {
    const plan = profile?.current_plan || 'free';
    return plan === 'free';
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-6">
          <Logo size="sm" />
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <Button variant="secondary" className="w-full justify-start gap-3">
            <Upload className="h-4 w-4" />
            Nova Análise
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3"
            onClick={() => navigate("/history")}
          >
            <History className="h-4 w-4" />
            Histórico
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3">
            <BarChart3 className="h-4 w-4" />
            Estatísticas
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Settings className="h-4 w-4" />
            Configurações
          </Button>
        </nav>

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
              <Logo size="sm" />
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="px-4 space-y-2">
              <Button variant="secondary" className="w-full justify-start gap-3" onClick={() => setSidebarOpen(false)}>
                <Upload className="h-4 w-4" />
                Nova Análise
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3"
                onClick={() => {
                  setSidebarOpen(false);
                  navigate("/history");
                }}
              >
                <History className="h-4 w-4" />
                Histórico
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <BarChart3 className="h-4 w-4" />
                Estatísticas
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Settings className="h-4 w-4" />
                Configurações
              </Button>
            </nav>

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
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  {profile?.daily_analyses_used || 0}/{getAnalysesLimit()} análises hoje
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 space-y-6">
          {/* Upload Zone */}
          <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
            <div
              {...getRootProps()}
              className={`p-8 md:p-12 text-center cursor-pointer transition-all ${
                isDragActive ? "bg-primary/5" : ""
              }`}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <LoadingSpinner size="lg" text="Analisando riscos do seu bilhete..." />
              ) : (
                <>
                  <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                    <ImageIcon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {isDragActive ? "Solte a imagem aqui" : "Analise os riscos do seu bilhete"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Envie uma imagem e descubra onde sua aposta pode falhar
                  </p>
                  <Button className="gradient-primary text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Analisar Bilhete
                  </Button>
                </>
              )}
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Análises Hoje</CardDescription>
                <CardTitle className="text-3xl">
                  {profile?.daily_analyses_used || 0}
                  <span className="text-lg text-muted-foreground">/{getAnalysesLimit()}</span>
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Taxa de Acerto</CardDescription>
                <CardTitle className="text-3xl text-primary">{stats.winRate}%</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Greens no Mês</CardDescription>
                <CardTitle className="text-3xl text-risk-low">{stats.thisMonthGreens}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Reds no Mês</CardDescription>
                <CardTitle className="text-3xl text-risk-high">{stats.thisMonthReds}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Recent Analyses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Análises Recentes</CardTitle>
                <CardDescription>Suas últimas análises de bilhetes</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1"
                onClick={() => navigate("/history")}
              >
                Ver todas
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentAnalyses.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Você ainda não fez nenhuma análise.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAnalyses.map((analysis) => {
                    const betsCount = analysis.extracted_data?.bets?.length || 0;
                    
                    return (
                      <div
                        key={analysis.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => navigate(`/analysis/${analysis.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {betsCount > 0 ? `${betsCount} jogos` : "Análise"}
                            </p>
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
                        <div className="flex items-center gap-3">
                          {analysis.overall_risk && (
                            <RiskBadge level={analysis.overall_risk} size="sm" showLabel={false} />
                          )}
                          {analysis.is_green !== null && (
                            <span
                              className={`text-sm font-medium ${
                                analysis.is_green ? "text-risk-low" : "text-risk-high"
                              }`}
                            >
                              {analysis.is_green ? "GREEN ✓" : "RED ✗"}
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upgrade Banner for Free Users */}
          {isFreePlan() && (
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
                <div>
                  <h3 className="font-semibold text-lg">Quer analisar mais bilhetes?</h3>
                  <p className="text-muted-foreground">
                    Com o plano Control, você tem até 10 análises por dia e sugestões de linhas menos agressivas.
                  </p>
                </div>
                <Button className="gradient-primary text-primary-foreground whitespace-nowrap">
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
