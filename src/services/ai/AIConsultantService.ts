import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/integrations/supabase/client';
import { alumiaService } from '@/services/alumia';
import { masterDashboardService } from '@/services/masterDashboardService';

// Interfaces para a IA Consultora
export interface TourismData {
  userProfiles: UserProfile[];
  checkIns: CheckIn[];
  events: Event[];
  reviews: Review[];
  climaticData?: any;
  alumiaData?: any;
}

export interface UserProfile {
  id: string;
  age_range?: string;
  gender?: string;
  origin_city?: string;
  origin_state?: string;
  interests?: string[];
  created_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  location_id: string;
  location_name: string;
  timestamp: string;
  rating?: number;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  attendees_count: number;
  satisfaction_rating?: number;
  category: string;
}

export interface Review {
  id: string;
  location_id: string;
  rating: number;
  comment: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  created_at: string;
}

export interface AIConsultantQuery {
  question: string;
  context: {
    userRole: string;
    cityId?: string;
    regionId?: string;
    timeframe?: string;
  };
}

export interface AIConsultantResponse {
  answer: string;
  insights: string[];
  recommendations: string[];
  alerts?: string[];
  charts?: ChartData[];
  confidence: number;
  sources: string[];
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: any[];
  config?: any;
}

class AIConsultantService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ VITE_GEMINI_API_KEY não configurada. IA funcionará em modo simulação.');
      this.genAI = null as any;
      this.model = null;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
  }

  /**
   * Processa uma consulta do gestor e retorna insights estratégicos
   */
  async processQuery(query: AIConsultantQuery): Promise<AIConsultantResponse> {
    console.log('🤖 AIConsultant: Processando consulta:', query.question);

    try {
      // 1. Coletar dados relevantes
      const tourismData = await this.collectTourismData(query.context);
      
      // 2. Gerar prompt contextualizado
      const prompt = this.generatePrompt(query, tourismData);
      
      // 3. Consultar IA ou usar simulação
      let aiResponse: string;
      if (this.model) {
        const result = await this.model.generateContent(prompt);
      
      if (!result.ok) {
        throw new Error(`Erro na consultoria IA: ${result.error}`);
      }
        aiResponse = result.response.text();
      } else {
        aiResponse = this.generateSimulatedResponse(query, tourismData);
      }

      // 4. Processar resposta e extrair insights
      const response = this.parseAIResponse(aiResponse, tourismData);

      // 5. Log da interação para análise
      await this.logInteraction(query, response);

      return response;

    } catch (error) {
      console.error('❌ Erro no AIConsultant:', error);
      
      // Fallback para resposta simulada em caso de erro
      const tourismData = await this.collectTourismData(query.context);
      const response = this.generateFallbackResponse(query, tourismData);
      
      // Notificar master dashboard sobre erro
      await masterDashboardService.sendAlert({
        type: 'system',
        severity: 'warning',
        message: `Falha ao processar consulta: ${error}`,
        source: 'ai_consultant'
      });

      return response;
    }
  }

  /**
   * Coleta dados turísticos relevantes baseado no contexto
   */
  private async collectTourismData(context: AIConsultantQuery['context']): Promise<TourismData> {
    console.log('📊 Coletando dados turísticos para contexto:', context);

    const data: TourismData = {
      userProfiles: [],
      checkIns: [],
      events: [],
      reviews: []
    };

    try {
      // Filtros baseados no contexto do usuário e role
      let scopeFilter = '';
      let scopeDescription = '';

      console.log('📊 Determinando escopo dos dados baseado no role:', context.userRole);

      if (context.userRole === 'gestor_municipal' && context.cityId) {
        scopeFilter = `AND city_id = '${context.cityId}'`;
        scopeDescription = 'Dados municipais';
      } else if (context.userRole === 'gestor_igr' && context.regionId) {
        scopeFilter = `AND region_id = '${context.regionId}'`;
        scopeDescription = 'Dados regionais';
      } else if (context.userRole === 'diretor_estadual') {
        // Diretor estadual vê dados de todo o estado (sem filtro específico)
        scopeFilter = '';
        scopeDescription = 'Dados estaduais (MS)';
      } else {
        // Fallback para city/region específicos se fornecidos
        if (context.cityId) {
          scopeFilter = `AND city_id = '${context.cityId}'`;
          scopeDescription = 'Dados municipais';
        } else if (context.regionId) {
          scopeFilter = `AND region_id = '${context.regionId}'`;
          scopeDescription = 'Dados regionais';
        }
      }

      console.log('📊 Escopo de dados determinado:', scopeDescription, 'Filtro:', scopeFilter);

      // Coletar perfis de usuários
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, age_range, gender, origin_city, origin_state, interests, created_at')
        .limit(1000);

      if (profiles) data.userProfiles = profiles;

      // Coletar check-ins recentes
      const { data: checkIns } = await supabase
        .from('passport_stamps')
        .select(`
          id,
          user_id,
          location_id,
          location_name,
          created_at,
          rating
        `)
        .gte('created_at', this.getTimeframeDate(context.timeframe))
        .limit(500);

      if (checkIns) {
        data.checkIns = checkIns.map(c => ({
          id: c.id,
          user_id: c.user_id,
          location_id: c.location_id,
          location_name: c.location_name || 'Local não identificado',
          timestamp: c.created_at,
          rating: c.rating
        }));
      }

      // Coletar eventos
      const { data: events } = await supabase
        .from('events')
        .select('id, name, date, attendees_count, satisfaction_rating, category')
        .gte('date', this.getTimeframeDate(context.timeframe))
        .limit(100);

      if (events) data.events = events;

      // Coletar reviews/avaliações
      const { data: reviews } = await supabase
        .from('location_reviews')
        .select('id, location_id, rating, comment, created_at')
        .gte('created_at', this.getTimeframeDate(context.timeframe))
        .limit(200);

      if (reviews) {
        data.reviews = reviews.map(r => ({
          ...r,
          sentiment: this.analyzeSentiment(r.comment)
        }));
      }

      // Tentar coletar dados da Alumia
      try {
        data.alumiaData = await alumiaService.getTourismInsights(context.regionId || 'ms');
      } catch (error) {
        console.warn('⚠️ Dados Alumia indisponíveis:', error);
      }

    } catch (error) {
      console.error('❌ Erro ao coletar dados:', error);
    }

    console.log('📊 Dados coletados:', {
      profiles: data.userProfiles.length,
      checkIns: data.checkIns.length,
      events: data.events.length,
      reviews: data.reviews.length
    });

    return data;
  }

  /**
   * Gera prompt contextualizado para a IA
   */
  private generatePrompt(query: AIConsultantQuery, data: TourismData): string {
    const stats = this.generateDataStats(data);
    
    // Determinar contexto específico por role
    let roleContext = '';
    let responsibilityScope = '';
    
    switch(query.context.userRole) {
      case 'gestor_municipal':
        roleContext = 'Gestor Municipal de Turismo';
        responsibilityScope = 'Você é responsável pelo desenvolvimento turístico municipal, focando em destinos locais, eventos da cidade, satisfação dos visitantes e crescimento da receita turística local.';
        break;
      case 'gestor_igr':
        roleContext = 'Gestor de IGR (Instância de Governança Regional)';
        responsibilityScope = 'Você supervisiona múltiplas cidades da região, coordena estratégias regionais, promove rotas turísticas integradas e otimiza a competitividade regional.';
        break;
      case 'diretor_estadual':
        roleContext = 'Diretor Estadual de Turismo';
        responsibilityScope = 'Você lidera o turismo de todo o estado de MS, define políticas públicas estaduais, coordena regiões turísticas e promove o estado nacional e internacionalmente.';
        break;
      default:
        roleContext = 'Gestor de Turismo';
        responsibilityScope = 'Você trabalha com desenvolvimento turístico e precisa de insights estratégicos baseados em dados.';
    }
    
    return `
Você é uma IA Consultora Estratégica especializada em turismo para gestores públicos de Mato Grosso do Sul.

CONTEXTO DO GESTOR:
- Cargo: ${roleContext}
- Responsabilidades: ${responsibilityScope}
- Região: ${query.context.regionId || 'Todo o estado (MS)'}
- Cidade: ${query.context.cityId || 'Múltiplas cidades'}
- Período de análise: ${query.context.timeframe || 'Último mês'}

DADOS DISPONÍVEIS:
${stats}

PERGUNTA DO GESTOR:
"${query.question}"

INSTRUÇÕES PARA RESPOSTA:
1. Seja objetivo e estratégico
2. Use os dados fornecidos para fundamentar suas recomendações
3. Forneça insights acionáveis
4. Identifique oportunidades e riscos
5. Sugira métricas para acompanhamento
6. Mantenha tom profissional mas acessível

FORMATO DA RESPOSTA (JSON):
{
  "answer": "Resposta principal detalhada",
  "insights": ["insight1", "insight2", "insight3"],
  "recommendations": ["recomendação1", "recomendação2"],
  "alerts": ["alerta1", "alerta2"] (se houver),
  "confidence": 0.85 (0-1),
  "sources": ["fonte1", "fonte2"]
}
`;
  }

  /**
   * Gera estatísticas dos dados para o prompt
   */
  private generateDataStats(data: TourismData): string {
    const totalVisitors = data.userProfiles.length;
    const totalCheckIns = data.checkIns.length;
    const avgRating = data.reviews.length > 0 
      ? (data.reviews.reduce((sum, r) => sum + r.rating, 0) / data.reviews.length).toFixed(1)
      : 'N/A';

    // Análise de origem dos visitantes
    const origins = data.userProfiles.reduce((acc, profile) => {
      const origin = `${profile.origin_city || 'N/A'}, ${profile.origin_state || 'N/A'}`;
      acc[origin] = (acc[origin] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topOrigins = Object.entries(origins)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([origin, count]) => `${origin}: ${count} visitantes`)
      .join(', ');

    // Análise de sentimento
    const sentiments = data.reviews.reduce((acc, review) => {
      acc[review.sentiment || 'neutral']++;
      return acc;
    }, { positive: 0, negative: 0, neutral: 0 });

    return `
📊 ESTATÍSTICAS ATUAIS:
- Total de visitantes cadastrados: ${totalVisitors}
- Total de check-ins no período: ${totalCheckIns}
- Avaliação média dos destinos: ${avgRating}/5
- Principais origens: ${topOrigins || 'Dados insuficientes'}
- Sentimento das avaliações: ${sentiments.positive} positivas, ${sentiments.negative} negativas, ${sentiments.neutral} neutras
- Eventos realizados: ${data.events.length}
${data.alumiaData ? '- Dados externos (Alumia): Disponíveis' : '- Dados externos: Limitados'}
`;
  }

  /**
   * Analisa sentimento básico de um comentário
   */
  private analyzeSentiment(comment: string): 'positive' | 'negative' | 'neutral' {
    if (!comment) return 'neutral';
    
    const positiveWords = ['ótimo', 'excelente', 'maravilhoso', 'incrível', 'fantástico', 'perfeito', 'adorei', 'recomendo'];
    const negativeWords = ['ruim', 'péssimo', 'horrível', 'terrível', 'decepcionante', 'não recomendo', 'problemático'];
    
    const lowerComment = comment.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerComment.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerComment.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Converte timeframe em data
   */
  private getTimeframeDate(timeframe?: string): string {
    const now = new Date();
    switch (timeframe) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case 'quarter':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      case 'year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  /**
   * Processa resposta da IA
   */
  private parseAIResponse(aiResponse: string, data: TourismData): AIConsultantResponse {
    try {
      // Tentar parsear como JSON
      const parsed = JSON.parse(aiResponse);
      return {
        ...parsed,
        charts: this.generateRelevantCharts(data, parsed.insights || [])
      };
    } catch (error) {
      // Fallback se não for JSON válido
      return {
        answer: aiResponse,
        insights: ['Análise baseada nos dados disponíveis'],
        recommendations: ['Continuar monitorando métricas principais'],
        confidence: 0.7,
        sources: ['Dados OverFlow One'],
        charts: this.generateRelevantCharts(data, [])
      };
    }
  }

  /**
   * Gera gráficos relevantes baseados nos dados
   */
  private generateRelevantCharts(data: TourismData, insights: string[]): ChartData[] {
    const charts: ChartData[] = [];

    // Gráfico de visitação por período
    if (data.checkIns.length > 0) {
      const checkInsByMonth = data.checkIns.reduce((acc, checkIn) => {
        const month = new Date(checkIn.timestamp).toLocaleString('pt-BR', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      charts.push({
        type: 'line',
        title: 'Visitação ao Longo do Tempo',
        data: Object.entries(checkInsByMonth).map(([month, count]) => ({
          month,
          visitantes: count
        }))
      });
    }

    // Gráfico de origem dos visitantes
    if (data.userProfiles.length > 0) {
      const originCounts = data.userProfiles.reduce((acc, profile) => {
        const state = profile.origin_state || 'Não informado';
        acc[state] = (acc[state] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      charts.push({
        type: 'pie',
        title: 'Origem dos Visitantes por Estado',
        data: Object.entries(originCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 8)
          .map(([state, count]) => ({
            estado: state,
            visitantes: count
          }))
      });
    }

    // Gráfico de satisfação
    if (data.reviews.length > 0) {
      const ratingCounts = data.reviews.reduce((acc, review) => {
        const rating = Math.floor(review.rating);
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      charts.push({
        type: 'bar',
        title: 'Distribuição de Avaliações',
        data: Object.entries(ratingCounts).map(([rating, count]) => ({
          avaliacao: `${rating} estrela${parseInt(rating) > 1 ? 's' : ''}`,
          quantidade: count
        }))
      });
    }

    return charts;
  }

  /**
   * Gera resposta simulada quando IA não está disponível
   */
  private generateSimulatedResponse(query: AIConsultantQuery, data: TourismData): string {
    const stats = this.generateDataStats(data);
    
    return JSON.stringify({
      answer: `Com base nos dados disponíveis (${data.checkIns.length} check-ins, ${data.userProfiles.length} perfis de usuários), posso oferecer insights sobre "${query.question}". Os dados mostram um padrão interessante de visitação que merece atenção estratégica.`,
      insights: [
        `${data.checkIns.length} interações registradas no período analisado`,
        `Perfil diversificado de visitantes com ${data.userProfiles.length} registros`,
        'Oportunidade de aprofundar análise com mais dados históricos'
      ],
      recommendations: [
        'Implementar coleta sistemática de feedback dos visitantes',
        'Desenvolver campanhas segmentadas por perfil de turista',
        'Monitorar tendências sazonais para otimizar recursos'
      ],
      confidence: 0.75,
              sources: ['Dados OverFlow One', 'Análise de padrões']
    });
  }

  /**
   * Gera resposta de fallback em caso de erro
   */
  private generateFallbackResponse(query: AIConsultantQuery, data: TourismData): AIConsultantResponse {
    return {
      answer: 'Desculpe, houve um problema temporário na análise. Com base nos dados básicos disponíveis, posso oferecer algumas orientações gerais.',
      insights: [
        'Sistema funcionando em modo limitado',
        'Dados básicos ainda disponíveis para análise',
        'Recomendo tentar novamente em alguns minutos'
      ],
      recommendations: [
        'Verificar conectividade para análises mais detalhadas',
        'Usar métricas básicas disponíveis no dashboard',
        'Contactar suporte se o problema persistir'
      ],
      alerts: ['Sistema de IA temporariamente indisponível'],
      confidence: 0.5,
      sources: ['Sistema local'],
      charts: this.generateRelevantCharts(data, [])
    };
  }

  /**
   * Registra interação para análise e melhoria
   */
  private async logInteraction(query: AIConsultantQuery, response: AIConsultantResponse): Promise<void> {
    try {
      await supabase.from('ai_consultant_logs').insert({
        question: query.question,
        context: query.context,
        response_summary: response.answer.substring(0, 200),
        confidence: response.confidence,
        insights_count: response.insights?.length || 0,
        recommendations_count: response.recommendations?.length || 0,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.warn('⚠️ Falha ao registrar interação:', error);
    }
  }

  /**
   * Gera insights proativos baseados nos dados
   */
  async generateProactiveInsights(context: AIConsultantQuery['context']): Promise<string[]> {
    const data = await this.collectTourismData(context);
    const insights: string[] = [];

    // Análise de tendências
    if (data.checkIns.length > 0) {
      const recentCheckIns = data.checkIns.filter(
        c => new Date(c.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      
      if (recentCheckIns.length > data.checkIns.length * 0.5) {
        insights.push('📈 Aumento significativo na visitação esta semana');
      }
    }

    // Análise de satisfação
    if (data.reviews.length > 0) {
      const avgRating = data.reviews.reduce((sum, r) => sum + r.rating, 0) / data.reviews.length;
      if (avgRating < 3.5) {
        insights.push('⚠️ Queda na satisfação dos visitantes - necessita atenção');
      } else if (avgRating > 4.5) {
        insights.push('🎉 Excelente nível de satisfação dos visitantes');
      }
    }

    // Análise sazonal
    const currentMonth = new Date().getMonth();
    if ([11, 0, 1].includes(currentMonth)) { // Verão
      insights.push('🌞 Período de alta temporada - otimizar capacidade e recursos');
    }

    return insights;
  }
}

export const aiConsultantService = new AIConsultantService(); 