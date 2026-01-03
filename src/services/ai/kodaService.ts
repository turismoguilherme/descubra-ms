/**
 * 🦌 KODA SERVICE - Canadian Travel Guide AI
 * Uses Gemini API + Web Search + Cache (sustainable and intelligent)
 */

import { kodaGeminiService, KodaGeminiQuery, KodaGeminiResponse } from "./kodaGeminiService";

export interface KodaQuery {
  question: string;
  userId?: string;
  sessionId?: string;
  userLocation?: string;
  conversationHistory?: string[];
  userPreferences?: any;
  isFirstUserMessage?: boolean;
  language?: 'en' | 'fr';
}

export interface KodaResponse {
  answer: string;
  confidence: number;
  sources: string[];
  processingTime: number;
  learningInsights: any;
  adaptiveImprovements: string[];
  memoryUpdates: any[];
  personality: string;
  emotionalState: string;
  followUpQuestions: string[];
  usedWebSearch: boolean;
  knowledgeSource: 'local' | 'web' | 'hybrid';
}

class KodaService {
  private personality = {
    name: "Koda",
    species: "moose",
    role: "Canadian travel guide specialist",
    traits: ["knowledgeable", "helpful", "friendly", "passionate about Canada", "adventurous", "warm"],
    speakingStyle: "conversational, warm and welcoming",
    emotions: ["enthusiastic", "helpful", "proud", "curious", "excited"]
  };

  async processQuestion(query: KodaQuery): Promise<KodaResponse> {
    const startTime = Date.now();
    const question = String(query.question || '').trim();
    
    try {
      // Usar Gemini Service (com cache + web search)
      const geminiQuery: KodaGeminiQuery = {
        question: question,
        userId: query.userId,
        sessionId: query.sessionId,
        userLocation: query.userLocation || 'Canada',
        conversationHistory: query.conversationHistory,
        language: query.language || 'en'
      };

      const geminiResponse: KodaGeminiResponse = await kodaGeminiService.processQuestion(geminiQuery);
      
      return {
        answer: geminiResponse.answer,
        confidence: geminiResponse.confidence,
        sources: geminiResponse.sources,
        processingTime: geminiResponse.processingTime,
        learningInsights: {
          questionType: this.detectQuestionType(question),
          userIntent: 'information_seeking',
          detectedLanguage: geminiResponse.detectedLanguage,
          responseLanguage: geminiResponse.responseLanguage
        },
        adaptiveImprovements: [],
        memoryUpdates: [],
        personality: this.personality.name,
        emotionalState: 'helpful',
        followUpQuestions: this.getFollowUpQuestions(question, geminiResponse.responseLanguage),
        usedWebSearch: geminiResponse.usedWebSearch,
        knowledgeSource: geminiResponse.usedWebSearch ? 'web' : 'hybrid'
      };
    } catch (error) {
      console.error('❌ Error in Koda Service:', error);
      
      return {
        answer: this.getDefaultResponse(query.language || 'en'),
        confidence: 0.5,
        sources: ['fallback'],
        processingTime: Date.now() - startTime,
        learningInsights: { questionType: 'error' },
        adaptiveImprovements: [],
        memoryUpdates: [],
        personality: this.personality.name,
        emotionalState: 'apologetic',
        followUpQuestions: [],
        usedWebSearch: false,
        knowledgeSource: 'local'
      };
    }
  }

  private getDefaultResponse(language: 'en' | 'fr' = 'en'): string {
    const messages = {
      'en': "Hey there! I'm Koda, your friendly Canadian moose guide! 🦌 I'm having a little trouble right now, but I'd love to help you explore Canada. Could you try asking your question again? I can tell you about destinations, activities, food, wildlife, and so much more about the Great White North!",
      'fr': "Salut! Je suis Koda, votre guide orignal canadien! 🦌 J'ai un petit problème en ce moment, mais j'aimerais vous aider à explorer le Canada. Pourriez-vous reformuler votre question? Je peux vous parler de destinations, activités, nourriture, faune et bien plus sur le Grand Nord blanc!"
    };
    return messages[language] || messages['en'];
  }

  private detectQuestionType(question: string): string {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('hotel') || lowerQuestion.includes('stay') || lowerQuestion.includes('accommodation')) return 'accommodation';
    if (lowerQuestion.includes('restaurant') || lowerQuestion.includes('food') || lowerQuestion.includes('eat')) return 'dining';
    if (lowerQuestion.includes('event') || lowerQuestion.includes('festival')) return 'events';
    if (lowerQuestion.includes('tour') || lowerQuestion.includes('visit') || lowerQuestion.includes('see')) return 'tourism';
    if (lowerQuestion.includes('weather') || lowerQuestion.includes('climate') || lowerQuestion.includes('temperature')) return 'weather';
    
    return 'general';
  }

  private getFollowUpQuestions(question: string, language: string = 'en'): string[] {
    const lowerQuestion = question.toLowerCase();
    
    const questions: Record<string, Record<string, string[]>> = {
      'en': {
        'banff': [
          "Want to know about hiking trails?",
          "Interested in wildlife viewing?",
          "Need hotel recommendations?"
        ],
        'aurora': [
          "Want tips for aurora photography?",
          "Interested in Yellowknife tours?",
          "Need info on the best viewing times?"
        ],
        'default': [
          "Want to know more about this?",
          "Can I help with other destinations?",
          "Any other questions about Canada?"
        ]
      },
      'fr': {
        'banff': [
          "Voulez-vous connaître les sentiers de randonnée?",
          "Intéressé par l'observation de la faune?",
          "Besoin de recommandations d'hôtels?"
        ],
        'aurora': [
          "Voulez-vous des conseils pour la photographie des aurores?",
          "Intéressé par les visites de Yellowknife?",
          "Besoin d'informations sur les meilleurs moments pour voir?"
        ],
        'default': [
          "Voulez-vous en savoir plus?",
          "Puis-je aider avec d'autres destinations?",
          "D'autres questions sur le Canada?"
        ]
      }
    };

    const langQuestions = questions[language] || questions['en'];
    
    if (lowerQuestion.includes('banff') || lowerQuestion.includes('rocky')) {
      return langQuestions['banff'] || langQuestions['default'];
    }
    
    if (lowerQuestion.includes('northern lights') || lowerQuestion.includes('aurora')) {
      return langQuestions['aurora'] || langQuestions['default'];
    }
    
    return langQuestions['default'];
  }
}

export const kodaService = new KodaService();
