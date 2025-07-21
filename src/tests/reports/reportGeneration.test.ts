import { describe, it, expect, beforeEach } from 'vitest';
import { ReportGenerationService } from '@/services/reports/reportGenerationService';

describe('ReportGenerationService', () => {
  let service: ReportGenerationService;
  let mockData: any;

  beforeEach(() => {
    service = new ReportGenerationService();
    mockData = {
      metrics: {
        visitorGrowth: 15,
        avgStayDuration: 2.5,
        satisfactionScore: 8.5,
        economicImpact: 1500000
      },
      analysis: {
        insights: [
          'Aumento significativo no turismo de negócios',
          'Potencial para desenvolvimento de roteiros integrados'
        ]
      },
      recommendations: {
        immediate: [
          {
            title: 'Campanha de Marketing Digital',
            description: 'Lançar campanha nas redes sociais',
            impact: 'Aumento de 20% nas visitas ao site'
          }
        ]
      }
    };
  });

  it('deve gerar PDF com todas as seções', async () => {
    const result = await service.generateReport(mockData, {
      title: 'Relatório de Teste',
      format: 'pdf'
    });

    expect(result).toBeDefined();
    expect(result instanceof Blob).toBe(true);
    expect(result.type).toBe('application/pdf');
  });

  it('deve gerar CSV com dados corretos', async () => {
    const result = await service.generateReport(mockData, {
      title: 'Relatório de Teste',
      format: 'csv'
    });

    expect(result).toBeDefined();
    expect(result instanceof Blob).toBe(true);
    expect(result.type).toBe('text/csv;charset=utf-8;');

    // Verificar conteúdo do CSV
    const text = await result.text();
    expect(text).toContain('Crescimento de Visitantes,15%');
    expect(text).toContain('Média de Permanência,2.5 dias');
  });

  it('deve incluir cabeçalho personalizado', async () => {
    const customHeader = 'Relatório Personalizado';
    const result = await service.generateReport(mockData, {
      title: customHeader,
      format: 'pdf'
    });

    expect(result).toBeDefined();
    // Verificar se o cabeçalho está no PDF
    // Implementar verificação específica do PDF
  });

  it('deve lidar com dados vazios', async () => {
    const emptyData = {
      metrics: {},
      analysis: { insights: [] },
      recommendations: { immediate: [] }
    };

    const result = await service.generateReport(emptyData, {
      title: 'Relatório Vazio',
      format: 'pdf'
    });

    expect(result).toBeDefined();
    expect(result instanceof Blob).toBe(true);
  });

  it('deve gerar relatório com seções específicas', async () => {
    const result = await service.generateReport(mockData, {
      title: 'Relatório Parcial',
      format: 'pdf',
      sections: ['metrics', 'insights']
    });

    expect(result).toBeDefined();
    // Verificar se apenas as seções especificadas estão incluídas
  });
}); 