// @ts-nocheck
/**
 * Unified Onboarding Wizard
 * Integra cadastro (AdaptiveQuestions) com diagnóstico (DiagnosticQuestionnaire)
 * Usa respostas do cadastro para pré-preencher diagnóstico
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  User, 
  Building2, 
  Brain, 
  Target,
  Sparkles,
  MapPin
} from 'lucide-react';
import { AdaptiveQuestions, QuestionAnswers } from '@/components/registration/AdaptiveQuestions';
import { DiagnosticQuestionnaire } from '@/components/diagnostic/DiagnosticQuestionnaire';
import { QuestionnaireAnswers } from '@/types/diagnostic';
import { AnalysisResult } from '@/services/diagnostic/analysisService';

interface UnifiedOnboardingWizardProps {
  onComplete: (data: {
    registrationAnswers: QuestionAnswers;
    diagnosticAnswers: QuestionnaireAnswers;
    analysisResult?: AnalysisResult;
  }) => void;
  onSkip?: () => void;
  initialRegistrationData?: Partial<QuestionAnswers>;
}

type WizardStep = 'registration' | 'diagnostic' | 'results';

const UnifiedOnboardingWizard: React.FC<UnifiedOnboardingWizardProps> = ({
  onComplete,
  onSkip,
  initialRegistrationData
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('registration');
  const [registrationAnswers, setRegistrationAnswers] = useState<QuestionAnswers | null>(null);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<QuestionnaireAnswers | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const steps = [
    {
      id: 'registration',
      title: 'Cadastro Inicial',
      description: 'Conte-nos sobre você',
      icon: <User className="h-5 w-5" />,
    },
    {
      id: 'diagnostic',
      title: 'Diagnóstico do Negócio',
      description: 'Avalie seu negócio',
      icon: <Brain className="h-5 w-5" />,
    },
    {
      id: 'results',
      title: 'Resultados',
      description: 'Suas recomendações',
      icon: <Target className="h-5 w-5" />,
    },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleRegistrationComplete = (answers: QuestionAnswers) => {
    setRegistrationAnswers(answers);
    setCurrentStep('diagnostic');
  };

  const handleDiagnosticComplete = (answers: QuestionnaireAnswers) => {
    setDiagnosticAnswers(answers);
    // Análise será feita automaticamente pelo DiagnosticQuestionnaire
    // Aqui apenas avançamos para resultados
    setCurrentStep('results');
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
  };

  const handleFinish = () => {
    if (registrationAnswers && diagnosticAnswers) {
      onComplete({
        registrationAnswers,
        diagnosticAnswers,
        analysisResult: analysisResult || undefined,
      });
    }
  };

  const handleBack = () => {
    if (currentStep === 'diagnostic') {
      setCurrentStep('registration');
    } else if (currentStep === 'results') {
      setCurrentStep('diagnostic');
    }
  };

  // Preparar dados iniciais do diagnóstico baseado no cadastro
  const getDiagnosticInitialData = (): Partial<QuestionnaireAnswers> => {
    if (!registrationAnswers) return {};

    return {
      // Mapear dados do cadastro para o diagnóstico
      business_city: registrationAnswers.origin_state === 'MS' 
        ? 'Campo Grande' // Default, pode ser melhorado
        : undefined,
      business_state: registrationAnswers.origin_state || 'MS',
      // Outros campos podem ser mapeados conforme necessário
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Bem-vindo ao ViaJAR</h1>
          </div>
          <p className="text-gray-600">
            Configure seu perfil e descubra como otimizar seu negócio turístico
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Etapa {currentStepIndex + 1} de {steps.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStepIndex > index;
            
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center flex-1 ${
                  index < steps.length - 1 ? 'relative' : ''
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-6 left-1/2 w-full h-0.5 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    style={{ zIndex: -1 }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps[currentStepIndex].icon}
              {steps[currentStepIndex].title}
            </CardTitle>
            <CardDescription>{steps[currentStepIndex].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 'registration' && (
              <div>
                <AdaptiveQuestions
                  onComplete={handleRegistrationComplete}
                  onBack={() => {
                    if (onSkip) onSkip();
                  }}
                  initialAnswers={initialRegistrationData}
                />
              </div>
            )}

            {currentStep === 'diagnostic' && registrationAnswers && (
              <div>
                {/* Passar dados do cadastro para pré-preencher */}
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-900 mb-1">
                        Dados do seu cadastro foram usados para pré-preencher o diagnóstico
                      </div>
                      <div className="text-sm text-blue-700">
                        {registrationAnswers.origin_state && (
                          <div>Estado: {registrationAnswers.origin_state}</div>
                        )}
                        {registrationAnswers.travel_purpose && (
                          <div>Propósito: {registrationAnswers.travel_purpose}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <DiagnosticQuestionnaire
                  onComplete={handleDiagnosticComplete}
                  onProgress={(progress) => {
                    // Progress callback se necessário
                  }}
                  initialData={getDiagnosticInitialData()}
                  registrationData={{
                    origin_state: registrationAnswers.origin_state,
                    travel_purpose: registrationAnswers.travel_purpose,
                    age_range: registrationAnswers.age_range,
                    preferences: registrationAnswers.preferences,
                  }}
                />
              </div>
            )}

            {currentStep === 'results' && diagnosticAnswers && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Onboarding Completo!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Seu perfil foi configurado com sucesso. Agora você pode acessar todas as funcionalidades do ViaJAR.
                  </p>
                  
                  {analysisResult && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-lg mb-3">Resumo do Diagnóstico</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            {analysisResult.overallScore?.toFixed(0) || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600">Score Geral</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">
                            {analysisResult.recommendations?.length || 0}
                          </div>
                          <div className="text-sm text-gray-600">Recomendações</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600">
                            {analysisResult.estimatedROI ? `${analysisResult.estimatedROI}%` : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600">ROI Estimado</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex gap-4 justify-center">
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      size="lg"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>
                    <Button
                      onClick={handleFinish}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Acessar Dashboard
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep !== 'results' && (
          <div className="mt-6 flex justify-between">
            <div>
              {currentStep === 'diagnostic' && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              )}
              {currentStep === 'registration' && onSkip && (
                <Button
                  onClick={onSkip}
                  variant="ghost"
                >
                  Pular
                </Button>
              )}
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Badge variant="outline">
                {currentStepIndex + 1} / {steps.length}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedOnboardingWizard;

