/**
 * Diagnostic Types
 * Tipos compartilhados para o sistema de diagnóstico
 */

export interface QuestionnaireAnswers {
  business_type: string;
  experience_years: string;
  revenue_monthly: string;
  occupancy_rate: string;
  marketing_channels: string[];
  digital_presence: string;
  customer_service: string;
  main_challenges: string[];
  technology_usage: string[];
  sustainability: string;
  location?: string;
  target_audience?: string;
  seasonality?: string;
  competition_level?: string;
  [key: string]: any; // Para permitir campos adicionais
}

