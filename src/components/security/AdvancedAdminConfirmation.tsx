import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { enhancedSecurityService } from "@/services/enhancedSecurityService";
import { Badge } from "@/components/ui/badge";

interface AdvancedAdminConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  operationType: string;
  confirmationText?: string;
  requirePassword?: boolean;
  cooldownSeconds?: number;
  onConfirm: () => Promise<void>;
  severity: "low" | "medium" | "high" | "critical";
}

export const AdvancedAdminConfirmation: React.FC<AdvancedAdminConfirmationProps> = ({
  open,
  onOpenChange,
  title,
  description,
  operationType,
  confirmationText = "CONFIRMAR",
  requirePassword = true,
  cooldownSeconds = 10,
  onConfirm,
  severity = "medium"
}) => {
  const { user } = useAuth();
  const [confirmInput, setConfirmInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [operationAuthorized, setOperationAuthorized] = useState(false);
  const [securityCheck, setSecurityCheck] = useState<any>(null);

  // Cooldown timer
  useEffect(() => {
    if (open && severity === "critical") {
      setCooldownRemaining(cooldownSeconds);
      const interval = setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [open, severity, cooldownSeconds]);

  // Validate admin operation on open
  useEffect(() => {
    if (open) {
      validateOperation();
    }
  }, [open]);

  const validateOperation = async () => {
    setIsVerifying(true);
    try {
      const validation = await enhancedSecurityService.validateAdminOperation(
        operationType,
        'security_confirmation',
        user?.id
      );
      
      setOperationAuthorized(validation.authorized);
      
      // Check for suspicious activity
      const suspiciousActivity = await enhancedSecurityService.detectSuspiciousActivity();
      setSecurityCheck(suspiciousActivity);

      // Log the validation attempt
      await enhancedSecurityService.logSecurityEvent({
        action: 'advanced_admin_confirmation_requested',
        user_id: user?.id,
        success: validation.authorized,
        metadata: {
          operation_type: operationType,
          severity,
          suspicious_activity: suspiciousActivity.suspicious,
          audit_id: validation.auditId
        }
      });

    } catch (error) {
      console.error('Operation validation failed:', error);
      setOperationAuthorized(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirm = async () => {
    if (!canConfirm()) return;

    try {
      setIsVerifying(true);
      
      // Log confirmation attempt
      await enhancedSecurityService.logSecurityEvent({
        action: 'advanced_admin_confirmation_submitted',
        user_id: user?.id,
        success: true,
        metadata: {
          operation_type: operationType,
          severity,
          confirmation_timestamp: new Date().toISOString()
        }
      });

      // Execute the operation
      await onConfirm();
      
      // Log successful execution
      await enhancedSecurityService.logSecurityEvent({
        action: 'critical_admin_operation_executed',
        user_id: user?.id,
        success: true,
        metadata: {
          operation_type: operationType,
          severity,
          execution_timestamp: new Date().toISOString()
        }
      });

      onOpenChange(false);
      resetForm();
      
    } catch (error) {
      console.error('Operation execution failed:', error);
      
      await enhancedSecurityService.logSecurityEvent({
        action: 'critical_admin_operation_failed',
        user_id: user?.id,
        success: false,
        error_message: error instanceof Error ? error.message : String(error),
        metadata: {
          operation_type: operationType,
          severity
        }
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resetForm = () => {
    setConfirmInput("");
    setPasswordInput("");
    setCooldownRemaining(0);
    setOperationAuthorized(false);
    setSecurityCheck(null);
  };

  const canConfirm = () => {
    const confirmationValid = confirmInput.toUpperCase() === confirmationText.toUpperCase();
    const cooldownComplete = severity !== "critical" || cooldownRemaining === 0;
    const passwordValid = !requirePassword || passwordInput.length > 0;
    
    return operationAuthorized && confirmationValid && cooldownComplete && passwordValid;
  };

  const getSeverityColor = () => {
    switch (severity) {
      case "low": return "bg-blue-500";
      case "medium": return "bg-yellow-500";
      case "high": return "bg-orange-500";
      case "critical": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getSeverityIcon = () => {
    switch (severity) {
      case "low": return <CheckCircle className="w-4 h-4" />;
      case "medium": return <AlertTriangle className="w-4 h-4" />;
      case "high": return <Shield className="w-4 h-4" />;
      case "critical": return <AlertTriangle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Shield className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Severity Badge */}
          <div className="flex items-center gap-2">
            <Badge className={`${getSeverityColor()} text-white`}>
              {getSeverityIcon()}
              <span className="ml-1">Nível: {severity.toUpperCase()}</span>
            </Badge>
            {securityCheck?.suspicious && (
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Atividade Suspeita
              </Badge>
            )}
          </div>

          {/* Security Status */}
          {isVerifying ? (
            <Alert>
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <AlertDescription>Verificando autorização de segurança...</AlertDescription>
              </div>
            </Alert>
          ) : !operationAuthorized ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Operação não autorizada. Verifique suas permissões administrativas.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">
                Operação autorizada. Prossiga com a confirmação.
              </AlertDescription>
            </Alert>
          )}

          {/* Suspicious Activity Warning */}
          {securityCheck?.suspicious && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atividade suspeita detectada:</strong>
                <ul className="mt-1 text-sm">
                  {securityCheck.patterns.map((pattern: string, idx: number) => (
                    <li key={idx}>• {pattern}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Cooldown Timer */}
          {severity === "critical" && cooldownRemaining > 0 && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Período de reflexão obrigatório:</strong> {cooldownRemaining} segundos restantes.
                <br />Este tempo permite reconsiderar operações críticas.
              </AlertDescription>
            </Alert>
          )}

          {operationAuthorized && (
            <>
              {/* Confirmation Text Input */}
              <div className="space-y-2">
                <Label>Para confirmar, digite: <strong>{confirmationText}</strong></Label>
                <Input
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder={`Digite "${confirmationText}" para confirmar`}
                  disabled={isVerifying}
                />
              </div>

              {/* Password Confirmation */}
              {requirePassword && (
                <div className="space-y-2">
                  <Label>Confirme sua senha administrativa</Label>
                  <Input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Digite sua senha para confirmar"
                    disabled={isVerifying}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="destructive" 
                  onClick={handleConfirm}
                  disabled={!canConfirm() || isVerifying}
                  className="flex-1"
                >
                  {isVerifying ? "Executando..." : "Confirmar Operação"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    onOpenChange(false);
                    resetForm();
                  }}
                  className="flex-1"
                  disabled={isVerifying}
                >
                  Cancelar
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedAdminConfirmation;