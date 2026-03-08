/**
 * Document Analysis Service
 * SEGURANÇA: Usa callGeminiProxy e generateContent (Edge Function) em vez de API key direta
 */

import { generateContent } from '@/config/gemini';
import { callGeminiProxy } from './geminiProxy';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface ExtractedData {
  businessName?: string;
  cnpj?: string;
  address?: string;
  phone?: string;
  email?: string;
  revenue?: number;
  expenses?: number;
  profit?: number;
  reservations?: { date: string; quantity: number; revenue: number }[];
  occupancyRate?: number;
  averageDailyRate?: number;
  sales?: { date: string; amount: number; items: number }[];
  averageTicket?: number;
  packages?: { name: string; price: number; sold: number }[];
  visitors?: { date: string; count: number; revenue: number }[];
  [key: string]: any;
}

export interface DocumentAnalysis {
  extractedData: ExtractedData;
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  confidence: number;
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
  async uploadAndAnalyze(
    file: File,
    documentType: 'relatorio' | 'pesquisa' | 'plano' | 'orcamento' | 'other',
    municipalityId?: string
  ): Promise<DocumentInsights> {
    try {
      const storageUrl = await this.uploadToStorage(file, municipalityId);
      const text = await this.extractTextFromFile(file);
      const analysis = await this.analyzeWithGemini(text, file.name, undefined);
      const extractedMetrics = await this.extractMetricsFromDocument(file, text);
      let comparison: ComparisonReport | undefined;
      if (municipalityId) {
        comparison = await this.compareWithSystemData(analysis.extractedData, municipalityId);
      }

      return { analysis, storageUrl, extractedMetrics, comparison, uploadedAt: new Date().toISOString() };
    } catch (error) {
      console.error('Erro ao fazer upload e análise:', error);
      throw error;
    }
  }

  private async uploadToStorage(file: File, municipalityId?: string): Promise<string> {
    const BUCKET_NAME = 'public-documents';
    const fileExt = file.name.split('.').pop();
    const fileName = `${municipalityId || 'general'}/${uuidv4()}.${fileExt}`;

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    return urlData.publicUrl;
  }

  private async extractTextFromFile(file: File): Promise<string> {
    if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
      return await file.text();
    }
    if (file.type.startsWith('image/')) {
      return await this.extractTextFromImage(file);
    }
    return `Documento: ${file.name}\nTipo: ${file.type}\n\nConteúdo precisa ser processado manualmente.`;
  }

  private async extractTextFromImage(file: File): Promise<string> {
    // OCR via edge function not yet supported for images, return placeholder
    return `Imagem: ${file.name}. OCR não disponível via proxy.`;
  }

  async extractMetricsFromDocument(file: File, text?: string): Promise<ExtractedMetrics> {
    try {
      const content = text || await this.extractTextFromFile(file);

      const prompt = `
Analise o seguinte documento e extraia todas as métricas numéricas:

${content.substring(0, 50000)}

Retorne um JSON com:
{
  "numbers": [{"label": "descrição", "value": número, "unit": "unidade"}],
  "dates": ["data1", "data2"],
  "percentages": [{"label": "descrição", "value": porcentagem}],
  "totals": [{"label": "descrição", "value": total}]
}
`;
      const result = await callGeminiProxy(prompt, { temperature: 0.3, maxOutputTokens: 2000 });

      if (result.ok && result.text) {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            numbers: Array.isArray(parsed.numbers) ? parsed.numbers : [],
            dates: Array.isArray(parsed.dates) ? parsed.dates : [],
            percentages: Array.isArray(parsed.percentages) ? parsed.percentages : [],
            totals: Array.isArray(parsed.totals) ? parsed.totals : [],
          };
        }
      }

      return this.extractMetricsBasic(content);
    } catch (error) {
      console.error('Erro ao extrair métricas:', error);
      return this.extractMetricsBasic(text || '');
    }
  }

  private extractMetricsBasic(text: string): ExtractedMetrics {
    const numbers: Array<{ label: string; value: number; unit?: string }> = [];
    const dates: string[] = [];
    const percentages: Array<{ label: string; value: number }> = [];

    const numberMatches = text.match(/\d+[\d.,]*/g);
    if (numberMatches) {
      numberMatches.slice(0, 10).forEach((match, i) => {
        const value = parseFloat(match.replace(',', '.'));
        if (!isNaN(value)) numbers.push({ label: `Número ${i + 1}`, value });
      });
    }

    const dateMatches = text.match(/\d{2}\/\d{2}\/\d{4}/g);
    if (dateMatches) dates.push(...dateMatches);

    const percentMatches = text.match(/\d+[\d.,]*%/g);
    if (percentMatches) {
      percentMatches.forEach((match) => {
        const value = parseFloat(match.replace('%', '').replace(',', '.'));
        if (!isNaN(value)) percentages.push({ label: 'Porcentagem', value });
      });
    }

    return { numbers, dates, percentages, totals: [] };
  }

  async compareWithSystemData(extractedData: ExtractedData, municipalityId: string): Promise<ComparisonReport> {
    const newData: string[] = [];
    const suggestions: string[] = [];

    if (extractedData.revenue) {
      newData.push(`Receita encontrada no documento: R$ ${extractedData.revenue.toLocaleString('pt-BR')}`);
      suggestions.push('Considere atualizar a receita no sistema com este valor');
    }

    if (extractedData.occupancyRate) {
      newData.push(`Taxa de ocupação encontrada: ${extractedData.occupancyRate}%`);
      suggestions.push('Verifique se a taxa de ocupação no sistema está atualizada');
    }

    return { differences: [], newData, inconsistencies: [], suggestions };
  }

  async analyzeDocument(fileContent: string | ArrayBuffer, fileName: string, mimeType: string, businessType?: string): Promise<DocumentAnalysis> {
    const text = typeof fileContent === 'string' ? fileContent : '';
    if (!text || text.trim().length === 0) {
      throw new Error('Não foi possível extrair texto do documento');
    }
    return this.analyzeWithGemini(text, fileName, businessType);
  }

  private async analyzeWithGemini(text: string, fileName: string, businessType?: string): Promise<DocumentAnalysis> {
    const systemPrompt = `Você é um assistente especializado em análise de documentos de negócios de turismo. Analise o documento e retorne JSON com: extractedData, summary, keyPoints, recommendations, confidence, documentType, businessType.`;
    const userPrompt = `Analise: ${fileName}\nTipo de negócio: ${businessType || 'não especificado'}\nConteúdo:\n${text.substring(0, 50000)}`;

    try {
      const response = await generateContent(systemPrompt, userPrompt);

      if (!response.ok || !response.text) {
        throw new Error('Erro ao gerar análise');
      }

      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Resposta não contém JSON válido');

      const analysis = JSON.parse(jsonMatch[0]) as DocumentAnalysis;
      return {
        extractedData: analysis.extractedData || {},
        summary: analysis.summary || 'Análise concluída',
        keyPoints: analysis.keyPoints || [],
        recommendations: analysis.recommendations || [],
        confidence: Math.max(0, Math.min(1, analysis.confidence || 0.5)),
        documentType: analysis.documentType || 'other',
        businessType: analysis.businessType,
      };
    } catch (error) {
      console.error('Erro na análise com Gemini:', error);
      return {
        extractedData: {},
        summary: `Documento "${fileName}" processado com análise limitada.`,
        keyPoints: ['Documento recebido e armazenado'],
        recommendations: ['Revise o conteúdo manualmente'],
        confidence: 0.3,
        documentType: 'other',
      };
    }
  }
}

export const documentAnalysisService = new DocumentAnalysisService();
