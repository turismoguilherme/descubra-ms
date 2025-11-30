import { supabase } from '@/integrations/supabase/client';
import type { UserReward, PassportReward } from '@/types/passportDigital';

class RewardsService {
  /**
   * Desbloquear recompensas ao completar roteiro
   */
  async unlockRewards(userId: string, routeId: string): Promise<UserReward[]> {
    try {
      const { data, error } = await supabase.rpc('unlock_rewards', {
        p_user_id: userId,
        p_route_id: routeId,
      });

      if (error) throw error;

      // Buscar recompensas desbloqueadas com detalhes
      if (data && data.length > 0) {
        const rewardIds = data.map((r: any) => r.reward_id);
        const { data: rewards } = await supabase
          .from('user_rewards')
          .select('*, passport_rewards(*)')
          .eq('user_id', userId)
          .eq('route_id', routeId)
          .in('id', data.map((r: any) => r.reward_id));

        return (rewards || []) as UserReward[];
      }

      return [];
    } catch (error: any) {
      console.error('Erro ao desbloquear recompensas:', error);
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
    } catch (error: any) {
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
    } catch (error: any) {
      console.error('Erro ao buscar recompensas da rota:', error);
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
    } catch (error: any) {
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
    } catch (error: any) {
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

