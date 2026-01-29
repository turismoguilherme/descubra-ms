import { supabase } from '@/integrations/supabase/client';

export interface ReservationMessage {
  id: string;
  reservation_id: string;
  sender_type: 'guest' | 'partner' | 'system';
  sender_id?: string;
  sender_name: string;
  sender_email?: string;
  message: string;
  read: boolean;
  read_at?: string;
  attachments?: string[];
  created_at: string;
}

/**
 * Serviço para gerenciar mensagens entre cliente e parceiro
 */
export class ReservationMessageService {
  /**
   * Buscar mensagens de uma reserva
   */
  static async getMessages(reservationId: string): Promise<ReservationMessage[]> {
    try {
      const { data, error } = await supabase
        .from('reservation_messages')
        .select('*')
        .eq('reservation_id', reservationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao buscar mensagens:', err);
      throw error;
    }
  }

  /**
   * Enviar mensagem (cliente ou parceiro)
   */
  static async sendMessage(
    reservationId: string,
    senderType: 'guest' | 'partner',
    senderId: string,
    senderName: string,
    senderEmail: string,
    message: string,
    attachments?: string[]
  ): Promise<ReservationMessage> {
    try {
      const { data, error } = await supabase
        .from('reservation_messages')
        .insert({
          reservation_id: reservationId,
          sender_type: senderType,
          sender_id: senderId,
          sender_name: senderName,
          sender_email: senderEmail,
          message,
          attachments: attachments || [],
          read: false,
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao enviar mensagem:', err);
      throw error;
    }
  }

  /**
   * Marcar mensagens como lidas
   */
  static async markAsRead(reservationId: string, senderType: 'guest' | 'partner'): Promise<void> {
    try {
      // Marcar como lidas apenas as mensagens do outro lado
      const oppositeType = senderType === 'guest' ? 'partner' : 'guest';

      const { error } = await supabase
        .from('reservation_messages')
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq('reservation_id', reservationId)
        .eq('sender_type', oppositeType)
        .eq('read', false);

      if (error) throw error;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao marcar mensagens como lidas:', err);
      throw error;
    }
  }

  /**
   * Contar mensagens não lidas
   */
  static async getUnreadCount(reservationId: string, forPartner: boolean): Promise<number> {
    try {
      const senderType = forPartner ? 'guest' : 'partner';

      const { count, error } = await supabase
        .from('reservation_messages')
        .select('*', { count: 'exact', head: true })
        .eq('reservation_id', reservationId)
        .eq('sender_type', senderType)
        .eq('read', false);

      if (error) throw error;

      return count || 0;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao contar mensagens não lidas:', err);
      return 0;
    }
  }
}
