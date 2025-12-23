/**
 * ViaJAR Onboarding Page
 * Fluxo: Pagamento → Termo → Perfil → Diagnóstico (apenas Empresários) → Dashboard
 * O plano já vem selecionado da página de preços/cadastro
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronRight, Sparkles, CreditCard, FileCheck, User, ClipboardList, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import ProfileCompletion from '@/components/onboarding/ProfileCompletion';
import ConsentTerm from '@/components/onboarding/ConsentTerm';
import DiagnosticQuestionnaire from '@/components/diagnostic/DiagnosticQuestionnaire';
import type { PlanTier, BillingPeriod } from '@/services/subscriptionService';
import type { QuestionnaireAnswers } from '@/types/diagnostic';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Payment Links do Stripe (teste)
const STRIPE_PAYMENT_LINKS = {
  professional: 'https://buy.stripe.com/test_7sY28t9gG5y5dsH2vxbfO00', // Empresários - R$ 200/mês
  government: 'https://buy.stripe.com/test_fZu5kF50q7GdgET1rtbfO03', // Secretárias - R$ 2.000/mês
};

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function ViaJAROnboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    category: 'hotel',
    plan: null as { planId: PlanTier; billingPeriod: BillingPeriod } | null,
    profile: null as any,
    diagnostic: null as QuestionnaireAnswers | null,
  });

  // Verificar se é plano de Secretárias (não precisa de diagnóstico)
  const isGovernmentPlan = onboardingData.plan?.planId === 'government';

  // Etapas dinâmicas baseadas no plano
  const getSteps = (): OnboardingStep[] => {
    const baseSteps: OnboardingStep[] = [
      {
        id: 1,
        title: 'Pagamento',
        description: 'Pagamento seguro via Stripe',
        icon: <CreditCard className="h-5 w-5" />,
      },
      {
        id: 2,
        title: 'Termo de Consentimento',
        description: 'Aceite os termos',
        icon: <FileCheck className="h-5 w-5" />,
      },
      {
        id: 3,
        title: 'Complete seu Perfil',
        description: 'Informações do negócio',
        icon: <User className="h-5 w-5" />,
      },
    ];

    // Diagnóstico apenas para Empresários (não para Secretárias)
    if (!isGovernmentPlan) {
      baseSteps.push({
        id: 4,
        title: 'Diagnóstico Inicial',
        description: 'Avalie seu negócio',
        icon: <ClipboardList className="h-5 w-5" />,
      });
    }

    // Etapa final
    baseSteps.push({
      id: isGovernmentPlan ? 4 : 5,
      title: 'Pronto!',
      description: 'Bem-vindo ao ViajARTur',
      icon: <PartyPopper className="h-5 w-5" />,
    });

    return baseSteps;
  };

  const steps = getSteps();

  // Ler parâmetros da URL (plan, billing, success)
  useEffect(() => {
    const planParam = searchParams.get('plan') as PlanTier | null;
    const billingParam = searchParams.get('billing') as BillingPeriod | null;
    const successParam = searchParams.get('success');

    // Carregar dados do localStorage se existirem
    const savedData = localStorage.getItem('registration_data');
    let savedPlan: PlanTier | null = null;
    let savedBilling: BillingPeriod = 'monthly';
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        savedPlan = parsed.selectedPlan as PlanTier;
        savedBilling = (parsed.selectedBilling as BillingPeriod) || 'monthly';
      } catch (e) {
        console.error('Erro ao parsear registration_data:', e);
      }
    }

    // Usar dados da URL ou do localStorage
    const finalPlan = planParam || savedPlan;
    const finalBilling = billingParam || savedBilling;

    if (finalPlan) {
      setOnboardingData(prev => ({ 
        ...prev, 
        plan: { planId: finalPlan, billingPeriod: finalBilling } 
      }));
    }

    // Se voltou do Stripe com sucesso, ir para termo de consentimento
    if (successParam === 'true') {
      toast({
        title: "Pagamento confirmado! 🎉",
        description: "Sua assinatura foi ativada com sucesso.",
      });
      setCurrentStep(2); // Termo de consentimento
      // Limpar parâmetro da URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      return;
    }

    // Se não tem plano, redirecionar para página de preços
    if (!finalPlan && !successParam) {
      toast({
        title: "Selecione um plano",
        description: "Você será redirecionado para a página de planos.",
        variant: "destructive",
      });
      setTimeout(() => navigate('/viajar/precos'), 1500);
    }
  }, [searchParams, toast, navigate]);

  // Redirecionar para Payment Link do Stripe (chamado automaticamente ao entrar na página)
  const handlePaymentRedirect = () => {
    if (!onboardingData.plan) {
      toast({
        title: "Selecione um plano",
        description: "Redirecionando para página de planos...",
        variant: "destructive",
      });
      setTimeout(() => navigate('/viajar/precos'), 1500);
      return;
    }

    const { planId } = onboardingData.plan;
    const paymentLink = STRIPE_PAYMENT_LINKS[planId as keyof typeof STRIPE_PAYMENT_LINKS];

    if (!paymentLink) {
      toast({
        title: "Plano não disponível",
        description: "Este plano não está disponível para pagamento online. Entre em contato conosco.",
        variant: "destructive",
      });
      return;
    }

    setIsRedirecting(true);

    // Construir URL com parâmetros
    const userId = user?.id || 'unknown';
    const userEmail = user?.email || '';
    
    // Payment Link com client_reference_id para vincular ao usuário
    const redirectUrl = `${paymentLink}?client_reference_id=${userId}&prefilled_email=${encodeURIComponent(userEmail)}`;

    toast({
      title: "Redirecionando para pagamento...",
      description: "Você será redirecionado para o Stripe.",
    });

    // Redirecionar após breve delay
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 1000);
  };

  const handleConsentComplete = () => {
    setCurrentStep(3); // Vai para completar perfil
  };

  const handleProfileComplete = (profileData: any) => {
    setOnboardingData(prev => ({ ...prev, profile: profileData }));
    // Secretárias: vai direto para Pronto (não tem diagnóstico)
    // Empresários: vai para diagnóstico
    if (isGovernmentPlan) {
      setCurrentStep(4); // Pronto
    } else {
      setCurrentStep(4); // Diagnóstico
    }
  };

  const handleDiagnosticComplete = (diagnosticAnswers: QuestionnaireAnswers) => {
    setOnboardingData(prev => ({ ...prev, diagnostic: diagnosticAnswers }));
    setCurrentStep(5); // Vai para sucesso
  };

  const handleFinish = () => {
    // Limpar dados temporários
    localStorage.removeItem('registration_data');
    // Redireciona para dashboard apropriado
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
          {/* Step 1: Payment - Redireciona para Stripe */}
          {currentStep === 1 && onboardingData.plan && (
            <div className="max-w-3xl mx-auto">
              <Card>
                <CardContent className="pt-8 pb-8">
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto">
                      <CreditCard className="h-8 w-8 text-purple-600" />
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold">Finalizar Pagamento</h2>
                      <p className="text-muted-foreground">
                        Você será redirecionado para o Stripe para concluir o pagamento de forma segura.
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <p className="font-semibold">
                            {onboardingData.plan.planId === 'professional' ? 'Plano Empresários' : 'Plano Secretárias'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Cobrança mensal recorrente
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-600">
                            R$ {onboardingData.plan.planId === 'professional' ? '200' : '2.000'}
                            <span className="text-sm font-normal text-muted-foreground">/mês</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/viajar/precos')}
                        disabled={isRedirecting}
                      >
                        Trocar Plano
                      </Button>
                      <Button 
                        size="lg" 
                        onClick={handlePaymentRedirect}
                        disabled={isRedirecting}
                        className="gap-2"
                      >
                        {isRedirecting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Redirecionando...
                          </>
                        ) : (
                          <>
                            Ir para Pagamento
                            <ChevronRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      🔒 Pagamento seguro processado pelo Stripe
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Consent Term - OBRIGATÓRIO */}
          {currentStep === 2 && (
            <ConsentTerm
              onComplete={handleConsentComplete}
            />
          )}

          {/* Step 3: Profile Completion */}
          {currentStep === 3 && (
            <ProfileCompletion onComplete={handleProfileComplete} />
          )}

          {/* Step 4: Diagnostic (apenas Empresários) OU Pronto (Secretárias) */}
          {currentStep === 4 && (
            <>
              {/* Empresários: Diagnóstico */}
              {!isGovernmentPlan && (
                <DiagnosticQuestionnaire
                  onComplete={handleDiagnosticComplete}
                  onProgress={(progress) => {
                    // Progress callback se necessário
                  }}
                />
              )}
              
              {/* Secretárias: Tela final (sem diagnóstico) */}
              {isGovernmentPlan && (
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
                          Sua conta de Secretaria está configurada e pronta para uso
                        </p>
                      </div>

                      <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                        <h3 className="font-semibold mb-3">
                          O que você pode fazer agora:
                        </h3>
                        <ul className="space-y-2 text-left text-sm">
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Acessar seu dashboard de Secretaria</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Visualizar dados consolidados do turismo</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Gerar relatórios e análises regionais</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Gerenciar empresas cadastradas</span>
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Step 5: Success (apenas para Empresários após diagnóstico) */}
          {currentStep === 5 && !isGovernmentPlan && (
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
                        <span>Acessar seu dashboard personalizado</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Ver análises e insights do seu negócio</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Aparecer nas buscas da plataforma</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Acompanhar seu diagnóstico inicial</span>
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
                      Você pode refazer o diagnóstico a qualquer momento
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


