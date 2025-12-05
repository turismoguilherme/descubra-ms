import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Download, FileText, AlertCircle, Shield, Users, ArrowLeft, CheckCircle, XCircle, Clock, CreditCard, AlertTriangle, Brain, Scale } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';

const TermosUso = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && contentRef.current) {
      const clone = contentRef.current.cloneNode(true) as HTMLElement;
      const buttons = clone.querySelectorAll('button, .inline-flex.items-center');
      buttons.forEach(btn => {
        if (btn.textContent?.includes('Voltar') || btn.textContent?.includes('Baixar PDF')) {
          btn.remove();
        }
      });
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Termos de Uso - ViajARTur</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #333; }
              h1 { color: #0f172a; font-size: 28px; margin-bottom: 10px; }
              h2 { color: #0891b2; margin-top: 30px; margin-bottom: 15px; font-size: 20px; }
              h3 { color: #334155; margin-top: 20px; margin-bottom: 10px; font-size: 16px; }
              p { margin-bottom: 15px; }
              ul { margin-left: 20px; margin-bottom: 15px; }
              li { margin-bottom: 8px; }
              strong { color: #333; }
              .warning { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0; }
              .info { background: #e0f2fe; padding: 15px; border-left: 4px solid #0891b2; margin: 15px 0; }
              @media print { body { padding: 20px; } @page { margin: 2cm; } }
            </style>
          </head>
          <body>
            <h1>Termos de Uso</h1>
            <p><strong>ViajARTur - Plataforma SaaS de Gestão Turística</strong></p>
            <p><em>Última atualização: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</em></p>
            <hr style="margin: 30px 0;">
            ${clone.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-viajar-slate to-slate-800 py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-viajar-cyan/20 backdrop-blur-sm p-4 rounded-full">
              <FileText className="w-8 h-8 text-viajar-cyan" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Termos de Uso
            </h1>
          </div>
          <p className="text-white/80 text-lg max-w-3xl">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl shadow-lg border border-border p-8 md:p-12" ref={contentRef}>
            {/* Botão de Download PDF */}
            <div className="mb-8 flex justify-end">
              <Button
                onClick={handleDownloadPDF}
                className="bg-viajar-cyan hover:bg-viajar-cyan/90 text-viajar-slate"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
            </div>

            {/* Introdução */}
            <div className="mb-8">
              <p className="text-muted-foreground leading-relaxed text-lg">
                Estes Termos de Uso regem o uso da plataforma <strong className="text-foreground">ViajARTur</strong>, 
                um sistema SaaS (Software as a Service) de gestão turística inteligente. Ao acessar e utilizar 
                esta plataforma, você concorda com todos os termos descritos neste documento.
              </p>
            </div>

            {/* AVISO IMPORTANTE - Plataforma em Evolução */}
            <div className="mb-8 p-6 bg-amber-500/10 border-2 border-amber-500/50 rounded-xl">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold text-amber-700 mb-3">⚠️ AVISO IMPORTANTE: Plataforma em Evolução</h2>
                  <p className="text-amber-900 mb-4">
                    A <strong>ViajARTur</strong> é uma plataforma nova e em constante evolução. Ao utilizar nossos 
                    serviços, você reconhece e aceita que:
                  </p>
                  <ul className="space-y-2 text-amber-800">
                    <li className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Podem ocorrer erros técnicos</strong> no processamento e análise de dados;</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span><strong>A Inteligência Artificial pode cometer erros</strong> - as análises, previsões e recomendações 
                      geradas pelo Guilherme IA e outros sistemas de IA não são garantidas;</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Inconsistências podem ocorrer</strong> nos processos de agregação e benchmarking;</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>A plataforma <strong>se compromete a corrigir erros</strong> quando identificados;</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Você pode reportar problemas pelo e-mail <strong>suporte@viajartur.com.br</strong>.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Seção 1 - Aceitação */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">1. Aceitação dos Termos</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Ao criar uma conta ou utilizar qualquer funcionalidade da plataforma 
                  <strong className="text-foreground"> ViajARTur</strong>, você declara que:
                </p>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Leu, compreendeu e concordou com estes Termos de Uso;</li>
                  <li>Concordou com nossa <Link to="/viajar/privacidade" className="text-viajar-cyan hover:underline">Política de Privacidade</Link>;</li>
                  <li>Concordou com nossa <Link to="/viajar/cookies" className="text-viajar-cyan hover:underline">Política de Cookies</Link>;</li>
                  <li>Possui capacidade legal para celebrar este acordo;</li>
                  <li>Representa legitimamente a empresa ou órgão público assinante;</li>
                  <li>Forneceu informações verdadeiras, precisas e atualizadas;</li>
                  <li><strong>Aceita que a plataforma pode cometer erros</strong>, conforme descrito acima.</li>
                </ul>
              </div>
            </section>

            {/* Seção 2 - Descrição dos Serviços */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">2. Descrição dos Serviços</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  A plataforma <strong className="text-foreground">ViajARTur</strong> oferece:
                </p>
                <div className="grid gap-3">
                  <div className="bg-viajar-cyan/5 p-4 rounded-lg border-l-4 border-viajar-cyan">
                    <strong className="text-viajar-cyan">Guilherme IA</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Assistente virtual inteligente com insights estratégicos. <em>Atenção: respostas geradas 
                      por IA podem conter imprecisões.</em>
                    </p>
                  </div>
                  <div className="bg-viajar-blue/5 p-4 rounded-lg border-l-4 border-viajar-blue">
                    <strong className="text-viajar-blue">Revenue Optimizer</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sugestões de precificação dinâmica baseadas em IA. <em>Decisões finais são de 
                      responsabilidade do usuário.</em>
                    </p>
                  </div>
                  <div className="bg-viajar-cyan/5 p-4 rounded-lg border-l-4 border-viajar-cyan">
                    <strong className="text-viajar-cyan">Market Intelligence</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Análises de mercado e benchmarking competitivo com dados agregados.
                    </p>
                  </div>
                  <div className="bg-viajar-blue/5 p-4 rounded-lg border-l-4 border-viajar-blue">
                    <strong className="text-viajar-blue">Inventário Turístico</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Gestão de atrativos com padronização SeTur e validação inteligente.
                    </p>
                  </div>
                  <div className="bg-viajar-cyan/5 p-4 rounded-lg border-l-4 border-viajar-cyan">
                    <strong className="text-viajar-cyan">Gestão de CATs</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Controle de Centros de Atendimento ao Turista com métricas em tempo real.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Seção 3 - Conta do Usuário */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">3. Conta do Usuário</h2>
              </div>
              <div className="ml-12 space-y-4">
                <h3 className="font-semibold text-foreground">3.1 Criação e Manutenção</h3>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Você é responsável por manter a confidencialidade de suas credenciais;</li>
                  <li>Você é responsável por todas as atividades que ocorrem em sua conta;</li>
                  <li>Você deve nos notificar imediatamente sobre qualquer uso não autorizado;</li>
                  <li>Reservamo-nos o direito de suspender contas que violem estes termos.</li>
                </ul>

                <h3 className="font-semibold text-foreground mt-6">3.2 Verificação de Conta</h3>
                <p className="text-muted-foreground">
                  Podemos solicitar documentos para verificar sua identidade ou a legitimidade da empresa/órgão 
                  que você representa, incluindo CNPJ, documentos societários ou identificação pessoal.
                </p>
              </div>
            </section>

            {/* Seção 4 - Planos, Pagamentos e Cancelamento */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">4. Planos, Pagamentos e Cancelamento</h2>
              </div>
              <div className="ml-12 space-y-6">
                <h3 className="font-semibold text-foreground">4.1 Planos de Assinatura</h3>
                <p className="text-muted-foreground">
                  A ViajARTur oferece diferentes planos de assinatura. Os valores, funcionalidades e limites 
                  de cada plano estão descritos na <Link to="/precos" className="text-viajar-cyan hover:underline">página de preços</Link>.
                </p>

                <h3 className="font-semibold text-foreground">4.2 Cobrança</h3>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li><strong>Planos Mensais:</strong> cobrança recorrente a cada 30 dias;</li>
                  <li><strong>Planos Anuais:</strong> cobrança única com desconto, válido por 12 meses;</li>
                  <li>O pagamento é processado pelo <strong>Stripe</strong>, plataforma segura de pagamentos;</li>
                  <li>Você receberá recibo por e-mail após cada cobrança.</li>
                </ul>

                <h3 className="font-semibold text-foreground">4.3 Cancelamento de Conta</h3>
                <div className="bg-viajar-cyan/5 p-5 rounded-lg border border-viajar-cyan/20">
                  <p className="text-muted-foreground mb-4">
                    Você pode cancelar sua assinatura a qualquer momento através das <strong>Configurações da Conta</strong> 
                    ou entrando em contato pelo e-mail <strong>cancelamento@viajartur.com.br</strong>.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-viajar-cyan flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-foreground">Prazo de Processamento:</strong>
                        <p className="text-sm text-muted-foreground">O cancelamento é processado em até 5 dias úteis.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-foreground">Acesso até o fim do período:</strong>
                        <p className="text-sm text-muted-foreground">Você mantém acesso até o final do período já pago.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-viajar-blue flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-foreground">Exportação de dados:</strong>
                        <p className="text-sm text-muted-foreground">
                          Você pode solicitar exportação dos seus dados antes do cancelamento. 
                          Consulte a <Link to="/viajar/privacidade" className="text-viajar-cyan hover:underline">Política de Privacidade</Link>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="font-semibold text-foreground">4.4 Política de Reembolso</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong className="text-foreground">Planos Mensais:</strong></p>
                  <ul className="list-disc list-inside ml-4">
                    <li>Cancelamento nos primeiros <strong>7 dias</strong>: reembolso integral;</li>
                    <li>Após 7 dias: sem reembolso, acesso até o fim do período.</li>
                  </ul>
                  
                  <p className="mt-4"><strong className="text-foreground">Planos Anuais:</strong></p>
                  <ul className="list-disc list-inside ml-4">
                    <li>Cancelamento nos primeiros <strong>14 dias</strong>: reembolso integral;</li>
                    <li>Após 14 dias: reembolso proporcional aos meses não utilizados (mínimo 3 meses restantes);</li>
                    <li>Menos de 3 meses restantes: sem reembolso.</li>
                  </ul>

                  <p className="mt-4"><strong className="text-foreground">Casos não elegíveis para reembolso:</strong></p>
                  <ul className="list-disc list-inside ml-4">
                    <li>Violação dos Termos de Uso;</li>
                    <li>Uso indevido ou fraudulento da plataforma;</li>
                    <li>Conta suspensa por motivos de segurança.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Seção 5 - Termo de Consentimento para Benchmarking */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">5. Termo de Consentimento para Benchmarking</h2>
              </div>
              <div className="ml-12 space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="text-blue-900">
                    <strong>Termo Obrigatório:</strong> Para utilizar a plataforma, você deve aceitar o 
                    <strong> Termo de Consentimento para Benchmarking</strong>, que autoriza o compartilhamento 
                    de dados agregados e anonimizados para comparação com outras empresas do setor.
                  </p>
                </div>
                <p className="text-muted-foreground">
                  Este termo é apresentado durante o onboarding e inclui:
                </p>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Autorização para compartilhar dados <strong>agregados e anonimizados</strong>;</li>
                  <li>Reconhecimento de que a plataforma pode cometer erros;</li>
                  <li>Geração de PDF assinado eletronicamente;</li>
                  <li>Possibilidade de revogar o consentimento a qualquer momento nas Configurações.</li>
                </ul>
              </div>
            </section>

            {/* Seção 6 - Limitação de Responsabilidade */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">6. Limitação de Responsabilidade</h2>
              </div>
              <div className="ml-12 space-y-4">
                <h3 className="font-semibold text-foreground">6.1 Uso da Inteligência Artificial</h3>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <Brain className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-900 font-medium mb-2">Aviso sobre IA:</p>
                      <ul className="text-amber-800 text-sm space-y-1">
                        <li>• O <strong>Guilherme IA</strong> e outros sistemas de IA podem gerar respostas imprecisas;</li>
                        <li>• Previsões de receita, ocupação e demanda são <strong>estimativas</strong>, não garantias;</li>
                        <li>• Recomendações de preços são <strong>sugestões</strong> - a decisão final é sua;</li>
                        <li>• <strong>Consulte especialistas</strong> antes de tomar decisões estratégicas importantes.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h3 className="font-semibold text-foreground mt-6">6.2 A ViajARTur NÃO se responsabiliza por:</h3>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Decisões comerciais baseadas exclusivamente nas análises da plataforma;</li>
                  <li>Perdas financeiras decorrentes de recomendações de precificação;</li>
                  <li>Indisponibilidade temporária dos serviços;</li>
                  <li>Erros em dados fornecidos por integrações de terceiros;</li>
                  <li>Resultados de benchmarking que não reflitam a realidade do mercado.</li>
                </ul>

                <h3 className="font-semibold text-foreground mt-6">6.3 Disponibilidade do Serviço</h3>
                <p className="text-muted-foreground">
                  Nos esforçamos para manter a plataforma disponível 24/7, mas não garantimos:
                </p>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Uptime de 100% - manutenções programadas podem ocorrer;</li>
                  <li>Ausência de bugs ou erros técnicos;</li>
                  <li>Que todas as funcionalidades estarão sempre disponíveis.</li>
                </ul>
              </div>
            </section>

            {/* Seção 7 - Condutas Proibidas */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">7. Condutas Proibidas</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-muted-foreground">Você concorda em NÃO utilizar a plataforma para:</p>
                <div className="space-y-2">
                  {[
                    'Compartilhar credenciais de acesso com terceiros não autorizados',
                    'Tentar acessar áreas restritas ou sistemas da plataforma',
                    'Fazer engenharia reversa ou extrair código-fonte',
                    'Revender ou sublicenciar acesso à plataforma',
                    'Inserir dados falsos ou fraudulentos no sistema',
                    'Usar a plataforma para atividades ilegais',
                    'Sobrecarregar os servidores com requisições automatizadas',
                    'Tentar extrair dados de outros usuários'
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">✗</span>
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Seção 8 - Propriedade Intelectual */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">8. Propriedade Intelectual</h2>
              </div>
              <div className="ml-12 space-y-4">
                <h3 className="font-semibold text-foreground">8.1 Propriedade da ViajARTur</h3>
                <p className="text-muted-foreground">
                  A plataforma, incluindo código-fonte, design, funcionalidades e marca, são propriedade 
                  exclusiva da ViajARTur e estão protegidos por leis de propriedade intelectual.
                </p>

                <h3 className="font-semibold text-foreground mt-4">8.2 Seus Dados</h3>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Os dados que você insere na plataforma permanecem seus.</strong> 
                  A ViajARTur não reivindica propriedade sobre suas informações comerciais, relatórios ou 
                  análises geradas a partir dos seus dados.
                </p>
              </div>
            </section>

            {/* Seção 9 - Modificações */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">9. Modificações nos Termos</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-muted-foreground">
                  Podemos atualizar estes Termos de Uso periodicamente. Quando houver alterações significativas:
                </p>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Você será notificado por e-mail com 30 dias de antecedência;</li>
                  <li>Um aviso será exibido na plataforma;</li>
                  <li>O uso continuado após as alterações constitui aceitação.</li>
                </ul>
              </div>
            </section>

            {/* Seção 10 - Lei Aplicável */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">10. Lei Aplicável e Foro</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-muted-foreground">
                  Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.
                </p>
                <p className="text-muted-foreground">
                  Qualquer disputa será resolvida no <strong className="text-foreground">foro da comarca de Campo Grande - MS</strong>, 
                  com renúncia a qualquer outro, por mais privilegiado que seja.
                </p>
              </div>
            </section>

            {/* Seção 11 - Contato */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">11. Contato</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-muted-foreground">Para questões sobre estes Termos de Uso:</p>
                <div className="bg-gradient-to-r from-viajar-cyan/10 to-viajar-blue/10 p-6 rounded-lg border border-viajar-cyan/20">
                  <p className="text-foreground font-semibold mb-3">ViajARTur</p>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>E-mail Geral:</strong> contato@viajartur.com.br</p>
                    <p><strong>Cancelamentos:</strong> cancelamento@viajartur.com.br</p>
                    <p><strong>Suporte Técnico:</strong> suporte@viajartur.com.br</p>
                    <p><strong>Telefone:</strong> (67) 3000-0000</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Rodapé do Documento */}
            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-center text-muted-foreground text-sm">
                Ao utilizar a plataforma <strong className="text-foreground">ViajARTur</strong>, você declara ter lido, 
                compreendido e concordado com estes Termos de Uso, incluindo o aviso sobre a plataforma estar 
                em evolução e a possibilidade de erros.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ViaJARFooter />
    </div>
  );
};

export default TermosUso;
