import React, { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { enhancedSecurityService } from '@/services/enhancedSecurityService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SecurityMiddlewareProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireRole?: string[];
  sensitiveOperation?: string;
  rateLimit?: {
    maxAttempts: number;
    windowMinutes: number;
    blockDurationMinutes: number;
  };
  onSecurityViolation?: (violation: string) => void;
}

export const SecurityMiddleware: React.FC<SecurityMiddlewareProps> = ({
  children,
  requireAuth = false,
  requireRole = [],
  sensitiveOperation,
  rateLimit,
  onSecurityViolation
}) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [securityCheck, setSecurityCheck] = useState<{
    passed: boolean;
    message?: string;
  }>({ passed: false });
  
  const { user } = useAuth();
  const { userRole } = useAuth() as any; // Fix: userRole might not be directly available
  const { toast } = useToast();

  useEffect(() => {
    const performSecurityCheck = async () => {
      setIsLoading(true);
      
      try {
        // Authentication check
        if (requireAuth && !user) {
          setSecurityCheck({
            passed: false,
            message: 'Autenticação necessária'
          });
          onSecurityViolation?.('authentication_required');
          return;
        }

        // Role-based authorization check
        if (requireRole.length > 0 && userRole && !requireRole.includes(userRole)) {
          setSecurityCheck({
            passed: false,
            message: 'Permissões insuficientes'
          });
          onSecurityViolation?.('insufficient_permissions');
          
          // Log security violation
          await enhancedSecurityService.logSecurityEvent({
            action: 'authorization_violation',
            user_id: user?.id,
            success: false,
            error_message: `User with role ${userRole} attempted to access resource requiring ${requireRole.join(', ')}`,
            metadata: {
              required_roles: requireRole,
              user_role: userRole,
              sensitive_operation: sensitiveOperation
            }
          });
          return;
        }

        // Rate limiting check
        if (rateLimit && user?.email) {
          const rateLimitCheck = await enhancedSecurityService.checkRateLimit(
            user.email,
            sensitiveOperation || 'general',
            rateLimit
          );

          if (!rateLimitCheck.allowed) {
            setSecurityCheck({
              passed: false,
              message: rateLimitCheck.blockExpiry 
                ? `Acesso bloqueado até ${rateLimitCheck.blockExpiry.toLocaleTimeString()}`
                : 'Muitas tentativas. Aguarde antes de tentar novamente.'
            });
            onSecurityViolation?.('rate_limit_exceeded');
            
            toast({
              title: "Acesso limitado",
              description: rateLimitCheck.blockExpiry 
                ? `Acesso bloqueado até ${rateLimitCheck.blockExpiry.toLocaleTimeString()}`
                : 'Muitas tentativas. Aguarde antes de tentar novamente.',
              variant: "destructive",
            });
            return;
          }
        }

        // Admin operation validation
        if (sensitiveOperation && requireRole.includes('admin')) {
          const adminValidation = await enhancedSecurityService.validateAdminOperation(
            sensitiveOperation
          );

          if (!adminValidation.authorized) {
            setSecurityCheck({
              passed: false,
              message: 'Operação administrativa não autorizada'
            });
            onSecurityViolation?.('admin_operation_unauthorized');
            return;
          }
        }

        // If all checks pass
        setSecurityCheck({ passed: true });
        setIsAuthorized(true);

        // Log successful security check
        if (sensitiveOperation) {
          await enhancedSecurityService.logSecurityEvent({
            action: `security_check_passed_${sensitiveOperation}`,
            user_id: user?.id,
            success: true,
            metadata: {
              sensitive_operation: sensitiveOperation,
              required_roles: requireRole,
              user_role: userRole
            }
          });
        }

      } catch (error) {
        console.error('Security check error:', error);
        setSecurityCheck({
          passed: false,
          message: 'Erro na verificação de segurança'
        });
        onSecurityViolation?.('security_check_error');
        
        // Log security check error
        await enhancedSecurityService.logSecurityEvent({
          action: 'security_check_error',
          user_id: user?.id,
          success: false,
          error_message: error instanceof Error ? error.message : String(error),
          metadata: {
            sensitive_operation: sensitiveOperation,
            required_roles: requireRole
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    performSecurityCheck();
  }, [user, userRole, requireAuth, requireRole, sensitiveOperation, rateLimit]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Security check failed
  if (!securityCheck.passed) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Acesso Negado
          </div>
          <p className="text-gray-600">{securityCheck.message}</p>
        </div>
      </div>
    );
  }

  // Security check passed, render children
  return <>{children}</>;
};

export default SecurityMiddleware;