/**
 * Rate Limiting Helper para Edge Functions
 * Implementa limitação de taxa usando Map em memória
 */

interface RateLimitEntry {
  count: number;
  timestamp: number;
  blocked?: boolean;
  blockExpiry?: number;
}

// Map em memória para armazenar tentativas
// Nota: Reinicia com cada deploy da Edge Function
const rateLimitMap = new Map<string, RateLimitEntry>();

// Configuração padrão
const DEFAULT_CONFIG = {
  maxAttempts: 5,
  windowMinutes: 15,
  blockDurationMinutes: 30,
};

/**
 * Verifica se uma requisição está dentro do limite de taxa
 * @param identifier - Identificador único (userId, IP, etc)
 * @param actionType - Tipo de ação (para diferentes limites)
 * @param config - Configuração personalizada (opcional)
 * @returns { allowed: boolean, remainingAttempts?: number, blockExpiry?: Date }
 */
export function checkRateLimit(
  identifier: string,
  actionType: string = 'default',
  config = DEFAULT_CONFIG
): { allowed: boolean; remainingAttempts?: number; blockExpiry?: Date } {
  const now = Date.now();
  const key = `rate_limit_${identifier}_${actionType}`;
  const windowMs = config.windowMinutes * 60 * 1000;
  const blockMs = config.blockDurationMinutes * 60 * 1000;

  const stored = rateLimitMap.get(key);

  if (!stored) {
    // Primeira tentativa
    rateLimitMap.set(key, {
      count: 1,
      timestamp: now,
    });
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - 1,
    };
  }

  // Verificar se está bloqueado
  if (stored.blocked && stored.blockExpiry) {
    if (now < stored.blockExpiry) {
      // Ainda bloqueado
      return {
        allowed: false,
        blockExpiry: new Date(stored.blockExpiry),
      };
    } else {
      // Bloqueio expirado, resetar
      rateLimitMap.delete(key);
      rateLimitMap.set(key, {
        count: 1,
        timestamp: now,
      });
      return {
        allowed: true,
        remainingAttempts: config.maxAttempts - 1,
      };
    }
  }

  // Verificar se a janela de tempo expirou
  if (now - stored.timestamp >= windowMs) {
    // Janela expirada, resetar
    rateLimitMap.set(key, {
      count: 1,
      timestamp: now,
    });
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - 1,
    };
  }

  // Dentro da janela, verificar contador
  const newCount = stored.count + 1;

  if (newCount > config.maxAttempts) {
    // Excedeu o limite, bloquear
    const blockExpiry = now + blockMs;
    rateLimitMap.set(key, {
      count: newCount,
      timestamp: stored.timestamp,
      blocked: true,
      blockExpiry,
    });

    return {
      allowed: false,
      blockExpiry: new Date(blockExpiry),
    };
  }

  // Atualizar contador
  rateLimitMap.set(key, {
    count: newCount,
    timestamp: stored.timestamp,
  });

  return {
    allowed: true,
    remainingAttempts: config.maxAttempts - newCount,
  };
}

/**
 * Limpar entradas antigas do rate limit (opcional, para limpeza de memória)
 */
export function cleanupRateLimit(maxAgeMinutes: number = 60): void {
  const now = Date.now();
  const maxAge = maxAgeMinutes * 60 * 1000;

  for (const [key, entry] of rateLimitMap.entries()) {
    const age = now - entry.timestamp;
    if (age > maxAge) {
      rateLimitMap.delete(key);
    }
  }
}

