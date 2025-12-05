import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Download, Shield, Lock, Eye, FileText, Mail, ArrowLeft } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';

const Privacidade = () => {
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
            <title>Política de Privacidade - ViajARTur</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #333; }
              h1 { color: #0f172a; font-size: 28px; margin-bottom: 10px; }
              h2 { color: #0891b2; margin-top: 30px; margin-bottom: 15px; font-size: 22px; }
              p { margin-bottom: 15px; }
              ul { margin-left: 20px; margin-bottom: 15px; }
              li { margin-bottom: 8px; }
              strong { color: #333; }
              .bg-gradient-to-r { background: #f5f5f5 !important; padding: 15px; border-left: 4px solid #0891b2; margin: 15px 0; }
              @media print { body { padding: 20px; } @page { margin: 2cm; } }
            </style>
          </head>
          <body>
            <h1>Política de Privacidade</h1>
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
              <Shield className="w-8 h-8 text-viajar-cyan" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Política de Privacidade
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
                A <strong className="text-foreground">ViajARTur</strong> está comprometida com a proteção da privacidade 
                e dos dados pessoais de seus usuários, em conformidade com a <strong className="text-foreground">Lei Geral 
                de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong> e demais normas aplicáveis.
              </p>
            </div>

            {/* Seção 1 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">1. Informações Coletadas</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Coletamos os seguintes tipos de informações quando você utiliza nossa plataforma:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-viajar-cyan rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-muted-foreground">
                      <strong className="text-foreground">Dados de Identificação:</strong> nome completo, CNPJ/CPF, 
                      e-mail, telefone, endereço comercial.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-viajar-cyan rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-muted-foreground">
                      <strong className="text-foreground">Dados de Navegação:</strong> endereço IP, tipo de navegador, 
                      páginas visitadas, tempo de permanência.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-viajar-cyan rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-muted-foreground">
                      <strong className="text-foreground">Dados de Uso:</strong> funcionalidades utilizadas, 
                      relatórios gerados, interações com a IA Guilherme.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-viajar-cyan rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-muted-foreground">
                      <strong className="text-foreground">Dados de Pagamento:</strong> informações necessárias para 
                      processamento de assinaturas (processadas por parceiros de pagamento).
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Seção 2 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">2. Finalidade do Tratamento</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Utilizamos seus dados pessoais para as seguintes finalidades:
                </p>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Fornecer e melhorar nossos serviços de gestão turística;</li>
                  <li>Personalizar sua experiência na plataforma;</li>
                  <li>Processar assinaturas e pagamentos;</li>
                  <li>Enviar comunicações sobre atualizações e novidades (com seu consentimento);</li>
                  <li>Gerar análises e relatórios de inteligência turística;</li>
                  <li>Fornecer suporte ao cliente;</li>
                  <li>Cumprir obrigações legais e regulatórias.</li>
                </ul>
              </div>
            </section>

            {/* Seção 3 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">3. Compartilhamento de Dados</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Seus dados pessoais podem ser compartilhados nas seguintes situações:
                </p>
                <div className="bg-viajar-cyan/5 border-l-4 border-viajar-cyan p-4 rounded-r-lg">
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Prestadores de Serviços:</strong> utilizamos serviços de 
                    terceiros para hospedagem, análise de dados e processamento de pagamentos.
                  </p>
                </div>
                <div className="bg-viajar-blue/5 border-l-4 border-viajar-blue p-4 rounded-r-lg">
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Autoridades Competentes:</strong> quando exigido por lei 
                    ou ordem judicial.
                  </p>
                </div>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  <strong className="text-foreground">Não vendemos, alugamos ou comercializamos seus dados pessoais para terceiros.</strong>
                </p>
              </div>
            </section>

            {/* Seção 4 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">4. Segurança dos Dados</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados:
                </p>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Criptografia de dados em trânsito e em repouso;</li>
                  <li>Controle de acesso baseado em permissões;</li>
                  <li>Monitoramento contínuo de segurança;</li>
                  <li>Backups regulares dos dados;</li>
                  <li>Auditorias periódicas de segurança.</li>
                </ul>
              </div>
            </section>

            {/* Seção 5 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">5. Direitos do Titular (LGPD)</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Você possui os seguintes direitos em relação aos seus dados pessoais:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-viajar-cyan/5 p-4 rounded-lg border border-viajar-cyan/20">
                    <strong className="text-viajar-cyan">Confirmação e Acesso</strong>
                    <p className="text-sm text-muted-foreground mt-1">Confirmar e acessar seus dados.</p>
                  </div>
                  <div className="bg-viajar-blue/5 p-4 rounded-lg border border-viajar-blue/20">
                    <strong className="text-viajar-blue">Correção</strong>
                    <p className="text-sm text-muted-foreground mt-1">Solicitar correção de dados.</p>
                  </div>
                  <div className="bg-viajar-cyan/5 p-4 rounded-lg border border-viajar-cyan/20">
                    <strong className="text-viajar-cyan">Eliminação</strong>
                    <p className="text-sm text-muted-foreground mt-1">Solicitar exclusão de dados.</p>
                  </div>
                  <div className="bg-viajar-blue/5 p-4 rounded-lg border border-viajar-blue/20">
                    <strong className="text-viajar-blue">Portabilidade</strong>
                    <p className="text-sm text-muted-foreground mt-1">Receber seus dados em formato portátil.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Seção 6 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">6. Contato</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Para exercer seus direitos ou esclarecer dúvidas sobre esta política:
                </p>
                <div className="bg-gradient-to-r from-viajar-cyan/10 to-viajar-blue/10 p-6 rounded-lg border border-viajar-cyan/20">
                  <p className="text-foreground font-semibold mb-2">ViajARTur</p>
                  <p className="text-muted-foreground">
                    <strong>E-mail:</strong> privacidade@viajartur.com.br
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
                Esta Política de Privacidade é regida pela legislação brasileira, especialmente pela 
                Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
            </div>
          </div>
        </div>
      </section>

      <ViaJARFooter />
    </div>
  );
};

export default Privacidade;

