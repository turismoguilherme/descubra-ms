// @ts-nocheck
/**
 * PDF Template Service - ViaJARTur
 * Serviço para geração de relatórios PDF seguindo o layout padrão ViaJARTur
 * 
 * Layout baseado no template: src/assets/templates/viajartur-relatorio-template.docx
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReportAnalysis } from './reportAnalysisService';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ReportConfig {
  reportType: string;
  title: string;
  period: { start: Date; end: Date };
  generatedBy: string;
  customFields?: Array<{ label: string; value: string | number }>;
  tableData?: {
    headers: string[];
    rows: (string | number)[][];
  };
  sections?: Array<{ 
    title: string; 
    content: string | string[] | (string | number)[][] 
  }>;
  // Nova propriedade para análises automáticas
  analysis?: ReportAnalysis;
}

// ============================================================================
// CORES PADRÃO VIAJARTUR
// ============================================================================

const COLORS = {
  primary: [15, 23, 42] as [number, number, number],      // #0F172A - Azul escuro
  accent: [23, 177, 200] as [number, number, number],     // #17B1C8 - Ciano
  text: [51, 51, 51] as [number, number, number],         // #333333 - Texto principal
  textLight: [100, 100, 100] as [number, number, number], // #646464 - Texto secundário
  textMuted: [136, 136, 136] as [number, number, number], // #888888 - Texto mudo
  white: [255, 255, 255] as [number, number, number],
  line: [200, 200, 200] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],     // Verde
  warning: [245, 158, 11] as [number, number, number],    // Amarelo
  error: [239, 68, 68] as [number, number, number],       // Vermelho
  altRow: [248, 250, 252] as [number, number, number],    // Linha alternada
};

// ============================================================================
// CLASSE PRINCIPAL
// ============================================================================

export class PDFTemplateService {
  private doc!: jsPDF;
  private pageWidth!: number;
  private pageHeight!: number;
  private margin: number = 15;
  private currentY!: number;

  // --------------------------------------------------------------------------
  // INICIALIZAÇÃO
  // --------------------------------------------------------------------------

  private initDocument() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.currentY = this.margin;
  }

  // --------------------------------------------------------------------------
  // VERIFICAÇÃO DE QUEBRA DE PÁGINA
  // --------------------------------------------------------------------------

  private checkPageBreak(requiredSpace: number): boolean {
    if (this.currentY + requiredSpace > this.pageHeight - 25) {
      this.doc.addPage();
      this.currentY = this.margin + 10;
      this.addPageHeader();
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // HEADER DA PÁGINA (para páginas subsequentes)
  // --------------------------------------------------------------------------

  private addPageHeader() {
    // Logo pequeno no topo das páginas subsequentes
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.setTextColor(...COLORS.primary);
    this.doc.text('Viaj', this.margin, this.currentY);
    
    const viajWidth = this.doc.getTextWidth('Viaj');
    this.doc.setTextColor(...COLORS.accent);
    this.doc.text('AR', this.margin + viajWidth, this.currentY);
    
    const arWidth = this.doc.getTextWidth('AR');
    this.doc.setTextColor(...COLORS.primary);
    this.doc.text('Tur', this.margin + viajWidth + arWidth, this.currentY);

    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.textLight);
    this.doc.text('Ecossistema Inteligente de Turismo', this.margin + 40, this.currentY);

    this.currentY += 10;
    this.doc.setDrawColor(...COLORS.line);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;
  }

  // --------------------------------------------------------------------------
  // CAPA DO RELATÓRIO (PÁGINA 1)
  // --------------------------------------------------------------------------

  private addCoverPage(config: ReportConfig) {
    // Logo ViaJARTur grande e centralizado
    const centerX = this.pageWidth / 2;
    
    // Espaço inicial
    this.currentY = 50;

    // Logo texto
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(32);
    
    const logoText = 'ViajARTur';
    const viajWidth = this.doc.getTextWidth('Viaj');
    const arWidth = this.doc.getTextWidth('AR');
    const turWidth = this.doc.getTextWidth('Tur');
    const totalWidth = viajWidth + arWidth + turWidth;
    const startX = centerX - (totalWidth / 2);

    this.doc.setTextColor(...COLORS.primary);
    this.doc.text('Viaj', startX, this.currentY);
    
    this.doc.setTextColor(...COLORS.accent);
    this.doc.text('AR', startX + viajWidth, this.currentY);
    
    this.doc.setTextColor(...COLORS.primary);
    this.doc.text('Tur', startX + viajWidth + arWidth, this.currentY);

    // Subtítulo
    this.currentY += 12;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.textLight);
    this.doc.text('Ecossistema Inteligente de Turismo', centerX, this.currentY, { align: 'center' });

    // Linha separadora
    this.currentY += 20;
    this.doc.setDrawColor(...COLORS.line);
    this.doc.line(this.margin + 30, this.currentY, this.pageWidth - this.margin - 30, this.currentY);

    // RELATÓRIO
    this.currentY += 20;
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.primary);
    this.doc.text('RELATÓRIO', centerX, this.currentY, { align: 'center' });

    // Tipo de relatório
    this.currentY += 12;
    this.doc.setFontSize(16);
    this.doc.text(config.title, centerX, this.currentY, { align: 'center' });

    // Linha separadora
    this.currentY += 20;
    this.doc.line(this.margin + 30, this.currentY, this.pageWidth - this.margin - 30, this.currentY);

    // Metadados do relatório
    this.currentY += 25;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.setTextColor(...COLORS.text);

    // Ícones simulados com emojis/símbolos
    const metaStartX = this.margin + 20;
    
    this.doc.text(`📅 Data de Geração: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, metaStartX, this.currentY);
    this.currentY += 8;
    this.doc.text(`📅 Período: ${format(config.period.start, 'dd/MM/yyyy', { locale: ptBR })} a ${format(config.period.end, 'dd/MM/yyyy', { locale: ptBR })}`, metaStartX, this.currentY);
    this.currentY += 8;
    this.doc.text(`👤 Gerado por: ${config.generatedBy}`, metaStartX, this.currentY);

    // Seção INFORMAÇÕES
    if (config.customFields && config.customFields.length > 0) {
      this.currentY += 20;
      this.doc.setDrawColor(...COLORS.line);
      this.doc.line(this.margin + 20, this.currentY, this.pageWidth - this.margin - 20, this.currentY);
      
      this.currentY += 10;
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(12);
      this.doc.setTextColor(...COLORS.primary);
      this.doc.text('INFORMAÇÕES', centerX, this.currentY, { align: 'center' });
      
      this.currentY += 10;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(10);
      this.doc.setTextColor(...COLORS.text);
      
      config.customFields.forEach(field => {
        this.doc.text(`${field.label}: ${field.value}`, metaStartX, this.currentY);
        this.currentY += 6;
      });
    }

    // Nova página para o conteúdo
    this.doc.addPage();
    this.currentY = this.margin;
    this.addPageHeader();
  }

  // --------------------------------------------------------------------------
  // SEÇÃO: RESUMO EXECUTIVO
  // --------------------------------------------------------------------------

  private addExecutiveSummary(analysis: ReportAnalysis) {
    if (!analysis.executiveSummary || analysis.executiveSummary.length === 0) return;

    this.checkPageBreak(40);
    
    // Título da seção
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.setTextColor(...COLORS.primary);
    this.doc.text('RESUMO EXECUTIVO', this.margin, this.currentY);
    this.currentY += 3;
    
    // Linha abaixo do título
    this.doc.setDrawColor(...COLORS.accent);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.margin + 50, this.currentY);
    this.doc.setLineWidth(0.2);
    this.currentY += 8;

    // Parágrafos do resumo
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(...COLORS.text);

    analysis.executiveSummary.forEach(paragraph => {
      const lines = this.doc.splitTextToSize(paragraph, this.pageWidth - 2 * this.margin);
      lines.forEach((line: string) => {
        this.checkPageBreak(6);
        this.doc.text(line, this.margin, this.currentY);
        this.currentY += 6;
      });
      this.currentY += 3;
    });

    this.currentY += 5;
  }

  // --------------------------------------------------------------------------
  // SEÇÃO: INSIGHTS
  // --------------------------------------------------------------------------

  private addInsights(analysis: ReportAnalysis) {
    if (!analysis.insights || analysis.insights.length === 0) return;

    this.checkPageBreak(30);
    
    // Título da seção
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.setTextColor(...COLORS.primary);
    this.doc.text('INSIGHTS E OBSERVAÇÕES', this.margin, this.currentY);
    this.currentY += 3;
    
    this.doc.setDrawColor(...COLORS.accent);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.margin + 60, this.currentY);
    this.doc.setLineWidth(0.2);
    this.currentY += 8;

    // Lista de insights
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(...COLORS.text);

    analysis.insights.forEach(insight => {
      this.checkPageBreak(12);
      const lines = this.doc.splitTextToSize(`• ${insight}`, this.pageWidth - 2 * this.margin - 5);
      lines.forEach((line: string, index: number) => {
        this.doc.text(line, index === 0 ? this.margin : this.margin + 5, this.currentY);
        this.currentY += 6;
      });
    });

    this.currentY += 5;
  }

  // --------------------------------------------------------------------------
  // SEÇÃO: RECOMENDAÇÕES
  // --------------------------------------------------------------------------

  private addRecommendations(analysis: ReportAnalysis) {
    if (!analysis.recommendations || analysis.recommendations.length === 0) return;

    this.checkPageBreak(30);
    
    // Título da seção
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.setTextColor(...COLORS.primary);
    this.doc.text('RECOMENDAÇÕES', this.margin, this.currentY);
    this.currentY += 3;
    
    this.doc.setDrawColor(...COLORS.accent);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.margin + 50, this.currentY);
    this.doc.setLineWidth(0.2);
    this.currentY += 8;

    // Lista de recomendações
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(...COLORS.text);

    analysis.recommendations.forEach((rec, index) => {
      this.checkPageBreak(12);
      const lines = this.doc.splitTextToSize(`${index + 1}. ${rec}`, this.pageWidth - 2 * this.margin - 5);
      lines.forEach((line: string) => {
        this.doc.text(line, this.margin, this.currentY);
        this.currentY += 6;
      });
      this.currentY += 2;
    });

    this.currentY += 5;
  }

  // --------------------------------------------------------------------------
  // SEÇÃO: NOTA SOBRE QUALIDADE DOS DADOS
  // --------------------------------------------------------------------------

  private addDataQualityNote(analysis: ReportAnalysis) {
    if (!analysis.dataQualityNote) return;

    this.checkPageBreak(20);
    
    // Box de aviso
    const boxY = this.currentY;
    const boxHeight = 15;
    
    this.doc.setFillColor(255, 251, 235); // Amarelo claro
    this.doc.setDrawColor(...COLORS.warning);
    this.doc.roundedRect(this.margin, boxY, this.pageWidth - 2 * this.margin, boxHeight, 2, 2, 'FD');
    
    this.doc.setFont('helvetica', 'italic');
    this.doc.setFontSize(9);
    this.doc.setTextColor(...COLORS.textLight);
    
    const noteLines = this.doc.splitTextToSize(analysis.dataQualityNote, this.pageWidth - 2 * this.margin - 10);
    let noteY = boxY + 6;
    noteLines.forEach((line: string) => {
      this.doc.text(line, this.margin + 5, noteY);
      noteY += 5;
    });

    this.currentY = boxY + boxHeight + 10;
  }

  // --------------------------------------------------------------------------
  // TABELA DE DADOS
  // --------------------------------------------------------------------------

  private addDataTable(config: ReportConfig) {
    if (!config.tableData || config.tableData.rows.length === 0) return;

    this.checkPageBreak(50);
    
    // Título da seção
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.setTextColor(...COLORS.primary);
    this.doc.text('DADOS DETALHADOS', this.margin, this.currentY);
    this.currentY += 3;
    
    this.doc.setDrawColor(...COLORS.accent);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.margin + 50, this.currentY);
    this.doc.setLineWidth(0.2);
    this.currentY += 8;

    // Tabela
    (this.doc as any).autoTable({
      startY: this.currentY,
      head: [config.tableData.headers],
      body: config.tableData.rows,
      theme: 'grid',
      headStyles: { 
        fillColor: COLORS.primary, 
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: COLORS.altRow
      },
      margin: { left: this.margin, right: this.margin },
    });
    
    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  // --------------------------------------------------------------------------
  // SEÇÕES ADICIONAIS
  // --------------------------------------------------------------------------

  private addAdditionalSections(config: ReportConfig) {
    if (!config.sections || config.sections.length === 0) return;

    config.sections.forEach(section => {
      this.checkPageBreak(25);
      
      // Título da seção
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(12);
      this.doc.setTextColor(...COLORS.primary);
      this.doc.text(section.title.toUpperCase(), this.margin, this.currentY);
      this.currentY += 8;
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(10);
      this.doc.setTextColor(...COLORS.text);

      if (Array.isArray(section.content)) {
        if (typeof section.content[0] === 'string') {
          // Array de strings (lista)
          (section.content as string[]).forEach(line => {
            this.checkPageBreak(6);
            const wrappedLines = this.doc.splitTextToSize(`• ${line}`, this.pageWidth - 2 * this.margin);
            wrappedLines.forEach((wl: string) => {
              this.doc.text(wl, this.margin, this.currentY);
              this.currentY += 6;
            });
          });
        } else if (Array.isArray(section.content[0])) {
          // Tabela (array de arrays)
          this.checkPageBreak(50);
          const tableContent = section.content as (string | number)[][];
          (this.doc as any).autoTable({
            startY: this.currentY,
            head: [tableContent[0]],
            body: tableContent.slice(1),
            theme: 'grid',
            headStyles: { 
              fillColor: COLORS.primary, 
              textColor: COLORS.white,
              fontStyle: 'bold'
            },
            styles: { fontSize: 9, cellPadding: 3 },
            margin: { left: this.margin, right: this.margin },
          });
          this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
        }
      } else {
        // Texto simples (parágrafo)
        const lines = this.doc.splitTextToSize(section.content as string, this.pageWidth - 2 * this.margin);
        lines.forEach((line: string) => {
          this.checkPageBreak(6);
          this.doc.text(line, this.margin, this.currentY);
          this.currentY += 6;
        });
      }
      
      this.currentY += 5;
    });
  }

  // --------------------------------------------------------------------------
  // RODAPÉ
  // --------------------------------------------------------------------------

  private addFooter(pageNumber: number, totalPages: number) {
    this.doc.setFontSize(8);
    this.doc.setTextColor(...COLORS.textMuted);
    const footerText = `ViaJARTur © ${new Date().getFullYear()} - Todos os direitos reservados | Documento gerado automaticamente - Página ${pageNumber} de ${totalPages}`;
    this.doc.text(footerText, this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
  }

  // --------------------------------------------------------------------------
  // GERAÇÃO DO RELATÓRIO
  // --------------------------------------------------------------------------

  async generateReport(config: ReportConfig): Promise<Blob> {
    this.initDocument();

    // Página 1: Capa
    this.addCoverPage(config);

    // Se houver análise, adicionar seções analíticas
    if (config.analysis) {
      this.addExecutiveSummary(config.analysis);
      this.addInsights(config.analysis);
      
      // Nota sobre qualidade dos dados (se houver)
      this.addDataQualityNote(config.analysis);
    }

    // Tabela de dados detalhados
    this.addDataTable(config);

    // Seções adicionais (se houver)
    this.addAdditionalSections(config);

    // Recomendações (por último, antes do rodapé)
    if (config.analysis) {
      this.addRecommendations(config.analysis);
    }

    // Adicionar rodapés em todas as páginas
    const totalPages = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.addFooter(i, totalPages);
    }

    return this.doc.output('blob');
  }

  // --------------------------------------------------------------------------
  // MÉTODO LEGADO (para compatibilidade)
  // --------------------------------------------------------------------------

  async generateReportLegacy(config: ReportConfig): Promise<Blob> {
    this.initDocument();

    // Header simples (método antigo)
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(24);
    this.doc.setTextColor(...COLORS.primary);
    this.doc.text('Viaj', this.margin, this.currentY);
    
    const viajWidth = this.doc.getTextWidth('Viaj');
    this.doc.setTextColor(...COLORS.accent);
    this.doc.text('AR', this.margin + viajWidth, this.currentY);
    
    const arWidth = this.doc.getTextWidth('AR');
    this.doc.setTextColor(...COLORS.primary);
    this.doc.text('Tur', this.margin + viajWidth + arWidth, this.currentY);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.textLight);
    this.doc.text('Ecossistema Inteligente de Turismo', this.margin, this.currentY + 7);
    this.currentY += 20;

    this.doc.setDrawColor(...COLORS.line);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;

    // Título
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.primary);
    this.doc.text('RELATÓRIO', this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 8;
    this.doc.setFontSize(14);
    this.doc.text(config.title, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 15;

    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;

    // Metadados
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(...COLORS.text);
    this.doc.text(`Data de Geração: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, this.margin, this.currentY);
    this.currentY += 5;
    this.doc.text(`Período: ${format(config.period.start, 'dd/MM/yyyy', { locale: ptBR })} a ${format(config.period.end, 'dd/MM/yyyy', { locale: ptBR })}`, this.margin, this.currentY);
    this.currentY += 5;
    this.doc.text(`Gerado por: ${config.generatedBy}`, this.margin, this.currentY);
    this.currentY += 10;

    // Campos customizados
    if (config.customFields && config.customFields.length > 0) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('INFORMAÇÕES', this.margin, this.currentY);
      this.currentY += 5;
      this.doc.setFont('helvetica', 'normal');
      config.customFields.forEach(field => {
        this.doc.text(`${field.label}: ${field.value}`, this.margin, this.currentY);
        this.currentY += 5;
      });
      this.currentY += 5;
    }

    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;

    // Tabela
    this.addDataTable(config);

    // Seções
    this.addAdditionalSections(config);

    // Rodapés
    const totalPages = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.addFooter(i, totalPages);
    }

    return this.doc.output('blob');
  }
}

export const pdfTemplateService = new PDFTemplateService();
