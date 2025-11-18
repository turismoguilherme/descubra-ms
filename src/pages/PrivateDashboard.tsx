import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  BarChart3, 
  Brain, 
  Target,
  DollarSign,
  Users,
  FileText,
  RefreshCw,
  Info,
  Settings,
  Upload,
  CheckCircle,
  MapPin
} from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import DiagnosticDashboard from '@/components/diagnostic/DiagnosticDashboard';
import { useAuth } from '@/hooks/useAuth';
import { QuestionnaireAnswers } from '@/types/diagnostic';
import { AnalysisResult, analyzeBusinessProfile } from '@/services/diagnostic/analysisService';
import { diagnosticService } from '@/services/viajar/diagnosticService';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import DocumentUpload from '@/components/private/DocumentUpload';
import ViaJARIntelligence from '@/pages/ViaJARIntelligence';
import PrivateAIConversation from '@/components/private/PrivateAIConversation';
import DiagnosticModal from '@/components/private/DiagnosticModal';
import ReportsSection from '@/components/private/ReportsSection';
import ProactiveNotifications from '@/components/private/ProactiveNotifications';
import EvolutionHistory from '@/components/private/EvolutionHistory';
import GoalsTracking from '@/components/private/GoalsTracking';
import SettingsModal from '@/components/private/SettingsModal';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { evolutionHistoryService } from '@/services/private/evolutionHistoryService';
import { weeklyInsightsService } from '@/services/private/weeklyInsightsService';

const PrivateDashboard = () => {
  // Verificar se o AuthProvider está disponível
  let auth = null;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('PrivateDashboard: AuthProvider não disponível:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando sistema de autenticação...</p>
        </div>
      </div>
    );
  }
  
  const { user, userProfile } = auth;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<QuestionnaireAnswers | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [intelligenceTab, setIntelligenceTab] = useState('revenue');
  const [intelligenceKey, setIntelligenceKey] = useState(0); // Para forçar atualização
  const [showDiagnosticSection, setShowDiagnosticSection] = useState(false);
  const [isDiagnosticMinimized, setIsDiagnosticMinimized] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  useEffect(() => {
    // Carregar diagnóstico do Supabase
    const loadDiagnosticData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Buscar último diagnóstico do usuário
        const latestDiagnostic = await diagnosticService.getLatestDiagnosticResult(user.id);
        
        if (latestDiagnostic) {
          setDiagnosticAnswers(latestDiagnostic.answers as QuestionnaireAnswers);
          setAnalysisResult(latestDiagnostic.analysis_result as AnalysisResult);
          // Se já tem diagnóstico, não mostrar modal automaticamente
          setShowDiagnosticSection(false);
        } else {
          // Se não houver diagnóstico, mostrar o modal automaticamente
          setShowDiagnosticSection(true);
          setIsDiagnosticMinimized(false);
        }

      } catch (error) {
        console.error('Erro ao carregar dados do diagnóstico:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDiagnosticData();
  }, [user]);


  const handleRetakeDiagnostic = () => {
    setShowDiagnosticSection(true);
    setIsDiagnosticMinimized(false);
    setAnalysisResult(null);
    setDiagnosticAnswers(null);
    localStorage.removeItem('hasSeenDiagnostic');
  };

  const handleDiagnosticComplete = async (answers: QuestionnaireAnswers) => {
    setDiagnosticAnswers(answers);
    setShowDiagnostic(false);
    
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Usar análise real do serviço
      const analysis = await analyzeBusinessProfile(answers);
      setAnalysisResult(analysis);

      // Salvar no Supabase
      try {
        await diagnosticService.saveDiagnosticResult(user.id, answers, analysis);
        toast({
          title: 'Sucesso',
          description: 'Diagnóstico salvo com sucesso'
        });
      } catch (saveError) {
        console.error('Erro ao salvar diagnóstico no Supabase:', saveError);
        // Continuar mesmo se falhar ao salvar
      }
    } catch (error) {
      console.error('Erro ao analisar diagnóstico:', error);
      // Fallback para análise mockada em caso de erro
    const mockAnalysis: AnalysisResult = {
      overallScore: 71,
      growthPotential: 25,
      estimatedROI: 25,
      businessProfile: {
        strengths: ['Localização estratégica', 'Experiência no mercado', 'Qualidade do atendimento'],
          weaknesses: [],
        opportunities: ['Expansão digital', 'Novos canais de venda', 'Parcerias estratégicas'],
          threats: [],
          potentialGrowth: 25,
          estimatedRevenue: 50000,
        riskLevel: 'low' as const,
          marketPosition: 'challenger' as const
      },
      recommendations: [
        {
          id: '1',
          name: 'Implementar sistema de reservas online',
          description: 'Sistema completo de reservas com pagamento online',
          priority: 1,
          category: 'technology',
          confidence: 0.95,
          estimatedROI: 35,
          implementationTime: '2-4 semanas',
          features: ['Reservas online', 'Pagamento digital', 'Gestão de disponibilidade'],
          benefits: ['Aumento de vendas', 'Redução de trabalho manual', 'Melhor experiência do cliente'],
          requirements: ['Integração PMS', 'Dados históricos', 'Conectividade']
        },
        {
          id: '2',
          name: 'Otimizar presença nas redes sociais',
          description: 'Estratégia completa de marketing digital',
          priority: 2,
          category: 'marketing',
          confidence: 0.88,
          estimatedROI: 20,
          implementationTime: '1-2 semanas',
          features: ['Gestão de redes sociais', 'Conteúdo automatizado', 'Análise de engajamento'],
          benefits: ['Maior visibilidade', 'Engajamento com clientes', 'Novos leads'],
          requirements: ['Contas em redes sociais', 'Conteúdo visual', 'Ferramentas de gestão']
        },
        {
          id: '3',
          name: 'Investir em marketing digital',
          description: 'Campanhas direcionadas e análise de performance',
          priority: 3,
          category: 'marketing',
          confidence: 0.82,
          estimatedROI: 30,
          implementationTime: '3-6 semanas',
          features: ['Google Ads', 'Facebook Ads', 'Analytics avançado'],
          benefits: ['ROI mensurável', 'Alcance segmentado', 'Conversão otimizada'],
          requirements: ['Orçamento para campanhas', 'Pixels de rastreamento', 'Landing pages']
        }
      ],
      implementationPlan: {
        phase1: [
          { 
            id: '1', 
            name: 'Configurar Google My Business', 
            description: 'Configuração inicial do Google My Business',
            priority: 1 as const, 
            category: 'marketing' as const,
            confidence: 0.9,
            estimatedROI: 15,
            implementationTime: '1 semana',
            features: [],
            benefits: [],
            requirements: []
          },
          { 
            id: '2', 
            name: 'Criar perfil no Instagram', 
            description: 'Criação e configuração de perfil no Instagram',
            priority: 2 as const, 
            category: 'marketing' as const,
            confidence: 0.85,
            estimatedROI: 10,
            implementationTime: '1 semana',
            features: [],
            benefits: [],
            requirements: []
          }
        ],
        phase2: [
          { 
            id: '3', 
            name: 'Implementar sistema de reservas', 
            description: 'Implementação de sistema completo de reservas',
            priority: 1 as const, 
            category: 'technology' as const,
            confidence: 0.95,
            estimatedROI: 35,
            implementationTime: '4 semanas',
            features: [],
            benefits: [],
            requirements: []
          },
          { 
            id: '4', 
            name: 'Configurar analytics', 
            description: 'Configuração de ferramentas de analytics',
            priority: 2 as const, 
            category: 'analytics' as const,
            confidence: 0.8,
            estimatedROI: 20,
            implementationTime: '2 semanas',
            features: [],
            benefits: [],
            requirements: []
          }
        ],
        phase3: [
          { 
            id: '5', 
            name: 'Campanhas de marketing', 
            description: 'Execução de campanhas de marketing digital',
            priority: 1 as const, 
            category: 'marketing' as const,
            confidence: 0.82,
            estimatedROI: 30,
            implementationTime: '6 semanas',
            features: [],
            benefits: [],
            requirements: []
          },
          { 
            id: '6', 
            name: 'Otimização contínua', 
            description: 'Processo contínuo de otimização',
            priority: 2 as const, 
            category: 'analytics' as const,
            confidence: 0.75,
            estimatedROI: 15,
            implementationTime: 'Ongoing',
            features: [],
            benefits: [],
            requirements: []
          }
        ]
      }
      };
    setAnalysisResult(mockAnalysis);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }


  const handleDiagnosticSectionComplete = async (result: AnalysisResult, answers: QuestionnaireAnswers) => {
    setAnalysisResult(result);
    setDiagnosticAnswers(answers);
    // Manter a seção visível, mas minimizada após completar
    setShowDiagnosticSection(true);
    setIsDiagnosticMinimized(true);
    localStorage.setItem('hasSeenDiagnostic', 'true');
    
    // Salvar no Supabase
    if (user?.id) {
      try {
        await diagnosticService.saveDiagnosticResult({
          user_id: user.id,
          answers: answers as any,
          analysis_result: result as any
        });

        // Atualizar perfil com informações do diagnóstico se necessário
        if (answers.business_type) {
          await supabase
            .from('users')
            .update({
              business_type: answers.business_type,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
        }

        // Salvar ponto de evolução
        await evolutionHistoryService.saveEvolutionPoint(user.id, result);

        // Verificar e enviar insights semanais (se necessário)
        const hasSentThisWeek = await weeklyInsightsService.hasSentThisWeek(user.id);
        if (!hasSentThisWeek && userProfile?.email) {
          const insights = await weeklyInsightsService.generateWeeklyInsights(user.id, result);
          await weeklyInsightsService.sendWeeklyInsightsEmail(user.id, userProfile.email, insights);
        }
      } catch (error) {
        console.error('Erro ao salvar diagnóstico:', error);
      }
    }
  };

  const handleDiagnosticSectionClose = () => {
    // Fechar o modal
    setShowDiagnosticSection(false);
    localStorage.setItem('hasSeenDiagnostic', 'true');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ViaJARNavbar />
      
      {/* Header com gradiente azul-roxo */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                Dashboard <span className="text-blue-200">Inteligente</span>
              </h1>
              <p className="text-blue-100 mt-2">Bem-vindo, Pedro Oliveira</p>
            </div>
            <div className="flex gap-4">
              <Button variant="secondary" size="sm" onClick={handleRetakeDiagnostic}>
                <Info className="h-4 w-4 mr-2" />
                Refazer Diagnóstico
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setIsSettingsDialogOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar Esquerda */}
        <div className="w-64 bg-white shadow-lg h-full flex-shrink-0">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Funcionalidades</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('overview')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === 'overview' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Visão Geral
              </button>
              <button
                onClick={() => {
                  setActiveSection('revenue');
                  setShowIntelligence(true);
                  setIntelligenceTab('revenue');
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === 'revenue' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Revenue Optimizer
              </button>
              <button
                onClick={() => {
                  setActiveSection('market');
                  setShowIntelligence(true);
                  setIntelligenceTab('market');
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === 'market' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Market Intelligence
              </button>
              <button
                onClick={() => {
                  setActiveSection('benchmark');
                  setShowIntelligence(true);
                  setIntelligenceTab('benchmark');
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === 'benchmark' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Target className="h-4 w-4" />
                Competitive Benchmark
              </button>
              <button
                onClick={() => setActiveSection('ai')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === 'ai' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Brain className="h-4 w-4" />
                IA Conversacional
              </button>
              <button
                onClick={() => setActiveSection('upload')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === 'upload' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Upload className="h-4 w-4" />
                Upload Documentos
              </button>
              <button
                onClick={() => setActiveSection('reports')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === 'reports' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="h-4 w-4" />
                Relatórios
              </button>
              <button
                onClick={() => setActiveSection('goals')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === 'goals' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Target className="h-4 w-4" />
                Metas e Acompanhamento
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50 space-y-6">
          {/* Visão Geral */}
          {activeSection === 'overview' && (
            <>
              {analysisResult ? (
                <>
                  {/* Notificações Proativas */}
                  <ProactiveNotifications
                    analysisResult={analysisResult}
                    currentMetrics={{}}
                  />

                  {/* Resumo Executivo - Métricas Principais */}
                  <SectionWrapper 
                    variant="default" 
                    title="Visão Geral do Negócio"
                    subtitle="Resumo executivo das principais métricas e indicadores"
                    actions={
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setActiveSection('revenue');
                            setShowIntelligence(true);
                            setIntelligenceTab('revenue');
                          }}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Revenue
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleRetakeDiagnostic}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Refazer Diagnóstico
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsSettingsDialogOpen(true)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Configurações
                        </Button>
                      </div>
                    }
                  >
                    {/* Indicador de Maturidade do Negócio */}
                    {analysisResult && (
                      <CardBox className="mb-6 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-1">Nível de Maturidade do Negócio</h3>
                            <p className="text-sm text-slate-600">
                              Baseado no diagnóstico e configurações completas
                            </p>
                          </div>
                          <Badge className={`text-sm px-3 py-1 ${
                            analysisResult.overallScore >= 80 
                              ? 'bg-green-100 text-green-700 border-green-300'
                              : analysisResult.overallScore >= 60
                              ? 'bg-blue-100 text-blue-700 border-blue-300'
                              : analysisResult.overallScore >= 40
                              ? 'bg-amber-100 text-amber-700 border-amber-300'
                              : 'bg-red-100 text-red-700 border-red-300'
                          }`}>
                            {analysisResult.overallScore >= 80 
                              ? 'Avançado'
                              : analysisResult.overallScore >= 60
                              ? 'Intermediário'
                              : analysisResult.overallScore >= 40
                              ? 'Iniciante'
                              : 'Básico'}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Progresso Geral</span>
                            <span className="font-medium text-slate-800">{analysisResult.overallScore}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full transition-all ${
                                analysisResult.overallScore >= 80 
                                  ? 'bg-green-600'
                                  : analysisResult.overallScore >= 60
                                  ? 'bg-blue-600'
                                  : analysisResult.overallScore >= 40
                                  ? 'bg-amber-600'
                                  : 'bg-red-600'
                              }`}
                              style={{ width: `${analysisResult.overallScore}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span>Diagnóstico Completo</span>
                            </div>
                            {userProfile?.business_type && (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span>Tipo de Negócio Configurado</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardBox>
                    )}

                    {/* Cards de Métricas Principais */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <CardBox>
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-slate-600">Score Geral</span>
                        </div>
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {analysisResult.overallScore}%
                        </div>
                        <div className="text-xs text-slate-500">
                          {analysisResult.overallScore >= 80 ? 'Excelente' : 
                           analysisResult.overallScore >= 60 ? 'Bom' : 
                           analysisResult.overallScore >= 40 ? 'Regular' : 'Precisa Melhorar'}
                        </div>
                      </CardBox>
                      
                      <CardBox>
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-slate-600">ROI Estimado</span>
                        </div>
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          +{analysisResult.estimatedROI}%
                        </div>
                        <div className="text-xs text-slate-500">Retorno sobre investimento</div>
                      </CardBox>
                      
                      <CardBox>
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-slate-600">Recomendações</span>
                        </div>
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                          {analysisResult.recommendations.length}
                        </div>
                        <div className="text-xs text-slate-500">Ações sugeridas</div>
                      </CardBox>

                      <CardBox>
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium text-slate-600">Crescimento</span>
                        </div>
                        <div className="text-3xl font-bold text-amber-600 mb-1">
                          {analysisResult.growthPotential}%
                        </div>
                        <div className="text-xs text-slate-500">Potencial de crescimento</div>
                      </CardBox>
                    </div>

                    {/* Status do Negócio */}
                    <CardBox className="border-l-4 border-l-blue-500 bg-blue-50">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-blue-900 mb-1">Status do Negócio</p>
                          <p className="text-sm text-blue-700">
                            {analysisResult.overallScore >= 80 
                              ? 'Seu negócio está em excelente condição! Continue implementando as recomendações para manter o crescimento.'
                              : analysisResult.overallScore >= 60
                              ? 'Seu negócio está em boa condição. Implemente as recomendações prioritárias para melhorar ainda mais.'
                              : 'Há oportunidades significativas de melhoria. Foque nas recomendações de alta prioridade para acelerar o crescimento.'}
                          </p>
                        </div>
                      </div>
                    </CardBox>
                  </SectionWrapper>

                  {/* Acesso Rápido aos Módulos */}
                  <SectionWrapper 
                    variant="default" 
                    title="Acesso Rápido"
                    subtitle="Módulos principais da plataforma"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <CardBox 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => {
                          setActiveSection('revenue');
                          setShowIntelligence(true);
                          setIntelligenceTab('revenue');
                        }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800">Revenue Optimizer</h3>
                            <p className="text-xs text-slate-500">Otimize preços</p>
                          </div>
                        </div>
                      </CardBox>

                      <CardBox 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => {
                          setActiveSection('market');
                          setShowIntelligence(true);
                          setIntelligenceTab('market');
                        }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800">Market Intelligence</h3>
                            <p className="text-xs text-slate-500">Análise de mercado</p>
                          </div>
                        </div>
                      </CardBox>

                      <CardBox 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => {
                          setActiveSection('benchmark');
                          setShowIntelligence(true);
                          setIntelligenceTab('benchmark');
                        }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Target className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800">Competitive Benchmark</h3>
                            <p className="text-xs text-slate-500">Compare-se</p>
                          </div>
                        </div>
                      </CardBox>

                      <CardBox 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setActiveSection('reports')}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800">Relatórios</h3>
                            <p className="text-xs text-slate-500">Baixar relatórios</p>
                          </div>
                        </div>
                      </CardBox>
                    </div>
                  </SectionWrapper>

                  {/* Principais Recomendações */}
                  {analysisResult.recommendations.length > 0 && (
                    <SectionWrapper 
                      variant="default" 
                      title="Principais Recomendações"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analysisResult.recommendations.slice(0, 6).map((rec) => (
                          <CardBox key={rec.id}>
                            <div className="flex items-start mb-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <span className="text-slate-700 font-medium block mb-1">{rec.name}</span>
                                <span className="text-slate-500 text-sm">{rec.description}</span>
                              </div>
                            </div>
                          </CardBox>
                        ))}
                      </div>
                    </SectionWrapper>
                  )}

                  {/* Próximos Passos */}
                  {analysisResult.implementationPlan.phase1.length > 0 && (
                    <SectionWrapper 
                      variant="default" 
                      title="Próximos Passos"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analysisResult.implementationPlan.phase1.map((step) => (
                          <CardBox key={step.id}>
                            <div className="flex items-start mb-3">
                              <Target className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <span className="text-slate-700 font-medium block mb-1">{step.name}</span>
                                <span className="text-slate-500 text-sm">{step.description}</span>
                              </div>
                            </div>
                          </CardBox>
                        ))}
                      </div>
                      </SectionWrapper>
                    )}

                    {/* Histórico de Evolução */}
                    <EvolutionHistory />
                  </>
              ) : (
                <SectionWrapper 
                  variant="default" 
                  title="Bem-vindo ao ViaJAR"
                >
                  <CardBox>
                    <p className="text-gray-600 mb-4">
                      Complete o diagnóstico para receber recomendações personalizadas para o seu negócio.
                    </p>
                    <Button 
                      onClick={() => {
                        setShowDiagnosticSection(true);
                        setIsDiagnosticMinimized(false);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Iniciar Diagnóstico
                    </Button>
                  </CardBox>
                </SectionWrapper>
              )}
            </>
          )}

          {/* Revenue Optimizer, Market Intelligence, Competitive Benchmark */}
          {showIntelligence && (activeSection === 'revenue' || activeSection === 'market' || activeSection === 'benchmark') && (
            <div className="relative">
              {/* Botão Atualizar sutil no canto superior direito */}
              <button
                onClick={() => {
                  // Forçar atualização dos dados
                  setIntelligenceKey(prev => prev + 1);
                }}
                className="absolute top-0 right-0 z-10 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Atualizar dados"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <Suspense fallback={<div className="flex items-center justify-center p-8"><RefreshCw className="h-6 w-6 animate-spin text-blue-600" /></div>}>
                <ViaJARIntelligence key={intelligenceKey} initialTab={intelligenceTab} hideHeader={true} />
              </Suspense>
            </div>
          )}

          {/* Upload Documentos */}
          {activeSection === 'upload' && (
            <ErrorBoundary>
              <React.Suspense fallback={
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              }>
                <DocumentUpload />
              </React.Suspense>
            </ErrorBoundary>
          )}

          {/* IA Conversacional */}
          {activeSection === 'ai' && (
            <PrivateAIConversation businessType={userProfile?.business_type} />
          )}

          {/* Relatórios */}
          {activeSection === 'reports' && (
            <ReportsSection
              diagnosticAnswers={diagnosticAnswers}
              analysisResult={analysisResult}
              businessType={userProfile?.business_type}
            />
          )}

          {/* Metas e Acompanhamento */}
          {activeSection === 'goals' && (
            <GoalsTracking />
          )}
        </div>
      </div>

      {/* Modal de Configurações */}
      <SettingsModal isOpen={isSettingsDialogOpen} onClose={() => setIsSettingsDialogOpen(false)} />

      {/* Modal de Diagnóstico (Flutuante) */}
      <Dialog open={showDiagnosticSection} onOpenChange={(open) => {
        if (!open) {
          handleDiagnosticSectionClose();
        } else {
          setShowDiagnosticSection(true);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Diagnóstico Inteligente</DialogTitle>
            <DialogDescription>
              Avalie a maturidade do seu negócio e receba recomendações personalizadas
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <DiagnosticModal
              onClose={handleDiagnosticSectionClose}
              onComplete={handleDiagnosticSectionComplete}
              existingResult={analysisResult}
              existingAnswers={diagnosticAnswers}
            />
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
};

export default PrivateDashboard;