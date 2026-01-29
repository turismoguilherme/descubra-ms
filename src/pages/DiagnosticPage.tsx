/**
 * Diagnostic Page
 * Página dedicada para o diagnóstico inicial via questionário
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Brain, Target, TrendingUp, Star } from 'lucide-react';
import DiagnosticQuestionnaire from '@/components/diagnostic/DiagnosticQuestionnaire';
import AIRecommendationEngine from '@/components/diagnostic/AIRecommendationEngine';
import DiagnosticDashboard from '@/components/diagnostic/DiagnosticDashboard';
import { QuestionnaireAnswers } from '@/types/diagnostic';
import { AnalysisResult } from '@/services/diagnostic/analysisService';

type DiagnosticStep = 'questionnaire' | 'analysis' | 'results';

const DiagnosticPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<DiagnosticStep>('questionnaire');
  const [answers, setAnswers] = useState<QuestionnaireAnswers | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleQuestionnaireComplete = (questionnaireAnswers: QuestionnaireAnswers) => {
    setAnswers(questionnaireAnswers);
    setCurrentStep('analysis');
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setCurrentStep('results');
  };

  const handleAnalysisProgress = (analyzing: boolean) => {
    setIsAnalyzing(analyzing);
  };

  const handleImplement = (recommendation: unknown) => {
    // Redirecionar para o onboarding com a recomendação selecionada
    navigate('/viajar/onboarding', { 
      state: { 
        selectedRecommendation: recommendation,
        diagnosticAnswers: answers 
      } 
    });
  };

  const handleExport = () => {
    if (!analysisResult) return;
    
    const data = {
      answers,
      analysisResult,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostico-viajar-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (!analysisResult) return;
    
    const shareData = {
      title: 'Diagnóstico ViaJAR - Resultados',
      text: `Meu negócio tem potencial de crescimento de ${analysisResult.growthPotential}% com ROI estimado de ${Math.round(analysisResult.estimatedROI)}%`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback para copiar para clipboard
      navigator.clipboard.writeText(shareData.text);
      alert('Resultados copiados para a área de transferência!');
    }
  };

  const handleBackToQuestionnaire = () => {
    setCurrentStep('questionnaire');
    setAnswers(null);
    setAnalysisResult(null);
  };

  const handleBackToAnalysis = () => {
    setCurrentStep('analysis');
    setAnalysisResult(null);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'questionnaire':
        return 'Diagnóstico Inteligente';
      case 'analysis':
        return 'Análise com IA';
      case 'results':
        return 'Resultados Personalizados';
      default:
        return 'Diagnóstico ViaJAR';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'questionnaire':
        return 'Responda algumas perguntas para personalizarmos sua experiência';
      case 'analysis':
        return 'Nossa IA está analisando suas respostas para gerar recomendações';
      case 'results':
        return 'Suas recomendações personalizadas estão prontas';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/30 dark:to-purple-950/20">
      <div className="container max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/viajar')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Brain className="w-8 h-8 text-primary" />
                  {getStepTitle()}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {getStepDescription()}
                </p>
              </div>
            </div>
            
            {currentStep === 'results' && analysisResult && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Score: {analysisResult.overallScore}/100
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  ROI: {Math.round(analysisResult.estimatedROI)}%
                </Badge>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Questionário</span>
              <span>Análise IA</span>
              <span>Resultados</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: currentStep === 'questionnaire' ? '33%' : 
                         currentStep === 'analysis' ? '66%' : '100%' 
                }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {currentStep === 'questionnaire' && (
            <DiagnosticQuestionnaire
              onComplete={handleQuestionnaireComplete}
              onProgress={(progress) => console.log('Progress:', progress)}
            />
          )}

          {currentStep === 'analysis' && answers && (
            <div className="space-y-6">
              <AIRecommendationEngine
                answers={answers}
                onRecommendations={handleAnalysisComplete}
                onAnalysis={handleAnalysisProgress}
              />
              
              {!isAnalyzing && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      Análise concluída! Visualizando resultados...
                    </p>
                    <Button onClick={() => setCurrentStep('results')}>
                      Ver Resultados
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {currentStep === 'results' && analysisResult && (
            <div className="space-y-6">
              <DiagnosticDashboard
                answers={answers!}
                analysisResult={analysisResult}
                onImplement={handleImplement}
                onExport={handleExport}
                onShare={handleShare}
              />
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold">
                      Pronto para implementar suas recomendações?
                    </h3>
                    <p className="text-muted-foreground">
                      Comece agora e veja resultados em poucas semanas
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button 
                        size="lg" 
                        onClick={() => handleImplement(analysisResult.recommendations[0])}
                        className="flex items-center gap-2"
                      >
                        <Target className="w-4 h-4" />
                        Começar Implementação
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={handleBackToQuestionnaire}
                      >
                        Fazer Novo Diagnóstico
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation */}
        {currentStep !== 'questionnaire' && (
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              {currentStep === 'analysis' && (
                <Button variant="outline" onClick={handleBackToQuestionnaire}>
                  Voltar ao Questionário
                </Button>
              )}
              {currentStep === 'results' && (
                <Button variant="outline" onClick={handleBackToAnalysis}>
                  Ver Análise
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticPage;
