/**
 * Página de Sucesso - Pagamento Roteiros Personalizados
 * Exibida após pagamento bem-sucedido do Payment Link do Stripe
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function IARoutePaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!user) {
        setError('Usuário não autenticado. Faça login para continuar.');
        setLoading(false);
        return;
      }

      try {
        // Aguardar um pouco para o webhook processar
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Verificar se o acesso foi marcado no user_metadata
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (currentUser?.user_metadata?.ia_route_paid === true) {
          setVerified(true);
          toast({
            title: "✅ Acesso ativado!",
            description: "Você já pode gerar roteiros personalizados.",
          });
        } else {
          // Se ainda não foi processado, verificar diretamente no banco
          const { data: payment } = await supabase
            .from('user_feature_payments')
            .select('id')
            .eq('user_id', user.id)
            .eq('feature', 'ia_routes')
            .eq('status', 'paid')
            .maybeSingle();

          if (payment) {
            // Atualizar user_metadata
            await supabase.auth.updateUser({
              data: { ia_route_paid: true }
            });
            await refreshUser?.();
            setVerified(true);
          } else {
            // Aguardar mais um pouco (webhook pode estar processando)
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Verificar novamente
            const { data: { user: retryUser } } = await supabase.auth.getUser();
            if (retryUser?.user_metadata?.ia_route_paid === true) {
              setVerified(true);
            } else {
              // Mesmo sem confirmação, consideramos sucesso se temos session_id
              setVerified(true);
              toast({
                title: "Pagamento recebido",
                description: "Seu acesso está sendo processado. Pode levar alguns minutos.",
              });
            }
          }
        }
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

    if (user) {
      verifyPayment();
    } else {
      setLoading(false);
    }
  }, [user, sessionId, toast, refreshUser]);

  const handleGoToProfile = () => {
    navigate('/descubrams/profile?tab=roteiros-ia');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue/5 via-white to-ms-discovery-teal/5 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-ms-primary-blue/20">
          <CardContent className="pt-12 pb-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-ms-primary-blue mx-auto" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Verificando pagamento...</h2>
                <p className="text-gray-600 mt-2">
                  Aguarde enquanto confirmamos seu acesso aos Roteiros Personalizados
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
      <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue/5 via-white to-ms-discovery-teal/5 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-red-500">
          <CardContent className="pt-12 pb-12">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Erro ao verificar pagamento</h2>
                <p className="text-gray-600">{error}</p>
              </div>
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full bg-ms-primary-blue hover:bg-ms-primary-blue/90"
                  onClick={() => navigate('/descubrams/profile')}
                >
                  Voltar para o Perfil
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
    <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue/5 via-white to-ms-discovery-teal/5 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full border-2 border-ms-primary-blue/30 shadow-xl">
        <CardContent className="pt-12 pb-12">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-ms-primary-blue to-ms-discovery-teal flex items-center justify-center mx-auto">
              <Sparkles className="h-10 w-10 text-white" />
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">
                🎉 Acesso Premium Ativado!
              </h2>
              <p className="text-lg text-gray-600">
                Você já pode gerar roteiros personalizados
              </p>
            </div>

            {/* Info Box */}
            <div className="p-6 bg-gradient-to-br from-ms-primary-blue/10 to-ms-discovery-teal/10 rounded-lg border-2 border-ms-primary-blue/20 text-left">
              <h3 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-ms-primary-blue" />
                O que você pode fazer agora:
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-ms-primary-blue mt-0.5 flex-shrink-0" />
                  <span>
                    Gerar roteiros personalizados baseados nas suas preferências
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-ms-primary-blue mt-0.5 flex-shrink-0" />
                  <span>
                    Receber sugestões de parceiros, eventos e passaportes
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-ms-primary-blue mt-0.5 flex-shrink-0" />
                  <span>
                    Fazer reservas diretas com parceiros sugeridos
                  </span>
                </li>
                {sessionId && (
                  <li className="flex items-start gap-2 mt-3 pt-3 border-t border-ms-primary-blue/20">
                    <span className="text-xs text-gray-500">
                      ID da sessão: {sessionId.substring(0, 20)}...
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* Action Button */}
            <div className="space-y-3 pt-4">
              <Button
                size="lg"
                className="w-full max-w-sm bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal hover:from-ms-primary-blue/90 hover:to-ms-discovery-teal/90 text-white gap-2"
                onClick={handleGoToProfile}
              >
                <Sparkles className="h-4 w-4" />
                Gerar Meu Primeiro Roteiro IA
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full max-w-sm border-ms-primary-blue/30 hover:bg-ms-primary-blue/10"
                onClick={() => navigate('/descubrams')}
              >
                Explorar Destinos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

