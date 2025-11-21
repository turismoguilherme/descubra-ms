/**
 * Public Sector Document Service
 * Serviço para upload e gerenciamento de documentos municipais
 */

import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface PublicDocument {
  id: string;
  user_id: string;
  municipality_id?: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  mime_type: string | null;
  title: string | null;
  description: string | null;
  category: 'plano_diretor' | 'relatorio' | 'lei' | 'portaria' | 'outros';
  tags: string[] | null;
  analysis_result: any | null;
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentMetadata {
  title?: string;
  description?: string;
  category?: 'plano_diretor' | 'relatorio' | 'lei' | 'portaria' | 'outros';
  tags?: string[];
  municipality_id?: string;
}

export class PublicDocumentService {
  private readonly BUCKET_NAME = 'public-documents';

  /**
   * Upload de documento para Supabase Storage
   */
  async uploadDocument(
    userId: string,
    file: File,
    metadata?: DocumentMetadata
  ): Promise<PublicDocument> {
    try {
      // Validar tipo de arquivo
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'image/jpeg',
        'image/png'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não permitido. Use PDF, Word, Excel ou imagens.');
      }

      // Validar tamanho (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 10MB');
      }

      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${uuidv4()}.${fileExt}`;

      // Upload para Storage
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found')) {
          console.warn('Bucket não encontrado. Certifique-se de que o bucket "public-documents" existe no Supabase Storage.');
        }
        throw uploadError;
      }

      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      // Salvar metadados na tabela (usando viajar_documents por enquanto, pode criar tabela específica depois)
      const { data, error } = await supabase
        .from('viajar_documents')
        .insert({
          user_id: userId,
          file_name: file.name,
          file_path: publicUrlData?.publicUrl || fileName,
          file_size: file.size,
          file_type: fileExt || null,
          mime_type: file.type || null,
          title: metadata?.title || file.name,
          description: metadata?.description || null,
          category: metadata?.category || 'outros',
          tags: metadata?.tags || null,
          analysis_status: 'pending'
        })
        .select()
        .single();

      if (error) {
        // Se falhar, tentar deletar o arquivo do storage
        await supabase.storage.from(this.BUCKET_NAME).remove([fileName]);
        throw error;
      }

      return data as PublicDocument;
    } catch (error) {
      console.error('Erro ao fazer upload de documento:', error);
      throw error;
    }
  }

  /**
   * Listar documentos do usuário
   */
  async getDocuments(
    userId: string,
    filters?: {
      category?: string;
      is_active?: boolean;
      municipality_id?: string;
    }
  ): Promise<PublicDocument[]> {
    try {
      let query = supabase
        .from('viajar_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters) {
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        if (filters.is_active !== undefined) {
          query = query.eq('is_active', filters.is_active);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as PublicDocument[];
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      return [];
    }
  }

  /**
   * Buscar documento por ID
   */
  async getDocumentById(id: string): Promise<PublicDocument | null> {
    try {
      const { data, error } = await supabase
        .from('viajar_documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data as PublicDocument;
    } catch (error) {
      console.error('Erro ao buscar documento:', error);
      return null;
    }
  }

  /**
   * Deletar documento
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      // Buscar documento para obter o caminho do arquivo
      const document = await this.getDocumentById(id);
      if (!document) {
        throw new Error('Documento não encontrado');
      }

      // Extrair nome do arquivo do caminho
      const fileName = document.file_path.split('/').pop();
      if (fileName) {
        // Deletar do Storage
        const { error: storageError } = await supabase.storage
          .from(this.BUCKET_NAME)
          .remove([`${document.user_id}/${fileName}`]);

        if (storageError) {
          console.warn('Erro ao deletar arquivo do storage:', storageError);
        }
      }

      // Deletar do banco de dados
      const { error } = await supabase
        .from('viajar_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      throw error;
    }
  }

  /**
   * Processar documento com IA (Gemini)
   */
  async processDocumentWithAI(documentId: string): Promise<any> {
    try {
      const document = await this.getDocumentById(documentId);
      if (!document) {
        throw new Error('Documento não encontrado');
      }

      // Atualizar status para processing
      await supabase
        .from('viajar_documents')
        .update({ analysis_status: 'processing' })
        .eq('id', documentId);

      // Importar serviço de análise dinamicamente
      const { documentAnalysisService } = await import('@/services/ai/documentAnalysisService');
      
      // Obter URL do documento
      const documentUrl = this.getDocumentUrl(document);
      if (!documentUrl) {
        throw new Error('Não foi possível obter URL do documento');
      }

      // Buscar arquivo do storage
      const filePath = document.file_path;
      const { data: fileData, error: downloadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .download(filePath);

      if (downloadError || !fileData) {
        throw new Error('Não foi possível baixar o arquivo para análise');
      }

      // Converter Blob para File
      const file = new File([fileData], document.file_name || 'documento', {
        type: document.mime_type || 'application/octet-stream',
      });

      // Processar com documentAnalysisService
      const municipalityId = document.user_id; // Assumindo que user_id é o município
      const insights = await documentAnalysisService.uploadAndAnalyze(
        file,
        document.category as any || 'other',
        municipalityId
      );

      // Formatar resultado para salvar
      const analysisResult = {
        extracted_data: insights.analysis.extractedData,
        summary: insights.analysis.summary,
        key_points: insights.analysis.keyPoints,
        recommendations: insights.analysis.recommendations,
        confidence: insights.analysis.confidence,
        document_type: insights.analysis.documentType,
        extracted_metrics: insights.extractedMetrics,
        comparison: insights.comparison,
        storage_url: insights.storageUrl,
      };

      // Atualizar com resultado
      await supabase
        .from('viajar_documents')
        .update({
          analysis_status: 'completed',
          analysis_result: analysisResult
        })
        .eq('id', documentId);

      return analysisResult;
    } catch (error) {
      console.error('Erro ao processar documento com IA:', error);
      
      // Atualizar status para failed
      await supabase
        .from('viajar_documents')
        .update({ analysis_status: 'failed' })
        .eq('id', documentId);

      throw error;
    }
  }

  /**
   * Obter URL de download do documento
   */
  getDocumentUrl(document: PublicDocument): string {
    // Se já for uma URL completa, retornar
    if (document.file_path.startsWith('http')) {
      return document.file_path;
    }

    // Caso contrário, construir URL do storage
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(document.file_path);

    return data?.publicUrl || document.file_path;
  }
}

export const publicDocumentService = new PublicDocumentService();

