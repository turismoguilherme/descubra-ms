/**
 * Public Sector Report Service
 * Serviço para geração de relatórios municipais
 * Com análises explicativas baseadas em dados reais
 */

import { supabase } from '@/integrations/supabase/client';
import { pdfTemplateService, ReportConfig } from '@/services/reports/pdfTemplateService';
import { 
  analyzeSecretaryReport, 
  SecretaryReportData, 
  AnalysisContext 
} from '@/services/reports/reportAnalysisService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ReportData {
  metrics: {
    totalCATs: number;
    activeCATs: number;
    touristsToday: number;
    touristsPeriod: number;
    previousPeriodTourists?: number;
    totalAttractions: number;
    activeAttractions: number;
    totalEvents: number;
    confirmedEvents: number;
    planningEvents: number;
    touristsByDay: Array<{ date: string; count: number }>;
    touristsByOrigin: Array<{ origin: string; count: number }>;
  };
  cats: Array<{
    id: string;
    name: string;
    location: string;
    tourists: number;
    rating: number;
    status: string;
  }>;
  attractions: Array<{
    id: string;
    name: string;
    category: string;
    visitors: number;
  }>;
  events: Array<{
    id: string;
    name: string;
    date: string;
    participants: number;
    status: string;
  }>;
}

export interface ReportOptions {
  title: string;
  period: {
    start: Date;
    end: Date;
  };
  includeMetrics?: boolean;
  includeCATs?: boolean;
  includeAttractions?: boolean;
  includeEvents?: boolean;
  includeCharts?: boolean;
}

export class PublicReportService {
  /**
   * Buscar dados para relatório
   */
  async fetchReportData(period: { start: Date; end: Date }): Promise<ReportData> {
    try {
      // Calcular período anterior para comparação
      const periodDuration = period.end.getTime() - period.start.getTime();
      const previousPeriodStart = new Date(period.start.getTime() - periodDuration);
      const previousPeriodEnd = new Date(period.start.getTime() - 1);

      // Buscar métricas
      const [catsResult, touristsResult, previousTouristsResult, attractionsResult, eventsResult] = await Promise.all([
        supabase
          .from('cat_locations')
          .select('id, name, address, city, is_active'),
        
        supabase
          .from('cat_tourists')
          .select('id, visit_date, origin_state, origin_country, cat_id')
          .gte('visit_date', period.start.toISOString().split('T')[0])
          .lte('visit_date', period.end.toISOString().split('T')[0]),
        
        supabase
          .from('cat_tourists')
          .select('id', { count: 'exact', head: true })
          .gte('visit_date', previousPeriodStart.toISOString().split('T')[0])
          .lte('visit_date', previousPeriodEnd.toISOString().split('T')[0]),
        
        supabase
          .from('tourism_inventory')
          .select('id, name, category, is_active, status'),
        
        supabase
          .from('events')
          .select('id, name, start_date, is_visible, status')
          .gte('start_date', period.start.toISOString())
          .lte('start_date', period.end.toISOString())
      ]);

      // Processar turistas por dia
      const touristsByDayMap = new Map<string, number>();
      (touristsResult.data || []).forEach((item) => {
        const date = item.visit_date || new Date().toISOString().split('T')[0];
        touristsByDayMap.set(date, (touristsByDayMap.get(date) || 0) + 1);
      });
      
      const touristsByDay = Array.from(touristsByDayMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Processar turistas por origem
      const originMap = new Map<string, number>();
      (touristsResult.data || []).forEach((item) => {
        const origin = item.origin_state || item.origin_country || 'Não informado';
        originMap.set(origin, (originMap.get(origin) || 0) + 1);
      });
      
      const touristsByOrigin = Array.from(originMap.entries())
        .map(([origin, count]) => ({ origin, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Processar turistas de hoje
      const today = new Date().toISOString().split('T')[0];
      const touristsToday = (touristsResult.data || []).filter(t => t.visit_date === today).length;

      // Processar CATs
      const allCats = catsResult.data || [];
      const activeCats = allCats.filter(cat => cat.is_active);

      const cats = await Promise.all(
        allCats.map(async (cat) => {
          // Contar turistas por CAT no período
          const catTourists = (touristsResult.data || []).filter(t => t.cat_id === cat.id);
          
          return {
            id: cat.id,
            name: cat.name,
            location: cat.address || cat.city || 'N/A',
            tourists: catTourists.length,
            rating: 4.5, // TODO: buscar avaliações reais
            status: cat.is_active ? 'Ativo' : 'Inativo'
          };
        })
      );

      // Processar atrações
      const allAttractions = attractionsResult.data || [];
      const activeAttractions = allAttractions.filter(a => a.is_active);

      // Processar eventos
      const allEvents = eventsResult.data || [];
      const confirmedEvents = allEvents.filter(e => e.status === 'confirmed' || e.status === 'published');
      const planningEvents = allEvents.filter(e => e.status === 'draft' || e.status === 'pending');

      return {
        metrics: {
          totalCATs: allCats.length,
          activeCATs: activeCats.length,
          touristsToday,
          touristsPeriod: touristsResult.data?.length || 0,
          previousPeriodTourists: previousTouristsResult.count || undefined,
          totalAttractions: allAttractions.length,
          activeAttractions: activeAttractions.length,
          totalEvents: allEvents.length,
          confirmedEvents: confirmedEvents.length,
          planningEvents: planningEvents.length,
          touristsByDay,
          touristsByOrigin
        },
        cats: cats.sort((a, b) => b.tourists - a.tourists),
        attractions: allAttractions.map(item => ({
          id: item.id,
          name: item.name || '',
          category: item.category || 'outros',
          visitors: 0
        })),
        events: allEvents.map(item => ({
          id: item.id,
          name: item.name || '',
          date: item.start_date || '',
          participants: 0,
          status: item.status || 'pending'
        }))
      };
    } catch (error) {
      console.error('Erro ao buscar dados do relatório:', error);
      throw error;
    }
  }

  /**
   * Gerar relatório em PDF usando o novo template
   */
  async generatePDFReport(options: ReportOptions): Promise<Blob> {
    const data = await this.fetchReportData(options.period);

    // Preparar dados para análise
    const analysisData: SecretaryReportData = {
      cats: {
        total: data.metrics.totalCATs,
        active: data.metrics.activeCATs
      },
      tourists: {
        total: data.metrics.touristsPeriod,
        today: data.metrics.touristsToday,
        previousPeriod: data.metrics.previousPeriodTourists
      },
      attractions: {
        total: data.metrics.totalAttractions,
        active: data.metrics.activeAttractions
      },
      events: {
        total: data.metrics.totalEvents,
        confirmed: data.metrics.confirmedEvents,
        planning: data.metrics.planningEvents
      },
      topOrigins: data.metrics.touristsByOrigin.slice(0, 5)
    };

    const analysisContext: AnalysisContext = {
      reportType: 'municipal_report',
      period: options.period,
      generatedBy: 'Secretaria de Turismo',
      userRole: 'secretary'
    };

    // Gerar análise
    const analysis = analyzeSecretaryReport(analysisData, analysisContext);

    // Preparar configuração do relatório
    const reportConfig: ReportConfig = {
      reportType: 'municipal_report',
      title: options.title,
      period: options.period,
      generatedBy: 'Secretaria de Turismo',
      customFields: [
        { label: 'Total de CATs', value: data.metrics.totalCATs },
        { label: 'CATs Ativos', value: data.metrics.activeCATs },
        { label: 'Turistas no Período', value: data.metrics.touristsPeriod },
        { label: 'Total de Atrações', value: data.metrics.totalAttractions },
        { label: 'Total de Eventos', value: data.metrics.totalEvents }
      ],
      analysis
    };

    // Adicionar tabela de CATs
    if (options.includeCATs !== false && data.cats.length > 0) {
      reportConfig.tableData = {
        headers: ['CAT', 'Localização', 'Turistas', 'Avaliação', 'Status'],
        rows: data.cats.map(cat => [
          cat.name,
          cat.location,
          cat.tourists,
          cat.rating.toFixed(1),
          cat.status
        ])
      };
    }

    // Adicionar seções adicionais
    const sections: Array<{ title: string; content: string | string[] | (string | number)[][] }> = [];

    // Seção de origem dos turistas
    if (data.metrics.touristsByOrigin.length > 0) {
      sections.push({
        title: 'Origem dos Turistas (Top 10)',
        content: [
          ['Origem', 'Quantidade'],
          ...data.metrics.touristsByOrigin.map(item => [item.origin, item.count])
        ]
      });
    }

    // Seção de eventos
    if (options.includeEvents !== false && data.events.length > 0) {
      sections.push({
        title: 'Eventos no Período',
        content: [
          ['Nome', 'Data', 'Status'],
          ...data.events.map(event => [
            event.name,
            event.date ? format(new Date(event.date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A',
            event.status === 'confirmed' || event.status === 'published' ? 'Confirmado' : 
            event.status === 'draft' ? 'Rascunho' : 'Pendente'
          ])
        ]
      });
    }

    // Seção de atrações
    if (options.includeAttractions !== false && data.attractions.length > 0) {
      sections.push({
        title: 'Inventário Turístico',
        content: [
          ['Atração', 'Categoria'],
          ...data.attractions.slice(0, 20).map(item => [item.name, item.category])
        ]
      });
    }

    if (sections.length > 0) {
      reportConfig.sections = sections;
    }

    // Gerar PDF usando o template padrão
    return pdfTemplateService.generateReport(reportConfig);
  }

  /**
   * Download do relatório
   */
  async downloadReport(options: ReportOptions): Promise<void> {
    try {
      const blob = await this.generatePDFReport(options);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${options.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw error;
    }
  }
}

export const publicReportService = new PublicReportService();
