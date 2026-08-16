import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { enhancedSecurityService } from "@/services/enhancedSecurityService";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnhancedAuthSecurityProps {
  children: React.ReactNode;
  operationType: 'login' | 'register' | 'admin_operation';
  identifier: string;
  onSecurityPass?: () => void;
  onSecurityFail?: (reason: string) => void;
}

export const EnhancedAuthSecurity: React.FC<EnhancedAuthSecurityProps> = ({
  children,
  operationType,
  identifier,
  onSecurityPass,
  onSecurityFail
}) => {
  const [securityStatus, setSecurityStatus] = useState<{
    level: 'safe' | 'warning' | 'blocked';
    message: string;
    remainingAttempts?: number;
    blockExpiry?: Date;
  }>({ level: 'safe', message: 'Sistema seguro' });
  
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Define rate limiting configs based on operation type
  const getRateLimitConfig = (type: string) => {
    switch (type) {
      case 'login':
        return { maxAttempts: 5, windowMinutes: 15, blockDurationMinutes: 30 };
      case 'register':
        return { maxAttempts: 3, windowMinutes: 60, blockDurationMinutes: 120 };
      case 'admin_operation':
        return { maxAttempts: 3, windowMinutes: 5, blockDurationMinutes: 60 };
      default:
        return { maxAttempts: 5, windowMinutes: 15, blockDurationMinutes: 30 };
    }
  };

  useEffect(() => {
    // Only check on mount, not on every change
    if (identifier && identifier !== 'anonymous') {
      checkSecurityStatus();
    }
  }, []); // Remove dependencies to prevent loops

  const checkSecurityStatus = async () => {
    try {
      setLoading(true);
      const config = getRateLimitConfig(operationType);
      
      const rateLimitCheck = await enhancedSecurityService.checkRateLimit(
        identifier,
        operationType,
        config
      );

      if (!rateLimitCheck.allowed) {
        setSecurityStatus({
          level: 'blocked',
          message: rateLimitCheck.blockExpiry 
            ? `Acesso bloqueado até ${rateLimitCheck.blockExpiry.toLocaleString()}`
            : 'Muitas tentativas. Acesso temporariamente bloqueado.',
          blockExpiry: rateLimitCheck.blockExpiry
        });
        setIsBlocked(true);
        onSecurityFail?.('rate_limit_exceeded');
      } else {
        const remainingAttempts = rateLimitCheck.remainingAttempts || config.maxAttempts;
        
        if (remainingAttempts <= 2) {
          setSecurityStatus({
            level: 'warning',
            message: `Atenção: ${remainingAttempts} tentativas restantes`,
            remainingAttempts
          });
        } else {
          setSecurityStatus({
            level: 'safe',
            message: 'Sistema seguro',
            remainingAttempts
          });
        }
        setIsBlocked(false);
        onSecurityPass?.();
      }

      // Simplify - remove real-time suspicious activity checks

    } catch (error) {
      console.error('Security check failed:', error);
      setSecurityStatus({
        level: 'warning',
        message: 'Erro na verificação de segurança'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityAttempt = async () => {
    await checkSecurityStatus();
  };

  const getSecurityIcon = () => {
    switch (securityStatus.level) {
      case 'safe':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'blocked':
        return <Shield className="w-4 h-4 text-red-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSecurityAlertVariant = () => {
    switch (securityStatus.level) {
      case 'safe':
        return 'default';
      case 'warning':
        return 'default';
      case 'blocked':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Security Status Alert */}
      <Alert variant={getSecurityAlertVariant()}>
        <div className="flex items-center gap-2">
          {getSecurityIcon()}
          <AlertDescription>{securityStatus.message}</AlertDescription>
        </div>
      </Alert>

      {/* Security Enhanced Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {operationType === 'login' && 'Login Seguro'}
            {operationType === 'register' && 'Registro Seguro'}
            {operationType === 'admin_operation' && 'Operação Administrativa'}
          </CardTitle>
          <CardDescription>
            {operationType === 'login' && 'Acesso protegido com validação avançada'}
            {operationType === 'register' && 'Registro protegido com verificação de segurança'}
            {operationType === 'admin_operation' && 'Operação administrativa com auditoria completa'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isBlocked ? (
            <div className="text-center py-8">
              <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 mb-2">
                Acesso Temporariamente Bloqueado
              </h3>
              <p className="text-gray-600 mb-4">
                {securityStatus.message}
              </p>
              <p className="text-sm text-gray-500">
                O acesso será liberado automaticamente após o período de bloqueio.
              </p>
            </div>
          ) : (
            React.cloneElement(children as React.ReactElement, {
              onSecurityAttempt: handleSecurityAttempt,
              securityStatus,
              disabled: isBlocked
            })
          )}
        </CardContent>
      </Card>

      {/* Security Information */}
      {securityStatus.remainingAttempts && securityStatus.remainingAttempts <= 3 && (
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <strong>Aviso de Segurança:</strong> Você tem {securityStatus.remainingAttempts} tentativas restantes 
            antes do bloqueio temporário.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EnhancedAuthSecurity;