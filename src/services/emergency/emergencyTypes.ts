// Tipos para o Sistema de Alerta e Emergência do Guatá

export interface EmergencyAlert {
  id: string;
  type: 'weather' | 'health' | 'safety' | 'transport' | 'event';
  location: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  issuedAt: string;
  validUntil?: string;
  source: string; // Ex: INMET, Defesa Civil, Polícia
  contactInfo?: string; // Telefone de emergência
  instructions?: string; // Instruções para turistas
  affectedAreas?: string[]; // Áreas afetadas
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  description: string;
  category: 'police' | 'fire' | 'ambulance' | 'tourism_support' | 'hospital' | 'pharmacy';
  location?: string; // Se for específico de uma cidade
  address?: string;
  available24h?: boolean;
  languages?: string[]; // Idiomas atendidos
}

export interface WeatherAlert {
  id: string;
  location: string;
  type: 'storm' | 'flood' | 'drought' | 'heat' | 'cold';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  issuedAt: string;
  validUntil: string;
  temperature?: {
    min: number;
    max: number;
    unit: 'celsius';
  };
  precipitation?: {
    probability: number; // 0-100%
    amount?: number; // mm
  };
  wind?: {
    speed: number;
    direction: string;
  };
  recommendations: string[];
}

export interface HealthAlert {
  id: string;
  location: string;
  type: 'disease' | 'vaccination' | 'water' | 'food' | 'air';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  issuedAt: string;
  validUntil?: string;
  affectedPopulation?: string;
  symptoms?: string[];
  prevention?: string[];
  treatment?: string[];
  hospitals?: EmergencyContact[];
}

export interface SafetyAlert {
  id: string;
  location: string;
  type: 'crime' | 'road' | 'natural_disaster' | 'civil_unrest';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  issuedAt: string;
  validUntil?: string;
  affectedAreas: string[];
  recommendations: string[];
  emergencyContacts: EmergencyContact[];
}

export interface EmergencyResponse {
  success: boolean;
  alerts?: EmergencyAlert[];
  contacts?: EmergencyContact[];
  weather?: WeatherAlert[];
  health?: HealthAlert[];
  safety?: SafetyAlert[];
  error?: string;
  message?: string;
}

// Configuração do sistema de emergência
export interface EmergencyConfig {
  enabled: boolean;
  autoCheck: boolean;
  checkInterval: number; // minutos
  sources: {
    weather: string[]; // APIs de clima
    health: string[]; // Fontes de saúde
    safety: string[]; // Fontes de segurança
  };
  defaultContacts: EmergencyContact[];
} 