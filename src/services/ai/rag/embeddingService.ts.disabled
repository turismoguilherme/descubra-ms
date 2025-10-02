// Serviço de Embeddings - Guatá Super Inteligente
// Gera vetores semânticos para busca inteligente e contextual

export interface EmbeddingResult {
  text: string;
  embedding: number[];
  confidence: number;
  metadata?: any;
}

export interface EmbeddingBatch {
  texts: string[];
  embeddings: number[][];
  errors: string[];
  processingTime: number;
}

export class EmbeddingService {
  private readonly EMBEDDING_DIMENSION = 384;
  private readonly BATCH_SIZE = 10;
  private readonly MAX_RETRIES = 3;
  
  // Cache de embeddings para evitar reprocessamento
  private embeddingCache = new Map<string, number[]>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

  // Gerar embedding para um texto
  async generateEmbedding(text: string, metadata?: any): Promise<EmbeddingResult> {
    try {
      console.log(`🧮 Gerando embedding para: ${text.substring(0, 100)}...`);
      
      // Verificar cache primeiro
      const cacheKey = this.generateCacheKey(text);
      const cached = this.embeddingCache.get(cacheKey);
      
      if (cached) {
        console.log('🔄 Embedding encontrado em cache');
        return {
          text,
          embedding: cached,
          confidence: 0.95,
          metadata
        };
      }

      // Gerar embedding usando modelo local (simulado para 384d)
      const embedding = await this.generateLocalEmbedding(text);
      
      // Salvar no cache
      this.embeddingCache.set(cacheKey, embedding);
      
      console.log(`✅ Embedding gerado: ${embedding.length} dimensões`);
      
      return {
        text,
        embedding,
        confidence: 0.9,
        metadata
      };
      
    } catch (error) {
      console.error('❌ Erro ao gerar embedding:', error);
      
      // Fallback: embedding aleatório para manter funcionalidade
      const fallbackEmbedding = this.generateFallbackEmbedding(text);
      
      return {
        text,
        embedding: fallbackEmbedding,
        confidence: 0.3,
        metadata
      };
    }
  }

  // Gerar embeddings em lote para melhor performance
  async generateBatchEmbeddings(texts: string[], metadata?: any[]): Promise<EmbeddingBatch> {
    const startTime = Date.now();
    const embeddings: number[][] = [];
    const errors: string[] = [];
    
    console.log(`🧮 Processando lote de ${texts.length} textos...`);
    
    // Processar em lotes para não sobrecarregar
    for (let i = 0; i < texts.length; i += this.BATCH_SIZE) {
      const batch = texts.slice(i, i + this.BATCH_SIZE);
      
      try {
        const batchPromises = batch.map((text, index) => 
          this.generateEmbedding(text, metadata?.[i + index])
        );
        
        const batchResults = await Promise.all(batchPromises);
        
        for (const result of batchResults) {
          if (result.confidence > 0.5) {
            embeddings.push(result.embedding);
          } else {
            errors.push(`Baixa confiança para: ${result.text.substring(0, 50)}`);
          }
        }
        
        // Rate limiting entre lotes
        if (i + this.BATCH_SIZE < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        console.error(`❌ Erro no lote ${i}-${i + this.BATCH_SIZE}:`, error);
        errors.push(`Erro no lote: ${error.message}`);
      }
    }
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ Lote processado: ${embeddings.length}/${texts.length} embeddings em ${processingTime}ms`);
    
    return {
      texts,
      embeddings,
      errors,
      processingTime
    };
  }

  // Gerar embedding local (simulado para 384d)
  private async generateLocalEmbedding(text: string): Promise<number[]> {
    // Em produção, você usaria um modelo real como:
    // - sentence-transformers/all-MiniLM-L6-v2 (384d)
    // - intfloat/multilingual-e5-small (384d)
    // - Google text-embedding-004 (768d, truncado para 384d)
    
    // Simulação inteligente baseada no conteúdo
    const embedding = new Array(this.EMBEDDING_DIMENSION).fill(0);
    
    // Gerar valores baseados no conteúdo do texto
    const textLower = text.toLowerCase();
    const words = textLower.split(/\s+/).filter(word => word.length > 2);
    
    // Hash simples para gerar valores consistentes
    for (let i = 0; i < this.EMBEDDING_DIMENSION; i++) {
      let value = 0;
      
      for (const word of words) {
        // Hash da palavra + posição
        const hash = this.simpleHash(word + i.toString());
        value += (hash % 200 - 100) / 100; // Valores entre -1 e 1
      }
      
      // Normalizar
      embedding[i] = Math.tanh(value / words.length);
    }
    
    return embedding;
  }

  // Gerar embedding de fallback para casos de erro
  private generateFallbackEmbedding(text: string): number[] {
    const embedding = new Array(this.EMBEDDING_DIMENSION).fill(0);
    
    // Hash simples baseado no texto
    const hash = this.simpleHash(text);
    
    for (let i = 0; i < this.EMBEDDING_DIMENSION; i++) {
      embedding[i] = Math.sin(hash + i) * 0.1; // Valores pequenos e variados
    }
    
    return embedding;
  }

  // Hash simples para consistência
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  // Gerar chave de cache
  private generateCacheKey(text: string): string {
    const normalized = text.toLowerCase().trim().substring(0, 200);
    return this.simpleHash(normalized).toString();
  }

  // Calcular similaridade entre dois embeddings
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      console.warn('⚠️ Embeddings com dimensões diferentes');
      return 0;
    }
    
    // Cosseno similaridade
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }
    
    const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    
    // Normalizar para 0-1
    return Math.max(0, (similarity + 1) / 2);
  }

  // Buscar embeddings similares
  async findSimilarEmbeddings(
    queryEmbedding: number[],
    candidateEmbeddings: number[][],
    threshold: number = 0.7
  ): Promise<{ index: number; similarity: number }[]> {
    const similarities: { index: number; similarity: number }[] = [];
    
    for (let i = 0; i < candidateEmbeddings.length; i++) {
      const similarity = this.calculateSimilarity(queryEmbedding, candidateEmbeddings[i]);
      
      if (similarity >= threshold) {
        similarities.push({ index: i, similarity });
      }
    }
    
    // Ordenar por similaridade
    return similarities.sort((a, b) => b.similarity - a.similarity);
  }

  // Limpar cache antigo
  cleanupCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, timestamp] of this.embeddingCache.entries()) {
      if (now - timestamp > this.CACHE_DURATION) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.embeddingCache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Cache limpo: ${keysToDelete.length} embeddings removidos`);
    }
  }

  // Obter estatísticas do serviço
  getStats(): { cacheSize: number; cacheHitRate: number } {
    return {
      cacheSize: this.embeddingCache.size,
      cacheHitRate: 0.8 // Simulado
    };
  }
}

export const embeddingService = new EmbeddingService();







































