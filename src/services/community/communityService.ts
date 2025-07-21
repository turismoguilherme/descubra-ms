import { supabase } from '@/integrations/supabase/client';
import { Contribution, ContributionType } from '@/types/community';

export class CommunityService {
  async getContributions(filters: {
    type?: ContributionType;
    status?: string;
    sort?: 'recent' | 'popular' | 'featured';
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('contributions')
        .select(`
          *,
          author:profiles(
            id,
            name,
            avatar_url,
            level
          )
        `);

      // Aplicar filtros
      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Ordenação
      switch (filters.sort) {
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
          query = query.order('likes', { ascending: false });
          break;
        case 'featured':
          query = query.eq('status', 'featured').order('created_at', { ascending: false });
          break;
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao buscar contribuições:', error);
      throw error;
    }
  }

  async createContribution(contribution: Omit<Contribution, 'id' | 'author' | 'timestamp' | 'likes'>) {
    try {
      const { data: profile } = await supabase.auth.getUser();
      
      if (!profile.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('contributions')
        .insert({
          ...contribution,
          author_id: profile.user.id,
          status: 'pending',
          likes: 0
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao criar contribuição:', error);
      throw error;
    }
  }

  async likeContribution(contributionId: string) {
    try {
      const { data: profile } = await supabase.auth.getUser();
      
      if (!profile.user) throw new Error('Usuário não autenticado');

      // Verificar se já curtiu
      const { data: existingLike } = await supabase
        .from('contribution_likes')
        .select()
        .match({
          contribution_id: contributionId,
          user_id: profile.user.id
        })
        .single();

      if (existingLike) {
        // Remover curtida
        await supabase
          .from('contribution_likes')
          .delete()
          .match({
            contribution_id: contributionId,
            user_id: profile.user.id
          });

        // Atualizar contador
        await supabase.rpc('decrement_contribution_likes', {
          contribution_id: contributionId
        });
      } else {
        // Adicionar curtida
        await supabase
          .from('contribution_likes')
          .insert({
            contribution_id: contributionId,
            user_id: profile.user.id
          });

        // Atualizar contador
        await supabase.rpc('increment_contribution_likes', {
          contribution_id: contributionId
        });
      }

      return !existingLike;
    } catch (error) {
      console.error('Erro ao curtir contribuição:', error);
      throw error;
    }
  }

  async getUserContributions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select(`
          *,
          author:profiles(
            id,
            name,
            avatar_url,
            level
          )
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao buscar contribuições do usuário:', error);
      throw error;
    }
  }

  async getContributionStats(userId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_contribution_stats', {
          user_id: userId
        });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
} 