/**
 * Inventory AI Service
 * SEGURANÇA: Usa callGeminiProxy (Edge Function) em vez de API key direta
 */

import { callGeminiProxy } from './geminiProxy';
import { TourismAttraction } from '../public/inventoryService';

export interface CategorySuggestion {
  category: string;
  confidence: number;
  reasoning: string;
}

export interface AIValidationResult {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
  confidence: number;
}

export class InventoryAIService {
  async autoFillFromNameAndAddress(name: string, address: string): Promise<Partial<TourismAttraction>> {
    // Usar fallback básico (IA temporariamente desabilitada para este fluxo)
    return this.getBasicAutoFill(name, address);
  }

  async classifyCategory(name: string, description: string): Promise<CategorySuggestion> {
    try {
      const prompt = `
Classifique o seguinte atrativo turístico em uma das categorias:
- natural, cultural, gastronomic, adventure, religious, entertainment

Nome: ${name}
Descrição: ${description}

Responda em JSON: { "category": "categoria", "confidence": 0.0-1.0, "reasoning": "explicação breve" }
`;
      const result = await callGeminiProxy(prompt, { temperature: 0.3, maxOutputTokens: 500 });

      if (result.ok && result.text) {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return { category: parsed.category || 'natural', confidence: parsed.confidence || 0.5, reasoning: parsed.reasoning || '' };
        }
      }

      return { category: 'natural', confidence: 0.5, reasoning: 'Não foi possível classificar automaticamente' };
    } catch (error) {
      console.error('Erro ao classificar categoria:', error);
      return { category: 'natural', confidence: 0.5, reasoning: 'Erro ao classificar' };
    }
  }

  async generateDescription(name: string, category: string, location: string): Promise<string> {
    try {
      const prompt = `Crie uma descrição atrativa (100-200 palavras) para o atrativo turístico "${name}" (${category}) em ${location}. Seja convidativo e em português brasileiro.`;
      const result = await callGeminiProxy(prompt, { temperature: 0.8, maxOutputTokens: 500 });
      return result.ok && result.text ? result.text.trim() : `Conheça ${name}, um atrativo ${category} localizado em ${location}.`;
    } catch (error) {
      return `Conheça ${name}, um atrativo ${category} localizado em ${location}.`;
    }
  }

  async suggestTags(name: string, description: string, category: string): Promise<string[]> {
    try {
      const prompt = `Sugira 5-8 tags relevantes para o atrativo turístico "${name}" (${category}): ${description}. Retorne apenas um array JSON de strings.`;
      const result = await callGeminiProxy(prompt, { temperature: 0.5, maxOutputTokens: 300 });
      if (result.ok && result.text) {
        const jsonMatch = result.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      }
      return [category, name.toLowerCase().split(' ')[0]];
    } catch (error) {
      return [category, name.toLowerCase().split(' ')[0]];
    }
  }

  async validateWithAI(inventory: TourismAttraction): Promise<AIValidationResult> {
    try {
      const prompt = `
Analise os dados do atrativo turístico e identifique problemas:
Nome: ${inventory.name}, Descrição: ${inventory.description}, Endereço: ${inventory.address}
Responda em JSON: { "isValid": boolean, "issues": [], "suggestions": [], "confidence": 0.0-1.0 }
`;
      const result = await callGeminiProxy(prompt, { temperature: 0.3, maxOutputTokens: 500 });
      if (result.ok && result.text) {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return { isValid: parsed.isValid !== false, issues: parsed.issues || [], suggestions: parsed.suggestions || [], confidence: parsed.confidence || 0.5 };
        }
      }
      return { isValid: true, issues: [], suggestions: [], confidence: 0.5 };
    } catch (error) {
      return { isValid: true, issues: [], suggestions: [], confidence: 0.5 };
    }
  }

  private getBasicAutoFill(name: string, address: string): Partial<TourismAttraction> {
    return {
      description: `Atrativo turístico localizado em ${address}. ${name} oferece uma experiência única para visitantes.`,
      short_description: `Conheça ${name}, um atrativo turístico em ${address.split(',')[0] || address}.`,
      tags: [name.toLowerCase().split(' ')[0], 'turismo'],
      price_range: 'free',
      opening_hours: '08:00 - 17:00',
      amenities: [],
      coordinates: { lat: -20.4697, lng: -54.6201 },
    } as any;
  }
}

export const inventoryAIService = new InventoryAIService();
