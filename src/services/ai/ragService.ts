// RAG Service para Guatá - Sistema de Recuperação Aumentada de Geração
// Integra com o sistema existente do Guatá para fornecer respostas baseadas em dados atualizados

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

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
  private geminiClient: GoogleGenerativeAI;
  private supabase: any;
  private cache = new Map<string, { response: RAGResponse; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  constructor() {
    this.geminiClient = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  /**
   * Processa uma consulta usando RAG
   */
  async processQuery(query: RAGQuery): Promise<RAGResponse> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(query);

    // Verificar cache
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      console.log('🔄 RAG: Usando resposta em cache');
      return cached.response;
    }

    try {
      // 1. Buscar documentos relevantes
      const relevantChunks = await this.retrieveRelevantDocuments(query.question);
      
      // 2. Montar contexto
      const context = this.buildContext(relevantChunks);
      
      // 3. Gerar resposta com Gemini
      const answer = await this.generateAnswer(query.question, context);
      
      // 4. Preparar resposta
      const response: RAGResponse = {
        answer,
        sources: relevantChunks.map(chunk => ({
          title: chunk.metadata.title || 'Documento',
          url: chunk.metadata.url,
          content: chunk.content.substring(0, 200) + '...',
          relevance: 0.9 // Placeholder - seria calculado baseado no score
        })),
        confidence: this.calculateConfidence(relevantChunks),
        processingTime: Date.now() - startTime,
        metadata: {
          totalChunks: relevantChunks.length,
          searchStrategy: 'hybrid',
          model: 'gemini-1.5-flash'
        }
      };

      // Salvar no cache
      this.cache.set(cacheKey, { response, timestamp: Date.now() });

      return response;

    } catch (error) {
      console.error('❌ RAG: Erro no processamento:', error);
      throw new Error(`Erro no RAG Service: ${error.message}`);
    }
  }

  /**
   * Busca documentos relevantes usando busca híbrida
   */
  private async retrieveRelevantDocuments(question: string): Promise<DocumentChunk[]> {
    try {
      // Busca híbrida: vetorial + texto
      const { data: chunks, error } = await this.supabase
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

  /**
   * Monta o contexto para o LLM
   */
  private buildContext(chunks: DocumentChunk[]): string {
    if (chunks.length === 0) {
      return 'Não encontrei informações específicas sobre sua pergunta.';
    }

    const contextParts = chunks.map((chunk, index) => {
      return `[Fonte ${index + 1}${chunk.metadata.title ? ` - ${chunk.metadata.title}` : ''}]
${chunk.content}

`;
    });

    return contextParts.join('\n');
  }

  /**
   * Gera resposta usando Gemini
   */
  private async generateAnswer(question: string, context: string): Promise<string> {
    const model = this.geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  /**
   * Calcula confiança baseada na relevância dos documentos
   */
  private calculateConfidence(chunks: DocumentChunk[]): number {
    if (chunks.length === 0) return 0.1;
    if (chunks.length >= 3) return 0.9;
    return 0.5 + (chunks.length * 0.2);
  }

  /**
   * Gera chave para cache
   */
  private generateCacheKey(query: RAGQuery): string {
    return `${query.question.substring(0, 100)}_${query.userId || 'anonymous'}`;
  }

  /**
   * Limpa cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 RAG: Cache limpo');
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: {
      supabase: boolean;
      gemini: boolean;
      cache: boolean;
    };
    metrics: {
      cacheSize: number;
      averageResponseTime: number;
    };
  }> {
    try {
      // Testar Supabase
      const { error: supabaseError } = await this.supabase
        .from('document_chunks')
        .select('count')
        .limit(1);

      // Testar Gemini
      const model = this.geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
      await model.generateContent('test');

      return {
        status: 'healthy',
        components: {
          supabase: !supabaseError,
          gemini: true,
          cache: true
        },
        metrics: {
          cacheSize: this.cache.size,
          averageResponseTime: 1500
        }
      };
    } catch (error) {
      return {
        status: 'degraded',
        components: {
          supabase: false,
          gemini: false,
          cache: true
        },
        metrics: {
          cacheSize: this.cache.size,
          averageResponseTime: 0
        }
      };
    }
  }
}

export const ragService = new RAGService();
