/**
 * Public Sector Report Service
 * Serviço para geração de relatórios municipais
 */

import { supabase } from '@/integrations/supabase/client';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ReportData {
  metrics: {
    totalCATs: number;
    touristsToday: number;
    totalAttractions: number;
    totalEvents: number;
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
      // Buscar métricas
      const [catsResult, touristsResult, attractionsResult, eventsResult] = await Promise.all([
        supabase
          .from('cat_locations')
          .select('id, name, address, city, is_active')
          .eq('is_active', true),
        
        supabase
          .from('cat_tourists')
          .select('id, visit_date, origin_state, origin_country')
          .gte('visit_date', period.start.toISOString().split('T')[0])
          .lte('visit_date', period.end.toISOString().split('T')[0]),
        
        supabase
          .from('tourism_inventory')
          .select('id, name, category, is_active')
          .eq('is_active', true)
          .limit(50),
        
        supabase
          .from('events')
          .select('id, name, start_date, is_visible')
          .gte('start_date', period.start.toISOString())
          .lte('start_date', period.end.toISOString())
          .eq('is_visible', true)
          .limit(50)
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

      // Processar CATs
      const cats = await Promise.all(
        (catsResult.data || []).map(async (cat) => {
          const { count } = await supabase
            .from('cat_tourists')
            .select('id', { count: 'exact', head: true })
            .eq('visit_date', new Date().toISOString().split('T')[0])
            .eq('cat_id', cat.id);
          
          return {
            id: cat.id,
            name: cat.name,
            location: cat.address || cat.city || 'N/A',
            tourists: count || 0,
            rating: 4.5,
            status: 'active'
          };
        })
      );

      return {
        metrics: {
          totalCATs: catsResult.data?.length || 0,
          touristsToday: touristsResult.data?.length || 0,
          totalAttractions: attractionsResult.data?.length || 0,
          totalEvents: eventsResult.data?.length || 0,
          touristsByDay,
          touristsByOrigin
        },
        cats,
        attractions: (attractionsResult.data || []).map(item => ({
          id: item.id,
          name: item.name || '',
          category: item.category || 'outros',
          visitors: 0
        })),
        events: (eventsResult.data || []).map(item => ({
          id: item.id,
          name: item.name || '',
          date: item.start_date || '',
          participants: 0
        }))
      };
    } catch (error) {
      console.error('Erro ao buscar dados do relatório:', error);
      throw error;
    }
  }

  /**
   * Gerar relatório em PDF
   */
  async generatePDFReport(options: ReportOptions): Promise<Blob> {
    const data = await this.fetchReportData(options.period);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    // Cabeçalho
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246); // Azul
    doc.text('ViaJAR - Relatório Municipal', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(options.title, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Período: ${format(options.period.start, 'dd/MM/yyyy', { locale: ptBR })} a ${format(options.period.end, 'dd/MM/yyyy', { locale: ptBR })}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    );
    
    yPosition += 6;
    doc.text(
      `Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    );

    yPosition += 15;

    // Métricas Principais
    if (options.includeMetrics !== false) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Métricas Principais', 20, yPosition);
      yPosition += 10;

      const metricsData = [
        ['Indicador', 'Valor'],
        ['Total de CATs', data.metrics.totalCATs.toString()],
        ['Turistas Hoje', data.metrics.touristsToday.toString()],
        ['Total de Atrações', data.metrics.totalAttractions.toString()],
        ['Total de Eventos', data.metrics.totalEvents.toString()]
      ];

      (doc as any).autoTable({
        startY: yPosition,
        head: [metricsData[0]],
        body: metricsData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10 },
        margin: { left: 20, right: 20 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Performance dos CATs
    if (options.includeCATs !== false && data.cats.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text('Performance dos CATs', 20, yPosition);
      yPosition += 10;

      const catsData = data.cats.map(cat => [
        cat.name,
        cat.location,
        cat.tourists.toString(),
        cat.rating.toFixed(1),
        cat.status
      ]);

      (doc as any).autoTable({
        startY: yPosition,
        head: [['Nome', 'Localização', 'Turistas Hoje', 'Avaliação', 'Status']],
        body: catsData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9 },
        margin: { left: 20, right: 20 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Turistas por Origem
    if (data.metrics.touristsByOrigin.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text('Origem dos Turistas (Top 10)', 20, yPosition);
      yPosition += 10;

      const originData = data.metrics.touristsByOrigin.map(item => [
        item.origin,
        item.count.toString()
      ]);

      (doc as any).autoTable({
        startY: yPosition,
        head: [['Origem', 'Quantidade']],
        body: originData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10 },
        margin: { left: 20, right: 20 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Eventos
    if (options.includeEvents !== false && data.events.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text('Eventos Programados', 20, yPosition);
      yPosition += 10;

      const eventsData = data.events.map(event => [
        event.name,
        format(new Date(event.date), 'dd/MM/yyyy', { locale: ptBR }),
        event.participants.toString()
      ]);

      (doc as any).autoTable({
        startY: yPosition,
        head: [['Nome', 'Data', 'Participantes']],
        body: eventsData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9 },
        margin: { left: 20, right: 20 }
      });
    }

    // Rodapé
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    return doc.output('blob');
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

