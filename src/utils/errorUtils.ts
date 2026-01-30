/**
 * Error Utilities
 * Funções utilitárias para tratamento type-safe de erros
 */

/**
 * Type guard para verificar se um valor é uma instância de Error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Extrai uma mensagem de erro de forma type-safe
 * Aceita Error, objetos com propriedade message, strings ou qualquer outro tipo
 */
export function getErrorMessage(error: unknown, fallback: string = 'Ocorreu um erro desconhecido'): string {
  if (isError(error)) {
    return error.message || fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return fallback;
}

