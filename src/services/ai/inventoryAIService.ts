/**
 * Inventory AI Service
 * Serviço de IA para preenchimento automático e classificação de inventário turístico
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { TourismAttraction } from '../public/inventoryService';
import { guataGeminiService } from './guataGeminiService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
  }

  /**
   * Preencher dados automaticamente a partir de nome e endereço
   */
  async autoFillFromNameAndAddress(
    name: string,
    address: string
  ): Promise<Partial<TourismAttraction>> {
    try {
      console.log('🤖 INVENTORYAI: Iniciando preenchimento automático para:', { name, address });

      // Tentar usar o guataGeminiService (Edge Function) primeiro
      try {
        console.log('🤖 INVENTORYAI: Tentando usar guataGeminiService...');
        const guataResult = await guataGeminiService.generateContent(this.buildAutoFillPrompt(name, address), 'gemini-2.0-flash-exp', 0.7, 1500);
        console.log('🤖 INVENTORYAI: GuataGeminiService funcionou:', guataResult);

        if (guataResult && guataResult.text) {
          return this.parseAIResponse(guataResult.text);
        }
      } catch (guataError) {
        console.warn('🤖 INVENTORYAI: GuataGeminiService falhou, tentando método direto:', guataError);
      }

      // Fallback para método direto
      if (!this.genAI) {
        console.warn('🤖 INVENTORYAI: Gemini API não configurada, retornando dados básicos');
        return this.getBasicAutoFill(name, address);
      }

      console.log('🤖 INVENTORYAI: Usando método direto com gemini-pro');
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = this.buildAutoFillPrompt(name, address);
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      return this.parseAIResponse(response);
    } catch (error) {
      console.error('❌ INVENTORYAI: Erro ao preencher automaticamente com IA:', error);
      return this.getBasicAutoFill(name, address);
    }
  }

  /**
   * Fallback básico sem IA
   */
  private buildAutoFillPrompt(name: string, address: string): string {
    return `
Você é um assistente especializado em turismo brasileiro. Com base no nome e endereço fornecidos, preencha os dados do atrativo turístico.

Nome: ${name}
Endereço: ${address}

Forneça uma resposta em JSON com os seguintes campos:
{
  "description": "Descrição detalhada e atrativa do local",
  "category": "natural|cultural|gastronomic|adventure|religious|entertainment",
  "tags": ["tag1", "tag2", "tag3"],
  "price_range": "free|low|medium|high",
  "opening_hours": "Horário de funcionamento em formato legível",
  "features": ["feature1", "feature2"],
  "short_description": "Descrição curta (máximo 200 caracteres)",
  "coordinates": {
    "lat": -20.4697,
    "lng": -54.6201
  }
}

IMPORTANTE: Para as coordenadas, use valores aproximados reais baseados no endereço fornecido. Campo Grande-MS tem coordenadas aproximadas de lat: -20.4697, lng: -54.6201. Ajuste esses valores com base na localização específica mencionada no endereço.

Seja específico e baseado em conhecimento real sobre turismo no Brasil, especialmente Mato Grosso do Sul.
`;
  }

  private parseAIResponse(response: string): Partial<TourismAttraction> {
    console.log('🤖 INVENTORYAI: Parsing AI response:', response);

    // Tentar extrair JSON da resposta
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('🤖 INVENTORYAI: JSON parsed successfully:', parsed);

        return {
          description: parsed.description || '',
          category: parsed.category || 'natural',
          tags: parsed.tags || [],
          price_range: parsed.price_range || 'free',
          opening_hours: parsed.opening_hours || '',
          amenities: parsed.features || [],
          short_description: parsed.short_description || '',
          coordinates: parsed.coordinates || { lat: -20.4697, lng: -54.6201 }, // Coordenadas padrão de Campo Grande-MS
        } as any;
      } catch (parseError) {
        console.warn('🤖 INVENTORYAI: Erro ao fazer parse do JSON:', parseError);
      }
    }

    console.log('🤖 INVENTORYAI: Usando fallback básico');
    return this.getBasicAutoFillFromResponse(response);
  }

  private getBasicAutoFill(name: string, address: string): Partial<TourismAttraction> {
    console.log('🤖 INVENTORYAI: Usando basic auto-fill');
    return {
      description: `Atrativo turístico localizado em ${address}. ${name} oferece uma experiência única para visitantes.`,
      short_description: `Conheça ${name}, um atrativo turístico em ${address.split(',')[0] || address}.`,
      tags: [name.toLowerCase().split(' ')[0], 'turismo'],
      price_range: 'free',
      opening_hours: '08:00 - 17:00',
      amenities: [],
      coordinates: { lat: -20.4697, lng: -54.6201 }, // Coordenadas padrão de Campo Grande-MS
    } as any;
  }

  private getBasicAutoFillFromResponse(response: string): Partial<TourismAttraction> {
    // Tentar extrair informações básicas da resposta de texto
    return {
      description: response.substring(0, 500),
      category: 'natural',
      tags: ['turismo'],
      price_range: 'free',
      opening_hours: '08:00 - 18:00',
      amenities: [],
      coordinates: { lat: -20.4697, lng: -54.6201 },
    } as any;
  }

  /**
   * Classificar categoria automaticamente
   */
  async classifyCategory(
    name: string,
    description: string
  ): Promise<CategorySuggestion> {
    try {
      if (!this.genAI) {
        return {
          category: 'natural',
          confidence: 0.5,
          reasoning: 'IA não configurada, usando categoria padrão',
        };
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Classifique o seguinte atrativo turístico em uma das categorias:
- natural (parques, cachoeiras, rios, natureza)
- cultural (museus, igrejas, monumentos, história)
- gastronomic (restaurantes, bares, cafés, comida)
- adventure (esportes, trilhas, aventura)
- religious (igrejas, templos, locais sagrados)
- entertainment (parques, shows, entretenimento)

Nome: ${name}
Descrição: ${description}

Responda em JSON:
{
  "category": "categoria",
  "confidence": 0.0-1.0,
  "reasoning": "explicação breve"
}
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          category: parsed.category || 'natural',
          confidence: parsed.confidence || 0.5,
          reasoning: parsed.reasoning || '',
        };
      }

      return {
        category: 'natural',
        confidence: 0.5,
        reasoning: 'Não foi possível classificar automaticamente',
      };
    } catch (error) {
      console.error('Erro ao classificar categoria:', error);
      return {
        category: 'natural',
        confidence: 0.5,
        reasoning: 'Erro ao classificar',
      };
    }
  }

  /**
   * Gerar descrição automaticamente
   */
  async generateDescription(
    name: string,
    category: string,
    location: string
  ): Promise<string> {
    try {
      if (!this.genAI) {
        return `Conheça ${name}, um atrativo ${category} localizado em ${location}. Uma experiência única espera por você!`;
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Crie uma descrição atrativa e envolvente para o seguinte atrativo turístico:

Nome: ${name}
Categoria: ${category}
Localização: ${location}

A descrição deve:
- Ser entre 100-200 palavras
- Ser atrativa e convidativa
- Destacar características únicas
- Ser em português brasileiro
- Ser adequada para turistas

Apenas retorne a descrição, sem formatação adicional.
`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Erro ao gerar descrição:', error);
      return `Conheça ${name}, um atrativo ${category} localizado em ${location}. Uma experiência única espera por você!`;
    }
  }

  /**
   * Sugerir tags automaticamente
   */
  async suggestTags(
    name: string,
    description: string,
    category: string
  ): Promise<string[]> {
    try {
      if (!this.genAI) {
        return [category, name.toLowerCase().split(' ')[0]];
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Sugira 5-8 tags relevantes para o seguinte atrativo turístico:

Nome: ${name}
Descrição: ${description}
Categoria: ${category}

As tags devem ser:
- Palavras-chave relevantes para busca
- Em português
- Relacionadas ao turismo brasileiro
- Específicas e úteis

Retorne apenas um array JSON de strings:
["tag1", "tag2", "tag3"]
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Array.isArray(parsed) ? parsed : [];
      }

      return [category, name.toLowerCase().split(' ')[0]];
    } catch (error) {
      console.error('Erro ao sugerir tags:', error);
      return [category, name.toLowerCase().split(' ')[0]];
    }
  }

  /**
   * Validar dados com IA
   */
  async validateWithAI(
    inventory: TourismAttraction
  ): Promise<AIValidationResult> {
    try {
      if (!this.genAI) {
        return {
          isValid: true,
          issues: [],
          suggestions: [],
          confidence: 0.5,
        };
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Analise os seguintes dados de um atrativo turístico e identifique problemas e sugestões de melhoria:

Nome: ${inventory.name}
Descrição: ${inventory.description}
Endereço: ${inventory.address}
Categoria: ${inventory.category_id}
Telefone: ${inventory.phone}
Email: ${inventory.email}

Responda em JSON:
{
  "isValid": true/false,
  "issues": ["problema1", "problema2"],
  "suggestions": ["sugestão1", "sugestão2"],
  "confidence": 0.0-1.0
}
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          isValid: parsed.isValid !== false,
          issues: Array.isArray(parsed.issues) ? parsed.issues : [],
          suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
          confidence: parsed.confidence || 0.5,
        };
      }

      return {
        isValid: true,
        issues: [],
        suggestions: [],
        confidence: 0.5,
      };
    } catch (error) {
      console.error('Erro ao validar com IA:', error);
      return {
        isValid: true,
        issues: [],
        suggestions: [],
        confidence: 0.5,
      };
    }
  }
}

export const inventoryAIService = new InventoryAIService();

