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
    console.log('🔵 [PassportAdminService] ========== getConfigurations ==========');
    try {
      const { data, error } = await supabase
        .from('passport_configurations')
        .select('*, routes(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [PassportAdminService] Erro ao buscar configurações:', error);
        throw error;
      }
      console.log('✅ [PassportAdminService] Configurações encontradas:', data?.length || 0);
      return (data || []) as PassportConfiguration[];
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const supabaseError = error as { code?: string; details?: string; message?: string };
      console.error('❌ [PassportAdminService] Erro completo:', {
        message: supabaseError.message || err.message,
        code: supabaseError.code,
        details: supabaseError.details,
      });
      throw error;
    }
  }

  async getConfiguration(routeId: string): Promise<PassportConfiguration | null> {
    console.log('🔵 [PassportAdminService] ========== getConfiguration ==========');
    console.log('🔵 [PassportAdminService] Route ID:', routeId);
    try {
      const { data, error } = await supabase
        .from('passport_configurations')
        .select('*, routes(*)')
        .eq('route_id', routeId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [PassportAdminService] Erro ao buscar configuração:', error);
        throw error;
      }
      console.log('✅ [PassportAdminService] Configuração encontrada:', !!data);
      return data as PassportConfiguration | null;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const supabaseError = error as { code?: string; details?: string; message?: string };
      console.error('❌ [PassportAdminService] Erro completo:', {
        message: supabaseError.message || err.message,
        code: supabaseError.code,
        details: supabaseError.details,
      });
      throw error;
    }
  }

  async createConfiguration(
    config: Omit<PassportConfiguration, 'id' | 'created_at' | 'updated_at'>
  ): Promise<PassportConfiguration> {
    console.log('🔵 [PassportAdminService] ========== createConfiguration ==========');
    console.log('🔵 [PassportAdminService] Config data:', JSON.stringify(config, null, 2));
    try {
      const { data, error } = await supabase
        .from('passport_configurations')
        .insert(config)
        .select()
        .single();

      if (error) {
        console.error('❌ [PassportAdminService] Erro ao criar configuração:', error);
        
        // Verificar se é erro de coluna não encontrada (migração não executada)
        if (error.code === 'PGRST204' && error.message?.includes('require_sequential')) {
          const migrationError = new Error(
            'A migração do banco de dados não foi executada. A coluna "require_sequential" não existe na tabela "passport_configurations".\n\n' +
            'Para corrigir:\n' +
            '1. Acesse o Supabase Dashboard\n' +
            '2. Vá em SQL Editor\n' +
            '3. Execute a migração: supabase/migrations/20251226000001_add_require_sequential_to_passport_config.sql\n' +
            '4. Recarregue a página e tente novamente'
          );
          migrationError.name = 'MigrationRequiredError';
          throw migrationError;
        }
        
        throw error;
      }
      console.log('✅ [PassportAdminService] Configuração criada:', data?.id);
      return data;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const supabaseError = error as { code?: string; details?: string; message?: string };
      console.error('❌ [PassportAdminService] Erro completo:', {
        message: supabaseError.message || err.message,
        code: supabaseError.code,
        details: supabaseError.details,
      });
      throw error;
    }
  }

  async updateConfiguration(
    routeId: string,
    updates: Partial<PassportConfiguration>
  ): Promise<PassportConfiguration> {
    console.log('🔵 [PassportAdminService] ========== updateConfiguration ==========');
    console.log('🔵 [PassportAdminService] Route ID:', routeId);
    console.log('🔵 [PassportAdminService] Updates:', JSON.stringify(updates, null, 2));
    try {
      const { data, error } = await supabase
        .from('passport_configurations')
        .update(updates)
        .eq('route_id', routeId)
        .select()
        .single();

      if (error) {
        console.error('❌ [PassportAdminService] Erro ao atualizar configuração:', error);
        
        // Verificar se é erro de coluna não encontrada (migração não executada)
        if (error.code === 'PGRST204' && error.message?.includes('require_sequential')) {
          const migrationError = new Error(
            'A migração do banco de dados não foi executada. A coluna "require_sequential" não existe na tabela "passport_configurations".\n\n' +
            'Para corrigir:\n' +
            '1. Acesse o Supabase Dashboard\n' +
            '2. Vá em SQL Editor\n' +
            '3. Execute a migração: supabase/migrations/20251226000001_add_require_sequential_to_passport_config.sql\n' +
            '4. Recarregue a página e tente novamente'
          );
          migrationError.name = 'MigrationRequiredError';
          throw migrationError;
        }
        
        throw error;
      }
      console.log('✅ [PassportAdminService] Configuração atualizada:', data?.id);
      return data;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const supabaseError = error as { code?: string; details?: string; message?: string };
      console.error('❌ [PassportAdminService] Erro completo:', {
        message: supabaseError.message || err.message,
        code: supabaseError.code,
        details: supabaseError.details,
      });
      throw error;
    }
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
    console.log('🔵 [PassportAdminService] ========== createReward ==========');
    console.log('🔵 [PassportAdminService] Reward data:', JSON.stringify(reward, null, 2));
    
    try {
      const { data, error } = await supabase
        .from('passport_rewards')
        .insert(reward)
        .select()
        .single();

      if (error) {
        console.error('❌ [PassportAdminService] Erro ao criar recompensa:', error);

        // Verificar se é erro de coluna não encontrada (migração não executada)
        if (error.code === 'PGRST204' && error.message?.includes('avatar_id')) {
          const migrationError = new Error(
            'A migração do banco de dados não foi executada. A coluna "avatar_id" não existe na tabela "passport_rewards".\n\n' +
            'Para corrigir:\n' +
            '1. Acesse o Supabase Dashboard\n' +
            '2. Vá em SQL Editor\n' +
            '3. Execute a migração: supabase/migrations/20251217000001_expand_passport_reward_type_outros.sql\n' +
            '4. Recarregue a página e tente novamente'
          );
          migrationError.name = 'MigrationRequiredError';
          throw migrationError;
        }
        
        throw error;
      }
      console.log('✅ [PassportAdminService] Recompensa criada:', data?.id);
      
      return data;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const supabaseError = error as { code?: string; details?: string; message?: string; hint?: string };
      console.error('❌ [PassportAdminService] Erro completo:', {
        message: supabaseError.message || err.message,
        code: supabaseError.code,
        details: supabaseError.details,
      });
      
      throw error;
    }
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
    console.log('🔵 [PassportAdminService] ========== deleteReward ==========');
    console.log('🔵 [PassportAdminService] Reward ID:', rewardId);
    try {
      const { error } = await supabase
        .from('passport_rewards')
        .delete()
        .eq('id', rewardId);

      if (error) {
        console.error('❌ [PassportAdminService] Erro ao deletar recompensa:', error);
        throw error;
      }
      console.log('✅ [PassportAdminService] Recompensa deletada');
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const supabaseError = error as { code?: string; details?: string; message?: string };
      console.error('❌ [PassportAdminService] Erro completo:', {
        message: supabaseError.message || err.message,
        code: supabaseError.code,
        details: supabaseError.details,
      });
      throw error;
    }
  }

  /**
   * CHECKPOINTS
   */

  async createCheckpoint(
    checkpoint: Omit<RouteCheckpointExtended, 'id' | 'created_at'>
  ): Promise<RouteCheckpointExtended> {
    const { data, error } = await supabase
      .from('route_checkpoints')
      .insert(checkpoint)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCheckpoint(
    checkpointId: string,
    updates: Partial<RouteCheckpointExtended>
  ): Promise<RouteCheckpointExtended> {
    console.log('🔵 [PassportAdminService] ========== updateCheckpoint ==========');
    console.log('🔵 [PassportAdminService] Checkpoint ID:', checkpointId);
    console.log('🔵 [PassportAdminService] Updates:', JSON.stringify(updates, null, 2));
    try {
      const { data, error } = await supabase
        .from('route_checkpoints')
        .update(updates)
        .eq('id', checkpointId)
        .select()
        .single();

      if (error) {
        console.error('❌ [PassportAdminService] Erro ao atualizar checkpoint:', error);
        throw error;
      }
      console.log('✅ [PassportAdminService] Checkpoint atualizado:', data?.id);
      return data;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const supabaseError = error as { code?: string; details?: string; message?: string };
      console.error('❌ [PassportAdminService] Erro completo:', {
        message: supabaseError.message || err.message,
        code: supabaseError.code,
        details: supabaseError.details,
      });
      throw error;
    }
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
    console.log('🔵 [PassportAdminService] ========== getStatistics ==========');
    console.log('🔵 [PassportAdminService] Route ID (opcional):', routeId);
    try {
      // Total de usuários com passaporte
      console.log('🔵 [PassportAdminService] Buscando total de usuários...');
      const { count: totalUsers, error: usersError } = await supabase
        .from('user_passports')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error('❌ [PassportAdminService] Erro ao buscar usuários:', usersError);
        throw usersError;
      }

      // Rotas completadas
      console.log('🔵 [PassportAdminService] Buscando check-ins...');
      let routesQuery = supabase
        .from('passport_stamps')
        .select('route_id, user_id', { count: 'exact' });

      if (routeId) {
        routesQuery = routesQuery.eq('route_id', routeId);
      }

      const { count: totalCheckins, error: checkinsError } = await routesQuery;
      if (checkinsError) {
        console.error('❌ [PassportAdminService] Erro ao buscar check-ins:', checkinsError);
        throw checkinsError;
      }

      // Recompensas desbloqueadas
      console.log('🔵 [PassportAdminService] Buscando recompensas desbloqueadas...');
      const { count: rewardsUnlocked, error: rewardsError } = await supabase
        .from('user_rewards')
        .select('*', { count: 'exact', head: true });

      if (rewardsError) {
        console.error('❌ [PassportAdminService] Erro ao buscar recompensas:', rewardsError);
        throw rewardsError;
      }

      // Calcular rotas completadas (usuários que completaram todos os checkpoints de uma rota)
      // Isso requer uma query mais complexa, simplificando por enquanto
      const completedRoutes = 0; // TODO: Implementar cálculo correto

      const stats = {
        total_users: totalUsers || 0,
        completed_routes: completedRoutes,
        total_checkins: totalCheckins || 0,
        rewards_unlocked: rewardsUnlocked || 0,
      };

      console.log('✅ [PassportAdminService] Estatísticas calculadas:', stats);
      return stats;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const supabaseError = error as { code?: string; details?: string; message?: string };
      console.error('❌ [PassportAdminService] Erro completo:', {
        message: supabaseError.message || err.message,
        code: supabaseError.code,
        details: supabaseError.details,
      });
      throw error;
    }
  }

  /**
   * ROTAS
   */

  async updateRoute(
    routeId: string,
    updates: { video_url?: string; passport_number_prefix?: string; map_image_url?: string }
    // wallpaper_url removido - agora é global (não por rota)
  ): Promise<void> {
    console.log('🔵 [PassportAdminService] ========== updateRoute ==========');
    console.log('🔵 [PassportAdminService] Route ID:', routeId);
    console.log('🔵 [PassportAdminService] Updates:', JSON.stringify(updates, null, 2));
    try {
      const { error } = await supabase
        .from('routes')
        .update(updates)
        .eq('id', routeId);

      if (error) {
        console.error('❌ [PassportAdminService] Erro ao atualizar rota:', error);
        throw error;
      }
      console.log('✅ [PassportAdminService] Rota atualizada');
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const supabaseError = error as { code?: string; details?: string; message?: string };
      console.error('❌ [PassportAdminService] Erro completo:', {
        message: supabaseError.message || err.message,
        code: supabaseError.code,
        details: supabaseError.details,
      });
      throw error;
    }
  }
}

export const passportAdminService = new PassportAdminService();

