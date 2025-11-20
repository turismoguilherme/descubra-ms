/**
 * Document Analysis Service
 * Serviço para análise de documentos com IA (Gemini)
 */

import { generateContent } from '@/config/gemini';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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

export interface DocumentInsights {
  analysis: DocumentAnalysis;
  storageUrl?: string;
  extractedMetrics: ExtractedMetrics;
  comparison?: ComparisonReport;
  uploadedAt: string;
}

export interface ExtractedMetrics {
  numbers: Array<{ label: string; value: number; unit?: string }>;
  dates: string[];
  percentages: Array<{ label: string; value: number }>;
  totals: Array<{ label: string; value: number }>;
}

export interface ComparisonReport {
  differences: Array<{ metric: string; documentValue: number; systemValue: number; difference: number }>;
  newData: string[];
  inconsistencies: string[];
  suggestions: string[];
}

export class DocumentAnalysisService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
  }

  /**
   * Upload e análise completa de documento
   */
  async uploadAndAnalyze(
    file: File,
    documentType: 'relatorio' | 'pesquisa' | 'plano' | 'orcamento' | 'other',
    municipalityId?: string
  ): Promise<DocumentInsights> {
    try {
      // 1. Upload para Supabase Storage
      const storageUrl = await this.uploadToStorage(file, municipalityId);

      // 2. Extrair texto (com OCR se necessário)
      const text = await this.extractTextFromFile(file);

      // 3. Analisar com Gemini
      const analysis = await this.analyzeWithGemini(text, file.name, undefined);

      // 4. Extrair métricas
      const extractedMetrics = await this.extractMetricsFromDocument(file, text);

      // 5. Comparar com dados do sistema (se municipalityId fornecido)
      let comparison: ComparisonReport | undefined;
      if (municipalityId) {
        comparison = await this.compareWithSystemData(analysis.extractedData, municipalityId);
      }

      return {
        analysis,
        storageUrl,
        extractedMetrics,
        comparison,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Erro ao fazer upload e análise:', error);
      throw error;
    }
  }

  /**
   * Upload para Supabase Storage
   */
  private async uploadToStorage(file: File, municipalityId?: string): Promise<string> {
    try {
      const BUCKET_NAME = 'public-documents';
      const fileExt = file.name.split('.').pop();
      const fileName = `${municipalityId || 'general'}/${uuidv4()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }
  }

  /**
   * Extrair texto do arquivo (com OCR se necessário)
   */
  private async extractTextFromFile(file: File): Promise<string> {
    // Se for texto, ler diretamente
    if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
      return await file.text();
    }

    // Se for imagem, usar Gemini Vision para OCR
    if (file.type.startsWith('image/')) {
      return await this.extractTextFromImage(file);
    }

    // Para PDFs, Word, Excel - por enquanto retornar nome do arquivo
    // TODO: Implementar extração real quando necessário
    return `Documento: ${file.name}\nTipo: ${file.type}\n\nConteúdo precisa ser processado manualmente ou com biblioteca especializada.`;
  }

  /**
   * Extrair texto de imagem usando Gemini Vision
   */
  private async extractTextFromImage(file: File): Promise<string> {
    try {
      if (!this.genAI) {
        return `Imagem: ${file.name}. OCR não disponível (Gemini não configurado).`;
      }

      // Converter arquivo para base64
      const base64 = await this.fileToBase64(file);

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
      
      const result = await model.generateContent([
        {
          inlineData: {
            data: base64,
            mimeType: file.type,
          },
        },
        'Extraia todo o texto desta imagem/documento. Se for um documento escaneado, transcreva todo o conteúdo. Se for uma foto, descreva o que vê.',
      ]);

      return result.response.text();
    } catch (error) {
      console.error('Erro ao extrair texto de imagem:', error);
      return `Imagem: ${file.name}. Não foi possível extrair texto.`;
    }
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
   * Extrair métricas de documento
   */
  async extractMetricsFromDocument(file: File, text?: string): Promise<ExtractedMetrics> {
    try {
      const content = text || await this.extractTextFromFile(file);

      if (!this.genAI) {
        return this.extractMetricsBasic(content);
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Analise o seguinte documento e extraia todas as métricas numéricas encontradas:

${content.substring(0, 50000)}

Retorne um JSON com:
{
  "numbers": [{"label": "descrição", "value": número, "unit": "unidade"}],
  "dates": ["data1", "data2"],
  "percentages": [{"label": "descrição", "value": porcentagem}],
  "totals": [{"label": "descrição", "value": total}]
}

Seja preciso e extraia apenas números que realmente aparecem no documento.
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          numbers: Array.isArray(parsed.numbers) ? parsed.numbers : [],
          dates: Array.isArray(parsed.dates) ? parsed.dates : [],
          percentages: Array.isArray(parsed.percentages) ? parsed.percentages : [],
          totals: Array.isArray(parsed.totals) ? parsed.totals : [],
        };
      }

      return this.extractMetricsBasic(content);
    } catch (error) {
      console.error('Erro ao extrair métricas:', error);
      return this.extractMetricsBasic(text || '');
    }
  }

  /**
   * Extração básica de métricas (fallback)
   */
  private extractMetricsBasic(text: string): ExtractedMetrics {
    const numbers: Array<{ label: string; value: number; unit?: string }> = [];
    const dates: string[] = [];
    const percentages: Array<{ label: string; value: number }> = [];
    const totals: Array<{ label: string; value: number }> = [];

    // Extrair números básicos
    const numberMatches = text.match(/\d+[\d.,]*/g);
    if (numberMatches) {
      numberMatches.slice(0, 10).forEach((match, i) => {
        const value = parseFloat(match.replace(',', '.'));
        if (!isNaN(value)) {
          numbers.push({ label: `Número ${i + 1}`, value });
        }
      });
    }

    // Extrair datas (formato brasileiro)
    const dateMatches = text.match(/\d{2}\/\d{2}\/\d{4}/g);
    if (dateMatches) {
      dates.push(...dateMatches);
    }

    // Extrair porcentagens
    const percentMatches = text.match(/\d+[\d.,]*%/g);
    if (percentMatches) {
      percentMatches.forEach((match) => {
        const value = parseFloat(match.replace('%', '').replace(',', '.'));
        if (!isNaN(value)) {
          percentages.push({ label: 'Porcentagem', value });
        }
      });
    }

    return { numbers, dates, percentages, totals };
  }

  /**
   * Comparar dados extraídos com dados do sistema
   */
  async compareWithSystemData(
    extractedData: ExtractedData,
    municipalityId: string
  ): Promise<ComparisonReport> {
    try {
      // TODO: Buscar dados reais do município do Supabase
      // Por enquanto, retornar comparação básica
      
      const differences: Array<{ metric: string; documentValue: number; systemValue: number; difference: number }> = [];
      const newData: string[] = [];
      const inconsistencies: string[] = [];
      const suggestions: string[] = [];

      // Comparar receita se disponível
      if (extractedData.revenue) {
        // TODO: Buscar receita do sistema
        newData.push(`Receita encontrada no documento: R$ ${extractedData.revenue.toLocaleString('pt-BR')}`);
        suggestions.push('Considere atualizar a receita no sistema com este valor');
      }

      // Comparar ocupação se disponível
      if (extractedData.occupancyRate) {
        newData.push(`Taxa de ocupação encontrada: ${extractedData.occupancyRate}%`);
        suggestions.push('Verifique se a taxa de ocupação no sistema está atualizada');
      }

      return {
        differences,
        newData,
        inconsistencies,
        suggestions,
      };
    } catch (error) {
      console.error('Erro ao comparar com dados do sistema:', error);
      return {
        differences: [],
        newData: [],
        inconsistencies: [],
        suggestions: [],
      };
    }
  }

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

