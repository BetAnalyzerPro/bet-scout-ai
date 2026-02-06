import { Link } from "react-router-dom";
import { ArrowLeft, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";

export default function Terms() {
  const lastUpdated = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <Logo size="header" />
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 py-8 sm:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6">
            {/* Title */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Shield className="h-4 w-4" />
                Documento Legal
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold">Termos de Uso</h1>
              <p className="text-muted-foreground">
                Última atualização: {lastUpdated}
              </p>
            </div>

            {/* Intro */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed">
                  Bem-vindo ao Bet Analizer.<br />
                  Ao acessar ou utilizar nossa plataforma, você concorda integralmente com estes Termos de Uso. 
                  Caso não concorde com qualquer parte deste documento, recomendamos que não utilize o serviço.
                </p>
              </CardContent>
            </Card>

            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">1. Sobre o Bet Analizer</h2>
              <p className="text-muted-foreground leading-relaxed">
                O Bet Analizer é uma plataforma digital de análise de risco e apoio à tomada de decisão 
                para apostas esportivas, com foco em futebol.
              </p>
              <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                <p className="text-muted-foreground">👉 Não somos uma casa de apostas.</p>
                <p className="text-muted-foreground">👉 Não realizamos apostas em nome do usuário.</p>
                <p className="text-muted-foreground">👉 Não prometemos ganhos, lucros ou resultados positivos.</p>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Nosso objetivo é educar o usuário, fornecer contexto, dados e análises estatísticas 
                para reduzir decisões impulsivas e melhorar a consciência sobre riscos.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">2. Natureza Educacional do Serviço</h2>
              <p className="text-muted-foreground leading-relaxed">
                O Bet Analizer tem caráter informativo e educacional.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                As análises, sugestões, indicadores de risco e relatórios:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                <li>não constituem aconselhamento financeiro</li>
                <li>não garantem qualquer resultado</li>
                <li>não substituem o julgamento pessoal do usuário</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Toda decisão de apostar é exclusivamente do usuário, que assume integral responsabilidade 
                por suas escolhas.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">3. Responsabilidade do Usuário</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao utilizar o Bet Analizer, o usuário declara que:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                <li>possui idade legal para apostas esportivas em sua jurisdição</li>
                <li>compreende que apostas envolvem riscos financeiros</li>
                <li>utiliza a plataforma por conta própria e risco</li>
                <li>não utilizará o serviço para fins ilegais ou fraudulentos</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                O usuário é o único responsável por:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                <li>valores apostados</li>
                <li>perdas financeiras</li>
                <li>decisões tomadas com base nas análises</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">4. Limitações de Responsabilidade</h2>
              <p className="text-muted-foreground leading-relaxed">
                O Bet Analizer não se responsabiliza por:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                <li>perdas financeiras decorrentes de apostas</li>
                <li>decisões tomadas pelo usuário com base nas análises</li>
                <li>falhas, atrasos ou indisponibilidades de dados externos</li>
                <li>erros provenientes de informações fornecidas pelo próprio usuário</li>
                <li>interrupções temporárias do serviço</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                O uso da plataforma é feito "como está", sem garantias expressas ou implícitas.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">5. Planos, Limites e Assinaturas</h2>
              <p className="text-muted-foreground leading-relaxed">
                O Bet Analizer oferece planos gratuitos e pagos, cada um com limites específicos de uso.
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                <li>Os limites são controlados de forma automática</li>
                <li>Tentativas de burlar limites podem resultar em bloqueio ou cancelamento da conta</li>
                <li>Planos pagos possuem regras próprias de renovação e cancelamento</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Reservamo-nos o direito de alterar preços, limites ou planos, sempre comunicando 
                previamente quando aplicável.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">6. Cancelamento e Encerramento de Conta</h2>
              <p className="text-muted-foreground leading-relaxed">
                O usuário pode solicitar o cancelamento da conta a qualquer momento.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                O Bet Analizer pode suspender ou encerrar contas que:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                <li>violem estes Termos de Uso</li>
                <li>apresentem comportamento fraudulento</li>
                <li>tentem explorar falhas técnicas ou de segurança</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">7. Propriedade Intelectual</h2>
              <p className="text-muted-foreground leading-relaxed">
                Todo o conteúdo da plataforma, incluindo:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                <li>textos</li>
                <li>análises</li>
                <li>layouts</li>
                <li>códigos</li>
                <li>marcas e logotipos</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                são de propriedade do Bet Analizer e protegidos por leis de direitos autorais.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                É proibida a reprodução, distribuição ou uso comercial sem autorização prévia.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">8. Proteção de Dados e Privacidade</h2>
              <p className="text-muted-foreground leading-relaxed">
                Os dados dos usuários são tratados conforme a Lei Geral de Proteção de Dados (LGPD).
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Para mais informações, consulte nossa{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">9. Alterações nos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Estes Termos podem ser atualizados periodicamente.<br />
                O uso contínuo da plataforma após alterações implica aceitação das novas condições.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">10. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Em caso de dúvidas, sugestões ou solicitações, entre em contato através dos{" "}
                <Link to="/contact" className="text-primary hover:underline">
                  canais oficiais
                </Link>{" "}
                disponíveis na plataforma.
              </p>
            </section>

            {/* Final Warning */}
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-semibold">Aviso Final Importante</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      O Bet Analizer não garante resultados, não promete ganhos e não incentiva apostas irresponsáveis.<br />
                      <strong>Aposte com consciência e responsabilidade.</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Back Button */}
            <div className="text-center pt-6">
              <Button asChild variant="outline">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para a página inicial
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Bet Analizer. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
