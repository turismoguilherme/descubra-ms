import { supabase } from '@/integrations/supabase/client';

interface FeedbackData {
  interaction_id: string;
  feedback_type: 'helpful' | 'not_helpful' | 'incorrect' | 'offensive';
  score?: number;
  comments?: string;
  feedback_by_user_id?: string;
}

export const feedbackService = {
  async submitFeedback(data: FeedbackData): Promise<void> {
    const { error } = await supabase
      .from('ai_feedback_log')
      .insert(data);

    if (error) {
      throw new Error(`Erro ao enviar feedback: ${error.message}`);
    }
  },

  async getFeedback(interactionId: string) {
    const { data, error } = await supabase
      .from('ai_feedback_log')
      .select('*')
      .eq('interaction_id', interactionId);

    if (error) {
      throw new Error(`Erro ao buscar feedback: ${error.message}`);
    }

    return data;
  },
};
