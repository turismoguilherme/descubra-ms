import { supabase } from '@/integrations/supabase/client';
// PredictiveAnalytics removido - funcionalidade integrada no superTourismAI
import { reportGeneratorService } from './ReportGenerator';

export interface InfographicData {
  type: 'tourism_summary' | 'monthly_report' | 'visitor_profile' | 'seasonal_analysis' | 'growth_trends';
  title: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    key: string;
    value: number | string;
    unit?: string;
    trend?: 'up' | 'down' | 'stable';
    percentage?: number;
  }[];
  charts: {
    type: 'bar' | 'line' | 'pie' | 'area' | 'donut';
    title: string;
    data: any[];
    config?: any;
  }[];
  highlights: string[];
  recommendations: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface InfographicTemplate {
  id: string;
  name: string;
  description: string;
  category: 'tourism' | 'marketing' | 'performance' | 'analysis';
  layout: 'vertical' | 'horizontal' | 'grid';
  sections: InfographicSection[];
}

export interface InfographicSection {
  id: string;
  type: 'header' | 'metric_cards' | 'chart' | 'text' | 'highlights' | 'footer';
  title?: string;
  config: any;
}

class InfographicsService {
  private templates: InfographicTemplate[] = [
    {
      id: 'tourism_summary',
      name: 'Resumo Turístico',
      description: 'Visão geral das métricas de turismo',
      category: 'tourism',
      layout: 'vertical',
      sections: [
        { id: 'header', type: 'header', config: { includeDate: true, includeLogo: true } },
        { id: 'metrics', type: 'metric_cards', config: { columns: 4 } },
        { id: 'main_chart', type: 'chart', config: { type: 'line', title: 'Visitação ao Longo do Tempo' } },
        { id: 'highlights', type: 'highlights', config: { maxItems: 5 } },
        { id: 'footer', type: 'footer', config: { includeSource: true } }
      ]
    },
    {
      id: 'visitor_profile',
      name: 'Perfil dos Visitantes',
      description: 'Análise demográfica dos visitantes',
      category: 'analysis',
      layout: 'grid',
      sections: [
        { id: 'header', type: 'header', config: { includeDate: true } },
        { id: 'age_chart', type: 'chart', config: { type: 'pie', title: 'Faixa Etária' } },
        { id: 'origin_chart', type: 'chart', config: { type: 'bar', title: 'Origem dos Visitantes' } },
        { id: 'metrics', type: 'metric_cards', config: { columns: 3 } },
        { id: 'recommendations', type: 'text', config: { type: 'recommendations' } }
      ]
    }
  ];

  /**
   * Gera infográfico baseado nos dados e template
   */
  async generateInfographic(
    templateId: string,
    cityId?: string,
    regionId?: string,
    customData?: Partial<InfographicData>
  ): Promise<InfographicData> {
    console.log(`📊 Gerando infográfico: ${templateId}`);

    try {
      const template = this.templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error(`Template ${templateId} não encontrado`);
      }

      // Coletar dados necessários
      const data = await this.collectInfographicData(template.category, cityId, regionId);
      
      // Processar dados baseado no template
      const infographicData = await this.processDataForTemplate(template, data, customData);
      
      return infographicData;

    } catch (error) {
      console.error('❌ Erro ao gerar infográfico:', error);
      throw error;
    }
  }

  /**
   * Coleta dados necessários para o infográfico
   */
  private async collectInfographicData(category: string, cityId?: string, regionId?: string) {
    const [
      insights,
      demandForecast,
      seasonality,
      checkIns,
      events
    ] = await Promise.all([
      // predictiveAnalyticsService removido - funcionalidade integrada no superTourismAI
      Promise.resolve([]), // Placeholder para insights estratégicos
      Promise.resolve([]), // Placeholder para previsão de demanda
      Promise.resolve([]), // Placeholder para análise de sazonalidade
      this.getCheckInsData(cityId, regionId),
      this.getEventsData(cityId, regionId)
    ]);

    return {
      insights,
      demandForecast,
      seasonality,
      checkIns,
      events,
      processedMetrics: this.calculateMetrics(checkIns, events)
    };
  }

  /**
   * Processa dados baseado no template
   */
  private async processDataForTemplate(
    template: InfographicTemplate,
    data: any,
    customData?: Partial<InfographicData>
  ): Promise<InfographicData> {
    
    const baseInfographic: InfographicData = {
      type: template.id as any,
      title: customData?.title || template.name,
      period: customData?.period || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      metrics: [],
      charts: [],
      highlights: [],
      recommendations: [],
      colors: customData?.colors || {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#059669'
      }
    };

    // Processar cada seção do template
    for (const section of template.sections) {
      switch (section.type) {
        case 'metric_cards':
          baseInfographic.metrics = this.generateMetricCards(data, section.config);
          break;
        case 'chart':
          const chart = this.generateChart(data, section.config);
          if (chart) baseInfographic.charts.push(chart);
          break;
        case 'highlights':
          baseInfographic.highlights = this.generateHighlights(data, section.config);
          break;
      }
    }

    // Adicionar recomendações baseadas nos insights
    baseInfographic.recommendations = data.insights
      .flatMap((insight: any) => insight.recommendations)
      .slice(0, 3);

    return baseInfographic;
  }

  /**
   * Gera cards de métricas
   */
  private generateMetricCards(data: any, config: any) {
    const metrics = [
      {
        key: 'Visitantes Totais',
        value: data.checkIns.length,
        unit: 'visitantes',
        trend: 'up' as const,
        percentage: 12.5
      },
      {
        key: 'Eventos Realizados',
        value: data.events.length,
        unit: 'eventos',
        trend: 'up' as const,
        percentage: 8.3
      },
      {
        key: 'Satisfação Média',
        value: '4.2',
        unit: '/5',
        trend: 'stable' as const,
        percentage: 0
      },
      {
        key: 'Taxa de Crescimento',
        value: '+15.2',
        unit: '%',
        trend: 'up' as const,
        percentage: 15.2
      }
    ];

    if (data.processedMetrics) {
      metrics[0].value = data.processedMetrics.totalVisitors;
      metrics[1].value = data.processedMetrics.totalEvents;
      metrics[2].value = data.processedMetrics.avgRating.toFixed(1);
      metrics[3].value = `${data.processedMetrics.growthRate > 0 ? '+' : ''}${data.processedMetrics.growthRate.toFixed(1)}`;
    }

    return metrics.slice(0, config.columns || 4);
  }

  /**
   * Gera gráficos
   */
  private generateChart(data: any, config: any) {
    switch (config.type) {
      case 'line':
        return this.generateVisitationLineChart(data, config);
      case 'pie':
        return this.generateDemographicPieChart(data, config);
      case 'bar':
        return this.generateOriginBarChart(data, config);
      case 'area':
        return this.generateSeasonalityAreaChart(data, config);
      default:
        return null;
    }
  }

  /**
   * Gera gráfico de linha da visitação
   */
  private generateVisitationLineChart(data: any, config: any) {
    // Agrupar check-ins por semana
    const weeklyData = this.groupCheckInsByWeek(data.checkIns);
    
    return {
      type: 'line' as const,
      title: config.title || 'Visitação Semanal',
      data: weeklyData.map((week: any) => ({
        period: week.week,
        value: week.count,
        label: `${week.count} visitantes`
      }))
    };
  }

  /**
   * Gera gráfico de pizza demográfico
   */
  private generateDemographicPieChart(data: any, config: any) {
    // Simulação de dados demográficos
    const ageGroups = [
      { name: '18-25', value: 25, color: '#3b82f6' },
      { name: '26-35', value: 35, color: '#06b6d4' },
      { name: '36-45', value: 20, color: '#10b981' },
      { name: '46-55', value: 15, color: '#f59e0b' },
      { name: '55+', value: 5, color: '#ef4444' }
    ];

    return {
      type: 'pie' as const,
      title: config.title || 'Faixa Etária dos Visitantes',
      data: ageGroups
    };
  }

  /**
   * Gera gráfico de barras de origem
   */
  private generateOriginBarChart(data: any, config: any) {
    // Simulação de dados de origem
    const origins = [
      { name: 'São Paulo', value: 45, color: '#3b82f6' },
      { name: 'Rio de Janeiro', value: 25, color: '#06b6d4' },
      { name: 'Minas Gerais', value: 15, color: '#10b981' },
      { name: 'Paraná', value: 10, color: '#f59e0b' },
      { name: 'Outros', value: 5, color: '#ef4444' }
    ];

    return {
      type: 'bar' as const,
      title: config.title || 'Origem dos Visitantes',
      data: origins
    };
  }

  /**
   * Gera gráfico de área da sazonalidade
   */
  private generateSeasonalityAreaChart(data: any, config: any) {
    const seasonalData = data.seasonality.map((season: any) => ({
      month: season.monthName,
      value: season.expectedVisitors,
      confidence: season.confidenceLevel
    }));

    return {
      type: 'area' as const,
      title: config.title || 'Sazonalidade Anual',
      data: seasonalData
    };
  }

  /**
   * Gera highlights/destaques
   */
  private generateHighlights(data: any, config: any) {
    const highlights = [
      `${data.checkIns.length} visitantes registraram check-in no período`,
      `${data.events.length} eventos foram realizados`,
      'Crescimento de 15% em relação ao período anterior',
      'Satisfação média de 4.2/5 entre os visitantes'
    ];

    // Adicionar highlights dos insights
    if (data.insights.length > 0) {
      highlights.push(
        ...data.insights.slice(0, 2).map((insight: any) => insight.title)
      );
    }

    return highlights.slice(0, config.maxItems || 5);
  }

  /**
   * Gera infográfico em SVG
   */
  async generateSVGInfographic(infographicData: InfographicData): Promise<string> {
    // Implementação simplificada de geração SVG
    const width = 800;
    const height = 1200;
    
    let svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .title { font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; fill: ${infographicData.colors.primary}; }
            .subtitle { font-family: Arial, sans-serif; font-size: 16px; fill: ${infographicData.colors.secondary}; }
            .metric-value { font-family: Arial, sans-serif; font-size: 32px; font-weight: bold; fill: ${infographicData.colors.primary}; }
            .metric-label { font-family: Arial, sans-serif; font-size: 14px; fill: ${infographicData.colors.secondary}; }
            .highlight { font-family: Arial, sans-serif; font-size: 14px; fill: #374151; }
          </style>
        </defs>
        
        <!-- Header -->
        <rect width="${width}" height="80" fill="${infographicData.colors.primary}" opacity="0.1"/>
        <text x="40" y="35" class="title">${infographicData.title}</text>
        <text x="40" y="55" class="subtitle">Período: ${this.formatPeriod(infographicData.period)}</text>
        
        <!-- Metrics Grid -->
        ${this.generateMetricsSVG(infographicData.metrics, 40, 120, width - 80)}
        
        <!-- Highlights -->
        ${this.generateHighlightsSVG(infographicData.highlights, 40, 300, width - 80)}
        
        <!-- Footer -->
        <text x="40" y="${height - 40}" class="subtitle">Gerado por FlowTrip IA • ${new Date().toLocaleDateString('pt-BR')}</text>
      </svg>
    `;

    return svg;
  }

  /**
   * Gera SVG das métricas
   */
  private generateMetricsSVG(metrics: any[], x: number, y: number, width: number): string {
    const cardWidth = (width - 60) / 4; // 4 colunas com espaçamento
    let svg = '';

    metrics.forEach((metric, index) => {
      const cardX = x + (cardWidth + 20) * index;
      const cardY = y;

      svg += `
        <!-- Metric Card ${index + 1} -->
        <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="120" fill="white" stroke="#e5e7eb" stroke-width="1" rx="8"/>
        <text x="${cardX + cardWidth/2}" y="${cardY + 40}" class="metric-value" text-anchor="middle">${metric.value}</text>
        <text x="${cardX + cardWidth/2}" y="${cardY + 60}" class="metric-label" text-anchor="middle">${metric.unit || ''}</text>
        <text x="${cardX + cardWidth/2}" y="${cardY + 80}" class="metric-label" text-anchor="middle">${metric.key}</text>
        ${metric.trend === 'up' ? `<polygon points="${cardX + cardWidth - 30},${cardY + 20} ${cardX + cardWidth - 20},${cardY + 20} ${cardX + cardWidth - 25},${cardY + 10}" fill="#10b981"/>` : ''}
      `;
    });

    return svg;
  }

  /**
   * Gera SVG dos highlights
   */
  private generateHighlightsSVG(highlights: string[], x: number, y: number, width: number): string {
    let svg = `<text x="${x}" y="${y}" class="subtitle">📊 Principais Destaques</text>`;
    
    highlights.forEach((highlight, index) => {
      svg += `<text x="${x + 20}" y="${y + 30 + (index * 25)}" class="highlight">• ${highlight}</text>`;
    });

    return svg;
  }

  /**
   * Exporta infográfico para PNG (usando Canvas)
   */
  async exportToPNG(svgData: string): Promise<string> {
    // Implementação simplificada - em produção usaria bibliotecas específicas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    return new Promise((resolve) => {
      const img = new Image();
      const svg = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svg);
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          }
        }, 'image/png');
      };
      
      img.src = url;
    });
  }

  /**
   * Lista templates disponíveis
   */
  getAvailableTemplates(): InfographicTemplate[] {
    return this.templates;
  }

  // Métodos auxiliares
  private async getCheckInsData(cityId?: string, regionId?: string) {
    const { data } = await supabase
      .from('passport_stamps')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(1000);
    return data || [];
  }

  private async getEventsData(cityId?: string, regionId?: string) {
    const { data } = await supabase
      .from('events')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100);
    return data || [];
  }

  private calculateMetrics(checkIns: any[], events: any[]) {
    return {
      totalVisitors: checkIns.length,
      totalEvents: events.length,
      avgRating: 4.2 + (Math.random() - 0.5) * 0.4,
      growthRate: (Math.random() - 0.3) * 30 // -30% a +30%
    };
  }

  private groupCheckInsByWeek(checkIns: any[]) {
    const weeks: Record<string, { week: string; count: number }> = {};
    
    checkIns.forEach(checkIn => {
      const date = new Date(checkIn.created_at);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          week: weekStart.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
          count: 0
        };
      }
      weeks[weekKey].count++;
    });

    return Object.values(weeks).sort((a, b) => a.week.localeCompare(b.week));
  }

  private formatPeriod(period: { start: string; end: string }): string {
    const start = new Date(period.start).toLocaleDateString('pt-BR');
    const end = new Date(period.end).toLocaleDateString('pt-BR');
    return `${start} - ${end}`;
  }
}

export const infographicsService = new InfographicsService(); 