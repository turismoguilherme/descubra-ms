import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Download, FileText, AlertCircle, Shield, Users, ArrowLeft, CheckCircle } from 'lucide-react';
import UniversalLayout from '@/components/layout/UniversalLayout';
import { useRef } from 'react';

const TermosUsoMS = () => {
  const contentRef = useRef<HTMLDivElement>(null);

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
            <title>Termos de Uso - Descubra Mato Grosso do Sul</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #333; }
              h1 { color: #003087; font-size: 28px; margin-bottom: 10px; }
              h2 { color: #2E7D32; margin-top: 30px; margin-bottom: 15px; font-size: 22px; }
              p { margin-bottom: 15px; }
              ul { margin-left: 20px; margin-bottom: 15px; }
              li { margin-bottom: 8px; }
              strong { color: #333; }
              .bg-gradient-to-r, .bg-blue-50, .bg-green-50, .bg-teal-50, .bg-yellow-50, .bg-red-50 { background: #f5f5f5 !important; padding: 15px; border-left: 4px solid #003087; margin: 15px 0; }
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
            <h1>Termos de Uso</h1>
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
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                Termos de Uso
              </h1>
            </div>
            <p className="text-white/95 text-lg max-w-3xl">
              Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
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

            {/* Introdução */}
            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed text-lg">
                Estes Termos de Uso regem o uso da plataforma <strong>Descubra Mato Grosso do Sul</strong>, 
                operada pela <strong>viajARTUR</strong>. Ao acessar e utilizar esta plataforma, você concorda 
                com estes termos. Se você não concordar com qualquer parte destes termos, não deve utilizar 
                nossos serviços.
              </p>
            </div>

            {/* Seção 1 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-primary-blue">1. Aceitação dos Termos</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  Ao criar uma conta, acessar ou utilizar qualquer funcionalidade da plataforma 
                  <strong> Descubra Mato Grosso do Sul</strong>, você declara que:
                </p>
                <ul className="space-y-2 list-disc list-inside text-gray-700">
                  <li>Leu, compreendeu e concordou com estes Termos de Uso;</li>
                  <li>Concordou com nossa Política de Privacidade;</li>
                  <li>Possui capacidade legal para celebrar este acordo;</li>
                  <li>Forneceu informações verdadeiras, precisas e atualizadas;</li>
                  <li>É responsável por manter a segurança de sua conta e senha.</li>
                </ul>
              </div>
            </section>

            {/* Seção 2 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-pantanal-green to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-pantanal-green">2. Descrição dos Serviços</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  A plataforma <strong>Descubra Mato Grosso do Sul</strong> oferece os seguintes serviços:
                </p>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-ms-primary-blue">
                    <strong className="text-ms-primary-blue">Informações sobre Destinos Turísticos</strong>
                    <p className="text-sm text-gray-700 mt-1">
                      Informações detalhadas sobre pontos turísticos, atrações, roteiros e experiências no estado.
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-ms-pantanal-green">
                    <strong className="text-ms-pantanal-green">Passaporte Digital</strong>
                    <p className="text-sm text-gray-700 mt-1">
                      Sistema de check-in em pontos turísticos com registro de visitas e recompensas.
                    </p>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-ms-discovery-teal">
                    <strong className="text-ms-discovery-teal">Guatá - Assistente Virtual com IA</strong>
                    <p className="text-sm text-gray-700 mt-1">
                      Assistente virtual inteligente para tirar dúvidas e fornecer informações sobre turismo.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-ms-primary-blue">
                    <strong className="text-ms-primary-blue">Cadastro de Eventos</strong>
                    <p className="text-sm text-gray-700 mt-1">
                      Funcionalidade para cadastrar e promover eventos turísticos e culturais.
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-ms-pantanal-green">
                    <strong className="text-ms-pantanal-green">Programa de Parceiros</strong>
                    <p className="text-sm text-gray-700 mt-1">
                      Sistema para estabelecimentos turísticos se cadastrarem como parceiros da plataforma.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Seção 3 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-primary-blue">3. Cadastro e Conta do Usuário</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  Para utilizar determinadas funcionalidades, você precisará criar uma conta:
                </p>
                <ul className="space-y-2 list-disc list-inside text-gray-700">
                  <li>Você é responsável por manter a confidencialidade de suas credenciais de acesso;</li>
                  <li>Você é responsável por todas as atividades que ocorrem em sua conta;</li>
                  <li>Você deve nos notificar imediatamente sobre qualquer uso não autorizado;</li>
                  <li>Você deve fornecer informações verdadeiras, precisas e atualizadas;</li>
                  <li>Você deve ter pelo menos 18 anos ou ter autorização de responsável legal;</li>
                  <li>Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos.</li>
                </ul>
              </div>
            </section>

            {/* Seção 4 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-pantanal-green to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-pantanal-green">4. Condutas Proibidas</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  Você concorda em NÃO utilizar a plataforma para:
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span className="text-gray-700">Publicar conteúdo ofensivo, difamatório, discriminatório ou ilegal;</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span className="text-gray-700">Violar direitos de propriedade intelectual de terceiros;</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span className="text-gray-700">Tentar acessar áreas restritas ou sistemas da plataforma;</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span className="text-gray-700">Transmitir vírus, malware ou códigos maliciosos;</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span className="text-gray-700">Realizar atividades fraudulentas ou enganosas;</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span className="text-gray-700">Coletar dados de outros usuários sem autorização;</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span className="text-gray-700">Utilizar a plataforma para spam ou publicidade não autorizada;</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span className="text-gray-700">Criar contas falsas ou se passar por outra pessoa;</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span className="text-gray-700">Interferir no funcionamento normal da plataforma.</span>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mt-4">
                  A violação destas regras pode resultar em suspensão ou encerramento imediato da conta, 
                  além de medidas legais cabíveis.
                </p>
              </div>
            </section>

            {/* Seção 5 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-primary-blue">5. Propriedade Intelectual</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  Todo o conteúdo da plataforma, incluindo textos, imagens, logos, design, código-fonte e 
                  funcionalidades, é de propriedade da <strong>viajARTUR</strong> ou de seus licenciadores e 
                  está protegido por leis de propriedade intelectual.
                </p>
                <div className="bg-blue-50 border-l-4 border-ms-primary-blue p-4 rounded-r-lg">
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Você pode:</strong> visualizar, baixar e imprimir conteúdo para uso pessoal e não comercial.
                  </p>
                </div>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Você NÃO pode:</strong> reproduzir, distribuir, modificar, criar obras derivadas, 
                    publicar, transmitir ou explorar comercialmente qualquer conteúdo sem autorização prévia por escrito.
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Ao enviar conteúdo para a plataforma (comentários, avaliações, fotos, etc.), você concede 
                  à <strong>viajARTUR</strong> uma licença não exclusiva, mundial e gratuita para utilizar, 
                  reproduzir e exibir esse conteúdo na plataforma.
                </p>
              </div>
            </section>

            {/* Seção 6 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-pantanal-green to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-pantanal-green">6. Limitação de Responsabilidade</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  A plataforma é fornecida "como está" e "conforme disponível". A <strong>viajARTUR</strong> 
                  não garante que:
                </p>
                <ul className="space-y-2 list-disc list-inside text-gray-700">
                  <li>A plataforma estará sempre disponível, ininterrupta ou livre de erros;</li>
                  <li>Os resultados obtidos através da plataforma serão precisos ou confiáveis;</li>
                  <li>Defeitos serão corrigidos;</li>
                  <li>A plataforma estará livre de vírus ou outros componentes prejudiciais.</li>
                </ul>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mt-4">
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Importante:</strong> A <strong>viajARTUR</strong> não se responsabiliza por:
                  </p>
                  <ul className="space-y-1 list-disc list-inside text-gray-700 mt-2">
                    <li>Danos diretos, indiretos, incidentais ou consequenciais decorrentes do uso da plataforma;</li>
                    <li>Perda de dados, lucros ou oportunidades de negócio;</li>
                    <li>Informações incorretas fornecidas por terceiros (parceiros, prestadores de serviços);</li>
                    <li>Experiências turísticas que não atendam às expectativas do usuário;</li>
                    <li>Cancelamentos ou alterações em eventos ou serviços de terceiros.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Seção 7 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-primary-blue">7. Links para Sites de Terceiros</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  A plataforma pode conter links para sites de terceiros (parceiros, prestadores de serviços, etc.). 
                  Esses links são fornecidos apenas para sua conveniência.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  A <strong>viajARTUR</strong> não tem controle sobre o conteúdo, políticas de privacidade ou 
                  práticas de sites de terceiros e não se responsabiliza por eles. Recomendamos que você leia os 
                  termos e políticas de privacidade de qualquer site de terceiro que visitar.
                </p>
              </div>
            </section>

            {/* Seção 8 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-pantanal-green to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-pantanal-green">8. Modificações nos Serviços e Termos</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  A <strong>viajARTUR</strong> se reserva o direito de:
                </p>
                <ul className="space-y-2 list-disc list-inside text-gray-700">
                  <li>Modificar, suspender ou descontinuar qualquer aspecto da plataforma a qualquer momento;</li>
                  <li>Atualizar estes Termos de Uso periodicamente;</li>
                  <li>Notificar sobre alterações através da plataforma ou e-mail cadastrado.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  O uso continuado da plataforma após alterações nos termos constitui aceitação das mesmas. 
                  Se você não concordar com as alterações, deve cessar o uso da plataforma e encerrar sua conta.
                </p>
              </div>
            </section>

            {/* Seção 9 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-primary-blue">9. Rescisão</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  Você pode encerrar sua conta a qualquer momento através das configurações da plataforma ou 
                  entrando em contato conosco.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  A <strong>viajARTUR</strong> pode suspender ou encerrar sua conta imediatamente, sem aviso prévio, 
                  se você violar estes Termos de Uso ou se houver qualquer atividade suspeita ou fraudulenta.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Após o encerramento, você perderá acesso à sua conta e a todos os dados associados, exceto 
                  quando a retenção for exigida por lei.
                </p>
              </div>
            </section>

            {/* Seção 10 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-pantanal-green to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-pantanal-green">10. Lei Aplicável e Foro</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Qualquer disputa decorrente destes termos será resolvida no foro da comarca de Campo Grande - MS, 
                  renunciando as partes a qualquer outro, por mais privilegiado que seja.
                </p>
              </div>
            </section>

            {/* Seção 11 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-primary-blue">11. Disposições Gerais</h2>
              </div>
              <div className="ml-12 space-y-3">
                <ul className="space-y-2 list-disc list-inside text-gray-700">
                  <li>Se qualquer disposição destes termos for considerada inválida, as demais disposições permanecerão em vigor;</li>
                  <li>Estes termos constituem o acordo completo entre você e a viajARTUR sobre o uso da plataforma;</li>
                  <li>A falha da viajARTUR em exercer qualquer direito não constitui renúncia a esse direito;</li>
                  <li>Você não pode transferir seus direitos ou obrigações sob estes termos sem nosso consentimento prévio por escrito.</li>
                </ul>
              </div>
            </section>

            {/* Seção 12 */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-pantanal-green to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-pantanal-green">12. Contato</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Para questões sobre estes Termos de Uso, entre em contato:
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-ms-primary-blue/20">
                  <p className="text-gray-800 font-semibold mb-2">viajARTUR</p>
                  <p className="text-gray-700">Responsável pela plataforma Descubra Mato Grosso do Sul</p>
                  <p className="text-gray-700 mt-2">
                    <strong>E-mail:</strong> contato@descubramsconline.com.br
                  </p>
                  <p className="text-gray-700">
                    <strong>Telefone:</strong> (67) 3318-7600
                  </p>
                </div>
              </div>
            </section>

            {/* Rodapé do Documento */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-center text-gray-600 text-sm">
                Ao utilizar a plataforma <strong>Descubra Mato Grosso do Sul</strong>, você declara ter lido, 
                compreendido e concordado com estes Termos de Uso.
              </p>
            </div>
          </div>
        </div>
      </main>
    </UniversalLayout>
  );
};

export default TermosUsoMS;

