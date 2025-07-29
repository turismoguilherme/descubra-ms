import { supabase } from '@/integrations/supabase/client';

export interface MasterDashboardReport {
  state_id: string;
  state_name: string;
  report_type: 'daily' | 'weekly' | 'monthly';
  metrics: {
    total_users: number;
    active_users: number;
    new_users: number;
    total_checkins: number;
    events_created: number;
    revenue_generated: number;
    satisfaction_score: number;
  };
  timestamp: string;
}

export interface SystemAlert {
  severity: 'info' | 'warning' | 'error' | 'critical';
  type: 'security' | 'performance' | 'system' | 'user';
  message: string;
  details?: any;
  state_id?: string;
  timestamp: string;
}

export interface PlatformUpdate {
  update_type: 'config' | 'features' | 'content' | 'security';
  description: string;
  data: any;
  state_id: string;
  timestamp: string;
}

class MasterDashboardService {
  private readonly masterEndpoint = import.meta.env.VITE_MASTER_DASHBOARD_ENDPOINT || 'https://api.flowtrip.com/master';
  private readonly apiKey = import.meta.env.VITE_MASTER_API_KEY || 'test-key';

  // Enviar relatório periódico para o dashboard master
  async sendPeriodicReport(reportType: 'daily' | 'weekly' | 'monthly'): Promise<void> {
    try {
      const metrics = await this.collectMetrics();
      const stateInfo = await this.getStateInfo();

      const report: MasterDashboardReport = {
        state_id: stateInfo.id,
        state_name: stateInfo.name,
        report_type: reportType,
        metrics,
        timestamp: new Date().toISOString()
      };

      await this.sendToMaster('/reports', report);
      
      // Log local para auditoria
      await this.logActivity('report_sent', {
        report_type: reportType,
        metrics_summary: metrics
      });

    } catch (error) {
      console.error('Erro ao enviar relatório:', error);
      await this.sendAlert({
        severity: 'error',
        type: 'system',
        message: 'Falha ao enviar relatório periódico',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString()
      });
    }
  }

  // Coletar métricas do sistema local
  private async collectMetrics() {
    try {
      // Buscar total de usuários
      const { data: totalUsers } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact' });

      // Buscar usuários ativos (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: activeUsers } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact' })
        .gte('last_sign_in_at', thirtyDaysAgo.toISOString());

      // Buscar novos usuários (últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: newUsers } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact' })
        .gte('created_at', sevenDaysAgo.toISOString());

      // Buscar check-ins
      const { data: checkIns } = await supabase
        .from('passport_checkpoints')
        .select('id', { count: 'exact' });

      // Buscar eventos criados (últimos 30 dias)
      const { data: eventsCreated } = await supabase
        .from('events')
        .select('id', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Simular receita (implementar cálculo real conforme necessário)
      const revenueGenerated = Math.floor(Math.random() * 100000) + 50000;

      // Simular score de satisfação (implementar cálculo real conforme necessário)
      const satisfactionScore = 4.2 + Math.random() * 0.6;

      return {
        total_users: totalUsers?.length || 0,
        active_users: activeUsers?.length || 0,
        new_users: newUsers?.length || 0,
        total_checkins: checkIns?.length || 0,
        events_created: eventsCreated?.length || 0,
        revenue_generated: revenueGenerated,
        satisfaction_score: Math.round(satisfactionScore * 10) / 10
      };

    } catch (error) {
      console.error('Erro ao coletar métricas:', error);
      throw error;
    }
  }

  // Obter informações do estado
  private async getStateInfo() {
    const { data, error } = await supabase
      .from('flowtrip_states')
      .select('id, name, code')
      .eq('code', 'MS')
      .single();

    if (error) throw error;
    return data;
  }

  // Enviar alerta para o master dashboard
  async sendAlert(alert: SystemAlert): Promise<void> {
    try {
      const stateInfo = await this.getStateInfo();
      const alertWithState = {
        ...alert,
        state_id: stateInfo.id
      };

      await this.sendToMaster('/alerts', alertWithState);
      
      // Log local
      await this.logActivity('alert_sent', alert);

    } catch (error) {
      console.error('Erro ao enviar alerta:', error);
    }
  }

  // Notificar atualização da plataforma
  async notifyPlatformUpdate(update: Omit<PlatformUpdate, 'state_id' | 'timestamp'>): Promise<void> {
    try {
      const stateInfo = await this.getStateInfo();
      
      const fullUpdate: PlatformUpdate = {
        ...update,
        state_id: stateInfo.id,
        timestamp: new Date().toISOString()
      };

      await this.sendToMaster('/updates', fullUpdate);
      
      // Log local
      await this.logActivity('update_notified', update);

    } catch (error) {
      console.error('Erro ao notificar atualização:', error);
    }
  }

  // Verificar conectividade com master dashboard
  async checkMasterConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.masterEndpoint}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao verificar conexão com master:', error);
      return false;
    }
  }

  // Solicitar configurações do master
  async fetchMasterConfig(): Promise<any> {
    try {
      const stateInfo = await this.getStateInfo();
      
      const response = await fetch(`${this.masterEndpoint}/config/${stateInfo.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar configurações do master');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar configurações do master:', error);
      throw error;
    }
  }

  // Método genérico para enviar dados ao master
  private async sendToMaster(endpoint: string, data: any): Promise<void> {
    try {
      const response = await fetch(`${this.masterEndpoint}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      console.error(`Erro ao enviar dados para ${endpoint}:`, error);
      throw error;
    }
  }

  // Log de atividades para auditoria local
  private async logActivity(action: string, details: any): Promise<void> {
    try {
      await supabase
        .from('security_audit_log')
        .insert({
          user_id: null, // Sistema
          action: `master_dashboard_${action}`,
          resource_type: 'system',
          resource_id: null,
          details: details,
          severity: 'info',
          ip_address: null,
          user_agent: 'MasterDashboardService',
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erro ao registrar log de atividade:', error);
    }
  }

  // Inicializar relatórios automáticos
  initializeAutomaticReports(): void {
    // Relatório diário às 23:00
    this.scheduleReport('daily', '23:00');
    
    // Relatório semanal aos domingos às 23:30
    this.scheduleReport('weekly', '23:30', 0); // 0 = Domingo
    
    // Relatório mensal no primeiro dia do mês às 00:00
    this.scheduleReport('monthly', '00:00', null, 1);
  }

  // Agendar relatórios automáticos
  private scheduleReport(
    type: 'daily' | 'weekly' | 'monthly', 
    time: string, 
    weekday?: number, 
    monthday?: number
  ): void {
    const [hours, minutes] = time.split(':').map(Number);

    const checkAndSend = () => {
      const now = new Date();
      const shouldSend = this.shouldSendReport(now, type, hours, minutes, weekday, monthday);
      
      if (shouldSend) {
        this.sendPeriodicReport(type).catch(error => {
          console.error(`Erro no relatório ${type}:`, error);
        });
      }
    };

    // Verificar a cada hora se é hora de enviar
    setInterval(checkAndSend, 60 * 60 * 1000);
  }

  // Verificar se deve enviar relatório baseado na data/hora
  private shouldSendReport(
    now: Date, 
    type: string, 
    hours: number, 
    minutes: number, 
    weekday?: number, 
    monthday?: number
  ): boolean {
    if (now.getHours() !== hours || now.getMinutes() !== minutes) {
      return false;
    }

    switch (type) {
      case 'daily':
        return true;
      case 'weekly':
        return weekday !== undefined && now.getDay() === weekday;
      case 'monthly':
        return monthday !== undefined && now.getDate() === monthday;
      default:
        return false;
    }
  }
}

export const masterDashboardService = new MasterDashboardService();

// Inicializar relatórios automáticos quando o serviço for importado
if (typeof window !== 'undefined') {
  masterDashboardService.initializeAutomaticReports();
} 