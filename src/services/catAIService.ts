
import { supabase } from "@/integrations/supabase/client";

export interface CATAIQuery {
  id: string;
  attendant_id: string;
  attendant_name: string;
  cat_location?: string;
  question: string;
  response: string;
  response_source?: string;
  feedback_useful?: boolean;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface FrequentQuestion {
  id: string;
  question_pattern: string;
  suggested_response: string;
  frequency_count: number;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class CATAIService {
  async submitQuery(
    attendantId: string,
    attendantName: string,
    question: string,
    catLocation?: string,
    latitude?: number,
    longitude?: number
  ): Promise<CATAIQuery | null> {
    try {
      const response = await this.generateResponse(question);
      
      const { data, error } = await supabase
        .from('cat_ai_queries')
        .insert({
          attendant_id: attendantId,
          attendant_name: attendantName,
          cat_location: catLocation,
          question: question,
          response: response,
          response_source: 'ai_generated',
          latitude: latitude,
          longitude: longitude
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error submitting CAT AI query:', error);
      return null;
    }
  }

  async getUserQueries(attendantId: string): Promise<CATAIQuery[]> {
    try {
      const { data, error } = await supabase
        .from('cat_ai_queries')
        .select('*')
        .eq('attendant_id', attendantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching user queries:', error);
      return [];
    }
  }

  // Adicionando métodos que estavam faltando
  async getAllQueries(): Promise<CATAIQuery[]> {
    try {
      const { data, error } = await supabase
        .from('cat_ai_queries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching all queries:', error);
      return [];
    }
  }

  async getAttendantQueries(attendantId: string): Promise<CATAIQuery[]> {
    return this.getUserQueries(attendantId);
  }

  async submitFeedback(queryId: string, isUseful: boolean): Promise<boolean> {
    return this.updateFeedback(queryId, isUseful);
  }

  async updateFeedback(queryId: string, isUseful: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cat_ai_queries')
        .update({ feedback_useful: isUseful })
        .eq('id', queryId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating feedback:', error);
      return false;
    }
  }

  async getFrequentQuestions(category?: string): Promise<FrequentQuestion[]> {
    try {
      let query = supabase
        .from('cat_frequent_questions')
        .select('*')
        .eq('is_active', true);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('frequency_count', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching frequent questions:', error);
      return [];
    }
  }

  private async generateResponse(question: string): Promise<string> {
    // Implementação simples de resposta baseada em padrões
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('horário') || lowerQuestion.includes('funcionamento')) {
      return 'Para horários de funcionamento, recomendo consultar diretamente com o estabelecimento ou verificar as informações disponíveis no aplicativo.';
    }
    
    if (lowerQuestion.includes('acessibilidade')) {
      return 'As informações sobre acessibilidade estão disponíveis na descrição detalhada de cada destino no aplicativo. Você também pode entrar em contato diretamente com o local.';
    }
    
    if (lowerQuestion.includes('como chegar') || lowerQuestion.includes('localização')) {
      return 'Utilize o mapa interativo do aplicativo para obter direções e rotas para os destinos desejados.';
    }
    
    if (lowerQuestion.includes('preço') || lowerQuestion.includes('ingresso') || lowerQuestion.includes('valor')) {
      return 'Os preços podem variar. Recomendo consultar diretamente com o estabelecimento para obter informações atualizadas sobre valores.';
    }
    
    if (lowerQuestion.includes('evento')) {
      return 'Consulte a seção de eventos do aplicativo para ver a programação atualizada dos eventos na região.';
    }
    
    return 'Obrigado pela sua pergunta. Para informações específicas, recomendo consultar o aplicativo ou entrar em contato diretamente com os estabelecimentos locais.';
  }
}

export const catAIService = new CATAIService();
