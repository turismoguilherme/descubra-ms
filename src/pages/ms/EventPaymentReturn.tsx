/**
 * Página Intermediária - Redirecionamento de Pagamento de Eventos
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getErrorMessage } from '@/utils/errorUtils';

export default function EventPaymentReturn() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const processReturn = async () => {
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

        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('return_domain, titulo')
          .eq('id', eventId)
          .single();

        if (eventError) console.error('Erro ao buscar evento:', eventError);

        let returnDomain = (eventData as any)?.return_domain;
        
        if (!returnDomain) {
          const currentHostname = window.location.hostname.toLowerCase();
          returnDomain = currentHostname.includes('viajartur') ? 'https://viajartur.com' : 'https://descubrams.com';
        }

        if (!returnDomain.startsWith('http://') && !returnDomain.startsWith('https://')) {
          returnDomain = `https://${returnDomain}`;
        }

        const successUrl = `${returnDomain}/descubrams/eventos/payment-success?session_id=${sessionId}`;
        window.location.href = successUrl;
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Erro ao processar pagamento'));
        setLoading(false);
      }
    };

    processReturn();
  }, [sessionId]);

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
                <h2 className="text-2xl font-bold text-gray-900">Erro ao processar pagamento</h2>
                <p className="text-gray-600">{error}</p>
              </div>
              <a href="/descubrams/eventos" className="block w-full px-4 py-2 bg-ms-primary-blue text-white rounded-lg hover:bg-ms-primary-blue/90 text-center">
                Voltar para Eventos
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue/5 via-white to-ms-discovery-teal/5 flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-ms-primary-blue/20">
        <CardContent className="pt-12 pb-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-ms-primary-blue mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Processando pagamento...</h2>
              <p className="text-gray-600 mt-2">Aguarde enquanto redirecionamos você</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
