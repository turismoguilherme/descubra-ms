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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StripeConnectBanner.tsx:26',message:'Iniciando conexão com Stripe',data:{partnerId,partnerEmail,partnerName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion

      const { data, error } = await supabase.functions.invoke('stripe-connect-onboarding', {
        body: {
          partnerId,
          partnerEmail,
          partnerName,
          returnUrl: `${window.location.origin}/partner/dashboard?stripe_connect=success`,
          refreshUrl: `${window.location.origin}/partner/dashboard?stripe_connect=refresh`,
        },
      });

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StripeConnectBanner.tsx:39',message:'Resposta da Edge Function',data:{hasError:!!error,errorMessage:error?.message,hasData:!!data,hasUrl:!!data?.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StripeConnectBanner.tsx:47',message:'Erro ao conectar Stripe',data:{errorMessage:error?.message,errorStack:error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
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

