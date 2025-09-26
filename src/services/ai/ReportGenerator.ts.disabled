import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';
// PredictiveAnalytics removido - funcionalidade integrada no superTourismAI
import { aiConsultantService } from './AIConsultantService';
// import { PredictiveInsight, DemandForecast } from './types'; // Temporarily commented out

export interface ReportConfig {
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  format: 'pdf' | 'excel' | 'json';
  sections: ReportSection[];
  filters?: ReportFilter[];
  customRange?: {
    start: string;
    end: string;
  };
  period?: string; // Added for compatibility
  recipient?: string; // Added for compatibility
}

export interface ReportSection {
  id: string;
  name: string;
  title?: string; // Added for compatibility
  type: 'chart' | 'table' | 'summary' | 'insights' | 'recommendations' | 'metrics' | 'forecast'; // Added metrics and forecast
  enabled: boolean;
  config?: any;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: any;
}

export interface ReportData {
  id?: string; // Added for compatibility
  title?: string; // Added for compatibility
  period?: string; // Added for compatibility
  type?: string; // Added for compatibility
  downloadUrl?: string; // Added for compatibility
  metadata: {
    generated_at: string;
    period: string;
    type: string;
    filters_applied: string[];
  };
  summary: {
    total_tourists: number;
    totalVisitors?: number; // Added for compatibility
    total_revenue: number;
    satisfaction_rate: number;
    growth_rate: number;
    growthRate?: number; // Added for compatibility
  };
  charts: ChartData[];
  tables: TableData[];
  insights: any[]; // Simplified type
  recommendations: string[];
}

export interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  data: any[];
  config?: any;
}

export interface TableData {
  id: string;
  title: string;
  headers: string[];
  rows: any[][];
  config?: any;
}

class ReportGenerator {
  private jsPDF: any;

  constructor() {
    this.jsPDF = jsPDF;
  }

  /**
   * Gera relatório completo com análise avançada
   */
  async generateComprehensiveReport(config: ReportConfig): Promise<string> {
    try {
      const data = await this.collectReportData(config);
      
      if (config.format === 'pdf') {
        return await this.generatePDFReport(data, config);
      } else if (config.format === 'json') {
        return JSON.stringify(data, null, 2);
      } else {
        throw new Error('Formato de relatório não suportado');
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw error;
    }
  }

  /**
   * Coleta dados para o relatório
   */
  private async collectReportData(config: ReportConfig): Promise<ReportData> {
    const timeframe = this.getTimeframe(config);
    
    // Dados básicos do turismo
    const tourismData = await this.collectTourismData(timeframe);
    
    // Análise de satisfação
    const satisfactionData = await this.collectSatisfactionData(timeframe);
    
    // Insights preditivos
    const insights = await this.generatePredictiveInsights(tourismData);
    
    // Recomendações estratégicas
    const recommendations = await this.generateStrategicRecommendations(tourismData, insights);

    return {
      metadata: {
        generated_at: new Date().toISOString(),
        period: timeframe.label,
        type: config.type,
        filters_applied: config.filters?.map(f => f.field) || []
      },
      summary: {
        total_tourists: tourismData.total_visitors,
        total_revenue: tourismData.total_revenue,
        satisfaction_rate: satisfactionData.average_rating,
        growth_rate: tourismData.growth_rate
      },
      charts: await this.generateChartData(tourismData, satisfactionData),
      tables: await this.generateTableData(tourismData),
      insights,
      recommendations
    };
  }

  /**
   * Gera insights preditivos baseados nos dados
   */
  private async generatePredictiveInsights(data: any): Promise<any[]> {
    const insights: any[] = [];

    // Análise de tendência de visitação
    if (data.visitor_trend && data.visitor_trend.length > 0) {
      const trend = this.calculateTrend(data.visitor_trend);
      insights.push({
        type: trend > 0 ? 'opportunity' : 'risk',
        title: 'Tendência de Visitação',
        description: `Baseado nos dados históricos, ${trend > 0 ? 'espera-se um crescimento' : 'pode haver uma redução'} de ${Math.abs(trend).toFixed(1)}% no próximo período.`,
        confidence: 0.85,
        timeframe: 'próximos 3 meses',
        impact: trend > 10 ? 'high' : trend > 5 ? 'medium' : 'low',
        actionable: true,
        recommendations: trend > 0 ? 
          ['Preparar infraestrutura para aumento da demanda', 'Revisar capacidade de atendimento'] :
          ['Implementar estratégias de marketing', 'Revisar preços e promoções']
      });
    }

    // Análise de sazonalidade
    if (data.seasonal_patterns) {
      insights.push({
        type: 'trend',
        title: 'Padrões Sazonais',
        description: 'Identificados picos de visitação em períodos específicos que podem ser otimizados.',
        confidence: 0.9,
        timeframe: 'próximo ano',
        impact: 'medium',
        actionable: true,
        recommendations: [
          'Desenvolver campanhas específicas para alta temporada',
          'Criar ofertas atrativas para baixa temporada'
        ]
      });
    }

    // Análise de satisfação
    if (data.satisfaction_trend) {
      const satisfactionChange = this.calculateSatisfactionTrend(data.satisfaction_trend);
      insights.push({
        type: satisfactionChange > 0 ? 'opportunity' : 'risk',
        title: 'Evolução da Satisfação',
        description: `A satisfação dos visitantes ${satisfactionChange > 0 ? 'aumentou' : 'diminuiu'} ${Math.abs(satisfactionChange).toFixed(1)}% recentemente.`,
        confidence: 0.8,
        timeframe: 'tendência atual',
        impact: Math.abs(satisfactionChange) > 10 ? 'high' : 'medium',
        actionable: true,
        recommendations: satisfactionChange < 0 ? 
          ['Investigar causas da redução na satisfação', 'Implementar melhorias nos serviços'] :
          ['Manter padrão de qualidade', 'Ampliar práticas bem-sucedidas']
      });
    }

    return insights;
  }

  /**
   * Gera recomendações estratégicas
   */
  private async generateStrategicRecommendations(data: any, insights: any[]): Promise<string[]> {
    const recommendations = [];

    // Recomendações baseadas em insights
    insights.forEach(insight => {
      if (insight.recommendations) {
        recommendations.push(...insight.recommendations);
      }
    });

    // Recomendações baseadas em dados
    if (data.digital_adoption < 50) {
      recommendations.push('Investir em soluções digitais para melhorar a experiência do turista');
    }

    if (data.repeat_visitor_rate < 30) {
      recommendations.push('Desenvolver programas de fidelização para aumentar visitantes recorrentes');
    }

    if (data.average_stay < 2) {
      recommendations.push('Criar roteiros e experiências para estender a permanência dos turistas');
    }

    return recommendations;
  }

  /**
   * Gera dados para gráficos
   */
  private async generateChartData(tourismData: any, satisfactionData: any): Promise<ChartData[]> {
    const charts: ChartData[] = [];

    // Gráfico de visitação ao longo do tempo
    if (tourismData.monthly_visitors) {
      charts.push({
        id: 'visitors_timeline',
        title: 'Evolução de Visitantes',
        type: 'line',
        data: tourismData.monthly_visitors,
        config: {
          xAxis: 'month',
          yAxis: 'visitors',
          color: '#3B82F6'
        }
      });
    }

    // Gráfico de satisfação
    if (satisfactionData.ratings_distribution) {
      charts.push({
        id: 'satisfaction_distribution',
        title: 'Distribuição de Avaliações',
        type: 'bar',
        data: satisfactionData.ratings_distribution,
        config: {
          xAxis: 'rating',
          yAxis: 'count',
          color: '#10B981'
        }
      });
    }

    // Gráfico de origem dos visitantes
    if (tourismData.visitor_origin) {
      charts.push({
        id: 'visitor_origin',
        title: 'Origem dos Visitantes',
        type: 'pie',
        data: tourismData.visitor_origin,
        config: {
          labelField: 'origin',
          valueField: 'count'
        }
      });
    }

    return charts;
  }

  /**
   * Gera dados para tabelas
   */
  private async generateTableData(data: any): Promise<TableData[]> {
    const tables: TableData[] = [];

    // Tabela de top destinos
    if (data.top_destinations) {
      tables.push({
        id: 'top_destinations',
        title: 'Principais Destinos',
        headers: ['Destino', 'Visitantes', 'Receita', 'Satisfação'],
        rows: data.top_destinations.map((dest: any) => [
          dest.name,
          dest.visitors.toLocaleString(),
          `R$ ${dest.revenue.toLocaleString()}`,
          `${dest.satisfaction}⭐`
        ])
      });
    }

    return tables;
  }

  /**
   * Gera relatório em PDF
   */
  private async generatePDFReport(data: ReportData, config: ReportConfig): Promise<string> {
    const doc = new this.jsPDF();
    let yPosition = 20;

    // Cabeçalho
    doc.setFontSize(20);
    doc.text('Relatório de Turismo - MS Turismo', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.text(`Período: ${data.metadata.period}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Gerado em: ${new Date(data.metadata.generated_at).toLocaleDateString('pt-BR')}`, 20, yPosition);
    yPosition += 20;

    // Resumo executivo
    doc.setFontSize(16);
    doc.text('Resumo Executivo', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.text(`Total de Turistas: ${data.summary.total_tourists.toLocaleString()}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Receita Total: R$ ${data.summary.total_revenue.toLocaleString()}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Taxa de Satisfação: ${data.summary.satisfaction_rate.toFixed(1)}%`, 20, yPosition);
    yPosition += 8;
    doc.text(`Taxa de Crescimento: ${data.summary.growth_rate.toFixed(1)}%`, 20, yPosition);
    yPosition += 20;

    // Insights
    if (data.insights.length > 0) {
      doc.setFontSize(16);
      doc.text('Insights Preditivos', 20, yPosition);
      yPosition += 15;

      data.insights.forEach((insight: any) => {
        doc.setFontSize(12);
        doc.text(`• ${insight.title}`, 25, yPosition);
        yPosition += 8;
        
        const description = doc.splitTextToSize(insight.description, 160);
        doc.text(description, 30, yPosition);
        yPosition += description.length * 6 + 5;
      });
      yPosition += 10;
    }

    // Recomendações
    if (data.recommendations.length > 0) {
      doc.setFontSize(16);
      doc.text('Recomendações Estratégicas', 20, yPosition);
      yPosition += 15;

      data.recommendations.forEach((rec: string) => {
        doc.setFontSize(12);
        doc.text(`• ${rec}`, 25, yPosition);
        yPosition += 8;
      });
    }

    return doc.output('datauristring');
  }

  /**
   * Utilitários
   */
  private getTimeframe(config: ReportConfig) {
    const now = new Date();
    let start, end, label;

    switch (config.type) {
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        label = `${now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`;
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        label = `Q${quarter + 1} ${now.getFullYear()}`;
        break;
      case 'annual':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        label = `${now.getFullYear()}`;
        break;
      case 'custom':
        start = new Date(config.customRange!.start);
        end = new Date(config.customRange!.end);
        label = `${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`;
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        label = 'Mês atual';
    }

    return { start, end, label };
  }

  private async collectTourismData(timeframe: any) {
    // Implementação simplificada
    return {
      total_visitors: 15420,
      total_revenue: 2340000,
      growth_rate: 12.5,
      visitor_trend: [100, 110, 120, 115, 130],
      seasonal_patterns: true,
      satisfaction_trend: [4.2, 4.3, 4.1, 4.4, 4.5],
      digital_adoption: 65,
      repeat_visitor_rate: 25,
      average_stay: 2.5,
      monthly_visitors: [
        { month: 'Jan', visitors: 1200 },
        { month: 'Fev', visitors: 1350 },
        { month: 'Mar', visitors: 1500 },
        { month: 'Abr', visitors: 1400 },
        { month: 'Mai', visitors: 1650 }
      ],
      visitor_origin: [
        { origin: 'Local', count: 8000 },
        { origin: 'Nacional', count: 6000 },
        { origin: 'Internacional', count: 1420 }
      ],
      top_destinations: [
        { name: 'Centro Histórico', visitors: 5000, revenue: 800000, satisfaction: 4.5 },
        { name: 'Parque Natural', visitors: 3500, revenue: 600000, satisfaction: 4.3 },
        { name: 'Museu Regional', visitors: 2800, revenue: 400000, satisfaction: 4.2 }
      ]
    };
  }

  private async collectSatisfactionData(timeframe: any) {
    return {
      average_rating: 4.3,
      ratings_distribution: [
        { rating: '1⭐', count: 50 },
        { rating: '2⭐', count: 120 },
        { rating: '3⭐', count: 800 },
        { rating: '4⭐', count: 2500 },
        { rating: '5⭐', count: 1800 }
      ]
    };
  }

  private calculateTrend(data: number[]): number {
    if (data.length < 2) return 0;
    const first = data[0];
    const last = data[data.length - 1];
    return ((last - first) / first) * 100;
  }

  private calculateSatisfactionTrend(data: number[]): number {
    if (data.length < 2) return 0;
    const first = data[0];
    const last = data[data.length - 1];
    return ((last - first) / first) * 100;
  }
}

export const reportGenerator = new ReportGenerator();

// Additional exports for compatibility
export const reportGeneratorService = reportGenerator;
export type GeneratedReport = ReportData;

// Add missing methods for compatibility
(ReportGenerator.prototype as any).generateReport = ReportGenerator.prototype.generateComprehensiveReport;
(ReportGenerator.prototype as any).generateAutomaticReport = ReportGenerator.prototype.generateComprehensiveReport;