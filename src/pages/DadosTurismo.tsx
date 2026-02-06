import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart3, 
  Shield, 
  FileText, 
  Database, 
  Users, 
  MapPin, 
  TrendingUp,
  CheckCircle,
  Lock,
  Eye,
  ArrowRight,
  Info
} from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';

const enableDebugLogs = import.meta.env.VITE_DEBUG_LOGS === 'true';
const safeLog = (payload: unknown) => {
  if (!enableDebugLogs) return;
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,timestamp:Date.now(),sessionId:'debug-session',runId:payload?.runId||'run1'})}).catch(()=>{});
};

safeLog({location:'DadosTurismo.tsx:22',message:'Módulo DadosTurismo sendo carregado',data:{timestamp:Date.now()},hypothesisId:'C'});

const DadosTurismo = () => {
  const navigate = useNavigate();
  
  safeLog({location:'DadosTurismo.tsx:25',message:'Componente DadosTurismo renderizando',data:{timestamp:Date.now()},hypothesisId:'C'});

  // Handler para scroll suave até a seção "Como Funciona"
  const handleScrollToComoFunciona = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('como-funciona');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handler para navegar para contato e rolar para o topo
  const handleNavigateToContato = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Navegar primeiro
    navigate('/contato');
    // Depois rolar para o topo (pequeno delay para garantir que a página carregou)
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-viajar-slate to-slate-800 py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <BarChart3 className="h-4 w-4 text-viajar-cyan" />
              <span className="text-sm text-white/90 font-medium">Inteligência de Dados</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Dados de Turismo para Gestão Pública e Empresarial
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Relatórios agregados e anonimizados para tomada de decisão baseada em dados reais
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-viajar-cyan hover:bg-viajar-cyan/90 text-viajar-slate font-semibold px-8 h-14 text-lg"
                asChild
              >
                <a href="/contato" onClick={handleNavigateToContato}>
                  Solicitar Relatório
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-8 h-14 text-lg"
                asChild
              >
                <a href="#como-funciona" onClick={handleScrollToComoFunciona}>
                  Como Funciona
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tipos de Dados */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Que Dados Coletamos?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Dados agregados e anonimizados coletados de forma ética e transparente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Perfil Demográfico</CardTitle>
                <CardDescription>
                  Faixa etária, gênero e características dos visitantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Distribuição por idade
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Perfil de gênero
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Dados agregados (nunca individuais)
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Origem dos Visitantes</CardTitle>
                <CardDescription>
                  De onde vêm os turistas que visitam a região
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Estados de origem
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Países de origem
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Fluxo turístico por região
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Propósito de Viagem</CardTitle>
                <CardDescription>
                  Motivações e objetivos dos visitantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Lazer, negócios, eventos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Interesses e preferências
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Tendências de comportamento
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Interações na Plataforma</CardTitle>
                <CardDescription>
                  Como os usuários navegam e interagem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Páginas mais visitadas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Buscas mais frequentes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Padrões de navegação
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Dados Alumia</CardTitle>
                <CardDescription>
                  Integração com plataforma de inteligência turística (quando disponível)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Dados de destinos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Eventos e atividades
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Análises complementares
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Origem dos Dados - Descubra MS e Alumia */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Dados Específicos de Mato Grosso do Sul
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Todos os dados disponíveis são coletados exclusivamente de fontes do estado de Mato Grosso do Sul
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-2 border-viajar-cyan bg-gradient-to-br from-viajar-cyan/5 to-blue-50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-viajar-cyan to-blue-600 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Descubra Mato Grosso do Sul</CardTitle>
                    <CardDescription>Plataforma oficial de turismo do MS</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Dados coletados diretamente da plataforma oficial de turismo do estado de Mato Grosso do Sul.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-viajar-cyan mt-0.5 flex-shrink-0" />
                    <span>Interações de usuários na plataforma</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-viajar-cyan mt-0.5 flex-shrink-0" />
                    <span>Buscas e navegação de destinos do MS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-viajar-cyan mt-0.5 flex-shrink-0" />
                    <span>Dados demográficos e de comportamento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-viajar-cyan mt-0.5 flex-shrink-0" />
                    <span>Estatísticas de acesso e engajamento</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Dados Alumia</CardTitle>
                    <CardDescription>Plataforma de inteligência turística</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Dados complementares da plataforma Alumia, focados em inteligência turística para Mato Grosso do Sul.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span>Análises de destinos do MS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span>Eventos e atividades turísticas do estado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span>Métricas de performance turística</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span>Dados agregados e anonimizados</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Info className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    ⚠️ Fontes de Dados dos Relatórios
                  </h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Os relatórios de dados são gerados <strong>EXCLUSIVAMENTE</strong> a partir de duas fontes:
                  </p>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Alumia:</strong> Plataforma de Inteligência Turística do Governo de Mato Grosso do Sul (quando API disponível)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Descubra Mato Grosso do Sul:</strong> Dados da plataforma Descubra MS (em desenvolvimento)</span>
                    </li>
                  </ul>
                  <p className="text-xs text-blue-700 mt-3 italic">
                    Não utilizamos dados de outras fontes, incluindo pesquisas de CATs ou outras plataformas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Segurança e LGPD */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Segurança e Conformidade LGPD
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Todos os dados são tratados com máxima segurança e respeito à privacidade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Dados Agregados e Anonimizados</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Todos os dados são agregados em grupos estatísticos. Nunca identificamos indivíduos específicos.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Dados são agrupados por faixas (ex: "25-35 anos", "Estado X")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Nenhuma informação pessoal identificável é compartilhada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Mínimo de 10 registros por grupo para garantir anonimato</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Consentimento Explícito</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Apenas utilizamos dados de usuários que deram consentimento explícito para compartilhamento.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Usuários optam por compartilhar dados durante o cadastro</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Podem revogar o consentimento a qualquer momento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Respeitamos todas as diretrizes da LGPD</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Como Funciona?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Processo simples e transparente para obter relatórios de dados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-viajar-cyan text-white flex items-center justify-center text-xl font-bold mb-4">
                  1
                </div>
                <CardTitle>Solicitação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Preencha o formulário de contato indicando que deseja solicitar um relatório de dados.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-viajar-cyan text-white flex items-center justify-center text-xl font-bold mb-4">
                  2
                </div>
                <CardTitle>Aprovação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Nossa equipe analisa a solicitação e valida a disponibilidade de dados para o período solicitado.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-viajar-cyan text-white flex items-center justify-center text-xl font-bold mb-4">
                  3
                </div>
                <CardTitle>Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Após aprovação, você recebe um link seguro para pagamento via Stripe (cartão ou PIX).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-viajar-cyan text-white flex items-center justify-center text-xl font-bold mb-4">
                  4
                </div>
                <CardTitle>Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Relatório gerado e enviado por email em até 24 horas após confirmação do pagamento.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tipos de Relatórios */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Tipos de Relatórios Disponíveis
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-viajar-cyan">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-viajar-cyan" />
                  Relatório Tratado (Explicativo)
                </CardTitle>
                <CardDescription>
                  PDF com análises, gráficos e insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Dados agregados e visualizados
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Gráficos e tabelas explicativas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Análises e conclusões
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Metodologia e conformidade LGPD
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground">
                  Ideal para apresentações e tomada de decisão estratégica
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-emerald-500" />
                  Dados Brutos (Excel)
                </CardTitle>
                <CardDescription>
                  Planilha Excel com dados agregados para análise própria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Múltiplas abas organizadas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Dados prontos para análise
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Compatível com Excel/Google Sheets
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Dados agregados (nunca individuais)
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground">
                  Ideal para análises próprias e cruzamento com outros dados
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Card className="bg-gradient-to-r from-viajar-cyan/10 to-blue-500/10 border-viajar-cyan/20">
              <CardContent className="pt-6">
                <p className="text-lg font-semibold mb-2">
                  💡 Você pode solicitar ambos os formatos!
                </p>
                <p className="text-sm text-muted-foreground">
                  Escolha "Tratado + Bruto" no formulário para receber PDF explicativo e planilha Excel
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quem Pode Solicitar */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Para Quem São Esses Dados?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  Secretarias de Turismo e Prefeituras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Dados agregados para planejamento estratégico, políticas públicas e tomada de decisão.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Planejamento de políticas turísticas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Análise de fluxo turístico</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Relatórios para gestão pública</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  Empresários do Setor Turístico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Insights para estratégias de negócio, marketing e compreensão do público-alvo.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Análise de mercado e concorrência</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Estratégias de marketing direcionado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Compreensão do perfil do cliente</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-viajar-slate">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para tomar decisões baseadas em dados reais?
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
            Solicite seu relatório de dados de turismo e tenha insights valiosos para sua gestão ou negócio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-viajar-cyan hover:bg-viajar-cyan/90 text-viajar-slate font-semibold px-8 h-14 text-lg gap-2"
              asChild
            >
              <a href="/contato" onClick={handleNavigateToContato}>
                Solicitar Relatório Agora
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-8 h-14 text-lg"
              asChild
            >
              <a href="/contato" onClick={handleNavigateToContato}>
                Falar com Especialista
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Aviso Importante */}
      <section className="py-12 bg-yellow-50 dark:bg-yellow-950/20 border-y border-yellow-200 dark:border-yellow-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <Info className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                ⚠️ Dados Reais e Verificados
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Todos os relatórios contêm <strong>APENAS dados reais</strong> coletados da plataforma Descubra MS, 
                sem simulações ou dados mockados. Os dados são validados antes da geração do relatório para garantir 
                veracidade e qualidade. Se não houver dados suficientes para o período solicitado, você será notificado 
                antes do pagamento.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ViaJARFooter />
    </div>
  );
};

export default DadosTurismo;

