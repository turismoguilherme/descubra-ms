import { ValidatedSearchResult } from '../search/webSearchTypes';
import { geminiClient } from '@/config/gemini';

interface SocialMediaPost {
  id: string;
  title: string;
  content: string;
  url: string;
  platform: 'instagram' | 'facebook' | 'twitter';
  author: string;
  publishedAt: string;
  likes?: number;
  comments?: number;
}

export class SocialMediaService {
  private readonly OFFICIAL_ACCOUNTS = [
    { name: 'Visit MS', handle: '@visitms', platform: 'instagram' },
    { name: 'Fundtur MS', handle: '@fundturms', platform: 'instagram' }
  ];

  async getRecentPosts(query: string): Promise<ValidatedSearchResult[]> {
    try {
      console.log('📱 Buscando posts de redes sociais para:', query);
      
      const results: ValidatedSearchResult[] = [];
      
      for (const account of this.OFFICIAL_ACCOUNTS) {
        try {
          const searchQuery = `${query} ${account.handle}`;
          // Simular busca de posts (implementação temporária)
          const mockPosts = this.generateMockPosts(query, account);
          
          if (mockPosts && Array.isArray(mockPosts)) {
            for (const result of mockPosts.slice(0, 3)) {
              const validatedPost = await this.validatePost(result, query, account);
              if (validatedPost) {
                results.push(validatedPost);
              }
            }
          }
        } catch (error) {
          console.error(`❌ Erro ao buscar posts de ${account.name}:`, error);
        }
      }
      
      return results.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('❌ Erro no serviço de redes sociais:', error);
      return [];
    }
  }

  private async validatePost(post: any, query: string, account: any): Promise<ValidatedSearchResult | null> {
    try {
      const isValid = await this.validateContent(post.content || post.snippet, query);
      const isRecent = this.isPostRecent(post);
      
      if (!isValid || !isRecent) {
        return null;
      }

      const category = await this.categorizePost(post.content || post.snippet);
      
      return {
        title: post.title || `Post de ${account.name}`,
        content: post.content || post.snippet || '',
        url: post.url || '',
        source: {
          name: account.name,
          domain: `${account.platform}.com/${account.handle}`,
          category: 'social',
          priority: 6,
          isOfficial: true,
          description: `Perfil oficial do ${account.name} no ${account.platform}`
        },
        confidence: this.calculateConfidence(post, query),
        category,
        lastUpdated: post.publishedAt || new Date().toISOString(),
        isVerified: true
      };
    } catch (error) {
      console.error('❌ Erro ao validar post:', error);
      return null;
    }
  }

  private async validateContent(content: string, query: string): Promise<boolean> {
    try {
      const prompt = `
        Analise o seguinte post de rede social sobre turismo em MS e verifique:
        1. Se o conteúdo é relevante para: ${query}
        2. Se é um post oficial de uma conta verificada
        3. Se contém informações úteis para turistas
        4. Se não é spam ou conteúdo inadequado
        
        Conteúdo: ${content}
        
        Responda em formato JSON:
        {
          "isValid": boolean,
          "isRelevant": boolean,
          "isOfficial": boolean,
          "confidence": number,
          "reason": string
        }
      `;

      const response = await geminiClient.generateContent(prompt);
      
      if (!response.ok) {
        console.log('❌ Erro na validação de post:', response.error);
        return false;
      }

      // Limpar formatação markdown do JSON
      let jsonText = response.text;
      if (jsonText.includes('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      if (jsonText.includes('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      // Tentar extrair JSON válido
      try {
        const validation = JSON.parse(jsonText);
        return validation.isValid && validation.isRelevant && validation.confidence > 0.6;
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON:', parseError);
        console.error('❌ JSON recebido:', jsonText);
        return false;
      }
      return validation.isValid && validation.isRelevant && validation.confidence > 0.6;
    } catch (error) {
      console.error('❌ Erro na validação de conteúdo:', error);
      return false;
    }
  }

  private isPostRecent(post: any): boolean {
    const publishDate = post.publishedAt || post.date;
    if (!publishDate) return true; // Se não tem data, assume que é recente

    const maxAgeInDays = 30; // Rejeitar posts mais antigos que 30 dias
    const postAge = Math.floor(
      (new Date().getTime() - new Date(publishDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    return postAge <= maxAgeInDays;
  }

  private async categorizePost(content: string): Promise<string> {
    try {
      const prompt = `
        Classifique o seguinte post de rede social sobre turismo em MS:
        
        Conteúdo: ${content}
        
        Responda apenas com uma das seguintes categorias:
        - "roteiro" (se for sobre passeios, destinos, itinerários)
        - "evento" (se for sobre festivais, shows, eventos culturais)
        - "noticia" (se for sobre notícias, anúncios, atualizações)
        - "dica" (se for sobre dicas de viagem, recomendações)
        - "geral" (se não se encaixar nas outras categorias)
      `;

      const response = await geminiClient.generateContent(prompt);
      
      if (!response.ok) {
        return 'geral';
      }

      const category = response.text.trim().toLowerCase();
      const validCategories = ['roteiro', 'evento', 'noticia', 'dica', 'geral'];
      
      return validCategories.includes(category) ? category : 'geral';
    } catch (error) {
      console.error('❌ Erro ao categorizar post:', error);
      return 'geral';
    }
  }

  private calculateConfidence(post: any, query: string): number {
    let confidence = 0.5; // Base
    
    // Aumentar se é de conta oficial
    confidence += 0.3;
    
    // Aumentar se é recente
    if (this.isPostRecent(post)) {
      confidence += 0.2;
    }
    
    // Aumentar se o conteúdo contém palavras-chave da query
    const queryWords = query.toLowerCase().split(' ');
    const content = (post.title + ' ' + (post.content || post.snippet)).toLowerCase();
    
    const matchingWords = queryWords.filter(word => content.includes(word));
    confidence += (matchingWords.length / queryWords.length) * 0.2;
    
    return Math.min(confidence, 1.0);
  }

  private generateMockPosts(query: string, account: any): any[] {
    // Simular posts de redes sociais
    const lowerQuery = query.toLowerCase();
    const mockPosts = [];
    
    if (lowerQuery.includes('bonito') || lowerQuery.includes('passeio')) {
      mockPosts.push({
        title: `Post do ${account.name} sobre ${query}`,
        content: `Descubra as maravilhas de ${query} em Mato Grosso do Sul! 🌟 #turismo #ms #${query.replace(/\s+/g, '')}`,
        url: `https://instagram.com/${account.handle}`,
        publishedAt: new Date().toISOString()
      });
    }
    
    if (lowerQuery.includes('evento') || lowerQuery.includes('festival')) {
      mockPosts.push({
        title: `Evento em MS - ${account.name}`,
        content: `Não perca o próximo evento em Mato Grosso do Sul! 🎉 Confira nossa programação completa. #eventos #ms #turismo`,
        url: `https://instagram.com/${account.handle}`,
        publishedAt: new Date().toISOString()
      });
    }
    
    // Post genérico
    if (mockPosts.length === 0) {
      mockPosts.push({
        title: `Informações de ${account.name}`,
        content: `Confira as melhores dicas sobre ${query} em Mato Grosso do Sul! 💡 #turismo #ms`,
        url: `https://instagram.com/${account.handle}`,
        publishedAt: new Date().toISOString()
      });
    }
    
    return mockPosts;
  }
}

export const socialMediaService = new SocialMediaService();
