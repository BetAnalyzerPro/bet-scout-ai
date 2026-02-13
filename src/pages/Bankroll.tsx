import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ArrowLeft,
  LogOut,
  Upload,
  Wallet,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Check,
  ChevronRight,
  Filter,
  Calendar,
  Info,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { PlanBadge } from "@/components/PlanBadge";
import { SidebarNav, MobileSidebarNav } from "@/components/SidebarNav";
import { RiskBadge } from "@/components/RiskBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useBankroll, BankrollEntry } from "@/hooks/useBankroll";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";
import { canAccessBankrollFeature, getBankrollTier } from "@/lib/bankrollAccess";
import type { BankrollFeature } from "@/lib/bankrollAccess";

export default function Bankroll() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const {
    settings,
    entries,
    loading,
    saving,
    saveSettings,
    addEntry,
    updateEntryStatus,
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
  } = useBankroll();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Form states
  const [bancaAtual, setBancaAtual] = useState("");
  const [limiteMensal, setLimiteMensal] = useState("");
  const [percentualStake, setPercentualStake] = useState("1");
  const [smartRisk, setSmartRisk] = useState(false);

  // Entry form
  const [entryStake, setEntryStake] = useState("");
  const [entryOdd, setEntryOdd] = useState("");
  const [entryType, setEntryType] = useState<"simples" | "multipla">("simples");

  // Filters
  const [periodFilter, setPeriodFilter] = useState("7");
  const [statusFilter, setStatusFilter] = useState("all");

  const alerts = generateAlerts();
  const bankrollTier = getBankrollTier(currentPlan);
  const canRegisterEntry = canAccessBankrollFeature("register_entry", currentPlan);
  const canViewHistory = canAccessBankrollFeature("view_history", currentPlan);
  const canUseSmartRiskFeature = canAccessBankrollFeature("smart_risk", currentPlan);
  const canViewAdvancedStats = canAccessBankrollFeature("advanced_stats", currentPlan);

  // Initialize form with settings
  useEffect(() => {
    if (settings) {
      setBancaAtual(settings.banca_atual.toString());
      setLimiteMensal(settings.limite_mensal_exposicao?.toString() || "");
      setPercentualStake(settings.percentual_stake_base.toString());
      setSmartRisk(settings.smart_risk_adjustment);
    }
  }, [settings]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleSaveSettings = () => {
    saveSettings({
      banca_atual: parseFloat(bancaAtual) || 0,
      limite_mensal_exposicao: limiteMensal ? parseFloat(limiteMensal) : null,
      percentual_stake_base: parseFloat(percentualStake) || 1,
      smart_risk_adjustment: smartRisk,
    });
  };

  const handleAddEntry = async () => {
    const stake = parseFloat(entryStake);
    if (!stake || stake <= 0) return;

    const success = await addEntry({
      stake,
      odd_total: entryOdd ? parseFloat(entryOdd) : null,
      bet_type: entryType,
      status: "open",
      linked_analysis_id: null,
      risk_level: null,
    });

    if (success) {
      setEntryStake("");
      setEntryOdd("");
      setEntryType("simples");
    }
  };

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    // Period filter
    const entryDate = new Date(entry.created_at);
    const now = new Date();
    
    if (periodFilter === "0") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (entryDate < today) return false;
    } else if (periodFilter === "7") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      if (entryDate < weekAgo) return false;
    } else if (periodFilter === "30") {
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);
      if (entryDate < monthAgo) return false;
    }

    // Status filter
    if (statusFilter !== "all" && entry.status !== statusFilter) return false;

    return true;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusColor = (status: "open" | "green" | "red") => {
    switch (status) {
      case "green": return "text-risk-low bg-risk-low/10";
      case "red": return "text-risk-high bg-risk-high/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const getExposureColor = (status: "green" | "yellow" | "red") => {
    switch (status) {
      case "green": return "text-risk-low border-risk-low/30 bg-risk-low/5";
      case "yellow": return "text-risk-medium border-risk-medium/30 bg-risk-medium/5";
      case "red": return "text-risk-high border-risk-high/30 bg-risk-high/5";
    }
  };

  const canUseSmartRisk = currentPlan === "advanced" || currentPlan === "elite";
  const canSeeAlerts = currentPlan !== "free";
  const canExportCSV = currentPlan === "elite";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Carregando gestão de banca..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-6">
          <Logo size="lg" />
        </div>

        <SidebarNav
          activePage="bankroll"
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
              activePage="bankroll"
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
              <div>
                <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Gestão de Banca
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Controle sua exposição e stake
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-5xl mx-auto w-full">
          {/* FREE Plan Banner */}
          {bankrollTier === "free" && (
            <Card className="border-l-4 border-l-primary bg-primary/5">
              <CardContent className="p-4 flex items-start gap-3">
                <Lock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary mb-2">
                    🔒 A Gestão de Banca ajuda você a controlar risco e exposição.
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Disponível a partir do plano Basic.
                  </p>
                  <Button size="sm" onClick={() => navigate("/#planos")}>
                    👉 Desbloquear Gestão de Banca
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* BASIC+ Plan Upsell Banner */}
          {bankrollTier === "basic" && (
            <Card className="border-l-4 border-l-primary/50 bg-primary/2">
              <CardContent className="p-3 flex items-start gap-2">
                <Lock className="h-4 w-4 text-primary/70 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  🔒 Análise comportamental avançada e Smart Risk disponíveis no plano Pro.
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="ml-2 h-auto p-0 text-primary underline"
                    onClick={() => navigate("/#planos")}
                  >
                    Evoluir para Pro →
                  </Button>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Alerts Section */}
          {canSeeAlerts && alerts.length > 0 && (
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <Card key={index} className={cn(
                  "border-l-4",
                  alert.severity === "danger" ? "border-l-risk-high bg-risk-high/5" : "border-l-risk-medium bg-risk-medium/5"
                )}>
                  <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                    <AlertTriangle className={cn(
                      "h-5 w-5 shrink-0",
                      alert.severity === "danger" ? "text-risk-high" : "text-risk-medium"
                    )} />
                    <p className="text-sm flex-1">{alert.message}</p>
                    <Button variant="ghost" size="sm" className="shrink-0">
                      <Info className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Tabs for mobile navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4 h-auto">
              <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">Visão Geral</TabsTrigger>
              <TabsTrigger value="register" className="text-xs sm:text-sm py-2">Registrar</TabsTrigger>
              <TabsTrigger value="entries" className="text-xs sm:text-sm py-2">Apostas</TabsTrigger>
              <TabsTrigger value="stats" className="text-xs sm:text-sm py-2">Resumo</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Section A - My Bankroll */}
              <div className={bankrollTier === "free" ? "blur-sm pointer-events-none" : ""}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Minha Banca
                  </CardTitle>
                  <CardDescription>
                    O objetivo aqui não é ganhar mais. É evitar decisões que te colocam em risco.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="banca">Banca Atual (R$)</Label>
                      <Input
                        id="banca"
                        type="number"
                        placeholder="0,00"
                        value={bancaAtual}
                        onChange={(e) => setBancaAtual(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="limite">Limite Mensal (R$) <span className="text-muted-foreground">(opcional)</span></Label>
                      <Input
                        id="limite"
                        type="number"
                        placeholder="0,00"
                        value={limiteMensal}
                        onChange={(e) => setLimiteMensal(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="percentual">Stake Base (%)</Label>
                      <Input
                        id="percentual"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="10"
                        placeholder="1"
                        value={percentualStake}
                        onChange={(e) => setPercentualStake(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveSettings} disabled={saving} className="w-full sm:w-auto">
                    {saving ? "Salvando..." : "Salvar Configurações"}
                  </Button>

                  {/* Calculated values */}
                  {settings && (
                    <div className="pt-4 border-t border-border space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Stake recomendada (base):</span>
                        <span className="font-semibold text-primary">{formatCurrency(stakeBase)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Limite diário sugerido:</span>
                        <span className="font-medium">{formatCurrency(dailyLimit)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Limite semanal sugerido:</span>
                        <span className="font-medium">{formatCurrency(weeklyLimit)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              </div>

              {/* Section B - Smart Risk Adjustment */}
              <div className={!canUseSmartRiskFeature ? "blur-sm" : ""}>
              <Card className={!canUseSmartRiskFeature ? "opacity-75" : ""}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    Ajuste Inteligente por Risco
                    {!canUseSmartRiskFeature && <Lock className="h-4 w-4 text-muted-foreground" />}
                  </CardTitle>
                  <CardDescription>
                    Quanto maior o risco do bilhete, menor a stake recomendada.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Ativar ajuste automático</p>
                      <p className="text-xs text-muted-foreground">
                        Baixo: 1.0x | Médio: 0.7x | Alto: 0.4x
                      </p>
                    </div>
                    {canUseSmartRiskFeature ? (
                      <Switch
                        checked={smartRisk}
                        onCheckedChange={(checked) => {
                          setSmartRisk(checked);
                          saveSettings({ smart_risk_adjustment: checked });
                        }}
                      />
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Plano Pro+
                      </Badge>
                    )}
                  </div>

                  {smartRisk && canUseSmartRisk && settings && (
                    <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-risk-low/10">
                        <p className="text-xs text-muted-foreground">Baixo</p>
                        <p className="font-semibold text-risk-low">{formatCurrency(getAdjustedStake("low"))}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-risk-medium/10">
                        <p className="text-xs text-muted-foreground">Médio</p>
                        <p className="font-semibold text-risk-medium">{formatCurrency(getAdjustedStake("medium"))}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-risk-high/10">
                        <p className="text-xs text-muted-foreground">Alto</p>
                        <p className="font-semibold text-risk-high">{formatCurrency(getAdjustedStake("high"))}</p>
                      </div>
                    </div>
                   )}
                </CardContent>
              </Card>
              </div>

              {/* Section C - Exposure Cards */}
              <div className="grid gap-3 sm:grid-cols-3">
                <Card className={cn("border-2", getExposureColor(getExposureStatus(exposureToday, dailyLimit)))}>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Exposição Hoje</p>
                    <p className="text-xl font-bold">{formatCurrency(exposureToday)}</p>
                    <p className="text-xs mt-1">
                      {getExposureStatus(exposureToday, dailyLimit) === "green" && "Dentro do limite"}
                      {getExposureStatus(exposureToday, dailyLimit) === "yellow" && "Próximo do limite"}
                      {getExposureStatus(exposureToday, dailyLimit) === "red" && "Acima do limite"}
                    </p>
                  </CardContent>
                </Card>

                <Card className={cn("border-2", getExposureColor(getExposureStatus(exposureWeek, weeklyLimit)))}>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Exposição Semana</p>
                    <p className="text-xl font-bold">{formatCurrency(exposureWeek)}</p>
                    <p className="text-xs mt-1">
                      {getExposureStatus(exposureWeek, weeklyLimit) === "green" && "Dentro do limite"}
                      {getExposureStatus(exposureWeek, weeklyLimit) === "yellow" && "Próximo do limite"}
                      {getExposureStatus(exposureWeek, weeklyLimit) === "red" && "Acima do limite"}
                    </p>
                  </CardContent>
                </Card>

                <Card className={cn("border-2", getExposureColor(getExposureStatus(exposureMonth, monthlyLimit)))}>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Exposição Mês</p>
                    <p className="text-xl font-bold">{formatCurrency(exposureMonth)}</p>
                    <p className="text-xs mt-1">
                      {getExposureStatus(exposureMonth, monthlyLimit) === "green" && "Dentro do limite"}
                      {getExposureStatus(exposureMonth, monthlyLimit) === "yellow" && "Próximo do limite"}
                      {getExposureStatus(exposureMonth, monthlyLimit) === "red" && "Acima do limite"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="space-y-4 mt-4">
              {bankrollTier === "free" && (
                <Card className="border-l-4 border-l-primary bg-primary/5">
                  <CardContent className="p-4 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Registrar apostas é um recurso do plano Basic+.
                    </p>
                  </CardContent>
                </Card>
              )}
              <div className={bankrollTier === "free" ? "blur-sm pointer-events-none" : ""}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Registrar Aposta</CardTitle>
                  <CardDescription>
                    Registre rapidamente suas apostas para controlar exposição.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!canAddEntry() && (
                    <div className="p-3 rounded-lg bg-risk-medium/10 border border-risk-medium/30 text-sm">
                      <p className="font-medium text-risk-medium">Limite diário atingido</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Você registrou {getTodayEntriesCount()}/{getDailyEntriesLimit()} apostas hoje.
                      </p>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="stake">Stake (R$) *</Label>
                      <Input
                        id="stake"
                        type="number"
                        placeholder="0,00"
                        value={entryStake}
                        onChange={(e) => setEntryStake(e.target.value)}
                        disabled={!canAddEntry()}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="odd">Odd Total <span className="text-muted-foreground">(opcional)</span></Label>
                      <Input
                        id="odd"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={entryOdd}
                        onChange={(e) => setEntryOdd(e.target.value)}
                        disabled={!canAddEntry()}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Aposta *</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={entryType === "simples" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setEntryType("simples")}
                        disabled={!canAddEntry()}
                      >
                        Simples
                      </Button>
                      <Button
                        type="button"
                        variant={entryType === "multipla" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setEntryType("multipla")}
                        disabled={!canAddEntry()}
                      >
                        Múltipla
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={handleAddEntry} 
                    disabled={saving || !canAddEntry() || !entryStake}
                    className="w-full"
                  >
                    {saving ? "Salvando..." : "Registrar Aposta"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    {getTodayEntriesCount()}/{getDailyEntriesLimit()} registros hoje
                  </p>
                </CardContent>
              </Card>
              </div>
            </TabsContent>

            {/* Entries Tab */}
            <TabsContent value="entries" className="space-y-4 mt-4">
              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Hoje</SelectItem>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="all">Tudo</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="open">Em aberto</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Entries List */}
              {filteredEntries.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Nenhuma aposta encontrada</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {filteredEntries.map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">{formatCurrency(entry.stake)}</span>
                              <Badge variant="outline" className="text-xs">
                                {entry.bet_type === "simples" ? "Simples" : "Múltipla"}
                              </Badge>
                              {entry.odd_total && (
                                <Badge variant="secondary" className="text-xs">
                                  @{entry.odd_total.toFixed(2)}
                                </Badge>
                              )}
                              {entry.risk_level && (
                                <RiskBadge level={entry.risk_level} size="sm" showLabel={false} />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(entry.created_at).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {entry.status === "open" ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-risk-low border-risk-low/50 hover:bg-risk-low/10"
                                  onClick={() => updateEntryStatus(entry.id, "green")}
                                  disabled={saving}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-risk-high border-risk-high/50 hover:bg-risk-high/10"
                                  onClick={() => updateEntryStatus(entry.id, "red")}
                                  disabled={saving}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(entry.status)}>
                                  {entry.status === "green" ? "GREEN" : "RED"}
                                </Badge>
                                {entry.profit_loss !== 0 && (
                                  <span className={cn(
                                    "text-sm font-medium",
                                    entry.profit_loss > 0 ? "text-risk-low" : "text-risk-high"
                                  )}>
                                    {entry.profit_loss > 0 ? "+" : ""}{formatCurrency(entry.profit_loss)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="space-y-4 mt-4">
              {bankrollTier === "free" && (
                <Card className="border-l-4 border-l-primary bg-primary/5">
                  <CardContent className="p-4 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Estatísticas detalhadas são um recurso do plano Basic+.
                    </p>
                  </CardContent>
                </Card>
              )}
              <div className={bankrollTier === "free" ? "blur-sm" : ""}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Resumo do Mês</CardTitle>
                  <CardDescription>
                    Consistência vem de controle, não de sorte.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Total Apostado</p>
                      <p className="text-lg font-bold">{formatCurrency(monthlyStats.totalStaked)}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Total Bilhetes</p>
                      <p className="text-lg font-bold">{monthlyStats.totalEntries}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-risk-low/10">
                      <p className="text-xs text-muted-foreground">Greens</p>
                      <p className="text-lg font-bold text-risk-low">{monthlyStats.greens}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-risk-high/10">
                      <p className="text-xs text-muted-foreground">Reds</p>
                      <p className="text-lg font-bold text-risk-high">{monthlyStats.reds}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Resultado Líquido</span>
                      <span className={cn(
                        "text-xl font-bold",
                        monthlyStats.netResult >= 0 ? "text-risk-low" : "text-risk-high"
                      )}>
                        {monthlyStats.netResult >= 0 ? "+" : ""}{formatCurrency(monthlyStats.netResult)}
                      </span>
                    </div>
                  </div>

                  {canExportCSV && (
                    <Button variant="outline" className="w-full" disabled>
                      Exportar CSV (em breve)
                    </Button>
                  )}
                </CardContent>
              </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
