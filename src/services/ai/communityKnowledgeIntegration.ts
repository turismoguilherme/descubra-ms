import { CommunitySuggestion } from '@/types/community-contributions';
import { TourismEntity } from '@/services/ai/superTourismAI';

/**
 * 🧠 Serviço de Integração: Comunidade → Guatá IA
 * 
 * Converte sugestões aprovadas da comunidade em conhecimento 
 * útil para o Guatá fazer recomendações aos turistas
 */
export class CommunityKnowledgeIntegration {
  
  /**
   * 🔄 Converte uma sugestão aprovada da comunidade em entidade de conhecimento
   */
  static convertSuggestionToKnowledge(suggestion: CommunitySuggestion): TourismEntity {
    const now = new Date().toISOString();
    
    // Determinar categoria baseada no título/descrição
    const category = this.extractCategory(suggestion.title, suggestion.description);
    
    return {
      id: `community-${suggestion.id}`,
      name: suggestion.title,
      type: category,
      description: suggestion.description,
      location: {
        address: suggestion.location || 'Mato Grosso do Sul',
        city: this.extractCity(suggestion.title, suggestion.description),
        coordinates: this.estimateCoordinates(suggestion.location || '')
      },
      contact: {
        phone: '',
        website: ''
      },
      details: {
        hours: 'Verificar localmente',
        prices: 'Consultar estabelecimento',
        accessibility: 'A confirmar',
        languages: ['Português'],
        payment_methods: ['Dinheiro', 'Cartão'],
        special_info: `💡 Sugestão da comunidade: ${suggestion.description}. Votada ${suggestion.votes_count} vezes pela comunidade local.`
      },
      rating: { 
        average: Math.min(5, 3 + (suggestion.votes_count / 10)), // Base 3 + boost por votos
        reviews: suggestion.votes_count 
      },
      tags: this.extractTags(suggestion.title, suggestion.description),
      lastUpdated: now,
      source: 'community',
      communityApproved: true,
      votesCount: suggestion.votes_count
    };
  }

  /**
   * 🏷️ Extrai categoria baseada no conteúdo
   */
  private static extractCategory(title: string, description: string): 'attraction' | 'restaurant' | 'hotel' | 'event' | 'service' {
    const content = (title + ' ' + description).toLowerCase();
    
    if (content.includes('restaurante') || content.includes('comida') || content.includes('gastronomia') || content.includes('lanche')) {
      return 'restaurant';
    }
    if (content.includes('hotel') || content.includes('pousada') || content.includes('hospedagem')) {
      return 'hotel';
    }
    if (content.includes('evento') || content.includes('festival') || content.includes('show')) {
      return 'event';
    }
    if (content.includes('serviço') || content.includes('atendimento') || content.includes('transporte')) {
      return 'service';
    }
    return 'attraction'; // Padrão para atrações turísticas
  }

  /**
   * 🏙️ Extrai cidade mencionada na sugestão
   */
  private static extractCity(title: string, description: string): string {
    const content = (title + ' ' + description).toLowerCase();
    const cities = ['campo grande', 'bonito', 'corumbá', 'dourados', 'três lagoas', 'ponta porã'];
    
    for (const city of cities) {
      if (content.includes(city)) {
        return city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
    }
    
    return 'Campo Grande'; // Padrão
  }

  /**
   * 📍 Estima coordenadas baseado na localização mencionada
   */
  private static estimateCoordinates(location: string): { lat: number; lng: number } {
    const loc = location.toLowerCase();
    
    // Coordenadas aproximadas das principais cidades de MS
    if (loc.includes('bonito')) return { lat: -21.1293, lng: -56.4891 };
    if (loc.includes('corumbá')) return { lat: -19.0068, lng: -57.6844 };
    if (loc.includes('dourados')) return { lat: -22.2211, lng: -54.8056 };
    if (loc.includes('três lagoas')) return { lat: -20.7511, lng: -51.6782 };
    if (loc.includes('ponta porã')) return { lat: -22.5360, lng: -55.7255 };
    
    // Padrão: Campo Grande
    return { lat: -20.4697, lng: -54.6201 };
  }

  /**
   * 🏷️ Extrai tags relevantes para busca
   */
  private static extractTags(title: string, description: string): string[] {
    const content = (title + ' ' + description).toLowerCase();
    const tags: string[] = ['comunidade', 'sugestão local'];
    
    // Tags de natureza
    if (content.includes('natureza') || content.includes('trilha') || content.includes('cachoeira')) {
      tags.push('natureza', 'ecoturismo');
    }
    
    // Tags de cultura
    if (content.includes('cultura') || content.includes('museu') || content.includes('história')) {
      tags.push('cultura', 'história');
    }
    
    // Tags de gastronomia
    if (content.includes('comida') || content.includes('restaurante') || content.includes('culinária')) {
      tags.push('gastronomia', 'culinária local');
    }
    
    // Tags de aventura
    if (content.includes('aventura') || content.includes('radical') || content.includes('esporte')) {
      tags.push('aventura', 'esporte');
    }
    
    // Tags de família
    if (content.includes('família') || content.includes('criança') || content.includes('parque')) {
      tags.push('família', 'entretenimento');
    }

    return tags;
  }

  /**
   * 📝 Gera texto de recomendação personalizado para o Guatá
   */
  static generateRecommendationText(suggestion: CommunitySuggestion): string {
    return `💡 **Recomendação da Comunidade Local**: ${suggestion.title}
    
${suggestion.description}

✨ **Por que é especial**: Esta sugestão foi compartilhada por moradores locais que conhecem os melhores segredos de Mato Grosso do Sul. Com ${suggestion.votes_count} votos da comunidade, é uma dica autêntica e testada pelos próprios sul-mato-grossenses.

🌟 **Dica local**: Pergunte aos moradores sobre mais detalhes - eles adoram compartilhar suas experiências!`;
  }
}

export default CommunityKnowledgeIntegration; 