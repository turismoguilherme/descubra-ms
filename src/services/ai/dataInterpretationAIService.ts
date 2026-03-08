/**
 * Data Interpretation AI Service
 * SEGURANÇA: Usa callGeminiProxy (Edge Function) em vez de API key direta
 */

import { callGeminiProxy } from './geminiProxy';

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
  comparison: { withPrevious: string; withBenchmark: string };
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
  async interpretMetric(metric: MetricData): Promise<Interpretation> {
    try {
      const changePercent = metric.previousValue
        ? ((metric.value - metric.previousValue) / metric.previousValue) * 100
        : 0;

      const prompt = `
Você é um analista especializado em turismo e gestão pública. Analise a seguinte métrica:

Métrica: ${metric.name}
Valor Atual: ${metric.value} ${metric.unit || ''}
Período: ${metric.period}
${metric.previousValue ? `Valor Anterior: ${metric.previousValue} ${metric.unit || ''} (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%)` : ''}

Forneça uma resposta em JSON com:
{
  "explanation": "Explicação clara do que este número significa",
  "comparison": { "withPrevious": "Comparação com período anterior", "withBenchmark": "Comparação com cidades similares" },
  "trend": "increasing|decreasing|stable",
  "significance": "high|medium|low",
  "recommendations": ["recomendação1", "recomendação2"],
  "confidence": 0.0-1.0
}
`;
      const result = await callGeminiProxy(prompt, { temperature: 0.7, maxOutputTokens: 1500 });

      if (result.ok && result.text) {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
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
      }

      return this.getFallbackInterpretation(metric);
    } catch (error) {
      console.error('Erro ao interpretar métrica:', error);
      return this.getFallbackInterpretation(metric);
    }
  }

  async interpretDashboard(dashboardData: DashboardData): Promise<DashboardInsights> {
    try {
      const metricsSummary = dashboardData.metrics.map(m => {
        const change = m.previousValue ? ((m.value - m.previousValue) / m.previousValue) * 100 : 0;
        return `${m.name}: ${m.value} ${m.unit || ''} ${change !== 0 ? `(${change > 0 ? '+' : ''}${change.toFixed(1)}%)` : ''}`;
      }).join('\n');

      const prompt = `
Analise o seguinte dashboard de métricas turísticas:
Período: ${dashboardData.period}
Métricas:
${metricsSummary}

Forneça uma resposta em JSON:
{
  "summary": "Resumo executivo",
  "keyFindings": ["achado1", "achado2"],
  "trends": ["tendência1"],
  "alerts": ["alerta1 se houver"],
  "recommendations": ["recomendação1", "recomendação2"]
}
`;
      const result = await callGeminiProxy(prompt, { temperature: 0.7, maxOutputTokens: 1500 });

      if (result.ok && result.text) {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            summary: parsed.summary || '',
            keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
            trends: Array.isArray(parsed.trends) ? parsed.trends : [],
            alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
            recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
            generatedAt: new Date().toISOString(),
          };
        }
      }

      return this.getFallbackDashboardInsights(dashboardData);
    } catch (error) {
      console.error('Erro ao interpretar dashboard:', error);
      return this.getFallbackDashboardInsights(dashboardData);
    }
  }

  async generateInsights(municipalityId: string): Promise<Insight[]> {
    return [];
  }

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
          : 'Sem mudança significativa.',
        withBenchmark: 'Comparação não disponível no momento.',
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
