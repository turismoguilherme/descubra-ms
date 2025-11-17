/**
 * Report Generation Service for Private Dashboard
 * Gera relatórios em PDF e Excel para empresários
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { QuestionnaireAnswers } from '@/types/diagnostic';
import { AnalysisResult } from '@/services/diagnostic/analysisService';

// Importação dinâmica do xlsx para evitar problemas de build
let XLSX: any = null;
try {
  // @ts-ignore - xlsx pode não estar instalado
  XLSX = require('xlsx');
} catch (e) {
  console.warn('xlsx não disponível, funcionalidade Excel desabilitada');
}

export interface ReportData {
  type: 'diagnostic' | 'revenue' | 'market' | 'benchmark' | 'consolidated';
  format: 'pdf' | 'excel' | 'json';
  answers?: QuestionnaireAnswers | null;
  analysisResult?: AnalysisResult | null;
  businessType?: string | null;
  user?: string;
  generatedAt: string;
  dataSources: string[];
  metadata?: any;
}

export class PrivateReportGenerationService {
  /**
   * Gerar relatório em PDF
   */
  async generatePDF(data: ReportData): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = margin;

    // Cabeçalho
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246); // blue-600
    doc.text('ViaJAR - Relatório de Análise', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    const reportTitle = this.getReportTitle(data.type);
    doc.text(reportTitle, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Gerado em: ${format(new Date(data.generatedAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    );
    yPosition += 15;

    // Informações do usuário
    if (data.user) {
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Empresário: ${data.user}`, margin, yPosition);
      yPosition += 7;
    }

    if (data.businessType) {
      doc.text(`Tipo de Negócio: ${this.formatBusinessType(data.businessType)}`, margin, yPosition);
      yPosition += 10;
    }

    // Seção: Fontes de Dados
    if (data.dataSources && data.dataSources.length > 0) {
      yPosition += 5;
      doc.setFontSize(12);
      doc.setTextColor(59, 130, 246);
      doc.text('Fontes de Dados', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      data.dataSources.forEach((source) => {
        doc.text(`• ${source}`, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    }

    // Conteúdo específico por tipo de relatório
    if (data.type === 'diagnostic' && data.analysisResult) {
      yPosition = this.addDiagnosticContent(doc, data.analysisResult, yPosition, pageWidth, margin);
    } else if (data.type === 'consolidated' && data.analysisResult) {
      yPosition = this.addDiagnosticContent(doc, data.analysisResult, yPosition, pageWidth, margin);
      // Adicionar outras seções se necessário
    }

    return doc.output('blob');
  }

  /**
   * Gerar relatório em Excel
   */
  async generateExcel(data: ReportData): Promise<Blob> {
    if (!XLSX) {
      throw new Error('Biblioteca xlsx não disponível. Por favor, instale: npm install xlsx');
    }
    
    const workbook = XLSX.utils.book_new();

    // Aba: Resumo
    const summaryData = [
      ['ViaJAR - Relatório de Análise'],
      [this.getReportTitle(data.type)],
      [''],
      ['Gerado em:', format(new Date(data.generatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })],
      ['Empresário:', data.user || 'N/A'],
      ['Tipo de Negócio:', data.businessType ? this.formatBusinessType(data.businessType) : 'N/A'],
      [''],
      ['Fontes de Dados:'],
      ...data.dataSources.map(source => [source])
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

    // Aba: Diagnóstico (se disponível)
    if (data.analysisResult) {
      const diagnosticData = this.buildDiagnosticExcelData(data.analysisResult);
      const diagnosticSheet = XLSX.utils.aoa_to_sheet(diagnosticData);
      XLSX.utils.book_append_sheet(workbook, diagnosticSheet, 'Diagnóstico');
    }

    // Aba: Recomendações (se disponível)
    if (data.analysisResult && data.analysisResult.recommendations.length > 0) {
      const recommendationsData = this.buildRecommendationsExcelData(data.analysisResult);
      const recommendationsSheet = XLSX.utils.aoa_to_sheet(recommendationsData);
      XLSX.utils.book_append_sheet(workbook, recommendationsSheet, 'Recomendações');
    }

    // Gerar arquivo
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  /**
   * Adicionar conteúdo do diagnóstico ao PDF
   */
  private addDiagnosticContent(
    doc: jsPDF,
    result: AnalysisResult,
    yPosition: number,
    pageWidth: number,
    margin: number
  ): number {
    // Score Geral
    doc.addPage();
    yPosition = margin;

    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('Resultados do Diagnóstico', margin, yPosition);
    yPosition += 10;

    // Tabela de métricas principais
    const metricsData = [
      ['Métrica', 'Valor'],
      ['Score Geral', `${result.overallScore}%`],
      ['ROI Estimado', `+${result.estimatedROI}%`],
      ['Potencial de Crescimento', `${result.growthPotential}%`],
      ['Número de Recomendações', `${result.recommendations.length}`]
    ];

    (doc as any).autoTable({
      startY: yPosition,
      head: [metricsData[0]],
      body: metricsData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Recomendações
    if (result.recommendations.length > 0) {
      doc.addPage();
      yPosition = margin;

      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246);
      doc.text('Recomendações', margin, yPosition);
      yPosition += 10;

      result.recommendations.slice(0, 10).forEach((rec, index) => {
        if (yPosition > doc.internal.pageSize.height - 40) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${rec.name}`, margin, yPosition);
        yPosition += 6;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        const descriptionLines = doc.splitTextToSize(rec.description, pageWidth - 2 * margin);
        doc.text(descriptionLines, margin + 5, yPosition);
        yPosition += descriptionLines.length * 5 + 5;

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Prioridade: ${rec.priority}/5 | ROI Estimado: +${rec.estimatedROI}%`, margin + 5, yPosition);
        yPosition += 8;
      });
    }

    return yPosition;
  }

  /**
   * Construir dados do diagnóstico para Excel
   */
  private buildDiagnosticExcelData(result: AnalysisResult): any[][] {
    return [
      ['Métrica', 'Valor'],
      ['Score Geral', `${result.overallScore}%`],
      ['ROI Estimado', `+${result.estimatedROI}%`],
      ['Potencial de Crescimento', `${result.growthPotential}%`],
      ['Número de Recomendações', `${result.recommendations.length}`],
      [''],
      ['Perfil do Negócio'],
      ['Forças', result.businessProfile.strengths.join('; ')],
      ['Fraquezas', result.businessProfile.weaknesses.join('; ')],
      ['Oportunidades', result.businessProfile.opportunities.join('; ')],
      ['Ameaças', result.businessProfile.threats.join('; ')],
      ['Nível de Risco', result.businessProfile.riskLevel],
      ['Posição no Mercado', result.businessProfile.marketPosition]
    ];
  }

  /**
   * Construir dados de recomendações para Excel
   */
  private buildRecommendationsExcelData(result: AnalysisResult): any[][] {
    const data = [
      ['Nome', 'Descrição', 'Prioridade', 'ROI Estimado (%)', 'Tempo de Implementação', 'Categoria', 'Confiança']
    ];

    result.recommendations.forEach(rec => {
      data.push([
        rec.name,
        rec.description,
        rec.priority,
        rec.estimatedROI,
        rec.implementationTime,
        rec.category,
        `${(rec.confidence * 100).toFixed(0)}%`
      ]);
    });

    return data;
  }

  /**
   * Obter título do relatório
   */
  private getReportTitle(type: string): string {
    const titles: Record<string, string> = {
      diagnostic: 'Relatório de Diagnóstico',
      revenue: 'Revenue Optimizer',
      market: 'Market Intelligence',
      benchmark: 'Competitive Benchmark',
      consolidated: 'Relatório Consolidado'
    };
    return titles[type] || 'Relatório ViaJAR';
  }

  /**
   * Formatar tipo de negócio
   */
  private formatBusinessType(type: string): string {
    const types: Record<string, string> = {
      hotel: 'Hotel',
      pousada: 'Pousada',
      restaurant: 'Restaurante',
      agency: 'Agência de Turismo',
      attraction: 'Atração Turística',
      guide: 'Guia de Turismo'
    };
    return types[type] || type;
  }
}

export const privateReportGenerationService = new PrivateReportGenerationService();

