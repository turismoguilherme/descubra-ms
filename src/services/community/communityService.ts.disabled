import { supabase } from '@/integrations/supabase/client';
import { TablesInsert } from '@/integrations/supabase/types';
import { CommunitySuggestion, CommunityVote, CommunityComment, CommunityModerationLog } from '@/types/community-contributions';

export class CommunityService {

  // --- Sugestões da Comunidade ---
  async createSuggestion(suggestion: Omit<CommunitySuggestion, 'id' | 'created_at' | 'updated_at' | 'votes_count' | 'comments_count' | 'status'>): Promise<CommunitySuggestion> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('community_suggestions')
        .insert({
          ...suggestion,
          user_id: user.user.id,
          status: 'pending', // Sugestão inicia como pendente de moderação
          votes_count: 0,
          comments_count: 0,
        } as TablesInsert<'community_suggestions'>)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar sugestão:', error);
      throw error;
    }
  }

  async getSuggestions(filters?: { status?: string; userId?: string; sortBy?: 'votes' | 'recent'; limit?: number }): Promise<CommunitySuggestion[]> {
    try {
      let query = supabase.from('community_suggestions').select('*');

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.sortBy === 'votes') {
        query = query.order('votes_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      throw error;
    }
  }

  async getSuggestionById(id: string): Promise<CommunitySuggestion | null> {
    try {
      const { data, error } = await supabase.from('community_suggestions').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar sugestão por ID:', error);
      throw error;
    }
  }

  async updateSuggestionStatus(suggestionId: string, status: 'approved' | 'rejected' | 'implemented', reason?: string): Promise<CommunitySuggestion> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('community_suggestions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', suggestionId)
        .select()
        .single();

      if (error) throw error;

      await this.logModeration(suggestionId, user.user.id, status, reason);

      // 🧠 INTEGRAÇÃO COM GUATÁ: Se aprovada, adicionar à base de conhecimento
      if (status === 'approved') {
        await this.integrateWithGuataKnowledge(data);
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar status da sugestão:', error);
      throw error;
    }
  }

  /**
   * 🤖 Integra sugestão aprovada com a base de conhecimento do Guatá
   */
  private async integrateWithGuataKnowledge(suggestion: CommunitySuggestion) {
    try {
      // Importação dinâmica para evitar dependências circulares
      const { superTourismAI } = await import('@/services/ai/superTourismAI');
      
      // Adicionar à base de conhecimento do Guatá
      await superTourismAI.addCommunityKnowledge(suggestion);
      
      console.log(`✨ Sugestão "${suggestion.title}" integrada com sucesso ao Guatá IA`);
      
      // Log para auditoria
      await this.logModeration(
        suggestion.id, 
        'system', 
        'knowledge_integrated', 
        `Sugestão automaticamente adicionada à base de conhecimento do Guatá para recomendações aos turistas`
      );
      
    } catch (error) {
      console.warn('⚠️ Erro ao integrar com Guatá, mas sugestão foi aprovada:', error);
      // Não falha o processo principal se a integração der erro
    }
  }

  // --- Votos da Comunidade ---
  async toggleVote(suggestionId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const existingVote = await supabase
        .from('community_votes')
        .select('id')
        .eq('suggestion_id', suggestionId)
        .eq('user_id', user.user.id)
        .maybeSingle();

      let isVoting = false;

      if (existingVote.data) {
        // Remover voto
        await supabase.from('community_votes').delete().eq('id', existingVote.data.id);
        isVoting = false;
      } else {
        // Adicionar voto
        await supabase.from('community_votes').insert({ suggestion_id: suggestionId, user_id: user.user.id });
        isVoting = true;
      }

      // Atualizar contagem de votos na sugestão (usando RLS policies ou triggers)
      // Por enquanto, faremos via RPC se disponível, ou confiaremos no Supabase para gerenciar
      await supabase.rpc('update_suggestion_votes_count', { p_suggestion_id: suggestionId });

      return isVoting;
    } catch (error) {
      console.error('Erro ao votar na sugestão:', error);
      throw error;
    }
  }

  async hasUserVoted(suggestionId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('community_votes')
        .select('id')
        .eq('suggestion_id', suggestionId)
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Erro ao verificar voto do usuário:', error);
      throw error;
    }
  }

  // --- Comentários da Comunidade ---
  async addComment(suggestionId: string, commentText: string): Promise<CommunityComment> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('community_comments')
        .insert({
          suggestion_id: suggestionId,
          user_id: user.user.id,
          comment: commentText,
        } as TablesInsert<'community_comments'>)
        .select()
        .single();

      if (error) throw error;

      // Atualizar contagem de comentários na sugestão
      await supabase.rpc('increment_suggestion_comments_count', { p_suggestion_id: suggestionId });

      return data;
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      throw error;
    }
  }

  async getCommentsBySuggestionId(suggestionId: string): Promise<CommunityComment[]> {
    try {
      const { data, error } = await supabase
        .from('community_comments')
        .select('*')
        .eq('suggestion_id', suggestionId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      throw error;
    }
  }

  // --- Moderação da Comunidade ---
  async logModeration(suggestionId: string, moderatorId: string, action: string, reason?: string): Promise<CommunityModerationLog> {
    try {
      const { data, error } = await supabase
        .from('community_moderation_log')
        .insert({
          suggestion_id: suggestionId,
          moderator_id: moderatorId,
          action,
          reason,
        } as TablesInsert<'community_moderation_log'>)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao logar moderação:', error);
      throw error;
    }
  }

  async getModerationLogBySuggestionId(suggestionId: string): Promise<CommunityModerationLog[]> {
    try {
      const { data, error } = await supabase
        .from('community_moderation_log')
        .select('*')
        .eq('suggestion_id', suggestionId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar log de moderação:', error);
      throw error;
    }
  }
}

export const communityService = new CommunityService(); 