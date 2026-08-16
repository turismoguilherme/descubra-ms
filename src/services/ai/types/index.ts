// Centralized types export for AI services

// Main AI types
export * from './types';
export * from './delinhaTypes';
export * from './guataTypes';

// Predictive analysis types
export interface PredictiveInsight {
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk';
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendations?: string[];
}

export interface DemandForecast {
  location: string;
  timeframe: string;
  predictedDemand: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

// Additional common types
export interface WebSearchResult {
  title: string;
  url: string;
  content: string;
  snippet?: string;
  source: string;
  category: string; // Made required to match ValidatedSearchResult
  lastUpdated: string;
  confidence: number;
}

export interface ValidatedSearchResult extends WebSearchResult {
  category: string; // This is already included in WebSearchResult now
}

// Verification result types
export interface VerificationResult {
  isValid: boolean;
  confidence?: number;
  partnerPriority?: number;
  errors?: string[];
  warnings?: string[];
}