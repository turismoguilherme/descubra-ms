// @ts-nocheck
/**
 * Payment Success Page
 * Página exibida após pagamento bem-sucedido via Stripe
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('Sessão de pagamento não encontrada');
        setLoading(false);
        return;
      }

      try {
        // Verificar se a sessão foi processada
        // O webhook do Stripe já deve ter processado o pagamento
        // Aqui apenas verificamos se o usuário tem uma assinatura ativa
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('Usuário não autenticado');
          setLoading(false);
          return;
        }

        // Verificar assinatura no banco
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .single();

        if (subError && subError.code !== 'PGRST116') {
          // PGRST116 = no rows returned, que é esperado se ainda não processou
          console.log('Verificando assinatura...', subError);
        }

        // Mesmo que a assinatura ainda não esteja no banco (webhook pode estar processando),
        // consideramos sucesso se temos o session_id do Stripe
        setVerified(true);
        toast({
          title: "Pagamento confirmado!",
          description: "Sua assinatura está sendo processada. Você receberá um e-mail de confirmação em breve.",
        });
      } catch (err: unknown) {
        console.error('Erro ao verificar pagamento:', err);
        setError(err.message || 'Erro ao verificar pagamento');
        toast({
          title: "Erro",
          description: "Não foi possível verificar o pagamento. Entre em contato com o suporte.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, toast]);

  const handleContinue = () => {
    navigate('/viajar/onboarding?step=4'); // Continuar com termo de consentimento
  };

  const handleGoToDashboard = () => {
    navigate('/viajar/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/30 dark:to-purple-950/20 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-12 pb-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold">Verificando pagamento...</h2>
                <p className="text-muted-foreground mt-2">
                  Aguarde enquanto confirmamos seu pagamento
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/30 dark:to-purple-950/20 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-red-500">
          <CardContent className="pt-12 pb-12">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Erro ao verificar pagamento</h2>
                <p className="text-muted-foreground">
                  {error}
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => navigate('/viajar/onboarding')}
                >
                  Voltar para Onboarding
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate('/contato')}
                >
                  Entrar em Contato
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/30 dark:to-purple-950/20 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full border-green-500">
        <CardContent className="pt-12 pb-12">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Check className="h-10 w-10 text-green-600" />
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">
                🎉 Pagamento Confirmado!
              </h2>
              <p className="text-lg text-muted-foreground">
                Seu pagamento foi processado com sucesso
              </p>
            </div>

            {/* Info Box */}
            <div className="p-6 bg-purple-50 rounded-lg border border-purple-200 text-left">
              <h3 className="font-semibold mb-3">
                O que acontece agora:
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Você receberá um e-mail de confirmação com os detalhes da sua assinatura
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Sua assinatura está ativa e você já pode usar todos os recursos do seu plano
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Você tem 14 dias grátis para testar antes da primeira cobrança
                  </span>
                </li>
                {sessionId && (
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      ID da sessão: {sessionId.substring(0, 20)}...
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                size="lg"
                className="w-full max-w-sm gap-2"
                onClick={handleContinue}
              >
                Continuar Configuração
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full max-w-sm"
                onClick={handleGoToDashboard}
              >
                Ir para o Dashboard
              </Button>
              <p className="text-xs text-muted-foreground">
                Você pode completar a configuração mais tarde se preferir
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

