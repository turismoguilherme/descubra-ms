import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CreditCard, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BlockedPartnerBannerProps {
  subscriptionStatus?: string;
  className?: string;
}

export default function BlockedPartnerBanner({ 
  subscriptionStatus,
  className 
}: BlockedPartnerBannerProps) {
  const getMessage = () => {
    switch (subscriptionStatus) {
      case 'past_due':
        return {
          title: 'Pagamento em Atraso',
          description: 'Sua assinatura está em atraso. Renove o pagamento para continuar usando a plataforma e receber novas reservas.',
          buttonText: 'Renovar Assinatura',
        };
      case 'unpaid':
        return {
          title: 'Pagamento Não Realizado',
          description: 'O pagamento da sua assinatura não foi processado. Entre em contato com o suporte ou renove sua assinatura para continuar usando a plataforma.',
          buttonText: 'Renovar Assinatura',
        };
      case 'canceled':
        return {
          title: 'Assinatura Cancelada',
          description: 'Sua assinatura foi cancelada. Renove para continuar usando a plataforma e receber novas reservas.',
          buttonText: 'Renovar Assinatura',
        };
      default:
        return {
          title: 'Acesso Bloqueado',
          description: 'Sua conta está inativa. Entre em contato com o suporte para regularizar sua situação.',
          buttonText: 'Contatar Suporte',
        };
    }
  };

  const message = getMessage();
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  useEffect(() => {
    // Carregar link de pagamento do site_settings
    const loadPaymentLink = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('platform', 'ms')
          .eq('setting_key', 'partner_payment_link')
          .maybeSingle();

        if (!error && data?.setting_value) {
          setPaymentLink(String(data.setting_value));
        }
      } catch (error) {
        console.error('Erro ao carregar link de pagamento:', error);
      }
    };

    loadPaymentLink();
  }, []);

  const handleRenewSubscription = () => {
    if (paymentLink) {
      // Abrir link de pagamento do Stripe
      window.open(paymentLink, '_blank');
    } else {
      // Fallback: redirecionar para página de onboarding de pagamento
      window.location.href = '/partner/onboarding?step=payment';
    }
  };

  return (
    <Alert className={`border-red-200 bg-red-50 ${className || ''}`}>
      <AlertCircle className="h-5 w-5 text-red-600" />
      <AlertTitle className="text-red-800 font-semibold">
        {message.title}
      </AlertTitle>
      <AlertDescription className="text-red-700">
        <p className="mb-3">
          {message.description}
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleRenewSubscription}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {message.buttonText}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
            onClick={() => window.open('mailto:suporte@descubrams.com.br', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Contatar Suporte
          </Button>
        </div>
        <p className="text-xs text-red-600 mt-3">
          ⚠️ Você ainda pode visualizar suas reservas antigas, mas não receberá novas reservas até regularizar o pagamento.
        </p>
      </AlertDescription>
    </Alert>
  );
}

