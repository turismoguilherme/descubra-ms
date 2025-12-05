import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Download, Cookie, Settings, BarChart3, Shield, ArrowLeft } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';

const Cookies = () => {
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
            <title>Política de Cookies - ViajARTur</title>
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
            <h1>Política de Cookies</h1>
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
              <Cookie className="w-8 h-8 text-viajar-cyan" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Política de Cookies
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
                A <strong className="text-foreground">ViajARTur</strong> utiliza cookies e tecnologias similares 
                para melhorar sua experiência em nossa plataforma. Esta política explica o que são cookies, 
                como os utilizamos e como você pode gerenciá-los.
              </p>
            </div>

            {/* Seção 1 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <Cookie className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">1. O que são Cookies?</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Cookies são pequenos arquivos de texto armazenados em seu dispositivo (computador, tablet ou 
                  smartphone) quando você visita um site. Eles são amplamente utilizados para fazer sites 
                  funcionarem de forma mais eficiente e fornecer informações aos proprietários do site.
                </p>
                <div className="bg-viajar-cyan/5 border-l-4 border-viajar-cyan p-4 rounded-r-lg">
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Importante:</strong> Cookies não podem executar programas 
                    ou transmitir vírus para seu dispositivo. Eles servem apenas para armazenar informações.
                  </p>
                </div>
              </div>
            </section>

            {/* Seção 2 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">2. Tipos de Cookies que Utilizamos</h2>
              </div>
              <div className="ml-12 space-y-4">
                <div className="space-y-4">
                  <div className="bg-viajar-cyan/5 p-5 rounded-lg border border-viajar-cyan/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-viajar-cyan" />
                      <strong className="text-foreground text-lg">Cookies Essenciais</strong>
                    </div>
                    <p className="text-muted-foreground">
                      Necessários para o funcionamento básico da plataforma. Incluem cookies de autenticação, 
                      segurança e preferências de sessão. <strong className="text-foreground">Não podem ser desativados.</strong>
                    </p>
                    <div className="mt-3 text-sm text-muted-foreground">
                      <span className="font-medium">Exemplos:</span> token de login, preferências de idioma, CSRF token
                    </div>
                  </div>

                  <div className="bg-viajar-blue/5 p-5 rounded-lg border border-viajar-blue/20">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-5 h-5 text-viajar-blue" />
                      <strong className="text-foreground text-lg">Cookies de Análise</strong>
                    </div>
                    <p className="text-muted-foreground">
                      Coletam informações sobre como você utiliza a plataforma, permitindo-nos melhorar 
                      a experiência do usuário e identificar problemas.
                    </p>
                    <div className="mt-3 text-sm text-muted-foreground">
                      <span className="font-medium">Exemplos:</span> páginas visitadas, tempo de permanência, origem do acesso
                    </div>
                  </div>

                  <div className="bg-viajar-cyan/5 p-5 rounded-lg border border-viajar-cyan/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="w-5 h-5 text-viajar-cyan" />
                      <strong className="text-foreground text-lg">Cookies de Preferências</strong>
                    </div>
                    <p className="text-muted-foreground">
                      Lembram suas configurações e preferências para personalizar sua experiência na plataforma.
                    </p>
                    <div className="mt-3 text-sm text-muted-foreground">
                      <span className="font-medium">Exemplos:</span> tema (claro/escuro), configurações de dashboard, filtros salvos
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Seção 3 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">3. Como Utilizamos os Cookies</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Utilizamos cookies para as seguintes finalidades:
                </p>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Manter você conectado durante sua sessão;</li>
                  <li>Lembrar suas preferências de configuração;</li>
                  <li>Analisar o uso da plataforma para melhorias;</li>
                  <li>Garantir a segurança de sua conta;</li>
                  <li>Personalizar o conteúdo exibido;</li>
                  <li>Otimizar o desempenho da plataforma.</li>
                </ul>
              </div>
            </section>

            {/* Seção 4 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">4. Como Gerenciar Cookies</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Você pode gerenciar ou desabilitar cookies através das configurações do seu navegador:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <strong className="text-foreground">Google Chrome</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configurações → Privacidade e segurança → Cookies
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <strong className="text-foreground">Mozilla Firefox</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Opções → Privacidade e Segurança → Cookies
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <strong className="text-foreground">Safari</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Preferências → Privacidade → Cookies
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <strong className="text-foreground">Microsoft Edge</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configurações → Cookies e permissões do site
                    </p>
                  </div>
                </div>
                <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Atenção:</strong> Desabilitar cookies essenciais pode 
                    afetar o funcionamento da plataforma, impossibilitando o login e algumas funcionalidades.
                  </p>
                </div>
              </div>
            </section>

            {/* Seção 5 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">5. Cookies de Terceiros</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Podemos utilizar serviços de terceiros que também podem armazenar cookies:
                </p>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li><strong className="text-foreground">Google Analytics:</strong> para análise de uso da plataforma;</li>
                  <li><strong className="text-foreground">Stripe:</strong> para processamento seguro de pagamentos;</li>
                  <li><strong className="text-foreground">Supabase:</strong> para autenticação e banco de dados.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Estes serviços têm suas próprias políticas de privacidade e cookies. Recomendamos que você 
                  consulte as políticas de cada serviço para mais informações.
                </p>
              </div>
            </section>

            {/* Seção 6 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <Cookie className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">6. Atualizações desta Política</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Podemos atualizar esta Política de Cookies periodicamente. Quando houver alterações 
                  significativas, notificaremos você através de e-mail ou notificação na plataforma.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  A data de "Última atualização" no topo desta página indica quando a política foi revisada 
                  pela última vez. Recomendamos que você revise esta política periodicamente.
                </p>
              </div>
            </section>

            {/* Seção 7 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">7. Contato</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Para dúvidas sobre esta Política de Cookies:
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
                Ao continuar navegando na plataforma <strong className="text-foreground">ViajARTur</strong>, 
                você concorda com o uso de cookies conforme descrito nesta política.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ViaJARFooter />
    </div>
  );
};

export default Cookies;

