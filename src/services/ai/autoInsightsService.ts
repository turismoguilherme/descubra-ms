/**
 * Auto Insights Service
 * Serviço para gerar insights automáticos periodicamente
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/integrations/supabase/client';
import { inventoryService } from '../public/inventoryService';
import { eventService } from '../public/eventService';
import { userDataAggregationService } from '../public/userDataAggregationService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface DashboardInsights {
  summary: string;
  keyFindings: string[];
  trends: string[];
  opportunities: string[];
  alerts: string[];
  recommendations: string[];
  generatedAt: string;
  nextUpdate: string;
}

export interface InsightNotification {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'alert';
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string;
}

export class AutoInsightsService {
  private genAI: GoogleGenerativeAI | null = null;
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
  }

  /**
   * Gerar insights automáticos para um município
   */
  async generateAutoInsights(municipalityId?: string): Promise<DashboardInsights> {
    try {
      // Coletar todos os dados
      const [inventory, events, userData] = await Promise.all([
        inventoryService.getAttractions({ is_active: true }),
        eventService.getEvents({}),
        userDataAggregationService.aggregateUserData(municipalityId),
      ]);

      // Preparar dados para análise
      const dataSummary = {
        totalAttractions: inventory.length,
        totalEvents: events.length,
        totalUsers: userData.totalUsers,
        averageCompleteness: inventory.reduce((sum, item) => {
          return sum + ((item as any).data_completeness_score || 0);
        }, 0) / (inventory.length || 1),
        averageCompliance: inventory.reduce((sum, item) => {
          return sum + ((item as any).setur_compliance_score || 0);
        }, 0) / (inventory.length || 1),
        upcomingEvents: events.filter((e: any) => {
          const eventDate = new Date(e.data_inicio || e.start_date);
          return eventDate > new Date() && eventDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }).length,
        mostCommonOrigin: userData.trends.mostCommonOrigin,
        mostCommonMotive: userData.trends.mostCommonMotive,
      };

      // Analisar com IA
      if (this.genAI) {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
Você é um consultor estratégico especializado em turismo municipal. Analise os seguintes dados e gere insights acionáveis:

DADOS DO MUNICÍPIO:
- Total de Atrativos: ${dataSummary.totalAttractions}
- Total de Eventos: ${dataSummary.totalEvents}
- Total de Usuários: ${dataSummary.totalUsers}
- Completude Média: ${Math.round(dataSummary.averageCompleteness)}%
- Conformidade SeTur Média: ${Math.round(dataSummary.averageCompliance)}%
- Eventos Próximos (30 dias): ${dataSummary.upcomingEvents}
- Origem Principal dos Turistas: ${dataSummary.mostCommonOrigin}
- Motivo Mais Comum: ${dataSummary.mostCommonMotive}

Forneça uma resposta em JSON:
{
  "summary": "Resumo executivo em 2-3 frases",
  "keyFindings": ["achado1", "achado2", "achado3"],
  "trends": ["tendência1", "tendência2"],
  "opportunities": ["oportunidade1", "oportunidade2"],
  "alerts": ["alerta1 se houver", "alerta2 se houver"],
  "recommendations": ["recomendação acionável1", "recomendação acionável2"]
}

Seja específico, acionável e focado em ajudar gestores públicos a tomar decisões estratégicas.
`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const nextUpdate = new Date();
          nextUpdate.setHours(nextUpdate.getHours() + 2); // Próxima atualização em 2 horas

          return {
            summary: parsed.summary || '',
            keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
            trends: Array.isArray(parsed.trends) ? parsed.trends : [],
            opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
            alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
            recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
            generatedAt: new Date().toISOString(),
            nextUpdate: nextUpdate.toISOString(),
          };
        }
      }

      // Fallback sem IA
      return this.getFallbackInsights(dataSummary);
    } catch (error) {
      console.error('Erro ao gerar insights automáticos:', error);
      throw error;
    }
  }

  /**
   * Agendar atualização periódica
   */
  scheduleInsightsUpdate(municipalityId: string, intervalHours: number = 2): void {
    // Cancelar atualização anterior se existir
    const existing = this.updateIntervals.get(municipalityId);
    if (existing) {
      clearInterval(existing);
    }

    // Agendar nova atualização
    const interval = setInterval(async () => {
      try {
        await this.generateAutoInsights(municipalityId);
        // TODO: Salvar insights no banco e enviar notificações se necessário
      } catch (error) {
        console.error('Erro na atualização automática de insights:', error);
      }
    }, intervalHours * 60 * 60 * 1000);

    this.updateIntervals.set(municipalityId, interval);
  }

  /**
   * Cancelar atualização agendada
   */
  cancelScheduledUpdate(municipalityId: string): void {
    const interval = this.updateIntervals.get(municipalityId);
    if (interval) {
      clearInterval(interval);
      this.updateIntervals.delete(municipalityId);
    }
  }

  /**
   * Gerar notificações de insights importantes
   */
  async generateNotifications(insights: DashboardInsights): Promise<InsightNotification[]> {
    const notifications: InsightNotification[] = [];

    // Notificação de alertas
    if (insights.alerts.length > 0) {
      insights.alerts.forEach((alert, index) => {
        notifications.push({
          id: `alert-${Date.now()}-${index}`,
          type: 'alert',
          title: 'Alerta Importante',
          message: alert,
          severity: 'high',
          createdAt: new Date().toISOString(),
        });
      });
    }

    // Notificação de oportunidades
    if (insights.opportunities.length > 0) {
      insights.opportunities.slice(0, 2).forEach((opportunity, index) => {
        notifications.push({
          id: `opportunity-${Date.now()}-${index}`,
          type: 'opportunity',
          title: 'Oportunidade Identificada',
          message: opportunity,
          severity: 'medium',
          createdAt: new Date().toISOString(),
        });
      });
    }

    // Notificação de tendências importantes
    if (insights.trends.length > 0) {
      notifications.push({
        id: `trend-${Date.now()}`,
        type: 'trend',
        title: 'Nova Tendência',
        message: insights.trends[0],
        severity: 'low',
        createdAt: new Date().toISOString(),
      });
    }

    return notifications;
  }

  /**
   * Fallback sem IA
   */
  private getFallbackInsights(dataSummary: any): DashboardInsights {
    const nextUpdate = new Date();
    nextUpdate.setHours(nextUpdate.getHours() + 2);

    return {
      summary: `Dashboard com ${dataSummary.totalAttractions} atrativos, ${dataSummary.totalEvents} eventos e ${dataSummary.totalUsers} usuários cadastrados.`,
      keyFindings: [
        `Completude média: ${Math.round(dataSummary.averageCompleteness)}%`,
        `Conformidade SeTur: ${Math.round(dataSummary.averageCompliance)}%`,
        `${dataSummary.upcomingEvents} eventos nos próximos 30 dias`,
      ],
      trends: [
        `Origem principal: ${dataSummary.mostCommonOrigin}`,
        `Motivo mais comum: ${dataSummary.mostCommonMotive}`,
      ],
      opportunities: [
        'Melhorar completude dos dados do inventário',
        'Aumentar número de eventos cadastrados',
      ],
      alerts: dataSummary.averageCompleteness < 70
        ? ['Completude dos dados abaixo do recomendado']
        : [],
      recommendations: [
        'Revise regularmente os dados do inventário',
        'Mantenha eventos atualizados',
      ],
      generatedAt: new Date().toISOString(),
      nextUpdate: nextUpdate.toISOString(),
    };
  }
}

export const autoInsightsService = new AutoInsightsService();

