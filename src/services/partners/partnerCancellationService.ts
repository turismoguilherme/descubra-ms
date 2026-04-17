import { supabase } from '@/integrations/supabase/client';
import { addAdminNotification } from '@/components/admin/notifications/AdminNotifications';

interface CancelPartnershipParams {
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  reason?: string;
}

/**
 * Cancelamento voluntário: chama edge (Stripe + regras de reembolso) e notifica o admin.
 */
export async function cancelPartnership(params: CancelPartnershipParams) {
  try {
    const { data: fnData, error: fnError } = await supabase.functions.invoke('partner-voluntary-cancel', {
      body: {
        partnerId: params.partnerId,
        reason: params.reason?.trim() || null,
      },
    });

    if (fnError) {
      throw new Error(fnError.message || 'Erro ao processar cancelamento');
    }

    const payload = fnData as {
      error?: string;
      success?: boolean;
      mode?: string;
      accessUntil?: string;
      refundNote?: string | null;
      refundId?: string | null;
    } | undefined;

    if (payload?.error) {
      throw new Error(payload.error);
    }

    addAdminNotification({
      type: 'warning',
      title: 'Parceiro solicitou cancelamento',
      message: `${params.partnerName} (${params.partnerEmail}) iniciou cancelamento voluntário.${
        params.reason ? ` Motivo: ${params.reason}` : ''
      }${payload?.mode === 'end_of_period' && payload.accessUntil ? ` Acesso até ${new Date(payload.accessUntil).toLocaleDateString('pt-BR')}.` : ''}`,
      action: {
        label: 'Ver Parceiros',
        onClick: () => {
          window.location.href = '/admin/partners';
        },
      },
    });

    try {
      await supabase.from('admin_notifications').insert({
        type: 'partner_cancellation',
        title: 'Parceiro solicitou cancelamento',
        message: `${params.partnerName} (${params.partnerEmail}) — modo ${payload?.mode || '?'}.${params.reason ? ` Motivo: ${params.reason}` : ''}`,
        metadata: {
          partner_id: params.partnerId,
          partner_name: params.partnerName,
          partner_email: params.partnerEmail,
          reason: params.reason,
          access_until: payload?.accessUntil ?? null,
          timestamp: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      });
    } catch (dbError) {
      console.warn('Não foi possível salvar notificação no banco (não crítico):', dbError);
    }

    return {
      success: true,
      error: null as string | null,
      payload: {
        mode: payload?.mode,
        accessUntil: payload?.accessUntil,
        refundNote: payload?.refundNote ?? null,
        refundId: payload?.refundId ?? null,
      },
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Erro ao cancelar parceria:', err);
    return { success: false, error: err.message || 'Erro ao cancelar parceria', payload: undefined };
  }
}
