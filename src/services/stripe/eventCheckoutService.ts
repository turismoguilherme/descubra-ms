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

export async function createEventCheckout(params: EventCheckoutParams): Promise<CheckoutResponse> {
  try {
    const { eventId, eventName, organizerEmail, organizerName } = params;

    const { data, error } = await supabase.functions.invoke('event-checkout', {
      body: {
        eventId,
        eventName,
        organizerEmail,
        organizerName,
        successUrl: `${window.location.origin}/descubrams/eventos?payment=success&event_id=${eventId}`,
        cancelUrl: `${window.location.origin}/descubrams/cadastrar-evento?payment=cancelled`,
      },
    });

    if (error) {
      return { success: false, error: error.message || 'Erro ao criar sessão de pagamento' };
    }

    if (data?.checkoutUrl) {
      return { success: true, checkoutUrl: data.checkoutUrl, sessionId: data.sessionId };
    }

    return { success: false, error: 'URL de checkout não retornada' };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    return { success: false, error: err.message || 'Erro inesperado' };
  }
}

export async function redirectToEventCheckout(params: EventCheckoutParams): Promise<void> {
  const result = await createEventCheckout(params);
  if (result.success && result.checkoutUrl) {
    window.location.href = result.checkoutUrl;
  } else {
    throw new Error(result.error || 'Não foi possível iniciar o pagamento');
  }
}

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

    const eventData = data as any;
    return {
      isPaid: eventData?.sponsor_payment_status === 'paid',
      status: eventData?.sponsor_payment_status || 'unknown',
    };
  } catch {
    return { isPaid: false, status: 'error' };
  }
}
