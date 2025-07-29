import { supabase } from '@/integrations/supabase/client';
import { superTourismAI } from './superTourismAI';
import { masterDashboardService } from '@/services/masterDashboardService';

export interface Alert {
  id: string;
  type: 'capacity_overload' | 'satisfaction_drop' | 'infrastructure_issue' | 'marketing_opportunity' | 'demand_spike' | 'revenue_drop';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendations: string[];
  affectedArea: string;
  metrics: {
    current: number;
    threshold: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  createdAt: string;
  status: 'active' | 'acknowledged' | 'resolved';
  cityId?: string;
  regionId?: string;
}

export interface AlertRule {
  id: string;
  type: Alert['type'];
  threshold: number;
  condition: 'above' | 'below' | 'equals';
  metric: string;
  enabled: boolean;
  notificationChannels: ('dashboard' | 'email' | 'push' | 'master_dashboard')[];
}

export interface AlertSubscription {
  userId: string;
  alertTypes: Alert['type'][];
  channels: ('email' | 'push' | 'sms')[];
  frequency: 'immediate' | 'hourly' | 'daily';
}

class ProactiveAlertsService {
  private alerts: Alert[] = [];
  private alertRules: AlertRule[] = [
    {
      id: 'capacity_rule_1',
      type: 'capacity_overload',
      threshold: 85,
      condition: 'above',
      metric: 'location_capacity_percentage',
      enabled: true,
      notificationChannels: ['dashboard', 'email', 'master_dashboard']
    },
    {
      id: 'satisfaction_rule_1',
      type: 'satisfaction_drop',
      threshold: 3.5,
      condition: 'below',
      metric: 'average_rating',
      enabled: true,
      notificationChannels: ['dashboard', 'email']
    },
    {
      id: 'demand_rule_1',
      type: 'demand_spike',
      threshold: 150,
      condition: 'above',
      metric: 'visitor_growth_percentage',
      enabled: true,
      notificationChannels: ['dashboard', 'email', 'master_dashboard']
    }
  ];

  /**
   * Monitora automaticamente as métricas e gera alertas
   */
  async runMonitoring(cityId?: string, regionId?: string): Promise<Alert[]> {
    console.log('🔍 Executando monitoramento proativo...');

    try {
      const newAlerts: Alert[] = [];

      // Coletar dados atuais
      const currentData = await this.collectCurrentMetrics(cityId, regionId);
      
      // Verificar cada regra de alerta
      for (const rule of this.alertRules.filter(r => r.enabled)) {
        const alert = await this.evaluateRule(rule, currentData, cityId, regionId);
        if (alert) {
          newAlerts.push(alert);
        }
      }

      // Salvar novos alertas
      for (const alert of newAlerts) {
        await this.saveAlert(alert);
        await this.triggerNotifications(alert);
      }

      this.alerts.push(...newAlerts);
      return newAlerts;

    } catch (error) {
      console.error('❌ Erro no monitoramento:', error);
      return [];
    }
  }

  /**
   * Avalia uma regra específica contra os dados atuais
   */
  private async evaluateRule(
    rule: AlertRule, 
    data: any, 
    cityId?: string, 
    regionId?: string
  ): Promise<Alert | null> {
    const metricValue = this.extractMetricValue(rule.metric, data);
    
    if (metricValue === null) return null;

    const shouldAlert = this.checkThreshold(metricValue, rule.threshold, rule.condition);
    
    if (!shouldAlert) return null;

    // Verificar se já existe alerta ativo similar
    const existingAlert = this.alerts.find(a => 
      a.type === rule.type && 
      a.status === 'active' && 
      a.cityId === cityId &&
      Date.now() - new Date(a.createdAt).getTime() < 24 * 60 * 60 * 1000 // 24h
    );

    if (existingAlert) return null;

    return this.generateAlert(rule, metricValue, data, cityId, regionId);
  }

  /**
   * Gera um alerta baseado na regra e dados
   */
  private generateAlert(
    rule: AlertRule, 
    currentValue: number, 
    data: any, 
    cityId?: string, 
    regionId?: string
  ): Alert {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alertTemplates = {
      capacity_overload: {
        title: '⚠️ Sobrecarga de Capacidade Detectada',
        description: `A capacidade dos destinos está em ${currentValue}%, acima do limite recomendado de ${rule.threshold}%.`,
        recommendations: [
          'Implementar sistema de controle de fluxo',
          'Promover destinos alternativos na região',
          'Ajustar horários de funcionamento',
          'Considerar reservas antecipadas'
        ],
        affectedArea: 'Destinos Populares'
      },
      satisfaction_drop: {
        title: '📉 Queda na Satisfação dos Visitantes',
        description: `A avaliação média caiu para ${currentValue}, abaixo do padrão de qualidade de ${rule.threshold}.`,
        recommendations: [
          'Investigar principais reclamações',
          'Melhorar atendimento ao visitante',
          'Verificar infraestrutura básica',
          'Treinar equipes de atendimento'
        ],
        affectedArea: 'Experiência do Visitante'
      },
      demand_spike: {
        title: '📈 Pico de Demanda Identificado',
        description: `Crescimento de ${currentValue}% na visitação, muito acima da média de ${rule.threshold}%.`,
        recommendations: [
          'Preparar infraestrutura adicional',
          'Coordenar com estabelecimentos locais',
          'Implementar medidas de organização',
          'Aproveitar para campanhas de marketing'
        ],
        affectedArea: 'Demanda Turística'
      },
      infrastructure_issue: {
        title: '🔧 Problema de Infraestrutura',
        description: `Detectados problemas de infraestrutura que podem impactar a experiência turística.`,
        recommendations: [
          'Inspeção técnica imediata',
          'Comunicação transparente aos visitantes',
          'Plano de contingência',
          'Priorizar reparos urgentes'
        ],
        affectedArea: 'Infraestrutura'
      },
      marketing_opportunity: {
        title: '🎯 Oportunidade de Marketing',
        description: `Janela de oportunidade identificada para maximizar investimentos em marketing.`,
        recommendations: [
          'Lançar campanha direcionada',
          'Aproveitar baixa concorrência',
          'Focar em público específico',
          'Usar dados para personalização'
        ],
        affectedArea: 'Marketing e Promoção'
      },
      revenue_drop: {
        title: '💰 Queda na Receita Turística',
        description: `Redução significativa na receita turística detectada.`,
        recommendations: [
          'Análise de causas imediata',
          'Revisão de estratégias de preço',
          'Campanhas de recuperação',
          'Parcerias para atração'
        ],
        affectedArea: 'Receita'
      }
    };

    const template = alertTemplates[rule.type];
    const priority = this.calculatePriority(rule.type, currentValue, rule.threshold);

    return {
      id: alertId,
      type: rule.type,
      priority,
      title: template.title,
      description: template.description,
      recommendations: template.recommendations,
      affectedArea: template.affectedArea,
      metrics: {
        current: currentValue,
        threshold: rule.threshold,
        trend: this.calculateTrend(currentValue, data.historicalAverage || rule.threshold)
      },
      createdAt: new Date().toISOString(),
      status: 'active',
      cityId,
      regionId
    };
  }

  /**
   * Coleta métricas atuais do sistema
   */
  private async collectCurrentMetrics(cityId?: string, regionId?: string) {
    const [checkIns, events, insights] = await Promise.all([
      this.getRecentCheckIns(cityId, regionId),
      this.getRecentEvents(cityId, regionId),
      superTourismAI.generateStrategicInsights(cityId, regionId)
    ]);

    return {
      checkIns,
      events,
      insights,
      totalVisitors: checkIns.length,
      avgRating: this.calculateAverageRating(checkIns),
      capacityUtilization: this.calculateCapacityUtilization(checkIns, events),
      visitorGrowth: this.calculateVisitorGrowth(checkIns),
      historicalAverage: checkIns.length * 0.8 // Simulado
    };
  }

  /**
   * Extrai valor da métrica dos dados
   */
  private extractMetricValue(metric: string, data: any): number | null {
    switch (metric) {
      case 'location_capacity_percentage':
        return data.capacityUtilization || 0;
      case 'average_rating':
        return data.avgRating || 5.0;
      case 'visitor_growth_percentage':
        return data.visitorGrowth || 0;
      case 'total_visitors':
        return data.totalVisitors || 0;
      default:
        return null;
    }
  }

  /**
   * Verifica se o valor ultrapassa o threshold
   */
  private checkThreshold(value: number, threshold: number, condition: string): boolean {
    switch (condition) {
      case 'above': return value > threshold;
      case 'below': return value < threshold;
      case 'equals': return Math.abs(value - threshold) < 0.1;
      default: return false;
    }
  }

  /**
   * Calcula prioridade do alerta
   */
  private calculatePriority(type: Alert['type'], current: number, threshold: number): Alert['priority'] {
    const deviation = Math.abs(current - threshold) / threshold;
    
    if (deviation > 0.5) return 'critical';
    if (deviation > 0.3) return 'high';
    if (deviation > 0.1) return 'medium';
    return 'low';
  }

  /**
   * Calcula tendência da métrica
   */
  private calculateTrend(current: number, historical: number): 'increasing' | 'decreasing' | 'stable' {
    const change = (current - historical) / historical;
    if (change > 0.05) return 'increasing';
    if (change < -0.05) return 'decreasing';
    return 'stable';
  }

  /**
   * Salva alerta no banco de dados
   */
  private async saveAlert(alert: Alert): Promise<void> {
    try {
      // Implementar salvamento no Supabase
      // await supabase.from('proactive_alerts').insert(alert);
      console.log(`💾 Alerta salvo: ${alert.title}`);
    } catch (error) {
      console.error('❌ Erro ao salvar alerta:', error);
    }
  }

  /**
   * Dispara notificações para o alerta
   */
  private async triggerNotifications(alert: Alert): Promise<void> {
    console.log(`🔔 Disparando notificações para alerta: ${alert.title}`);

    // Notificação para master dashboard se crítico
    if (alert.priority === 'critical' || alert.priority === 'high') {
      await this.notifyMasterDashboard(alert);
    }

    // Notificações por email (implementar)
    await this.sendEmailNotification(alert);

    // Push notifications (implementar)
    await this.sendPushNotification(alert);
  }

  /**
   * Notifica o master dashboard
   */
  private async notifyMasterDashboard(alert: Alert): Promise<void> {
    try {
      await masterDashboardService.sendAlert({
        type: 'proactive_alert',
        priority: alert.priority,
        title: alert.title,
        description: alert.description,
        affectedArea: alert.affectedArea,
        cityId: alert.cityId,
        regionId: alert.regionId,
        timestamp: alert.createdAt
      });
    } catch (error) {
      console.error('❌ Erro ao notificar master dashboard:', error);
    }
  }

  /**
   * Envia notificação por email
   */
  private async sendEmailNotification(alert: Alert): Promise<void> {
    // Implementar integração com serviço de email
    console.log(`📧 Email enviado para alerta: ${alert.title}`);
  }

  /**
   * Envia push notification
   */
  private async sendPushNotification(alert: Alert): Promise<void> {
    // Implementar push notifications
    console.log(`📱 Push notification enviada: ${alert.title}`);
  }

  /**
   * Obtém alertas ativos
   */
  async getActiveAlerts(cityId?: string, regionId?: string): Promise<Alert[]> {
    return this.alerts.filter(alert => 
      alert.status === 'active' &&
      (!cityId || alert.cityId === cityId) &&
      (!regionId || alert.regionId === regionId)
    );
  }

  /**
   * Resolve um alerta
   */
  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'resolved';
      // Atualizar no banco
      console.log(`✅ Alerta resolvido: ${alert.title}`);
    }
  }

  /**
   * Reconhece um alerta
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'acknowledged';
      console.log(`👁️ Alerta reconhecido: ${alert.title}`);
    }
  }

  // Métodos auxiliares para cálculos
  private async getRecentCheckIns(cityId?: string, regionId?: string) {
    const { data } = await supabase
      .from('passport_stamps')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(500);
    return data || [];
  }

  private async getRecentEvents(cityId?: string, regionId?: string) {
    const { data } = await supabase
      .from('events')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(50);
    return data || [];
  }

  private calculateAverageRating(checkIns: any[]): number {
    // Simulação - implementar baseado em reviews reais
    return 4.2 + (Math.random() - 0.5) * 0.6;
  }

  private calculateCapacityUtilization(checkIns: any[], events: any[]): number {
    // Simulação baseada em check-ins recentes
    const recentCheckIns = checkIns.filter(c => 
      Date.now() - new Date(c.created_at).getTime() < 24 * 60 * 60 * 1000
    );
    return Math.min(100, (recentCheckIns.length / 100) * 100);
  }

  private calculateVisitorGrowth(checkIns: any[]): number {
    const now = new Date();
    const thisWeek = checkIns.filter(c => 
      new Date(c.created_at) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    const lastWeek = checkIns.filter(c => {
      const date = new Date(c.created_at);
      return date > new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) &&
             date <= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }).length;
    
    if (lastWeek === 0) return 0;
    return ((thisWeek - lastWeek) / lastWeek) * 100;
  }
}

export const proactiveAlertsService = new ProactiveAlertsService(); 