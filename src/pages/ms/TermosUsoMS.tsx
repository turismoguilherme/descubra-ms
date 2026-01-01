import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Download, FileText, AlertCircle, Shield, Users, ArrowLeft, CheckCircle } from 'lucide-react';
import UniversalLayout from '@/components/layout/UniversalLayout';
import { useRef } from 'react';
import { policyService } from '@/services/public/policyService';

const TermosUsoMS = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [policyContent, setPolicyContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    // Scroll para o topo quando o componente montar
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    const loadPolicy = async () => {
      try {
        const policy = await policyService.getPublishedPolicy('terms_of_use', 'descubra_ms');
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

  // Garantir scroll para topo após o conteúdo carregar
  useEffect(() => {
    if (!loading && contentRef.current) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      contentRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, [loading]);

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
              to="/descubrams" 
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
              <div className="ml-12 space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  A plataforma <strong>Descubra Mato Grosso do Sul</strong> é um portal completo de turismo que oferece 
                  os seguintes serviços:
                </p>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-ms-primary-blue">
                    <strong className="text-ms-primary-blue text-lg">Portal de Informações Turísticas</strong>
                    <p className="text-sm text-gray-700 mt-2">
                      Portal abrangente com informações detalhadas sobre:
                    </p>
                    <ul className="text-sm text-gray-700 mt-2 ml-4 space-y-1 list-disc">
                      <li>Pontos turísticos, atrações naturais e culturais de Mato Grosso do Sul</li>
                      <li>Roteiros turísticos personalizados e sugestões de viagem</li>
                      <li>Experiências turísticas únicas no estado</li>
                      <li>Mapas interativos com geolocalização</li>
                      <li>Informações sobre hospedagem, gastronomia e serviços turísticos</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-5 rounded-lg border-l-4 border-ms-pantanal-green">
                    <strong className="text-ms-pantanal-green text-lg">Passaporte Digital</strong>
                    <p className="text-sm text-gray-700 mt-2">
                      Sistema de gamificação que permite:
                    </p>
                    <ul className="text-sm text-gray-700 mt-2 ml-4 space-y-1 list-disc">
                      <li><strong>Check-in em pontos turísticos:</strong> usando geolocalização GPS do seu dispositivo para validar visitas</li>
                      <li><strong>Sistema de pontos e conquistas:</strong> ganhe pontos ao visitar destinos e desbloqueie conquistas</li>
                      <li><strong>Histórico de rotas:</strong> registre todas as rotas turísticas que você completou</li>
                      <li><strong>Recompensas:</strong> resgate benefícios e descontos oferecidos por parceiros turísticos</li>
                      <li><strong>Compartilhamento social:</strong> compartilhe suas visitas, fotos e experiências</li>
                    </ul>
                    <p className="text-xs text-gray-600 mt-2 italic">
                      O Passaporte Digital requer criação de conta e permissão de geolocalização. As recompensas são 
                      oferecidas pelos parceiros e podem ter condições específicas.
                    </p>
                  </div>
                  <div className="bg-teal-50 p-5 rounded-lg border-l-4 border-ms-discovery-teal">
                    <strong className="text-ms-discovery-teal text-lg">Guatá - Assistente Virtual com Inteligência Artificial</strong>
                    <p className="text-sm text-gray-700 mt-2">
                      Assistente virtual inteligente que oferece:
                    </p>
                    <ul className="text-sm text-gray-700 mt-2 ml-4 space-y-1 list-disc">
                      <li><strong>Chatbot interativo:</strong> converse com o Guatá para tirar dúvidas sobre turismo em Mato Grosso do Sul</li>
                      <li><strong>Recomendações personalizadas:</strong> receba sugestões de destinos baseadas nas suas preferências</li>
                      <li><strong>Busca web integrada:</strong> o Guatá pode buscar informações atualizadas na internet quando necessário</li>
                      <li><strong>Informações sobre destinos próximos:</strong> descubra atrações próximas à sua localização</li>
                      <li><strong>Histórico de conversas:</strong> suas conversas são salvas para melhorar recomendações futuras</li>
                    </ul>
                    <div className="bg-blue-50 border border-ms-primary-blue p-3 rounded mt-3">
                      <p className="text-xs text-gray-700">
                        <strong>ℹ️ Informação:</strong> O Guatá utiliza Inteligência Artificial (Google Gemini) para fornecer 
                        informações e recomendações sobre turismo. As respostas são geradas automaticamente e devem ser usadas como 
                        referência inicial. Para informações oficiais e decisões importantes, recomendamos consultar fontes oficiais 
                        e verificar detalhes diretamente com os estabelecimentos ou órgãos responsáveis.
                      </p>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-5 rounded-lg border-l-4 border-purple-500">
                    <strong className="text-purple-700 text-lg">Roteiros Turísticos por Inteligência Artificial</strong>
                    <p className="text-sm text-gray-700 mt-2">
                      Sistema que gera roteiros turísticos personalizados utilizando Inteligência Artificial:
                    </p>
                    <ul className="text-sm text-gray-700 mt-2 ml-4 space-y-1 list-disc">
                      <li><strong>Roteiros personalizados:</strong> receba sugestões de roteiros baseadas em seus interesses, perfil e histórico de visitas</li>
                      <li><strong>Parâmetros customizáveis:</strong> defina duração, orçamento, nível de dificuldade e necessidades de acessibilidade</li>
                      <li><strong>Roteiros por localização:</strong> descubra roteiros próximos à sua localização atual</li>
                      <li><strong>Histórico integrado:</strong> roteiros consideram destinos já visitados no Passaporte Digital</li>
                      <li><strong>Diversos tipos de roteiros:</strong> ecoturismo, cultura, aventura, gastronomia, entre outros</li>
                    </ul>
                    <div className="bg-yellow-50 border border-yellow-400 p-3 rounded mt-3">
                      <p className="text-xs text-gray-700 mb-2">
                        <strong>⚠️ Limitações e Responsabilidades:</strong>
                      </p>
                      <ul className="text-xs text-gray-700 ml-4 space-y-1 list-disc">
                        <li>Os roteiros são <strong>sugestões geradas por IA</strong> e devem ser usados como referência inicial</li>
                        <li>As sugestões são baseadas em informações disponíveis na plataforma e podem não incluir todos os destinos ou atrações</li>
                        <li>Recomendamos <strong>verificar informações</strong> (horários, preços, disponibilidade) diretamente com os estabelecimentos antes de visitar</li>
                        <li>A plataforma <strong>não se responsabiliza</strong> por alterações em horários, preços ou disponibilidade dos destinos sugeridos</li>
                        <li>Roteiros podem não considerar condições climáticas, eventos temporários ou restrições locais</li>
                        <li>Para decisões importantes, consulte fontes oficiais e verifique detalhes com os estabelecimentos</li>
                      </ul>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 italic">
                      Os roteiros são gerados utilizando seus dados de perfil, preferências e histórico para criar sugestões 
                      personalizadas. Você pode salvar, compartilhar e avaliar os roteiros sugeridos para melhorar futuras recomendações.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-ms-primary-blue">
                    <strong className="text-ms-primary-blue text-lg">Cadastro de Eventos</strong>
                    <p className="text-sm text-gray-700 mt-2">
                      Funcionalidade que permite:
                    </p>
                    <ul className="text-sm text-gray-700 mt-2 ml-4 space-y-1 list-disc">
                      <li>Visualizar eventos turísticos e culturais cadastrados na plataforma</li>
                      <li>Buscar eventos por data, localização ou categoria</li>
                      <li>Salvar eventos nos favoritos para acompanhamento</li>
                      <li>Receber notificações sobre eventos de interesse (com seu consentimento)</li>
                    </ul>
                    <p className="text-xs text-gray-600 mt-2 italic">
                      Os eventos são cadastrados por terceiros (organizadores, parceiros, órgãos públicos). A viajARTUR 
                      não se responsabiliza pela veracidade das informações ou pela realização dos eventos.
                    </p>
                    <div className="bg-teal-50 border-l-4 border-ms-discovery-teal p-4 rounded-r-lg mt-3">
                      <p className="text-sm text-gray-800 font-semibold mb-2">Para Empresas e Órgãos que Desejam Cadastrar Eventos:</p>
                      <p className="text-xs text-gray-700 mb-2">
                        Organizadores interessados em cadastrar eventos na plataforma devem:
                      </p>
                      <ul className="text-xs text-gray-700 ml-4 space-y-1 list-disc">
                        <li>Preencher formulário de cadastro com dados do evento (título, descrição, categoria, datas, horários, localização)</li>
                        <li>Fornecer dados do organizador (nome, e-mail, telefone de contato)</li>
                        <li>Enviar materiais promocionais (imagens, vídeos, logos) - obrigatório para eventos em destaque</li>
                        <li>Informar links oficiais (site, inscrição, ingressos) quando disponíveis</li>
                        <li>Aguardar processo de aprovação pela equipe da plataforma</li>
                        <li>Efetuar pagamento (quando optar por evento em destaque)</li>
                      </ul>
                      <p className="text-xs text-gray-600 mt-2 italic">
                        O cadastro de eventos é gratuito, mas eventos em destaque têm custo. Todos os eventos precisam de 
                        aprovação antes de serem publicados. Organizadores são responsáveis pela veracidade das informações 
                        e pela realização dos eventos conforme anunciado.
                      </p>
                    </div>
                  </div>
                  <div className="bg-green-50 p-5 rounded-lg border-l-4 border-ms-pantanal-green">
                    <strong className="text-ms-pantanal-green text-lg">Programa de Parceiros</strong>
                    <p className="text-sm text-gray-700 mt-2">
                      Sistema que conecta você com estabelecimentos turísticos:
                    </p>
                    <ul className="text-sm text-gray-700 mt-2 ml-4 space-y-1 list-disc">
                      <li><strong>Diretório de parceiros:</strong> hotéis, restaurantes, agências de turismo, pontos turísticos</li>
                      <li><strong>Reservas e transações:</strong> faça reservas diretamente através da plataforma</li>
                      <li><strong>Recompensas exclusivas:</strong> parceiros oferecem benefícios para usuários do Passaporte Digital</li>
                      <li><strong>Avaliações e comentários:</strong> compartilhe sua experiência com outros usuários</li>
                    </ul>
                    <p className="text-xs text-gray-600 mt-2 italic">
                      Os parceiros são responsáveis pelos serviços oferecidos e pelo tratamento dos dados compartilhados 
                      para viabilizar reservas. A viajARTUR atua como intermediária e não se responsabiliza por serviços 
                      prestados pelos parceiros.
                    </p>
                    <div className="bg-blue-50 border-l-4 border-ms-primary-blue p-4 rounded-r-lg mt-3">
                      <p className="text-sm text-gray-800 font-semibold mb-2">Para Empresas que Desejam se Tornar Parceiros:</p>
                      <p className="text-xs text-gray-700 mb-2">
                        Empresas interessadas em se cadastrar como parceiros devem:
                      </p>
                      <ul className="text-xs text-gray-700 ml-4 space-y-1 list-disc">
                        <li>Preencher formulário de cadastro com dados da empresa (nome, descrição, tipo de negócio)</li>
                        <li>Fornecer dados de identificação (CPF para pessoa física ou CNPJ para pessoa jurídica)</li>
                        <li>Informar dados de contato (e-mail, telefone, endereço)</li>
                        <li>Enviar fotos, logos e materiais promocionais (opcional)</li>
                        <li>Aguardar processo de aprovação pela equipe da plataforma</li>
                        <li>Integrar com sistema de pagamento (Stripe Connect) se desejar processar pagamentos</li>
                      </ul>
                      <p className="text-xs text-gray-600 mt-2 italic">
                        O cadastro é gratuito, mas está sujeito a aprovação. Empresas aprovadas poderão oferecer serviços, 
                        criar ofertas e participar do programa de recompensas. A plataforma se reserva o direito de recusar 
                        ou suspender parceiros que não cumpram os termos ou ofereçam serviços de baixa qualidade.
                      </p>
                    </div>
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

            {/* Seção 3.1 - Recuperação e Redefinição de Senha */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-2 rounded-lg flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-ms-primary-blue">3.1. Recuperação e Redefinição de Senha</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Se você esqueceu sua senha ou precisa redefini-la, siga o processo abaixo:
                </p>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">Como Recuperar sua Senha</h3>
                  <ol className="space-y-3 list-decimal list-inside text-gray-700 ml-4">
                    <li>
                      <strong>Acesse a página de recuperação de senha:</strong> Na tela de login, clique em "Esqueci minha senha" 
                      ou "Recuperar senha"
                    </li>
                    <li>
                      <strong>Informe seu e-mail cadastrado:</strong> Digite o endereço de e-mail associado à sua conta
                    </li>
                    <li>
                      <strong>Verifique sua caixa de entrada:</strong> Você receberá um e-mail com um link para redefinir sua senha
                    </li>
                    <li>
                      <strong>Clique no link recebido:</strong> O link direcionará você para uma página segura onde poderá criar uma nova senha
                    </li>
                    <li>
                      <strong>Crie uma nova senha:</strong> Digite uma senha forte (mínimo de 8 caracteres, incluindo letras, números e símbolos)
                    </li>
                    <li>
                      <strong>Confirme a nova senha:</strong> Digite a senha novamente para confirmar
                    </li>
                    <li>
                      <strong>Faça login:</strong> Após redefinir, você poderá fazer login com sua nova senha
                    </li>
                  </ol>
                </div>

                <div className="bg-blue-50 border-l-4 border-ms-primary-blue p-4 rounded-r-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Segurança do Processo</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>O link de recuperação é <strong>único e temporário</strong> - cada solicitação gera um novo link</li>
                    <li>O link expira após <strong>24 horas</strong> por motivos de segurança</li>
                    <li>O link só pode ser usado <strong>uma vez</strong> - após o uso, ele se torna inválido</li>
                    <li>O e-mail é enviado apenas para o <strong>endereço cadastrado</strong> na conta</li>
                    <li>Não compartilhe o link de recuperação com terceiros</li>
                  </ul>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">O que fazer se não receber o e-mail</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>Verifique sua <strong>caixa de spam ou lixo eletrônico</strong> - o e-mail pode ter sido filtrado</li>
                    <li>Confirme que está usando o <strong>e-mail correto</strong> cadastrado na conta</li>
                    <li>Aguarde alguns minutos - o e-mail pode demorar até <strong>5 minutos</strong> para chegar</li>
                    <li>Se após 10 minutos você não receber o e-mail, <strong>solicite novamente</strong> o link de recuperação</li>
                    <li>Se o problema persistir, entre em contato conosco pelo e-mail <strong>suporte@descubramsconline.com.br</strong></li>
                  </ul>
                </div>

                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Importante sobre Segurança</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li><strong>Nunca compartilhe sua senha</strong> com terceiros, mesmo que sejam pessoas de confiança</li>
                    <li>Use uma <strong>senha forte e única</strong> - não reutilize senhas de outras contas</li>
                    <li>Se você suspeitar que sua conta foi comprometida, <strong>redefina sua senha imediatamente</strong></li>
                    <li>Mantenha seu <strong>e-mail cadastrado atualizado</strong> para garantir que você possa recuperar sua conta</li>
                    <li>Se você não tem mais acesso ao e-mail cadastrado, entre em contato conosco para <strong>atualizar seu e-mail</strong></li>
                  </ul>
                </div>

                <p className="text-gray-600 text-sm mt-4 italic">
                  A viajARTUR se compromete a proteger seus dados e manter o processo de recuperação de senha seguro. 
                  Se você identificar qualquer atividade suspeita relacionada à sua conta, entre em contato conosco imediatamente.
                </p>
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
              <div className="ml-12 space-y-6">
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

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">6.1 Sobre o Guatá (Assistente Virtual com IA)</h3>
                  <div className="bg-blue-50 border-l-4 border-ms-primary-blue p-4 rounded-r-lg">
                    <p className="text-gray-700 leading-relaxed mb-2">
                      <strong>ℹ️ Informações sobre o Guatá:</strong>
                    </p>
                    <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                      <li>O <strong>Guatá utiliza Inteligência Artificial (Google Gemini)</strong> para fornecer informações e recomendações sobre turismo</li>
                      <li>As respostas são <strong>geradas automaticamente</strong> e devem ser usadas como referência inicial e ferramenta de apoio</li>
                      <li>Recomendações de destinos e informações fornecidas são <strong>sugestões baseadas em padrões identificados</strong>, não garantias absolutas</li>
                      <li>A busca web integrada utiliza fontes públicas que podem variar em atualização e precisão</li>
                      <li>Para <strong>decisões importantes</strong>, recomendamos verificar informações através de fontes oficiais e contatar diretamente os estabelecimentos</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-3">
                      O Guatá é uma <strong>ferramenta de apoio</strong> que complementa, mas não substitui, a verificação direta 
                      com fontes oficiais. A <strong>viajARTUR</strong> recomenda que decisões importantes sejam tomadas considerando 
                      múltiplas fontes de informação.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">6.2 Sobre o Passaporte Digital</h3>
                  <div className="bg-blue-50 border-l-4 border-ms-primary-blue p-4 rounded-r-lg">
                    <p className="text-gray-700 leading-relaxed mb-2">
                      <strong>Limitações e Responsabilidades:</strong>
                    </p>
                    <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                      <li>As <strong>recompensas são oferecidas pelos parceiros</strong>, não pela viajARTUR. A viajARTUR não garante a disponibilidade, qualidade ou validade das recompensas</li>
                      <li>Recompensas podem ter <strong>condições específicas</strong> definidas pelos parceiros (validade, quantidade limitada, etc.)</li>
                      <li>O sistema de check-in depende da <strong>geolocalização GPS</strong> do seu dispositivo, que pode não estar sempre precisa</li>
                      <li>A viajARTUR não se responsabiliza por <strong>fraudes ou uso indevido</strong> do sistema de pontos e recompensas</li>
                      <li>Pontos e conquistas são <strong>virtuais</strong> e não têm valor monetário</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">6.3 Sobre Parceiros Turísticos</h3>
                  <div className="bg-green-50 border-l-4 border-ms-pantanal-green p-4 rounded-r-lg">
                    <p className="text-gray-700 leading-relaxed mb-2">
                      <strong>Responsabilidade dos Parceiros:</strong>
                    </p>
                    <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                      <li>Os <strong>parceiros são responsáveis</strong> pelos serviços oferecidos (hospedagem, alimentação, passeios, etc.)</li>
                      <li>A viajARTUR atua como <strong>intermediária</strong> e não se responsabiliza pela qualidade, disponibilidade ou cumprimento dos serviços prestados pelos parceiros</li>
                      <li>Informações sobre parceiros (preços, disponibilidade, avaliações) são fornecidas pelos próprios parceiros ou por terceiros</li>
                      <li>A viajARTUR não garante a <strong>veracidade das informações</strong> fornecidas pelos parceiros</li>
                      <li>Disputas relacionadas a reservas ou serviços devem ser <strong>resolvidas diretamente com o parceiro</strong></li>
                      <li>Recomendamos que você leia os <strong>termos e condições</strong> de cada parceiro antes de fazer reservas</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">6.4 Sobre Eventos</h3>
                  <div className="bg-teal-50 border-l-4 border-ms-discovery-teal p-4 rounded-r-lg">
                    <p className="text-gray-700 leading-relaxed mb-2">
                      <strong>Eventos Cadastrados por Terceiros:</strong>
                    </p>
                    <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                      <li>Os eventos são <strong>cadastrados por terceiros</strong> (organizadores, parceiros, órgãos públicos)</li>
                      <li>A viajARTUR <strong>não se responsabiliza</strong> pela veracidade das informações sobre eventos (data, local, preço, disponibilidade)</li>
                      <li>A viajARTUR não garante que os eventos serão <strong>realizados conforme anunciado</strong></li>
                      <li>Cancelamentos, alterações ou problemas com eventos devem ser <strong>resolvidos diretamente com os organizadores</strong></li>
                      <li>A viajARTUR não se responsabiliza por <strong>ingressos, reembolsos ou danos</strong> relacionados a eventos</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">6.5 Sobre Roteiros por Inteligência Artificial</h3>
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                    <p className="text-gray-700 leading-relaxed mb-2">
                      <strong>Limitações dos Roteiros Gerados por IA:</strong>
                    </p>
                    <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                      <li>Os roteiros são <strong>sugestões geradas automaticamente</strong> por Inteligência Artificial e devem ser usados como referência inicial</li>
                      <li>As sugestões são baseadas em <strong>informações disponíveis na plataforma</strong> e podem não incluir todos os destinos, atrações ou estabelecimentos disponíveis</li>
                      <li>A viajARTUR <strong>não garante</strong> a precisão, completude ou atualização das informações incluídas nos roteiros</li>
                      <li>Roteiros podem não considerar <strong>condições climáticas, eventos temporários, restrições locais ou alterações</strong> em horários, preços ou disponibilidade</li>
                      <li>Recomendamos <strong>verificar informações</strong> (horários, preços, disponibilidade, acessibilidade) diretamente com os estabelecimentos antes de visitar</li>
                      <li>Para decisões importantes, consulte <strong>fontes oficiais</strong> e verifique detalhes com os estabelecimentos ou órgãos responsáveis</li>
                      <li>A viajARTUR não se responsabiliza por <strong>experiências que não atendam às expectativas</strong> baseadas nos roteiros sugeridos</li>
                    </ul>
                    <p className="text-gray-600 text-sm mt-3 italic">
                      Os roteiros são uma ferramenta de apoio para planejamento de viagens. A responsabilidade final sobre 
                      decisões de viagem, verificações e planejamento detalhado é do usuário.
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mt-4">
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Limitações Gerais:</strong> A <strong>viajARTUR</strong> não se responsabiliza por:
                  </p>
                  <ul className="space-y-1 list-disc list-inside text-gray-700 mt-2">
                    <li>Danos diretos, indiretos, incidentais ou consequenciais decorrentes do uso da plataforma;</li>
                    <li>Perda de dados, lucros ou oportunidades de negócio;</li>
                    <li>Experiências turísticas que não atendam às expectativas do usuário;</li>
                    <li>Problemas técnicos, indisponibilidade temporária ou interrupções no serviço;</li>
                    <li>Uso indevido ou não autorizado da plataforma por terceiros.</li>
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
              </>
            )}
          </div>
        </div>
      </main>
    </UniversalLayout>
  );
};

export default TermosUsoMS;

