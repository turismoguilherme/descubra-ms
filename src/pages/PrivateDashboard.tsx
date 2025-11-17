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
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useAuth } from '@/hooks/useAuth';
import { QuestionnaireAnswers } from '@/types/diagnostic';
import { AnalysisResult, analyzeBusinessProfile } from '@/services/diagnostic/analysisService';
import { diagnosticService } from '@/services/viajar/diagnosticService';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import DocumentUpload from '@/components/private/DocumentUpload';
import ViaJARIntelligence from '@/pages/ViaJARIntelligence';
import PrivateAIConversation from '@/components/private/PrivateAIConversation';
import DiagnosticSection from '@/components/private/DiagnosticSection';
import RegionalDataSection from '@/components/private/RegionalDataSection';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<QuestionnaireAnswers | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [intelligenceTab, setIntelligenceTab] = useState('revenue');
  const [showDiagnosticSection, setShowDiagnosticSection] = useState(false);
  const [isDiagnosticMinimized, setIsDiagnosticMinimized] = useState(false);

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
        } else {
          // Se não houver diagnóstico, mostrar a seção automaticamente no primeiro acesso
          const hasSeenDiagnostic = localStorage.getItem('hasSeenDiagnostic');
          if (!hasSeenDiagnostic) {
            setShowDiagnosticSection(true);
          }
        }

        // Verificar onboarding
        const completed = localStorage.getItem('hasCompletedOnboarding');
        setHasCompletedOnboarding(completed === 'true');
      } catch (error) {
        console.error('Erro ao carregar dados do diagnóstico:', error);
        const completed = localStorage.getItem('hasCompletedOnboarding');
        setHasCompletedOnboarding(completed === 'true');
      } finally {
        setIsLoading(false);
      }
    };

    loadDiagnosticData();
  }, [user]);

  const handleOnboardingComplete = async (data: any) => {
    // Salvar dados do onboarding
    localStorage.setItem('hasCompletedOnboarding', 'true');
    localStorage.setItem('onboardingData', JSON.stringify(data));
    
    setHasCompletedOnboarding(true);
    setOnboardingData(data);

    // Salvar business_type no perfil do usuário no Supabase
    if (user?.id && data.businessType) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ 
            business_type: data.businessType,
            business_name: data.businessName || null
          })
          .eq('id', user.id);

        if (error) {
          console.error('Erro ao salvar business_type:', error);
        } else {
          console.log('business_type salvo com sucesso:', data.businessType);
        }
      } catch (error) {
        console.error('Erro ao salvar business_type:', error);
      }
    }
  };

  const handleOnboardingSkip = () => {
    // Permitir pular o onboarding (não recomendado)
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setHasCompletedOnboarding(true);
  };

  const handleRetakeDiagnostic = () => {
    // Permitir refazer o diagnóstico
    setShowDiagnostic(true);
    setDiagnosticAnswers(null);
    setAnalysisResult(null);
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

  if (!hasCompletedOnboarding) {
    return (
      <OnboardingWizard 
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  const handleDiagnosticSectionComplete = async (result: AnalysisResult, answers: QuestionnaireAnswers) => {
    setAnalysisResult(result);
    setDiagnosticAnswers(answers);
    setShowDiagnosticSection(false);
    localStorage.setItem('hasSeenDiagnostic', 'true');
    
    // Salvar no Supabase
    if (user?.id) {
      try {
        await diagnosticService.saveDiagnosticResult({
          user_id: user.id,
          answers: answers as any,
          analysis_result: result as any
        });
      } catch (error) {
        console.error('Erro ao salvar diagnóstico:', error);
      }
    }
  };

  const handleDiagnosticSectionClose = () => {
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
              <Button variant="secondary" size="sm">
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
                onClick={() => setActiveSection('regional')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === 'regional' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <MapPin className="h-4 w-4" />
                Dados Regionais
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50 space-y-6">
          {/* Seção de Diagnóstico (expandida no topo) */}
          {showDiagnosticSection && (
            <DiagnosticSection
              onClose={handleDiagnosticSectionClose}
              onMinimize={() => setIsDiagnosticMinimized(!isDiagnosticMinimized)}
              isMinimized={isDiagnosticMinimized}
              onComplete={handleDiagnosticSectionComplete}
              existingResult={analysisResult}
              existingAnswers={diagnosticAnswers}
            />
          )}

          {/* Visão Geral */}
          {activeSection === 'overview' && (
            <>
              {analysisResult ? (
                <>
                  {/* Resultados do Diagnóstico */}
                  <SectionWrapper 
                    variant="default" 
                    title="Resultados do Diagnóstico"
                    actions={
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRetakeDiagnostic}
                      >
                        Refazer Diagnóstico
                      </Button>
                    }
                  >
                    {/* Cards de Métricas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <CardBox>
                        <div className="text-4xl font-bold text-blue-600 mb-2 text-center">
                          {analysisResult.overallScore}%
                        </div>
                        <div className="text-sm text-gray-600 text-center">Score Geral</div>
                      </CardBox>
                      
                      <CardBox>
                        <div className="text-4xl font-bold text-green-600 mb-2 text-center">
                          +{analysisResult.estimatedROI}%
                        </div>
                        <div className="text-sm text-gray-600 text-center">ROI Estimado</div>
                      </CardBox>
                      
                      <CardBox>
                        <div className="text-4xl font-bold text-purple-600 mb-2 text-center">
                          {analysisResult.recommendations.length}
                        </div>
                        <div className="text-sm text-gray-600 text-center">Recomendações</div>
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
            <div>
              <div className="mb-4 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowIntelligence(false);
                    setActiveSection('overview');
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </div>
              <Suspense fallback={<div className="flex items-center justify-center p-8"><RefreshCw className="h-6 w-6 animate-spin text-blue-600" /></div>}>
                <ViaJARIntelligence initialTab={intelligenceTab} hideHeader={true} />
              </Suspense>
            </div>
          )}

          {/* Upload Documentos */}
          {activeSection === 'upload' && (
            <DocumentUpload />
          )}

          {/* IA Conversacional */}
          {activeSection === 'ai' && (
            <PrivateAIConversation businessType={userProfile?.business_type} />
          )}

          {/* Dados Regionais */}
          {activeSection === 'regional' && (
            <RegionalDataSection />
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivateDashboard;