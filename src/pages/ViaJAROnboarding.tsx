/**
 * ViaJAR Onboarding Page
 * Fluxo completo de cadastro: Cadastro → CADASTUR → Plano → Pagamento → Perfil
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import CadastURVerification from '@/components/onboarding/CadastURVerification';
import PlanSelector from '@/components/onboarding/PlanSelector';
import ProfileCompletion from '@/components/onboarding/ProfileCompletion';
import StripeCheckout from '@/components/onboarding/StripeCheckout';
import ConsentTerm from '@/components/onboarding/ConsentTerm';
import DiagnosticQuestionnaire from '@/components/diagnostic/DiagnosticQuestionnaire';
import type { CadastURVerificationResult } from '@/services/cadasturService';
import type { PlanTier, BillingPeriod } from '@/services/subscriptionService';
import type { QuestionnaireAnswers } from '@/types/diagnostic';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  component?: React.ReactNode;
}

export default function ViaJAROnboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    category: 'hotel', // Viria do registro
    cnpj: '12.345.678/0001-90', // Viria do registro
    cadastur: null as CadastURVerificationResult | null,
    plan: null as { planId: PlanTier; billingPeriod: BillingPeriod } | null,
    profile: null as any,
    diagnostic: null as QuestionnaireAnswers | null,
  });

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: 'Verificação CADASTUR',
      description: 'Validação do registro turístico',
    },
    {
      id: 2,
      title: 'Escolher Plano',
      description: 'Selecione o plano ideal',
    },
    {
      id: 3,
      title: 'Pagamento',
      description: 'Configure seu método de pagamento',
    },
    {
      id: 4,
      title: 'Termo de Consentimento',
      description: 'Benchmarking e compartilhamento de dados',
    },
    {
      id: 5,
      title: 'Complete seu Perfil',
      description: 'Adicione informações do negócio',
    },
    {
      id: 6,
      title: 'Diagnóstico Inicial',
      description: 'Avalie seu negócio',
    },
    {
      id: 7,
      title: 'Pronto!',
      description: 'Bem-vindo ao ViajARTur',
    },
  ];

  // Ler parâmetros da URL (step, plan, billing)
  useEffect(() => {
    const stepParam = searchParams.get('step');
    const planParam = searchParams.get('plan') as PlanTier | null;
    const billingParam = searchParams.get('billing') as BillingPeriod | null;

    // Se tiver plano e billing na URL, pré-selecionar e ir direto para pagamento
    if (planParam && billingParam) {
      setOnboardingData(prev => ({ 
        ...prev, 
        plan: { planId: planParam, billingPeriod: billingParam } 
      }));
      // Pular CADASTUR e seleção de plano, ir direto para pagamento
      setCurrentStep(3);
    } 
    // Se tiver apenas step, usar o step
    else if (stepParam) {
      const step = parseInt(stepParam, 10);
      if (step >= 1 && step <= steps.length) {
        setCurrentStep(step);
      }
    }
  }, [searchParams, steps.length]);

  const handleCadastURVerified = (result: CadastURVerificationResult) => {
    setOnboardingData(prev => ({ ...prev, cadastur: result }));
    setCurrentStep(2); // Vai para escolher plano
  };

  const handlePlanSelected = (planId: PlanTier, billingPeriod: BillingPeriod) => {
    setOnboardingData(prev => ({ ...prev, plan: { planId, billingPeriod } }));
    setCurrentStep(3); // Vai para pagamento
  };

  const handlePaymentComplete = () => {
    setCurrentStep(4); // Vai para termo de consentimento
  };

  const handleConsentComplete = () => {
    setCurrentStep(5); // Vai para completar perfil
  };

  const handleProfileComplete = (profileData: any) => {
    setOnboardingData(prev => ({ ...prev, profile: profileData }));
    setCurrentStep(6); // Vai para diagnóstico
  };

  const handleDiagnosticComplete = (diagnosticAnswers: QuestionnaireAnswers) => {
    setOnboardingData(prev => ({ ...prev, diagnostic: diagnosticAnswers }));
    setCurrentStep(7); // Vai para sucesso
  };

  const handleFinish = () => {
    // Salva tudo no backend
    // Redireciona para dashboard
    navigate('/viajar/dashboard');
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-background">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-viajar-slate to-slate-800 py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-viajar-cyan/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="h-4 w-4 text-viajar-cyan" />
              <span className="text-sm text-white/90 font-medium">Configuração Inicial</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Estamos quase lá!
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-6">
              Vamos configurar sua conta ViajARTur em poucos passos
              </p>
            
            {/* Progress Badge */}
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Passo {currentStep} de {steps.length}
            </Badge>
          </div>
          </div>
      </section>

      {/* Main Content */}
      <section className="py-12 -mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stepper */}
          <div className="mb-12">
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
              recommendedPlan={onboardingData.plan?.planId || "professional"}
              preSelectedPlan={onboardingData.plan?.planId || null}
              preSelectedBilling={onboardingData.plan?.billingPeriod || null}
              isViaJARTur={true} // ViaJAR Tur: apenas 2 planos (Empresários e Secretárias)
            />
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && onboardingData.plan && (
            <div className="max-w-3xl mx-auto">
              {onboardingData.plan.planId === "freemium" ? (
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="text-center space-y-4">
                      <h2 className="text-2xl font-bold">Plano Freemium</h2>
                      <p className="text-muted-foreground">
                        O plano Freemium não requer pagamento. Você pode começar a usar agora!
                      </p>
                      <Button size="lg" onClick={handlePaymentComplete}>
                        Continuar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <StripeCheckout
                  planId={onboardingData.plan.planId}
                  billingPeriod={onboardingData.plan.billingPeriod}
                  onSuccess={handlePaymentComplete}
                  onCancel={() => setCurrentStep(2)}
                />
              )}
            </div>
          )}

          {/* Step 4: Consent Term - OBRIGATÓRIO */}
          {currentStep === 4 && (
            <ConsentTerm
              onComplete={handleConsentComplete}
            />
          )}

          {/* Step 5: Profile Completion */}
          {currentStep === 5 && (
            <ProfileCompletion onComplete={handleProfileComplete} />
          )}

          {/* Step 6: Diagnostic Questionnaire */}
          {currentStep === 6 && (
            <DiagnosticQuestionnaire
              onComplete={handleDiagnosticComplete}
              onProgress={(progress) => {
                // Progress callback se necessário
              }}
            />
          )}

          {/* Step 7: Success */}
          {currentStep === 7 && (
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
                      Sua conta ViajARTur está configurada e pronta para uso
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
                            Usar ViajARTur Intelligence Suite (IA)
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
              <a href="/contato" className="text-viajar-cyan hover:underline">
              Entre em contato com nosso suporte
            </a>
          </p>
        </div>
      </div>
      </section>
      
      <ViaJARFooter />
    </div>
  );
}


