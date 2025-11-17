/**
 * Complete Business Report Service
 * Gera relatório completo com todos os dados do negócio
 */

import { supabase } from '@/integrations/supabase/client';
import { diagnosticService } from '@/services/viajar/diagnosticService';
import { documentService } from '@/services/viajar/documentService';
import { evolutionHistoryService } from './evolutionHistoryService';
import { goalsTrackingService } from './goalsTrackingService';
import { RegionalDataService } from './regionalDataService';
import { privateReportGenerationService, ReportData } from './reportGenerationService';

export interface CompleteBusinessData {
  // Diagnóstico
  diagnostic: {
    answers: any;
    analysisResult: any;
    overallScore: number;
    estimatedROI: number;
    recommendations: any[];
  } | null;

  // Histórico de Evolução
  evolutionHistory: {
    dataPoints: any[];
    trends: any;
    stats: any;
  } | null;

  // Metas
  goals: any[];

  // Documentos
  documents: any[];

  // Dados Regionais
  regionalData: any | null;

  // Informações do Negócio
  businessInfo: {
    businessType: string | null;
    businessName: string | null;
    userEmail: string;
  };
}

export class CompleteBusinessReportService {
  /**
   * Buscar todos os dados do negócio
   */
  async fetchAllBusinessData(userId: string, userEmail: string): Promise<CompleteBusinessData> {
    try {
      // Buscar diagnóstico
      const diagnostic = await diagnosticService.getLatestDiagnosticResult(userId);

      // Buscar histórico de evolução
      const evolutionHistory = await evolutionHistoryService.getEvolutionHistory(userId, '1y');
      const evolutionStats = await evolutionHistoryService.getEvolutionStats(userId);

      // Buscar metas
      const goals = await goalsTrackingService.getUserGoals(userId);

      // Buscar documentos
      const documents = await documentService.getDocuments(userId, { is_active: true });

      // Buscar dados regionais
      const { data: userData } = await supabase
        .from('users')
        .select('business_type, business_name, state')
        .eq('id', userId)
        .single();

      const businessType = userData?.business_type || null;
      const userState = userData?.state || 'MS';

      let regionalData = null;
      try {
        const regionalDataService = new RegionalDataService();
        regionalData = await regionalDataService.getRegionalData(userState, businessType || undefined);
      } catch (error) {
        console.error('Erro ao buscar dados regionais:', error);
      }

      return {
        diagnostic: diagnostic ? {
          answers: diagnostic.answers,
          analysisResult: diagnostic.analysis_result,
          overallScore: diagnostic.analysis_result?.overallScore || 0,
          estimatedROI: diagnostic.analysis_result?.estimatedROI || 0,
          recommendations: diagnostic.analysis_result?.recommendations || []
        } : null,
        evolutionHistory: {
          dataPoints: evolutionHistory.dataPoints,
          trends: evolutionHistory.trends,
          stats: evolutionStats
        },
        goals: goals,
        documents: documents,
        regionalData: regionalData,
        businessInfo: {
          businessType: businessType,
          businessName: userData?.business_name || null,
          userEmail: userEmail
        }
      };
    } catch (error) {
      console.error('Erro ao buscar dados completos do negócio:', error);
      throw error;
    }
  }

  /**
   * Gerar relatório completo
   */
  async generateCompleteReport(
    userId: string,
    userEmail: string,
    format: 'pdf' | 'excel' | 'json'
  ): Promise<Blob> {
    const allData = await this.fetchAllBusinessData(userId, userEmail);

    // Preparar dados do relatório consolidado
    const reportData: ReportData = {
      type: 'consolidated',
      format: format,
      answers: allData.diagnostic?.answers || null,
      analysisResult: allData.diagnostic?.analysisResult || null,
      businessType: allData.businessInfo.businessType,
      user: userEmail,
      generatedAt: new Date().toISOString(),
      dataSources: this.getDataSources(allData.businessInfo.businessType, allData.regionalData),
      metadata: {
        platform: 'ViaJAR',
        version: '1.0',
        reportId: `complete-${Date.now()}`,
        // Dados adicionais para o relatório completo
        evolutionHistory: allData.evolutionHistory,
        goals: allData.goals,
        documents: allData.documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          fileName: doc.file_name,
          category: doc.category,
          uploadedAt: doc.created_at
        })),
        regionalData: allData.regionalData,
        businessInfo: allData.businessInfo
      }
    };

    // Gerar relatório baseado no formato
    if (format === 'pdf') {
      return await privateReportGenerationService.generatePDF(reportData);
    } else if (format === 'excel') {
      return await privateReportGenerationService.generateExcel(reportData);
    } else {
      // JSON
      const jsonBlob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      return jsonBlob;
    }
  }

  /**
   * Obter fontes de dados
   */
  private getDataSources(businessType: string | null, regionalData: any | null): string[] {
    const sources: string[] = [];

    sources.push('Dados do Diagnóstico (Questionário)');
    sources.push('Dados Anexados (Upload de Documentos)');
    sources.push('Histórico de Evolução do Negócio');
    sources.push('Metas e Acompanhamento');

    if (regionalData) {
      if (regionalData.source === 'ALUMIA') {
        sources.push('ALUMIA - Plataforma do Governo de Mato Grosso do Sul');
      } else {
        sources.push('Google Scholar - Pesquisa Acadêmica');
        sources.push('IBGE - Instituto Brasileiro de Geografia e Estatística');
      }
    }

    return sources;
  }

  /**
   * Download do relatório completo
   */
  async downloadCompleteReport(
    userId: string,
    userEmail: string,
    format: 'pdf' | 'excel' | 'json'
  ): Promise<void> {
    try {
      const blob = await this.generateCompleteReport(userId, userEmail, format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const extension = format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'json';
      const date = new Date().toISOString().split('T')[0];
      link.download = `Relatorio_Completo_Negocio_${date}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao fazer download do relatório completo:', error);
      throw error;
    }
  }
}

export const completeBusinessReportService = new CompleteBusinessReportService();

