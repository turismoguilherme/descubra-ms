
/**
 * Representa um item na base de conhecimento da IA
 */
export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string;
  lastUpdated: string;
}

/**
 * Categorias de conhecimento disponíveis
 */
export type KnowledgeCategory = "destinos" | "informações" | "eventos" | "gastronomia" | "atrações";

/**
 * Tipos de mensagem que podem ser trocadas com a IA
 */
export interface AIMessage {
  id: number;
  texto: string;
  isBot: boolean;
  source?: string;
  error?: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

/**
 * Status de conexão com a API
 */
export interface APIStatus {
  connected: boolean;
  lastCheck: Date;
  error?: string;
  retryCount?: number;
}

/**
 * Configurações da IA
 */
export interface AIConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  language?: string;
}
