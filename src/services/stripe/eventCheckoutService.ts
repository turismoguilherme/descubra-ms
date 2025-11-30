import { supabase } from '@/integrations/supabase/client';

interface EventCheckoutParams {
  eventId: string;
  eventName: string;
  organizerEmail: string;
  organizerName?: string;
}

interface CheckoutResponse {
  success: boolean;
  checkoutUrl?: string;
  sessionId?: string;
  error?: string;
}

/**
 * Cria uma sessão de checkout do Stripe para evento "Em Destaque"
 * Preço: R$ 499,90
 */
export async function createEventCheckout(params: EventCheckoutParams): Promise<CheckoutResponse> {
  try {
    const { eventId, eventName, organizerEmail, organizerName } = params;

    // Chamar Edge Function
    const { data, error } = await supabase.functions.invoke('event-checkout', {
      body: {
        eventId,
        eventName,
        organizerEmail,
        organizerName,
        successUrl: `${window.location.origin}/descubramatogrossodosul/eventos?payment=success&event_id=${eventId}`,
        cancelUrl: `${window.location.origin}/descubramatogrossodosul/cadastrar-evento?payment=cancelled`,
      },
    });

    if (error) {
      console.error('Erro ao criar checkout:', error);
      return {
        success: false,
        error: error.message || 'Erro ao criar sessão de pagamento',
      };
    }

    if (data?.checkoutUrl) {
      return {
        success: true,
        checkoutUrl: data.checkoutUrl,
        sessionId: data.sessionId,
      };
    }

    return {
      success: false,
      error: 'URL de checkout não retornada',
    };

  } catch (error: any) {
    console.error('Erro no checkout de evento:', error);
    return {
      success: false,
      error: error.message || 'Erro inesperado',
    };
  }
}

/**
 * Redireciona para o checkout do Stripe
 */
export async function redirectToEventCheckout(params: EventCheckoutParams): Promise<void> {
  const result = await createEventCheckout(params);

  if (result.success && result.checkoutUrl) {
    window.location.href = result.checkoutUrl;
  } else {
    throw new Error(result.error || 'Não foi possível iniciar o pagamento');
  }
}

/**
 * Verifica status do pagamento de um evento
 */
export async function checkEventPaymentStatus(eventId: string): Promise<{
  isPaid: boolean;
  status: string;
}> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('is_sponsored, sponsor_payment_status')
      .eq('id', eventId)
      .single();

    if (error) throw error;

    return {
      isPaid: data?.sponsor_payment_status === 'paid',
      status: data?.sponsor_payment_status || 'unknown',
    };

  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    return {
      isPaid: false,
      status: 'error',
    };
  }
}

