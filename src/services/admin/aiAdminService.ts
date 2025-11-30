import { supabase } from '@/integrations/supabase/client';
import { AIAdminAction } from '@/types/admin';

export const aiAdminService = {
  async getActions(status?: AIAdminAction['status']) {
    let query = supabase
      .from('ai_admin_actions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  async approveAction(id: string, approvedBy: string) {
    const { data, error } = await supabase
      .from('ai_admin_actions')
      .update({
        status: 'approved',
        approved_by: approvedBy,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async rejectAction(id: string) {
    const { data, error } = await supabase
      .from('ai_admin_actions')
      .update({
        status: 'rejected',
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async executeAction(id: string) {
    // Marcar ação como executada
    const { data, error } = await supabase
      .from('ai_admin_actions')
      .update({
        status: 'executed',
        executed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async createSuggestion(description: string, platform: 'viajar' | 'descubra_ms' | 'both', actionType: 'monitor' | 'analyze' | 'suggest' | 'execute') {
    const { data, error } = await supabase
      .from('ai_admin_actions')
      .insert([{
        action_type: actionType,
        platform,
        description,
        status: 'pending',
        requires_approval: actionType === 'execute',
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

