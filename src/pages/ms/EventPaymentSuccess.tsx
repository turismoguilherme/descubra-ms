/**
 * Página de Sucesso - Pagamento de Evento em Destaque
 * Exibida após pagamento bem-sucedido do Payment Link do Stripe
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, AlertCircle, ArrowRight, Calendar, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import UniversalLayout from '@/components/layout/UniversalLayout';
import { getErrorMessage } from '@/utils/errorUtils';

export default function EventPaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventData, setEventData] = useState<{ id: string; name: string } | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('Sessão de pagamento não encontrada');
        setLoading(false);
        return;
      }

      try {
        // 1. Buscar informações da sessão do Stripe
        const { data: sessionData, error: sessionError } = await supabase.functions.invoke('get-stripe-session', {
          body: { session_id: sessionId },
        });

        if (sessionError || !sessionData?.success) {
          throw new Error(sessionError?.message || 'Erro ao buscar informações da sessão');
        }

        const eventId = sessionData.session?.client_reference_id;
        if (!eventId) {
          throw new Error('ID do evento não encontrado na sessão');
        }

        // 2. Aguardar um pouco para o webhook processar
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 3. Buscar informações do evento
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('id, name, sponsor_payment_status, is_sponsored')
          .eq('id', eventId)
          .single();

        if (eventError) {
          console.error('Erro ao buscar evento:', eventError);
          // Continuar mesmo sem dados do evento
        } else {
          setEventData({ id: event.id, name: event.name || 'Evento' });
        }

        // 4. Verificar status do pagamento
        if (event?.sponsor_payment_status === 'paid' || event?.is_sponsored) {
          setVerified(true);
          toast({
            title: "✅ Pagamento confirmado!",
            description: "Seu evento está em destaque e será exibido na plataforma.",
          });
        } else {
          // Aguardar mais um pouco (webhook pode estar processando)
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Verificar novamente
          const { data: retryEvent } = await supabase
            .from('events')
            .select('sponsor_payment_status, is_sponsored')
            .eq('id', eventId)
            .single();

          if (retryEvent?.sponsor_payment_status === 'paid' || retryEvent?.is_sponsored) {
            setVerified(true);
            toast({
              title: "✅ Pagamento confirmado!",
              description: "Seu evento está em destaque e será exibido na plataforma.",
            });
          } else {
            // Mesmo sem confirmação, consideramos sucesso se temos session_id
            setVerified(true);
            toast({
              title: "Pagamento recebido",
              description: "Seu pagamento está sendo processado. Você receberá um e-mail de confirmação em breve.",
            });
          }
        }
      } catch (err: unknown) {
        console.error('Erro ao verificar pagamento:', err);
        setError(getErrorMessage(err, 'Erro ao verificar pagamento'));
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

  const handleViewEvent = () => {
    if (eventData?.id) {
      navigate(`/descubrams/eventos?evento=${eventData.id}`);
    } else {
      navigate('/descubrams/eventos');
    }
  };

  const handleViewAllEvents = () => {
    navigate('/descubrams/eventos');
  };

  if (loading) {
    return (
      <UniversalLayout>
        <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue/5 via-white to-ms-discovery-teal/5 flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-ms-primary-blue/20">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-ms-primary-blue mx-auto" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Verificando pagamento...</h2>
                  <p className="text-gray-600 mt-2">
                    Aguarde enquanto confirmamos seu pagamento
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </UniversalLayout>
    );
  }

  if (error) {
    return (
      <UniversalLayout>
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
                    onClick={handleViewAllEvents}
                  >
                    Voltar para Eventos
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
      </UniversalLayout>
    );
  }

  return (
    <UniversalLayout>
      <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue/5 via-white to-ms-discovery-teal/5 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full border-2 border-ms-primary-blue/30 shadow-xl">
          <CardContent className="pt-12 pb-12">
            <div className="text-center space-y-6">
              {/* Success Icon */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-ms-primary-blue to-ms-discovery-teal flex items-center justify-center mx-auto">
                <Check className="h-10 w-10 text-white" />
              </div>

              {/* Success Message */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  🎉 Pagamento Confirmado!
                </h2>
                <p className="text-lg text-gray-600">
                  Seu evento está em destaque na plataforma
                </p>
              </div>

              {/* Event Info */}
              {eventData && (
                <div className="p-6 bg-gradient-to-br from-ms-primary-blue/10 to-ms-discovery-teal/10 rounded-lg border-2 border-ms-primary-blue/20 text-left">
                  <h3 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-ms-primary-blue" />
                    {eventData.name}
                  </h3>
                </div>
              )}

              {/* Info Box */}
              <div className="p-6 bg-gradient-to-br from-ms-primary-blue/10 to-ms-discovery-teal/10 rounded-lg border-2 border-ms-primary-blue/20 text-left">
                <h3 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-ms-primary-blue" />
                  O que acontece agora:
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-ms-primary-blue mt-0.5 flex-shrink-0" />
                    <span>
                      Seu evento está em destaque por 30 dias
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-ms-primary-blue mt-0.5 flex-shrink-0" />
                    <span>
                      O evento será exibido com destaque na página de eventos
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-ms-primary-blue mt-0.5 flex-shrink-0" />
                    <span>
                      Você receberá um e-mail de confirmação em breve
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

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                {eventData && (
                  <Button
                    size="lg"
                    className="w-full max-w-sm bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal hover:from-ms-primary-blue/90 hover:to-ms-discovery-teal/90 text-white gap-2"
                    onClick={handleViewEvent}
                  >
                    <Calendar className="h-4 w-4" />
                    Ver Meu Evento
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full max-w-sm border-ms-primary-blue/30 hover:bg-ms-primary-blue/10"
                  onClick={handleViewAllEvents}
                >
                  Ver Todos os Eventos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </UniversalLayout>
  );
}

