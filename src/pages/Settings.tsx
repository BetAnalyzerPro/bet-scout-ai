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
  ExternalLink,
  Loader2,
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
import { getPlanFromDbValue, isFreePlan, PAYWALL_MESSAGES } from "@/config/plans";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
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
  const { isLoading: isPortalLoading, handleCustomerPortal } = useStripeCheckout();

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
    const planConfig = getPlanFromDbValue(profile?.current_plan || "free");
    return planConfig.name;
  };

  const getPlanPrice = () => {
    const planConfig = getPlanFromDbValue(profile?.current_plan || "free");
    return planConfig.price + planConfig.period;
  };

  const checkIsFreePlan = () => {
    return isFreePlan(profile?.current_plan || "free");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-base sm:text-xl font-semibold">Configurações</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Gerencie sua conta e preferências</p>
          </div>
        </div>
      </header>

      <main className="p-3 sm:p-4 md:p-6 max-w-2xl mx-auto space-y-4 sm:space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              Perfil
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Informações da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary text-xl sm:text-2xl font-semibold">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-base sm:text-lg truncate">{profile?.full_name || "Usuário"}</p>
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="fullName" className="text-sm">Nome completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome"
                className="h-11 sm:h-10"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="email" className="text-sm">E-mail</Label>
              <Input id="email" value={user?.email || ""} disabled className="bg-muted h-11 sm:h-10" />
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                O e-mail não pode ser alterado
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Plan Section */}
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
              Plano Atual
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Gerencie sua assinatura</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/50 gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm sm:text-base">{getPlanDisplayName()}</p>
                    <PlanBadge plan={profile?.current_plan || "free"} size="sm" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{getPlanPrice()}</p>
                  {profile?.plan_status && profile.plan_status !== "active" && (
                    <p className="text-xs text-warning mt-1">
                      Status: {profile.plan_status === "past_due" ? "Pagamento pendente" : 
                              profile.plan_status === "canceled" ? "Cancelado" : profile.plan_status}
                    </p>
                  )}
                </div>
              </div>
              {!checkIsFreePlan() && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 px-3 flex-shrink-0"
                  onClick={handleCustomerPortal}
                  disabled={isPortalLoading}
                >
                  {isPortalLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Gerenciar</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Manage subscription button for paid users */}
            {!checkIsFreePlan() && (
              <Button 
                variant="outline" 
                className="w-full justify-between h-11 sm:h-10"
                onClick={handleCustomerPortal}
                disabled={isPortalLoading}
              >
                <span className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4" />
                  Gerenciar assinatura
                </span>
                {isPortalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
              </Button>
            )}

            {checkIsFreePlan() && (
              <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <p className="font-medium text-sm sm:text-base mb-1">{PAYWALL_MESSAGES.upgradeTitle}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  {PAYWALL_MESSAGES.upgradeDescription}
                </p>
                <Button 
                  className="gradient-primary text-primary-foreground h-10 sm:h-9" 
                  size="sm"
                  asChild
                >
                  <a href="/#planos">Ver Planos</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              Notificações
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Configure como você quer receber atualizações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <Label htmlFor="emailNotifications" className="font-medium text-sm">
                  Notificações por e-mail
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
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

            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <Label htmlFor="marketingConsent" className="font-medium text-sm">
                  Conteúdos educativos
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
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
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-4 w-4 sm:h-5 sm:w-5" /> : <Sun className="h-4 w-4 sm:h-5 sm:w-5" />}
              Aparência
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Personalize a interface do aplicativo</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <Label className="font-medium text-sm">Tema escuro</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {theme === "dark" ? "Modo escuro ativado" : "Modo claro ativado"}
                </p>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
              Segurança
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Opções de segurança e privacidade</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
            <Button variant="outline" className="w-full justify-between h-11 sm:h-10" disabled>
              <span className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" />
                Alterar senha
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Separator />

            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Seus dados são protegidos e tratados de acordo com a LGPD.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          className="w-full gradient-primary text-primary-foreground h-12 sm:h-11"
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
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
              Zona de Perigo
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Ações irreversíveis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-11 sm:h-10"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sair da conta
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full justify-start gap-2 h-11 sm:h-10">
                  <Trash2 className="h-4 w-4" />
                  Excluir conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4 max-w-[calc(100%-2rem)] sm:max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-base sm:text-lg">Excluir conta permanentemente?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm">
                    Esta ação não pode ser desfeita. Todos os seus dados, análises e histórico serão
                    permanentemente excluídos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                  <AlertDialogCancel className="h-11 sm:h-10">Cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-11 sm:h-10">
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
