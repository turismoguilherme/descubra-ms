import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, TablesUpdate, Tables } from '@/integrations/supabase/types';
import { UserProfile } from '@/types/auth';

// Definições de tipo para Recompensa e Recompensa do Usuário
export type Reward = Tables<'rewards'> & {
  id: string;
  name: string;
  description?: string | null;
  type: string; // Ex: 'badge', 'discount', 'gift'
  criteria: object; // JSONB para critérios
  active: boolean;
  local_resgate?: string | null;
  instrucoes_resgate?: string | null;
};

export type UserReward = Tables<'user_rewards'> & {
  reward?: Reward; // Usado para popular os detalhes da recompensa no Passaporte Digital
};

export const rewardService = {
  // Criar uma nova recompensa
  async createReward(reward: TablesInsert<'rewards'>): Promise<Reward> {
    const { data, error } = await supabase
      .from('rewards')
      .insert(reward)
      .select()
      .single();
    if (error) throw error;
    return data as Reward;
  },

  // Obter todas as recompensas
  async getAllRewards(): Promise<Reward[]> {
    const { data, error } = await supabase
      .from('rewards')
      .select('*');
    if (error) throw error;
    return data as Reward[];
  },

  // Obter uma recompensa por ID
  async getRewardById(id: string): Promise<Reward | null> {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as Reward | null;
  },

  // Atualizar uma recompensa existente
  async updateReward(id: string, updates: TablesUpdate<'rewards'>): Promise<Reward> {
    const { data, error } = await supabase
      .from('rewards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Reward;
  },

  // Deletar uma recompensa
  async deleteReward(id: string): Promise<void> {
    const { error } = await supabase
      .from('rewards')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Obter recompensas de um usuário específico
  async getUserRewards(userId: string): Promise<UserReward[]> {
    const { data, error } = await supabase
      .from('user_rewards')
      .select(`
        id,
        received_at,
        reason,
        reward:rewards (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data as UserReward[];
  },

  // Atribuir uma recompensa manualmente a um usuário
  async assignRewardToUser(rewardId: string, userId: string, reason?: string): Promise<UserReward> {
    const { data, error } = await supabase
      .from('user_rewards')
      .insert({
        reward_id: rewardId,
        user_id: userId,
        reason: reason || 'Atribuição manual',
      })
      .select()
      .single();
    if (error) throw error;
    return data as UserReward;
  },
}; 