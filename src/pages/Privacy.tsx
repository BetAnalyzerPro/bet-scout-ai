import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";

export default function Privacy() {
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
                <Lock className="h-4 w-4" />
                Proteção de Dados
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold">Política de Privacidade</h1>
              <p className="text-muted-foreground">
                Última atualização: {lastUpdated}
              </p>
            </div>

            {/* Intro */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed">
                  A sua privacidade é importante para nós.<br />
                  Esta Política de Privacidade explica como o Bet Analizer coleta, utiliza, armazena 
                  e protege os dados pessoais dos usuários que acessam e utilizam nossa plataforma.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Ao utilizar o Bet Analizer, você concorda com as práticas descritas neste documento.
                </p>
              </CardContent>
            </Card>

            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">1. Quem Somos</h2>
              <p className="text-muted-foreground leading-relaxed">
                O Bet Analizer é uma plataforma digital voltada à análise de risco e apoio educacional 
                para apostas esportivas, com foco em futebol.
              </p>
              <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                <p className="text-muted-foreground">👉 Não somos casa de apostas.</p>
                <p className="text-muted-foreground">👉 Não realizamos apostas.</p>
                <p className="text-muted-foreground">👉 Não incentivamos apostas irresponsáveis.</p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">2. Dados que Coletamos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Coletamos apenas os dados necessários para o funcionamento da plataforma, incluindo:
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-base mb-2">2.1 Dados fornecidos pelo usuário</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                    <li>Nome ou apelido</li>
                    <li>Endereço de e-mail</li>
                    <li>Informações de conta (login e preferências)</li>
                    <li>Imagens de bilhetes enviadas voluntariamente para análise</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-base mb-2">2.2 Dados gerados pelo uso do serviço</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                    <li>Histórico de análises</li>
                    <li>Classificações de risco</li>
                    <li>Resultados registrados (verde/vermelho)</li>
                    <li>Estatísticas de uso da plataforma</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-base mb-2">2.3 Dados técnicos</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                    <li>Endereço IP</li>
                    <li>Tipo de dispositivo e navegador</li>
                    <li>Data e hora de acesso</li>
                    <li>Logs de segurança e prevenção a fraudes</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">3. Como Utilizamos os Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Os dados coletados são utilizados para:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                <li>Fornecer e operar o serviço corretamente</li>
                <li>Realizar análises de bilhetes e riscos</li>
                <li>Gerar estatísticas e histórico do usuário</li>
                <li>Melhorar a experiência e a precisão do sistema</li>
                <li>Garantir segurança, prevenção de fraudes e abusos</li>
                <li>Cumprir obrigações legais e regulatórias</li>
              </ul>
              <div className="pl-4 border-l-2 border-primary/30">
                <p className="text-muted-foreground">
                  👉 Não utilizamos dados para promessas de ganhos ou incentivos ao jogo.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">4. Compartilhamento de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                O Bet Analizer não vende, aluga ou comercializa dados pessoais.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Os dados podem ser compartilhados apenas:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                <li>com fornecedores de infraestrutura (ex.: hospedagem, banco de dados)</li>
                <li>quando exigido por lei ou ordem judicial</li>
                <li>para proteção de direitos, segurança e integridade da plataforma</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Sempre respeitando a legislação vigente.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">5. Uso de APIs e Serviços de Terceiros</h2>
              <p className="text-muted-foreground leading-relaxed">
                A plataforma pode utilizar serviços externos para:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                <li>obtenção de dados estatísticos esportivos</li>
                <li>processamento de pagamentos</li>
                <li>autenticação e segurança</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Esses serviços possuem suas próprias políticas de privacidade e são utilizados apenas 
                quando necessários para o funcionamento do Bet Analizer.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">6. Armazenamento e Segurança dos Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Adotamos medidas técnicas e organizacionais para proteger os dados, incluindo:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                <li>criptografia</li>
                <li>controle de acesso</li>
                <li>monitoramento de atividades suspeitas</li>
                <li>políticas de segurança e logs</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Apesar disso, nenhum sistema é 100% inviolável, e o usuário reconhece esse risco inerente à internet.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">7. Direitos do Usuário (LGPD)</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), o usuário pode, a qualquer momento:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                <li>acessar seus dados pessoais</li>
                <li>corrigir dados incompletos ou incorretos</li>
                <li>solicitar a exclusão dos dados</li>
                <li>revogar consentimentos</li>
                <li>solicitar informações sobre o uso dos dados</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                As solicitações podem ser feitas pelos canais oficiais da plataforma.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">8. Retenção de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Os dados são mantidos apenas pelo tempo necessário para:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                <li>cumprimento das finalidades descritas</li>
                <li>atendimento a obrigações legais</li>
                <li>preservação da segurança e integridade do serviço</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Após esse período, os dados são excluídos ou anonimizados.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">9. Cookies e Tecnologias Semelhantes</h2>
              <p className="text-muted-foreground leading-relaxed">
                O Bet Analizer pode utilizar cookies e tecnologias similares para:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                <li>manter sessões ativas</li>
                <li>melhorar a navegação</li>
                <li>analisar o uso da plataforma</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                O usuário pode gerenciar cookies diretamente em seu navegador.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">10. Alterações nesta Política</h2>
              <p className="text-muted-foreground leading-relaxed">
                Esta Política de Privacidade pode ser atualizada periodicamente.<br />
                Recomendamos que o usuário revise este documento regularmente.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                O uso contínuo da plataforma após alterações implica aceitação da nova versão.
              </p>
            </section>

            {/* Section 11 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">11. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Em caso de dúvidas, solicitações ou questões relacionadas à privacidade e proteção de dados, 
                entre em contato pelos{" "}
                <Link to="/contact" className="text-primary hover:underline">
                  canais oficiais
                </Link>{" "}
                disponíveis na plataforma.
              </p>
            </section>

            {/* Final Commitment */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-semibold">🔒 Compromisso Final</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      O Bet Analizer respeita sua privacidade, protege seus dados e existe para promover 
                      uso consciente e responsável de informações no contexto das apostas esportivas.
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
            © 2026 Bet Analizer. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
