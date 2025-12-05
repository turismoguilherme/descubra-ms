import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Download, FileText, AlertCircle, Shield, Users, ArrowLeft, CheckCircle } from 'lucide-react';
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
              h2 { color: #0891b2; margin-top: 30px; margin-bottom: 15px; font-size: 22px; }
              p { margin-bottom: 15px; }
              ul { margin-left: 20px; margin-bottom: 15px; }
              li { margin-bottom: 8px; }
              strong { color: #333; }
              @media print { body { padding: 20px; } @page { margin: 2cm; } }
            </style>
          </head>
          <body>
            <h1>Termos de Uso</h1>
            <p><strong>ViajARTur</strong></p>
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
                Estes Termos de Uso regem o uso da plataforma <strong className="text-foreground">ViajARTur</strong>. 
                Ao acessar e utilizar esta plataforma, você concorda com estes termos. Se você não concordar com 
                qualquer parte destes termos, não deve utilizar nossos serviços.
              </p>
            </div>

            {/* Seção 1 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">1. Aceitação dos Termos</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Ao criar uma conta ou utilizar qualquer funcionalidade da plataforma 
                  <strong className="text-foreground"> ViajARTur</strong>, você declara que:
                </p>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Leu, compreendeu e concordou com estes Termos de Uso;</li>
                  <li>Concordou com nossa Política de Privacidade;</li>
                  <li>Possui capacidade legal para celebrar este acordo;</li>
                  <li>Representa legitimamente a empresa ou órgão público assinante;</li>
                  <li>Forneceu informações verdadeiras, precisas e atualizadas.</li>
                </ul>
              </div>
            </section>

            {/* Seção 2 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">2. Descrição dos Serviços</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  A plataforma <strong className="text-foreground">ViajARTur</strong> oferece os seguintes serviços:
                </p>
                <div className="space-y-3">
                  <div className="bg-viajar-cyan/5 p-4 rounded-lg border-l-4 border-viajar-cyan">
                    <strong className="text-viajar-cyan">Guilherme IA</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Assistente virtual inteligente especializado em turismo com insights estratégicos.
                    </p>
                  </div>
                  <div className="bg-viajar-blue/5 p-4 rounded-lg border-l-4 border-viajar-blue">
                    <strong className="text-viajar-blue">Revenue Optimizer</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sistema de precificação dinâmica baseado em IA para maximizar receita.
                    </p>
                  </div>
                  <div className="bg-viajar-cyan/5 p-4 rounded-lg border-l-4 border-viajar-cyan">
                    <strong className="text-viajar-cyan">Market Intelligence</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Análises de mercado, origem de turistas e benchmarking competitivo.
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

            {/* Seção 3 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">3. Conta do Usuário</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Para utilizar a plataforma, você precisará criar uma conta:
                </p>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Você é responsável por manter a confidencialidade de suas credenciais;</li>
                  <li>Você é responsável por todas as atividades que ocorrem em sua conta;</li>
                  <li>Você deve nos notificar imediatamente sobre qualquer uso não autorizado;</li>
                  <li>Reservamo-nos o direito de suspender contas que violem estes termos.</li>
                </ul>
              </div>
            </section>

            {/* Seção 4 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">4. Condutas Proibidas</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Você concorda em NÃO utilizar a plataforma para:
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span className="text-muted-foreground">Compartilhar credenciais de acesso com terceiros não autorizados;</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span className="text-muted-foreground">Tentar acessar áreas restritas ou sistemas da plataforma;</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span className="text-muted-foreground">Fazer engenharia reversa ou extrair código-fonte;</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span className="text-muted-foreground">Revender ou sublicenciar acesso à plataforma;</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span className="text-muted-foreground">Inserir dados falsos ou fraudulentos no sistema.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Seção 5 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">5. Planos e Pagamentos</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  A ViajARTur oferece diferentes planos de assinatura:
                </p>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Os valores e funcionalidades estão descritos na página de preços;</li>
                  <li>A cobrança é realizada mensalmente ou anualmente, conforme o plano escolhido;</li>
                  <li>Cancelamentos podem ser realizados a qualquer momento;</li>
                  <li>Reembolsos seguem a política de cada plano.</li>
                </ul>
              </div>
            </section>

            {/* Seção 6 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">6. Limitação de Responsabilidade</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  A plataforma é fornecida "como está". A ViajARTur não garante que:
                </p>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>A plataforma estará sempre disponível ou livre de erros;</li>
                  <li>Os resultados de análises garantam sucesso comercial;</li>
                  <li>As previsões de IA sejam 100% precisas.</li>
                </ul>
                <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Importante:</strong> A ViajARTur não se responsabiliza por 
                    decisões comerciais baseadas exclusivamente nas análises da plataforma. Recomendamos sempre 
                    consultar especialistas para decisões estratégicas.
                  </p>
                </div>
              </div>
            </section>

            {/* Seção 7 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">7. Lei Aplicável</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.
                  Qualquer disputa será resolvida no foro da comarca de Campo Grande - MS.
                </p>
              </div>
            </section>

            {/* Seção 8 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">8. Contato</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Para questões sobre estes Termos de Uso:
                </p>
                <div className="bg-gradient-to-r from-viajar-cyan/10 to-viajar-blue/10 p-6 rounded-lg border border-viajar-cyan/20">
                  <p className="text-foreground font-semibold mb-2">ViajARTur</p>
                  <p className="text-muted-foreground">
                    <strong>E-mail:</strong> contato@viajartur.com.br
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Telefone:</strong> (67) 3000-0000
                  </p>
                </div>
              </div>
            </section>

            {/* Rodapé do Documento */}
            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-center text-muted-foreground text-sm">
                Ao utilizar a plataforma <strong className="text-foreground">ViajARTur</strong>, você declara ter lido, 
                compreendido e concordado com estes Termos de Uso.
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

