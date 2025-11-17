/**
 * Diagnostic Section Component
 * Seção expandida de diagnóstico no dashboard (Opção B)
 * Aparece automaticamente no primeiro acesso e pode ser minimizada
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import DiagnosticQuestionnaire from '@/components/diagnostic/DiagnosticQuestionnaire';
import DiagnosticDashboard from '@/components/diagnostic/DiagnosticDashboard';
import AIRecommendationEngine from '@/components/diagnostic/AIRecommendationEngine';
import DiagnosticReportsTab from '@/components/private/DiagnosticReportsTab';
import { 
  X, 
  Brain, 
  TrendingUp, 
  Target,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  Download
} from 'lucide-react';
import { QuestionnaireAnswers } from '@/types/diagnostic';
import { AnalysisResult } from '@/services/diagnostic/analysisService';

interface DiagnosticSectionProps {
  onClose?: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
  onComplete?: (result: AnalysisResult, answers: QuestionnaireAnswers) => void;
  existingResult?: AnalysisResult | null;
  existingAnswers?: QuestionnaireAnswers | null;
}

type DiagnosticStep = 'questionnaire' | 'analysis' | 'results' | 'reports';

const DiagnosticSection: React.FC<DiagnosticSectionProps> = ({
  onClose,
  onMinimize,
  isMinimized = false,
  onComplete,
  existingResult,
  existingAnswers
}) => {
  const [currentStep, setCurrentStep] = useState<DiagnosticStep>('questionnaire');
  const [answers, setAnswers] = useState<QuestionnaireAnswers | null>(existingAnswers || null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(existingResult || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Se já houver resultado, mostrar diretamente os resultados
  useEffect(() => {
    if (existingResult && existingAnswers) {
      setCurrentStep('results');
      setAnalysisResult(existingResult);
      setAnswers(existingAnswers);
    }
  }, [existingResult, existingAnswers]);

  const handleQuestionnaireComplete = (questionnaireAnswers: QuestionnaireAnswers) => {
    setAnswers(questionnaireAnswers);
    setCurrentStep('analysis');
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setCurrentStep('results');
    if (onComplete && answers) {
      onComplete(result, answers);
    }
  };

  const handleAnalysisProgress = (analyzing: boolean) => {
    setIsAnalyzing(analyzing);
  };

  const handleRefazer = () => {
    setCurrentStep('questionnaire');
    setAnswers(null);
    setAnalysisResult(null);
  };

  // Se estiver minimizado, mostrar apenas o header
  if (isMinimized) {
    return (
      <SectionWrapper
        variant="default"
        title="Diagnóstico Inteligente"
        subtitle={analysisResult ? `Score: ${analysisResult.overallScore}/100` : 'Complete o diagnóstico para receber recomendações'}
        actions={
          <div className="flex items-center gap-2">
            {analysisResult && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefazer}
                className="rounded-full text-xs px-3 py-1"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refazer
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMinimize}
              className="rounded-full text-xs px-3 py-1"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-full text-xs px-3 py-1"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        }
      >
        <div className="text-center py-4">
          <p className="text-sm text-slate-600">
            {analysisResult 
              ? 'Diagnóstico completo. Clique para expandir e ver detalhes.'
              : 'Clique para expandir e iniciar o diagnóstico.'}
          </p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      variant="default"
      title="Diagnóstico Inteligente"
      subtitle="Avalie a maturidade do seu negócio e receba recomendações personalizadas"
      actions={
        <div className="flex items-center gap-2">
          {analysisResult && (
            <Badge variant="secondary" className="rounded-full text-xs px-2 py-0.5">
              Score: {analysisResult.overallScore}/100
            </Badge>
          )}
          {analysisResult && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefazer}
              className="rounded-full text-xs px-3 py-1"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refazer
            </Button>
          )}
          {onMinimize && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMinimize}
              className="rounded-full text-xs px-3 py-1"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full text-xs px-3 py-1"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      }
    >
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-600 mb-2">
          <span className={currentStep === 'questionnaire' ? 'font-semibold text-blue-600' : ''}>
            Questionário
          </span>
          <span className={currentStep === 'analysis' ? 'font-semibold text-blue-600' : ''}>
            Análise IA
          </span>
          <span className={currentStep === 'results' ? 'font-semibold text-blue-600' : ''}>
            Resultados
          </span>
          <span className={currentStep === 'reports' ? 'font-semibold text-blue-600' : ''}>
            Relatórios
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: currentStep === 'questionnaire' ? '25%' : 
                     currentStep === 'analysis' ? '50%' : 
                     currentStep === 'results' ? '75%' : '100%'
            }}
          />
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
            <CardBox>
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-5 w-5 text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Análise Inteligente em Andamento</h3>
                  <p className="text-sm text-slate-600">A IA está analisando suas respostas e gerando recomendações personalizadas...</p>
                </div>
              </div>
              {isAnalyzing && (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              )}
            </CardBox>
            
            <AIRecommendationEngine
              answers={answers}
              onRecommendations={handleAnalysisComplete}
              onAnalysis={handleAnalysisProgress}
            />
          </div>
        )}

        {currentStep === 'results' && analysisResult && answers && (
          <DiagnosticDashboard
            answers={answers}
            analysisResult={analysisResult}
            onImplement={(rec) => console.log('Implementar:', rec)}
            onExport={() => {
              // Navegar para aba de relatórios
              setCurrentStep('reports');
            }}
            onShare={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Meu Diagnóstico ViaJAR',
                  text: `Meu score de maturidade: ${analysisResult.overallScore}/100`,
                  url: window.location.href
                });
              }
            }}
          />
        )}

        {currentStep === 'reports' && (
          <DiagnosticReportsTab
            answers={answers}
            analysisResult={analysisResult}
            businessType={existingAnswers?.business_type || null}
          />
        )}
      </div>
    </SectionWrapper>
  );
};

export default DiagnosticSection;

