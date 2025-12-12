import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/admin';

export const viajarAdminService = {
  // Employees
  async getEmployees() {
    const { data, error } = await supabase
      .from('viajar_employees')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createEmployee(employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('viajar_employees')
      .insert([employee])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateEmployee(id: string, updates: Partial<Employee>) {
    const { data, error } = await supabase
      .from('viajar_employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteEmployee(id: string) {
    const { error } = await supabase
      .from('viajar_employees')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Clients
  async getClients() {
    const { data, error } = await supabase
      .from('flowtrip_clients')
      .select(`
        *,
        subscriptions:flowtrip_subscriptions(
          id,
          plan_name,
          status,
          current_period_end
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      // Se a tabela não existir, retornar array vazio
      if (error.code === 'PGRST204' || error.message?.includes('does not exist')) {
        console.warn('Tabela flowtrip_clients não encontrada, retornando array vazio');
        return [];
      }
      throw error;
    }
    return data || [];
  },

  async updateClient(id: string, updates: any) {
    const { data, error } = await supabase
      .from('flowtrip_clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Subscriptions
  async getSubscriptions() {
    const { data, error } = await supabase
      .from('flowtrip_subscriptions')
      .select(`
        *,
        client:flowtrip_clients(
          id,
          company_name,
          contact_email
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      // Se a tabela não existir, retornar array vazio
      if (error.code === 'PGRST204' || error.message?.includes('does not exist')) {
        console.warn('Tabela flowtrip_subscriptions não encontrada, retornando array vazio');
        return [];
      }
      throw error;
    }
    return data || [];
  },

  async updateSubscription(id: string, updates: any) {
    const { data, error } = await supabase
      .from('flowtrip_subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async cancelSubscription(id: string) {
    const { data, error } = await supabase
      .from('flowtrip_subscriptions')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

