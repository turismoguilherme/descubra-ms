import { supabase } from '@/integrations/supabase/client';
import { PaymentReconciliation } from '@/types/admin';

export const financialService = {
  async getPayments() {
    const { data, error } = await supabase
      .from('payment_reconciliation')
      .select(`
        *,
        subscription:flowtrip_subscriptions(
          id,
          client_id,
          master_clients(
            id,
            company_name,
            contact_email
          )
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async reconcilePayment(id: string, reconciledBy: string, notes?: string) {
    const { data, error } = await supabase
      .from('payment_reconciliation')
      .update({
        reconciled: true,
        reconciled_by: reconciledBy,
        reconciled_at: new Date().toISOString(),
        notes,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async syncStripePayments() {
    try {
      // Chamar edge function para sincronizar pagamentos do Stripe
      const { data, error } = await supabase.functions.invoke('stripe-sync-payments', {
        body: {},
      });

      if (error) throw error;
      return data;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`Erro ao sincronizar pagamentos: ${err.message}`);
    }
  },

  async getFinancialSummary(startDate?: string, endDate?: string) {
    let query = supabase
      .from('payment_reconciliation')
      .select('amount, status, reconciled, payment_date');

    if (startDate) {
      query = query.gte('payment_date', startDate);
    }
    if (endDate) {
      query = query.lte('payment_date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const summary = {
      total: data?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0,
      paid: data?.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0,
      pending: data?.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0,
      failed: data?.filter(p => p.status === 'failed').reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0,
      reconciled: data?.filter(p => p.reconciled).reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0,
      unreconciled: data?.filter(p => !p.reconciled && p.status === 'paid').reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0,
      count: {
        total: data?.length || 0,
        paid: data?.filter(p => p.status === 'paid').length || 0,
        pending: data?.filter(p => p.status === 'pending').length || 0,
        failed: data?.filter(p => p.status === 'failed').length || 0,
      },
    };

    return summary;
  },

  async exportPayments(format: 'csv' | 'json') {
    const payments = await this.getPayments();
    
    if (format === 'csv') {
      const headers = ['ID', 'Stripe Payment ID', 'Valor', 'Status', 'Data', 'Reconciliado', 'Cliente'];
      const rows = payments.map(p => [
        p.id,
        p.stripe_payment_id || '',
        p.amount?.toString() || '0',
        p.status,
        p.payment_date || '',
        p.reconciled ? 'Sim' : 'Não',
        (p as any).subscription?.master_clients?.company_name || '',
      ]);
      
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      return csv;
    } else {
      return JSON.stringify(payments, null, 2);
    }
  },
};

