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

// Importação dinâmica do xlsx - será carregado apenas quando necessário
// Isso evita erros de build se o módulo não estiver instalado

export interface ReportData {
  type: 'diagnostic' | 'revenue' | 'market' | 'benchmark' | 'goals' | 'documents' | 'consolidated';
  format: 'pdf' | 'excel' | 'json';
  answers?: QuestionnaireAnswers | null;
  analysisResult?: AnalysisResult | null;
  businessType?: string | null;
  user?: string;
  generatedAt: string;
  dataSources: string[];
  metadata?: {
    goals?: any[];
    documents?: any[];
    evolutionHistory?: any;
    regionalData?: any;
    businessInfo?: any;
    [key: string]: any;
  };
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
    } else if (data.type === 'goals' && data.metadata?.goals) {
      yPosition = this.addGoalsContent(doc, data.metadata.goals, yPosition, pageWidth, margin);
    } else if (data.type === 'documents' && data.metadata?.documents) {
      yPosition = this.addDocumentsContent(doc, data.metadata.documents, yPosition, pageWidth, margin);
    } else if (data.type === 'consolidated') {
      // Relatório consolidado - adicionar todas as seções
      if (data.analysisResult) {
        yPosition = this.addDiagnosticContent(doc, data.analysisResult, yPosition, pageWidth, margin);
      }
      if (data.metadata?.goals && data.metadata.goals.length > 0) {
        yPosition = this.addGoalsContent(doc, data.metadata.goals, yPosition, pageWidth, margin);
      }
      if (data.metadata?.documents && data.metadata.documents.length > 0) {
        yPosition = this.addDocumentsContent(doc, data.metadata.documents, yPosition, pageWidth, margin);
      }
      if (data.metadata?.evolutionHistory) {
        yPosition = this.addEvolutionHistoryContent(doc, data.metadata.evolutionHistory, yPosition, pageWidth, margin);
      }
    }

    return doc.output('blob');
  }

  /**
   * Gerar relatório em Excel
   */
  async generateExcel(data: ReportData): Promise<Blob> {
    // Carregar xlsx dinamicamente apenas quando necessário
    let XLSX: any;
    try {
      // @ts-ignore - xlsx pode não estar instalado
      XLSX = await import('xlsx');
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      // Se o módulo não estiver instalado, retornar um erro mais amigável
      if (err?.message?.includes('Failed to resolve') || err?.code === 'MODULE_NOT_FOUND') {
        throw new Error('Funcionalidade Excel não disponível. Por favor, instale o módulo xlsx executando: npm install xlsx');
      }
      throw error;
    }
    
    if (!XLSX || !XLSX.utils) {
      throw new Error('Biblioteca xlsx não está funcionando corretamente. Por favor, reinstale: npm install xlsx');
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

    // Aba: Metas (se disponível)
    if (data.metadata?.goals && data.metadata.goals.length > 0) {
      const goalsData = this.buildGoalsExcelData(data.metadata.goals);
      const goalsSheet = XLSX.utils.aoa_to_sheet(goalsData);
      XLSX.utils.book_append_sheet(workbook, goalsSheet, 'Metas');
    }

    // Aba: Documentos (se disponível)
    if (data.metadata?.documents && data.metadata.documents.length > 0) {
      const documentsData = this.buildDocumentsExcelData(data.metadata.documents);
      const documentsSheet = XLSX.utils.aoa_to_sheet(documentsData);
      XLSX.utils.book_append_sheet(workbook, documentsSheet, 'Documentos');
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
   * Adicionar conteúdo de metas ao PDF
   */
  private addGoalsContent(
    doc: jsPDF,
    goals: any[],
    yPosition: number,
    pageWidth: number,
    margin: number
  ): number {
    doc.addPage();
    yPosition = margin;

    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('Metas e Acompanhamento', margin, yPosition);
    yPosition += 15;

    // Tabela de metas
    const goalsData = [
      ['Meta', 'Categoria', 'Progresso', 'Status', 'Prazo']
    ];

    goals.forEach(goal => {
      const progress = goal.current_value !== undefined && goal.target_value !== undefined
        ? `${((goal.current_value / goal.target_value) * 100).toFixed(0)}%`
        : 'N/A';
      const status = goal.status || 'Em andamento';
      const deadline = goal.deadline 
        ? format(new Date(goal.deadline), 'dd/MM/yyyy', { locale: ptBR })
        : 'Sem prazo';

      goalsData.push([
        goal.name || 'Meta sem nome',
        goal.category || 'Geral',
        progress,
        status,
        deadline
      ]);
    });

    (doc as any).autoTable({
      startY: yPosition,
      head: [goalsData[0]],
      body: goalsData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
    return yPosition;
  }

  /**
   * Adicionar conteúdo de documentos ao PDF
   */
  private addDocumentsContent(
    doc: jsPDF,
    documents: any[],
    yPosition: number,
    pageWidth: number,
    margin: number
  ): number {
    doc.addPage();
    yPosition = margin;

    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('Documentos Anexados', margin, yPosition);
    yPosition += 15;

    // Lista de documentos
    documents.forEach((docItem, index) => {
      if (yPosition > doc.internal.pageSize.height - 40) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${docItem.title || docItem.fileName}`, margin, yPosition);
      yPosition += 6;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      if (docItem.category) {
        doc.text(`Categoria: ${docItem.category}`, margin + 5, yPosition);
        yPosition += 5;
      }
      if (docItem.uploadedAt) {
        doc.text(`Enviado em: ${format(new Date(docItem.uploadedAt), 'dd/MM/yyyy', { locale: ptBR })}`, margin + 5, yPosition);
        yPosition += 5;
      }
      yPosition += 5;
    });

    return yPosition;
  }

  /**
   * Adicionar conteúdo de histórico de evolução ao PDF
   */
  private addEvolutionHistoryContent(
    doc: jsPDF,
    evolutionHistory: any,
    yPosition: number,
    pageWidth: number,
    margin: number
  ): number {
    doc.addPage();
    yPosition = margin;

    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('Histórico de Evolução', margin, yPosition);
    yPosition += 15;

    if (evolutionHistory.stats) {
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Período analisado: ${evolutionHistory.stats.period || 'Último ano'}`, margin, yPosition);
      yPosition += 10;

      if (evolutionHistory.stats.totalDataPoints) {
        doc.text(`Total de pontos de dados: ${evolutionHistory.stats.totalDataPoints}`, margin, yPosition);
        yPosition += 6;
      }
    }

    yPosition += 10;
    return yPosition;
  }

  /**
   * Construir dados de metas para Excel
   */
  private buildGoalsExcelData(goals: any[]): any[][] {
    const data = [
      ['Nome', 'Categoria', 'Valor Atual', 'Valor Alvo', 'Progresso (%)', 'Status', 'Prazo', 'Criado em']
    ];

    goals.forEach(goal => {
      const progress = goal.current_value !== undefined && goal.target_value !== undefined
        ? ((goal.current_value / goal.target_value) * 100).toFixed(2)
        : 'N/A';

      data.push([
        goal.name || 'Meta sem nome',
        goal.category || 'Geral',
        goal.current_value ?? 'N/A',
        goal.target_value ?? 'N/A',
        progress,
        goal.status || 'Em andamento',
        goal.deadline ? format(new Date(goal.deadline), 'dd/MM/yyyy', { locale: ptBR }) : 'Sem prazo',
        goal.created_at ? format(new Date(goal.created_at), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'
      ]);
    });

    return data;
  }

  /**
   * Construir dados de documentos para Excel
   */
  private buildDocumentsExcelData(documents: any[]): any[][] {
    const data = [
      ['Título', 'Nome do Arquivo', 'Categoria', 'Tamanho', 'Enviado em', 'Status de Análise']
    ];

    documents.forEach(doc => {
      data.push([
        doc.title || 'Sem título',
        doc.fileName || 'N/A',
        doc.category || 'N/A',
        doc.file_size ? `${(doc.file_size / 1024).toFixed(2)} KB` : 'N/A',
        doc.uploadedAt ? format(new Date(doc.uploadedAt), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A',
        doc.analysis_status || 'Pendente'
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
      goals: 'Relatório de Metas',
      documents: 'Relatório de Documentos',
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

