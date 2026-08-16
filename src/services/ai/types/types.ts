// Base AI types for the system

export interface AIResponse {
  response: string;
  confidence?: number;
  sources?: string[];
  timestamp?: Date;
  metadata?: any;
}

export interface AIQuery {
  query: string;
  context?: any;
  userInfo?: any;
}