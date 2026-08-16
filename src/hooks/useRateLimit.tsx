
import { useState, useCallback } from 'react';
import { securityService } from '@/services/securityService';
import { useToast } from '@/hooks/use-toast';

export const useRateLimit = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const { toast } = useToast();

  const checkRateLimit = async (
    identifier: string, 
    actionType: string, 
    maxAttempts: number = 10, 
    windowMinutes: number = 5
  ): Promise<boolean> => {
    try {
      const allowed = await securityService.checkRateLimit(
        identifier, 
        actionType, 
        maxAttempts, 
        windowMinutes
      );

      if (!allowed) {
        setIsBlocked(true);
        toast({
          title: "Muitas tentativas",
          description: `Aguarde ${windowMinutes} minutos antes de tentar novamente.`,
          variant: "destructive",
        });
        
        // Auto-unblock after window period
        setTimeout(() => {
          setIsBlocked(false);
        }, windowMinutes * 60 * 1000);
      }

      return allowed;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Allow on error
    }
  };

  const clearRateLimit = useCallback((identifier: string, actionType: string) => {
    try {
      const key = `rate_limit_${identifier}_${actionType}`;
      localStorage.removeItem(key);
      setIsBlocked(false);
    } catch (error) {
      console.error('Error clearing rate limit:', error);
    }
  }, []);

  return {
    isBlocked,
    checkRateLimit,
    setIsBlocked,
    clearRateLimit
  };
};
