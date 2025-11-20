/**
 * Data Interpretation AI Service
 * Serviço de IA para interpretar métricas e gerar insights automáticos
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface MetricData {
  name: string;
  value: number;
  unit?: string;
  period: string;
  previousValue?: number;
  context?: any;
}

export interface Interpretation {
  explanation: string;
  comparison: {
    withPrevious: string;
    withBenchmark: string;
  };
  trend: 'increasing' | 'decreasing' | 'stable';
  significance: 'high' | 'medium' | 'low';
  recommendations: string[];
  confidence: number;
}

export interface DashboardData {
  metrics: MetricData[];
  municipalityId?: string;
  period: string;
}

export interface DashboardInsights {
  summary: string;
  keyFindings: string[];
  trends: string[];
  alerts: string[];
  recommendations: string[];
  generatedAt: string;
}

export interface Insight {
  type: 'trend' | 'anomaly' | 'opportunity' | 'alert';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  actionItems?: string[];
}

export class DataInterpretationAIService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
  }

  /**
   * Interpretar uma métrica específica
   */
  async interpretMetric(metric: MetricData): Promise<Interpretation> {
    try {
      if (!this.genAI) {
        return this.getFallbackInterpretation(metric);
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const changePercent = metric.previousValue
        ? ((metric.value - metric.previousValue) / metric.previousValue) * 100
        : 0;

      const prompt = `
Você é um analista especializado em turismo e gestão pública. Analise a seguinte métrica e forneça uma interpretação completa:

Métrica: ${metric.name}
Valor Atual: ${metric.value} ${metric.unit || ''}
Período: ${metric.period}
${metric.previousValue ? `Valor Anterior: ${metric.previousValue} ${metric.unit || ''} (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%)` : ''}

Contexto: ${JSON.stringify(metric.context || {})}

Forneça uma resposta em JSON com:
{
  "explanation": "Explicação clara do que este número significa em linguagem simples",
  "comparison": {
    "withPrevious": "Comparação com período anterior",
    "withBenchmark": "Comparação com outras cidades similares (estimativa)"
  },
  "trend": "increasing|decreasing|stable",
  "significance": "high|medium|low",
  "recommendations": ["recomendação1", "recomendação2"],
  "confidence": 0.0-1.0
}

Seja específico, útil e acionável. Use linguagem clara para gestores públicos.
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          explanation: parsed.explanation || '',
          comparison: {
            withPrevious: parsed.comparison?.withPrevious || '',
            withBenchmark: parsed.comparison?.withBenchmark || '',
          },
          trend: parsed.trend || 'stable',
          significance: parsed.significance || 'medium',
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
          confidence: parsed.confidence || 0.7,
        };
      }

      return this.getFallbackInterpretation(metric);
    } catch (error) {
      console.error('Erro ao interpretar métrica:', error);
      return this.getFallbackInterpretation(metric);
    }
  }

  /**
   * Interpretar conjunto de métricas do dashboard
   */
  async interpretDashboard(dashboardData: DashboardData): Promise<DashboardInsights> {
    try {
      if (!this.genAI) {
        return this.getFallbackDashboardInsights(dashboardData);
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const metricsSummary = dashboardData.metrics.map(m => {
        const change = m.previousValue
          ? ((m.value - m.previousValue) / m.previousValue) * 100
          : 0;
        return `${m.name}: ${m.value} ${m.unit || ''} ${change !== 0 ? `(${change > 0 ? '+' : ''}${change.toFixed(1)}%)` : ''}`;
      }).join('\n');

      const prompt = `
Você é um consultor estratégico especializado em turismo e gestão pública municipal. Analise o seguinte dashboard de métricas turísticas e forneça insights acionáveis:

Período: ${dashboardData.period}
Métricas:
${metricsSummary}

Forneça uma resposta em JSON:
{
  "summary": "Resumo executivo em 2-3 frases",
  "keyFindings": ["achado1", "achado2", "achado3"],
  "trends": ["tendência1", "tendência2"],
  "alerts": ["alerta1 se houver", "alerta2 se houver"],
  "recommendations": ["recomendação acionável1", "recomendação acionável2"],
  "generatedAt": "${new Date().toISOString()}"
}

Seja específico, acionável e focado em ajudar gestores públicos a tomar decisões.
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || '',
          keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
          trends: Array.isArray(parsed.trends) ? parsed.trends : [],
          alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
          generatedAt: parsed.generatedAt || new Date().toISOString(),
        };
      }

      return this.getFallbackDashboardInsights(dashboardData);
    } catch (error) {
      console.error('Erro ao interpretar dashboard:', error);
      return this.getFallbackDashboardInsights(dashboardData);
    }
  }

  /**
   * Gerar insights automáticos para um município
   */
  async generateInsights(municipalityId: string): Promise<Insight[]> {
    try {
      // Esta função será expandida para buscar dados reais do município
      // Por enquanto, retorna insights genéricos
      
      if (!this.genAI) {
        return [];
      }

      // TODO: Buscar dados reais do município do Supabase
      // Por enquanto, retornar array vazio
      return [];
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
      return [];
    }
  }

  /**
   * Fallback quando IA não está disponível
   */
  private getFallbackInterpretation(metric: MetricData): Interpretation {
    const changePercent = metric.previousValue
      ? ((metric.value - metric.previousValue) / metric.previousValue) * 100
      : 0;

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (changePercent > 5) trend = 'increasing';
    else if (changePercent < -5) trend = 'decreasing';

    return {
      explanation: `A métrica "${metric.name}" está em ${metric.value} ${metric.unit || ''} no período ${metric.period}.`,
      comparison: {
        withPrevious: changePercent !== 0
          ? `${changePercent > 0 ? 'Aumento' : 'Redução'} de ${Math.abs(changePercent).toFixed(1)}% em relação ao período anterior.`
          : 'Sem mudança significativa em relação ao período anterior.',
        withBenchmark: 'Comparação com outras cidades não disponível no momento.',
      },
      trend,
      significance: Math.abs(changePercent) > 10 ? 'high' : Math.abs(changePercent) > 5 ? 'medium' : 'low',
      recommendations: changePercent < -5
        ? ['Investigar causas da redução', 'Considerar ações de marketing']
        : changePercent > 5
        ? ['Manter estratégias atuais', 'Aproveitar crescimento']
        : ['Manter monitoramento'],
      confidence: 0.6,
    };
  }

  /**
   * Fallback para insights do dashboard
   */
  private getFallbackDashboardInsights(dashboardData: DashboardData): DashboardInsights {
    return {
      summary: `Dashboard de métricas turísticas para o período ${dashboardData.period}. ${dashboardData.metrics.length} métricas analisadas.`,
      keyFindings: dashboardData.metrics.map(m => `${m.name}: ${m.value} ${m.unit || ''}`),
      trends: [],
      alerts: [],
      recommendations: ['Revise os dados regularmente', 'Compare com períodos anteriores'],
      generatedAt: new Date().toISOString(),
    };
  }
}

export const dataInterpretationAIService = new DataInterpretationAIService();

