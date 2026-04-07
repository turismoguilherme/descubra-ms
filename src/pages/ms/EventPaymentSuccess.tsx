/**
 * Página de Sucesso - Pagamento de Evento em Destaque
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
        const { data: sessionData, error: sessionError } = await supabase.functions.invoke('get-stripe-session', {
          body: { session_id: sessionId },
        });

        if (sessionError || !sessionData?.success) {
          throw new Error(sessionError?.message || 'Erro ao buscar informações da sessão');
        }

        const eventId = sessionData.session?.client_reference_id;
        if (!eventId) throw new Error('ID do evento não encontrado na sessão');

        await new Promise(resolve => setTimeout(resolve, 2000));

        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('id, titulo, sponsor_payment_status, is_sponsored')
          .eq('id', eventId)
          .single();

        if (eventError) {
          console.error('Erro ao buscar evento:', eventError);
        } else {
          const e = event as any;
          setEventData({ id: e.id, name: e.titulo || 'Evento' });
        }

        const e = event as any;
        if (e?.sponsor_payment_status === 'paid' || e?.is_sponsored) {
          setVerified(true);
          toast({ title: "✅ Pagamento confirmado!", description: "Seu evento está em destaque." });
        } else {
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const { data: retryEvent } = await supabase
            .from('events')
            .select('sponsor_payment_status, is_sponsored')
            .eq('id', eventId)
            .single();

          const re = retryEvent as any;
          if (re?.sponsor_payment_status === 'paid' || re?.is_sponsored) {
            setVerified(true);
            toast({ title: "✅ Pagamento confirmado!" });
          } else {
            setVerified(true);
            toast({ title: "Pagamento recebido", description: "Processando. Você receberá confirmação por e-mail." });
          }
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Erro ao verificar pagamento'));
        toast({ title: "Erro", description: "Não foi possível verificar o pagamento.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, toast]);

  const handleViewEvent = () => {
    navigate(eventData?.id ? `/descubrams/eventos?evento=${eventData.id}` : '/descubrams/eventos');
  };

  if (loading) {
    return (
      <UniversalLayout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardContent className="pt-12 pb-12 text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-ms-primary-blue mx-auto" />
              <h2 className="text-2xl font-bold">Verificando pagamento...</h2>
            </CardContent>
          </Card>
        </div>
      </UniversalLayout>
    );
  }

  if (error) {
    return (
      <UniversalLayout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-red-500">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <AlertCircle className="h-10 w-10 text-red-600 mx-auto" />
              <h2 className="text-2xl font-bold">{error}</h2>
              <Button onClick={() => navigate('/descubrams/eventos')}>Voltar para Eventos</Button>
            </CardContent>
          </Card>
        </div>
      </UniversalLayout>
    );
  }

  return (
    <UniversalLayout>
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full border-2 border-ms-primary-blue/30 shadow-xl">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-ms-primary-blue to-ms-discovery-teal flex items-center justify-center mx-auto">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold">🎉 Pagamento Confirmado!</h2>
            <p className="text-lg text-gray-600">Seu evento está em destaque na plataforma</p>

            {eventData && (
              <div className="p-6 bg-ms-primary-blue/10 rounded-lg text-left">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-ms-primary-blue" />
                  {eventData.name}
                </h3>
              </div>
            )}

            <div className="p-6 bg-ms-primary-blue/10 rounded-lg text-left">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-ms-primary-blue" />
                O que acontece agora:
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2"><Check className="h-4 w-4 text-ms-primary-blue mt-0.5" /><span>Evento em destaque por 30 dias</span></li>
                <li className="flex items-start gap-2"><Check className="h-4 w-4 text-ms-primary-blue mt-0.5" /><span>Posição privilegiada na página</span></li>
                <li className="flex items-start gap-2"><Check className="h-4 w-4 text-ms-primary-blue mt-0.5" /><span>Confirmação por e-mail em breve</span></li>
              </ul>
            </div>

            <div className="space-y-3 pt-4">
              {eventData && (
                <Button size="lg" className="w-full max-w-sm" onClick={handleViewEvent}>
                  <Calendar className="h-4 w-4 mr-2" /> Ver Meu Evento <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
              <Button variant="outline" size="lg" className="w-full max-w-sm" onClick={() => navigate('/descubrams/eventos')}>
                Ver Todos os Eventos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </UniversalLayout>
  );
}
