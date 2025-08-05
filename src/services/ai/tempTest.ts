// Teste temporário de exportações

export interface GuataQuery {
  question: string;
  userId?: string;
  context?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface GuataResponse {
  answer: string;
  confidence: number;
  sources: string[];
  timestamp: Date;
  processingTime: number;
  enrichedData?: {
    weather?: any;
    wikipedia?: any;
    scraping?: any;
    ibge?: any;
  };
  verificationStatus: 'verified' | 'partial' | 'unverified';
  learningInsights?: {
    knowledgeGap?: string;
    accuracyImprovement?: number;
    newPattern?: string;
  };
}

export class GuataInteligenteService {
  async processQuery(query: GuataQuery): Promise<GuataResponse> {
    return {
      answer: 'Teste',
      confidence: 0.8,
      sources: ['test'],
      timestamp: new Date(),
      processingTime: 100,
      verificationStatus: 'verified'
    };
  }
}

export const guataInteligenteService = new GuataInteligenteService(); 