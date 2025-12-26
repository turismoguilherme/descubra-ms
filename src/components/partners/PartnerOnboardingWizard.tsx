import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Building2, FileText, CreditCard, Loader2, Link2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PartnerApplicationForm } from './PartnerApplicationForm';
import PartnerTermsAcceptance from './PartnerTermsAcceptance';
import PartnerPaymentStep from './PartnerPaymentStep';
import StripeConnectStep from './StripeConnectStep';
import WelcomeModal from './WelcomeModal';

interface OnboardingData {
  partnerId?: string;
  partnerName?: string;
  partnerEmail?: string;
  password?: string;
  termsAccepted?: boolean;
  termsVersion?: number;
}

const steps = [
  { id: 1, title: 'Dados da Empresa', icon: Building2 },
  { id: 2, title: 'Termo de Parceria', icon: FileText },
  { id: 3, title: 'Pagamento', icon: CreditCard },
  { id: 4, title: 'Stripe Connect', icon: Link2 },
];

export default function PartnerOnboardingWizard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const progress = (currentStep / steps.length) * 100;

  const handleStep1Complete = (data: {
    partnerId: string;
    partnerName: string;
    partnerEmail: string;
    password: string;
  }) => {
    setOnboardingData({
      ...onboardingData,
      ...data,
    });
    setCurrentStep(2);
  };

  const handleStep2Complete = (data: {
    termsAccepted: boolean;
    termsVersion: number;
  }) => {
    setOnboardingData({
      ...onboardingData,
      ...data,
    });
    setCurrentStep(3);
  };

  const handleStep3Complete = () => {
    // Avançar para a etapa do Stripe Connect
    setCurrentStep(4);
  };

  const handleStep4Complete = () => {
    // Enviar email de boas-vindas
    sendWelcomeEmail();
    // Mostrar modal de boas-vindas
    setShowWelcomeModal(true);
  };

  const handleSkipStripeConnect = () => {
    // Enviar email de boas-vindas (mesmo pulando Stripe)
    sendWelcomeEmail();
    // Mostrar modal de boas-vindas
    setShowWelcomeModal(true);
  };

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    // Redirecionar para dashboard
    navigate('/partner/dashboard?welcome=true');
  };

  const sendWelcomeEmail = async () => {
    try {
      await supabase.functions.invoke('send-notification-email', {
        body: {
          type: 'partner_welcome',
          to: onboardingData.partnerEmail,
          data: {
            partnerName: onboardingData.partnerName,
            dashboardUrl: `${window.location.origin}/partner/dashboard`,
          },
        },
      });
    } catch (error) {
      console.warn('Erro ao enviar email de boas-vindas (não crítico):', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Seja um Parceiro Descubra MS
          </h1>
          <p className="text-white/80">
            Complete o cadastro em 3 passos simples
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : isActive
                            ? 'bg-ms-primary-blue border-ms-primary-blue text-white'
                            : 'bg-gray-200 border-gray-300 text-gray-500'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>
                      <p
                        className={`text-xs mt-2 text-center ${
                          isActive ? 'font-semibold text-ms-primary-blue' : 'text-gray-500'
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const CurrentStepIcon = steps[currentStep - 1].icon;
                return CurrentStepIcon && <CurrentStepIcon className="w-6 h-6 text-ms-primary-blue" />;
              })()}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Preencha os dados da sua empresa e crie sua senha'}
              {currentStep === 2 && 'Leia e aceite o termo de parceria'}
              {currentStep === 3 && 'Complete o pagamento da assinatura mensal'}
              {currentStep === 4 && 'Conecte sua conta Stripe para receber pagamentos'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <div>
                <PartnerApplicationForm
                  onComplete={handleStep1Complete}
                  includePassword={true}
                />
              </div>
            )}

            {currentStep === 2 && onboardingData.partnerId && (
              <PartnerTermsAcceptance
                partnerId={onboardingData.partnerId}
                partnerName={onboardingData.partnerName || ''}
                partnerEmail={onboardingData.partnerEmail || ''}
                onComplete={handleStep2Complete}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && onboardingData.partnerId && (
              <PartnerPaymentStep
                partnerId={onboardingData.partnerId}
                partnerName={onboardingData.partnerName || ''}
                partnerEmail={onboardingData.partnerEmail || ''}
                onComplete={handleStep3Complete}
                onBack={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && onboardingData.partnerId && (
              <StripeConnectStep
                partnerId={onboardingData.partnerId}
                partnerName={onboardingData.partnerName || ''}
                partnerEmail={onboardingData.partnerEmail || ''}
                onComplete={handleStep4Complete}
                onBack={() => setCurrentStep(3)}
                onSkip={handleSkipStripeConnect}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Boas-Vindas */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleCloseWelcomeModal}
        partnerName={onboardingData.partnerName || 'Parceiro'}
        hasStripeConnected={currentStep === 4}
      />
    </div>
  );
}

