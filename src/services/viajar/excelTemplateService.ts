/**
 * Excel Template Service
 * Serviço para gerar e baixar templates Excel genéricos para upload de métricas
 */

import * as XLSX from 'xlsx';

export interface ExcelTemplateOptions {
  businessCategory?: 'hotel' | 'pousada' | 'restaurante' | 'agencia' | 'atracao' | 'outro';
  includeSampleData?: boolean;
}

export class ExcelTemplateService {
  /**
   * Gerar template Excel genérico
   */
  generateTemplate(options: ExcelTemplateOptions = {}): void {
    const { businessCategory, includeSampleData = false } = options;

    // Definir colunas baseadas na categoria
    const columns = this.getColumnsForCategory(businessCategory);

    // Criar dados do template
    const data: any[] = [];

    // Cabeçalho
    const headers = ['Data', ...columns.map(c => c.label)];

    // Dados de exemplo (se solicitado)
    if (includeSampleData) {
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const row: any = {
          Data: this.formatDate(date),
        };

        columns.forEach(col => {
          if (col.type === 'percentage') {
            row[col.label] = Math.floor(Math.random() * 30) + 50; // 50-80%
          } else if (col.type === 'currency') {
            row[col.label] = Math.floor(Math.random() * 500) + 100; // R$ 100-600
          } else if (col.type === 'number') {
            row[col.label] = Math.floor(Math.random() * 100) + 10; // 10-110
          }
        });

        data.push(row);
      }
    } else {
      // Apenas linha de exemplo vazia
      const row: any = {
        Data: this.formatDate(new Date()),
      };
      columns.forEach(col => {
        row[col.label] = '';
      });
      data.push(row);
    }

    // Criar workbook
    const wb = XLSX.utils.book_new();

    // Criar worksheet
    const ws = XLSX.utils.json_to_sheet([headers, ...data.map(r => Object.values(r))], {
      header: headers,
    });

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 12 }, // Data
      ...columns.map(() => ({ wch: 20 })), // Outras colunas
    ];
    ws['!cols'] = colWidths;

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Métricas');

    // Gerar nome do arquivo
    const fileName = this.getFileName(businessCategory);

    // Baixar arquivo
    XLSX.writeFile(wb, fileName);
  }

  /**
   * Obter colunas baseadas na categoria
   */
  private getColumnsForCategory(category?: string): Array<{ label: string; type: 'number' | 'currency' | 'percentage' }> {
    const columns: Record<string, Array<{ label: string; type: 'number' | 'currency' | 'percentage' }>> = {
      hotel: [
        { label: 'Taxa de Ocupação (%)', type: 'percentage' },
        { label: 'ADR (R$)', type: 'currency' },
        { label: 'RevPAR (R$)', type: 'currency' },
        { label: 'Permanência Média (dias)', type: 'number' },
      ],
      pousada: [
        { label: 'Taxa de Ocupação (%)', type: 'percentage' },
        { label: 'Preço Médio (R$)', type: 'currency' },
        { label: 'Permanência Média (dias)', type: 'number' },
      ],
      restaurante: [
        { label: 'Ticket Médio (R$)', type: 'currency' },
        { label: 'Giro de Mesas (vezes/dia)', type: 'number' },
        { label: 'Taxa de Ocupação (%)', type: 'percentage' },
      ],
      agencia: [
        { label: 'Reservas (unidades)', type: 'number' },
        { label: 'Valor Médio do Pacote (R$)', type: 'currency' },
        { label: 'Passageiros (pessoas)', type: 'number' },
      ],
      atracao: [
        { label: 'Visitantes (pessoas)', type: 'number' },
        { label: 'Ticket Médio (R$)', type: 'currency' },
        { label: 'Taxa de Ocupação (%)', type: 'percentage' },
      ],
    };

    return columns[category || 'outro'] || [
      { label: 'Receita (R$)', type: 'currency' },
      { label: 'Clientes (pessoas)', type: 'number' },
      { label: 'Transação Média (R$)', type: 'currency' },
    ];
  }

  /**
   * Formatar data para o template
   */
  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Obter nome do arquivo baseado na categoria
   */
  private getFileName(category?: string): string {
    const categoryNames: Record<string, string> = {
      hotel: 'Hotel',
      pousada: 'Pousada',
      restaurante: 'Restaurante',
      agencia: 'Agencia',
      atracao: 'Atracao',
    };

    const categoryName = categoryNames[category || 'outro'] || 'Negocio';
    const date = new Date().toISOString().split('T')[0];
    return `Template_Metricas_${categoryName}_${date}.xlsx`;
  }
}

// Exportar instância singleton
export const excelTemplateService = new ExcelTemplateService();

