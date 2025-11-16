/**
 * ViaJAR Onboarding Page
 * Fluxo completo de cadastro: Cadastro → CADASTUR → Plano → Pagamento → Perfil
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import CadastURVerification from '@/components/onboarding/CadastURVerification';
import PlanSelector from '@/components/onboarding/PlanSelector';
import ProfileCompletion from '@/components/onboarding/ProfileCompletion';
import DiagnosticQuestionnaire from '@/components/diagnostic/DiagnosticQuestionnaire';
import AIRecommendationEngine from '@/components/diagnostic/AIRecommendationEngine';
import type { CadastURVerificationResult } from '@/services/cadasturService';
import type { PlanTier, BillingPeriod } from '@/services/subscriptionService';
import type { QuestionnaireAnswers } from '@/types/diagnostic';
import type { AnalysisResult } from '@/services/diagnostic/analysisService';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  component?: React.ReactNode;
}

export default function ViaJAROnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    category: 'hotel', // Viria do registro
    cnpj: '12.345.678/0001-90', // Viria do registro
    cadastur: null as CadastURVerificationResult | null,
    plan: null as { planId: PlanTier; billingPeriod: BillingPeriod } | null,
    profile: null as any,
    diagnostic: null as QuestionnaireAnswers | null,
    analysis: null as AnalysisResult | null,
  });

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: 'Diagnóstico Inteligente',
      description: 'Personalize sua experiência',
    },
    {
      id: 2,
      title: 'Verificação CADASTUR',
      description: 'Validação do registro turístico',
    },
    {
      id: 3,
      title: 'Plano Recomendado',
      description: 'Baseado na sua análise',
    },
    {
      id: 4,
      title: 'Pagamento',
      description: 'Configure seu método de pagamento',
    },
    {
      id: 5,
      title: 'Complete seu Perfil',
      description: 'Adicione informações do negócio',
    },
    {
      id: 6,
      title: 'Pronto!',
      description: 'Bem-vindo ao ViaJAR',
    },
  ];

  const handleDiagnosticComplete = (answers: QuestionnaireAnswers) => {
    setOnboardingData(prev => ({ ...prev, diagnostic: answers }));
    setCurrentStep(2);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setOnboardingData(prev => ({ ...prev, analysis: result }));
    setCurrentStep(3);
  };

  const handleCadastURVerified = (result: CadastURVerificationResult) => {
    setOnboardingData(prev => ({ ...prev, cadastur: result }));
    setCurrentStep(3);
  };

  const handlePlanSelected = (planId: PlanTier, billingPeriod: BillingPeriod) => {
    setOnboardingData(prev => ({ ...prev, plan: { planId, billingPeriod } }));
    setCurrentStep(4);
  };

  const handlePaymentComplete = () => {
    setCurrentStep(5);
  };

  const handleProfileComplete = (profileData: any) => {
    setOnboardingData(prev => ({ ...prev, profile: profileData }));
    setCurrentStep(6);
  };

  const handleFinish = () => {
    // Salva tudo no backend
    // Redireciona para dashboard
    navigate('/viajar/dashboard');
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/30 dark:to-purple-950/20">
      <div className="container max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Configuração Inicial</h1>
              <p className="text-muted-foreground">
                Estamos quase lá! Vamos configurar sua conta.
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              Passo {currentStep} de {steps.length}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const isLast = index === steps.length - 1;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    {/* Circle */}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                        isCompleted && "bg-green-500 border-green-500",
                        isCurrent && "bg-purple-600 border-purple-600",
                        !isCompleted && !isCurrent && "bg-white border-gray-300"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6 text-white" />
                      ) : (
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            isCurrent ? "text-white" : "text-gray-500"
                          )}
                        >
                          {step.id}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div className="mt-2 text-center max-w-[100px]">
                      <p
                        className={cn(
                          "text-xs font-medium",
                          isCurrent && "text-foreground",
                          !isCurrent && "text-muted-foreground"
                        )}
                      >
                        {step.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground hidden sm:block">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {!isLast && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-2 transition-all",
                        isCompleted ? "bg-green-500" : "bg-gray-300"
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Step 1: CADASTUR */}
          {currentStep === 1 && (
            <CadastURVerification
              category={onboardingData.category}
              cnpj={onboardingData.cnpj}
              onVerified={handleCadastURVerified}
              onSkip={() => setCurrentStep(2)}
            />
          )}

          {/* Step 2: Plan Selection */}
          {currentStep === 2 && (
            <PlanSelector
              onSelectPlan={handlePlanSelected}
              recommendedPlan="professional"
            />
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Configurar Pagamento</h2>
                  <p className="text-muted-foreground">
                    Plano selecionado:{" "}
                    <strong>
                      {onboardingData.plan?.planId === "freemium"
                        ? "Freemium"
                        : onboardingData.plan?.planId === "professional"
                        ? "Professional"
                        : onboardingData.plan?.planId === "enterprise"
                        ? "Enterprise"
                        : "Governo"}
                    </strong>
                  </p>
                  {onboardingData.plan?.planId !== "freemium" && (
                    <Badge variant="secondary">
                      14 dias de teste grátis
                    </Badge>
                  )}
                </div>

                {/* Payment Form (mockado) */}
                <div className="max-w-md mx-auto space-y-4">
                  {onboardingData.plan?.planId === "freemium" ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Plano Freemium não requer pagamento
                      </p>
                      <Button size="lg" onClick={handlePaymentComplete}>
                        Continuar
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                        <p className="text-sm text-blue-900">
                          🎁 <strong>Sem cobrança agora!</strong> Você tem 14
                          dias grátis para testar todas as funcionalidades.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold">
                          Método de Pagamento (opcional agora)
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <Button variant="outline" className="h-20">
                            💳 Cartão de Crédito
                          </Button>
                          <Button variant="outline" className="h-20">
                            📱 PIX
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          Você pode configurar o pagamento depois, dentro da
                          plataforma
                        </p>
                      </div>

                      <Button
                        size="lg"
                        className="w-full"
                        onClick={handlePaymentComplete}
                      >
                        Pular e Configurar Depois
                      </Button>
                    </>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-center pt-4">
                  <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Voltar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Profile Completion */}
          {currentStep === 4 && (
            <ProfileCompletion onComplete={handleProfileComplete} />
          )}

          {/* Step 5: Success */}
          {currentStep === 5 && (
            <Card className="border-green-500">
              <CardContent className="pt-12 pb-12">
                <div className="text-center space-y-6 max-w-2xl mx-auto">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <Check className="h-10 w-10 text-green-600" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold">
                      🎉 Tudo Pronto!
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      Sua conta ViaJAR está configurada e pronta para uso
                    </p>
                  </div>

                  <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="font-semibold mb-3">
                      O que você pode fazer agora:
                    </h3>
                    <ul className="space-y-2 text-left text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          Acessar seu dashboard personalizado
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          Ver análises e insights do seu negócio
                        </span>
                      </li>
                      {onboardingData.plan?.planId === "enterprise" && (
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>
                            Usar ViaJAR Intelligence Suite (IA)
                          </span>
                        </li>
                      )}
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          Aparecer nas buscas da plataforma
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <Button
                      size="lg"
                      className="w-full max-w-sm gap-2"
                      onClick={handleFinish}
                    >
                      Ir para o Dashboard
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Você pode completar seu perfil mais tarde se preferir
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer Help */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Precisa de ajuda?{" "}
            <a href="#" className="text-purple-600 hover:underline">
              Entre em contato com nosso suporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}


