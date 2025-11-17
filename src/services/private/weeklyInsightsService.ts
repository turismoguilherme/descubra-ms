/**
 * Weekly Insights Service
 * Gera e envia insights semanais automáticos por email
 */

import { supabase } from '@/integrations/supabase/client';
import { AnalysisResult } from '@/services/diagnostic/analysisService';

export interface WeeklyInsight {
  week: string;
  summary: {
    score: number;
    scoreChange: number;
    topRecommendations: number;
    metrics: {
      occupancy?: number;
      revenue?: number;
      rating?: number;
    };
  };
  insights: string[];
  recommendations: {
    priority: number;
    name: string;
    description: string;
  }[];
  trends: {
    metric: string;
    change: number;
    direction: 'up' | 'down' | 'stable';
  }[];
}

export class WeeklyInsightsService {
  /**
   * Gerar insights semanais
   */
  async generateWeeklyInsights(
    userId: string,
    analysisResult: AnalysisResult | null,
    previousWeekData?: WeeklyInsight
  ): Promise<WeeklyInsight> {
    const currentWeek = this.getCurrentWeek();

    if (!analysisResult) {
      return {
        week: currentWeek,
        summary: {
          score: 0,
          scoreChange: 0,
          topRecommendations: 0,
          metrics: {}
        },
        insights: ['Complete o diagnóstico para receber insights semanais personalizados.'],
        recommendations: [],
        trends: []
      };
    }

    // Calcular mudanças em relação à semana anterior
    const scoreChange = previousWeekData
      ? analysisResult.overallScore - previousWeekData.summary.score
      : 0;

    // Gerar insights baseados no resultado
    const insights: string[] = [];
    
    if (scoreChange > 0) {
      insights.push(`Seu score melhorou ${scoreChange} pontos percentuais esta semana! Continue implementando as recomendações.`);
    } else if (scoreChange < 0) {
      insights.push(`Seu score diminuiu ${Math.abs(scoreChange)} pontos percentuais. Revise as recomendações prioritárias.`);
    } else {
      insights.push('Seu score manteve-se estável. Foque em implementar novas recomendações para acelerar o crescimento.');
    }

    if (analysisResult.overallScore >= 80) {
      insights.push('Parabéns! Seu negócio está em excelente condição. Continue mantendo os padrões de qualidade.');
    }

    // Top recomendações
    const topRecommendations = analysisResult.recommendations
      .filter(r => r.priority <= 2)
      .slice(0, 3)
      .map(r => ({
        priority: r.priority,
        name: r.name,
        description: r.description
      }));

    // Tendências (simulado - em produção viria de dados reais)
    const trends = [
      {
        metric: 'Score Geral',
        change: scoreChange,
        direction: scoreChange > 0 ? 'up' : scoreChange < 0 ? 'down' : 'stable' as const
      }
    ];

    return {
      week: currentWeek,
      summary: {
        score: analysisResult.overallScore,
        scoreChange,
        topRecommendations: topRecommendations.length,
        metrics: {}
      },
      insights,
      recommendations: topRecommendations,
      trends
    };
  }

  /**
   * Enviar insights semanais por email
   */
  async sendWeeklyInsightsEmail(
    userId: string,
    userEmail: string,
    insights: WeeklyInsight
  ): Promise<boolean> {
    try {
      // Gerar HTML do email
      const emailHtml = this.generateEmailHTML(insights);
      const emailText = this.generateEmailText(insights);

      // Chamar edge function de envio de email
      const { data, error } = await supabase.functions.invoke('send-email-via-gateway', {
        body: {
          to: userEmail,
          subject: `📊 ViaJAR - Insights Semanais - Semana ${insights.week}`,
          body: emailText,
          html: emailHtml,
          aiGenerated: true
        }
      });

      if (error) {
        console.error('Erro ao enviar email de insights:', error);
        return false;
      }

      // Salvar log do envio
      await this.saveInsightsLog(userId, insights);

      return true;
    } catch (error) {
      console.error('Erro ao enviar insights semanais:', error);
      return false;
    }
  }

  /**
   * Gerar HTML do email
   */
  private generateEmailHTML(insights: WeeklyInsight): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .metric { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .insight { background: #e3f2fd; padding: 15px; margin: 10px 0; border-radius: 8px; }
          .recommendation { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #4caf50; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Insights Semanais ViaJAR</h1>
            <p>Semana ${insights.week}</p>
          </div>
          <div class="content">
            <div class="metric">
              <h2>Score Geral: ${insights.summary.score}%</h2>
              <p>${insights.summary.scoreChange > 0 ? '+' : ''}${insights.summary.scoreChange} pontos em relação à semana anterior</p>
            </div>
            
            <h3>💡 Principais Insights</h3>
            ${insights.insights.map(insight => `<div class="insight">${insight}</div>`).join('')}
            
            <h3>🎯 Recomendações Prioritárias</h3>
            ${insights.recommendations.map(rec => `
              <div class="recommendation">
                <strong>${rec.name}</strong>
                <p>${rec.description}</p>
              </div>
            `).join('')}
            
            <div class="footer">
              <p>Acesse seu dashboard para ver mais detalhes: <a href="https://viajar.com.br/dashboard">ViaJAR Dashboard</a></p>
              <p>© 2024 ViaJAR - Plataforma de Inteligência Turística</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Gerar texto do email
   */
  private generateEmailText(insights: WeeklyInsight): string {
    return `
ViaJAR - Insights Semanais
Semana ${insights.week}

Score Geral: ${insights.summary.score}%
${insights.summary.scoreChange > 0 ? '+' : ''}${insights.summary.scoreChange} pontos em relação à semana anterior

PRINCIPAIS INSIGHTS:
${insights.insights.map(insight => `• ${insight}`).join('\n')}

RECOMENDAÇÕES PRIORITÁRIAS:
${insights.recommendations.map(rec => `• ${rec.name}: ${rec.description}`).join('\n')}

Acesse seu dashboard: https://viajar.com.br/dashboard

© 2024 ViaJAR - Plataforma de Inteligência Turística
    `.trim();
  }

  /**
   * Salvar log dos insights enviados
   */
  private async saveInsightsLog(userId: string, insights: WeeklyInsight): Promise<void> {
    try {
      const { error } = await supabase
        .from('weekly_insights_log')
        .insert({
          user_id: userId,
          week: insights.week,
          insights_data: insights,
          sent_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao salvar log de insights:', error);
      }
    } catch (error) {
      console.error('Erro ao salvar log de insights:', error);
    }
  }

  /**
   * Obter semana atual no formato YYYY-WW
   */
  private getCurrentWeek(): string {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  }

  /**
   * Verificar se já foi enviado insight esta semana
   */
  async hasSentThisWeek(userId: string): Promise<boolean> {
    try {
      const currentWeek = this.getCurrentWeek();
      const { data, error } = await supabase
        .from('weekly_insights_log')
        .select('id')
        .eq('user_id', userId)
        .eq('week', currentWeek)
        .limit(1);

      if (error) {
        console.error('Erro ao verificar insights semanais:', error);
        return false;
      }

      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Erro ao verificar insights semanais:', error);
      return false;
    }
  }
}

export const weeklyInsightsService = new WeeklyInsightsService();

