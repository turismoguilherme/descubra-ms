import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CreditCard, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_SUPPORT_EMAIL = 'suporte@descubrams.com.br';

interface BlockedPartnerBannerProps {
  subscriptionStatus?: string;
  className?: string;
}

export default function BlockedPartnerBanner({
  subscriptionStatus,
  className,
}: BlockedPartnerBannerProps) {
  const getMessage = () => {
    switch (subscriptionStatus) {
      case 'past_due':
        return {
          title: 'Pagamento em Atraso',
          description:
            'Sua assinatura está em atraso. Renove o pagamento para continuar usando a plataforma e receber novas reservas.',
          paymentButtonText: 'Renovar assinatura (Stripe)',
        };
      case 'unpaid':
        return {
          title: 'Pagamento Não Realizado',
          description:
            'O pagamento da sua assinatura não foi processado. Renove ou fale com o suporte.',
          paymentButtonText: 'Pagar assinatura (Stripe)',
        };
      case 'canceled':
        return {
          title: 'Assinatura Cancelada',
          description:
            'Sua assinatura foi cancelada. Renove para continuar usando a plataforma e receber novas reservas.',
          paymentButtonText: 'Assinar novamente (Stripe)',
        };
      default:
        return {
          title: 'Acesso Bloqueado',
          description:
            'Sua conta está inativa. Para voltar a receber reservas, regularize a assinatura ou fale com o suporte.',
          paymentButtonText: 'Pagar assinatura (Stripe)',
        };
    }
  };

  const message = getMessage();
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [supportEmail, setSupportEmail] = useState(DEFAULT_SUPPORT_EMAIL);
  const [supportPhone, setSupportPhone] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const keys = ['partner_payment_link', 'partner_support_email', 'partner_support_phone'] as const;
        const { data, error } = await supabase
          .from('site_settings')
          .select('setting_key, setting_value')
          .eq('platform', 'ms')
          .in('setting_key', keys);

        if (error) {
          console.error('Erro ao carregar links de parceiro:', error);
          return;
        }
        for (const row of data || []) {
          const k = row.setting_key as string;
          const v = row.setting_value != null ? String(row.setting_value) : '';
          if (k === 'partner_payment_link' && v) setPaymentLink(v);
          if (k === 'partner_support_email' && v.trim()) setSupportEmail(v.trim());
          if (k === 'partner_support_phone') setSupportPhone(v.trim());
        }
      } catch (e) {
        console.error('Erro ao carregar configurações:', e);
      }
    };
    load();
  }, []);

  const handlePaymentClick = () => {
    if (paymentLink) {
      window.open(paymentLink, '_blank');
    } else {
      window.location.href = '/partner/onboarding?step=payment';
    }
  };

  const phoneDigits = supportPhone.replace(/\D/g, '');
  const telHref = phoneDigits ? `tel:${phoneDigits}` : '';

  return (
    <Alert className={`border-red-200 bg-red-50 ${className || ''}`}>
      <AlertCircle className="h-5 w-5 text-red-600" />
      <AlertTitle className="text-red-800 font-semibold">{message.title}</AlertTitle>
      <AlertDescription className="text-red-700">
        <p className="mb-3">{message.description}</p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="default"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handlePaymentClick}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {message.paymentButtonText}
            </Button>
          </div>
          <div className="rounded-md border border-red-200 bg-white/80 px-3 py-2 text-sm text-red-900">
            <p className="font-medium mb-2">Suporte (e-mail e telefone)</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="border-red-300" asChild>
                <a href={`mailto:${supportEmail}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  {supportEmail}
                </a>
              </Button>
              {supportPhone ? (
                telHref ? (
                  <Button size="sm" variant="outline" className="border-red-300" asChild>
                    <a href={telHref}>
                      <Phone className="w-4 h-4 mr-2" />
                      {supportPhone}
                    </a>
                  </Button>
                ) : (
                  <span className="text-xs self-center text-muted-foreground">{supportPhone}</span>
                )
              ) : null}
            </div>
            <p className="text-xs text-red-700/80 mt-2">
              O botão vermelho acima abre o <strong>pagamento no Stripe</strong>. O suporte é por e-mail/telefone
              configurados pelo administrador.
            </p>
          </div>
        </div>
        <p className="text-xs text-red-600 mt-3">
          Você ainda pode visualizar reservas antigas, mas não receberá novas até regularizar a assinatura.
        </p>
      </AlertDescription>
    </Alert>
  );
}
