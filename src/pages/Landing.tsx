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
  AlertTriangle,
  BookOpen,
  LineChart,
  Users,
  Lightbulb,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: Upload,
    title: "Leitura de Bilhetes",
    description: "Envie a imagem do seu bilhete e nosso sistema extrai automaticamente jogos, mercados, linhas e odds.",
  },
  {
    icon: Brain,
    title: "Análise Estatística",
    description: "Histórico recente, confrontos diretos, xG, gols, escanteios e contexto da partida para cada seleção.",
  },
  {
    icon: AlertTriangle,
    title: "Identificação de Riscos",
    description: "Classificação visual clara: 🟢 Baixo, 🟡 Moderado, 🔴 Alto risco — sempre com explicação objetiva.",
  },
  {
    icon: Lightbulb,
    title: "Sugestões Inteligentes",
    description: "Linhas menos agressivas, troca de mercado e ajustes estratégicos justificados por dados históricos.",
  },
  {
    icon: LineChart,
    title: "Perfil e Evolução",
    description: "Acompanhe seu desempenho, identifique padrões e receba recomendações personalizadas ao seu perfil.",
  },
  {
    icon: GraduationCap,
    title: "Educação Contínua",
    description: "Conteúdos sobre gestão de banca, controle emocional e consistência no longo prazo.",
  },
];

const plans = [
  {
    name: "Start",
    color: "text-success",
    bgColor: "bg-success/10",
    price: "Gratuito",
    period: "",
    description: "Para entender os riscos antes de apostar",
    features: [
      "1 análise de bilhete por dia",
      "Identificação dos pontos de maior risco",
      "Classificação: baixo, médio ou alto risco",
      "Explicação objetiva de onde a aposta pode falhar",
      "Conteúdos educativos básicos por e-mail",
    ],
    cta: "Começar Grátis",
    popular: false,
  },
  {
    name: "Control",
    color: "text-info",
    bgColor: "bg-info/10",
    price: "R$ 29,90",
    period: "/mês",
    description: "Para apostar com mais critério e menos impulso",
    features: [
      "Até 10 análises completas por dia",
      "Análise detalhada por mercado",
      "Sugestões de linhas menos agressivas",
      "Avaliação de risco por seleção",
      "Guia prático de gestão de banca",
      "Relatórios semanais de comportamento",
    ],
    cta: "Assinar Control",
    popular: true,
  },
  {
    name: "Pro Analysis",
    color: "text-primary",
    bgColor: "bg-primary/10",
    price: "R$ 99,90",
    period: "/mês",
    description: "Para quem busca consistência no longo prazo",
    features: [
      "Análises ilimitadas",
      "Histórico completo de análises",
      "Gráficos de desempenho e exposição ao risco",
      "Perfil de apostador personalizado",
      "Gestão de banca avançada com alertas",
      "Relatórios analíticos por e-mail",
    ],
    cta: "Assinar Pro Analysis",
    popular: false,
  },
];

const differentials = [
  {
    icon: Target,
    title: "Análise Profissional de Scouting",
    description: "Metodologia usada por analistas esportivos aplicada às suas apostas.",
  },
  {
    icon: BarChart3,
    title: "Estatística Aplicada",
    description: "Dados históricos e métricas avançadas para embasar cada decisão.",
  },
  {
    icon: BookOpen,
    title: "Educação Contínua",
    description: "Aprenda a apostar melhor com conteúdos práticos e objetivos.",
  },
  {
    icon: Shield,
    title: "Comunicação Preventiva",
    description: "Alertas e recomendações focadas em proteção e disciplina.",
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
              <Shield className="h-4 w-4" />
              Análise de Risco para Apostadores
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              O Bet Analyzer{" "}
              <span className="text-gradient">não promete ganhos</span>.{" "}
              <br className="hidden md:block" />
              Ele ajuda você a errar menos.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Análise estatística e contextual dos seus bilhetes. Identifique riscos, 
              entenda onde sua aposta pode falhar e tome decisões mais racionais 
              — sempre baseado em dados, nunca em promessas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gradient-primary text-primary-foreground glow-primary">
                <Link to="/signup">
                  Analisar Meu Bilhete
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#como-funciona">Como Funciona</a>
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
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Dados, não promessas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Banner */}
      <section className="py-6 bg-muted/50 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 text-center">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <strong>Importante:</strong> O Bet Analyzer é uma ferramenta de análise estatística. 
              Não garantimos ganhos. Apostas envolvem risco de perda.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="como-funciona" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Como o Bet Analyzer te ajuda
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ferramentas de análise profissional para apostadores recreativos 
              que querem tomar decisões mais informadas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
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

      {/* Differentials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              O que torna o Bet Analyzer diferente
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Não somos tipsters. Somos uma ferramenta de análise e educação 
              para apostadores que buscam consistência.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {differentials.map((item, index) => (
              <div key={index} className="text-center space-y-4 p-6">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Planos para cada momento
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Do iniciante ao apostador que busca consistência no longo prazo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border/50'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="gradient-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                      Mais Escolhido
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${plan.bgColor} ${plan.color} text-sm font-medium mx-auto mb-2`}>
                    {plan.name}
                  </div>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
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

      {/* Educational CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <GraduationCap className="h-4 w-4" />
              Aposte com mais consciência
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Pronto para entender melhor suas apostas?
            </h2>
            <p className="text-lg text-muted-foreground">
              O primeiro passo para apostar melhor é entender os riscos. 
              Comece hoje com uma análise gratuita e veja onde seu bilhete pode falhar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gradient-primary text-primary-foreground glow-primary">
                <Link to="/signup">
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Lembre-se: apostas são entretenimento, não fonte de renda. Aposte com responsabilidade.
            </p>
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
          <div className="mt-8 pt-8 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              O Bet Analyzer é uma ferramenta de análise estatística e educação para apostadores recreativos. 
              Não garantimos ganhos e não somos responsáveis por perdas. Apostas envolvem risco. 
              Se você ou alguém que conhece tem problemas com jogo, procure ajuda profissional.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
