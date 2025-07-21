import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportOptions {
  title: string;
  period?: string;
  format?: 'pdf' | 'csv';
  sections?: string[];
  customHeader?: string;
}

export class ReportGenerationService {
  async generateReport(data: any, options: ReportOptions) {
    switch (options.format) {
      case 'csv':
        return this.generateCSV(data, options);
      case 'pdf':
      default:
        return this.generatePDF(data, options);
    }
  }

  private async generatePDF(data: any, options: ReportOptions) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.text('FlowTrip - Análise Estratégica', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(options.title, pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Gerado em: ${format(new Date(), 'PPP', { locale: ptBR })}`, pageWidth / 2, 40, { align: 'center' });

    let yPosition = 50;

    // Métricas Principais
    if (data.metrics) {
      doc.setFontSize(12);
      doc.text('Métricas Principais', 14, yPosition);
      yPosition += 10;

      const metrics = [
        ['Indicador', 'Valor'],
        ['Crescimento de Visitantes', `${data.metrics.visitorGrowth}%`],
        ['Média de Permanência', `${data.metrics.avgStayDuration} dias`],
        ['Satisfação', `${data.metrics.satisfactionScore}/10`],
        ['Impacto Econômico', `R$ ${data.metrics.economicImpact.toLocaleString()}`]
      ];

      (doc as any).autoTable({
        startY: yPosition,
        head: [metrics[0]],
        body: metrics.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [0, 123, 255] }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Insights
    if (data.analysis?.insights) {
      doc.setFontSize(12);
      doc.text('Insights Principais', 14, yPosition);
      yPosition += 10;

      data.analysis.insights.forEach((insight: string) => {
        const lines = doc.splitTextToSize(insight, pageWidth - 28);
        doc.text(lines, 14, yPosition);
        yPosition += 10 * lines.length;
      });
    }

    // Recomendações
    if (data.recommendations) {
      doc.addPage();
      yPosition = 20;
      
      doc.setFontSize(12);
      doc.text('Plano de Ação', 14, yPosition);
      yPosition += 10;

      ['immediate', 'medium', 'long'].forEach((term: string) => {
        const title = {
          immediate: 'Ações Imediatas',
          medium: 'Médio Prazo',
          long: 'Longo Prazo'
        }[term];

        doc.setFontSize(11);
        doc.text(title, 14, yPosition);
        yPosition += 7;

        data.recommendations[term]?.forEach((rec: any) => {
          doc.setFontSize(10);
          doc.text(`• ${rec.title}`, 14, yPosition);
          yPosition += 5;
          
          const description = doc.splitTextToSize(rec.description, pageWidth - 28);
          doc.setFontSize(9);
          doc.text(description, 20, yPosition);
          yPosition += 5 * description.length;
          
          if (yPosition > doc.internal.pageSize.height - 20) {
            doc.addPage();
            yPosition = 20;
          }
        });

        yPosition += 10;
      });
    }

    return doc.output('blob');
  }

  private async generateCSV(data: any, options: ReportOptions) {
    const rows = [
      ['Data do Relatório', format(new Date(), 'PPP', { locale: ptBR })],
      [''],
      ['Métricas Principais'],
      ['Indicador', 'Valor'],
      ['Crescimento de Visitantes', `${data.metrics.visitorGrowth}%`],
      ['Média de Permanência', `${data.metrics.avgStayDuration} dias`],
      ['Satisfação', `${data.metrics.satisfactionScore}/10`],
      ['Impacto Econômico', `R$ ${data.metrics.economicImpact}`],
      [''],
      ['Insights Principais'],
      ...data.analysis.insights.map((insight: string) => [insight]),
      [''],
      ['Plano de Ação'],
      ['Prazo', 'Ação', 'Descrição', 'Impacto Esperado']
    ];

    // Adicionar recomendações
    ['immediate', 'medium', 'long'].forEach((term: string) => {
      const termTitle = {
        immediate: 'Imediato',
        medium: 'Médio Prazo',
        long: 'Longo Prazo'
      }[term];

      data.recommendations[term]?.forEach((rec: any) => {
        rows.push([termTitle, rec.title, rec.description, rec.impact]);
      });
    });

    // Converter para CSV
    const csv = rows
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }
} 