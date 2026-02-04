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
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { PlanBadge } from "@/components/PlanBadge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadTicketImage } from "@/lib/uploadTicket";

type FeedbackResult = "green" | "red";

interface LearningFeedback {
  id: string;
  image_url: string;
  result: FeedbackResult;
  notes: string | null;
  created_at: string;
}

export default function Learning() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<FeedbackResult | null>(null);
  const [notes, setNotes] = useState("");

  // Fetch user's learning feedback
  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ["learning-feedback", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("learning_feedback")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as LearningFeedback[];
    },
    enabled: !!user,
  });

  // Delete feedback mutation
  const deleteMutation = useMutation({
    mutationFn: async (feedbackId: string) => {
      const { error } = await supabase
        .from("learning_feedback")
        .delete()
        .eq("id", feedbackId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-feedback"] });
      toast({
        title: "Feedback removido",
        description: "O registro foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao remover",
        description: "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0 || !user || !selectedResult) {
      if (!selectedResult) {
        toast({
          title: "Selecione o resultado",
          description: "Indique se o bilhete foi GREEN ou RED antes de enviar.",
          variant: "destructive",
        });
      }
      return;
    }
    
    const file = acceptedFiles[0];
    setIsUploading(true);
    
    try {
      toast({
        title: "Enviando feedback...",
        description: "Aguarde enquanto processamos sua imagem.",
      });
      
      const imageUrl = await uploadTicketImage(file, user.id);
      
      const { error } = await supabase
        .from("learning_feedback")
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          result: selectedResult,
          notes: notes || null,
        });

      if (error) throw error;

      toast({
        title: "Resultado registrado! ✓",
        description: "Isso ajuda o sistema a reduzir erros futuros.",
      });

      queryClient.invalidateQueries({ queryKey: ["learning-feedback"] });
      setSelectedResult(null);
      setNotes("");
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [user, selectedResult, notes, toast, queryClient]);

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

  const stats = {
    total: feedbacks.length,
    greens: feedbacks.filter(f => f.result === "green").length,
    reds: feedbacks.filter(f => f.result === "red").length,
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-6">
          <Logo size="sm" />
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3"
            onClick={() => navigate("/dashboard")}
          >
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
          <Button variant="secondary" className="w-full justify-start gap-3">
            <GraduationCap className="h-4 w-4" />
            Aprendizado da IA
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3"
            onClick={() => navigate("/statistics")}
          >
            <BarChart3 className="h-4 w-4" />
            Estatísticas
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3"
            onClick={() => navigate("/settings")}
          >
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
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3"
                onClick={() => {
                  setSidebarOpen(false);
                  navigate("/dashboard");
                }}
              >
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
              <Button variant="secondary" className="w-full justify-start gap-3" onClick={() => setSidebarOpen(false)}>
                <GraduationCap className="h-4 w-4" />
                Aprendizado da IA
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3"
                onClick={() => {
                  setSidebarOpen(false);
                  navigate("/statistics");
                }}
              >
                <BarChart3 className="h-4 w-4" />
                Estatísticas
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3"
                onClick={() => {
                  setSidebarOpen(false);
                  navigate("/settings");
                }}
              >
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
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-semibold">Aprendizado da IA</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Quanto mais resultados você registra, mais o sistema entende seus padrões e identifica riscos recorrentes.
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-1 hidden sm:block">
                  O sistema já começa a identificar padrões no seu comportamento.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
                <CardDescription className="text-xs sm:text-sm">Total</CardDescription>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
                <CardDescription className="text-xs sm:text-sm">Greens</CardDescription>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl text-risk-low">{stats.greens}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
                <CardDescription className="text-xs sm:text-sm">Reds</CardDescription>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl text-risk-high">{stats.reds}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Result Selection */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Enviar Bilhete Concluído</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Primeiro selecione o resultado e depois envie a imagem do bilhete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              {/* Result Buttons */}
              <div className="flex gap-3 sm:gap-4 justify-center">
                <div className="flex-1 max-w-[140px] sm:max-w-48 text-center">
                  <Button
                    size="lg"
                    variant={selectedResult === "green" ? "default" : "outline"}
                    className={`w-full h-14 sm:h-16 gap-2 ${
                      selectedResult === "green" 
                        ? "bg-risk-low hover:bg-risk-low/90 text-white" 
                        : "border-risk-low text-risk-low hover:bg-risk-low/10"
                    }`}
                    onClick={() => setSelectedResult("green")}
                  >
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                    GREEN
                  </Button>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Resultado Positivo</p>
                </div>
                <div className="flex-1 max-w-[140px] sm:max-w-48 text-center">
                  <Button
                    size="lg"
                    variant={selectedResult === "red" ? "default" : "outline"}
                    className={`w-full h-14 sm:h-16 gap-2 ${
                      selectedResult === "red" 
                        ? "bg-risk-high hover:bg-risk-high/90 text-white" 
                        : "border-risk-high text-risk-high hover:bg-risk-high/10"
                    }`}
                    onClick={() => setSelectedResult("red")}
                  >
                    <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                    RED
                  </Button>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Resultado Negativo</p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs sm:text-sm font-medium">Observações (opcional)</label>
                <textarea
                  className="w-full mt-1 p-3 rounded-lg border border-border bg-background resize-none text-sm min-h-[60px] sm:min-h-[52px]"
                  rows={2}
                  placeholder="Ex: O gol saiu no final do segundo tempo..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Upload Zone */}
              <div
                {...getRootProps()}
                className={`p-6 sm:p-8 text-center cursor-pointer border-2 border-dashed rounded-lg transition-all ${
                  isDragActive ? "bg-primary/5 border-primary" : "border-border hover:border-primary/50"
                } ${!selectedResult ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input {...getInputProps()} />
                {isUploading ? (
                  <LoadingSpinner size="lg" text="Enviando feedback..." />
                ) : (
                  <>
                    <GraduationCap className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {selectedResult 
                        ? "Arraste ou clique para enviar a imagem do bilhete"
                        : "Selecione GREEN ou RED acima primeiro"
                      }
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Feedbacks */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Feedbacks Recentes</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Bilhetes que você enviou para aprendizado</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {isLoading ? (
                <LoadingSpinner text="Carregando..." />
              ) : feedbacks.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Você ainda não enviou nenhum feedback.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Registre o resultado dos seus bilhetes para que o sistema identifique padrões de risco.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-4">
                  {feedbacks.slice(0, 10).map((feedback) => (
                    <div
                      key={feedback.id}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/50 gap-2"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          feedback.result === "green" ? "bg-risk-low/20" : "bg-risk-high/20"
                        }`}>
                          {feedback.result === "green" ? (
                            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-risk-low" />
                          ) : (
                            <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-risk-high" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm sm:text-base">
                            {feedback.result === "green" ? "GREEN ✓" : "RED ✗"}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {new Date(feedback.created_at).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {feedback.notes && (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                              {feedback.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-10 w-10 flex-shrink-0"
                        onClick={() => deleteMutation.mutate(feedback.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
