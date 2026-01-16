import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  CreditCard,
  Mail,
  Moon,
  Sun,
  ChevronRight,
  LogOut,
  Trash2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { PlanBadge } from "@/components/PlanBadge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [emailNotifications, setEmailNotifications] = useState(profile?.email_notifications ?? true);
  const [marketingConsent, setMarketingConsent] = useState(profile?.marketing_consent ?? false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          email_notifications: emailNotifications,
          marketing_consent: marketingConsent,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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

  const getPlanDisplayName = () => {
    const plan = profile?.current_plan || "free";
    const names: Record<string, string> = {
      free: "Start",
      start: "Start",
      intermediate: "Control",
      control: "Control",
      advanced: "Pro Analysis",
      pro_analysis: "Pro Analysis",
    };
    return names[plan] ?? "Start";
  };

  const getPlanPrice = () => {
    const plan = profile?.current_plan || "free";
    const prices: Record<string, string> = {
      free: "Gratuito",
      start: "Gratuito",
      intermediate: "R$ 29,90/mês",
      control: "R$ 29,90/mês",
      advanced: "R$ 99,90/mês",
      pro_analysis: "R$ 99,90/mês",
    };
    return prices[plan] ?? "Gratuito";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Configurações</h1>
            <p className="text-sm text-muted-foreground">Gerencie sua conta e preferências</p>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil
            </CardTitle>
            <CardDescription>Informações da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-2xl font-semibold">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-lg">{profile?.full_name || "Usuário"}</p>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                O e-mail não pode ser alterado
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Plan Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Plano Atual
            </CardTitle>
            <CardDescription>Gerencie sua assinatura</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{getPlanDisplayName()}</p>
                    <PlanBadge plan={profile?.current_plan || "free"} size="sm" />
                  </div>
                  <p className="text-sm text-muted-foreground">{getPlanPrice()}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {["free", "start"].includes(profile?.current_plan || "free") && (
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <p className="font-medium mb-1">Faça upgrade para mais recursos</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Desbloqueie mais análises, relatórios e gestão de banca.
                </p>
                <Button className="gradient-primary text-primary-foreground" size="sm">
                  Ver Planos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>Configure como você quer receber atualizações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications" className="font-medium">
                  Notificações por e-mail
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receba alertas sobre suas análises e relatórios semanais
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketingConsent" className="font-medium">
                  Conteúdos educativos
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receba dicas, guias e conteúdos sobre gestão de apostas
                </p>
              </div>
              <Switch
                id="marketingConsent"
                checked={marketingConsent}
                onCheckedChange={setMarketingConsent}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Aparência
            </CardTitle>
            <CardDescription>Personalize a interface do aplicativo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Tema escuro</Label>
                <p className="text-sm text-muted-foreground">
                  {theme === "dark" ? "Modo escuro ativado" : "Modo claro ativado"}
                </p>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>Opções de segurança e privacidade</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-between" disabled>
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Alterar senha
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Seus dados são protegidos e tratados de acordo com a LGPD.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          className="w-full gradient-primary text-primary-foreground"
          onClick={handleSaveProfile}
          disabled={isSaving}
        >
          {isSaving ? (
            "Salvando..."
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-lg text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Zona de Perigo
            </CardTitle>
            <CardDescription>Ações irreversíveis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sair da conta
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full justify-start gap-2">
                  <Trash2 className="h-4 w-4" />
                  Excluir conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Todos os seus dados, análises e histórico serão
                    permanentemente excluídos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Excluir conta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
