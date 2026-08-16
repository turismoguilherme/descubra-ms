// Serviço simplificado de alertas proativos
// Funcionalidade básica para manter compatibilidade

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  cityId?: string;
  regionId?: string;
}

class ProactiveAlertsService {
  private alerts: Alert[] = [];

  constructor() {
    this.initializeMockAlerts();
  }

  private initializeMockAlerts() {
    this.alerts = [
      {
        id: 'alert_1',
        type: 'warning',
        title: 'Alta demanda esperada',
        message: 'Previsão de aumento de 25% no turismo para o próximo mês',
        category: 'demand',
        priority: 'medium',
        status: 'active',
        createdAt: new Date().toISOString(),
        cityId: 'campo-grande',
        regionId: 'ms'
      },
      {
        id: 'alert_2',
        type: 'info',
        title: 'Novo evento confirmado',
        message: 'Festival de Turismo confirmado para março',
        category: 'events',
        priority: 'low',
        status: 'active',
        createdAt: new Date().toISOString(),
        cityId: 'bonito',
        regionId: 'ms'
      }
    ];
  }

  async getActiveAlerts(cityId?: string, regionId?: string): Promise<Alert[]> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (cityId && regionId) {
    return this.alerts.filter(alert => 
        alert.cityId === cityId || alert.regionId === regionId
      );
    }
    
    return this.alerts.filter(alert => alert.status === 'active');
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'acknowledged';
      alert.acknowledgedAt = new Date().toISOString();
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'resolved';
      alert.resolvedAt = new Date().toISOString();
    }
  }

  async createAlert(alertData: Omit<Alert, 'id' | 'createdAt' | 'status'>): Promise<Alert> {
    const newAlert: Alert = {
      ...alertData,
      id: `alert_${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    this.alerts.push(newAlert);
    return newAlert;
  }

  async getAlertStats(): Promise<{
    total: number;
    active: number;
    acknowledged: number;
    resolved: number;
  }> {
    return {
      total: this.alerts.length,
      active: this.alerts.filter(a => a.status === 'active').length,
      acknowledged: this.alerts.filter(a => a.status === 'acknowledged').length,
      resolved: this.alerts.filter(a => a.status === 'resolved').length
    };
  }
}

export const proactiveAlertsService = new ProactiveAlertsService(); 

