// RAG Service para Guatá - Sistema de Recuperação Aumentada de Geração
// SEGURANÇA: Usa callGeminiProxy (Edge Function) em vez de API key direta

import { callGeminiProxy } from './geminiProxy';
import { supabase } from '@/integrations/supabase/client';

interface RAGQuery {
  question: string;
  userId?: string;
  context?: string;
  sources?: string[];
}

interface RAGResponse {
  answer: string;
  sources: Array<{
    title: string;
    url?: string;
    content: string;
    relevance: number;
  }>;
  confidence: number;
  processingTime: number;
  metadata?: {
    totalChunks: number;
    searchStrategy: string;
    model: string;
  };
}

interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    title?: string;
    url?: string;
    category?: string;
    lastUpdated?: string;
    source?: string;
  };
  embedding?: number[];
}

export class RAGService {
  private cache = new Map<string, { response: RAGResponse; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000;

  async processQuery(query: RAGQuery): Promise<RAGResponse> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(query);

    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.response;
    }

    try {
      const relevantChunks = await this.retrieveRelevantDocuments(query.question);
      const context = this.buildContext(relevantChunks);
      const answer = await this.generateAnswer(query.question, context);

      const response: RAGResponse = {
        answer,
        sources: relevantChunks.map(chunk => ({
          title: chunk.metadata.title || 'Documento',
          url: chunk.metadata.url,
          content: chunk.content.substring(0, 200) + '...',
          relevance: 0.9
        })),
        confidence: this.calculateConfidence(relevantChunks),
        processingTime: Date.now() - startTime,
        metadata: {
          totalChunks: relevantChunks.length,
          searchStrategy: 'hybrid',
          model: 'gemini-via-proxy'
        }
      };

      this.cache.set(cacheKey, { response, timestamp: Date.now() });
      return response;

    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('❌ RAG: Erro no processamento:', err);
      throw new Error(`Erro no RAG Service: ${err.message}`);
    }
  }

  private async retrieveRelevantDocuments(question: string): Promise<DocumentChunk[]> {
    try {
      const { data: chunks, error } = await supabase
        .from('document_chunks')
        .select('*')
        .textSearch('content', question)
        .limit(8);

      if (error) throw error;
      return chunks || [];
    } catch (error) {
      console.error('❌ RAG: Erro na busca de documentos:', error);
      return [];
    }
  }

  private buildContext(chunks: DocumentChunk[]): string {
    if (chunks.length === 0) {
      return 'Não encontrei informações específicas sobre sua pergunta.';
    }

    return chunks.map((chunk, index) => {
      return `[Fonte ${index + 1}${chunk.metadata.title ? ` - ${chunk.metadata.title}` : ''}]\n${chunk.content}\n`;
    }).join('\n');
  }

  private async generateAnswer(question: string, context: string): Promise<string> {
    const prompt = `Você é o Guatá, assistente turístico do Mato Grosso do Sul. 
Use APENAS as informações fornecidas no contexto para responder à pergunta.

CONTEXTO:
${context}

PERGUNTA: ${question}

INSTRUÇÕES:
- Responda de forma amigável e turística
- Use APENAS informações do contexto fornecido
- Se não encontrar informações específicas, diga que não tem a informação atualizada
- Cite as fontes quando relevante
- Mantenha o tom do Guatá: acolhedor, informativo e útil

RESPOSTA:`;

    const result = await callGeminiProxy(prompt, { temperature: 0.7, maxOutputTokens: 2000 });
    return result.text;
  }

  private calculateConfidence(chunks: DocumentChunk[]): number {
    if (chunks.length === 0) return 0.1;
    if (chunks.length >= 3) return 0.9;
    return 0.5 + (chunks.length * 0.2);
  }

  private generateCacheKey(query: RAGQuery): string {
    return `${query.question.substring(0, 100)}_${query.userId || 'anonymous'}`;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const ragService = new RAGService();
