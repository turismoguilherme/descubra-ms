import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
}

export const useAutoRetry = (options: RetryOptions = {}) => {
  const { maxRetries = 3, initialDelay = 1000, maxDelay = 5000 } = options;
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();

  const executeWithRetry = useCallback(async (
    action: () => Promise<any>,
    onSuccess?: (result: any) => void,
    onError?: (error: any) => void
  ) => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setIsRetrying(attempt > 0);
        const result = await action();
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        setRetryCount(0);
        setIsRetrying(false);
        return result;
      } catch (error: any) {
        setRetryCount(attempt + 1);
        
        if (attempt < maxRetries) {
          const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
          
          toast({
            title: `Tentativa ${attempt + 1} falhou`,
            description: `Tentando novamente em ${delay / 1000} segundos...`,
            variant: "destructive",
          });
          
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          setIsRetrying(false);
          if (onError) {
            onError(error);
          }
          throw error;
        }
      }
    }
  }, [maxRetries, initialDelay, maxDelay, toast]);

  const resetRetry = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    executeWithRetry,
    retryCount,
    isRetrying,
    resetRetry
  };
};