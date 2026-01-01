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
    // Scroll para o topo quando o componente montar
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
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
              to="/descubrams" 
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
              <div className="ml-12 space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Coletamos os seguintes tipos de informações quando você utiliza nossa plataforma:
                </p>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">1.1 Dados de Cadastro</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    Quando você cria uma conta para usar o <strong>Passaporte Digital</strong>, coletamos:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>Nome completo</li>
                    <li>CPF</li>
                    <li>E-mail</li>
                    <li>Telefone</li>
                    <li>Data de nascimento</li>
                    <li>Endereço e localização</li>
                    <li>Foto de perfil (opcional)</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-2 italic">
                    Esses dados são necessários para criar e gerenciar sua conta, validar sua identidade e fornecer funcionalidades personalizadas.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">1.2 Dados do Passaporte Digital</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    Quando você utiliza o <strong>Passaporte Digital</strong> para fazer check-in em pontos turísticos, coletamos:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>Check-ins em pontos turísticos (localização GPS, data/hora, ponto visitado)</li>
                    <li>Histórico de rotas completadas</li>
                    <li>Pontos e conquistas acumuladas</li>
                    <li>Recompensas resgatadas</li>
                    <li>Interações com parceiros (reservas, avaliações, preferências)</li>
                    <li>Fotos e comentários sobre visitas (quando você compartilha)</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-2 italic">
                    Esses dados são coletados automaticamente quando você faz check-in usando a geolocalização do seu dispositivo.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">1.3 Dados de Interação com Guatá (IA)</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    Quando você conversa com o <strong>Guatá</strong>, nosso assistente virtual com Inteligência Artificial, coletamos:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>Todas as conversas realizadas com o assistente virtual Guatá</li>
                    <li>Perguntas feitas e respostas recebidas</li>
                    <li>Histórico de buscas e recomendações solicitadas</li>
                    <li>Preferências identificadas pela IA baseadas nas conversas</li>
                    <li>Dados de localização quando você pergunta sobre destinos próximos</li>
                    <li>Interações com funcionalidades de busca web integrada</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-2 italic">
                    Essas conversas são armazenadas para melhorar a qualidade das respostas e personalizar recomendações futuras.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">1.4 Dados de Navegação</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    Quando você navega pela plataforma, coletamos automaticamente:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>Páginas visitadas (destinos, eventos, parceiros, informações turísticas)</li>
                    <li>Tempo de permanência em cada página</li>
                    <li>Origem do acesso (referrer - de onde você veio)</li>
                    <li>Dispositivo e navegador utilizado</li>
                    <li>Endereço IP</li>
                    <li>Data e hora de cada acesso</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-2 italic">
                    Esses dados são coletados automaticamente através de cookies e tecnologias similares para melhorar a experiência e analisar o uso da plataforma.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">1.5 Dados de Eventos</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    Quando você visualiza, salva ou interage com eventos cadastrados na plataforma:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>Eventos visualizados</li>
                    <li>Eventos salvos nos favoritos</li>
                    <li>Interesse em eventos (cliques, compartilhamentos)</li>
                    <li>Preferências de tipos de eventos (culturais, esportivos, gastronômicos, etc.)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">1.6 Dados de Geolocalização</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    Quando você autoriza o uso da geolocalização, coletamos:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>Localização GPS em tempo real (quando você faz check-in no Passaporte Digital)</li>
                    <li>Localização aproximada (quando você busca destinos próximos)</li>
                    <li>Histórico de localizações visitadas</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-2 italic">
                    A geolocalização é solicitada apenas quando necessário para funcionalidades específicas (como check-in no Passaporte Digital). Você pode desativar a geolocalização nas configurações do seu dispositivo a qualquer momento.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">1.7 Dados de Empresas Parceiras</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    Quando uma empresa se cadastra como parceiro na plataforma, coletamos:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li><strong>Dados da empresa:</strong> nome, descrição, tipo de negócio (hotel, restaurante, agência, etc.)</li>
                    <li><strong>Dados de identificação:</strong> CPF (pessoa física) ou CNPJ (pessoa jurídica)</li>
                    <li><strong>Dados de contato:</strong> e-mail, telefone, endereço completo</li>
                    <li><strong>Dados de mídia:</strong> fotos, logos, vídeos promocionais, galeria de imagens</li>
                    <li><strong>Dados de integração:</strong> URLs de site oficial, YouTube, redes sociais</li>
                    <li><strong>Dados de pagamento:</strong> informações para integração com Stripe Connect (quando aplicável)</li>
                    <li><strong>Status de aprovação:</strong> informações sobre o processo de cadastro e aprovação</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-2 italic">
                    Esses dados são coletados para viabilizar o cadastro e aprovação de parceiros, permitir que eles ofereçam serviços na plataforma e facilitar a conexão com usuários interessados em reservas e experiências turísticas.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">1.8 Dados de Organizadores de Eventos</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    Quando uma empresa ou órgão cadastra um evento na plataforma, coletamos:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li><strong>Dados do evento:</strong> título, descrição, categoria, datas, horários, localização</li>
                    <li><strong>Dados do organizador:</strong> nome, e-mail, telefone de contato</li>
                    <li><strong>Dados de mídia:</strong> imagens, vídeos promocionais, logos do evento</li>
                    <li><strong>Links oficiais:</strong> site oficial, links de inscrição ou compra de ingressos</li>
                    <li><strong>Dados de pagamento:</strong> informações sobre pagamento para eventos em destaque (quando aplicável)</li>
                    <li><strong>Região turística:</strong> identificação automática da região baseada na localização</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-2 italic">
                    Esses dados são coletados para permitir que organizadores cadastrem eventos na plataforma, facilitar a descoberta de eventos pelos usuários e gerenciar o processo de aprovação e publicação dos eventos.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">1.9 Dados para Roteiros por Inteligência Artificial</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    Quando você solicita ou utiliza roteiros turísticos gerados por IA, coletamos:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li><strong>Preferências de viagem:</strong> interesses (ecoturismo, cultura, aventura, gastronomia, etc.)</li>
                    <li><strong>Dados de perfil:</strong> tipo de viajante (turista ou morador), faixa etária, origem</li>
                    <li><strong>Histórico de visitas:</strong> destinos já visitados (do Passaporte Digital)</li>
                    <li><strong>Localização atual:</strong> quando você solicita roteiros próximos</li>
                    <li><strong>Parâmetros do roteiro:</strong> duração desejada, orçamento, nível de dificuldade, acessibilidade</li>
                    <li><strong>Interações com roteiros:</strong> roteiros visualizados, salvos, compartilhados</li>
                    <li><strong>Feedback sobre roteiros:</strong> avaliações, sugestões de melhoria</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-2 italic">
                    Esses dados são utilizados para personalizar e melhorar as sugestões de roteiros geradas pela Inteligência Artificial, oferecendo experiências turísticas mais relevantes e adequadas ao seu perfil e preferências.
                  </p>
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
              <div className="ml-12 space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Utilizamos seus dados pessoais para as seguintes finalidades específicas:
                </p>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">2.1 Funcionalidades do Passaporte Digital</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>Registrar check-ins em pontos turísticos usando geolocalização GPS</li>
                    <li>Calcular e atribuir pontos e conquistas baseadas nas visitas</li>
                    <li>Gerenciar sistema de recompensas oferecidas por parceiros</li>
                    <li>Criar histórico de rotas e destinos visitados</li>
                    <li>Validar visitas e prevenir fraudes no sistema de gamificação</li>
                    <li>Personalizar recomendações de destinos baseadas no seu histórico</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">2.2 Funcionalidades do Guatá (Assistente Virtual com IA)</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>Processar suas perguntas e fornecer respostas sobre turismo em Mato Grosso do Sul</li>
                    <li>Melhorar a qualidade das respostas através de aprendizado das conversas</li>
                    <li>Personalizar recomendações de destinos baseadas nas suas preferências identificadas</li>
                    <li>Realizar buscas web integradas quando necessário para responder suas perguntas</li>
                    <li>Fornecer informações sobre destinos próximos usando sua localização</li>
                    <li>Manter histórico de conversas para contexto em interações futuras</li>
                  </ul>
                  <div className="bg-blue-50 border-l-4 border-ms-primary-blue p-4 rounded-r-lg mt-3">
                    <p className="text-gray-700 text-sm">
                      <strong>Informação:</strong> O Guatá utiliza Inteligência Artificial (Google Gemini) para fornecer 
                      informações e recomendações sobre turismo em Mato Grosso do Sul. As respostas são geradas automaticamente 
                      e devem ser usadas como referência inicial. Para informações oficiais e decisões importantes, recomendamos 
                      consultar fontes oficiais e verificar detalhes diretamente com os estabelecimentos ou órgãos responsáveis.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">2.3 Informações e Conteúdo</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>Fornecer informações detalhadas sobre destinos turísticos, atrações e roteiros</li>
                    <li>Exibir eventos turísticos e culturais cadastrados na plataforma</li>
                    <li>Apresentar parceiros turísticos (hotéis, restaurantes, agências) e suas ofertas</li>
                    <li>Personalizar conteúdo baseado nas suas preferências e histórico de navegação</li>
                    <li>Fornecer mapas interativos e rotas turísticas</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">2.4 Parceiros e Reservas</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>Conectar você com parceiros turísticos para reservas e experiências</li>
                    <li>Compartilhar informações necessárias com parceiros para viabilizar reservas</li>
                    <li>Processar avaliações e comentários sobre parceiros</li>
                    <li>Gerenciar sistema de recompensas oferecidas por parceiros</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-2 italic">
                    Quando você faz uma reserva ou interage com um parceiro, compartilhamos apenas os dados necessários 
                    para viabilizar a transação. Os parceiros são responsáveis pelo tratamento dos dados que recebem.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">2.5 Gestão de Parceiros Cadastrados</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>Processar e avaliar solicitações de cadastro de empresas como parceiros</li>
                    <li>Validar informações fornecidas (CNPJ, CPF, dados de contato)</li>
                    <li>Gerenciar processo de aprovação e ativação de parceiros</li>
                    <li>Facilitar integração com sistemas de pagamento (Stripe Connect)</li>
                    <li>Exibir informações de parceiros na plataforma para usuários</li>
                    <li>Gerenciar ofertas, recompensas e benefícios oferecidos por parceiros</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-2 italic">
                    Os dados de parceiros são tratados para viabilizar o programa de parcerias, permitir que empresas ofereçam serviços na plataforma e facilitar a conexão entre parceiros e usuários interessados.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">2.6 Gestão de Eventos Cadastrados</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>Processar e avaliar solicitações de cadastro de eventos</li>
                    <li>Validar informações fornecidas pelos organizadores</li>
                    <li>Gerenciar processo de aprovação e publicação de eventos</li>
                    <li>Facilitar descoberta de eventos pelos usuários (busca, filtros, recomendações)</li>
                    <li>Processar pagamentos para eventos em destaque (quando aplicável)</li>
                    <li>Identificar automaticamente a região turística do evento</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-2 italic">
                    Os dados de eventos são tratados para permitir que organizadores cadastrem eventos na plataforma, facilitar a descoberta de eventos pelos usuários e gerenciar o processo de aprovação e publicação.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">2.7 Geração de Roteiros por Inteligência Artificial</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>Analisar suas preferências e perfil de viajante para personalizar roteiros</li>
                    <li>Gerar sugestões de roteiros turísticos baseadas em seus interesses e histórico</li>
                    <li>Considerar sua localização atual para sugerir destinos próximos</li>
                    <li>Adaptar roteiros conforme parâmetros fornecidos (duração, orçamento, acessibilidade)</li>
                    <li>Melhorar continuamente a qualidade das sugestões através de aprendizado</li>
                    <li>Fornecer informações sobre destinos, atrações e experiências incluídas nos roteiros</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-2 italic">
                    Os roteiros são gerados utilizando Inteligência Artificial que analisa seus dados de perfil, preferências e histórico para criar sugestões personalizadas. As sugestões são baseadas em informações disponíveis na plataforma e podem não incluir todos os destinos ou atrações disponíveis.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">2.5 Gestão de Parceiros Cadastrados</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>Processar e avaliar solicitações de cadastro de empresas como parceiros</li>
                    <li>Validar informações fornecidas (CNPJ, CPF, dados de contato)</li>
                    <li>Gerenciar processo de aprovação e ativação de parceiros</li>
                    <li>Facilitar integração com sistemas de pagamento (Stripe Connect)</li>
                    <li>Exibir informações de parceiros na plataforma para usuários</li>
                    <li>Gerenciar ofertas, recompensas e benefícios oferecidos por parceiros</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-2 italic">
                    Os dados de parceiros são tratados para viabilizar o programa de parcerias, permitir que empresas ofereçam serviços na plataforma e facilitar a conexão entre parceiros e usuários interessados.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">2.6 Gestão de Eventos Cadastrados</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>Processar e avaliar solicitações de cadastro de eventos</li>
                    <li>Validar informações fornecidas pelos organizadores</li>
                    <li>Gerenciar processo de aprovação e publicação de eventos</li>
                    <li>Facilitar descoberta de eventos pelos usuários (busca, filtros, recomendações)</li>
                    <li>Processar pagamentos para eventos em destaque (quando aplicável)</li>
                    <li>Identificar automaticamente a região turística do evento</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-2 italic">
                    Os dados de eventos são tratados para permitir que organizadores cadastrem eventos na plataforma, facilitar a descoberta de eventos pelos usuários e gerenciar o processo de aprovação e publicação.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">2.7 Geração de Roteiros por Inteligência Artificial</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>Analisar suas preferências e perfil de viajante para personalizar roteiros</li>
                    <li>Gerar sugestões de roteiros turísticos baseadas em seus interesses e histórico</li>
                    <li>Considerar sua localização atual para sugerir destinos próximos</li>
                    <li>Adaptar roteiros conforme parâmetros fornecidos (duração, orçamento, acessibilidade)</li>
                    <li>Melhorar continuamente a qualidade das sugestões através de aprendizado</li>
                    <li>Fornecer informações sobre destinos, atrações e experiências incluídas nos roteiros</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-2 italic">
                    Os roteiros são gerados utilizando Inteligência Artificial que analisa seus dados de perfil, preferências e histórico para criar sugestões personalizadas. As sugestões são baseadas em informações disponíveis na plataforma e podem não incluir todos os destinos ou atrações disponíveis.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">2.8 Melhorias e Análises</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>Realizar análises estatísticas sobre uso da plataforma</li>
                    <li>Identificar padrões de uso para melhorar funcionalidades</li>
                    <li>Desenvolver novas funcionalidades baseadas no feedback dos usuários</li>
                    <li>Corrigir bugs e otimizar performance da plataforma</li>
                    <li>Medir eficácia de campanhas e comunicações</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">2.9 Comunicações e Marketing</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>Enviar comunicações sobre destinos, eventos e promoções (apenas com seu consentimento)</li>
                    <li>Notificar sobre novas funcionalidades e atualizações da plataforma</li>
                    <li>Enviar lembretes sobre check-ins e recompensas disponíveis</li>
                    <li>Compartilhar dicas de turismo e conteúdo relevante</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-2 italic">
                    Você pode optar por não receber comunicações de marketing a qualquer momento nas configurações da conta 
                    ou clicando no link de descadastro presente em cada e-mail.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">2.7 Segurança e Conformidade Legal</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li>Prevenir fraudes e garantir a segurança da plataforma</li>
                    <li>Detectar e prevenir atividades suspeitas ou não autorizadas</li>
                    <li>Cumprir obrigações legais e regulatórias (LGPD, legislação tributária, etc.)</li>
                    <li>Atender solicitações de autoridades competentes quando exigido por lei</li>
                    <li>Manter registros de segurança e auditoria</li>
                  </ul>
                </div>
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
              <div className="ml-12 space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Seus dados pessoais podem ser compartilhados nas seguintes situações:
                </p>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">3.1 Prestadores de Serviços Técnicos</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Utilizamos os seguintes serviços de terceiros para operar a plataforma:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-3 text-left font-semibold text-gray-800">Serviço</th>
                          <th className="border border-gray-300 p-3 text-left font-semibold text-gray-800">Finalidade</th>
                          <th className="border border-gray-300 p-3 text-left font-semibold text-gray-800">Localização</th>
                          <th className="border border-gray-300 p-3 text-left font-semibold text-gray-800">Base Legal</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        <tr>
                          <td className="border border-gray-300 p-3"><strong>Supabase</strong></td>
                          <td className="border border-gray-300 p-3">Hospedagem, banco de dados, autenticação de usuários, armazenamento de dados</td>
                          <td className="border border-gray-300 p-3">Brasil (São Paulo)</td>
                          <td className="border border-gray-300 p-3">Execução de contrato, Legítimo interesse</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-3"><strong>Google Gemini AI</strong></td>
                          <td className="border border-gray-300 p-3">Processamento de conversas do Guatá (assistente virtual), geração de respostas e recomendações</td>
                          <td className="border border-gray-300 p-3">Estados Unidos</td>
                          <td className="border border-gray-300 p-3">Execução de contrato (cláusulas contratuais padrão)</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-3"><strong>Vercel</strong></td>
                          <td className="border border-gray-300 p-3">Hospedagem da aplicação web, CDN (Content Delivery Network)</td>
                          <td className="border border-gray-300 p-3">Global (CDN)</td>
                          <td className="border border-gray-300 p-3">Execução de contrato</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-3"><strong>Google Maps API</strong></td>
                          <td className="border border-gray-300 p-3">Exibição de mapas interativos, geocodificação, cálculo de rotas</td>
                          <td className="border border-gray-300 p-3">Estados Unidos</td>
                          <td className="border border-gray-300 p-3">Execução de contrato</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-gray-600 text-sm mt-3 italic">
                    Todos os prestadores de serviço possuem contratos que garantem a proteção dos dados conforme a LGPD. 
                    Para transferências internacionais, utilizamos cláusulas contratuais padrão aprovadas.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">3.2 Parceiros Turísticos</h3>
                  <div className="bg-blue-50 border-l-4 border-ms-primary-blue p-4 rounded-r-lg">
                    <p className="text-gray-700 leading-relaxed mb-2">
                      <strong>Parceiros e Prestadores de Serviços:</strong> compartilhamos dados necessários com 
                      parceiros turísticos (hotéis, restaurantes, agências, pontos turísticos) para:
                    </p>
                    <ul className="space-y-1 list-disc list-inside text-gray-700 ml-4">
                      <li>Viabilizar reservas e experiências solicitadas</li>
                      <li>Processar check-ins no Passaporte Digital</li>
                      <li>Validar recompensas e benefícios oferecidos</li>
                      <li>Facilitar comunicação entre você e o parceiro</li>
                    </ul>
                    <p className="text-gray-600 text-sm mt-3 italic">
                      Compartilhamos apenas os dados estritamente necessários para a transação. Os parceiros são 
                      responsáveis pelo tratamento dos dados que recebem e devem cumprir a LGPD.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">3.3 Autoridades Competentes</h3>
                  <div className="bg-teal-50 border-l-4 border-ms-discovery-teal p-4 rounded-r-lg">
                    <p className="text-gray-700 leading-relaxed">
                      Quando exigido por lei, ordem judicial ou solicitação de autoridade competente, podemos 
                      compartilhar dados com autoridades públicas, incluindo:
                    </p>
                    <ul className="space-y-1 list-disc list-inside text-gray-700 ml-4 mt-2">
                      <li>Autoridade Nacional de Proteção de Dados (ANPD)</li>
                      <li>Órgãos de fiscalização e controle</li>
                      <li>Autoridades judiciais</li>
                      <li>Órgãos de segurança pública</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-lg mt-4">
                  <p className="text-green-900 font-medium">
                    ✓ <strong>Não vendemos, alugamos ou comercializamos seus dados pessoais para terceiros.</strong>
                  </p>
                  <p className="text-green-800 text-sm mt-2">
                    Seus dados são compartilhados apenas nas situações descritas acima e sempre com o objetivo de 
                    fornecer os serviços da plataforma ou cumprir obrigações legais.
                  </p>
                </div>
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
              <div className="ml-12 space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Você possui os seguintes direitos em relação aos seus dados pessoais, conforme previsto na 
                  Lei Geral de Proteção de Dados (LGPD - Art. 18):
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-ms-primary-blue/20">
                    <strong className="text-ms-primary-blue">Confirmação e Acesso</strong>
                    <p className="text-sm text-gray-700 mt-1">Confirmar a existência de tratamento e acessar seus dados.</p>
                    <p className="text-xs text-gray-600 mt-2 italic">
                      Exemplo: Solicitar uma cópia de todos os seus dados cadastrais, histórico de check-ins do Passaporte Digital ou conversas com o Guatá.
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-ms-pantanal-green/20">
                    <strong className="text-ms-pantanal-green">Correção</strong>
                    <p className="text-sm text-gray-700 mt-1">Solicitar correção de dados incompletos ou desatualizados.</p>
                    <p className="text-xs text-gray-600 mt-2 italic">
                      Exemplo: Atualizar seu e-mail, telefone ou endereço nas configurações da conta ou solicitar correção de dados incorretos.
                    </p>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg border border-ms-discovery-teal/20">
                    <strong className="text-ms-discovery-teal">Anonimização ou Eliminação</strong>
                    <p className="text-sm text-gray-700 mt-1">Solicitar anonimização ou exclusão de dados desnecessários.</p>
                    <p className="text-xs text-gray-600 mt-2 italic">
                      Exemplo: Solicitar exclusão do histórico de conversas com o Guatá ou exclusão de check-ins específicos do Passaporte Digital.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-ms-primary-blue/20">
                    <strong className="text-ms-primary-blue">Portabilidade</strong>
                    <p className="text-sm text-gray-700 mt-1">Receber seus dados em formato estruturado e interoperável.</p>
                    <p className="text-xs text-gray-600 mt-2 italic">
                      Exemplo: Solicitar exportação de todos os seus dados em formato JSON ou CSV, incluindo histórico de check-ins, conversas e preferências.
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-ms-pantanal-green/20">
                    <strong className="text-ms-pantanal-green">Revogação de Consentimento</strong>
                    <p className="text-sm text-gray-700 mt-1">Revogar seu consentimento a qualquer momento.</p>
                    <p className="text-xs text-gray-600 mt-2 italic">
                      Exemplo: Desativar o recebimento de e-mails de marketing nas configurações da conta ou revogar consentimento para compartilhamento de dados com parceiros.
                    </p>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg border border-ms-discovery-teal/20">
                    <strong className="text-ms-discovery-teal">Informação sobre Compartilhamento</strong>
                    <p className="text-sm text-gray-700 mt-1">Obter informações sobre compartilhamento de dados.</p>
                    <p className="text-xs text-gray-600 mt-2 italic">
                      Exemplo: Solicitar uma lista de todos os parceiros e prestadores de serviço com quem seus dados foram compartilhados.
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-5 rounded-lg border border-ms-primary-blue/20 mt-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Como Exercer Seus Direitos</h3>
                  <p className="text-gray-700 text-sm mb-3">
                    Você pode exercer seus direitos de duas formas:
                  </p>
                  <ol className="space-y-2 text-gray-700 text-sm ml-4">
                    <li className="list-decimal">
                      <strong>Através da plataforma:</strong> Acesse as <strong>Configurações da Conta</strong> para 
                      atualizar dados, gerenciar preferências de privacidade, solicitar exportação de dados ou excluir sua conta.
                    </li>
                    <li className="list-decimal">
                      <strong>Por e-mail:</strong> Envie uma solicitação para <strong>privacidade@descubramsconline.com.br</strong> 
                      informando qual direito deseja exercer e fornecendo informações que permitam sua identificação.
                    </li>
                  </ol>
                  <p className="text-gray-600 text-xs mt-3 italic">
                    Responderemos sua solicitação em até <strong>15 dias úteis</strong>, conforme previsto na LGPD. 
                    Em casos complexos, podemos solicitar um prazo adicional de até 15 dias, informando você previamente.
                  </p>
                </div>
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
              <div className="ml-12 space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades descritas nesta 
                  política, exceto quando a retenção for exigida ou permitida por lei. Critérios específicos de retenção:
                </p>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">7.1 Dados do Passaporte Digital</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li><strong>Check-ins e histórico de visitas:</strong> mantidos enquanto sua conta estiver ativa e por 2 anos após o encerramento da conta</li>
                    <li><strong>Pontos e conquistas:</strong> mantidos enquanto sua conta estiver ativa</li>
                    <li><strong>Recompensas resgatadas:</strong> mantidas por 5 anos (obrigação fiscal e comercial)</li>
                    <li><strong>Fotos e comentários sobre visitas:</strong> mantidos enquanto você não solicitar exclusão</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">7.2 Conversas com Guatá (IA)</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li><strong>Histórico de conversas:</strong> mantido por 12 meses para melhorar a qualidade das respostas</li>
                    <li><strong>Preferências identificadas:</strong> mantidas enquanto sua conta estiver ativa</li>
                    <li>Você pode solicitar a exclusão do histórico de conversas a qualquer momento</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">7.3 Dados de Conta</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li><strong>Dados de cadastro:</strong> mantidos enquanto sua conta estiver ativa e por 5 anos após o encerramento (obrigação legal)</li>
                    <li><strong>Credenciais de acesso:</strong> mantidas enquanto sua conta estiver ativa</li>
                    <li><strong>Preferências e configurações:</strong> mantidas enquanto sua conta estiver ativa</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">7.4 Dados de Navegação</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li><strong>Logs de acesso:</strong> mantidos por 12 meses para análises e segurança</li>
                    <li><strong>Dados de uso da plataforma:</strong> mantidos por 24 meses para melhorias e análises estatísticas</li>
                    <li><strong>Cookies e tecnologias similares:</strong> conforme descrito na seção de Cookies</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-3">7.5 Dados de Eventos e Interações</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 ml-4">
                    <li><strong>Eventos visualizados e salvos:</strong> mantidos enquanto sua conta estiver ativa</li>
                    <li><strong>Avaliações e comentários:</strong> mantidos enquanto você não solicitar exclusão</li>
                    <li><strong>Interações com parceiros:</strong> mantidas por 5 anos (obrigação comercial)</li>
                  </ul>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
                  <p className="text-amber-900 font-medium mb-2">
                    <strong>Exceções Legais:</strong>
                  </p>
                  <p className="text-amber-800 text-sm">
                    Alguns dados podem ser retidos por períodos mais longos quando exigido por lei, como dados fiscais 
                    (5 anos), dados de segurança (conforme legislação aplicável) ou quando necessário para exercício 
                    de direitos em processos judiciais.
                  </p>
                </div>
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

