import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  CheckCircle2, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  ArrowLeft,
  Shield,
  Banknote,
  Clock
} from 'lucide-react';

interface StripeConnectStepProps {
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  onComplete: () => void;
  onBack: () => void;
  onSkip?: () => void; // Opcional: permitir pular e configurar depois
}

export default function StripeConnectStep({
  partnerId,
  partnerName,
  partnerEmail,
  onComplete,
  onBack,
  onSkip,
}: StripeConnectStepProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);

  // Verificar se já está conectado
  useEffect(() => {
    checkConnectionStatus();
  }, [partnerId]);

  // Verificar parâmetros da URL (callback do Stripe)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stripeSuccess = urlParams.get('stripe_connect');
    
    if (stripeSuccess === 'success') {
      // Limpar parâmetros da URL
      window.history.replaceState({}, '', window.location.pathname);
      
      // Verificar status atualizado
      checkConnectionStatus();
      
      toast({
        title: '✅ Conta Stripe conectada!',
        description: 'Você está pronto para receber pagamentos.',
      });
    } else if (stripeSuccess === 'error') {
      window.history.replaceState({}, '', window.location.pathname);
      toast({
        title: 'Erro na conexão',
        description: 'Houve um problema ao conectar sua conta Stripe. Tente novamente.',
        variant: 'destructive',
      });
    }
  }, []);

  const checkConnectionStatus = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase
        .from('institutional_partners')
        .select('stripe_account_id, stripe_connect_status')
        .eq('id', partnerId)
        .single();

      if (error) {
        console.error('Erro ao verificar status:', error);
        return;
      }

      if (data?.stripe_account_id && data?.stripe_connect_status === 'connected') {
        setIsConnected(true);
        setStripeAccountId(data.stripe_account_id);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleConnectStripe = async () => {
    setLoading(true);
    try {
      // Chamar Edge Function para criar link de onboarding
      const { data, error } = await supabase.functions.invoke('stripe-connect-onboarding', {
        body: {
          partnerId,
          partnerEmail,
          partnerName,
          returnUrl: `${window.location.origin}/descubrams/seja-um-parceiro?stripe_connect=success`,
          refreshUrl: `${window.location.origin}/descubrams/seja-um-parceiro?stripe_connect=refresh`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        // Redirecionar para o Stripe Connect Onboarding
        window.location.href = data.url;
      } else {
        throw new Error('URL de onboarding não recebida');
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao iniciar Stripe Connect:', err);
      toast({
        title: 'Erro ao conectar',
        description: err.message || 'Não foi possível iniciar a conexão com o Stripe.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (isConnected) {
      onComplete();
    } else if (onSkip) {
      onSkip();
    }
  };

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-ms-primary-blue mb-4" />
        <p className="text-gray-600">Verificando status da conexão...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status atual */}
      {isConnected ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800">Conta Stripe Conectada!</AlertTitle>
          <AlertDescription className="text-green-700">
            Sua conta Stripe está configurada e você pode receber pagamentos de reservas.
            <br />
            <span className="text-xs text-green-600">ID: {stripeAccountId}</span>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800">Conecte sua Conta Stripe</AlertTitle>
          <AlertDescription className="text-amber-700">
            Para receber pagamentos de reservas diretamente, você precisa conectar uma conta Stripe.
          </AlertDescription>
        </Alert>
      )}

      {/* Benefícios */}
      {!isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5 text-ms-primary-blue" />
              Por que conectar o Stripe?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Banknote className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800">Receba Diretamente</h4>
                  <p className="text-sm text-gray-600">
                    Pagamentos de reservas vão direto para sua conta
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Shield className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800">100% Seguro</h4>
                  <p className="text-sm text-gray-600">
                    Stripe é usado por milhões de empresas no mundo
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Clock className="w-8 h-8 text-purple-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800">Rápido</h4>
                  <p className="text-sm text-gray-600">
                    Configure em menos de 10 minutos
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-2">O que você vai precisar:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Documento de identificação (CPF ou CNPJ)</li>
                <li>• Dados bancários para recebimento</li>
                <li>• Comprovante de endereço (opcional)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comissão Info */}
      <Card className="border-ms-primary-blue/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-800">Comissão da Plataforma</h4>
              <p className="text-sm text-gray-600">
                A plataforma retém uma pequena comissão sobre cada reserva paga
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-ms-primary-blue">10%</span>
              <p className="text-xs text-gray-500">por reserva</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        {!isConnected ? (
          <>
            <Button
              onClick={handleConnectStripe}
              disabled={loading}
              className="flex-1 bg-[#635BFF] hover:bg-[#5851DB] text-white flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <ExternalLink className="w-5 h-5" />
                  Conectar com Stripe
                </>
              )}
            </Button>
            
            {onSkip && (
              <Button
                variant="ghost"
                onClick={onSkip}
                disabled={loading}
                className="text-gray-500"
              >
                Configurar depois
              </Button>
            )}
          </>
        ) : (
          <Button
            onClick={handleContinue}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Continuar
          </Button>
        )}
      </div>

      {/* Nota de segurança */}
      <p className="text-xs text-center text-gray-500">
        Ao clicar em "Conectar com Stripe", você será redirecionado para o Stripe
        para completar a configuração de forma segura. Nenhum dado sensível é armazenado em nossa plataforma.
      </p>
    </div>
  );
}

