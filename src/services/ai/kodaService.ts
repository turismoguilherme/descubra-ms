/**
 * 🦌 KODA SERVICE - Canadian Travel Guide AI
 * Uses the same infrastructure as Guatá but personalized for Canada
 */

export interface KodaQuery {
  question: string;
  userId?: string;
  sessionId?: string;
  userLocation?: string;
  conversationHistory?: string[];
  userPreferences?: any;
  isFirstUserMessage?: boolean;
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
      // For now, use local knowledge base
      // In production, this would connect to an AI service with Canadian tourism data
      const response = this.generateLocalResponse(question);
      
      return {
        answer: response,
        confidence: 0.85,
        sources: ['local_knowledge'],
        processingTime: Date.now() - startTime,
        learningInsights: {
          questionType: this.detectQuestionType(question),
          userIntent: 'information_seeking'
        },
        adaptiveImprovements: [],
        memoryUpdates: [],
        personality: this.personality.name,
        emotionalState: 'helpful',
        followUpQuestions: this.getFollowUpQuestions(question),
        usedWebSearch: false,
        knowledgeSource: 'local'
      };
    } catch (error) {
      console.error('❌ Error in Koda Service:', error);
      
      return {
        answer: this.getDefaultResponse(),
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

  private generateLocalResponse(questionStr: string): string {
    const question = String(questionStr || '').trim();
    const lowerQuestion = question.toLowerCase();
    
    // Greetings
    if (lowerQuestion.includes('hi') || lowerQuestion.includes('hello') || lowerQuestion.includes('hey') || lowerQuestion.includes('who are') || lowerQuestion.includes('you are')) {
      return `Hey there, friend! I'm Koda, your friendly moose guide to the wonders of Canada! 🦌🍁 I'm here to help you discover everything amazing about the Great White North - from the majestic Rocky Mountains to the beautiful Maritime provinces. What would you like to explore today?`;
    }
    
    // Banff
    if (lowerQuestion.includes('banff')) {
      return `Banff is absolutely stunning! 🏔️ Located in the heart of the Canadian Rockies in Alberta, Banff National Park is Canada's oldest national park. Must-see attractions include Lake Louise with its turquoise waters, Moraine Lake, the Banff Gondola for panoramic views, Johnston Canyon, and the natural hot springs. The best time to visit is June to August for hiking, or December to March for world-class skiing! Would you like tips for any specific activity?`;
    }
    
    // Northern Lights / Aurora
    if (lowerQuestion.includes('northern lights') || lowerQuestion.includes('aurora')) {
      return `Ah, the magical Northern Lights! ✨ Canada offers some of the best aurora viewing in the world. Top spots include Yellowknife in the Northwest Territories (the aurora capital!), Whitehorse in Yukon, Churchill in Manitoba, and Jasper National Park. The best viewing months are September to March, with peak activity around the equinoxes. For the best experience, get away from city lights and choose a clear night. Want to know more about any of these destinations?`;
    }
    
    // Vancouver
    if (lowerQuestion.includes('vancouver')) {
      return `Vancouver is a gem on Canada's Pacific coast! 🌊 This beautiful city offers the perfect blend of urban culture and natural beauty. Explore Stanley Park's seawall, visit Granville Island's public market, take the Sea-to-Sky Highway to Whistler, check out the vibrant neighborhoods of Gastown and Chinatown, and don't miss the stunning views from Grouse Mountain. The city is also famous for its diverse food scene and outdoor activities year-round!`;
    }
    
    // Niagara Falls
    if (lowerQuestion.includes('niagara')) {
      return `Niagara Falls is one of the world's most spectacular natural wonders! 💦 The Canadian side offers the best views of both the Horseshoe Falls and American Falls. Must-do experiences include the Journey Behind the Falls, Hornblower Niagara Cruises (get ready to get wet!), the Skylon Tower observation deck, and the beautiful Niagara Parks. The area also has excellent wineries in the Niagara-on-the-Lake region. Visit in summer for the best weather, or winter to see the falls partially frozen!`;
    }
    
    // Canadian food/cuisine
    if (lowerQuestion.includes('food') || lowerQuestion.includes('cuisine') || lowerQuestion.includes('eat')) {
      return `Canadian cuisine is more diverse than you might think! 🍁 Classic dishes include poutine (fries with cheese curds and gravy - a must-try!), butter tarts, Nanaimo bars, Montreal smoked meat sandwiches, and fresh Atlantic lobster. Each region has its specialties: maple syrup from Quebec, wild salmon from British Columbia, prairie beef from Alberta, and East Coast seafood. Don't forget to try a classic Tim Hortons coffee and donut! Any specific food you'd like to know more about?`;
    }
    
    // Skiing
    if (lowerQuestion.includes('ski') || lowerQuestion.includes('skiing') || lowerQuestion.includes('snowboard')) {
      return `Canada has world-class skiing! ⛷️ Top resorts include Whistler Blackcomb in BC (North America's largest ski area), Lake Louise and Sunshine Village in Banff, Mont-Tremblant in Quebec, and Big White in the Okanagan. The ski season typically runs from November to April, with the best conditions from December to March. Whistler hosted the 2010 Winter Olympics and is famous for its incredible terrain and village atmosphere!`;
    }
    
    // Default response
    return `That's a great question about Canada! 🍁 I can help you discover amazing destinations across this beautiful country - from the Rocky Mountains in the west to the Atlantic coast in the east, from vibrant cities like Toronto, Montreal, and Vancouver to pristine wilderness areas. I know about outdoor adventures, cultural experiences, local cuisine, wildlife, and much more. What aspect of Canada would you like to explore?`;
  }

  private getDefaultResponse(): string {
    return `Hey there! I'm Koda, your friendly Canadian moose guide! 🦌 I'm having a little trouble right now, but I'd love to help you explore Canada. Could you try asking your question again? I can tell you about destinations, activities, food, wildlife, and so much more about the Great White North!`;
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

  private getFollowUpQuestions(question: string): string[] {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('banff') || lowerQuestion.includes('rocky')) {
      return [
        "Want to know about hiking trails?",
        "Interested in wildlife viewing?",
        "Need hotel recommendations?"
      ];
    }
    
    if (lowerQuestion.includes('northern lights') || lowerQuestion.includes('aurora')) {
      return [
        "Want tips for aurora photography?",
        "Interested in Yellowknife tours?",
        "Need info on the best viewing times?"
      ];
    }
    
    return [
      "Want to know more about this?",
      "Can I help with other destinations?",
      "Any other questions about Canada?"
    ];
  }
}

export const kodaService = new KodaService();
