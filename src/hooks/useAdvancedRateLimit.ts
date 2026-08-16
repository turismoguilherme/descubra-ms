import { useState, useCallback } from 'react';
import { serverSideSecurityService } from '@/services/serverSideSecurityService';
import { useToast } from '@/hooks/use-toast';

export interface AdvancedRateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
  blockDurationMinutes: number;
  ipAddress?: string;
  userAgent?: string;
}

export const useAdvancedRateLimit = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<'normal' | 'elevated' | 'high'>('normal');
  const [blockExpiry, setBlockExpiry] = useState<Date | null>(null);
  const { toast } = useToast();

  const checkAdvancedRateLimit = useCallback(async (
    identifier: string,
    actionType: string,
    config: AdvancedRateLimitConfig = {
      maxAttempts: 5,
      windowMinutes: 15,
      blockDurationMinutes: 30
    }
  ): Promise<boolean> => {
    try {
      const result = await serverSideSecurityService.checkAdvancedRateLimit(
        identifier,
        actionType,
        {
          ...config,
          ipAddress: config.ipAddress || 'unknown',
          userAgent: config.userAgent || navigator.userAgent
        }
      );

      setSecurityLevel(result.securityLevel);
      setIsBlocked(!result.allowed);

      if (result.blockExpiry) {
        setBlockExpiry(result.blockExpiry);
        const minutesRemaining = Math.ceil((result.blockExpiry.getTime() - Date.now()) / (1000 * 60));
        
        toast({
          title: "🚫 Acesso Bloqueado",
          description: `Muitas tentativas detectadas. Acesso bloqueado por ${minutesRemaining} minutos.`,
          variant: "destructive",
          duration: 10000,
        });
      } else if (result.remainingAttempts && result.remainingAttempts <= 2) {
        toast({
          title: "⚠️ Limite de Tentativas",
          description: `Atenção: ${result.remainingAttempts} tentativas restantes antes do bloqueio.`,
          variant: "destructive",
          duration: 5000,
        });
      }

      // Security level warnings
      if (result.securityLevel === 'elevated') {
        toast({
          title: "🟡 Nível de Segurança Elevado",
          description: "Atividade suspeita detectada. Monitoramento intensificado.",
          variant: "destructive",
          duration: 5000,
        });
      } else if (result.securityLevel === 'high') {
        toast({
          title: "🔴 Alto Risco de Segurança",
          description: "Padrão de atividade perigoso detectado. Operações restritas.",
          variant: "destructive",
          duration: 8000,
        });
      }

      return result.allowed;
    } catch (error) {
      console.error('Advanced rate limit check failed:', error);
      return true; // Fail open
    }
  }, [toast]);

  const clearRateLimit = useCallback(() => {
    setIsBlocked(false);
    setSecurityLevel('normal');
    setBlockExpiry(null);
  }, []);

  const getRemainingBlockTime = useCallback((): number => {
    if (!blockExpiry) return 0;
    const remaining = Math.max(0, blockExpiry.getTime() - Date.now());
    return Math.ceil(remaining / (1000 * 60)); // Minutes
  }, [blockExpiry]);

  return {
    isBlocked,
    securityLevel,
    blockExpiry,
    checkAdvancedRateLimit,
    clearRateLimit,
    getRemainingBlockTime
  };
};