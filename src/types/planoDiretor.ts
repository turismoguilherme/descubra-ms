/**
 * Types for Plano Diretor de Turismo
 */

export interface IASuggestion {
  id: string;
  type: 'objetivo' | 'estrategia' | 'acao' | 'descricao' | 'valor';
  title: string;
  content: string;
  confidence?: number;
  source?: string;
  metadata?: Record<string, any>;
}


