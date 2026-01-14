import { Link } from "react-router-dom";
import { 
  BarChart3, 
  Shield, 
  Target, 
  TrendingUp, 
  Upload, 
  Brain, 
  CheckCircle,
  ArrowRight,
  Zap,
  Crown,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: Upload,
    title: "Upload Inteligente",
    description: "Envie a imagem do seu bilhete e nosso OCR extrai automaticamente todos os dados.",
  },
  {
    icon: Brain,
    title: "Análise com IA",
    description: "Inteligência artificial analisa cada seleção com base em dados históricos e estatísticas.",
  },
  {
    icon: Shield,
    title: "Identificação de Riscos",
    description: "Classificação clara de riscos: 🟢 Baixo, 🟡 Médio, 🔴 Alto para cada aposta.",
  },
  {
    icon: Target,
    title: "Sugestões Inteligentes",
    description: "Receba alternativas menos agressivas e mais seguras para suas apostas.",
  },
  {
    icon: TrendingUp,
    title: "Histórico e Evolução",
    description: "Acompanhe seu desempenho ao longo do tempo com gráficos detalhados.",
  },
  {
    icon: BarChart3,
    title: "Gestão de Banca",
    description: "Controle sua banca com cálculos de stakes e alertas de proteção.",
  },
];

const plans = [
  {
    name: "Free",
    icon: Zap,
    price: "R$ 0",
    period: "/mês",
    description: "Para começar a analisar",
    features: [
      "1 análise por dia",
      "OCR de bilhetes",
      "Análise básica de risco",
      "Histórico limitado",
    ],
    cta: "Começar Grátis",
    popular: false,
  },
  {
    name: "Intermediário",
    icon: Sparkles,
    price: "R$ 29",
    period: "/mês",
    description: "Para apostadores regulares",
    features: [
      "10 análises por dia",
      "Análise completa de risco",
      "Sugestões de alternativas",
      "Guia de gestão de banca",
      "Emails educativos",
    ],
    cta: "Assinar Agora",
    popular: true,
  },
  {
    name: "Avançado",
    icon: Crown,
    price: "R$ 59",
    period: "/mês",
    description: "Para apostadores profissionais",
    features: [
      "Análises ilimitadas",
      "IA adaptativa ao seu perfil",
      "Gestão de banca completa",
      "Relatórios por email",
      "Gráficos de performance",
      "Suporte prioritário",
    ],
    cta: "Assinar Avançado",
    popular: false,
  },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Button asChild className="gradient-primary text-primary-foreground">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild className="gradient-primary text-primary-foreground">
                  <Link to="/signup">Criar Conta</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Análise Inteligente de Apostas
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Aposte com{" "}
              <span className="text-gradient">Inteligência</span>,{" "}
              <br className="hidden md:block" />
              Não com Emoção
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              O Bet Analyzer usa IA para analisar seus bilhetes de apostas, 
              identificar riscos e sugerir alternativas mais inteligentes. 
              Pense como um analista profissional.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gradient-primary text-primary-foreground glow-primary">
                <Link to="/signup">
                  Começar Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="#features">Ver Recursos</Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>1 análise grátis/dia</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Tudo que você precisa para apostar melhor
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ferramentas profissionais de análise ao alcance de todos os apostadores.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Planos para todos os perfis
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para o seu nível de apostas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="gradient-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                      Mais Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <plan.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    asChild 
                    className={`w-full ${plan.popular ? 'gradient-primary text-primary-foreground' : ''}`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    <Link to="/signup">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Pronto para apostar com mais inteligência?
            </h2>
            <p className="text-lg text-muted-foreground">
              Junte-se a milhares de apostadores que já estão usando o Bet Analyzer 
              para tomar decisões mais racionais e consistentes.
            </p>
            <Button asChild size="lg" className="gradient-primary text-primary-foreground glow-primary">
              <Link to="/signup">
                Criar Conta Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo size="sm" />
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Termos de Uso
              </Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacidade
              </Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">
                Contato
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Bet Analyzer. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}