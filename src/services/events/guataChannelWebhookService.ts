import { supabase } from '@/integrations/supabase/client';

export type GuataChannelAction = 'published' | 'approved' | 'rejected';

interface NotifyGuataChannelOptions {
  eventId: string;
  action?: GuataChannelAction;
  rejectionReason?: string;
}

/**
 * Notifica o Guatá Channel (WhatsApp) sobre eventos do Descubra MS.
 * - published: divulga evento no canal/bot
 * - approved / rejected: avisa o organizador via chatbot (quando há telefone)
 * Falhas são não-críticas — apenas logadas.
 */
export async function notifyGuataChannelEvent(
  options: NotifyGuataChannelOptions,
): Promise<void> {
  const { eventId, action = 'published', rejectionReason } = options;

  try {
    const { data, error } = await supabase.functions.invoke('notify-guata-channel-event', {
      body: {
        event_id: eventId,
        action,
        rejection_reason: rejectionReason,
      },
    });

    if (error) {
      console.warn('[Guatá Channel] Webhook não enviado:', error.message);
      return;
    }

    if (data?.skipped) {
      console.info('[Guatá Channel] Webhook ignorado (secrets não configurados no Supabase).');
      return;
    }

    console.log(`[Guatá Channel] Evento notificado (${action}):`, eventId);
  } catch (err) {
    console.warn('[Guatá Channel] Erro ao notificar evento (não crítico):', err);
  }
}

/** @deprecated Use notifyGuataChannelEvent({ eventId, action: 'published' }) */
export async function notifyGuataChannelEventPublished(eventId: string): Promise<void> {
  return notifyGuataChannelEvent({ eventId, action: 'published' });
}

export async function notifyGuataChannelEventApproved(eventId: string): Promise<void> {
  return notifyGuataChannelEvent({ eventId, action: 'approved' });
}

export async function notifyGuataChannelEventRejected(
  eventId: string,
  rejectionReason?: string,
): Promise<void> {
  return notifyGuataChannelEvent({ eventId, action: 'rejected', rejectionReason });
}
