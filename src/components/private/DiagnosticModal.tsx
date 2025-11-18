/**
 * Diagnostic Modal Component
 * Versão do diagnóstico adaptada para modal flutuante
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CardBox from '@/components/ui/CardBox';
import DiagnosticQuestionnaire from '@/components/diagnostic/DiagnosticQuestionnaire';
import DiagnosticDashboard from '@/components/diagnostic/DiagnosticDashboard';
import AIRecommendationEngine from '@/components/diagnostic/AIRecommendationEngine';
import DiagnosticReportsTab from '@/components/private/DiagnosticReportsTab';
import { 
  RefreshCw,
  Brain, 
  TrendingUp, 
  Target,
  FileText,
  Download
} from 'lucide-react';
import { QuestionnaireAnswers } from '@/types/diagnostic';
import { AnalysisResult } from '@/services/diagnostic/analysisService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DiagnosticModalProps {
  onClose?: () => void;
  onComplete?: (result: AnalysisResult, answers: QuestionnaireAnswers) => void;
  existingResult?: AnalysisResult | null;
  existingAnswers?: QuestionnaireAnswers | null;
}

type DiagnosticStep = 'questionnaire' | 'analysis' | 'results' | 'reports';

const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  onClose,
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

  return (
    <div className="space-y-6">
      {/* Tabs de Navegação */}
      <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as DiagnosticStep)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="questionnaire" disabled={currentStep === 'analysis'}>
            Questionário
          </TabsTrigger>
          <TabsTrigger value="analysis" disabled={!answers || currentStep === 'questionnaire'}>
            Análise IA
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!analysisResult || currentStep === 'questionnaire' || currentStep === 'analysis'}>
            Resultados
          </TabsTrigger>
          <TabsTrigger value="reports" disabled={!analysisResult}>
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Progress Bar */}
        <div className="mt-4 mb-6">
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
        <TabsContent value="questionnaire" className="mt-0">
          <DiagnosticQuestionnaire
            onComplete={handleQuestionnaireComplete}
            onProgress={(progress) => console.log('Progress:', progress)}
          />
        </TabsContent>

        <TabsContent value="analysis" className="mt-0">
          {answers && (
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
        </TabsContent>

        <TabsContent value="results" className="mt-0">
          {analysisResult && answers && (
            <DiagnosticDashboard
              answers={answers}
              analysisResult={analysisResult}
              onImplement={(rec) => console.log('Implementar:', rec)}
              onExport={() => {
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
        </TabsContent>

        <TabsContent value="reports" className="mt-0">
          {analysisResult && answers && (
            <DiagnosticReportsTab
              answers={answers}
              analysisResult={analysisResult}
              businessType={answers.business_type || null}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Ações */}
      {analysisResult && (
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleRefazer}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refazer Diagnóstico
          </Button>
          {onClose && (
            <Button onClick={onClose}>
              Fechar
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default DiagnosticModal;


