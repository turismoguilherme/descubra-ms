import { supabase } from '@/integrations/supabase/client';
import { TourismReview } from '@/types/passport';

interface CreateReviewData {
  user_id: string;
  route_id?: string;
  checkpoint_id?: string;
  rating: number;
  comment?: string;
}

class TourismReviewService {
  /**
   * Cria uma nova avaliação/comentário para um roteiro ou checkpoint.
   * @param data Os dados da avaliação a ser criada.
   * @returns A avaliação criada.
   */
  async createReview(data: CreateReviewData): Promise<TourismReview> {
    try {
      const { data: newReview, error } = await supabase
        .from('tourism_reviews')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return newReview as TourismReview;
    } catch (error) {
      console.error('❌ Erro ao criar avaliação:', error);
      throw error;
    }
  }

  /**
   * Busca avaliações por ID de roteiro.
   * @param routeId O ID do roteiro.
   * @returns Uma lista de avaliações para o roteiro.
   */
  async getReviewsByRouteId(routeId: string): Promise<TourismReview[]> {
    try {
      const { data, error } = await supabase
        .from('tourism_reviews')
        .select('*')
        .eq('route_id', routeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TourismReview[];
    } catch (error) {
      console.error('❌ Erro ao buscar avaliações por roteiro:', error);
      throw error;
    }
  }

  /**
   * Busca avaliações por ID de checkpoint.
   * @param checkpointId O ID do checkpoint.
   * @returns Uma lista de avaliações para o checkpoint.
   */
  async getReviewsByCheckpointId(checkpointId: string): Promise<TourismReview[]> {
    try {
      const { data, error } = await supabase
        .from('tourism_reviews')
        .select('*')
        .eq('checkpoint_id', checkpointId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TourismReview[];
    } catch (error) {
      console.error('❌ Erro ao buscar avaliações por checkpoint:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma avaliação existente.
   * @param reviewId O ID da avaliação a ser atualizada.
   * @param updates Os campos a serem atualizados.
   * @returns A avaliação atualizada.
   */
  async updateReview(reviewId: string, updates: Partial<CreateReviewData>): Promise<TourismReview> {
    try {
      const { data, error } = await supabase
        .from('tourism_reviews')
        .update(updates)
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data as TourismReview;
    } catch (error) {
      console.error('❌ Erro ao atualizar avaliação:', error);
      throw error;
    }
  }

  /**
   * Exclui uma avaliação.
   * @param reviewId O ID da avaliação a ser excluída.
   */
  async deleteReview(reviewId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tourism_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      console.log(`✅ Avaliação ${reviewId} excluída com sucesso.`);
    } catch (error) {
      console.error('❌ Erro ao excluir avaliação:', error);
      throw error;
    }
  }
}

export const tourismReviewService = new TourismReviewService(); 