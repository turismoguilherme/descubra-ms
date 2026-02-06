/**
 * 🧠 KNOWLEDGE BASE ADMIN SERVICE
 * Serviço para gerenciar base de conhecimento via admin
 * Suporta upload de arquivos e gerenciamento completo
 */

import { supabase } from "@/integrations/supabase/client";

export interface KnowledgeBaseEntry {
  id: string;
  chatbot: 'guata' | 'koda' | 'ambos';
  pergunta: string;
  pergunta_normalizada: string;
  resposta: string;
  titulo?: string;
  tipo: 'conceito' | 'local' | 'pessoa' | 'evento' | 'geral';
  categoria?: string;
  tags: string[];
  regiao?: string;
  fonte: 'manual' | 'gemini' | 'web' | 'pdf' | 'txt' | 'docx' | 'csv' | 'json';
  prioridade?: number;
  ativo: boolean;
  arquivo_original?: string;
  tipo_upload?: 'manual' | 'pdf' | 'txt' | 'docx' | 'csv' | 'json';
  metadata_arquivo?: {
    upload_id?: string;
    filename?: string;
    [key: string]: any;
  };
  usado_por: number;
  ultima_atualizacao: string;
  criado_em: string;
  criado_por?: string;
}

export interface KnowledgeBaseFilters {
  chatbot?: 'guata' | 'koda' | 'ambos';
  categoria?: string;
  tipo?: string;
  regiao?: string;
  ativo?: boolean;
  search?: string;
}

class KnowledgeBaseAdminService {
  /**
   * Normaliza pergunta para busca
   */
  normalizeQuestion(question: string): string {
    if (!question) return '';
    
    return question
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Busca itens da base de conhecimento
   */
  async getEntries(filters?: KnowledgeBaseFilters): Promise<KnowledgeBaseEntry[]> {
    try {
      // Buscar todos os dados primeiro
      const { data: allData, error: fetchError } = await supabase
        .from('guata_knowledge_base')
        .select('*');

      if (fetchError) throw fetchError;

      let filtered = (allData || []) as KnowledgeBaseEntry[];

      // Aplicar filtros manualmente
      if (filters?.chatbot) {
        filtered = filtered.filter(e => e.chatbot === filters.chatbot || e.chatbot === 'ambos');
      }

      if (filters?.categoria) {
        filtered = filtered.filter(e => e.categoria === filters.categoria);
      }

      if (filters?.tipo) {
        filtered = filtered.filter(e => e.tipo === filters.tipo);
      }

      if (filters?.regiao) {
        filtered = filtered.filter(e => e.regiao === filters.regiao);
      }

      if (filters?.ativo !== undefined) {
        filtered = filtered.filter(e => e.ativo === filters.ativo);
      }

      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter(e => 
          e.pergunta.toLowerCase().includes(searchTerm) ||
          e.resposta.toLowerCase().includes(searchTerm) ||
          (e.titulo && e.titulo.toLowerCase().includes(searchTerm))
        );
      }

      // Ordenar
      filtered.sort((a, b) => {
        const priorityDiff = (b.prioridade || 5) - (a.prioridade || 5);
        if (priorityDiff !== 0) return priorityDiff;
        return b.usado_por - a.usado_por;
      });

      return filtered;
    } catch (error) {
      console.error('❌ Erro ao buscar base de conhecimento:', error);
      throw error;
    }
  }

  /**
   * Busca um item específico
   */
  async getEntry(id: string): Promise<KnowledgeBaseEntry | null> {
    try {
      const { data, error } = await supabase
        .from('guata_knowledge_base')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data as KnowledgeBaseEntry;
    } catch (error) {
      console.error('❌ Erro ao buscar item:', error);
      return null;
    }
  }

  /**
   * Cria novo item
   */
  async createEntry(entry: Omit<KnowledgeBaseEntry, 'id' | 'criado_em' | 'ultima_atualizacao' | 'usado_por'>): Promise<KnowledgeBaseEntry> {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'knowledgeBaseAdminService.ts:142',message:'createEntry called',data:{entryKeys:Object.keys(entry),entryId:entry.id,hasMetadata:!!entry.metadata_arquivo},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const { data: { user } } = await supabase.auth.getUser();

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'knowledgeBaseAdminService.ts:145',message:'User fetched',data:{userId:user?.id,userIsNull:user===null,userIsUndefined:user===undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      const normalizedQuestion = this.normalizeQuestion(entry.pergunta);

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'knowledgeBaseAdminService.ts:151',message:'Before creating newEntry',data:{criadoPorValue:user?.id,criadoPorType:typeof user?.id,criadoPorIsEmpty:user?.id===''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      const newEntry: any = {
        ...entry,
        pergunta_normalizada: normalizedQuestion,
        usado_por: 0,
      };

      // Only include criado_por if user.id exists and is not empty
      if (user?.id && user.id !== '') {
        newEntry.criado_por = user.id;
      }

      // Remove any empty string UUID fields
      Object.keys(newEntry).forEach(key => {
        if (newEntry[key] === '' && (key.includes('_id') || key.includes('_por') || key === 'id')) {
          delete newEntry[key];
        }
      });

      // Clean metadata_arquivo if it has empty upload_id
      if (newEntry.metadata_arquivo && typeof newEntry.metadata_arquivo === 'object') {
        if (newEntry.metadata_arquivo.upload_id === '') {
          delete newEntry.metadata_arquivo.upload_id;
        }
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'knowledgeBaseAdminService.ts:170',message:'Before insert',data:{newEntryKeys:Object.keys(newEntry),criadoPorInEntry:newEntry.criado_por,criadoPorType:typeof newEntry.criado_por,hasEmptyStrings:Object.values(newEntry).some(v=>v==='')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      const { data, error } = await supabase
        .from('guata_knowledge_base')
        .insert(newEntry)
        .select()
        .single();

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'knowledgeBaseAdminService.ts:175',message:'Insert result',data:{hasError:!!error,errorCode:error?.code,errorMessage:error?.message,hasData:!!data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      if (error) throw error;

      return data as KnowledgeBaseEntry;
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'knowledgeBaseAdminService.ts:180',message:'Error caught',data:{errorMessage:error instanceof Error?error.message:'unknown',errorCode:(error as any)?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('❌ Erro ao criar item:', error);
      throw error;
    }
  }

  /**
   * Atualiza item existente
   */
  async updateEntry(id: string, updates: Partial<KnowledgeBaseEntry>): Promise<KnowledgeBaseEntry> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const updateData: any = { ...updates };
      
      if (updates.pergunta) {
        updateData.pergunta_normalizada = this.normalizeQuestion(updates.pergunta);
      }

      const { data, error } = await supabase
        .from('guata_knowledge_base')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data as KnowledgeBaseEntry;
    } catch (error) {
      console.error('❌ Erro ao atualizar item:', error);
      throw error;
    }
  }

  /**
   * Deleta item
   */
  async deleteEntry(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('guata_knowledge_base')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Erro ao deletar item:', error);
      throw error;
    }
  }

  /**
   * Processa upload de arquivo e salva informações do arquivo
   */
  async processFileUpload(file: File, chatbotTarget?: 'guata' | 'koda' | 'ambos'): Promise<{ 
    uploadId: string;
    entries: Partial<KnowledgeBaseEntry>[]; 
    errors: string[] 
  }> {
    const entries: Partial<KnowledgeBaseEntry>[] = [];
    const errors: string[] = [];
    let uploadId = '';

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const fileType = file.name.split('.').pop()?.toLowerCase() || '';

      // Criar registro do upload
      const { data: uploadData, error: uploadError } = await supabase
        .from('knowledge_base_uploads')
        .insert({
          filename: file.name,
          file_type: fileType,
          file_size: file.size,
          status: 'processing',
          chatbot_target: chatbotTarget || 'guata',
          uploaded_by: user?.id,
        })
        .select()
        .single();

      if (uploadError) throw uploadError;
      uploadId = uploadData.id;

      // Processar arquivo
      const fileContent = await this.readFileContent(file);

      switch (fileType) {
        case 'txt':
          entries.push(...this.parseTxtFile(fileContent, file.name));
          break;
        case 'csv':
          entries.push(...this.parseCsvFile(fileContent, file.name));
          break;
        case 'json':
          entries.push(...this.parseJsonFile(fileContent, file.name));
          break;
        default:
          errors.push(`Tipo de arquivo não suportado: ${fileType}`);
      }

      // Atualizar status do upload
      await supabase
        .from('knowledge_base_uploads')
        .update({
          status: errors.length > 0 ? 'failed' : 'completed',
          items_created: entries.length,
          items_failed: errors.length,
          error_message: errors.length > 0 ? errors.join('; ') : null,
          processed_at: new Date().toISOString(),
        })
        .eq('id', uploadId);

    } catch (error) {
      errors.push(`Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      // Atualizar upload como falho
      if (uploadId) {
        await supabase
          .from('knowledge_base_uploads')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Erro desconhecido',
            processed_at: new Date().toISOString(),
          })
          .eq('id', uploadId);
      }
    }

    return { uploadId, entries, errors };
  }

  /**
   * Lê conteúdo do arquivo
   */
  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /**
   * Parse arquivo TXT
   */
  private parseTxtFile(content: string, filename: string): Partial<KnowledgeBaseEntry>[] {
    const entries: Partial<KnowledgeBaseEntry>[] = [];
    const lines = content.split('\n').filter(line => line.trim());

    // Formato simples: cada linha é uma pergunta, próxima linha é resposta
    for (let i = 0; i < lines.length; i += 2) {
      if (lines[i] && lines[i + 1]) {
        entries.push({
          pergunta: lines[i].trim(),
          resposta: lines[i + 1].trim(),
          titulo: lines[i].trim().substring(0, 100),
          tipo: 'geral',
          categoria: 'informações',
          fonte: 'txt',
          tipo_upload: 'txt',
          arquivo_original: filename,
          ativo: true,
          tags: [],
          chatbot: 'guata',
          metadata_arquivo: { upload_id: '', filename },
        } as any);
      }
    }

    return entries;
  }

  /**
   * Parse arquivo CSV
   */
  private parseCsvFile(content: string, filename: string): Partial<KnowledgeBaseEntry>[] {
    const entries: Partial<KnowledgeBaseEntry>[] = [];
    const lines = content.split('\n').filter(line => line.trim());

    if (lines.length === 0) return entries;

    // Primeira linha são os headers
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const perguntaIndex = headers.findIndex(h => h.includes('pergunta') || h.includes('question'));
    const respostaIndex = headers.findIndex(h => h.includes('resposta') || h.includes('answer') || h.includes('content'));
    const tituloIndex = headers.findIndex(h => h.includes('titulo') || h.includes('title'));
    const categoriaIndex = headers.findIndex(h => h.includes('categoria') || h.includes('category'));
    const chatbotIndex = headers.findIndex(h => h.includes('chatbot'));

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (perguntaIndex >= 0 && respostaIndex >= 0 && values[perguntaIndex] && values[respostaIndex]) {
        entries.push({
          pergunta: values[perguntaIndex],
          resposta: values[respostaIndex],
          titulo: tituloIndex >= 0 ? values[tituloIndex] : values[perguntaIndex].substring(0, 100),
          categoria: categoriaIndex >= 0 ? values[categoriaIndex] : 'informações',
          chatbot: chatbotIndex >= 0 ? (values[chatbotIndex] as 'guata' | 'koda' | 'ambos') || 'guata' : 'guata',
          tipo: 'geral',
          fonte: 'csv',
          tipo_upload: 'csv',
          arquivo_original: filename,
          ativo: true,
          tags: [],
          metadata_arquivo: { upload_id: '', filename },
        } as any);
      }
    }

    return entries;
  }

  /**
   * Parse arquivo JSON
   */
  private parseJsonFile(content: string, filename: string): Partial<KnowledgeBaseEntry>[] {
    try {
      const data = JSON.parse(content);
      const entries: Partial<KnowledgeBaseEntry>[] = [];

      // Se for array
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          entries.push({
            pergunta: item.pergunta || item.question || item.titulo || item.title,
            resposta: item.resposta || item.answer || item.content || item.conteudo,
            titulo: item.titulo || item.title || item.pergunta?.substring(0, 100),
            categoria: item.categoria || item.category || 'informações',
            chatbot: item.chatbot || 'guata',
            tipo: item.tipo || 'geral',
            tags: item.tags || [],
            regiao: item.regiao || item.region,
            prioridade: item.prioridade || item.priority || 5,
            fonte: 'json',
            tipo_upload: 'json',
            arquivo_original: filename,
            ativo: item.ativo !== undefined ? item.ativo : true,
            metadata_arquivo: { upload_id: '', filename },
          } as any);
        });
      } else {
        // Se for objeto único
        entries.push({
          pergunta: data.pergunta || data.question || data.titulo || data.title,
          resposta: data.resposta || data.answer || data.content || data.conteudo,
          titulo: data.titulo || data.title || data.pergunta?.substring(0, 100),
          categoria: data.categoria || data.category || 'informações',
          chatbot: data.chatbot || 'guata',
          tipo: data.tipo || 'geral',
          tags: data.tags || [],
          regiao: data.regiao || data.region,
          prioridade: data.prioridade || data.priority || 5,
          fonte: 'json',
          tipo_upload: 'json',
          arquivo_original: filename,
          ativo: data.ativo !== undefined ? data.ativo : true,
          metadata_arquivo: { upload_id: '', filename },
        } as any);
      }

      return entries;
    } catch (error) {
      throw new Error(`Erro ao parsear JSON: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Importa múltiplos itens de uma vez
   */
  async importEntries(entries: Partial<KnowledgeBaseEntry>[], uploadId?: string): Promise<{ success: number; errors: string[] }> {
    let success = 0;
    const errors: string[] = [];

    for (const entry of entries) {
      try {
        // Adicionar upload_id aos metadados se fornecido
        const entryToCreate = uploadId 
          ? { ...entry, metadata_arquivo: { ...(entry.metadata_arquivo as any || {}), upload_id: uploadId } }
          : entry;
        
        await this.createEntry(entryToCreate as any);
        success++;
      } catch (error) {
        errors.push(`Erro ao importar "${entry.titulo || entry.pergunta}": ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    // Atualizar upload com resultados finais
    if (uploadId) {
      await supabase
        .from('knowledge_base_uploads')
        .update({
          items_created: success,
          items_failed: errors.length,
          status: errors.length === entries.length ? 'failed' : 'completed',
        })
        .eq('id', uploadId);
    }

    return { success, errors };
  }

  /**
   * Busca arquivos enviados
   */
  async getUploadedFiles(filters?: { chatbot?: string; status?: string }): Promise<any[]> {
    try {
      let query = supabase
        .from('knowledge_base_uploads')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (filters?.chatbot) {
        query = query.eq('chatbot_target', filters.chatbot);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar arquivos enviados:', error);
      return [];
    }
  }

  /**
   * Busca itens criados por um arquivo
   */
  async getItemsByUpload(uploadId: string): Promise<KnowledgeBaseEntry[]> {
    try {
      // Buscar por metadata_arquivo->upload_id ou arquivo_original
      const { data: uploadData } = await supabase
        .from('knowledge_base_uploads')
        .select('filename')
        .eq('id', uploadId)
        .single();

      if (!uploadData) return [];

      // Buscar itens que têm o upload_id nos metadados ou o nome do arquivo
      const { data, error } = await supabase
        .from('guata_knowledge_base')
        .select('*')
        .or(`metadata_arquivo->>upload_id.eq.${uploadId},arquivo_original.eq.${uploadData.filename}`)
        .order('criado_em', { ascending: false });

      if (error) throw error;

      return (data || []) as KnowledgeBaseEntry[];
    } catch (error) {
      console.error('❌ Erro ao buscar itens do upload:', error);
      return [];
    }
  }

  /**
   * Deleta arquivo e todos os itens relacionados
   */
  async deleteUpload(uploadId: string, deleteItems: boolean = false): Promise<void> {
    try {
      if (deleteItems) {
        // Buscar itens relacionados
        const items = await this.getItemsByUpload(uploadId);
        
        // Deletar itens
        for (const item of items) {
          await this.deleteEntry(item.id);
        }
      }

      // Marcar upload como deletado
      await supabase
        .from('knowledge_base_uploads')
        .update({
          status: 'deleted',
          deleted_at: new Date().toISOString(),
        })
        .eq('id', uploadId);
    } catch (error) {
      console.error('❌ Erro ao deletar upload:', error);
      throw error;
    }
  }

  /**
   * Estatísticas da base de conhecimento
   */
  async getStatistics(): Promise<{
    total: number;
    byChatbot: { guata: number; koda: number; ambos: number };
    byCategoria: Record<string, number>;
    mostUsed: KnowledgeBaseEntry[];
  }> {
    try {
      const entries = await this.getEntries();

      const byChatbot = {
        guata: entries.filter(e => e.chatbot === 'guata' || e.chatbot === 'ambos').length,
        koda: entries.filter(e => e.chatbot === 'koda' || e.chatbot === 'ambos').length,
        ambos: entries.filter(e => e.chatbot === 'ambos').length,
      };

      const byCategoria: Record<string, number> = {};
      entries.forEach(entry => {
        const cat = entry.categoria || 'sem categoria';
        byCategoria[cat] = (byCategoria[cat] || 0) + 1;
      });

      const mostUsed = [...entries]
        .sort((a, b) => b.usado_por - a.usado_por)
        .slice(0, 10);

      return {
        total: entries.length,
        byChatbot,
        byCategoria,
        mostUsed,
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return {
        total: 0,
        byChatbot: { guata: 0, koda: 0, ambos: 0 },
        byCategoria: {},
        mostUsed: [],
      };
    }
  }
}

export const knowledgeBaseAdminService = new KnowledgeBaseAdminService();

