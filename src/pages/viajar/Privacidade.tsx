import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Download, Shield, Lock, Eye, FileText, Mail, ArrowLeft, UserX, Database, Globe, AlertTriangle, CheckCircle, Clock, Server } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import { policyService } from '@/services/public/policyService';

const Privacidade = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [policyContent, setPolicyContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const loadPolicy = async () => {
      try {
        const policy = await policyService.getPublishedPolicy('privacy_policy', 'viajar');
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
              h2 { color: #0891b2; margin-top: 30px; margin-bottom: 15px; font-size: 20px; }
              h3 { color: #334155; margin-top: 20px; margin-bottom: 10px; font-size: 16px; }
              p { margin-bottom: 15px; }
              ul { margin-left: 20px; margin-bottom: 15px; }
              li { margin-bottom: 8px; }
              strong { color: #333; }
              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background: #f5f5f5; }
              @media print { body { padding: 20px; } @page { margin: 2cm; } }
            </style>
          </head>
          <body>
            <h1>Política de Privacidade</h1>
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
              <Shield className="w-8 h-8 text-viajar-cyan" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Política de Privacidade
            </h1>
          </div>
          <p className="text-white/80 text-lg max-w-3xl">
            Última atualização: {lastUpdated 
              ? new Date(lastUpdated).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
              : new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
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

            {/* Conteúdo Dinâmico ou Fallback */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viajar-cyan"></div>
              </div>
            ) : policyContent ? (
              /* Conteúdo do banco */
              <div 
                className="prose prose-lg max-w-none text-foreground"
                dangerouslySetInnerHTML={{ 
                  __html: policyService.markdownToHtml(policyContent)
                }}
              />
            ) : (
              /* Conteúdo padrão (fallback) */
              <>
                {/* Introdução */}
                <div className="mb-8">
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    A <strong className="text-foreground">ViajARTur</strong> está comprometida com a proteção da privacidade 
                    e dos dados pessoais de seus usuários, em conformidade com a <strong className="text-foreground">Lei Geral 
                    de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong> e demais normas aplicáveis.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    Esta política descreve como coletamos, usamos, armazenamos, protegemos e, quando necessário, 
                    excluímos suas informações pessoais.
                  </p>
                </div>

            {/* Seção 1 - Informações Coletadas */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">1. Informações Coletadas</h2>
              </div>
              <div className="ml-12 space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  Coletamos os seguintes tipos de informações quando você utiliza a plataforma SaaS ViajARTur:
                </p>

                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-3">1.1 Dados de Cadastro e Conta</h3>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    Quando você cria uma conta na plataforma, coletamos:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-muted-foreground ml-4">
                    <li><strong>Dados pessoais:</strong> nome completo, CPF (para pessoa física) ou CNPJ (para pessoa jurídica)</li>
                    <li><strong>Dados da empresa/órgão:</strong> razão social, nome fantasia, área de atuação</li>
                    <li><strong>Dados de contato:</strong> e-mail corporativo e pessoal, telefone de contato</li>
                    <li><strong>Endereço comercial:</strong> logradouro, número, complemento, cidade, estado, CEP</li>
                    <li><strong>Dados profissionais:</strong> cargo ou função, departamento</li>
                    <li><strong>Credenciais de acesso:</strong> senha (criptografada), tokens de autenticação</li>
                  </ul>
                  <p className="text-muted-foreground text-sm mt-2 italic">
                    Esses dados são necessários para criar e gerenciar sua conta, processar assinaturas e fornecer suporte.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-3">1.2 Dados de Uso da Plataforma SaaS</h3>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    Quando você utiliza as funcionalidades da plataforma, coletamos:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-muted-foreground ml-4">
                    <li><strong>Dados de receitas e ocupação:</strong> valores de receita, taxa de ocupação, número de visitantes</li>
                    <li><strong>Dados de precificação:</strong> preços de serviços, tarifas, políticas de preços</li>
                    <li><strong>Dados de inventário turístico:</strong> informações sobre atrativos, pontos turísticos, serviços oferecidos</li>
                    <li><strong>Dados de CATs (Centros de Atendimento ao Turista):</strong> informações sobre atendimentos, métricas de performance</li>
                    <li><strong>Documentos e arquivos:</strong> documentos enviados, relatórios gerados, análises exportadas</li>
                    <li><strong>Funcionalidades utilizadas:</strong> quais módulos e ferramentas você acessa com mais frequência</li>
                    <li><strong>Configurações e preferências:</strong> preferências de visualização, notificações, integrações configuradas</li>
                  </ul>
                  <p className="text-muted-foreground text-sm mt-2 italic">
                    Esses dados são essenciais para fornecer as funcionalidades do SaaS, gerar análises e insights personalizados.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-3">1.3 Dados de Interação com Guilherme IA</h3>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    Quando você interage com o <strong>Guilherme IA</strong>, nosso assistente de análise com Inteligência Artificial, coletamos:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-muted-foreground ml-4">
                    <li><strong>Conversas completas:</strong> todas as perguntas feitas e respostas recebidas</li>
                    <li><strong>Análises solicitadas:</strong> tipos de análises e insights solicitados</li>
                    <li><strong>Dados utilizados nas análises:</strong> quais dados da sua conta foram utilizados para gerar insights</li>
                    <li><strong>Preferências identificadas:</strong> padrões e preferências identificadas pela IA baseadas nas interações</li>
                    <li><strong>Feedback sobre respostas:</strong> quando você avalia ou fornece feedback sobre as respostas da IA</li>
                  </ul>
                  <div className="bg-viajar-cyan/5 border-l-4 border-viajar-cyan p-4 rounded-r-lg mt-3">
                    <p className="text-muted-foreground text-sm">
                      <strong>Informação:</strong> O Guilherme IA utiliza Inteligência Artificial (Google Gemini) para gerar análises 
                      e insights estratégicos. As recomendações são baseadas em padrões identificados nos dados e devem ser consideradas 
                      como ferramentas de apoio à decisão. Para decisões estratégicas importantes, recomendamos considerar múltiplas 
                      fontes de informação e consultar especialistas quando necessário.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-3">1.4 Dados de Pagamento</h3>
                  <div className="bg-viajar-cyan/5 border-l-4 border-viajar-cyan p-4 rounded-r-lg">
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      Informações de pagamento são processadas diretamente pelo <strong>Stripe</strong>, plataforma segura de pagamentos 
                      certificada PCI DSS (Payment Card Industry Data Security Standard).
                    </p>
                    <p className="text-muted-foreground text-sm mb-2">
                      A ViajARTur <strong>não armazena</strong> dados completos de cartão de crédito ou informações bancárias sensíveis.
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Recebemos apenas informações necessárias para gerenciar assinaturas:
                    </p>
                    <ul className="space-y-1 list-disc list-inside text-muted-foreground ml-4 mt-2">
                      <li>Últimos 4 dígitos do cartão</li>
                      <li>Bandeira do cartão (Visa, Mastercard, etc.)</li>
                      <li>Status da transação (aprovada, recusada, pendente)</li>
                      <li>Data de vencimento da assinatura</li>
                      <li>Histórico de pagamentos e faturas</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-3">1.5 Dados de Navegação e Uso</h3>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    Quando você navega pela plataforma, coletamos automaticamente:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-muted-foreground ml-4">
                    <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, dispositivo utilizado, sistema operacional</li>
                    <li><strong>Dados de navegação:</strong> páginas visitadas, tempo de permanência em cada página, fluxo de navegação</li>
                    <li><strong>Dados de origem:</strong> referrer (de onde você veio), campanhas de marketing que o trouxeram</li>
                    <li><strong>Dados de sessão:</strong> data e hora de cada acesso, duração da sessão, ações realizadas</li>
                    <li><strong>Dados de performance:</strong> tempo de carregamento de páginas, erros encontrados</li>
                  </ul>
                  <p className="text-muted-foreground text-sm mt-2 italic">
                    Esses dados são coletados através de cookies e tecnologias similares para melhorar a experiência, 
                    analisar o uso da plataforma e identificar problemas técnicos.
                  </p>
                </div>
              </div>
            </section>

            {/* Seção 2 - Bases Legais para Tratamento (LGPD) */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">2. Bases Legais para Tratamento (LGPD)</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-muted-foreground">
                  O tratamento de seus dados pessoais é realizado com base nas seguintes hipóteses legais 
                  previstas na LGPD (Art. 7º):
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-border p-3 text-left font-semibold">Base Legal</th>
                        <th className="border border-border p-3 text-left font-semibold">Aplicação</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr>
                        <td className="border border-border p-3"><strong>Execução de Contrato</strong></td>
                        <td className="border border-border p-3">Prestação dos serviços contratados (assinatura, funcionalidades)</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3"><strong>Consentimento</strong></td>
                        <td className="border border-border p-3">Compartilhamento para benchmarking, envio de marketing</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3"><strong>Legítimo Interesse</strong></td>
                        <td className="border border-border p-3">Melhoria da plataforma, análises internas, segurança</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3"><strong>Cumprimento de Obrigação Legal</strong></td>
                        <td className="border border-border p-3">Retenção de dados fiscais, atendimento a autoridades</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Seção 3 - Finalidade do Tratamento */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">3. Finalidade do Tratamento</h2>
              </div>
              <div className="ml-12 space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  Utilizamos seus dados pessoais para as seguintes finalidades específicas:
                </p>

                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-3">3.1 Fornecer o Serviço SaaS</h3>
                  <ul className="space-y-2 list-disc list-inside text-muted-foreground ml-4">
                    <li>Processar e gerenciar sua assinatura e acesso à plataforma</li>
                    <li>Fornecer funcionalidades de gestão turística (dashboard, análises, relatórios)</li>
                    <li>Armazenar e processar dados inseridos na plataforma (receitas, ocupação, inventário, etc.)</li>
                    <li>Gerar relatórios e análises personalizados baseados nos seus dados</li>
                    <li>Gerenciar inventário turístico e dados de CATs (Centros de Atendimento ao Turista)</li>
                    <li>Fornecer funcionalidades de Revenue Optimizer e Market Intelligence</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-3">3.2 Funcionalidades de IA (Guilherme IA)</h3>
                  <ul className="space-y-2 list-disc list-inside text-muted-foreground ml-4">
                    <li>Processar suas perguntas e gerar análises e insights estratégicos</li>
                    <li>Fornecer recomendações de precificação e otimização de receita</li>
                    <li>Melhorar a qualidade das respostas através de aprendizado das conversas</li>
                    <li>Personalizar análises baseadas nos seus dados e histórico de uso</li>
                    <li>Gerar previsões e estimativas baseadas em dados de mercado</li>
                  </ul>
                  <div className="bg-viajar-cyan/5 border-l-4 border-viajar-cyan p-4 rounded-r-lg mt-3">
                    <p className="text-muted-foreground text-sm">
                      <strong>Informação:</strong> O Guilherme IA utiliza modelos de Inteligência Artificial para gerar análises 
                      e insights. As recomendações são baseadas em padrões identificados nos dados históricos e de mercado, e devem 
                      ser consideradas como ferramentas de apoio à decisão. Para decisões estratégicas importantes, recomendamos 
                      considerar múltiplas fontes de informação e consultar especialistas quando necessário.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-3">3.3 Benchmarking e Inteligência de Mercado</h3>
                  <ul className="space-y-2 list-disc list-inside text-muted-foreground ml-4">
                    <li>Agregar dados de múltiplos usuários para criar análises comparativas (benchmarking)</li>
                    <li>Gerar insights de mercado baseados em dados agregados e anonimizados</li>
                    <li>Fornecer comparações de performance com o mercado</li>
                    <li>Desenvolver inteligência de mercado para o setor turístico</li>
                  </ul>
                  <p className="text-muted-foreground text-sm mt-2 italic">
                    O benchmarking é realizado apenas com dados agregados e anonimizados, mediante seu consentimento 
                    expresso através do Termo de Consentimento para Benchmarking.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-3">3.4 Processamento de Pagamentos</h3>
                  <ul className="space-y-2 list-disc list-inside text-muted-foreground ml-4">
                    <li>Processar pagamentos de assinaturas através do Stripe</li>
                    <li>Gerenciar renovações automáticas de assinaturas</li>
                    <li>Emitir recibos e faturas</li>
                    <li>Processar reembolsos quando aplicável</li>
                    <li>Cumprir obrigações fiscais e contábeis relacionadas a pagamentos</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-3">3.5 Melhorias do Serviço</h3>
                  <ul className="space-y-2 list-disc list-inside text-muted-foreground ml-4">
                    <li>Realizar análises estatísticas sobre uso da plataforma</li>
                    <li>Identificar padrões de uso para desenvolver novas funcionalidades</li>
                    <li>Corrigir bugs e otimizar performance</li>
                    <li>Medir eficácia de funcionalidades e melhorias</li>
                    <li>Desenvolver novas funcionalidades baseadas no feedback dos usuários</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-3">3.6 Comunicações e Suporte</h3>
                  <ul className="space-y-2 list-disc list-inside text-muted-foreground ml-4">
                    <li>Enviar comunicações sobre atualizações, novidades e melhorias (com seu consentimento)</li>
                    <li>Fornecer suporte técnico e responder a solicitações</li>
                    <li>Notificar sobre mudanças importantes nos termos ou políticas</li>
                    <li>Enviar alertas sobre segurança e manutenções programadas</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-3">3.7 Segurança e Conformidade Legal</h3>
                  <ul className="space-y-2 list-disc list-inside text-muted-foreground ml-4">
                    <li>Prevenir fraudes e garantir a segurança da plataforma</li>
                    <li>Detectar e prevenir atividades suspeitas ou não autorizadas</li>
                    <li>Cumprir obrigações legais e regulatórias (LGPD, legislação tributária, etc.)</li>
                    <li>Atender solicitações de autoridades competentes quando exigido por lei</li>
                    <li>Manter registros de segurança e auditoria</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Seção 4 - Compartilhamento de Dados */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">4. Compartilhamento de Dados</h2>
              </div>
              <div className="ml-12 space-y-4">
                <h3 className="font-semibold text-foreground">4.1 Prestadores de Serviço</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-border p-3 text-left font-semibold">Parceiro</th>
                        <th className="border border-border p-3 text-left font-semibold">Finalidade</th>
                        <th className="border border-border p-3 text-left font-semibold">Localização</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr>
                        <td className="border border-border p-3"><strong>Supabase</strong></td>
                        <td className="border border-border p-3">Hospedagem, banco de dados, autenticação</td>
                        <td className="border border-border p-3">Brasil (São Paulo)</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3"><strong>Stripe</strong></td>
                        <td className="border border-border p-3">Processamento de pagamentos</td>
                        <td className="border border-border p-3">EUA (com cláusulas contratuais padrão)</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3"><strong>Vercel</strong></td>
                        <td className="border border-border p-3">Hospedagem da aplicação web</td>
                        <td className="border border-border p-3">Global (CDN)</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3"><strong>Google (Gemini)</strong></td>
                        <td className="border border-border p-3">Inteligência Artificial (Guilherme IA)</td>
                        <td className="border border-border p-3">EUA</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="font-semibold text-foreground mt-6">4.2 Benchmarking (Mediante Consentimento)</h3>
                <p className="text-muted-foreground">
                  Dados <strong>agregados e anonimizados</strong> podem ser compartilhados para benchmarking, 
                  conforme o Termo de Consentimento aceito durante o onboarding. Nenhum dado individual ou 
                  identificável é compartilhado.
                </p>

                <h3 className="font-semibold text-foreground mt-6">4.3 Autoridades</h3>
                <p className="text-muted-foreground">
                  Podemos compartilhar dados com autoridades competentes quando exigido por lei, ordem judicial 
                  ou para proteção de direitos.
                </p>

                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mt-4">
                  <p className="text-green-900 font-medium">
                    ✓ Não vendemos, alugamos ou comercializamos seus dados pessoais para terceiros.
                  </p>
                </div>
              </div>
            </section>

            {/* Seção 5 - Armazenamento e Transferência Internacional */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">5. Armazenamento e Transferência Internacional</h2>
              </div>
              <div className="ml-12 space-y-4">
                <h3 className="font-semibold text-foreground">5.1 Onde seus dados são armazenados</h3>
                <p className="text-muted-foreground">
                  Seus dados são armazenados primariamente em servidores da <strong>Supabase</strong> localizados 
                  no <strong>Brasil (região São Paulo)</strong>, garantindo conformidade com a LGPD.
                </p>

                <h3 className="font-semibold text-foreground mt-6">5.2 Transferência Internacional</h3>
                <p className="text-muted-foreground">
                  Alguns de nossos parceiros podem processar dados fora do Brasil (Stripe, Google). Nestes casos:
                </p>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Utilizamos cláusulas contratuais padrão aprovadas;</li>
                  <li>Os parceiros possuem certificações de segurança (SOC 2, ISO 27001);</li>
                  <li>Apenas dados necessários são transferidos.</li>
                </ul>
              </div>
            </section>

            {/* Seção 6 - Segurança dos Dados */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">6. Segurança dos Dados</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-muted-foreground">
                  Implementamos medidas técnicas e organizacionais para proteger seus dados:
                </p>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Criptografia de dados em trânsito (HTTPS/TLS) e em repouso;</li>
                  <li>Autenticação segura com 2FA opcional;</li>
                  <li>Controle de acesso baseado em permissões (RBAC);</li>
                  <li>Monitoramento contínuo de segurança;</li>
                  <li>Backups regulares e criptografados;</li>
                  <li>Políticas de senha forte;</li>
                  <li>Logs de auditoria de acessos.</li>
                </ul>

                <h3 className="font-semibold text-foreground mt-6">6.1 Incidentes de Segurança</h3>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                  <p className="text-amber-900">
                    Em caso de incidente de segurança que possa afetar seus dados, você será notificado por 
                    e-mail em até <strong>72 horas</strong> após a confirmação do incidente, conforme exigido 
                    pela LGPD. A Autoridade Nacional de Proteção de Dados (ANPD) também será comunicada.
                  </p>
                </div>
              </div>
            </section>

            {/* Seção 7 - Direitos do Titular (LGPD) */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">7. Seus Direitos (LGPD - Art. 18)</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-muted-foreground">
                  Você possui os seguintes direitos em relação aos seus dados pessoais:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-viajar-cyan/5 p-4 rounded-lg border border-viajar-cyan/20">
                    <strong className="text-viajar-cyan">Confirmação e Acesso</strong>
                    <p className="text-sm text-muted-foreground mt-1">Confirmar e acessar seus dados tratados.</p>
                  </div>
                  <div className="bg-viajar-blue/5 p-4 rounded-lg border border-viajar-blue/20">
                    <strong className="text-viajar-blue">Correção</strong>
                    <p className="text-sm text-muted-foreground mt-1">Solicitar correção de dados incompletos ou incorretos.</p>
                  </div>
                  <div className="bg-viajar-cyan/5 p-4 rounded-lg border border-viajar-cyan/20">
                    <strong className="text-viajar-cyan">Anonimização ou Bloqueio</strong>
                    <p className="text-sm text-muted-foreground mt-1">Solicitar anonimização de dados desnecessários.</p>
                  </div>
                  <div className="bg-viajar-blue/5 p-4 rounded-lg border border-viajar-blue/20">
                    <strong className="text-viajar-blue">Eliminação</strong>
                    <p className="text-sm text-muted-foreground mt-1">Solicitar exclusão dos dados (com exceções legais).</p>
                  </div>
                  <div className="bg-viajar-cyan/5 p-4 rounded-lg border border-viajar-cyan/20">
                    <strong className="text-viajar-cyan">Portabilidade</strong>
                    <p className="text-sm text-muted-foreground mt-1">Receber seus dados em formato portátil.</p>
                  </div>
                  <div className="bg-viajar-blue/5 p-4 rounded-lg border border-viajar-blue/20">
                    <strong className="text-viajar-blue">Revogação de Consentimento</strong>
                    <p className="text-sm text-muted-foreground mt-1">Revogar consentimentos a qualquer momento.</p>
                  </div>
                </div>
                <p className="text-muted-foreground mt-4">
                  Para exercer seus direitos, entre em contato pelo e-mail: 
                  <strong className="text-foreground"> privacidade@viajartur.com.br</strong>
                </p>
              </div>
            </section>

            {/* Seção 8 - Exclusão de Conta e Dados */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <UserX className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">8. Exclusão de Conta e Dados</h2>
              </div>
              <div className="ml-12 space-y-4">
                <h3 className="font-semibold text-foreground">8.1 Como solicitar exclusão</h3>
                <p className="text-muted-foreground">
                  Você pode solicitar a exclusão da sua conta e dados de duas formas:
                </p>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Através das <strong>Configurações da Conta</strong> na plataforma;</li>
                  <li>Enviando e-mail para <strong>cancelamento@viajartur.com.br</strong>.</li>
                </ul>

                <h3 className="font-semibold text-foreground mt-6">8.2 Prazo de processamento</h3>
                <div className="bg-viajar-cyan/5 p-5 rounded-lg border border-viajar-cyan/20">
                  <div className="flex items-start gap-3">
                    <Clock className="w-6 h-6 text-viajar-cyan flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-foreground font-medium mb-2">Prazo: até 30 dias</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Confirmação de recebimento em até 48 horas;</li>
                        <li>• Processamento completo em até 30 dias;</li>
                        <li>• Confirmação por e-mail após conclusão.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h3 className="font-semibold text-foreground mt-6">8.3 O que é excluído</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Dados de perfil (nome, e-mail, telefone)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Dados de uso da plataforma</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Configurações e preferências</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Histórico de interações com IA</span>
                  </li>
                </ul>

                <h3 className="font-semibold text-foreground mt-6">8.4 O que é retido (obrigação legal)</h3>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                  <p className="text-amber-900 mb-3">
                    <strong>Por obrigação legal, alguns dados são retidos mesmo após cancelamento:</strong>
                  </p>
                  <ul className="text-amber-800 text-sm space-y-1">
                    <li>• <strong>Dados fiscais/contábeis:</strong> 5 anos (legislação tributária);</li>
                    <li>• <strong>Notas fiscais e recibos:</strong> 5 anos;</li>
                    <li>• <strong>Logs de segurança:</strong> 6 meses;</li>
                    <li>• <strong>Dados de benchmarking já agregados:</strong> permanentes (anonimizados).</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Seção 9 - Retenção de Dados */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">9. Retenção de Dados</h2>
              </div>
              <div className="ml-12 space-y-6">
                <p className="text-muted-foreground">
                  Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta política. 
                  Critérios específicos de retenção:
                </p>

                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-3">9.1 Dados da Conta</h3>
                  <ul className="space-y-2 list-disc list-inside text-muted-foreground ml-4">
                    <li><strong>Dados de cadastro e perfil:</strong> mantidos enquanto sua conta estiver ativa e por 5 anos após o encerramento (obrigação legal)</li>
                    <li><strong>Credenciais de acesso:</strong> mantidas enquanto sua conta estiver ativa</li>
                    <li><strong>Configurações e preferências:</strong> mantidas enquanto sua conta estiver ativa</li>
                    <li><strong>Histórico de assinaturas:</strong> mantido por 5 anos após o encerramento (obrigação fiscal)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-3">9.2 Dados de Análise e Uso da Plataforma</h3>
                  <ul className="space-y-2 list-disc list-inside text-muted-foreground ml-4">
                    <li><strong>Dados inseridos (receitas, ocupação, inventário):</strong> mantidos enquanto sua conta estiver ativa e por 2 anos após o encerramento</li>
                    <li><strong>Relatórios gerados:</strong> mantidos enquanto sua conta estiver ativa e por 1 ano após o encerramento</li>
                    <li><strong>Dados de navegação e uso:</strong> mantidos por 12 meses para análises e melhorias</li>
                    <li><strong>Logs de acesso:</strong> mantidos por 6 meses para segurança e auditoria</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-3">9.3 Conversas com IA</h3>
                  <ul className="space-y-2 list-disc list-inside text-muted-foreground ml-4">
                    <li><strong>Histórico de conversas com Guilherme IA:</strong> mantido por 12 meses para melhorar a qualidade das respostas</li>
                    <li><strong>Análises e insights gerados:</strong> mantidos enquanto sua conta estiver ativa</li>
                    <li>Você pode solicitar a exclusão do histórico de conversas a qualquer momento</li>
                  </ul>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm border border-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-border p-3 text-left font-semibold">Tipo de Dado</th>
                        <th className="border border-border p-3 text-left font-semibold">Período de Retenção</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr>
                        <td className="border border-border p-3">Dados de conta (enquanto ativa)</td>
                        <td className="border border-border p-3">Durante a vigência do contrato</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">Dados de navegação</td>
                        <td className="border border-border p-3">12 meses</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">Dados fiscais/contábeis</td>
                        <td className="border border-border p-3">5 anos após o encerramento</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">Logs de segurança</td>
                        <td className="border border-border p-3">6 meses</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">Termos assinados (PDFs)</td>
                        <td className="border border-border p-3">5 anos</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">Dados de benchmarking (anonimizados)</td>
                        <td className="border border-border p-3">Indeterminado (dados agregados e anonimizados)</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">Histórico de conversas com IA</td>
                        <td className="border border-border p-3">12 meses (ou até solicitação de exclusão)</td>
                      </tr>
                    </tbody>
                  </table>
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

            {/* Seção 10 - Atualizações */}
            <section className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-blue to-viajar-cyan p-2 rounded-lg flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">10. Atualizações desta Política</h2>
              </div>
              <div className="ml-12 space-y-3">
                <p className="text-muted-foreground">
                  Podemos atualizar esta Política de Privacidade periodicamente. Quando houver alterações:
                </p>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Você será notificado por e-mail;</li>
                  <li>A data de "Última atualização" será alterada;</li>
                  <li>Um aviso será exibido na plataforma.</li>
                </ul>
              </div>
            </section>

            {/* Seção 11 - Contato e DPO */}
            <section className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-r from-viajar-cyan to-viajar-blue p-2 rounded-lg flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">11. Contato e Encarregado de Dados (DPO)</h2>
              </div>
              <div className="ml-12 space-y-4">
                <p className="text-muted-foreground">
                  Para exercer seus direitos, esclarecer dúvidas ou apresentar reclamações:
                </p>
                <div className="bg-gradient-to-r from-viajar-cyan/10 to-viajar-blue/10 p-6 rounded-lg border border-viajar-cyan/20">
                  <p className="text-foreground font-semibold mb-3">ViajARTur</p>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>E-mail de Privacidade:</strong> privacidade@viajartur.com.br</p>
                    <p><strong>E-mail Geral:</strong> contato@viajartur.com.br</p>
                    <p><strong>Telefone:</strong> (67) 3000-0000</p>
                    <p className="mt-4 pt-4 border-t border-border">
                      <strong>Encarregado de Dados (DPO):</strong><br />
                      Para questões específicas sobre proteção de dados, entre em contato pelo e-mail 
                      <strong> dpo@viajartur.com.br</strong>
                    </p>
                  </div>
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
              </>
            )}
          </div>
        </div>
      </section>

      <ViaJARFooter />
    </div>
  );
};

export default Privacidade;
