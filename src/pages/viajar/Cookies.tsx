import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Download, Cookie, Settings, BarChart3, Shield, ArrowLeft, Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
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
              h2 { color: #0891b2; margin-top: 30px; margin-bottom: 15px; font-size: 20px; }
              h3 { color: #334155; margin-top: 20px; margin-bottom: 10px; font-size: 16px; }
              p { margin-bottom: 15px; }
              ul { margin-left: 20px; margin-bottom: 15px; }
              li { margin-bottom: 8px; }
              strong { color: #333; }
              table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background: #f5f5f5; }
              @media print { body { padding: 20px; } @page { margin: 2cm; } }
            </style>
          </head>
          <body>
            <h1>Política de Cookies</h1>
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

  // Lista de cookies utilizados
  const essentialCookies = [
    { name: 'sb-access-token', purpose: 'Token de autenticação Supabase', duration: 'Sessão', provider: 'Supabase' },
    { name: 'sb-refresh-token', purpose: 'Token de renovação da sessão', duration: '7 dias', provider: 'Supabase' },
    { name: 'csrf_token', purpose: 'Proteção contra ataques CSRF', duration: 'Sessão', provider: 'ViajARTur' },
    { name: 'session_id', purpose: 'Identificador da sessão do usuário', duration: 'Sessão', provider: 'ViajARTur' },
  ];

  const preferenceCookies = [
    { name: 'theme', purpose: 'Preferência de tema (claro/escuro)', duration: '1 ano', provider: 'ViajARTur' },
    { name: 'sidebar_state', purpose: 'Estado da barra lateral (aberta/fechada)', duration: '30 dias', provider: 'ViajARTur' },
    { name: 'dashboard_layout', purpose: 'Layout preferido do dashboard', duration: '30 dias', provider: 'ViajARTur' },
    { name: 'locale', purpose: 'Preferência de idioma', duration: '1 ano', provider: 'ViajARTur' },
  ];

  const analyticsCookies = [
    { name: '_ga', purpose: 'Identificador único do Google Analytics', duration: '2 anos', provider: 'Google' },
    { name: '_gid', purpose: 'Identificador de sessão do Google Analytics', duration: '24 horas', provider: 'Google' },
    { name: '_gat', purpose: 'Limitador de taxa de requisições', duration: '1 minuto', provider: 'Google' },
  ];

  const thirdPartyCookies = [
    { name: '__stripe_mid', purpose: 'Detecção de fraude no pagamento', duration: '1 ano', provider: 'Stripe' },
    { name: '__stripe_sid', purpose: 'Sessão de pagamento', duration: '30 minutos', provider: 'Stripe' },
  ];

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
                para melhorar sua experiência em nossa plataforma. Esta política explica detalhadamente o que são 
                cookies, quais utilizamos, suas finalidades e como você pode gerenciá-los.
              </p>
            </div>

            {/* Seção 1 - O que são Cookies */}
            <section className="mb-10">
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
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-viajar-cyan flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-foreground font-medium mb-1">Segurança dos Cookies</p>
                      <p className="text-muted-foreground text-sm">
                        Cookies <strong>não podem</strong> executar programas, transmitir vírus ou acessar 
                        outros dados do seu dispositivo. Eles servem apenas para armazenar informações 
                        específicas sobre sua navegação.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Seção 2 - Tipos de Cookies */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">2. Tipos de Cookies que Utilizamos</h2>
              </div>
              <div className="ml-12 space-y-6">
                
                {/* Cookies Essenciais */}
                <div className="bg-red-50 p-5 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-red-600" />
                    <strong className="text-red-800 text-lg">Cookies Essenciais (Obrigatórios)</strong>
                  </div>
                  <p className="text-red-900 text-sm mb-4">
                    Necessários para o funcionamento básico da plataforma. <strong>Não podem ser desativados</strong> 
                    pois a plataforma não funcionaria corretamente sem eles.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm bg-white rounded">
                      <thead>
                        <tr className="bg-red-100">
                          <th className="border border-red-200 p-2 text-left font-semibold text-red-900">Cookie</th>
                          <th className="border border-red-200 p-2 text-left font-semibold text-red-900">Finalidade</th>
                          <th className="border border-red-200 p-2 text-left font-semibold text-red-900">Duração</th>
                          <th className="border border-red-200 p-2 text-left font-semibold text-red-900">Provedor</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {essentialCookies.map((cookie, i) => (
                          <tr key={i}>
                            <td className="border border-red-200 p-2 font-mono text-xs">{cookie.name}</td>
                            <td className="border border-red-200 p-2">{cookie.purpose}</td>
                            <td className="border border-red-200 p-2">{cookie.duration}</td>
                            <td className="border border-red-200 p-2">{cookie.provider}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Cookies de Preferências */}
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="w-5 h-5 text-blue-600" />
                    <strong className="text-blue-800 text-lg">Cookies de Preferências</strong>
                  </div>
                  <p className="text-blue-900 text-sm mb-4">
                    Lembram suas configurações e preferências para personalizar sua experiência.
                    Você pode desativá-los, mas algumas funcionalidades podem não funcionar como esperado.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm bg-white rounded">
                      <thead>
                        <tr className="bg-blue-100">
                          <th className="border border-blue-200 p-2 text-left font-semibold text-blue-900">Cookie</th>
                          <th className="border border-blue-200 p-2 text-left font-semibold text-blue-900">Finalidade</th>
                          <th className="border border-blue-200 p-2 text-left font-semibold text-blue-900">Duração</th>
                          <th className="border border-blue-200 p-2 text-left font-semibold text-blue-900">Provedor</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {preferenceCookies.map((cookie, i) => (
                          <tr key={i}>
                            <td className="border border-blue-200 p-2 font-mono text-xs">{cookie.name}</td>
                            <td className="border border-blue-200 p-2">{cookie.purpose}</td>
                            <td className="border border-blue-200 p-2">{cookie.duration}</td>
                            <td className="border border-blue-200 p-2">{cookie.provider}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Cookies de Análise */}
                <div className="bg-purple-50 p-5 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <strong className="text-purple-800 text-lg">Cookies de Análise</strong>
                  </div>
                  <p className="text-purple-900 text-sm mb-4">
                    Coletam informações sobre como você utiliza a plataforma, permitindo-nos melhorar 
                    a experiência do usuário. Dados são anonimizados e agregados.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm bg-white rounded">
                      <thead>
                        <tr className="bg-purple-100">
                          <th className="border border-purple-200 p-2 text-left font-semibold text-purple-900">Cookie</th>
                          <th className="border border-purple-200 p-2 text-left font-semibold text-purple-900">Finalidade</th>
                          <th className="border border-purple-200 p-2 text-left font-semibold text-purple-900">Duração</th>
                          <th className="border border-purple-200 p-2 text-left font-semibold text-purple-900">Provedor</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {analyticsCookies.map((cookie, i) => (
                          <tr key={i}>
                            <td className="border border-purple-200 p-2 font-mono text-xs">{cookie.name}</td>
                            <td className="border border-purple-200 p-2">{cookie.purpose}</td>
                            <td className="border border-purple-200 p-2">{cookie.duration}</td>
                            <td className="border border-purple-200 p-2">{cookie.provider}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </section>

            {/* Seção 3 - Cookies de Terceiros */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <ExternalLink className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">3. Cookies de Terceiros</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-muted-foreground">
                  Utilizamos serviços de terceiros que também podem armazenar cookies:
                </p>

                {/* Tabela de Cookies de Terceiros */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm bg-white rounded">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-200 p-2 text-left font-semibold">Cookie</th>
                          <th className="border border-gray-200 p-2 text-left font-semibold">Finalidade</th>
                          <th className="border border-gray-200 p-2 text-left font-semibold">Duração</th>
                          <th className="border border-gray-200 p-2 text-left font-semibold">Provedor</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {thirdPartyCookies.map((cookie, i) => (
                          <tr key={i}>
                            <td className="border border-gray-200 p-2 font-mono text-xs">{cookie.name}</td>
                            <td className="border border-gray-200 p-2">{cookie.purpose}</td>
                            <td className="border border-gray-200 p-2">{cookie.duration}</td>
                            <td className="border border-gray-200 p-2">{cookie.provider}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <h3 className="font-semibold text-foreground mt-6">Políticas de Privacidade dos Terceiros</h3>
                <p className="text-muted-foreground mb-3">
                  Cada serviço de terceiros tem sua própria política de privacidade e cookies:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-viajar-cyan" />
                    <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" 
                       className="text-viajar-cyan hover:underline">Supabase - Política de Privacidade</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-viajar-cyan" />
                    <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" 
                       className="text-viajar-cyan hover:underline">Stripe - Política de Privacidade</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-viajar-cyan" />
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" 
                       className="text-viajar-cyan hover:underline">Google - Política de Privacidade</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-viajar-cyan" />
                    <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" 
                       className="text-viajar-cyan hover:underline">Vercel - Política de Privacidade</a>
                  </li>
                </ul>
              </div>
            </section>

            {/* Seção 4 - Como Utilizamos os Cookies */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">4. Como Utilizamos os Cookies</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Utilizamos cookies para as seguintes finalidades:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Autenticação:</strong> Manter você conectado durante sua sessão</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Segurança:</strong> Proteger contra ataques e acessos não autorizados</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Preferências:</strong> Lembrar suas configurações (tema, layout)</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Análise:</strong> Entender como você usa a plataforma para melhorias</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Pagamentos:</strong> Processar transações de forma segura</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Seção 5 - Como Gerenciar Cookies */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">5. Como Gerenciar Cookies</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-muted-foreground">
                  Você pode gerenciar ou desabilitar cookies através das configurações do seu navegador:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <strong className="text-foreground">Google Chrome</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configurações → Privacidade e segurança → Cookies e outros dados do site
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <strong className="text-foreground">Mozilla Firefox</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configurações → Privacidade e Segurança → Cookies e dados de sites
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <strong className="text-foreground">Safari</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Preferências → Privacidade → Gerenciar dados do site
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <strong className="text-foreground">Microsoft Edge</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configurações → Cookies e permissões do site → Cookies
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-900 font-medium mb-1">Atenção</p>
                      <p className="text-amber-800 text-sm">
                        Desabilitar cookies essenciais pode afetar o funcionamento da plataforma, 
                        impossibilitando o login e algumas funcionalidades. Cookies de preferências 
                        desabilitados farão com que suas configurações não sejam lembradas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Seção 6 - Duração dos Cookies */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">6. Duração dos Cookies</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-muted-foreground">
                  Os cookies podem ser classificados pela sua duração:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-viajar-cyan/5 p-4 rounded-lg border border-viajar-cyan/20">
                    <strong className="text-viajar-cyan">Cookies de Sessão</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Temporários, são excluídos quando você fecha o navegador. Usados para autenticação e segurança.
                    </p>
                  </div>
                  <div className="bg-viajar-blue/5 p-4 rounded-lg border border-viajar-blue/20">
                    <strong className="text-viajar-blue">Cookies Persistentes</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      Permanecem por um período definido (dias, meses ou anos). Usados para preferências e análise.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Seção 7 - Atualizações */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <Cookie className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">7. Atualizações desta Política</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-muted-foreground">
                  Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças em 
                  nossos serviços ou requisitos legais. Quando houver alterações significativas:
                </p>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Você será notificado por e-mail;</li>
                  <li>A data de "Última atualização" será alterada;</li>
                  <li>Um aviso será exibido na plataforma.</li>
                </ul>
              </div>
            </section>

            {/* Seção 8 - Contato */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">8. Contato</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-muted-foreground">
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
