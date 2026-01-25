import { supabase } from '@/integrations/supabase/client';

type NotificationType = 
  | 'event_approved'
  | 'event_rejected'
  | 'event_payment_confirmed'
  | 'partner_approved'
  | 'partner_rejected'
  | 'partner_notification'
  | 'welcome'
  | 'data_report_ready'
  | 'data_report_approved';

interface SendEmailParams {
  type: NotificationType;
  to: string;
  data: Record<string, any>;
  reply_to?: string; // Opcional: endereço para respostas
}

/**
 * Envia email de notificação via Edge Function
 */
export async function sendNotificationEmail(params: SendEmailParams): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('send-notification-email', {
      body: params,
    });

    if (error) {
      // Log do erro mas não interrompe o fluxo - email é opcional
      console.warn('Aviso: Não foi possível enviar email de notificação:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: data?.message || 'Email enviado',
    };

  } catch (error: any) {
    // Log do erro mas não interrompe o fluxo - email é opcional
    console.warn('Aviso: Erro no serviço de email (não crítico):', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Notifica organizador que evento foi aprovado
 */
export async function notifyEventApproved(params: {
  organizerEmail: string;
  organizerName?: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventId?: string;
}) {
  return sendNotificationEmail({
    type: 'event_approved',
    to: params.organizerEmail,
    data: {
      organizerName: params.organizerName,
      eventName: params.eventName,
      eventDate: params.eventDate,
      eventLocation: params.eventLocation,
      eventId: params.eventId,
    },
  });
}

/**
 * Notifica organizador que evento foi rejeitado
 */
export async function notifyEventRejected(params: {
  organizerEmail: string;
  organizerName?: string;
  eventName: string;
  reason?: string;
  eventId?: string;
}) {
  return sendNotificationEmail({
    type: 'event_rejected',
    to: params.organizerEmail,
    data: {
      organizerName: params.organizerName,
      eventName: params.eventName,
      reason: params.reason,
      eventId: params.eventId,
    },
  });
}

/**
 * Notifica parceiro que foi aprovado
 */
export async function notifyPartnerApproved(params: {
  partnerEmail: string;
  partnerName: string;
}) {
  return sendNotificationEmail({
    type: 'partner_approved',
    to: params.partnerEmail,
    data: {
      partnerName: params.partnerName,
    },
  });
}

/**
 * Notifica parceiro que foi rejeitado
 */
export async function notifyPartnerRejected(params: {
  partnerEmail: string;
  partnerName: string;
  reason?: string;
}) {
  return sendNotificationEmail({
    type: 'partner_rejected',
    to: params.partnerEmail,
    data: {
      partnerName: params.partnerName,
      reason: params.reason,
    },
  });
}

