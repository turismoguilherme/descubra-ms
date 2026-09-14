// @ts-nocheck
import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { invokeStripeConnectOnboarding } from '@/utils/invokeStripeConnectOnboarding';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Clock, CreditCard, ExternalLink, Loader2 } from 'lucide-react';

export type StripeConnectStatus = 'pending' | 'connected' | 'restricted' | 'disabled';

interface StripeConnectBannerProps {
  partnerId: string;
  partnerEmail: string;
  partnerName: string;
  className?: string;
  status?: StripeConnectStatus;
  onConnected?: () => void;
}

export default function StripeConnectBanner({ 
  partnerId, 
  partnerEmail, 
  partnerName, 
  className,
  status = 'pending',
  onConnected 
}: StripeConnectBannerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);


  const handleConnectStripe = async () => {
    setLoading(true);
    try {

      const { data, error } = await invokeStripeConnectOnboarding({
        partnerId,
        partnerEmail,
        partnerName,
        returnUrl: `${window.location.origin}/partner/dashboard?stripe_connect=success`,
        refreshUrl: `${window.location.origin}/partner/dashboard?stripe_connect=refresh`,
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao conectar Stripe:', err);
      toast({
        title: 'Erro ao conectar',
        description: err.message || 'Não foi possível conectar com o Stripe.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'restricted') {
    return (
      <Alert className={`border-blue-200 bg-blue-50 ${className || ''}`}>
        <Clock className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-900 font-semibold">
          Cadastro de recebimentos enviado — em análise
        </AlertTitle>
        <AlertDescription className="text-blue-800">
          <p className="mb-3">
            Recebemos seus dados e o Stripe está analisando. Você já pode usar o painel; assim que a
            análise terminar, os recebimentos são liberados automaticamente.
          </p>
          <Button
            variant="outline"
            onClick={handleConnectStripe}
            disabled={loading}
            className="border-blue-300 text-blue-800 hover:bg-blue-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Abrindo...
              </>
            ) : (
              <>
                Revisar ou completar dados
                <ExternalLink className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'disabled') {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="font-semibold">Cadastro de recebimentos reprovado</AlertTitle>
        <AlertDescription>
          O Stripe não aprovou sua conta de recebimentos, então o painel do parceiro está bloqueado.
          Entre em contato com o suporte para entender o motivo e reenviar seus dados.
        </AlertDescription>
      </Alert>
    );
  }

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

