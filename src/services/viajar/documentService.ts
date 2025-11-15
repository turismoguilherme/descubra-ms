/**
 * Document Service
 * Serviço para upload e gerenciamento de documentos no Supabase Storage
 */

import { supabase } from '@/integrations/supabase/client';

export interface Document {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  mime_type: string | null;
  title: string | null;
  description: string | null;
  category: string | null;
  tags: string[] | null;
  analysis_result: any | null;
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class DocumentService {
  private readonly BUCKET_NAME = 'viajar-documents';

  /**
   * Upload de documento para Supabase Storage
   */
  async uploadDocument(
    userId: string,
    file: File,
    metadata?: {
      title?: string;
      description?: string;
      category?: string;
      tags?: string[];
    }
  ): Promise<Document> {
    try {
      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${this.BUCKET_NAME}/${fileName}`;

      // Upload para Storage
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Se o bucket não existir, criar (requer permissões admin)
        if (uploadError.message.includes('Bucket not found')) {
          console.warn('Bucket não encontrado. Criando bucket...');
          // Nota: Criação de bucket requer permissões admin no Supabase
        }
        throw uploadError;
      }

      // Salvar metadados na tabela
      const { data, error } = await supabase
        .from('viajar_documents')
        .insert({
          user_id: userId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: fileExt || null,
          mime_type: file.type || null,
          title: metadata?.title || file.name,
          description: metadata?.description || null,
          category: metadata?.category || null,
          tags: metadata?.tags || null,
          analysis_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data as Document;
    } catch (error) {
      console.error('Erro ao fazer upload de documento:', error);
      throw error;
    }
  }

  /**
   * Listar documentos do usuário
   */
  async getDocuments(userId: string, filters?: {
    category?: string;
    is_active?: boolean;
  }): Promise<Document[]> {
    try {
      let query = supabase
        .from('viajar_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as Document[];
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      return [];
    }
  }

  /**
   * Buscar documento por ID
   */
  async getDocumentById(id: string): Promise<Document | null> {
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
      return data as Document;
    } catch (error) {
      console.error('Erro ao buscar documento:', error);
      return null;
    }
  }

  /**
   * Obter URL pública do documento
   */
  async getDocumentUrl(filePath: string): Promise<string | null> {
    try {
      const { data } = await supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath.replace(`${this.BUCKET_NAME}/`, ''));

      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao obter URL do documento:', error);
      return null;
    }
  }

  /**
   * Download de documento
   */
  async downloadDocument(filePath: string): Promise<Blob | null> {
    try {
      const fileName = filePath.replace(`${this.BUCKET_NAME}/`, '');
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .download(fileName);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao fazer download do documento:', error);
      return null;
    }
  }

  /**
   * Atualizar metadados do documento
   */
  async updateDocument(
    id: string,
    updates: Partial<Document>
  ): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('viajar_documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Document;
    } catch (error) {
      console.error('Erro ao atualizar documento:', error);
      throw error;
    }
  }

  /**
   * Deletar documento
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      // Buscar documento para obter file_path
      const document = await this.getDocumentById(id);
      if (!document) throw new Error('Documento não encontrado');

      // Deletar do Storage
      const fileName = document.file_path.replace(`${this.BUCKET_NAME}/`, '');
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fileName]);

      if (storageError) {
        console.warn('Erro ao deletar do Storage:', storageError);
        // Continuar mesmo se falhar no Storage
      }

      // Deletar registro da tabela
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
   * Analisar documento (mockado por enquanto)
   */
  async analyzeDocument(id: string): Promise<any> {
    try {
      // Atualizar status para processing
      await this.updateDocument(id, { analysis_status: 'processing' });

      // Simular processamento (mockado)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock de resultado de análise
      const mockAnalysis = {
        extracted_data: {
          business_name: 'Exemplo',
          cnpj: '00.000.000/0000-00',
          address: 'Endereço exemplo'
        },
        summary: 'Documento processado com sucesso',
        confidence: 0.85
      };

      // Atualizar com resultado
      await this.updateDocument(id, {
        analysis_result: mockAnalysis,
        analysis_status: 'completed'
      });

      return mockAnalysis;
    } catch (error) {
      console.error('Erro ao analisar documento:', error);
      await this.updateDocument(id, { analysis_status: 'failed' });
      throw error;
    }
  }
}

export const documentService = new DocumentService();

