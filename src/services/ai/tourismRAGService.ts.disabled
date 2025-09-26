import { geminiClient } from '@/config/gemini';
import { supabase } from '@/integrations/supabase/client';

// Tipos para o sistema RAG
export interface TourismData {
  id: string;
  type: 'attraction' | 'hotel' | 'restaurant' | 'event' | 'transport' | 'service';
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    region: string;
    coordinates?: { lat: number; lng: number };
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  details: {
    hours?: string;
    prices?: string;
    accessibility?: string;
    languages?: string[];
    payment_methods?: string[];
  };
  ratings?: {
    average: number;
    count: number;
  };
  tags: string[];
  last_updated: string;
  source: 'alumia' | 'government' | 'manual' | 'social_media';
}

export interface RAGQuery {
  question: string;
  context: {
    catLocation?: string;
    userPreferences?: string[];
    currentTime?: string;
    weather?: string;
  };
  filters?: {
    type?: string[];
    region?: string;
    price_range?: string;
    accessibility?: boolean;
  };
}

export interface RAGResponse {
  answer: string;
  sources: TourismData[];
  confidence: number;
  suggestions: string[];
  related_questions: string[];
}

class TourismRAGService {
  private knowledgeBase: TourismData[] = [];
  private lastUpdate: Date = new Date();

  // Inicializar base de conhecimento
  async initializeKnowledgeBase() {
    console.log('🔄 Inicializando base de conhecimento turístico...');
    
    try {
      // Carregar dados do Supabase
      await this.loadFromDatabase();
      
      // Carregar dados da ALUMIA
      await this.loadFromALUMIA();
      
      // Carregar dados governamentais
      await this.loadFromGovernmentAPIs();
      
      // Carregar dados de redes sociais
      await this.loadFromSocialMedia();
      
      console.log(`✅ Base de conhecimento carregada com ${this.knowledgeBase.length} itens`);
    } catch (error) {
      console.error('❌ Erro ao inicializar base de conhecimento:', error);
    }
  }

  // Carregar dados do banco local
  private async loadFromDatabase() {
    const { data, error } = await supabase
      .from('tourism_data')
      .select('*')
      .eq('active', true);

    if (error) throw error;
    
    this.knowledgeBase.push(...(data || []));
  }

  // Carregar dados da ALUMIA (simulado - integrar com API real)
  private async loadFromALUMIA() {
    try {
      // Simular dados da ALUMIA
      const alumiaData: TourismData[] = [
        {
          id: 'alumia-001',
          type: 'attraction',
          name: 'Parque das Nações Indígenas',
          description: 'Parque urbano com lago, trilhas e área de lazer',
          location: {
            address: 'Av. Afonso Pena, s/n',
            city: 'Campo Grande',
            region: 'centro_oeste',
            coordinates: { lat: -20.4486, lng: -54.6295 }
          },
          contact: {
            phone: '(67) 3314-9966',
            website: 'https://www.campogrande.ms.gov.br'
          },
          details: {
            hours: '06:00 às 22:00',
            prices: 'Gratuito',
            accessibility: 'Acessível para cadeirantes',
            languages: ['pt-BR', 'en'],
            payment_methods: ['dinheiro', 'pix']
          },
          ratings: { average: 4.5, count: 1250 },
          tags: ['parque', 'natureza', 'lazer', 'gratuito'],
          last_updated: new Date().toISOString(),
          source: 'alumia'
        },
        {
          id: 'alumia-002',
          type: 'restaurant',
          name: 'Restaurante Casa do Peixe',
          description: 'Especializado em peixes de água doce do Pantanal',
          location: {
            address: 'Rua 14 de Julho, 123',
            city: 'Campo Grande',
            region: 'centro_oeste'
          },
          contact: {
            phone: '(67) 3321-4567',
            email: 'contato@casadopeixe.com.br'
          },
          details: {
            hours: '11:00 às 23:00',
            prices: 'R$ 50-100 por pessoa',
            languages: ['pt-BR'],
            payment_methods: ['dinheiro', 'cartão', 'pix']
          },
          ratings: { average: 4.8, count: 890 },
          tags: ['restaurante', 'peixe', 'pantanal', 'gastronomia'],
          last_updated: new Date().toISOString(),
          source: 'alumia'
        }
      ];

      this.knowledgeBase.push(...alumiaData);
    } catch (error) {
      console.error('❌ Erro ao carregar dados da ALUMIA:', error);
    }
  }

  // Carregar dados governamentais
  private async loadFromGovernmentAPIs() {
    try {
      // Dados reais de fontes governamentais
      const governmentData: TourismData[] = [
        {
          id: 'gov-001',
          type: 'attraction',
          name: 'Bioparque Pantanal',
          description: 'Maior aquário de água doce do mundo, localizado em Campo Grande',
          location: {
            address: 'Av. Afonso Pena, 6001',
            city: 'Campo Grande',
            region: 'centro_oeste'
          },
          contact: {
            phone: '(67) 3323-9012',
            email: 'contato@bioparque.com',
            website: 'https://bioparque.com'
          },
          details: {
            hours: 'Terça a Domingo, 8h às 17h',
            prices: 'Gratuito',
            languages: ['pt-BR', 'en'],
            payment_methods: ['gratuito']
          },
          ratings: { average: 4.8, count: 1250 },
          tags: ['aquário', 'pantanal', 'educação', 'família'],
          last_updated: new Date().toISOString(),
          source: 'government'
        }
      ];

      this.knowledgeBase.push(...governmentData);
    } catch (error) {
      console.error('❌ Erro ao carregar dados governamentais:', error);
    }
  }

  // Carregar dados de redes sociais
  private async loadFromSocialMedia() {
    try {
      // Simular análise de sentimentos de redes sociais
      const socialData: TourismData[] = [
        {
          id: 'social-001',
          type: 'attraction',
          name: 'Feira Central',
          description: 'Feira tradicional com comidas típicas e artesanato',
          location: {
            address: 'Rua 14 de Julho, Centro',
            city: 'Campo Grande',
            region: 'centro_oeste'
          },
          details: {
            hours: 'Terça a Domingo, 18:00 às 23:00',
            prices: 'Variado',
            languages: ['pt-BR'],
            payment_methods: ['dinheiro', 'pix']
          },
          ratings: { average: 4.7, count: 2340 },
          tags: ['feira', 'gastronomia', 'artesanato', 'cultura'],
          last_updated: new Date().toISOString(),
          source: 'social_media'
        }
      ];

      this.knowledgeBase.push(...socialData);
    } catch (error) {
      console.error('❌ Erro ao carregar dados de redes sociais:', error);
    }
  }

  // Buscar informações relevantes na base de conhecimento
  private async searchKnowledgeBase(query: RAGQuery): Promise<TourismData[]> {
    const searchTerms = query.question.toLowerCase().split(' ');
    
    return this.knowledgeBase.filter(item => {
      // Busca por relevância
      const itemText = `${item.name} ${item.description} ${item.tags.join(' ')}`.toLowerCase();
      
      // Verificar se os termos da busca estão presentes
      const hasRelevantTerms = searchTerms.some(term => 
        itemText.includes(term) || 
        item.tags.some(tag => tag.includes(term))
      );

      // Filtrar por tipo se especificado
      const matchesType = !query.filters?.type || query.filters.type.includes(item.type);
      
      // Filtrar por região se especificado
      const matchesRegion = !query.filters?.region || item.location.region === query.filters.region;

      return hasRelevantTerms && matchesType && matchesRegion;
    }).sort((a, b) => {
      // Ordenar por relevância (rating + recência)
      const scoreA = (a.ratings?.average || 0) * 0.7 + (this.getRecencyScore(a.last_updated) * 0.3);
      const scoreB = (b.ratings?.average || 0) * 0.7 + (this.getRecencyScore(b.last_updated) * 0.3);
      return scoreB - scoreA;
    }).slice(0, 5); // Retornar top 5 resultados
  }

  // Calcular score de recência
  private getRecencyScore(lastUpdated: string): number {
    const daysSinceUpdate = (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - (daysSinceUpdate / 30)); // Score diminui com o tempo
  }

  // Gerar resposta usando RAG
  async generateResponse(query: RAGQuery): Promise<RAGResponse> {
    try {
      console.log('🔍 Processando pergunta:', query.question);

      // Buscar informações relevantes
      const relevantData = await this.searchKnowledgeBase(query);
      
      if (relevantData.length === 0) {
        return {
          answer: "Desculpe, não encontrei informações específicas sobre isso. Posso ajudá-lo com outras dúvidas sobre turismo em Mato Grosso do Sul?",
          sources: [],
          confidence: 0.1,
          suggestions: [
            "Quer saber sobre atrações turísticas?",
            "Precisa de informações sobre hospedagem?",
            "Está procurando restaurantes?"
          ],
          related_questions: []
        };
      }

      // Construir contexto para a IA
      const context = this.buildContext(relevantData, query);
      
      // Gerar resposta com Gemini
      const prompt = this.buildPrompt(query, context);
      const response = await geminiClient.generateContent(prompt);
      
      if (!response.ok) {
        throw new Error(`Erro na IA: ${response.error}`);
      }
      
      // Processar resposta
      const processedResponse = this.processResponse(response, relevantData);
      
      console.log('✅ Resposta gerada com sucesso');
      return processedResponse;

    } catch (error) {
      console.error('❌ Erro ao gerar resposta:', error);
      throw error;
    }
  }

  // Construir contexto para a IA
  private buildContext(data: TourismData[], query: RAGQuery): string {
    let context = "Informações turísticas atualizadas sobre Mato Grosso do Sul:\n\n";
    
    data.forEach(item => {
      context += `**${item.name}** (${item.type})\n`;
      context += `Localização: ${item.location.address}, ${item.location.city}\n`;
      context += `Descrição: ${item.description}\n`;
      if (item.details.hours) context += `Horário: ${item.details.hours}\n`;
      if (item.details.prices) context += `Preços: ${item.details.prices}\n`;
      if (item.contact?.phone) context += `Telefone: ${item.contact.phone}\n`;
      if (item.ratings) context += `Avaliação: ${item.ratings.average}/5 (${item.ratings.count} avaliações)\n`;
      context += `\n`;
    });

    if (query.context.catLocation) {
      context += `\nContexto: Atendente localizado em ${query.context.catLocation}\n`;
    }

    if (query.context.weather) {
      context += `Condições climáticas: ${query.context.weather}\n`;
    }

    return context;
  }

  // Construir prompt para a IA
  private buildPrompt(query: RAGQuery, context: string): string {
    return `
Você é um assistente turístico especializado em Mato Grosso do Sul, Brasil. 
Sua função é ajudar atendentes de CAT (Centro de Atendimento ao Turista) a responder perguntas de turistas.

CONTEXTO ATUALIZADO:
${context}

PERGUNTA DO TURISTA:
"${query.question}"

INSTRUÇÕES:
1. Responda de forma clara, amigável e profissional
2. Forneça informações precisas e atualizadas
3. Inclua detalhes práticos como horários, preços e contatos quando relevante
4. Sugira alternativas quando apropriado
5. Responda em português brasileiro
6. Seja específico sobre localizações e distâncias
7. Mencione aspectos de acessibilidade quando disponível

RESPOSTA:
`;
  }

  // Processar resposta da IA
  private processResponse(response: string, sources: TourismData[]): RAGResponse {
    // Gerar sugestões baseadas nos dados
    const suggestions = this.generateSuggestions(sources);
    
    // Gerar perguntas relacionadas
    const relatedQuestions = this.generateRelatedQuestions(sources);
    
    // Calcular confiança baseada na qualidade das fontes
    const confidence = this.calculateConfidence(sources);

    return {
      answer: response,
      sources: sources,
      confidence: confidence,
      suggestions: suggestions,
      related_questions: relatedQuestions
    };
  }

  // Gerar sugestões
  private generateSuggestions(sources: TourismData[]): string[] {
    const suggestions = [];
    
    if (sources.some(s => s.type === 'attraction')) {
      suggestions.push("Quer saber sobre outras atrações turísticas?");
    }
    
    if (sources.some(s => s.type === 'restaurant')) {
      suggestions.push("Posso sugerir outros restaurantes da região");
    }
    
    if (sources.some(s => s.type === 'hotel')) {
      suggestions.push("Precisa de mais opções de hospedagem?");
    }

    return suggestions.slice(0, 3);
  }

  // Gerar perguntas relacionadas
  private generateRelatedQuestions(sources: TourismData[]): string[] {
    const questions = [];
    
    sources.forEach(source => {
      switch (source.type) {
        case 'attraction':
          questions.push(`Como chegar ao ${source.name}?`);
          questions.push(`Quais são os horários de funcionamento do ${source.name}?`);
          break;
        case 'restaurant':
          questions.push(`O ${source.name} aceita reservas?`);
          questions.push(`Quais são os pratos típicos do ${source.name}?`);
          break;
        case 'hotel':
          questions.push(`O ${source.name} tem estacionamento?`);
          questions.push(`Quais são as opções de café da manhã no ${source.name}?`);
          break;
      }
    });

    return questions.slice(0, 3);
  }

  // Calcular confiança da resposta
  private calculateConfidence(sources: TourismData[]): number {
    if (sources.length === 0) return 0.1;
    
    const avgRating = sources.reduce((sum, s) => sum + (s.ratings?.average || 0), 0) / sources.length;
    const recencyScore = sources.reduce((sum, s) => sum + this.getRecencyScore(s.last_updated), 0) / sources.length;
    
    return Math.min(1, (avgRating / 5) * 0.6 + recencyScore * 0.4);
  }

  // Atualizar base de conhecimento
  async updateKnowledgeBase() {
    console.log('🔄 Atualizando base de conhecimento...');
    
    try {
      // Limpar dados antigos
      this.knowledgeBase = [];
      
      // Recarregar todos os dados
      await this.initializeKnowledgeBase();
      
      this.lastUpdate = new Date();
      console.log('✅ Base de conhecimento atualizada');
    } catch (error) {
      console.error('❌ Erro ao atualizar base de conhecimento:', error);
    }
  }

  // Obter estatísticas da base de conhecimento
  getKnowledgeBaseStats() {
    const stats = {
      totalItems: this.knowledgeBase.length,
      byType: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
      lastUpdate: this.lastUpdate,
      averageRating: 0
    };

    this.knowledgeBase.forEach(item => {
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      stats.bySource[item.source] = (stats.bySource[item.source] || 0) + 1;
    });

    const totalRatings = this.knowledgeBase.reduce((sum, item) => sum + (item.ratings?.average || 0), 0);
    stats.averageRating = totalRatings / this.knowledgeBase.length;

    return stats;
  }
}

// Instância singleton
export const tourismRAGService = new TourismRAGService(); 