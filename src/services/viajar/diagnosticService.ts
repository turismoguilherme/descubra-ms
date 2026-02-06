/**
 * Diagnostic Service
 * Serviço para persistência de resultados de diagnóstico no Supabase
 */

import { supabase } from '@/integrations/supabase/client';
import { QuestionnaireAnswers } from '@/types/diagnostic';
import { AnalysisResult } from '@/services/diagnostic/analysisService';

export interface DiagnosticResult {
  id: string;
  user_id: string;
  answers: QuestionnaireAnswers;
  analysis_result: AnalysisResult | null;
  overall_score: number | null;
  estimated_roi: number | null;
  recommendations_count: number;
  status: 'in_progress' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export class DiagnosticService {
  /**
   * Salvar resultado de diagnóstico
   */
  async saveDiagnosticResult(
    userId: string,
    answers: QuestionnaireAnswers,
    analysisResult: AnalysisResult
  ): Promise<DiagnosticResult> {
    try {
      const { data, error } = await supabase
        .from('viajar_diagnostic_results')
        .insert({
          user_id: userId,
          answers: answers as any,
          analysis_result: analysisResult as any,
          overall_score: analysisResult.overallScore,
          estimated_roi: analysisResult.estimatedROI,
          recommendations_count: analysisResult.recommendations.length,
          status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;
      return data as DiagnosticResult;
    } catch (error: unknown) {
      console.error('Erro ao salvar resultado de diagnóstico:', error);
      throw error;
    }
  }

  /**
   * Buscar histórico de diagnósticos do usuário
   */
  async getDiagnosticResults(userId: string): Promise<DiagnosticResult[]> {
    try {
      const { data, error } = await supabase
        .from('viajar_diagnostic_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as DiagnosticResult[];
    } catch (error: unknown) {
      console.error('Erro ao buscar resultados de diagnóstico:', error);
      return [];
    }
  }

  /**
   * Buscar último diagnóstico do usuário
   */
  async getLatestDiagnosticResult(userId: string): Promise<DiagnosticResult | null> {
    try {
      const { data, error } = await supabase
        .from('viajar_diagnostic_results')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // Códigos esperados que não são erros críticos
        if (error.code === 'PGRST116' || error.code === '42P01') {
          // PGRST116 = nenhum resultado encontrado
          // 42P01 = tabela não existe (esperado em desenvolvimento)
          return null;
        }
        // Outros erros: logar mas não quebrar a aplicação
        console.warn('⚠️ DiagnosticService: Erro ao buscar diagnóstico:', error.message || error);
        return null;
      }
      return data as DiagnosticResult;
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      // Erros de rede ou outros: não são críticos
      if (err?.code === '42P01' || err?.message?.includes('does not exist')) {
        // Tabela não existe - esperado em desenvolvimento
        return null;
      }
      const errMessage = err?.message || (error instanceof Error ? error.message : String(error));
      console.warn('⚠️ DiagnosticService: Erro ao buscar último diagnóstico:', errMessage);
      return null;
    }
  }

  /**
   * Atualizar resultado de diagnóstico
   */
  async updateDiagnosticResult(
    id: string,
    updates: Partial<DiagnosticResult>
  ): Promise<DiagnosticResult> {
    try {
      const { data, error } = await supabase
        .from('viajar_diagnostic_results')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as DiagnosticResult;
    } catch (error: unknown) {
      console.error('Erro ao atualizar resultado de diagnóstico:', error);
      throw error;
    }
  }

  /**
   * Arquivar diagnóstico
   */
  async archiveDiagnosticResult(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('viajar_diagnostic_results')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) throw error;
    } catch (error: unknown) {
      console.error('Erro ao arquivar diagnóstico:', error);
      throw error;
    }
  }
}

export const diagnosticService = new DiagnosticService();

