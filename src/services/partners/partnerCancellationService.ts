import { supabase } from '@/integrations/supabase/client';
import { addAdminNotification } from '@/components/admin/notifications/AdminNotifications';

interface CancelPartnershipParams {
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  reason?: string;
}

/**
 * Serviço para cancelamento de parceria
 * Atualiza o status do parceiro e notifica o admin
 */
export async function cancelPartnership(params: CancelPartnershipParams) {
  try {
    // 1. Atualizar status do parceiro
    const { error: updateError } = await supabase
      .from('institutional_partners')
      .update({
        status: 'cancelled',
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.partnerId);

    if (updateError) {
      throw new Error(`Erro ao atualizar parceiro: ${updateError.message}`);
    }

    // 2. Criar notificação para admin
    addAdminNotification({
      type: 'warning',
      title: 'Parceiro Solicitou Cancelamento',
      message: `${params.partnerName} (${params.partnerEmail}) solicitou o cancelamento da parceria.${params.reason ? ` Motivo: ${params.reason}` : ''}`,
      action: {
        label: 'Ver Parceiros',
        onClick: () => {
          window.location.href = '/admin/partners';
        }
      }
    });

    // 3. Tentar criar registro no banco (se houver tabela de notificações)
    try {
      const { error: notificationError } = await supabase
        .from('admin_notifications')
        .insert({
          type: 'partner_cancellation',
          title: 'Parceiro Solicitou Cancelamento',
          message: `${params.partnerName} (${params.partnerEmail}) solicitou o cancelamento da parceria.${params.reason ? ` Motivo: ${params.reason}` : ''}`,
          metadata: {
            partner_id: params.partnerId,
            partner_name: params.partnerName,
            partner_email: params.partnerEmail,
            reason: params.reason,
            timestamp: new Date().toISOString()
          },
          created_at: new Date().toISOString()
        });

      if (notificationError) {
        console.warn('Não foi possível salvar notificação no banco (não crítico):', notificationError);
      }
    } catch (dbError) {
      console.warn('Tabela de notificações pode não existir (não crítico):', dbError);
    }

    return { success: true, error: null };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Erro ao cancelar parceria:', err);
    return { success: false, error: err.message || 'Erro ao cancelar parceria' };
  }
}
