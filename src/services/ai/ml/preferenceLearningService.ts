/**
 * 🎯 PREFERENCE LEARNING SERVICE
 * Aprende preferências do usuário automaticamente das conversas
 */

import { LearningInteraction } from './guataMLService';

export interface UserPreferences {
  travel_style?: 'adventure' | 'relaxation' | 'culture' | 'nature' | 'mixed';
  budget_range?: 'low' | 'medium' | 'high' | 'luxury';
  preferred_destinations: string[];
  interests: string[];
  accessibility_needs: string[];
  language_preference?: 'pt-BR' | 'en' | 'es';
}

export class PreferenceLearningService {
  private readonly DESTINATION_KEYWORDS = [
    'bonito', 'pantanal', 'campo grande', 'corumbá', 'dourados', 
    'três lagoas', 'pontaporã', 'naviraí', 'paranaíba', 'aquidauana',
    'miranda', 'porto murtinho', 'bodoquena', 'jaraguari'
  ];

  private readonly TRAVEL_STYLE_KEYWORDS = {
    adventure: ['aventura', 'radical', 'esportes', 'trilha', 'rapel', 'rafting', 'cachoeira'],
    relaxation: ['relaxar', 'tranquilo', 'calmo', 'spa', 'descanso', 'paz'],
    culture: ['cultura', 'história', 'museu', 'arte', 'tradição', 'folclore'],
    nature: ['natureza', 'ecoturismo', 'observação', 'vida selvagem', 'pássaros', 'animais']
  };

  private readonly BUDGET_KEYWORDS = {
    low: ['barato', 'econômico', 'baixo custo', 'orçamento limitado'],
    medium: ['médio', 'razoável', 'moderado'],
    high: ['luxo', 'premium', 'alto padrão', 'exclusivo']
  };

  private readonly INTEREST_KEYWORDS = [
    'gastronomia', 'comida', 'restaurante', 'culinária',
    'eventos', 'festival', 'show', 'música',
    'hotel', 'hospedagem', 'pousada',
    'passeio', 'atração', 'turismo',
    'clima', 'tempo', 'previsão'
  ];

  /**
   * Aprende preferências de uma interação
   */
  async learnFromInteraction(interaction: LearningInteraction): Promise<boolean> {
    try {
      const question = interaction.question.toLowerCase();
      const answer = interaction.answer.toLowerCase();
      const combinedText = `${question} ${answer}`;

      const preferences: Partial<UserPreferences> = {
        preferred_destinations: [],
        interests: []
      };

      // 1. Detectar destinos mencionados
      const destinations = this.detectDestinations(combinedText);
      if (destinations.length > 0) {
        preferences.preferred_destinations = destinations;
      }

      // 2. Detectar estilo de viagem
      const travelStyle = this.detectTravelStyle(combinedText);
      if (travelStyle) {
        preferences.travel_style = travelStyle;
      }

      // 3. Detectar faixa de orçamento
      const budgetRange = this.detectBudgetRange(combinedText);
      if (budgetRange) {
        preferences.budget_range = budgetRange;
      }

      // 4. Detectar interesses
      const interests = this.detectInterests(combinedText);
      if (interests.length > 0) {
        preferences.interests = interests;
      }

      // 5. Detectar necessidades de acessibilidade
      const accessibilityNeeds = this.detectAccessibilityNeeds(combinedText);
      if (accessibilityNeeds.length > 0) {
        preferences.accessibility_needs = accessibilityNeeds;
      }

      // Retornar true se alguma preferência foi detectada
      const hasPreferences = 
        preferences.preferred_destinations?.length > 0 ||
        preferences.travel_style ||
        preferences.budget_range ||
        preferences.interests?.length > 0 ||
        preferences.accessibility_needs?.length > 0;

      if (hasPreferences) {
        console.log('🎯 Preferências detectadas:', preferences);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Erro ao aprender preferências:', error);
      return false;
    }
  }

  /**
   * Detecta destinos mencionados
   */
  private detectDestinations(text: string): string[] {
    const destinations: string[] = [];
    
    for (const destination of this.DESTINATION_KEYWORDS) {
      if (text.includes(destination)) {
        destinations.push(destination);
      }
    }

    return destinations;
  }

  /**
   * Detecta estilo de viagem
   */
  private detectTravelStyle(text: string): UserPreferences['travel_style'] | undefined {
    for (const [style, keywords] of Object.entries(this.TRAVEL_STYLE_KEYWORDS)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return style as UserPreferences['travel_style'];
        }
      }
    }
    return undefined;
  }

  /**
   * Detecta faixa de orçamento
   */
  private detectBudgetRange(text: string): UserPreferences['budget_range'] | undefined {
    for (const [range, keywords] of Object.entries(this.BUDGET_KEYWORDS)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return range as UserPreferences['budget_range'];
        }
      }
    }
    return undefined;
  }

  /**
   * Detecta interesses
   */
  private detectInterests(text: string): string[] {
    const interests: string[] = [];
    
    for (const interest of this.INTEREST_KEYWORDS) {
      if (text.includes(interest)) {
        interests.push(interest);
      }
    }

    return interests;
  }

  /**
   * Detecta necessidades de acessibilidade
   */
  private detectAccessibilityNeeds(text: string): string[] {
    const needs: string[] = [];
    const accessibilityKeywords = [
      'cadeira de rodas', 'acessível', 'deficiência', 'mobilidade reduzida',
      'rampa', 'elevador', 'banheiro acessível'
    ];

    for (const keyword of accessibilityKeywords) {
      if (text.includes(keyword)) {
        needs.push(keyword);
      }
    }

    return needs;
  }

  /**
   * Extrai preferências de uma interação
   */
  extractPreferences(interaction: LearningInteraction): Partial<UserPreferences> {
    const question = interaction.question.toLowerCase();
    const answer = interaction.answer.toLowerCase();
    const combinedText = `${question} ${answer}`;

    return {
      preferred_destinations: this.detectDestinations(combinedText),
      travel_style: this.detectTravelStyle(combinedText),
      budget_range: this.detectBudgetRange(combinedText),
      interests: this.detectInterests(combinedText),
      accessibility_needs: this.detectAccessibilityNeeds(combinedText)
    };
  }
}

