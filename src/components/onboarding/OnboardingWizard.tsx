/**
 * Wizard de Onboarding para Usuários do Setor Privado
 * Guia o usuário através do processo de configuração inicial
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Sparkles
} from 'lucide-react';
import WelcomeStep from './WelcomeStep';
import ProfileSetupStep from './ProfileSetupStep';
import DiagnosticStep from './DiagnosticStep';
import ResultsStep from './ResultsStep';

interface OnboardingData {
  businessName: string;
  businessType: string;
  location: string;
  experience: string;
  diagnosticAnswers: Record<string, any>;
  diagnosticResult?: any;
}

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    businessName: '',
    businessType: '',
    location: '',
    experience: '',
    diagnosticAnswers: {}
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao viajAR',
      description: 'Vamos configurar seu perfil para personalizar sua experiência',
      icon: <Sparkles className="h-6 w-6" />,
      component: WelcomeStep
    },
    {
      id: 'profile',
      title: 'Configuração do Perfil',
      description: 'Conte-nos sobre seu negócio',
      icon: <Building2 className="h-6 w-6" />,
      component: ProfileSetupStep
    },
    {
      id: 'diagnostic',
      title: 'Diagnóstico Inicial',
      description: 'Avalie o desempenho atual do seu negócio',
      icon: <Brain className="h-6 w-6" />,
      component: DiagnosticStep
    },
    {
      id: 'results',
      title: 'Resultados e Próximos Passos',
      description: 'Suas recomendações personalizadas',
      icon: <Target className="h-6 w-6" />,
      component: ResultsStep
    }
  ];

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = (stepData?: Partial<OnboardingData>) => {
    if (stepData) {
      setOnboardingData(prev => ({ ...prev, ...stepData }));
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Última etapa - completar onboarding
      onComplete(onboardingData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Welcome - sempre pode prosseguir
        return true;
      case 1: // Profile - precisa ter nome e tipo do negócio
        return onboardingData.businessName && onboardingData.businessType;
      case 2: // Diagnostic - precisa ter completado o questionário
        return Object.keys(onboardingData.diagnosticAnswers).length > 0;
      case 3: // Results - sempre pode finalizar
        return true;
      default:
        return false;
    }
  };

  const currentStepData = steps[currentStep];
  const CurrentStepComponent = currentStepData.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header com Progresso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-2 ${
                      index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index < currentStep
                          ? 'bg-green-500 text-white'
                          : index === currentStep
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    {index < totalSteps - 1 && (
                      <div
                        className={`w-8 h-0.5 ${
                          index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              Etapa {currentStep + 1} de {totalSteps}
            </Badge>
          </div>
          
          <Progress value={progress} className="h-2" />
        </div>

        {/* Card Principal */}
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                {currentStepData.icon}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {currentStepData.title}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {currentStepData.description}
            </p>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <CurrentStepComponent
              data={onboardingData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </CardContent>
        </Card>

        {/* Navegação */}
        <div className="flex justify-between items-center mt-6">
          <div>
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {onSkip && currentStep === 0 && (
              <Button variant="ghost" onClick={handleSkip}>
                Pular por enquanto
              </Button>
            )}
            
            <Button
              onClick={() => handleNext()}
              disabled={!canProceed()}
              className="flex items-center space-x-2"
            >
              <span>
                {currentStep === totalSteps - 1 ? 'Finalizar' : 'Continuar'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
