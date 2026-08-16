// Tipos para o sistema de Machine Learning e Personalização

export interface UserPreference {
  id: string;
  userId: string;
  category: 'attraction' | 'hotel' | 'restaurant' | 'activity' | 'location';
  itemId: string;
  itemName: string;
  rating: number; // 1-5
  interactionType: 'view' | 'like' | 'dislike' | 'book' | 'search' | 'feedback';
  timestamp: string;
  context?: {
    location?: string;
    interests?: string[];
    budget?: string;
    groupSize?: number;
    season?: string;
  };
}

export interface UserProfile {
  id: string;
  userId: string;
  preferences: {
    locations: string[];
    interests: string[];
    budget: 'budget' | 'moderate' | 'luxury';
    travelStyle: 'adventure' | 'relaxation' | 'culture' | 'family' | 'romantic' | 'business';
    groupSize: number;
    preferredSeasons: string[];
  };
  behavior: {
    averageRating: number;
    totalInteractions: number;
    favoriteCategories: string[];
    searchPatterns: string[];
    feedbackHistory: {
      positive: number;
      negative: number;
      total: number;
    };
  };
  lastUpdated: string;
}

export interface MLRecommendation {
  id: string;
  userId: string;
  itemId: string;
  itemName: string;
  category: string;
  confidence: number; // 0-1
  reason: string;
  score: number; // Score calculado pelo algoritmo
  timestamp: string;
}

export interface MLModel {
  id: string;
  name: string;
  version: string;
  type: 'collaborative' | 'content-based' | 'hybrid';
  accuracy: number;
  lastTrained: string;
  parameters: {
    learningRate: number;
    epochs: number;
    batchSize: number;
  };
  status: 'training' | 'active' | 'inactive';
}

export interface MLTrainingData {
  id: string;
  userId: string;
  interactions: UserPreference[];
  profile: UserProfile;
  recommendations: MLRecommendation[];
  feedback: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface MLPrediction {
  userId: string;
  recommendations: MLRecommendation[];
  confidence: number;
  modelUsed: string;
  timestamp: string;
}

export interface MLFeedback {
  id: string;
  userId: string;
  recommendationId: string;
  rating: number; // 1-5
  feedback: 'helpful' | 'not_helpful' | 'neutral';
  comment?: string;
  timestamp: string;
}

export interface MLConfig {
  enabled: boolean;
  autoLearning: boolean;
  minInteractions: number;
  confidenceThreshold: number;
  updateInterval: number; // minutos
  models: {
    collaborative: boolean;
    contentBased: boolean;
    hybrid: boolean;
  };
  features: {
    locationPreference: boolean;
    interestMatching: boolean;
    budgetOptimization: boolean;
    seasonalAdjustment: boolean;
    groupSizeConsideration: boolean;
  };
} 