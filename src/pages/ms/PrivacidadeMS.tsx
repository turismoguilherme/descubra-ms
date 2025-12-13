import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Download, Shield, Lock, Eye, FileText, Mail, ArrowLeft } from 'lucide-react';
import UniversalLayout from '@/components/layout/UniversalLayout';
import { useRef } from 'react';
import { policyService } from '@/services/public/policyService';

const PrivacidadeMS = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [policyContent, setPolicyContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const loadPolicy = async () => {
      try {
        const policy = await policyService.getPublishedPolicy('privacy_policy', 'descubra_ms');
        if (policy && policy.content) {
          setPolicyContent(policy.content);
          setLastUpdated(policy.last_updated);
        }
      } catch (error) {
        console.warn('Erro ao carregar política do banco:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPolicy();
  }, []);

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && contentRef.current) {
      // Clonar o conteúdo e remover elementos que não devem aparecer no PDF
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
            <title>Política de Privacidade - Descubra Mato Grosso do Sul</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #333; }
              h1 { color: #003087; font-size: 28px; margin-bottom: 10px; }
              h2 { color: #2E7D32; margin-top: 30px; margin-bottom: 15px; font-size: 22px; }
              p { margin-bottom: 15px; }
              ul { margin-left: 20px; margin-bottom: 15px; }
              li { margin-bottom: 8px; }
              strong { color: #333; }
              .bg-gradient-to-r, .bg-blue-50, .bg-green-50, .bg-teal-50 { background: #f5f5f5 !important; padding: 15px; border-left: 4px solid #003087; margin: 15px 0; }
              .flex { display: block; }
              .mb-8 { margin-bottom: 30px; }
              .mb-4 { margin-bottom: 20px; }
              .mb-2 { margin-bottom: 10px; }
              .mt-4 { margin-top: 20px; }
              .mt-12 { margin-top: 40px; }
              .pt-8 { padding-top: 30px; }
              .border-t { border-top: 1px solid #ddd; }
              .text-center { text-align: center; }
              @media print { 
                body { padding: 20px; }
                @page { margin: 2cm; }
              }
            </style>
          </head>
          <body>
            <h1>Política de Privacidade</h1>
            <p><strong>Descubra Mato Grosso do Sul</strong></p>
            <p><em>Última atualização: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</em></p>
            <hr style="margin: 30px 0;">
            ${clone.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <UniversalLayout>
      <main className="flex-grow bg-gradient-to-b from-blue-50 via-white to-green-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green py-16">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative ms-container">
            <Link 
              to="/descubramatogrossodosul" 
              className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao início
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                Política de Privacidade
              </h1>
            </div>
            <p className="text-white/95 text-lg max-w-3xl">
              Última atualização: {lastUpdated 
                ? new Date(lastUpdated).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                : new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="ms-container py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-4xl mx-auto" ref={contentRef}>
            {/* Botão de Download PDF */}
            <div className="mb-8 flex justify-end">
              <Button
                onClick={handleDownloadPDF}
                className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal text-white hover:from-ms-discovery-teal hover:to-ms-pantanal-green"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
            </div>

            {/* Conteúdo Dinâmico ou Fallback */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-primary-blue"></div>
              </div>
            ) : policyContent ? (
              /* Conteúdo do banco */
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: policyService.markdownToHtml(policyContent)
                }}
              />
            ) : (
              /* Conteúdo padrão (fallback) */
              <>
                {/* Introdução */}
                <div className="mb-8">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    A <strong>viajARTUR</strong>, responsável pela plataforma <strong>Descubra Mato Grosso do Sul</strong>, 
                    está comprometida com a proteção da privacidade e dos dados pessoais de seus usuários, em conformidade 
                    com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong> e demais normas aplicáveis.
                  </p>
                </div>

            {/* Seção 1 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-primary-blue">1. Informações Coletadas</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Coletamos os seguintes tipos de informações quando você utiliza nossa plataforma:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-ms-discovery-teal rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-gray-800">Dados de Identificação:</strong> nome completo, CPF, e-mail, 
                      telefone, data de nascimento, endereço, fotos de perfil.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-ms-discovery-teal rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-gray-800">Dados de Navegação:</strong> endereço IP, tipo de navegador, 
                      páginas visitadas, tempo de permanência, origem do acesso.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-ms-discovery-teal rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-gray-800">Dados de Uso:</strong> preferências de destinos, histórico de 
                      buscas, avaliações e comentários, check-ins em pontos turísticos, uso do Passaporte Digital.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-ms-discovery-teal rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-gray-800">Dados de Localização:</strong> informações de geolocalização 
                      quando você utiliza funcionalidades que requerem sua localização.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-ms-discovery-teal rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-gray-800">Dados de Interação com IA:</strong> conversas com o Guatá 
                      (assistente virtual), perguntas realizadas, respostas fornecidas.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Seção 2 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-pantanal-green to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-pantanal-green">2. Finalidade do Tratamento</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  Utilizamos seus dados pessoais para as seguintes finalidades:
                </p>
                <ul className="space-y-2 list-disc list-inside text-gray-700">
                  <li>Fornecer e melhorar nossos serviços de turismo e informações sobre destinos;</li>
                  <li>Personalizar sua experiência na plataforma;</li>
                  <li>Processar cadastros, reservas e transações;</li>
                  <li>Enviar comunicações sobre destinos, eventos e promoções (com seu consentimento);</li>
                  <li>Operar o Passaporte Digital e sistema de recompensas;</li>
                  <li>Fornecer suporte ao cliente e responder a solicitações;</li>
                  <li>Realizar análises estatísticas e melhorias na plataforma;</li>
                  <li>Cumprir obrigações legais e regulatórias;</li>
                  <li>Prevenir fraudes e garantir a segurança da plataforma.</li>
                </ul>
              </div>
            </section>

            {/* Seção 3 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-primary-blue">3. Compartilhamento de Dados</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Seus dados pessoais podem ser compartilhados nas seguintes situações:
                </p>
                <div className="bg-blue-50 border-l-4 border-ms-primary-blue p-4 rounded-r-lg">
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Parceiros e Prestadores de Serviços:</strong> compartilhamos dados necessários com 
                    parceiros turísticos, hotéis, restaurantes e prestadores de serviços para viabilizar reservas 
                    e experiências solicitadas.
                  </p>
                </div>
                <div className="bg-green-50 border-l-4 border-ms-pantanal-green p-4 rounded-r-lg">
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Prestadores de Serviços Técnicos:</strong> utilizamos serviços de terceiros para 
                    hospedagem, análise de dados, processamento de pagamentos e comunicação, sempre com contratos 
                    que garantem a proteção dos dados.
                  </p>
                </div>
                <div className="bg-teal-50 border-l-4 border-ms-discovery-teal p-4 rounded-r-lg">
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Autoridades Competentes:</strong> quando exigido por lei ou ordem judicial, podemos 
                    compartilhar dados com autoridades públicas.
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Não vendemos, alugamos ou comercializamos seus dados pessoais para terceiros.</strong>
                </p>
              </div>
            </section>

            {/* Seção 4 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-pantanal-green to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-pantanal-green">4. Segurança dos Dados</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais:
                </p>
                <ul className="space-y-2 list-disc list-inside text-gray-700">
                  <li>Criptografia de dados em trânsito e em repouso;</li>
                  <li>Controle de acesso baseado em permissões;</li>
                  <li>Monitoramento contínuo de segurança;</li>
                  <li>Backups regulares dos dados;</li>
                  <li>Treinamento de equipe sobre proteção de dados;</li>
                  <li>Auditorias periódicas de segurança.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Apesar de nossos esforços, nenhum sistema é 100% seguro. Recomendamos que você mantenha suas 
                  credenciais de acesso em sigilo e nos informe imediatamente sobre qualquer uso não autorizado.
                </p>
              </div>
            </section>

            {/* Seção 5 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-primary-blue">5. Cookies e Tecnologias Similares</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  Utilizamos cookies e tecnologias similares para melhorar sua experiência na plataforma:
                </p>
                <div className="space-y-3">
                  <div>
                    <strong className="text-gray-800">Cookies Essenciais:</strong> necessários para o funcionamento 
                    básico da plataforma (autenticação, segurança).
                  </div>
                  <div>
                    <strong className="text-gray-800">Cookies de Análise:</strong> coletam informações sobre como 
                    você utiliza a plataforma para melhorias.
                  </div>
                  <div>
                    <strong className="text-gray-800">Cookies de Preferências:</strong> lembram suas configurações 
                    e preferências.
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Você pode gerenciar ou desabilitar cookies através das configurações do seu navegador. 
                  Note que desabilitar cookies pode afetar algumas funcionalidades da plataforma.
                </p>
              </div>
            </section>

            {/* Seção 6 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-pantanal-green to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-pantanal-green">6. Direitos do Titular (LGPD)</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  Você possui os seguintes direitos em relação aos seus dados pessoais:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <strong className="text-ms-primary-blue">Confirmação e Acesso</strong>
                    <p className="text-sm text-gray-700 mt-1">Confirmar a existência de tratamento e acessar seus dados.</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <strong className="text-ms-pantanal-green">Correção</strong>
                    <p className="text-sm text-gray-700 mt-1">Solicitar correção de dados incompletos ou desatualizados.</p>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <strong className="text-ms-discovery-teal">Anonimização ou Eliminação</strong>
                    <p className="text-sm text-gray-700 mt-1">Solicitar anonimização ou exclusão de dados desnecessários.</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <strong className="text-ms-primary-blue">Portabilidade</strong>
                    <p className="text-sm text-gray-700 mt-1">Receber seus dados em formato estruturado e interoperável.</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <strong className="text-ms-pantanal-green">Revogação de Consentimento</strong>
                    <p className="text-sm text-gray-700 mt-1">Revogar seu consentimento a qualquer momento.</p>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <strong className="text-ms-discovery-teal">Informação sobre Compartilhamento</strong>
                    <p className="text-sm text-gray-700 mt-1">Obter informações sobre compartilhamento de dados.</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Para exercer seus direitos, entre em contato conosco através dos canais indicados na seção 
                  "Contato e Encarregado de Dados".
                </p>
              </div>
            </section>

            {/* Seção 7 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-primary-blue">7. Retenção de Dados</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades descritas nesta 
                  política, exceto quando a retenção for exigida ou permitida por lei. Critérios de retenção:
                </p>
                <ul className="space-y-2 list-disc list-inside text-gray-700">
                  <li>Dados de conta: enquanto sua conta estiver ativa e por período adicional conforme exigido por lei;</li>
                  <li>Dados de transações: conforme exigido por legislação fiscal e comercial;</li>
                  <li>Dados de navegação: período necessário para análises e melhorias;</li>
                  <li>Dados de consentimento: até a revogação do consentimento ou término da finalidade.</li>
                </ul>
              </div>
            </section>

            {/* Seção 8 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-pantanal-green to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-pantanal-green">8. Contato e Encarregado de Dados</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Para exercer seus direitos, esclarecer dúvidas ou apresentar reclamações sobre o tratamento de 
                  seus dados pessoais, entre em contato:
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-ms-primary-blue/20">
                  <p className="text-gray-800 font-semibold mb-2">viajARTUR</p>
                  <p className="text-gray-700">Responsável pela plataforma Descubra Mato Grosso do Sul</p>
                  <p className="text-gray-700 mt-2">
                    <strong>E-mail:</strong> privacidade@descubramsconline.com.br
                  </p>
                  <p className="text-gray-700">
                    <strong>Telefone:</strong> (67) 3318-7600
                  </p>
                  <p className="text-gray-700 mt-4">
                    <strong>Encarregado de Dados (DPO):</strong> Para questões específicas sobre proteção de dados, 
                    entre em contato através do e-mail acima mencionado.
                  </p>
                </div>
              </div>
            </section>

            {/* Seção 9 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-primary-blue">9. Alterações nesta Política</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  Podemos atualizar esta Política de Privacidade periodicamente. Quando houver alterações 
                  significativas, notificaremos você através de:
                </p>
                <ul className="space-y-2 list-disc list-inside text-gray-700">
                  <li>E-mail cadastrado em sua conta;</li>
                  <li>Notificação na plataforma;</li>
                  <li>Atualização da data de "Última atualização" no topo desta página.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Recomendamos que você revise esta política periodicamente para se manter informado sobre como 
                  protegemos seus dados.
                </p>
              </div>
            </section>

            {/* Seção 10 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-pantanal-green to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-pantanal-green">10. Consentimento</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  Ao utilizar a plataforma <strong>Descubra Mato Grosso do Sul</strong>, você declara ter lido, 
                  compreendido e concordado com esta Política de Privacidade.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Se você não concordar com esta política, solicitamos que não utilize nossos serviços. 
                  O uso continuado da plataforma após alterações nesta política constitui aceitação das mesmas.
                </p>
              </div>
            </section>

                {/* Rodapé do Documento */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <p className="text-center text-gray-600 text-sm">
                    Esta Política de Privacidade é regida pela legislação brasileira, especialmente pela 
                    Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </UniversalLayout>
  );
};

export default PrivacidadeMS;

