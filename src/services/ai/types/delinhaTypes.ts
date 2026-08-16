
/**
 * Informações do usuário para personalização das respostas
 */
export interface DelinhaUserInfo {
  origem?: string;
  interesses?: string[];
  visitouAnteriormente?: boolean;
}

/**
 * Estrutura da resposta da Delinha
 */
export interface DelinhaResponse {
  response: string;
  source?: string;
  threadId?: string;
}

/**
 * Estrutura de erro da resposta
 */
export interface DelinhaErrorResponse {
  error: string;
  details?: any;
}
