/**
 * Report Service
 * Serviço para gerenciar relatórios gerados
 */

import { supabase } from '@/integrations/supabase/client';

export interface Report {
  id: string;
  user_id: string;
  title: string;
  report_type: 'executive' | 'market' | 'financial' | 'custom';
  file_path: string | null;
  file_format: 'pdf' | 'excel' | 'csv';
  parameters: {
    [key: string]: any;
  } | null;
  scheduled: boolean;
  schedule_frequency: 'daily' | 'weekly' | 'monthly' | null;
  next_generation_date: string | null;
  status: 'pending' | 'generating' | 'generated' | 'failed';
  generated_at: string | null;
  created_at: string;
  updated_at: string;
}

export class ReportService {
  private readonly BUCKET_NAME = 'viajar-reports';

  /**
   * Gerar relatório (mockado por enquanto)
   */
  async generateReport(
    userId: string,
    reportType: Report['report_type'],
    parameters?: {
      [key: string]: any;
    }
  ): Promise<Report> {
    try {
      // Criar registro do relatório
      const { data: report, error: insertError } = await supabase
        .from('viajar_reports')
        .insert({
          user_id: userId,
          title: `Relatório ${reportType} - ${new Date().toLocaleDateString('pt-BR')}`,
          report_type: reportType,
          parameters: parameters || {},
          status: 'generating',
          file_format: 'pdf'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Simular geração de PDF (mockado)
      // TODO: Implementar geração real de PDF quando necessário
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock: Criar arquivo simulado
      const fileName = `${userId}/${report.id}_${Date.now()}.pdf`;
      const filePath = `${this.BUCKET_NAME}/${fileName}`;

      // Atualizar relatório como gerado
      const { data: updatedReport, error: updateError } = await supabase
        .from('viajar_reports')
        .update({
          status: 'generated',
          file_path: filePath,
          generated_at: new Date().toISOString()
        })
        .eq('id', report.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedReport as Report;
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw error;
    }
  }

  /**
   * Salvar relatório gerado
   */
  async saveReport(
    userId: string,
    report: {
      title: string;
      report_type: Report['report_type'];
      file_path?: string;
      file_format?: Report['file_format'];
      parameters?: Report['parameters'];
    }
  ): Promise<Report> {
    try {
      const { data, error } = await supabase
        .from('viajar_reports')
        .insert({
          user_id: userId,
          ...report,
          status: report.file_path ? 'generated' : 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data as Report;
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      throw error;
    }
  }

  /**
   * Listar relatórios do usuário
   */
  async getReports(
    userId: string,
    filters?: {
      report_type?: Report['report_type'];
      status?: Report['status'];
    }
  ): Promise<Report[]> {
    try {
      let query = supabase
        .from('viajar_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters?.report_type) {
        query = query.eq('report_type', filters.report_type);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as Report[];
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      return [];
    }
  }

  /**
   * Buscar relatório por ID
   */
  async getReportById(id: string): Promise<Report | null> {
    try {
      const { data, error } = await supabase
        .from('viajar_reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as Report;
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      return null;
    }
  }

  /**
   * Obter URL do relatório
   */
  async getReportUrl(filePath: string): Promise<string | null> {
    try {
      const fileName = filePath.replace(`${this.BUCKET_NAME}/`, '');
      const { data } = await supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao obter URL do relatório:', error);
      return null;
    }
  }

  /**
   * Download de relatório
   */
  async downloadReport(filePath: string): Promise<Blob | null> {
    try {
      const fileName = filePath.replace(`${this.BUCKET_NAME}/`, '');
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .download(fileName);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao fazer download do relatório:', error);
      return null;
    }
  }

  /**
   * Agendar relatório
   */
  async scheduleReport(
    id: string,
    frequency: 'daily' | 'weekly' | 'monthly'
  ): Promise<Report> {
    try {
      const nextDate = this.calculateNextDate(frequency);
      
      const { data, error } = await supabase
        .from('viajar_reports')
        .update({
          scheduled: true,
          schedule_frequency: frequency,
          next_generation_date: nextDate
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Report;
    } catch (error) {
      console.error('Erro ao agendar relatório:', error);
      throw error;
    }
  }

  /**
   * Cancelar agendamento
   */
  async cancelSchedule(id: string): Promise<Report> {
    try {
      const { data, error } = await supabase
        .from('viajar_reports')
        .update({
          scheduled: false,
          schedule_frequency: null,
          next_generation_date: null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Report;
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      throw error;
    }
  }

  /**
   * Deletar relatório
   */
  async deleteReport(id: string): Promise<void> {
    try {
      const report = await this.getReportById(id);
      if (!report) throw new Error('Relatório não encontrado');

      // Deletar arquivo do Storage se existir
      if (report.file_path) {
        const fileName = report.file_path.replace(`${this.BUCKET_NAME}/`, '');
        await supabase.storage
          .from(this.BUCKET_NAME)
          .remove([fileName]);
      }

      // Deletar registro
      const { error } = await supabase
        .from('viajar_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar relatório:', error);
      throw error;
    }
  }

  /**
   * Calcular próxima data de geração
   */
  private calculateNextDate(frequency: 'daily' | 'weekly' | 'monthly'): string {
    const today = new Date();
    const nextDate = new Date();

    switch (frequency) {
      case 'daily':
        nextDate.setDate(today.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(today.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(today.getMonth() + 1);
        break;
    }

    return nextDate.toISOString().split('T')[0];
  }
}

export const reportService = new ReportService();


