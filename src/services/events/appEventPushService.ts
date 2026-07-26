import { supabase } from '@/integrations/supabase/client';

/**
 * Dispara push do app (Guatá → eventos na cidade do GPS).
 * Falhas não bloqueiam o fluxo admin.
 */
export async function notifyAppEventPush(options: {
  eventId: string;
  kind?: 'event_new' | 'event_reminder';
}): Promise<void> {
  const { eventId, kind = 'event_new' } = options;
  try {
    const { error } = await supabase.functions.invoke('dispatch-event-push', {
      body: { event_id: eventId, kind },
    });
    if (error) {
      console.warn('[App Push] não enviado:', error.message);
      return;
    }
    console.log(`[App Push] evento ${kind}:`, eventId);
  } catch (err) {
    console.warn('[App Push] erro (não crítico):', err);
  }
}
