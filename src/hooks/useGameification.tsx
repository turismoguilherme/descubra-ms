import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { achievementService } from '@/services/achievementService';
import { UserStats, UserAchievement } from '@/types/achievements';

export const useGameification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserStats = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userStats = await achievementService.getUserStats(user.id);
      setStats(userStats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas do usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas estatísticas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const checkForNewAchievements = useCallback(async () => {
    if (!user) return;

    try {
      const newAchievements = await achievementService.checkAndUnlockAchievements(user.id);
      
      // Mostrar notificação para cada nova conquista
      newAchievements.forEach((achievement) => {
        toast({
          title: "🎉 Nova Conquista Desbloqueada!",
          description: `${achievement.achievement?.icon} ${achievement.achievement?.name}: ${achievement.achievement?.description}`,
          duration: 5000,
        });
      });

      // Atualizar estatísticas se houver novas conquistas
      if (newAchievements.length > 0) {
        await fetchUserStats();
      }

      return newAchievements;
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
      return [];
    }
  }, [user, toast, fetchUserStats]);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  return {
    stats,
    loading,
    fetchUserStats,
    checkForNewAchievements,
  };
};