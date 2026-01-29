/**
 * Common Types
 * Tipos compartilhados para uso em toda a aplicação
 * Especialmente útil para campos JSONB e respostas de API
 */

/**
 * Tipo union para valores JSON válidos
 */
export type JsonValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JsonObject 
  | JsonValue[];

/**
 * Objeto JSON genérico
 */
export interface JsonObject {
  [key: string]: JsonValue;
}

/**
 * Resposta padrão de API
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

/**
 * Resposta do Supabase (compatível com a estrutura padrão)
 */
export interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Estrutura de horário de um dia da semana
 * Suporta múltiplos formatos encontrados nas migrations
 */
export interface DaySchedule {
  start?: string;      // Formato: "08:00"
  end?: string;        // Formato: "18:00"
  open?: string;       // Formato alternativo: "08:00"
  close?: string;      // Formato alternativo: "18:00"
  is_working?: boolean; // Indica se está funcionando neste dia
}

/**
 * Horários de funcionamento
 * Baseado nas estruturas encontradas nas migrations do Supabase
 */
export interface OpeningHours {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

/**
 * Recursos de acessibilidade
 */
export interface AccessibilityFeatures {
  wheelchair_accessible?: boolean;
  accessible_parking?: boolean;
  accessible_restrooms?: boolean;
  braille_signage?: boolean;
  audio_guide?: boolean;
  sign_language?: boolean;
  other?: string[];
  [key: string]: JsonValue | undefined;
}

/**
 * Métodos de pagamento aceitos
 */
export interface PaymentMethods {
  cash?: boolean;
  credit_card?: boolean;
  debit_card?: boolean;
  pix?: boolean;
  bank_transfer?: boolean;
  other?: string[];
  [key: string]: JsonValue | undefined;
}

/**
 * Detalhes de capacidade
 */
export interface CapacityDetails {
  total_capacity?: number;
  current_occupancy?: number;
  max_per_group?: number;
  min_per_group?: number;
  reservation_required?: boolean;
  [key: string]: JsonValue | undefined;
}

/**
 * Certificações e selos de qualidade
 */
export interface Certifications {
  iso?: string[];
  sustainability?: string[];
  accessibility?: string[];
  quality?: string[];
  other?: string[];
  [key: string]: JsonValue | undefined;
}


