/**
 * Serviço de Monitoramento e Métricas
 * Coleta métricas de performance, erros e uso da aplicação
 */

interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags: Record<string, string>;
}

interface ErrorReport {
  message: string;
  stack?: string;
  component: string;
  timestamp: number;
  userAgent: string;
  url: string;
}

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  component: string;
}

interface UserInteraction {
  action: string;
  component: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class MonitoringService {
  private metrics: Metric[] = [];
  private errors: ErrorReport[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private userInteractions: UserInteraction[] = [];
  private isEnabled = true;

  constructor() {
    this.initializeMonitoring();
  }

  // Inicializar monitoramento
  private initializeMonitoring() {
    // Monitorar erros globais
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        component: 'Global',
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });

    // Monitorar promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        component: 'Promise',
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });

    // Monitorar performance
    this.observePerformance();
  }

  // Reportar erro
  reportError(error: ErrorReport): void {
    if (!this.isEnabled) return;

    this.errors.push(error);
    
    // Manter apenas os últimos 100 erros
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }

    // Enviar para serviço de monitoramento (se configurado)
    this.sendErrorToService(error);
  }

  // Reportar métrica
  reportMetric(name: string, value: number, tags: Record<string, string> = {}): void {
    if (!this.isEnabled) return;

    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      tags
    };

    this.metrics.push(metric);

    // Manter apenas as últimas 1000 métricas
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  // Reportar interação do usuário
  reportUserInteraction(action: string, component: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const interaction: UserInteraction = {
      action,
      component,
      timestamp: Date.now(),
      metadata
    };

    this.userInteractions.push(interaction);

    // Manter apenas as últimas 500 interações
    if (this.userInteractions.length > 500) {
      this.userInteractions = this.userInteractions.slice(-500);
    }
  }

  // Medir performance de função
  measurePerformance<T>(name: string, fn: () => T, component: string): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    this.reportPerformanceMetric(name, duration, component);
    return result;
  }

  // Medir performance assíncrona
  async measurePerformanceAsync<T>(
    name: string, 
    fn: () => Promise<T>, 
    component: string
  ): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    this.reportPerformanceMetric(name, duration, component);
    return result;
  }

  // Reportar métrica de performance
  private reportPerformanceMetric(name: string, duration: number, component: string): void {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      component
    };

    this.performanceMetrics.push(metric);

    // Manter apenas as últimas 500 métricas de performance
    if (this.performanceMetrics.length > 500) {
      this.performanceMetrics = this.performanceMetrics.slice(-500);
    }
  }

  // Observar performance automaticamente
  private observePerformance(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.reportMetric('page_load_time', entry.duration, {
              type: 'navigation'
            });
          } else if (entry.entryType === 'resource') {
            this.reportMetric('resource_load_time', entry.duration, {
              type: 'resource',
              name: entry.name
            });
          }
        }
      });

      observer.observe({ entryTypes: ['navigation', 'resource'] });
    }
  }

  // Obter estatísticas
  getStats() {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);

    return {
      errors: {
        total: this.errors.length,
        last24h: this.errors.filter(e => e.timestamp > last24h).length,
        byComponent: this.groupByComponent(this.errors)
      },
      metrics: {
        total: this.metrics.length,
        last24h: this.metrics.filter(m => m.timestamp > last24h).length,
        byName: this.groupByMetricName(this.metrics)
      },
      performance: {
        total: this.performanceMetrics.length,
        last24h: this.performanceMetrics.filter(p => p.timestamp > last24h).length,
        averageDuration: this.calculateAverageDuration(),
        slowestOperations: this.getSlowestOperations()
      },
      interactions: {
        total: this.userInteractions.length,
        last24h: this.userInteractions.filter(i => i.timestamp > last24h).length,
        byAction: this.groupByAction(this.userInteractions)
      }
    };
  }

  // Agrupar por componente
  private groupByComponent(items: any[]): Record<string, number> {
    return items.reduce((acc, item) => {
      acc[item.component] = (acc[item.component] || 0) + 1;
      return acc;
    }, {});
  }

  // Agrupar por nome de métrica
  private groupByMetricName(metrics: Metric[]): Record<string, number> {
    return metrics.reduce((acc, metric) => {
      acc[metric.name] = (acc[metric.name] || 0) + 1;
      return acc;
    }, {});
  }

  // Agrupar por ação
  private groupByAction(interactions: UserInteraction[]): Record<string, number> {
    return interactions.reduce((acc, interaction) => {
      acc[interaction.action] = (acc[interaction.action] || 0) + 1;
      return acc;
    }, {});
  }

  // Calcular duração média
  private calculateAverageDuration(): number {
    if (this.performanceMetrics.length === 0) return 0;
    
    const total = this.performanceMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / this.performanceMetrics.length;
  }

  // Obter operações mais lentas
  private getSlowestOperations(limit = 10): PerformanceMetric[] {
    return this.performanceMetrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  // Enviar erro para serviço externo
  private sendErrorToService(error: ErrorReport): void {
    // Implementar envio para serviço de monitoramento
    // Ex: Sentry, LogRocket, etc.
    console.error('Error reported:', error);
  }

  // Exportar dados
  exportData() {
    return {
      metrics: this.metrics,
      errors: this.errors,
      performance: this.performanceMetrics,
      interactions: this.userInteractions,
      exportedAt: new Date().toISOString()
    };
  }

  // Limpar dados antigos
  cleanup(olderThanHours = 24): void {
    const cutoff = Date.now() - (olderThanHours * 60 * 60 * 1000);
    
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    this.errors = this.errors.filter(e => e.timestamp > cutoff);
    this.performanceMetrics = this.performanceMetrics.filter(p => p.timestamp > cutoff);
    this.userInteractions = this.userInteractions.filter(i => i.timestamp > cutoff);
  }

  // Habilitar/desabilitar monitoramento
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Verificar se está habilitado
  isMonitoringEnabled(): boolean {
    return this.isEnabled;
  }
}

// Instância singleton
export const monitoringService = new MonitoringService();

// Hook para React
export const useMonitoring = () => {
  return {
    reportError: (error: ErrorReport) => monitoringService.reportError(error),
    reportMetric: (name: string, value: number, tags?: Record<string, string>) => 
      monitoringService.reportMetric(name, value, tags),
    reportInteraction: (action: string, component: string, metadata?: Record<string, any>) =>
      monitoringService.reportUserInteraction(action, component, metadata),
    measurePerformance: <T>(name: string, fn: () => T, component: string) =>
      monitoringService.measurePerformance(name, fn, component),
    measureAsync: <T>(name: string, fn: () => Promise<T>, component: string) =>
      monitoringService.measurePerformanceAsync(name, fn, component)
  };
};

