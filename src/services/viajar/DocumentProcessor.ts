/**
 * Document Processor
 * Serviço otimizado para extração estruturada de dados de documentos usando Gemini 1.5 Flash
 * 
 * Foco: Extração precisa de métricas de negócios (ocupação, receita, visitantes, etc.)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/integrations/supabase/client';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface ExtractedMetric {
  metric_type: 'occupancy' | 'revenue' | 'visitors' | 'ticket_avg' | 'table_turnover' | 'pax' | 'adr' | 'revpar';
  value: number;
  metric_date: string; // YYYY-MM-DD
  metadata?: Record<string, any>;
}

export interface DocumentProcessingResult {
  success: boolean;
  extractedMetrics: ExtractedMetric[];
  businessCategory?: 'hotel' | 'pousada' | 'hostel' | 'atrativo' | 'restaurante' | 'bar' | 'agencia' | 'outro';
  confidence: number; // 0-1
  rawData?: any;
  error?: string;
}

export class DocumentProcessor {
  private genAI: GoogleGenerativeAI | null = null;
  private readonly MODEL = 'gemini-1.5-flash'; // Modelo otimizado para processamento rápido

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    } else {
      console.warn('⚠️ Gemini API Key não configurada. DocumentProcessor não funcionará.');
    }
  }

  /**
   * Processar arquivo e extrair métricas estruturadas
   */
  async processFile(
    file: File,
    userId: string,
    businessCategory?: string
  ): Promise<DocumentProcessingResult> {
    try {
      if (!this.genAI) {
        throw new Error('Gemini não configurado');
      }

      console.log('📄 [DocumentProcessor] Processando arquivo:', file.name);

      // Construir chave de cache baseada no arquivo e categoria
      // Para documentos, cache é mais limitado (arquivos podem ser diferentes)
      const fileHash = `${file.name}_${file.size}_${businessCategory || 'unknown'}`;
      
      // Verificar cache (apenas para mesmo arquivo/categoria)
      const { apiCacheService } = await import('./apiCacheService');
      const cacheResult = await apiCacheService.getFromCache('gemini', fileHash);

      if (cacheResult.found && cacheResult.response) {
        console.log('✅ [DocumentProcessor] Usando cache - Economizou 1 chamada Gemini');
        // Registrar uso (mas não incrementar contador, pois foi cache)
        return {
          ...cacheResult.response,
        };
      }

      // Converter arquivo para formato compatível com Gemini
      const fileData = await this.prepareFileForGemini(file);

      // Processar com Gemini 1.5 Flash
      const model = this.genAI.getGenerativeModel({ 
        model: this.MODEL,
        generationConfig: {
          temperature: 0.1, // Baixa temperatura para extração precisa
          topP: 0.8,
          topK: 40,
        }
      });

      // Prompt estruturado para extração de métricas
      const prompt = this.buildExtractionPrompt(businessCategory);

      // Processar arquivo
      const geminiResult = await model.generateContent([
        {
          inlineData: {
            data: fileData.base64,
            mimeType: fileData.mimeType,
          },
        },
        prompt,
      ]);

      const responseText = geminiResult.response.text();
      console.log('✅ [DocumentProcessor] Resposta do Gemini:', responseText.substring(0, 200));

      // Parsear resposta JSON
      const parsed = this.parseGeminiResponse(responseText);

      // Validar e normalizar métricas
      const extractedMetrics = this.normalizeMetrics(parsed.metrics || []);

      const result: DocumentProcessingResult = {
        success: true,
        extractedMetrics,
        businessCategory: parsed.businessCategory || (businessCategory as any),
        confidence: parsed.confidence || 0.7,
        rawData: parsed,
      };

      // Salvar no cache
      await apiCacheService.saveToCache('gemini', fileHash, result);

      // Registrar uso
      const { apiUsageTrackingService } = await import('./apiUsageTrackingService');
      await apiUsageTrackingService.incrementUsage(userId, 'gemini', 1);

      return result;
    } catch (error: any) {
      console.error('❌ [DocumentProcessor] Erro ao processar arquivo:', error);
      return {
        success: false,
        extractedMetrics: [],
        confidence: 0,
        error: error.message || 'Erro desconhecido ao processar documento',
      };
    }
  }

  /**
   * Preparar arquivo para processamento no Gemini
   */
  private async prepareFileForGemini(file: File): Promise<{ base64: string; mimeType: string }> {
    // Converter para base64
    const base64 = await this.fileToBase64(file);

    // Determinar MIME type
    let mimeType = file.type;
    if (!mimeType) {
      if (file.name.endsWith('.pdf')) {
        mimeType = 'application/pdf';
      } else if (file.name.endsWith('.png')) {
        mimeType = 'image/png';
      } else if (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) {
        mimeType = 'image/jpeg';
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Excel precisa ser convertido para CSV ou processado como imagem
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else {
        mimeType = 'application/octet-stream';
      }
    }

    return { base64, mimeType };
  }

  /**
   * Converter arquivo para base64
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remover prefixo data:image/...;base64,
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  }

  /**
   * Construir prompt de extração otimizado
   */
  private buildExtractionPrompt(businessCategory?: string): string {
    const categoryContext = businessCategory 
      ? `O documento é de um negócio do tipo: ${businessCategory}.`
      : 'Identifique o tipo de negócio (hotel, pousada, restaurante, agência, atração, etc.).';

    return `Você é um especialista em extração de dados de documentos de negócios de turismo.

${categoryContext}

Analise o documento e extraia TODAS as métricas numéricas relevantes encontradas.

TIPOS DE MÉTRICAS A EXTRAIR:
- occupancy: Taxa de ocupação (0-100%)
- revenue: Receita em R$ (valores monetários)
- visitors: Número de visitantes/pessoas
- ticket_avg: Ticket médio em R$
- table_turnover: Giro de mesa (número de vezes)
- pax: Passageiros (para agências)
- adr: Average Daily Rate - Preço médio por diária em R$
- revpar: Revenue per Available Room em R$

INSTRUÇÕES:
1. Identifique datas no documento (formato brasileiro DD/MM/YYYY ou YYYY-MM-DD)
2. Para cada data encontrada, extraia todas as métricas disponíveis
3. Se não houver data específica, use a data mais recente encontrada ou "hoje"
4. Converta todos os valores monetários para número (remova R$, $, vírgulas, etc.)
5. Converta porcentagens para número (ex: 75% = 75)
6. Identifique o tipo de negócio se não foi fornecido

FORMATO DE RESPOSTA (JSON estrito):
{
  "businessCategory": "hotel" | "pousada" | "restaurante" | "agencia" | "atracao" | "outro",
  "confidence": 0.0-1.0,
  "metrics": [
    {
      "metric_type": "occupancy" | "revenue" | "visitors" | "ticket_avg" | "table_turnover" | "pax" | "adr" | "revpar",
      "value": número,
      "metric_date": "YYYY-MM-DD",
      "metadata": {}
    }
  ]
}

IMPORTANTE:
- Retorne APENAS JSON válido, sem markdown, sem explicações
- Se não encontrar métricas, retorne array vazio em "metrics"
- Seja preciso com números e datas
- Não invente dados que não existem no documento`;

  }

  /**
   * Parsear resposta do Gemini (extrair JSON)
   */
  private parseGeminiResponse(responseText: string): any {
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta não contém JSON válido');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    } catch (error) {
      console.error('Erro ao parsear resposta do Gemini:', error);
      return {
        businessCategory: undefined,
        confidence: 0.3,
        metrics: [],
      };
    }
  }

  /**
   * Normalizar e validar métricas extraídas
   */
  private normalizeMetrics(rawMetrics: any[]): ExtractedMetric[] {
    const validTypes = ['occupancy', 'revenue', 'visitors', 'ticket_avg', 'table_turnover', 'pax', 'adr', 'revpar'];
    
    return rawMetrics
      .filter((m: any) => {
        // Validar tipo
        if (!m.metric_type || !validTypes.includes(m.metric_type)) {
          return false;
        }

        // Validar valor
        const value = typeof m.value === 'number' ? m.value : parseFloat(m.value);
        if (isNaN(value) || value < 0) {
          return false;
        }

        // Validar data (formato YYYY-MM-DD)
        if (!m.metric_date || !/^\d{4}-\d{2}-\d{2}$/.test(m.metric_date)) {
          // Tentar converter data brasileira
          const brDate = this.parseBrazilianDate(m.metric_date);
          if (!brDate) {
            // Se não conseguir, usar data de hoje
            m.metric_date = new Date().toISOString().split('T')[0];
          } else {
            m.metric_date = brDate;
          }
        }

        return true;
      })
      .map((m: any) => ({
        metric_type: m.metric_type,
        value: typeof m.value === 'number' ? m.value : parseFloat(m.value),
        metric_date: m.metric_date,
        metadata: m.metadata || {},
      }));
  }

  /**
   * Converter data brasileira (DD/MM/YYYY) para ISO (YYYY-MM-DD)
   */
  private parseBrazilianDate(dateStr: string): string | null {
    try {
      const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (match) {
        const [, day, month, year] = match;
        return `${year}-${month}-${day}`;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Salvar métricas extraídas no banco de dados
   */
  async saveMetrics(
    userId: string,
    documentId: string,
    metrics: ExtractedMetric[]
  ): Promise<{ saved: number; errors: number }> {
    let saved = 0;
    let errors = 0;

    for (const metric of metrics) {
      try {
        const { error } = await supabase
          .from('business_metrics')
          .insert({
            user_id: userId,
            metric_date: metric.metric_date,
            metric_type: metric.metric_type,
            value: metric.value,
            source: 'document_upload',
            document_id: documentId,
            metadata: metric.metadata || {},
          });

        if (error) {
          console.error('Erro ao salvar métrica:', error);
          errors++;
        } else {
          saved++;
        }
      } catch (error) {
        console.error('Erro ao salvar métrica:', error);
        errors++;
      }
    }

    return { saved, errors };
  }
}

// Exportar instância singleton
export const documentProcessor = new DocumentProcessor();

