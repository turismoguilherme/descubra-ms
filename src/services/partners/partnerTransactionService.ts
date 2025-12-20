import { supabase } from '@/integrations/supabase/client';

export interface PartnerTransaction {
  id: string;
  partner_id: string;
  transaction_type: 'subscription_payment' | 'commission' | 'refund' | 'payout' | 'adjustment';
  amount: number;
  description: string;
  stripe_invoice_id?: string;
  stripe_payment_intent_id?: string;
  stripe_subscription_id?: string;
  reservation_id?: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  paid_date?: string;
  due_date?: string;
  currency: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface TransactionFilters {
  type?: PartnerTransaction['transaction_type'];
  status?: PartnerTransaction['status'];
  startDate?: string;
  endDate?: string;
}

/**
 * Serviço para gerenciar histórico de transações do parceiro
 */
export class PartnerTransactionService {
  /**
   * Buscar todas as transações do parceiro
   */
  static async getTransactions(
    partnerId: string,
    filters?: TransactionFilters
  ): Promise<PartnerTransaction[]> {
    try {
      let query = supabase
        .from('partner_transactions')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('transaction_type', filters.type);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error('Erro ao buscar transações:', error);
      throw error;
    }
  }

  /**
   * Buscar resumo financeiro (total recebido, pendente, etc)
   */
  static async getFinancialSummary(partnerId: string) {
    try {
      const { data, error } = await supabase
        .from('partner_transactions')
        .select('transaction_type, status, amount')
        .eq('partner_id', partnerId);

      if (error) throw error;

      const summary = {
        totalReceived: 0,
        totalPending: 0,
        totalCommissions: 0,
        totalSubscriptionPayments: 0,
        totalPayouts: 0,
      };

      data?.forEach((transaction) => {
        if (transaction.status === 'paid') {
          summary.totalReceived += transaction.amount;
        } else if (transaction.status === 'pending') {
          summary.totalPending += transaction.amount;
        }

        if (transaction.transaction_type === 'commission' && transaction.status === 'paid') {
          summary.totalCommissions += transaction.amount;
        }

        if (transaction.transaction_type === 'subscription_payment' && transaction.status === 'paid') {
          summary.totalSubscriptionPayments += Math.abs(transaction.amount); // Negativo (despesa)
        }

        if (transaction.transaction_type === 'payout' && transaction.status === 'paid') {
          summary.totalPayouts += Math.abs(transaction.amount); // Negativo (saída)
        }
      });

      return summary;
    } catch (error: any) {
      console.error('Erro ao buscar resumo financeiro:', error);
      throw error;
    }
  }

  /**
   * Criar transação (usado por webhooks e serviços internos)
   */
  static async createTransaction(transaction: Omit<PartnerTransaction, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('partner_transactions')
        .insert(transaction)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Erro ao criar transação:', error);
      throw error;
    }
  }
}
