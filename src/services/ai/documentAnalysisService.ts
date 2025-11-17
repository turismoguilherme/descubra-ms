/**
 * Document Analysis Service
 * Serviço para análise de documentos com IA (Gemini)
 */

import { generateContent } from '@/config/gemini';

export interface ExtractedData {
  // Dados de negócio
  businessName?: string;
  cnpj?: string;
  address?: string;
  phone?: string;
  email?: string;
  
  // Dados financeiros
  revenue?: number;
  expenses?: number;
  profit?: number;
  
  // Dados de reservas/ocupação (hotel/pousada)
  reservations?: {
    date: string;
    quantity: number;
    revenue: number;
  }[];
  occupancyRate?: number;
  averageDailyRate?: number;
  
  // Dados de vendas (restaurante)
  sales?: {
    date: string;
    amount: number;
    items: number;
  }[];
  averageTicket?: number;
  
  // Dados de pacotes (agência)
  packages?: {
    name: string;
    price: number;
    sold: number;
  }[];
  
  // Dados de visitantes (atração)
  visitors?: {
    date: string;
    count: number;
    revenue: number;
  }[];
  
  // Outros dados
  [key: string]: any;
}

export interface DocumentAnalysis {
  extractedData: ExtractedData;
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  confidence: number; // 0-1
  documentType: 'reservations' | 'sales' | 'financial' | 'report' | 'other';
  businessType?: 'hotel' | 'pousada' | 'restaurante' | 'agencia' | 'atracao';
}

export class DocumentAnalysisService {
  /**
   * Analisar documento com IA
   */
  async analyzeDocument(
    fileContent: string | ArrayBuffer,
    fileName: string,
    mimeType: string,
    businessType?: string
  ): Promise<DocumentAnalysis> {
    try {
      console.log('🔍 Iniciando análise de documento:', fileName);

      // Extrair texto do documento
      const text = await this.extractText(fileContent, fileName, mimeType);
      
      if (!text || text.trim().length === 0) {
        throw new Error('Não foi possível extrair texto do documento');
      }

      // Analisar com Gemini
      const analysis = await this.analyzeWithGemini(text, fileName, businessType);

      return analysis;
    } catch (error) {
      console.error('❌ Erro ao analisar documento:', error);
      throw error;
    }
  }

  /**
   * Extrair texto do documento
   */
  private async extractText(
    fileContent: string | ArrayBuffer,
    fileName: string,
    mimeType: string
  ): Promise<string> {
    // Se já for texto, retornar
    if (typeof fileContent === 'string') {
      return fileContent;
    }

    // Para PDFs, Excel, Word, etc., precisaríamos de bibliotecas específicas
    // Por enquanto, retornar string vazia e deixar o Gemini tentar processar
    // TODO: Implementar extração real de PDF/Excel/Word quando necessário
    
    console.log('⚠️ Extração de texto não implementada para:', mimeType);
    return '';
  }

  /**
   * Analisar texto com Gemini
   */
  private async analyzeWithGemini(
    text: string,
    fileName: string,
    businessType?: string
  ): Promise<DocumentAnalysis> {
    const systemPrompt = `Você é um assistente especializado em análise de documentos de negócios de turismo.
Analise o documento fornecido e extraia informações relevantes de forma estruturada.

INSTRUÇÕES:
1. Identifique o tipo de documento (reservas, vendas, financeiro, relatório, etc.)
2. Extraia dados estruturados (números, datas, valores)
3. Identifique o tipo de negócio se possível (hotel, pousada, restaurante, agência, atração)
4. Gere um resumo conciso
5. Liste os principais pontos
6. Forneça recomendações baseadas nos dados

FORMATO DE RESPOSTA (JSON):
{
  "extractedData": {
    "businessName": "nome do negócio se encontrado",
    "cnpj": "CNPJ se encontrado",
    "revenue": número se encontrado,
    "occupancyRate": número se encontrado,
    "reservations": [{"date": "data", "quantity": número, "revenue": número}],
    "sales": [{"date": "data", "amount": número, "items": número}],
    // outros dados relevantes
  },
  "summary": "resumo do documento",
  "keyPoints": ["ponto 1", "ponto 2", ...],
  "recommendations": ["recomendação 1", "recomendação 2", ...],
  "confidence": 0.0-1.0,
  "documentType": "reservations|sales|financial|report|other",
  "businessType": "hotel|pousada|restaurante|agencia|atracao|undefined"
}

IMPORTANTE:
- Seja preciso com números e datas
- Se não encontrar um dado, não invente
- Confidence deve refletir a certeza da extração
- Se o documento não for relevante, retorne confidence baixo`;

    const userPrompt = `Analise o seguinte documento:

Nome do arquivo: ${fileName}
Tipo de negócio: ${businessType || 'não especificado'}

Conteúdo do documento:
${text.substring(0, 50000)} ${text.length > 50000 ? '... (documento truncado)' : ''}

Extraia todas as informações relevantes e retorne no formato JSON especificado.`;

    try {
      const response = await generateContent(systemPrompt, userPrompt);
      
      if (!response.ok || !response.text) {
        throw new Error('Erro ao gerar análise com Gemini');
      }

      // Tentar extrair JSON da resposta
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta do Gemini não contém JSON válido');
      }

      const analysis = JSON.parse(jsonMatch[0]) as DocumentAnalysis;

      // Validar e normalizar
      return {
        extractedData: analysis.extractedData || {},
        summary: analysis.summary || 'Análise concluída',
        keyPoints: analysis.keyPoints || [],
        recommendations: analysis.recommendations || [],
        confidence: Math.max(0, Math.min(1, analysis.confidence || 0.5)),
        documentType: analysis.documentType || 'other',
        businessType: analysis.businessType
      };
    } catch (error) {
      console.error('Erro ao analisar com Gemini:', error);
      
      // Fallback: análise básica
      return {
        extractedData: {},
        summary: 'Não foi possível analisar o documento completamente. Tente novamente ou verifique se o documento está em formato suportado.',
        keyPoints: [],
        recommendations: [],
        confidence: 0.3,
        documentType: 'other',
        businessType: businessType as any
      };
    }
  }

  /**
   * Analisar documento a partir de URL (Supabase Storage)
   */
  async analyzeDocumentFromUrl(
    url: string,
    fileName: string,
    mimeType: string,
    businessType?: string
  ): Promise<DocumentAnalysis> {
    try {
      // Para análise com Gemini, vamos usar a URL diretamente se for uma imagem
      // Para outros tipos, precisaríamos de processamento adicional
      // Por enquanto, vamos tentar analisar o nome e tipo do arquivo
      
      let textContent = '';
      
      // Se for texto, tentar baixar e ler
      if (mimeType?.includes('text') || fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            textContent = await response.text();
          }
        } catch (err) {
          console.warn('Não foi possível ler conteúdo do arquivo:', err);
        }
      }
      
      // Se não tiver conteúdo de texto, usar informações do arquivo
      if (!textContent) {
        textContent = `Documento: ${fileName}\nTipo: ${mimeType || 'desconhecido'}\n\nEste documento precisa ser processado. Por favor, forneça mais detalhes sobre o conteúdo do documento.`;
      }
      
      // Analisar com Gemini
      return await this.analyzeWithGemini(textContent, fileName, businessType);
    } catch (error) {
      console.error('Erro ao analisar documento da URL:', error);
      throw error;
    }
  }

  /**
   * Extrair dados específicos para atualizar metas
   */
  extractDataForGoals(analysis: DocumentAnalysis): {
    occupancy?: number;
    revenue?: number;
    rating?: number;
    [key: string]: any;
  } {
    const data: any = {};

    if (analysis.extractedData.occupancyRate) {
      data.occupancy = analysis.extractedData.occupancyRate;
    }

    if (analysis.extractedData.revenue) {
      data.revenue = analysis.extractedData.revenue;
    }

    // Calcular receita total de reservas
    if (analysis.extractedData.reservations && analysis.extractedData.reservations.length > 0) {
      const totalRevenue = analysis.extractedData.reservations.reduce(
        (sum, r) => sum + (r.revenue || 0),
        0
      );
      if (totalRevenue > 0) {
        data.revenue = totalRevenue;
      }
    }

    // Calcular receita total de vendas
    if (analysis.extractedData.sales && analysis.extractedData.sales.length > 0) {
      const totalRevenue = analysis.extractedData.sales.reduce(
        (sum, s) => sum + (s.amount || 0),
        0
      );
      if (totalRevenue > 0) {
        data.revenue = totalRevenue;
      }
    }

    return data;
  }
}

export const documentAnalysisService = new DocumentAnalysisService();

