import { supabase } from '@/integrations/supabase/client';

export type LeaderboardPeriod = 'month' | 'all';

export interface LeaderboardEntry {
  rank_position: number;
  ranked_user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_points: number;
  total_stamps: number;
}

export interface MyLeaderboardPosition {
  rank_position: number;
  total_points: number;
  total_stamps: number;
  total_participants: number;
}

export const leaderboardService = {
  async getLeaderboard(
    period: LeaderboardPeriod = 'month',
    region: string | null = null,
    limit = 50
  ): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase.rpc('get_passport_leaderboard', {
      p_period: period,
      p_region: region,
      p_limit: limit,
    });

    if (error) throw error;

    return (data || []).map((row) => ({
      rank_position: Number(row.rank_position),
      ranked_user_id: row.ranked_user_id,
      display_name: row.display_name || 'Viajante',
      avatar_url: row.avatar_url,
      total_points: Number(row.total_points),
      total_stamps: Number(row.total_stamps),
    }));
  },

  async getMyPosition(
    period: LeaderboardPeriod = 'month',
    region: string | null = null
  ): Promise<MyLeaderboardPosition | null> {
    const { data, error } = await supabase.rpc('get_my_leaderboard_position', {
      p_period: period,
      p_region: region,
    });

    if (error) throw error;
    const row = data?.[0];
    if (!row) return null;

    return {
      rank_position: Number(row.rank_position),
      total_points: Number(row.total_points),
      total_stamps: Number(row.total_stamps),
      total_participants: Number(row.total_participants),
    };
  },

  async getRouteRegions(): Promise<string[]> {
    const { data, error } = await supabase
      .from('routes')
      .select('region')
      .eq('is_published', true)
      .eq('is_active', true)
      .not('region', 'is', null);

    if (error) throw error;

    const unique = [
      ...new Set(
        (data || [])
          .map((r) => (r.region || '').trim())
          .filter(Boolean)
      ),
    ];
    return unique.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  },

  async getOptOut(): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('leaderboard_opt_out')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return Boolean(data?.leaderboard_opt_out);
  },

  async setOptOut(optOut: boolean): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Faça login para alterar a privacidade do ranking.');

    const { error } = await supabase
      .from('user_profiles')
      .update({ leaderboard_opt_out: optOut })
      .eq('user_id', user.id);

    if (error) throw error;
  },
};
