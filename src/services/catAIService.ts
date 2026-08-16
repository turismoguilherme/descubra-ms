
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
      
      // Usar tabela knowledge_base_entries para armazenar as consultas
      const { data, error } = await supabase
        .from('knowledge_base_entries')
        .insert({
          title: `Consulta CAT - ${question.substring(0, 50)}...`,
          content: `Pergunta: ${question}\nResposta: ${response}`,
          category: 'cat_query',
          region: catLocation || 'N/A',
          metadata: {
            attendant_id: attendantId,
            attendant_name: attendantName,
            cat_location: catLocation,
            question: question,
            response: response,
            response_source: 'ai_generated',
            latitude: latitude,
            longitude: longitude
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Converter para formato CATAIQuery
      const convertedData: CATAIQuery = {
        id: data.id,
        attendant_id: (data.metadata as any)?.attendant_id || attendantId,
        attendant_name: (data.metadata as any)?.attendant_name || attendantName,
        cat_location: (data.metadata as any)?.cat_location,
        question: (data.metadata as any)?.question || question,
        response: (data.metadata as any)?.response || response,
        response_source: (data.metadata as any)?.response_source,
        latitude: (data.metadata as any)?.latitude,
        longitude: (data.metadata as any)?.longitude,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      return convertedData;
    } catch (error) {
      console.error('Error submitting CAT AI query:', error);
      return null;
    }
  }

  async getUserQueries(attendantId: string): Promise<CATAIQuery[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_base_entries')
        .select('*')
        .eq('category', 'cat_query')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        attendant_id: (item.metadata as any)?.attendant_id || '',
        attendant_name: (item.metadata as any)?.attendant_name || '',
        cat_location: (item.metadata as any)?.cat_location,
        question: (item.metadata as any)?.question || '',
        response: (item.metadata as any)?.response || '',
        response_source: (item.metadata as any)?.response_source,
        latitude: (item.metadata as any)?.latitude,
        longitude: (item.metadata as any)?.longitude,
        created_at: item.created_at,
        updated_at: item.updated_at
      })).filter(item => item.attendant_id === attendantId);
    } catch (error) {
      console.error('Error fetching user queries:', error);
      return [];
    }
  }

  // Adicionando métodos que estavam faltando
  async getAllQueries(): Promise<CATAIQuery[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_base_entries')
        .select('*')
        .eq('category', 'cat_query')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        attendant_id: (item.metadata as any)?.attendant_id || '',
        attendant_name: (item.metadata as any)?.attendant_name || '',
        cat_location: (item.metadata as any)?.cat_location,
        question: (item.metadata as any)?.question || '',
        response: (item.metadata as any)?.response || '',
        response_source: (item.metadata as any)?.response_source,
        latitude: (item.metadata as any)?.latitude,
        longitude: (item.metadata as any)?.longitude,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
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
      // Buscar o item atual para atualizar o metadata
      const { data: current } = await supabase
        .from('knowledge_base_entries')
        .select('metadata')
        .eq('id', queryId)
        .single();

      const updatedMetadata = {
        ...(current?.metadata as any || {}),
        feedback_useful: isUseful
      };

      const { error } = await supabase
        .from('knowledge_base_entries')
        .update({ metadata: updatedMetadata })
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
      const query = supabase
        .from('knowledge_base_entries')
        .select('*')
        .eq('category', 'frequent_question')
        .eq('is_verified', true);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        question_pattern: item.title,
        suggested_response: item.content,
        frequency_count: (item.metadata as any)?.frequency_count || 1,
        category: (item.metadata as any)?.category || 'geral',
        is_active: true,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
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
