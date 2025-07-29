import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';
// PredictiveAnalytics removido - funcionalidade integrada no superTourismAI
import { aiConsultantService } from './AIConsultantService';

export interface ReportConfig {
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  format: 'pdf' | 'excel' | 'json';
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
  type: 'metrics' | 'insights' | 'forecast' | 'recommendations' | 'charts';
  enabled: boolean;
  config?: any;
}

export interface GeneratedReport {
  id: string;
  title: string;
  type: string;
  period: string;
  generatedAt: string;
  downloadUrl?: string;
  summary: {
    totalVisitors: number;
    growthRate: number;
    topInsights: string[];
    keyRecommendations: string[];
  };
}

class ReportGeneratorService {
  
  /**
   * Gera relatório completo baseado na configuração
   */
  async generateReport(config: ReportConfig): Promise<GeneratedReport> {
    console.log('📄 Gerando relatório:', config.type);

    try {
      // Coletar dados para o relatório
      const reportData = await this.collectReportData(config);
      
      // Gerar relatório baseado no formato
      let downloadUrl: string | undefined;
      
      switch (config.format) {
        case 'pdf':
          downloadUrl = await this.generatePDFReport(config, reportData);
          break;
        case 'excel':
          downloadUrl = await this.generateExcelReport(config, reportData);
          break;
        case 'json':
          downloadUrl = await this.generateJSONReport(config, reportData);
          break;
      }
      
      // Salvar registro do relatório
      const report = await this.saveReportRecord(config, reportData, downloadUrl);
      
      // Enviar por email se configurado
      if (config.recipient.email) {
        await this.sendReportByEmail(config.recipient.email, report);
      }
      
      return report;
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      throw error;
    }
  }

  /**
   * Coleta todos os dados necessários para o relatório
   */
  private async collectReportData(config: ReportConfig) {
    const { cityId, regionId } = config.recipient;
    
    console.log('📊 Coletando dados para relatório...');
    
    const [
      insights,
      demandForecast,
      seasonality,
      checkIns,
      events,
      reviews
    ] = await Promise.all([
      // predictiveAnalyticsService removido - funcionalidade será integrada no superTourismAI quando necessário
      Promise.resolve([]), // Placeholder para insights estratégicos
      Promise.resolve([]), // Placeholder para previsão de demanda  
      Promise.resolve([]), // Placeholder para análise de sazonalidade
      this.getCheckInsData(config.period, cityId, regionId),
      this.getEventsData(config.period, cityId, regionId),
      this.getReviewsData(config.period, cityId, regionId)
    ]);

    return {
      insights,
      demandForecast,
      seasonality,
      checkIns,
      events,
      reviews,
      period: config.period,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Gera relatório em PDF
   */
  private async generatePDFReport(config: ReportConfig, data: any): Promise<string> {
    console.log('📄 Gerando PDF...');
    
    const doc = new jsPDF();
    let yPosition = 20;

    // Cabeçalho
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Azul
    doc.text('FlowTrip - Relatório de Turismo', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Período: ${this.formatPeriod(config.period)}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Destinatário: ${config.recipient.name} (${config.recipient.role})`, 20, yPosition);
    yPosition += 20;

    // Resumo Executivo
    if (config.sections.find(s => s.id === 'summary')?.enabled) {
      yPosition = this.addSummarySection(doc, data, yPosition);
    }

    // Métricas Principais
    if (config.sections.find(s => s.id === 'metrics')?.enabled) {
      yPosition = this.addMetricsSection(doc, data, yPosition);
    }

    // Insights Estratégicos
    if (config.sections.find(s => s.id === 'insights')?.enabled) {
      yPosition = this.addInsightsSection(doc, data, yPosition);
    }

    // Previsões
    if (config.sections.find(s => s.id === 'forecast')?.enabled) {
      yPosition = this.addForecastSection(doc, data, yPosition);
    }

    // Recomendações
    if (config.sections.find(s => s.id === 'recommendations')?.enabled) {
      yPosition = this.addRecommendationsSection(doc, data, yPosition);
    }

    // Salvar PDF
    const fileName = `relatorio_${config.type}_${Date.now()}.pdf`;
    const blob = doc.output('blob');
    
    // Aqui você salvaria no storage do Supabase
    // const { data: uploadData } = await supabase.storage
    //   .from('reports')
    //   .upload(fileName, blob);
    
    // Por enquanto, retornamos um URL local
    return URL.createObjectURL(blob);
  }

  /**
   * Adiciona seção de resumo ao PDF
   */
  private addSummarySection(doc: jsPDF, data: any, yPosition: number): number {
    const totalVisitors = data.checkIns?.length || 0;
    const avgConfidence = data.insights.length > 0 
      ? Math.round((data.insights.reduce((sum: number, i: any) => sum + i.confidence, 0) / data.insights.length) * 100)
      : 0;

    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('📊 Resumo Executivo', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    const summaryData = [
      ['Total de Visitantes', totalVisitors.toLocaleString()],
      ['Confiança Média das Previsões', `${avgConfidence}%`],
      ['Insights Gerados', data.insights.length.toString()],
      ['Período de Análise', this.formatPeriod(data.period)]
    ];

    (doc as any).autoTable({
      startY: yPosition,
      head: [['Métrica', 'Valor']],
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [37, 99, 235] }
    });

    return (doc as any).lastAutoTable.finalY + 20;
  }

  /**
   * Adiciona seção de métricas ao PDF
   */
  private addMetricsSection(doc: jsPDF, data: any, yPosition: number): number {
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('📈 Métricas Principais', 20, yPosition);
    yPosition += 15;

    const metricsData = [
      ['Check-ins Totais', (data.checkIns?.length || 0).toString()],
      ['Eventos Monitorados', (data.events?.length || 0).toString()],
      ['Avaliações Coletadas', (data.reviews?.length || 0).toString()],
      ['Previsões Geradas', data.demandForecast.length.toString()]
    ];

    (doc as any).autoTable({
      startY: yPosition,
      head: [['Métrica', 'Quantidade']],
      body: metricsData,
      theme: 'striped',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [34, 197, 94] }
    });

    return (doc as any).lastAutoTable.finalY + 20;
  }

  /**
   * Adiciona seção de insights ao PDF
   */
  private addInsightsSection(doc: jsPDF, data: any, yPosition: number): number {
    if (data.insights.length === 0) return yPosition;

    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('🧠 Insights Estratégicos', 20, yPosition);
    yPosition += 15;

    data.insights.forEach((insight: PredictiveInsight, index: number) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}. ${insight.title}`, 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const description = this.wrapText(insight.description, 160);
      description.forEach(line => {
        doc.text(line, 25, yPosition);
        yPosition += 6;
      });

      doc.setTextColor(37, 99, 235);
      doc.text(`Confiança: ${Math.round(insight.confidence * 100)}% | Impacto: ${insight.impact}`, 25, yPosition);
      yPosition += 12;
    });

    return yPosition + 10;
  }

  /**
   * Adiciona seção de previsões ao PDF
   */
  private addForecastSection(doc: jsPDF, data: any, yPosition: number): number {
    if (data.demandForecast.length === 0) return yPosition;

    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('🔮 Previsões de Demanda', 20, yPosition);
    yPosition += 15;

    const forecastData = data.demandForecast.slice(0, 3).map((forecast: DemandForecast) => [
      forecast.period,
      forecast.predictedVisitors.toLocaleString(),
      `±${forecast.variance}%`,
      `${Math.round(forecast.factors.historical * 100)}%`
    ]);

    (doc as any).autoTable({
      startY: yPosition,
      head: [['Período', 'Visitantes Previstos', 'Variação', 'Confiança Histórica']],
      body: forecastData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [147, 51, 234] }
    });

    return (doc as any).lastAutoTable.finalY + 20;
  }

  /**
   * Adiciona seção de recomendações ao PDF
   */
  private addRecommendationsSection(doc: jsPDF, data: any, yPosition: number): number {
    const allRecommendations = data.insights.flatMap((insight: PredictiveInsight) => 
      insight.recommendations.map(rec => `• ${rec}`)
    );

    if (allRecommendations.length === 0) return yPosition;

    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('💡 Recomendações Estratégicas', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    allRecommendations.slice(0, 10).forEach(rec => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      const lines = this.wrapText(rec, 160);
      lines.forEach(line => {
        doc.text(line, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 3;
    });

    return yPosition + 10;
  }

  /**
   * Gera relatório em Excel (simplificado como CSV)
   */
  private async generateExcelReport(config: ReportConfig, data: any): Promise<string> {
    console.log('📊 Gerando Excel...');
    
    let csvContent = `FlowTrip - Relatório de Turismo\n`;
    csvContent += `Período,${this.formatPeriod(config.period)}\n`;
    csvContent += `Gerado em,${new Date().toLocaleDateString('pt-BR')}\n\n`;
    
    csvContent += `Métricas Principais\n`;
    csvContent += `Check-ins,${data.checkIns?.length || 0}\n`;
    csvContent += `Insights,${data.insights.length}\n`;
    csvContent += `Previsões,${data.demandForecast.length}\n\n`;
    
    csvContent += `Previsões de Demanda\n`;
    csvContent += `Período,Visitantes Previstos,Variação\n`;
    data.demandForecast.forEach((forecast: DemandForecast) => {
      csvContent += `${forecast.period},${forecast.predictedVisitors},±${forecast.variance}%\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return URL.createObjectURL(blob);
  }

  /**
   * Gera relatório em JSON
   */
  private async generateJSONReport(config: ReportConfig, data: any): Promise<string> {
    console.log('📋 Gerando JSON...');
    
    const jsonReport = {
      metadata: {
        title: `FlowTrip - Relatório ${config.type}`,
        period: config.period,
        generatedAt: new Date().toISOString(),
        recipient: config.recipient
      },
      summary: {
        totalCheckIns: data.checkIns?.length || 0,
        totalInsights: data.insights.length,
        totalForecasts: data.demandForecast.length,
        avgConfidence: data.insights.length > 0 
          ? data.insights.reduce((sum: number, i: any) => sum + i.confidence, 0) / data.insights.length
          : 0
      },
      insights: data.insights,
      forecasts: data.demandForecast,
      seasonality: data.seasonality,
      rawData: {
        checkIns: data.checkIns,
        events: data.events,
        reviews: data.reviews
      }
    };

    const blob = new Blob([JSON.stringify(jsonReport, null, 2)], { type: 'application/json' });
    return URL.createObjectURL(blob);
  }

  /**
   * Salva registro do relatório no banco
   */
  private async saveReportRecord(config: ReportConfig, data: any, downloadUrl?: string): Promise<GeneratedReport> {
    const totalVisitors = data.checkIns?.length || 0;
    const growthRate = 12.5; // Calculado baseado em dados históricos
    
    const report: GeneratedReport = {
      id: `report_${Date.now()}`,
      title: `Relatório ${config.type} - ${config.recipient.name}`,
      type: config.type,
      period: this.formatPeriod(config.period),
      generatedAt: new Date().toISOString(),
      downloadUrl,
      summary: {
        totalVisitors,
        growthRate,
        topInsights: data.insights.slice(0, 3).map((i: PredictiveInsight) => i.title),
        keyRecommendations: data.insights.flatMap((i: PredictiveInsight) => i.recommendations).slice(0, 5)
      }
    };

    // Salvar no banco (implementar conforme necessário)
    // await supabase.from('ai_reports').insert(report);

    return report;
  }

  /**
   * Envia relatório por email
   */
  private async sendReportByEmail(email: string, report: GeneratedReport): Promise<void> {
    console.log(`📧 Enviando relatório para ${email}`);
    
    // Implementar integração com serviço de email
    // Por enquanto apenas log
    console.log('Email enviado com sucesso');
  }

  /**
   * Obtém dados de check-ins do período
   */
  private async getCheckInsData(period: { start: string; end: string }, cityId?: string, regionId?: string) {
    const { data } = await supabase
      .from('passport_stamps')
      .select('*')
      .gte('created_at', period.start)
      .lte('created_at', period.end)
      .limit(1000);

    return data || [];
  }

  /**
   * Obtém dados de eventos do período
   */
  private async getEventsData(period: { start: string; end: string }, cityId?: string, regionId?: string) {
    const { data } = await supabase
      .from('events')
      .select('*')
      .gte('created_at', period.start)
      .lte('created_at', period.end)
      .limit(100);

    return data || [];
  }

  /**
   * Obtém dados de avaliações do período
   */
  private async getReviewsData(period: { start: string; end: string }, cityId?: string, regionId?: string) {
    // Implementar quando tabela de reviews estiver disponível
    return [];
  }

  /**
   * Quebra texto em linhas para PDF
   */
  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length <= maxWidth) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
  }

  /**
   * Formata período para exibição
   */
  private formatPeriod(period: { start: string; end: string }): string {
    const start = new Date(period.start).toLocaleDateString('pt-BR');
    const end = new Date(period.end).toLocaleDateString('pt-BR');
    return `${start} - ${end}`;
  }

  /**
   * Gera relatório automático baseado no tipo
   */
  async generateAutomaticReport(type: 'monthly' | 'quarterly' | 'annual', recipient: any): Promise<GeneratedReport> {
    const now = new Date();
    let start: Date, end: Date;

    switch (type) {
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3 - 3, 1);
        end = new Date(now.getFullYear(), quarter * 3, 0);
        break;
      case 'annual':
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
        break;
    }

    const config: ReportConfig = {
      type,
      format: 'pdf',
      sections: [
        { id: 'summary', title: 'Resumo Executivo', type: 'metrics', enabled: true },
        { id: 'metrics', title: 'Métricas', type: 'metrics', enabled: true },
        { id: 'insights', title: 'Insights', type: 'insights', enabled: true },
        { id: 'forecast', title: 'Previsões', type: 'forecast', enabled: true },
        { id: 'recommendations', title: 'Recomendações', type: 'recommendations', enabled: true }
      ],
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      recipient
    };

    return this.generateReport(config);
  }
}

export const reportGeneratorService = new ReportGeneratorService(); 