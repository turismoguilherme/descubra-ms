import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { rewardsService } from '@/services/passport/rewardsService';
import type { UserReward, PassportReward } from '@/types/passportDigital';

export const usePassportRewards = (routeId?: string) => {
  const { user } = useAuth();
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [routeRewards, setRouteRewards] = useState<PassportReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carregar recompensas do usuário
   */
  const loadUserRewards = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const rewards = await rewardsService.getUserRewards(user.id, routeId);
      setUserRewards(rewards);
    } catch (err: any) {
      console.error('Erro ao carregar recompensas do usuário:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, routeId]);

  /**
   * Carregar recompensas disponíveis da rota
   */
  const loadRouteRewards = useCallback(async () => {
    if (!routeId) return;

    try {
      const rewards = await rewardsService.getRouteRewards(routeId);
      setRouteRewards(rewards);
    } catch (err: any) {
      console.error('Erro ao carregar recompensas da rota:', err);
    }
  }, [routeId]);

  /**
   * Desbloquear recompensas
   */
  const unlockRewards = useCallback(
    async (routeId: string): Promise<UserReward[]> => {
      if (!user) throw new Error('Usuário não autenticado');

      try {
        const unlocked = await rewardsService.unlockRewards(user.id, routeId);
        await loadUserRewards();
        return unlocked;
      } catch (err: any) {
        console.error('Erro ao desbloquear recompensas:', err);
        throw err;
      }
    },
    [user, loadUserRewards]
  );

  /**
   * Marcar recompensa como usada
   */
  const markAsUsed = useCallback(
    async (rewardId: string) => {
      if (!user) return;

      try {
        await rewardsService.markRewardAsUsed(user.id, rewardId);
        await loadUserRewards();
      } catch (err: any) {
        console.error('Erro ao marcar recompensa como usada:', err);
        throw err;
      }
    },
    [user, loadUserRewards]
  );

  /**
   * Copiar código de voucher
   */
  const copyVoucherCode = useCallback(async (voucherCode: string): Promise<boolean> => {
    return await rewardsService.copyVoucherCode(voucherCode);
  }, []);

  /**
   * Validar código de voucher
   */
  const validateVoucher = useCallback(async (voucherCode: string) => {
    return await rewardsService.validateVoucherCode(voucherCode);
  }, []);

  // Carregar recompensas ao montar
  useEffect(() => {
    loadUserRewards();
    if (routeId) {
      loadRouteRewards();
    }
  }, [loadUserRewards, loadRouteRewards, routeId]);

  return {
    userRewards,
    routeRewards,
    loading,
    error,
    unlockRewards,
    markAsUsed,
    copyVoucherCode,
    validateVoucher,
    refresh: loadUserRewards,
  };
};

