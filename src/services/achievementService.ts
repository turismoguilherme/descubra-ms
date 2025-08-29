import { supabase } from '@/integrations/supabase/client';
import { Achievement, UserAchievement, UserLevel, UserStats } from '@/types/achievements';

export const achievementService = {
  // Buscar todas as conquistas disponíveis
  async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('rarity');
    
    if (error) throw error;
    return data || [];
  },

  // Buscar conquistas do usuário
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Calcular nível do usuário baseado em pontos
  async calculateUserLevel(points: number): Promise<UserLevel> {
    const { data, error } = await supabase.rpc('calculate_user_level', { points });
    
    if (error) throw error;
    return data as UserLevel;
  },

  // Buscar estatísticas completas do usuário
  async getUserStats(userId: string): Promise<UserStats> {
    // Buscar dados do user_levels
    const { data: levelData, error: levelError } = await supabase
      .from('user_levels')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (levelError && levelError.code !== 'PGRST116') throw levelError;

    // Buscar conquistas do usuário
    const achievements = await this.getUserAchievements(userId);

    // Buscar estatísticas dos carimbos
    const { data: stampsData, error: stampsError } = await supabase
      .from('passport_stamps')
      .select(`
        id,
        route_id,
        routes!inner(region)
      `)
      .eq('user_id', userId);

    if (stampsError) throw stampsError;

    const totalPoints = levelData?.total_points || 0;
    const totalStamps = stampsData?.length || 0;
    const totalRoutes = new Set(stampsData?.map(s => s.route_id)).size || 0;
    const uniqueRegions = new Set(stampsData?.map(s => s.routes?.region)).size || 0;

    // Calcular nível atual
    const level = await this.calculateUserLevel(totalPoints);

    return {
      totalPoints,
      totalStamps,
      totalRoutes,
      uniqueRegions,
      level,
      achievements
    };
  },

  // Verificar e desbloquear conquistas automáticas
  async checkAndUnlockAchievements(userId: string): Promise<UserAchievement[]> {
    const newAchievements: UserAchievement[] = [];
    
    // Buscar estatísticas atuais
    const stats = await this.getUserStats(userId);
    
    // Buscar todas as conquistas disponíveis
    const allAchievements = await this.getAllAchievements();
    
    // Conquistas que o usuário já tem
    const userAchievementIds = stats.achievements.map(ua => ua.achievement_id);

    // Verificar cada conquista
    for (const achievement of allAchievements) {
      // Pular se já tem a conquista
      if (userAchievementIds.includes(achievement.id)) continue;

      let shouldUnlock = false;

      // Verificar critérios baseados no tipo
      switch (achievement.criteria.type) {
        case 'checkin_count':
          shouldUnlock = stats.totalStamps >= achievement.criteria.min_count;
          break;
        case 'unique_regions':
          shouldUnlock = stats.uniqueRegions >= achievement.criteria.min_count;
          break;
        case 'total_stamps':
          shouldUnlock = stats.totalStamps >= achievement.criteria.min_count;
          break;
        case 'all_regions':
          shouldUnlock = stats.uniqueRegions >= 10;
          break;
      }

      // Desbloquear conquista se atender critérios
      if (shouldUnlock) {
        const { data, error } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
            earned_at: new Date().toISOString()
          })
          .select(`
            *,
            achievement:achievements(*)
          `)
          .single();

        if (!error && data) {
          newAchievements.push(data);
        }
      }
    }

    return newAchievements;
  }
};