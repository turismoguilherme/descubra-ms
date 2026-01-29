import { supabase } from '@/integrations/supabase/client';
import { sendNotificationEmail } from '@/services/email/notificationEmailService';

export interface PartnerNotification {
  id: string;
  partner_id: string;
  type: 'new_reservation' | 'reservation_confirmed' | 'reservation_cancelled' | 'commission_paid' | 'subscription_payment' | 'subscription_expiring' | 'payout_completed' | 'system_alert';
  title: string;
  message: string;
  reservation_id?: string;
  transaction_id?: string;
  read: boolean;
  read_at?: string;
  email_sent: boolean;
  email_sent_at?: string;
  action_url?: string;
  action_label?: string;
  metadata?: any;
  created_at: string;
}

/**
 * Serviço para gerenciar notificações de parceiros
 */
export class PartnerNotificationService {
  /**
   * Criar notificação e enviar email (se configurado)
   */
  static async createNotification(
    partnerId: string,
    type: PartnerNotification['type'],
    title: string,
    message: string,
    options?: {
      reservationId?: string;
      transactionId?: string;
      actionUrl?: string;
      actionLabel?: string;
      metadata?: any;
      sendEmail?: boolean;
      partnerEmail?: string;
    }
  ): Promise<PartnerNotification> {
    try {
      // Criar notificação no banco
      const { data: notification, error } = await supabase
        .from('partner_notifications')
        .insert({
          partner_id: partnerId,
          type,
          title,
          message,
          reservation_id: options?.reservationId,
          transaction_id: options?.transactionId,
          action_url: options?.actionUrl,
          action_label: options?.actionLabel,
          metadata: options?.metadata || {},
          email_sent: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Enviar email se solicitado
      if (options?.sendEmail && options?.partnerEmail) {
        try {
          await sendNotificationEmail({
            type: 'partner_notification',
            to: options.partnerEmail,
            data: {
              title,
              message,
              type,
              reservationId: options.reservationId,
              actionUrl: options.actionUrl,
            },
          });

          // Marcar email como enviado
          await supabase
            .from('partner_notifications')
            .update({
              email_sent: true,
              email_sent_at: new Date().toISOString(),
            })
            .eq('id', notification.id);
        } catch (emailError) {
          console.warn('Erro ao enviar email (não crítico):', emailError);
          // Não falha a criação da notificação se email falhar
        }
      }

      return notification;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao criar notificação:', err);
      throw error;
    }
  }

  /**
   * Buscar notificações do parceiro
   */
  static async getNotifications(
    partnerId: string,
    unreadOnly: boolean = false
  ): Promise<PartnerNotification[]> {
    try {
      let query = supabase
        .from('partner_notifications')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('read', false);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao buscar notificações:', err);
      throw error;
    }
  }

  /**
   * Marcar notificação como lida
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('partner_notifications')
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao marcar notificação como lida:', err);
      throw error;
    }
  }

  /**
   * Marcar todas como lidas
   */
  static async markAllAsRead(partnerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('partner_notifications')
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq('partner_id', partnerId)
        .eq('read', false);

      if (error) throw error;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao marcar todas como lidas:', err);
      throw error;
    }
  }

  /**
   * Contar notificações não lidas
   */
  static async getUnreadCount(partnerId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('partner_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('partner_id', partnerId)
        .eq('read', false);

      if (error) throw error;

      return count || 0;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao contar notificações não lidas:', err);
      return 0;
    }
  }
}
