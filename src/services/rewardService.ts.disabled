import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, Tables } from '@/integrations/supabase/types';

export interface Reward {
  id: string;
  name: string;
  description?: string;
  type: string;
  criteria: any; // Critérios para atribuição (ex: { type: "checkin_count", count: 5 })
  local_resgate?: string; // Opcional: Onde a recompensa pode ser retirada/usufruída
  instrucoes_resgate?: string; // Opcional: Instruções detalhadas para resgate
  active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  source?: string;
  external_id?: string;
}

export interface UserReward {
  id: string;
  user_id: string;
  reward_id: string;
  received_at: string;
  reason?: string;
  source?: string;
  external_id?: string;
}

const rewardService = {
  // Listar recompensas
  async listRewards(activeOnly = true): Promise<Reward[]> {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('active', activeOnly);
    if (error) throw error;
    return data || [];
  },

  // Cadastrar nova recompensa
  async createReward(reward: TablesInsert<'rewards'>): Promise<Reward> {
    const { data, error } = await supabase
      .from('rewards')
      .insert([reward])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Editar recompensa
  async updateReward(id: string, updates: Partial<TablesInsert<'rewards'>>): Promise<Reward> {
    const { data, error } = await supabase
      .from('rewards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Listar recompensas recebidas por usuário
  async listUserRewards(userId: string): Promise<UserReward[]> {
    const { data, error } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data || [];
  },

  // Atribuir recompensa a usuário
  async assignRewardToUser(userId: string, rewardId: string, reason?: string): Promise<UserReward> {
    const { data, error } = await supabase
      .from('user_rewards')
      .insert([
        {
          user_id: userId,
          reward_id: rewardId,
          reason,
        } as TablesInsert<'user_rewards'>,
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Verificar se usuário já recebeu determinada recompensa
  async hasUserReceivedReward(userId: string, rewardId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_rewards')
      .select('id')
      .eq('user_id', userId)
      .eq('reward_id', rewardId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  },
};

export default rewardService; 