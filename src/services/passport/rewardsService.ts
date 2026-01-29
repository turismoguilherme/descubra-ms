import { supabase } from '@/integrations/supabase/client';
import type { UserReward, PassportReward } from '@/types/passportDigital';

interface UserAvatar {
  id: string;
  user_id: string;
  avatar_id: string;
  route_id?: string | null;
  unlocked_at: string;
  pantanal_avatars?: {
    id: string;
    name: string;
    scientific_name?: string;
    description?: string;
    image_url?: string;
    rarity: string;
    personality_traits?: string[];
    habitat?: string;
    diet?: string;
  } | null;
}

interface UnlockRewardResult {
  reward_id: string;
}

interface UnlockedAvatar {
  avatar_id: string;
  avatar_name: string;
  rarity: string;
}

class RewardsService {
  /**
   * Desbloquear recompensas ao completar roteiro
   */
  async unlockRewards(userId: string, routeId: string): Promise<UserReward[]> {
    try {
      // Primeiro, desbloquear recompensas tradicionais via RPC
      const { data, error } = await supabase.rpc('unlock_rewards', {
        p_user_id: userId,
        p_route_id: routeId,
      });

      if (error) throw error;

      let unlockedRewards: UserReward[] = [];

      // Buscar recompensas tradicionais desbloqueadas
      if (data && Array.isArray(data) && data.length > 0) {
        const unlockResults = data as UnlockRewardResult[];
        const rewardIds = unlockResults.map((r) => r.reward_id);
        const { data: rewards } = await supabase
          .from('user_rewards')
          .select('*, passport_rewards(*)')
          .eq('user_id', userId)
          .eq('route_id', routeId)
          .in('id', rewardIds);

        unlockedRewards = (rewards || []) as UserReward[];
      }

      // Segundo, verificar e desbloquear recompensas de avatar
      const avatarRewards = await this.unlockAvatarRewards(userId, routeId);

      // Combinar recompensas tradicionais e de avatar
      return [...unlockedRewards, ...avatarRewards];
    } catch (error: unknown) {
      console.error('Erro ao desbloquear recompensas:', error);
      throw error;
    }
  }

  /**
   * Desbloquear recompensas de avatar para uma rota
   */
  private async unlockAvatarRewards(userId: string, routeId: string): Promise<UserReward[]> {
    try {
      // Usar função RPC do banco para desbloquear avatares
      const { data: unlockedAvatars, error } = await supabase.rpc('unlock_route_avatars', {
        p_user_id: userId,
        p_route_id: routeId,
      });

      if (error) throw error;

      const avatarRewards: UserReward[] = [];

      if (unlockedAvatars && Array.isArray(unlockedAvatars) && unlockedAvatars.length > 0) {
        const avatars = unlockedAvatars as UnlockedAvatar[];
        // Para cada avatar desbloqueado, buscar a recompensa correspondente
        for (const avatar of avatars) {
          const { data: reward } = await supabase
            .from('passport_rewards')
            .select('id')
            .eq('route_id', routeId)
            .eq('avatar_id', avatar.avatar_id)
            .eq('reward_type', 'avatar')
            .single();

          if (reward) {
            avatarRewards.push({
              id: `avatar-${avatar.avatar_id}`,
              user_id: userId,
              reward_id: reward.id,
              route_id: routeId,
              is_used: false,
              created_at: new Date().toISOString(),
              passport_rewards: {
                id: reward.id,
                reward_type: 'avatar',
                reward_description: `Avatar desbloqueado: ${avatar.avatar_name} (${avatar.rarity})`,
                avatar_id: avatar.avatar_id,
              }
            } as UserReward);
          }
        }
      }

      return avatarRewards;
    } catch (error: unknown) {
      console.error('Erro ao desbloquear recompensas de avatar:', error);
      throw error;
    }
  }

  /**
   * Obter recompensas do usuário
   */
  async getUserRewards(userId: string, routeId?: string): Promise<UserReward[]> {
    try {
      let query = supabase
        .from('user_rewards')
        .select('*, passport_rewards(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (routeId) {
        query = query.eq('route_id', routeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as UserReward[];
    } catch (error: unknown) {
      console.error('Erro ao buscar recompensas:', error);
      throw error;
    }
  }

  /**
   * Obter recompensas disponíveis para uma rota
   */
  async getRouteRewards(routeId: string): Promise<PassportReward[]> {
    try {
      const { data, error } = await supabase
        .from('passport_rewards')
        .select('*')
        .eq('route_id', routeId)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as PassportReward[];
    } catch (error: unknown) {
      console.error('Erro ao buscar recompensas da rota:', error);
      throw error;
    }
  }

  /**
   * Desbloquear avatar para o usuário
   */
  async unlockAvatar(userId: string, avatarId: string, routeId?: string): Promise<boolean> {
    try {
      // Verificar se usuário já possui este avatar
      const { data: existingAvatar, error: checkError } = await supabase
        .from('user_avatars')
        .select('id')
        .eq('user_id', userId)
        .eq('avatar_id', avatarId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
        throw checkError;
      }

      if (existingAvatar) {
        console.log('Avatar já desbloqueado para o usuário');
        return false; // Já possui
      }

      // Desbloquear avatar
      const { error: insertError } = await supabase
        .from('user_avatars')
        .insert({
          user_id: userId,
          avatar_id: avatarId,
          route_id: routeId,
        });

      if (insertError) throw insertError;

      console.log('Avatar desbloqueado com sucesso');
      return true; // Desbloqueado com sucesso
    } catch (error: unknown) {
      console.error('Erro ao desbloquear avatar:', error);
      throw error;
    }
  }

  /**
   * Verificar se usuário possui determinado avatar
   */
  async userHasAvatar(userId: string, avatarId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_avatars')
        .select('id')
        .eq('user_id', userId)
        .eq('avatar_id', avatarId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      return !!data;
    } catch (error: unknown) {
      console.error('Erro ao verificar avatar do usuário:', error);
      throw error;
    }
  }

  /**
   * Obter avatares desbloqueados do usuário
   */
  async getUserAvatars(userId: string): Promise<UserAvatar[]> {
    try {
      const { data, error } = await supabase
        .from('user_avatars')
        .select(`
          *,
          pantanal_avatars (
            id,
            name,
            scientific_name,
            description,
            image_url,
            rarity,
            personality_traits,
            habitat,
            diet
          )
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return (data || []) as UserAvatar[];
    } catch (error: unknown) {
      console.error('Erro ao buscar avatares do usuário:', error);
      throw error;
    }
  }

  /**
   * Marcar recompensa como usada
   */
  async markRewardAsUsed(userId: string, rewardId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_rewards')
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
        })
        .eq('id', rewardId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error: unknown) {
      console.error('Erro ao marcar recompensa como usada:', error);
      throw error;
    }
  }

  /**
   * Validar código de voucher
   */
  async validateVoucherCode(voucherCode: string): Promise<UserReward | null> {
    try {
      const { data, error } = await supabase
        .from('user_rewards')
        .select('*, passport_rewards(*)')
        .eq('voucher_code', voucherCode)
        .eq('is_used', false)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as UserReward | null;
    } catch (error: unknown) {
      console.error('Erro ao validar voucher:', error);
      return null;
    }
  }

  /**
   * Copiar código de voucher para clipboard
   */
  async copyVoucherCode(voucherCode: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(voucherCode);
      return true;
    } catch (error) {
      console.error('Erro ao copiar código:', error);
      // Fallback para navegadores antigos
      const textArea = document.createElement('textarea');
      textArea.value = voucherCode;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch {
        document.body.removeChild(textArea);
        return false;
      }
    }
  }
}

export const rewardsService = new RewardsService();

