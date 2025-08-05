import { geminiClient } from '@/config/gemini';

interface SeoSuggestions {
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
}

interface ContentInput {
  name: string;
  description?: string;
  type: 'route' | 'destination' | 'event';
}

class SeoOptimizationService {
  private async generateSeoPrompt(content: ContentInput): Promise<string> {
    let prompt = `Como um especialista em SEO e turismo, gere um título SEO (até 60 caracteres), uma meta descrição (até 160 caracteres) e uma lista de 5 a 10 palavras-chave relevantes para o seguinte ${content.type}:

Tipo de Conteúdo: ${content.type}
Nome: ${content.name}
Descrição: ${content.description || ''}

Formato da Resposta:
SEO Title: [Título SEO]
Meta Description: [Meta Descrição]
Keywords: [palavra-chave1], [palavra-chave2], [palavra-chave3], ...
`;

    return prompt;
  }

  private parseSeoResponse(rawText: string): SeoSuggestions {
    const seoTitleMatch = rawText.match(/SEO Title: (.*)/);
    const metaDescriptionMatch = rawText.match(/Meta Description: (.*)/);
    const keywordsMatch = rawText.match(/Keywords: (.*)/);

    const seoTitle = seoTitleMatch ? seoTitleMatch[1].trim() : '';
    const metaDescription = metaDescriptionMatch ? metaDescriptionMatch[1].trim() : '';
    const keywords = keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [];

    return {
      seoTitle,
      metaDescription,
      keywords,
    };
  }

  /**
   * Gera sugestões de SEO para um roteiro.
   * @param name Nome do roteiro.
   * @param description Descrição do roteiro.
   * @returns Sugestões de SEO (título, meta descrição, palavras-chave).
   */
  async generateRouteSeo(name: string, description?: string): Promise<SeoSuggestions> {
    const prompt = await this.generateSeoPrompt({ name, description, type: 'route' });
    const rawResponse = await geminiClient.generateContent(prompt);
    
    if (!rawResponse.ok) {
      throw new Error(`Erro na geração de SEO: ${rawResponse.error}`);
    }
    
    return this.parseSeoResponse(rawResponse.text!);
  }

  /**
   * Gera sugestões de SEO para um destino/ponto de interesse.
   * @param name Nome do destino.
   * @param description Descrição do destino.
   * @returns Sugestões de SEO (título, meta descrição, palavras-chave).
   */
  async generateDestinationSeo(name: string, description?: string): Promise<SeoSuggestions> {
    const prompt = await this.generateSeoPrompt({ name, description, type: 'destination' });
    const rawResponse = await geminiClient.generateContent(prompt);
    
    if (!rawResponse.ok) {
      throw new Error(`Erro na geração de SEO: ${rawResponse.error}`);
    }
    
    return this.parseSeoResponse(rawResponse.text!);
  }

  /**
   * Gera sugestões de SEO para um evento.
   * @param name Nome do evento.
   * @param description Descrição do evento.
   * @returns Sugestões de SEO (título, meta descrição, palavras-chave).
   */
  async generateEventSeo(name: string, description?: string): Promise<SeoSuggestions> {
    const prompt = await this.generateSeoPrompt({ name, description, type: 'event' });
    const rawResponse = await geminiClient.generateContent(prompt);
    
    if (!rawResponse.ok) {
      throw new Error(`Erro na geração de SEO: ${rawResponse.error}`);
    }
    
    return this.parseSeoResponse(rawResponse.text!);
  }

  // Futuramente, se houver, pode-se adicionar um método para notícias (articles/news)
  // async generateNewsSeo(name: string, description?: string): Promise<SeoSuggestions> {
  //   const prompt = await this.generateSeoPrompt({ name, description, type: 'news' });
  //   const rawResponse = await geminiClient.generateContent(prompt);
  //   return this.parseSeoResponse(rawResponse);
  // }
}

export const seoOptimizationService = new SeoOptimizationService(); 