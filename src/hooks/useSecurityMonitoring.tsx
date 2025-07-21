import { useEffect, useCallback } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { securityAuditService } from '@/services/securityAuditService';
import { ENV } from '@/config/environment';

/**
 * Hook para monitoramento contínuo de segurança
 */
export const useSecurityMonitoring = () => {
  const auth = useAuth();
  const { user } = auth || { user: null };

  // Monitorar tentativas de acesso não autorizado
  const monitorUnauthorizedAccess = useCallback(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Verificar integridade da sessão quando a página volta ao foco
        const isValid = securityAuditService.validateSessionIntegrity();
        if (!isValid && user) {
          securityAuditService.reportSecurityViolation({
            type: 'invalid_access',
            severity: 'medium',
            description: 'Session integrity check failed',
            userId: user.id
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  // Detectar tentativas de manipulação do localStorage
  const monitorStorageManipulation = useCallback(() => {
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;

    localStorage.setItem = function(key: string, value: string) {
      // Monitorar modificações em chaves sensíveis
      if (key.includes('auth') || key.includes('token') || key.includes('secure_')) {
        securityAuditService.logSecurityEvent({
          action: 'localStorage_modification',
          userId: user?.id,
          success: true,
          metadata: { key, operation: 'setItem' }
        });
      }
      return originalSetItem.call(this, key, value);
    };

    localStorage.removeItem = function(key: string) {
      if (key.includes('auth') || key.includes('token') || key.includes('secure_')) {
        securityAuditService.logSecurityEvent({
          action: 'localStorage_removal',
          userId: user?.id,
          success: true,
          metadata: { key, operation: 'removeItem' }
        });
      }
      return originalRemoveItem.call(this, key);
    };

    return () => {
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
    };
  }, [user]);

  // Monitorar tentativas de console access em produção
  const monitorConsoleAccess = useCallback(() => {
    if (process.env.NODE_ENV === 'production') {
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      // Detectar uso excessivo do console
      let consoleUsageCount = 0;
      const resetUsageCount = () => { consoleUsageCount = 0; };
      const usageInterval = setInterval(resetUsageCount, 60000); // Reset a cada minuto

      const monitorConsoleUsage = (method: string) => {
        consoleUsageCount++;
        if (consoleUsageCount > ENV.RATE_LIMIT.REQUESTS_PER_MINUTE) {
          securityAuditService.reportSecurityViolation({
            type: 'suspicious_activity',
            severity: 'low',
            description: 'Excessive console usage detected',
            userId: user?.id,
            metadata: { consoleMethod: method, usageCount: consoleUsageCount }
          });
        }
      };

      console.log = function(...args) {
        monitorConsoleUsage('log');
        return originalLog.apply(this, args);
      };

      console.error = function(...args) {
        monitorConsoleUsage('error');
        return originalError.apply(this, args);
      };

      console.warn = function(...args) {
        monitorConsoleUsage('warn');
        return originalWarn.apply(this, args);
      };

      return () => {
        clearInterval(usageInterval);
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
      };
    }
  }, [user]);

  // Detectar tentativas de DevTools
  const monitorDevTools = useCallback(() => {
    if (process.env.NODE_ENV === 'production') {
      let devtools = { open: false };
      
      setInterval(() => {
        if (window.outerHeight - window.innerHeight > 200 || 
            window.outerWidth - window.innerWidth > 200) {
          if (!devtools.open) {
            devtools.open = true;
            securityAuditService.logSecurityEvent({
              action: 'devtools_opened',
              userId: user?.id,
              success: true,
              metadata: { 
                timestamp: Date.now(),
                windowDimensions: {
                  inner: { width: window.innerWidth, height: window.innerHeight },
                  outer: { width: window.outerWidth, height: window.outerHeight }
                }
              }
            });
          }
        } else {
          devtools.open = false;
        }
      }, 500);
    }
  }, [user]);

  useEffect(() => {
    const cleanupFunctions = [
      monitorUnauthorizedAccess(),
      monitorStorageManipulation(),
      monitorConsoleAccess(),
      monitorDevTools()
    ].filter((fn): fn is () => void => typeof fn === 'function');

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [monitorUnauthorizedAccess, monitorStorageManipulation, monitorConsoleAccess, monitorDevTools]);

  return {
    reportViolation: securityAuditService.reportSecurityViolation.bind(securityAuditService),
    logEvent: securityAuditService.logSecurityEvent.bind(securityAuditService),
    securityCleanup: securityAuditService.securityCleanup.bind(securityAuditService)
  };
};