// Serviço simplificado de geração de relatórios
// Funcionalidade básica para manter compatibilidade

export interface ReportConfig {
  type: 'monthly' | 'quarterly' | 'annual';
  format: 'pdf' | 'excel' | 'html';
  sections: ReportSection[];
  period: {
    start: string;
    end: string;
  };
  recipient: {
    name: string;
    role: string;
    email: string;
    cityId?: string;
    regionId?: string;
  };
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'metrics' | 'insights' | 'forecast' | 'recommendations';
  enabled: boolean;
}

export interface GeneratedReport {
  id: string;
  title: string;
  type: string;
  period: string;
  generatedAt: string;
  summary: {
    totalVisitors: number;
    growthRate: number;
    topInsights: string[];
    keyRecommendations: string[];
  };
}

class ReportGeneratorService {
  async generateReport(config: ReportConfig): Promise<GeneratedReport> {
    // Simulação de geração de relatório
    const report: GeneratedReport = {
      id: `report_${Date.now()}`,
      title: `Relatório ${config.type === 'monthly' ? 'Mensal' : config.type === 'quarterly' ? 'Trimestral' : 'Anual'} - ${new Date().toLocaleDateString('pt-BR')}`,
      type: config.type,
      period: `${config.period.start} - ${config.period.end}`,
      generatedAt: new Date().toISOString(),
      summary: {
        totalVisitors: Math.floor(Math.random() * 5000) + 1000,
        growthRate: Math.random() * 20 + 5,
        topInsights: ['Análise de dados concluída', 'Tendências identificadas'],
        keyRecommendations: ['Otimização recomendada', 'Estratégia sugerida']
      }
    };

    return report;
  }

  async getReportTemplates(): Promise<ReportConfig[]> {
    return [
      {
        type: 'monthly',
      format: 'pdf',
      sections: [
        { id: 'summary', title: 'Resumo Executivo', type: 'metrics', enabled: true },
          { id: 'metrics', title: 'Métricas Principais', type: 'metrics', enabled: true },
          { id: 'insights', title: 'Insights Estratégicos', type: 'insights', enabled: true }
      ],
      period: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        },
        recipient: {
          name: 'Usuário',
          role: 'Gestor',
          email: 'usuario@exemplo.com'
        }
      }
    ];
  }
}

export const reportGeneratorService = new ReportGeneratorService(); 

