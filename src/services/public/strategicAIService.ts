/**
 * Strategic AI Service for Public Sector
 * Serviço do GUILHERME IA - IA estratégica especializado para secretarias de turismo
 */

import { supabase } from '@/integrations/supabase/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface MunicipalData {
  totalCATs: number;
  touristsToday: number;
  totalAttractions: number;
  totalEvents: number;
  cats: Array<{
    id: string;
    name: string;
    tourists: number;
    rating: number;
  }>;
  attractions: Array<{
    id: string;
    name: string;
    category: string;
    visitors: number;
  }>;
  events: Array<{
    id: string;
    name: string;
    date: string;
    participants: number;
  }>;
}

export interface StrategicRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'cats' | 'attractions' | 'events' | 'marketing' | 'infrastructure';
  estimatedImpact: string;
  estimatedCost?: string;
  estimatedROI?: string;
  actionItems: string[];
}

export interface StrategicAIResponse {
  answer: string;
  recommendations: StrategicRecommendation[];
  insights: string[];
  dataAnalysis: string;
  confidence: number;
  sources: string[];
}

export class StrategicAIService {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  /**
   * Buscar dados integrados de todos os módulos
   */
  async getIntegratedData(municipalityId?: string): Promise<{
    municipal: MunicipalData;
    events: any[];
    surveys: any;
    heatmap: any[];
    inventory: any[];
  }> {
    try {
      const municipal = await this.getMunicipalData(municipalityId);
      
      // Buscar eventos
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('approval_status', 'approved')
        .gte('start_date', new Date().toISOString())
        .limit(20);

      // Buscar dados de pesquisas (via analyticsService)
      const { analyticsService } = await import('@/services/public/analyticsService');
      const surveys = await analyticsService.aggregateSurveyData({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Buscar dados de heatmap (via tourismHeatmapService)
      const { tourismHeatmapService } = await import('@/services/tourismHeatmapService');
      const heatmap = await tourismHeatmapService.generateHeatmapData({
        timeRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        },
      });

      // Buscar inventário
      const { data: inventory } = await supabase
        .from('attractions')
        .select('*')
        .limit(50);

      return {
        municipal,
        events: events || [],
        surveys,
        heatmap,
        inventory: inventory || [],
      };
    } catch (error) {
      console.error('Erro ao buscar dados integrados:', error);
      const municipal = await this.getMunicipalData(municipalityId);
      return {
        municipal,
        events: [],
        surveys: null,
        heatmap: [],
        inventory: [],
      };
    }
  }

  /**
   * Buscar dados municipais do Supabase
   */
  async getMunicipalData(municipalityId?: string): Promise<MunicipalData> {
    try {
      // Buscar dados em paralelo
      const [catsResult, touristsResult, attractionsResult, eventsResult] = await Promise.all([
        supabase
          .from('cat_locations')
          .select('id, name, is_active')
          .eq('is_active', true),
        
        supabase
          .from('cat_tourists')
          .select('id, visit_date, cat_id')
          .eq('visit_date', new Date().toISOString().split('T')[0]),
        
        supabase
          .from('tourism_inventory')
          .select('id, name, category, is_active')
          .eq('is_active', true)
          .limit(10),
        
        supabase
          .from('events')
          .select('id, name, start_date, is_visible')
          .gte('start_date', new Date().toISOString())
          .eq('is_visible', true)
          .limit(10)
      ]);

      // Processar dados dos CATs
      const cats = (catsResult.data || []).map(async (cat) => {
        const { count } = await supabase
          .from('cat_tourists')
          .select('id', { count: 'exact', head: true })
          .eq('visit_date', new Date().toISOString().split('T')[0])
          .eq('cat_id', cat.id);
        
        return {
          id: cat.id,
          name: cat.name,
          tourists: count || 0,
          rating: 4.5 // TODO: Buscar de tabela de avaliações
        };
      });

      const catsWithStats = await Promise.all(cats);

      return {
        totalCATs: catsResult.data?.length || 0,
        touristsToday: touristsResult.data?.length || 0,
        totalAttractions: attractionsResult.data?.length || 0,
        totalEvents: eventsResult.data?.length || 0,
        cats: catsWithStats,
        attractions: (attractionsResult.data || []).map(item => ({
          id: item.id,
          name: item.name || '',
          category: item.category || 'outros',
          visitors: 0 // TODO: Buscar de analytics
        })),
        events: (eventsResult.data || []).map(item => ({
          id: item.id,
          name: item.name || '',
          date: item.start_date || '',
          participants: 0 // TODO: Buscar de analytics
        }))
      };
    } catch (error) {
      console.error('Erro ao buscar dados municipais:', error);
      return {
        totalCATs: 0,
        touristsToday: 0,
        totalAttractions: 0,
        totalEvents: 0,
        cats: [],
        attractions: [],
        events: []
      };
    }
  }

  /**
   * Analisar dados municipais e gerar recomendações
   */
  async analyzeMunicipalData(municipalityId?: string): Promise<StrategicRecommendation[]> {
    try {
      const data = await this.getMunicipalData(municipalityId);
      
      if (!this.genAI) {
        return this.getFallbackRecommendations(data);
      }

      const prompt = this.buildAnalysisPrompt(data);
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      return this.parseRecommendations(response, data);
    } catch (error) {
      console.error('Erro ao analisar dados municipais:', error);
      const data = await this.getMunicipalData(municipalityId);
      return this.getFallbackRecommendations(data);
    }
  }

  /**
   * Responder pergunta estratégica com contexto integrado de todos os módulos
   */
  async answerQuestion(question: string, municipalityId?: string): Promise<StrategicAIResponse> {
    try {
      const integratedData = await this.getIntegratedData(municipalityId);
      
      if (!this.genAI) {
        return this.getFallbackResponse(question, integratedData.municipal);
      }

      const prompt = this.buildIntegratedQuestionPrompt(question, integratedData);
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const recommendations = await this.analyzeMunicipalData(municipalityId);

      return {
        answer: response,
        recommendations: recommendations.slice(0, 5), // Top 5 recomendações
        insights: this.extractInsights(response),
        dataAnalysis: this.analyzeIntegratedDataSummary(integratedData),
        confidence: 0.90, // Maior confiança com dados integrados
        sources: [
          'Dados do Supabase',
          'Análise de tendências',
          'Benchmarking setorial',
          'Eventos aprovados',
          'Pesquisas com turistas',
          'Mapas de calor',
          'Inventário turístico'
        ]
      };
    } catch (error) {
      console.error('Erro ao responder pergunta:', error);
      const data = await this.getMunicipalData(municipalityId);
      return this.getFallbackResponse(question, data);
    }
  }

  /**
   * Construir prompt com dados integrados de todos os módulos
   */
  private buildIntegratedQuestionPrompt(
    question: string,
    data: {
      municipal: MunicipalData;
      events: any[];
      surveys: any;
      heatmap: any[];
      inventory: any[];
    }
  ): string {
    return `
Você é o GUILHERME IA, um assistente de IA estratégica para gestão de turismo. Analise os dados integrados abaixo e responda à pergunta do gestor público.

PERGUNTA: ${question}

DADOS MUNICIPAIS:
- Total de CATs: ${data.municipal.totalCATs}
- Turistas hoje: ${data.municipal.touristsToday}
- Eventos cadastrados: ${data.municipal.totalEvents}
- Atrações cadastradas: ${data.municipal.totalAttractions}

EVENTOS APROVADOS (${data.events.length}):
${data.events.slice(0, 5).map((e: any) => `- ${e.title || e.name}: ${e.start_date} em ${e.location}`).join('\n')}

PESQUISAS COM TURISTAS:
- Total de pesquisas: ${data.surveys?.total_surveys || 0}
- Origem predominante: ${data.surveys?.origin_distribution?.[0]?.origin || 'N/A'}
- Motivação principal: ${data.surveys?.motivation_distribution?.[0]?.motivation || 'N/A'}

MAPAS DE CALOR:
- Pontos de concentração: ${data.heatmap.length}
- Atrações mais visitadas: ${data.heatmap.slice(0, 3).map((h: any) => h.metadata?.popular_activities?.[0] || 'N/A').join(', ')}

INVENTÁRIO TURÍSTICO:
- Total de atrações: ${data.inventory.length}
- Categorias: ${[...new Set(data.inventory.map((i: any) => i.category))].join(', ')}

Com base nestes dados integrados, forneça:
1. Resposta direta à pergunta
2. Insights relevantes
3. Recomendações acionáveis
4. Análise cruzada dos dados

Resposta:
`;
  }

  /**
   * Resumir dados integrados
   */
  private analyzeIntegratedDataSummary(data: {
    municipal: MunicipalData;
    events: any[];
    surveys: any;
    heatmap: any[];
    inventory: any[];
  }): string {
    return `
Análise Integrada de Dados:
- ${data.municipal.total_attractions} atrações cadastradas
- ${data.events.length} eventos aprovados nos próximos 30 dias
- ${data.surveys?.total_surveys || 0} pesquisas com turistas realizadas
- ${data.heatmap.length} pontos de concentração turística identificados
- ${data.inventory.length} itens no inventário turístico
`;
  }

  /**
   * Construir prompt para análise de dados
   */
  private buildAnalysisPrompt(data: MunicipalData): string {
    return `Você é um consultor estratégico especializado em turismo municipal. Analise os seguintes dados de um município turístico:

DADOS DO MUNICÍPIO:
- Total de CATs: ${data.totalCATs}
- Turistas hoje: ${data.touristsToday}
- Total de atrações: ${data.totalAttractions}
- Total de eventos futuros: ${data.totalEvents}

PERFORMANCE DOS CATs:
${data.cats.map(cat => `- ${cat.name}: ${cat.tourists} turistas hoje, avaliação ${cat.rating}/5`).join('\n')}

ATRAÇÕES PRINCIPAIS:
${data.attractions.slice(0, 5).map(attr => `- ${attr.name} (${attr.category})`).join('\n')}

EVENTOS PROGRAMADOS:
${data.events.slice(0, 5).map(evt => `- ${evt.name} em ${evt.date}`).join('\n')}

Com base nestes dados, forneça 5 recomendações estratégicas prioritárias para melhorar o turismo municipal. Para cada recomendação, inclua:
1. Título claro e objetivo
2. Descrição detalhada
3. Prioridade (alta, média, baixa)
4. Categoria (cats, atrações, eventos, marketing, infraestrutura)
5. Impacto estimado
6. Itens de ação específicos

Responda em formato JSON estruturado.`;
  }

  /**
   * Construir prompt para pergunta do usuário
   */
  private buildQuestionPrompt(question: string, data: MunicipalData): string {
    return `Você é o GUILHERME IA, um assistente de IA estratégica especializado em turismo municipal. Um secretário de turismo está fazendo a seguinte pergunta:

PERGUNTA: "${question}"

CONTEXTO DOS DADOS DO MUNICÍPIO:
- Total de CATs: ${data.totalCATs}
- Turistas hoje: ${data.touristsToday}
- Total de atrações: ${data.totalAttractions}
- Total de eventos futuros: ${data.totalEvents}

PERFORMANCE DOS CATs:
${data.cats.map(cat => `- ${cat.name}: ${cat.tourists} turistas hoje, avaliação ${cat.rating}/5`).join('\n')}

Forneça uma resposta estratégica, prática e baseada em dados. Seja específico e ofereça recomendações acionáveis.`;
  }

  /**
   * Parsear recomendações da resposta da IA
   */
  private parseRecommendations(response: string, data: MunicipalData): StrategicRecommendation[] {
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.map((rec: any, index: number) => ({
          id: `rec-${index}`,
          title: rec.title || rec.titulo || 'Recomendação',
          description: rec.description || rec.descricao || '',
          priority: (rec.priority || rec.prioridade || 'medium').toLowerCase() as any,
          category: (rec.category || rec.categoria || 'marketing').toLowerCase() as any,
          estimatedImpact: rec.estimatedImpact || rec.impacto || 'Médio',
          estimatedCost: rec.estimatedCost || rec.custo,
          estimatedROI: rec.estimatedROI || rec.roi,
          actionItems: rec.actionItems || rec.itensAcao || []
        }));
      }
    } catch (error) {
      console.error('Erro ao parsear recomendações:', error);
    }

    return this.getFallbackRecommendations(data);
  }

  /**
   * Extrair insights da resposta
   */
  private extractInsights(response: string): string[] {
    // Extrair insights básicos (pode ser melhorado)
    const insights: string[] = [];
    const lines = response.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      if (line.includes('•') || line.includes('-') || line.match(/^\d+\./)) {
        insights.push(line.replace(/^[•\-\d+\.]\s*/, '').trim());
      }
    });

    return insights.slice(0, 5);
  }

  /**
   * Analisar resumo dos dados
   */
  private analyzeDataSummary(data: MunicipalData): string {
    const avgTouristsPerCAT = data.totalCATs > 0 ? (data.touristsToday / data.totalCATs).toFixed(1) : '0';
    return `O município possui ${data.totalCATs} CATs ativos, ${data.totalAttractions} atrações cadastradas e ${data.totalEvents} eventos programados. Hoje foram registrados ${data.touristsToday} turistas, com média de ${avgTouristsPerCAT} turistas por CAT.`;
  }

  /**
   * Recomendações de fallback (sem IA)
   */
  private getFallbackRecommendations(data: MunicipalData): StrategicRecommendation[] {
    const recommendations: StrategicRecommendation[] = [];

    if (data.totalCATs === 0) {
      recommendations.push({
        id: 'rec-1',
        title: 'Cadastrar Primeiro CAT',
        description: 'É necessário cadastrar pelo menos um Centro de Atendimento ao Turista para começar a operação.',
        priority: 'high',
        category: 'cats',
        estimatedImpact: 'Alto - Base para operação',
        actionItems: ['Acessar Gestão de CATs', 'Criar novo CAT com localização GPS', 'Definir raio de atuação']
      });
    }

    if (data.totalAttractions === 0) {
      recommendations.push({
        id: 'rec-2',
        title: 'Cadastrar Atrações Turísticas',
        description: 'Cadastre as principais atrações do município para aumentar a visibilidade turística.',
        priority: 'high',
        category: 'attractions',
        estimatedImpact: 'Alto - Aumenta atratividade',
        actionItems: ['Acessar Inventário Turístico', 'Adicionar novas atrações', 'Incluir fotos e informações']
      });
    }

    if (data.touristsToday === 0 && data.totalCATs > 0) {
      recommendations.push({
        id: 'rec-3',
        title: 'Promover Check-ins nos CATs',
        description: 'Incentive os turistas a fazerem check-in nos CATs para melhor rastreamento.',
        priority: 'medium',
        category: 'marketing',
        estimatedImpact: 'Médio - Melhora dados',
        actionItems: ['Criar campanha de incentivo', 'Treinar atendentes', 'Divulgar benefícios do check-in']
      });
    }

    if (data.totalEvents === 0) {
      recommendations.push({
        id: 'rec-4',
        title: 'Planejar Eventos Turísticos',
        description: 'Eventos são importantes para atrair turistas e aumentar a permanência.',
        priority: 'medium',
        category: 'events',
        estimatedImpact: 'Alto - Aumenta permanência',
        actionItems: ['Acessar Gestão de Eventos', 'Criar eventos sazonais', 'Integrar com calendário estadual']
      });
    }

    if (data.cats.length > 0) {
      const avgTourists = data.cats.reduce((sum, cat) => sum + cat.tourists, 0) / data.cats.length;
      if (avgTourists < 10) {
        recommendations.push({
          id: 'rec-5',
          title: 'Melhorar Visibilidade dos CATs',
          description: 'Os CATs estão recebendo poucos turistas. Considere melhorar a sinalização e divulgação.',
          priority: 'medium',
          category: 'marketing',
          estimatedImpact: 'Médio - Aumenta atendimentos',
          actionItems: ['Melhorar sinalização', 'Criar campanha de marketing', 'Parcerias com hotéis']
        });
      }
    }

    return recommendations;
  }

  /**
   * Resposta de fallback (sem IA)
   */
  private getFallbackResponse(question: string, data: MunicipalData): StrategicAIResponse {
    const recommendations = this.getFallbackRecommendations(data);
    
    let answer = 'Com base nos dados do município, ';
    
    if (question.toLowerCase().includes('cat')) {
      answer += `você possui ${data.totalCATs} CATs ativos. `;
      if (data.totalCATs === 0) {
        answer += 'Recomendo cadastrar pelo menos um CAT para começar a operação.';
      } else {
        answer += `Hoje foram registrados ${data.touristsToday} turistas.`;
      }
    } else if (question.toLowerCase().includes('atraç') || question.toLowerCase().includes('atrativ')) {
      answer += `você possui ${data.totalAttractions} atrações cadastradas. `;
      if (data.totalAttractions === 0) {
        answer += 'Recomendo cadastrar as principais atrações do município.';
      }
    } else if (question.toLowerCase().includes('event')) {
      answer += `você possui ${data.totalEvents} eventos programados. `;
      if (data.totalEvents === 0) {
        answer += 'Recomendo planejar eventos para atrair mais turistas.';
      }
    } else {
      answer += `o município possui ${data.totalCATs} CATs, ${data.totalAttractions} atrações e ${data.totalEvents} eventos. Hoje foram registrados ${data.touristsToday} turistas.`;
    }

    return {
      answer,
      recommendations: recommendations.slice(0, 5),
      insights: [
        `Total de ${data.totalCATs} CATs ativos`,
        `${data.touristsToday} turistas registrados hoje`,
        `${data.totalAttractions} atrações cadastradas`
      ],
      dataAnalysis: this.analyzeDataSummary(data),
      confidence: 0.7,
      sources: ['Dados do Supabase']
    };
  }
}

export const strategicAIService = new StrategicAIService();

