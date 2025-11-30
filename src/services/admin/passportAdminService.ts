import { supabase } from '@/integrations/supabase/client';
import type {
  PassportConfiguration,
  PassportReward,
  RouteCheckpointExtended,
} from '@/types/passportDigital';

class PassportAdminService {
  /**
   * CONFIGURAÇÕES DE PASSAPORTE
   */

  async getConfigurations(): Promise<PassportConfiguration[]> {
    const { data, error } = await supabase
      .from('passport_configurations')
      .select('*, routes(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as PassportConfiguration[];
  }

  async getConfiguration(routeId: string): Promise<PassportConfiguration | null> {
    const { data, error } = await supabase
      .from('passport_configurations')
      .select('*, routes(*)')
      .eq('route_id', routeId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as PassportConfiguration | null;
  }

  async createConfiguration(
    config: Omit<PassportConfiguration, 'id' | 'created_at' | 'updated_at'>
  ): Promise<PassportConfiguration> {
    const { data, error } = await supabase
      .from('passport_configurations')
      .insert(config)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateConfiguration(
    routeId: string,
    updates: Partial<PassportConfiguration>
  ): Promise<PassportConfiguration> {
    const { data, error } = await supabase
      .from('passport_configurations')
      .update(updates)
      .eq('route_id', routeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteConfiguration(routeId: string): Promise<void> {
    const { error } = await supabase
      .from('passport_configurations')
      .delete()
      .eq('route_id', routeId);

    if (error) throw error;
  }

  /**
   * RECOMPENSAS
   */

  async getRewards(routeId?: string): Promise<PassportReward[]> {
    let query = supabase
      .from('passport_rewards')
      .select('*, routes(*)')
      .order('created_at', { ascending: false });

    if (routeId) {
      query = query.eq('route_id', routeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as PassportReward[];
  }

  async getReward(rewardId: string): Promise<PassportReward | null> {
    const { data, error } = await supabase
      .from('passport_rewards')
      .select('*, routes(*)')
      .eq('id', rewardId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as PassportReward | null;
  }

  async createReward(
    reward: Omit<PassportReward, 'id' | 'created_at' | 'updated_at'>
  ): Promise<PassportReward> {
    const { data, error } = await supabase
      .from('passport_rewards')
      .insert(reward)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateReward(
    rewardId: string,
    updates: Partial<PassportReward>
  ): Promise<PassportReward> {
    const { data, error } = await supabase
      .from('passport_rewards')
      .update(updates)
      .eq('id', rewardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteReward(rewardId: string): Promise<void> {
    const { error } = await supabase
      .from('passport_rewards')
      .delete()
      .eq('id', rewardId);

    if (error) throw error;
  }

  /**
   * CHECKPOINTS
   */

  async updateCheckpoint(
    checkpointId: string,
    updates: Partial<RouteCheckpointExtended>
  ): Promise<RouteCheckpointExtended> {
    const { data, error } = await supabase
      .from('route_checkpoints')
      .update(updates)
      .eq('id', checkpointId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * ESTATÍSTICAS
   */

  async getStatistics(routeId?: string): Promise<{
    total_users: number;
    completed_routes: number;
    total_checkins: number;
    rewards_unlocked: number;
  }> {
    // Total de usuários com passaporte
    const { count: totalUsers } = await supabase
      .from('user_passports')
      .select('*', { count: 'exact', head: true });

    // Rotas completadas
    let routesQuery = supabase
      .from('passport_stamps')
      .select('route_id, user_id', { count: 'exact' });

    if (routeId) {
      routesQuery = routesQuery.eq('route_id', routeId);
    }

    const { count: totalCheckins } = await routesQuery;

    // Recompensas desbloqueadas
    const { count: rewardsUnlocked } = await supabase
      .from('user_rewards')
      .select('*', { count: 'exact', head: true });

    // Calcular rotas completadas (usuários que completaram todos os checkpoints de uma rota)
    // Isso requer uma query mais complexa, simplificando por enquanto
    const completedRoutes = 0; // TODO: Implementar cálculo correto

    return {
      total_users: totalUsers || 0,
      completed_routes: completedRoutes,
      total_checkins: totalCheckins || 0,
      rewards_unlocked: rewardsUnlocked || 0,
    };
  }

  /**
   * ROTAS
   */

  async updateRoute(
    routeId: string,
    updates: { video_url?: string; passport_number_prefix?: string }
  ): Promise<void> {
    const { error } = await supabase
      .from('routes')
      .update(updates)
      .eq('id', routeId);

    if (error) throw error;
  }
}

export const passportAdminService = new PassportAdminService();

