import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  user_id: string;
  full_name: string; // Nome do usuário do user_profiles
  display_name?: string; // Nome de exibição, se disponível
  avatar_url?: string; // URL do avatar
  total_points: number;
}

class LeaderboardService {
  /**
   * Obtém o ranking global de usuários com base em seus total_points.
   * @param limit O número máximo de entradas a serem retornadas (padrão: 10).
   * @returns Uma lista de entradas do leaderboard.
   */
  async getGlobalLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, display_name, avatar_url, total_points')
        .order('total_points', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(entry => ({
        user_id: entry.user_id,
        full_name: entry.full_name || 'Usuário Anônimo',
        display_name: entry.display_name,
        avatar_url: entry.avatar_url,
        total_points: entry.total_points,
      })) as LeaderboardEntry[];
    } catch (error) {
      console.error('❌ Erro ao buscar o leaderboard global:', error);
      throw error;
    }
  }

  // Se houver uma lógica mais complexa para pontos por roteiro, podemos adicionar um método aqui.
  // Por exemplo, usando JOINs ou Views Materializadas se os pontos forem armazenados por rota.
  // async getRouteLeaderboard(routeId: string, limit: number = 10): Promise<LeaderboardEntry[]> {
  //   // Implementação aqui
  // }
}

export const leaderboardService = new LeaderboardService(); 