import { Link } from "react-router-dom";
import { 
  BarChart3, 
  Shield, 
  Target, 
  Upload, 
  Brain, 
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  BookOpen,
  LineChart,
  Lightbulb,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { PLANS, PRICING_PLANS, PAYWALL_MESSAGES } from "@/config/plans";

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

// Plan descriptions with updated Basic copy
const planDescriptions: Record<string, string> = {
  basic: "Ideal para quem quer sair do gratuito e começar a apostar com mais controle.",
};

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
      <section className="relative py-12 sm:py-16 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-5 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Análise de Risco para Apostadores
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              O Bet Analyzer{" "}
              <span className="text-gradient">não promete ganhos</span>.{" "}
              <span className="block mt-1 sm:mt-0 sm:inline">Ele ajuda você a errar menos.</span>
            </h1>

            {/* Bloco emocional */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground/90 max-w-xl mx-auto italic leading-relaxed px-2">
              Se você já montou um bilhete confiante e perdeu por um detalhe,
              o problema não foi azar. Foi falta de leitura de risco.
            </p>
            
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
              O Bet Analyzer analisa estatisticamente seus bilhetes, identifica riscos ocultos 
              e mostra onde sua aposta pode falhar — sempre com base em dados reais, nunca em promessas.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center px-2">
              <Button asChild size="lg" className="gradient-primary text-primary-foreground glow-primary h-12 sm:h-11 text-sm sm:text-base">
                <Link to="/signup">
                  Ver Onde Meu Bilhete Pode Falhar
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 sm:h-11 text-sm sm:text-base">
                <a href="#como-funciona">Como Funciona</a>
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground px-4">
              Criado para apostadores que preferem dados e consciência a promessas.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer Banner */}
      <section className="py-6 bg-muted/50 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 text-center">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <strong>Importante:</strong> O Bet Analizer é uma ferramenta de análise estatística. 
              Não garantimos ganhos. Apostas envolvem risco de perda.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="como-funciona" className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
              Como o Bet Analizer te ajuda
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
              Ferramentas de análise profissional para apostadores recreativos 
              que querem tomar decisões mais informadas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 md:hover:-translate-y-1 border-border/50">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl gradient-primary flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm sm:text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Differentials Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
              O que torna o Bet Analizer diferente
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
              Não somos tipsters. Somos uma ferramenta de análise e educação 
              para apostadores que buscam consistência.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {differentials.map((item, index) => (
              <div key={index} className="text-center space-y-2 sm:space-y-4 p-4 sm:p-6">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <item.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-sm sm:text-lg">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
              Planos para cada momento
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
              Do iniciante ao apostador que busca consistência no longo prazo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {PRICING_PLANS.map((planId) => {
              const plan = PLANS[planId];
              return (
                <Card 
                  key={planId} 
                  className={`relative ${plan.isPopular ? 'border-primary shadow-lg sm:scale-105 z-10' : 'border-border/50'}`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                      <span className="gradient-primary text-primary-foreground text-[10px] sm:text-xs font-semibold px-3 sm:px-4 py-1 rounded-full whitespace-nowrap">
                        Mais Escolhido
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pb-3 sm:pb-4 pt-5 sm:pt-6">
                    <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full ${plan.bgClass} ${plan.colorClass} text-xs sm:text-sm font-medium mx-auto mb-2`}>
                      <plan.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {plan.name}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{plan.subtitle}</p>
                    {planId === "basic" && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{planDescriptions.basic}</p>
                    )}
                    <CardDescription className="text-xs sm:text-sm mt-2">{plan.description}</CardDescription>
                    <div className="pt-3 sm:pt-4">
                      <span className="text-2xl sm:text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground text-xs sm:text-sm">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 pt-0">
                    <ul className="space-y-1.5 sm:space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-[11px] sm:text-xs leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      asChild 
                      className={`w-full h-11 sm:h-10 ${plan.isPopular ? 'gradient-primary text-primary-foreground' : ''}`}
                      variant={plan.isPopular ? "default" : "outline"}
                      size="sm"
                    >
                      <Link to="/signup">{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Educational CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-5 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium">
              <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Aposte com mais consciência
            </div>
            {/* Anti-objeção */}
            <p className="text-sm sm:text-base text-muted-foreground">
              O Bet Analyzer não indica apostas. Ele analisa decisões.
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold px-2">
              Pronto para entender melhor suas apostas?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed px-2">
              O primeiro passo para apostar melhor é entender os riscos. 
              Comece hoje com uma análise gratuita e veja onde seu bilhete pode falhar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button asChild size="lg" className="gradient-primary text-primary-foreground glow-primary h-12 sm:h-11">
                <Link to="/signup">
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground px-4">
              Lembre-se: apostas são entretenimento, não fonte de renda. Aposte com responsabilidade.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:justify-between">
            <Logo size="sm" />
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground transition-colors min-h-[44px] flex items-center">
                Termos de Uso
              </Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors min-h-[44px] flex items-center">
                Privacidade
              </Link>
              <Link to="/contact" className="hover:text-foreground transition-colors min-h-[44px] flex items-center">
                Contato
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              © 2024 Bet Analizer. Todos os direitos reservados.
            </p>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border/50 text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
              O Bet Analizer é uma ferramenta de análise estatística e educação para apostadores recreativos. 
              Não garantimos ganhos e não somos responsáveis por perdas. Apostas envolvem risco. 
              Se você ou alguém que conhece tem problemas com jogo, procure ajuda profissional.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
