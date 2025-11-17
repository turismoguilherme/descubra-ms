/**
 * Proactive Notifications Service
 * Gera notificações proativas baseadas em métricas e desempenho do negócio
 */

import { AnalysisResult } from '@/services/diagnostic/analysisService';
import { supabase } from '@/integrations/supabase/client';

export interface ProactiveNotification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'critical';
  title: string;
  message: string;
  category: 'revenue' | 'occupancy' | 'market' | 'competition' | 'growth';
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  actionLabel?: string;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
}

export class ProactiveNotificationsService {
  /**
   * Analisar métricas e gerar notificações proativas
   */
  async analyzeAndGenerateNotifications(
    analysisResult: AnalysisResult | null,
    currentMetrics?: {
      occupancy?: number;
      revenue?: number;
      rating?: number;
      marketAverage?: {
        occupancy?: number;
        revenue?: number;
        rating?: number;
      };
    }
  ): Promise<ProactiveNotification[]> {
    const notifications: ProactiveNotification[] = [];

    if (!analysisResult) {
      return notifications;
    }

    // Notificação: Score abaixo do esperado
    if (analysisResult.overallScore < 60) {
      notifications.push({
        id: `notif-score-${Date.now()}`,
        type: 'warning',
        title: 'Score Geral Abaixo do Esperado',
        message: `Seu score atual (${analysisResult.overallScore}%) está abaixo do ideal. Implemente as recomendações prioritárias para melhorar.`,
        category: 'growth',
        priority: 'high',
        actionUrl: '/viajar/dashboard?section=overview',
        actionLabel: 'Ver Recomendações',
        createdAt: new Date(),
        acknowledged: false
      });
    }

    // Notificação: Ocupação abaixo da média do mercado
    if (currentMetrics?.occupancy && currentMetrics?.marketAverage?.occupancy) {
      const diff = currentMetrics.occupancy - currentMetrics.marketAverage.occupancy;
      if (diff < -5) {
        notifications.push({
          id: `notif-occupancy-${Date.now()}`,
          type: 'warning',
          title: 'Ocupação Abaixo da Média do Mercado',
          message: `Sua ocupação (${currentMetrics.occupancy}%) está ${Math.abs(diff)} pontos percentuais abaixo da média do mercado (${currentMetrics.marketAverage.occupancy}%).`,
          category: 'occupancy',
          priority: 'high',
          actionUrl: '/viajar/dashboard?section=revenue',
          actionLabel: 'Otimizar Preços',
          createdAt: new Date(),
          acknowledged: false
        });
      }
    }

    // Notificação: ROI baixo
    if (analysisResult.estimatedROI < 15) {
      notifications.push({
        id: `notif-roi-${Date.now()}`,
        type: 'info',
        title: 'Oportunidade de Melhorar ROI',
        message: `Seu ROI estimado (${analysisResult.estimatedROI}%) pode ser melhorado. Consulte as recomendações de Revenue Optimizer.`,
        category: 'revenue',
        priority: 'medium',
        actionUrl: '/viajar/dashboard?section=revenue',
        actionLabel: 'Ver Revenue Optimizer',
        createdAt: new Date(),
        acknowledged: false
      });
    }

    // Notificação: Muitas recomendações não implementadas
    if (analysisResult.recommendations.length > 10) {
      notifications.push({
        id: `notif-recommendations-${Date.now()}`,
        type: 'info',
        title: 'Múltiplas Oportunidades Disponíveis',
        message: `Você tem ${analysisResult.recommendations.length} recomendações disponíveis. Foque nas de maior prioridade para acelerar o crescimento.`,
        category: 'growth',
        priority: 'medium',
        actionUrl: '/viajar/dashboard?section=overview',
        actionLabel: 'Ver Recomendações',
        createdAt: new Date(),
        acknowledged: false
      });
    }

    // Notificação: Score excelente
    if (analysisResult.overallScore >= 80) {
      notifications.push({
        id: `notif-success-${Date.now()}`,
        type: 'success',
        title: 'Excelente Desempenho!',
        message: `Parabéns! Seu score de ${analysisResult.overallScore}% indica que seu negócio está em excelente condição. Continue implementando as recomendações.`,
        category: 'growth',
        priority: 'low',
        createdAt: new Date(),
        acknowledged: false
      });
    }

    return notifications;
  }

  /**
   * Salvar notificações no banco de dados
   */
  async saveNotifications(
    userId: string,
    notifications: ProactiveNotification[]
  ): Promise<void> {
    try {
      const notificationsToSave = notifications.map(notif => ({
        user_id: userId,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        category: notif.category,
        priority: notif.priority,
        action_url: notif.actionUrl,
        action_label: notif.actionLabel,
        acknowledged: notif.acknowledged,
        created_at: notif.createdAt.toISOString()
      }));

      const { error } = await supabase
        .from('user_notifications')
        .insert(notificationsToSave);

      if (error) {
        console.error('Erro ao salvar notificações:', error);
      }
    } catch (error) {
      console.error('Erro ao salvar notificações:', error);
    }
  }

  /**
   * Marcar notificação como lida
   */
  async acknowledgeNotification(notificationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao marcar notificação como lida:', error);
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }

  /**
   * Buscar notificações do usuário
   */
  async getUserNotifications(userId: string, limit: number = 10): Promise<ProactiveNotification[]> {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('acknowledged', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar notificações:', error);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        message: item.message,
        category: item.category,
        priority: item.priority,
        actionUrl: item.action_url,
        actionLabel: item.action_label,
        createdAt: new Date(item.created_at),
        acknowledged: item.acknowledged,
        acknowledgedAt: item.acknowledged_at ? new Date(item.acknowledged_at) : undefined
      }));
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  }
}

export const proactiveNotificationsService = new ProactiveNotificationsService();

