// @ts-nocheck
import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CreditCard, ExternalLink, Loader2 } from 'lucide-react';

interface StripeConnectBannerProps {
  partnerId: string;
  partnerEmail: string;
  partnerName: string;
  className?: string;
  onConnected?: () => void;
}

export default function StripeConnectBanner({ 
  partnerId, 
  partnerEmail, 
  partnerName, 
  className,
  onConnected 
}: StripeConnectBannerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleConnectStripe = async () => {
    setLoading(true);
    try {

      const { data, error } = await supabase.functions.invoke('stripe-connect-onboarding', {
        body: {
          partnerId,
          partnerEmail,
          partnerName,
          returnUrl: `${window.location.origin}/partner/dashboard?stripe_connect=success`,
          refreshUrl: `${window.location.origin}/partner/dashboard?stripe_connect=refresh`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: unknown) {
      
      console.error('Erro ao conectar Stripe:', error);
      toast({
        title: 'Erro ao conectar',
        description: error.message || 'Não foi possível conectar com o Stripe.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Alert className={`border-amber-200 bg-amber-50 ${className || ''}`}>
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-amber-800 font-semibold">
        Configure sua conta Stripe para receber pagamentos
      </AlertTitle>
      <AlertDescription className="text-amber-700">
        <p className="mb-3">
          Para receber pagamentos de reservas diretamente na sua conta, 
          você precisa conectar sua conta Stripe.
        </p>
        <Button
          onClick={handleConnectStripe}
          disabled={loading}
          className="bg-[#635BFF] hover:bg-[#5851DB] text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Configurar Agora
              <ExternalLink className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
}

