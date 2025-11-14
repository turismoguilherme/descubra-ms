import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  BarChart3, 
  Brain, 
  Upload, 
  Settings, 
  CheckCircle, 
  Target,
  Info,
  Crown,
  Globe,
  RefreshCw
} from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import DiagnosticQuestionnaire from '@/components/private/DiagnosticQuestionnaire';
import DiagnosticDashboard from '@/components/diagnostic/DiagnosticDashboard';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import SectionWrapper from '@/components/ui/SectionWrapper';
import { useAuth } from '@/hooks/useAuth';
import { QuestionnaireAnswers } from '@/components/private/DiagnosticQuestionnaire';
import { AnalysisResult } from '@/services/diagnostic/analysisService';

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
  
  const { userProfile } = auth;
  const [activeSection, setActiveSection] = useState('overview');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<QuestionnaireAnswers | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    // Verificar se o usuário já completou o onboarding
    const checkOnboardingStatus = () => {
      // Simular verificação no banco de dados
      // Em produção, isso viria do perfil do usuário
      const completed = localStorage.getItem('hasCompletedOnboarding');
      const data = localStorage.getItem('onboardingData');
      
      setHasCompletedOnboarding(completed === 'true');
      if (data) {
        setOnboardingData(JSON.parse(data));
      }
      setIsLoading(false);
    };

    checkOnboardingStatus();
  }, []);

  const handleOnboardingComplete = (data: any) => {
    // Salvar dados do onboarding
    localStorage.setItem('hasCompletedOnboarding', 'true');
    localStorage.setItem('onboardingData', JSON.stringify(data));
    
    setHasCompletedOnboarding(true);
    setOnboardingData(data);
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

  const handleDiagnosticComplete = (answers: QuestionnaireAnswers) => {
    setDiagnosticAnswers(answers);
    setShowDiagnostic(false);
    
    // Simular análise (em produção, isso viria da IA)
    const mockAnalysis: AnalysisResult = {
      overallScore: 71,
      growthPotential: 25,
      estimatedROI: 25,
      businessProfile: {
        strengths: ['Localização estratégica', 'Experiência no mercado', 'Qualidade do atendimento'],
        opportunities: ['Expansão digital', 'Novos canais de venda', 'Parcerias estratégicas'],
        riskLevel: 'low' as const,
        marketPosition: 'challenger' as const,
        estimatedRevenue: 50000
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
          benefits: ['Aumento de vendas', 'Redução de trabalho manual', 'Melhor experiência do cliente']
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
          benefits: ['Maior visibilidade', 'Engajamento com clientes', 'Novos leads']
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
          benefits: ['ROI mensurável', 'Alcance segmentado', 'Conversão otimizada']
        }
      ],
      implementationPlan: {
        phase1: [
          { id: '1', name: 'Configurar Google My Business', priority: 1, timeline: '1 semana' },
          { id: '2', name: 'Criar perfil no Instagram', priority: 2, timeline: '1 semana' }
        ],
        phase2: [
          { id: '3', name: 'Implementar sistema de reservas', priority: 1, timeline: '4 semanas' },
          { id: '4', name: 'Configurar analytics', priority: 2, timeline: '2 semanas' }
        ],
        phase3: [
          { id: '5', name: 'Campanhas de marketing', priority: 1, timeline: '6 semanas' },
          { id: '6', name: 'Otimização contínua', priority: 2, timeline: 'Ongoing' }
        ]
      }
    };
    
    setAnalysisResult(mockAnalysis);
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

  if (showDiagnostic) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ViaJARNavbar />
        <div className="container mx-auto px-6 py-8">
          <DiagnosticQuestionnaire onComplete={handleDiagnosticComplete} />
        </div>
      </div>
    );
  }

  if (analysisResult && diagnosticAnswers) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ViaJARNavbar />
        <div className="container mx-auto px-6 py-8">
          <DiagnosticDashboard 
            answers={diagnosticAnswers}
            analysisResult={analysisResult}
            onImplement={(rec) => console.log('Implementar:', rec)}
            onExport={() => console.log('Exportar')}
            onShare={() => console.log('Compartilhar')}
          />
        </div>
      </div>
    );
  }

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
        {/* Sidebar Esquerda - Funcionalidades */}
        <div className="w-64 bg-white shadow-lg h-full flex-shrink-0">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Funcionalidades</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('revenue')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${
                  activeSection === 'revenue' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="h-5 w-5 mr-3" />
                <div>
                  <div className="font-medium">Revenue Optimizer</div>
                  <div className="text-xs text-gray-500">Otimize sua receita</div>
                </div>
              </button>
              
              <button
                onClick={() => setActiveSection('market')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${
                  activeSection === 'market' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                <div>
                  <div className="font-medium">Market Intelligence</div>
                  <div className="text-xs text-gray-500">Análise de mercado</div>
                </div>
              </button>
              
              <button
                onClick={() => setActiveSection('ai')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${
                  activeSection === 'ai' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Brain className="h-5 w-5 mr-3" />
                <div>
                  <div className="font-medium">IA Conversacional</div>
                  <div className="text-xs text-gray-500">IA Guatá</div>
                </div>
              </button>
              
              <button
                onClick={() => setActiveSection('upload')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${
                  activeSection === 'upload' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Upload className="h-5 w-5 mr-3" />
                <div>
                  <div className="font-medium">Upload Documentos</div>
                  <div className="text-xs text-gray-500">Envie documentos</div>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
          {/* Resultados do Diagnóstico */}
          <SectionWrapper variant="default" title="Resultados do Diagnóstico">
            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-white shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">71%</div>
                  <div className="text-sm text-gray-600">Score Geral</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">+25%</div>
                  <div className="text-sm text-gray-600">ROI Estimado</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">5</div>
                  <div className="text-sm text-gray-600">Recomendações</div>
                </CardContent>
              </Card>
            </div>
          </SectionWrapper>

          {/* Principais Recomendações */}
          <SectionWrapper variant="default" title="Principais Recomendações">
            <div className="space-y-3">
              <div className="flex items-center p-4 bg-white rounded-lg shadow">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700">Implementar sistema de reservas online</span>
              </div>
              <div className="flex items-center p-4 bg-white rounded-lg shadow">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700">Otimizar presença nas redes sociais</span>
              </div>
              <div className="flex items-center p-4 bg-white rounded-lg shadow">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700">Investir em marketing digital</span>
              </div>
            </div>
          </SectionWrapper>

          {/* Próximos Passos */}
          <SectionWrapper variant="default" title="Próximos Passos">
            <div className="space-y-3">
              <div className="flex items-center p-4 bg-white rounded-lg shadow">
                <Target className="h-5 w-5 text-blue-500 mr-3" />
                <span className="text-gray-700">Configurar Google My Business</span>
              </div>
              <div className="flex items-center p-4 bg-white rounded-lg shadow">
                <Target className="h-5 w-5 text-blue-500 mr-3" />
                <span className="text-gray-700">Criar perfil no Instagram</span>
              </div>
              <div className="flex items-center p-4 bg-white rounded-lg shadow">
                <Target className="h-5 w-5 text-blue-500 mr-3" />
                <span className="text-gray-700">Implementar sistema de avaliações</span>
              </div>
            </div>
          </SectionWrapper>

          {/* Conteúdo das Funcionalidades */}
          {activeSection === 'revenue' && (
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Revenue Optimizer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Sistema inteligente para otimização de receita baseado em análise de mercado e comportamento do cliente.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Acessar Revenue Optimizer
                </Button>
              </CardContent>
            </Card>
          )}

          {activeSection === 'market' && (
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                  Market Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Análise completa de mercado com dados em tempo real e insights estratégicos.
                </p>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Acessar Market Intelligence
                </Button>
              </CardContent>
            </Card>
          )}

          {activeSection === 'ai' && (
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-600" />
                  IA Conversacional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Assistente virtual inteligente para atendimento ao cliente 24/7.
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Acessar IA Conversacional
                </Button>
              </CardContent>
            </Card>
          )}

          {activeSection === 'upload' && (
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-orange-600" />
                  Upload Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Sistema de upload e processamento inteligente de documentos com IA.
                </p>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  Fazer Upload de Documentos
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivateDashboard;