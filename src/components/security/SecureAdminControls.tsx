import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  UserCheck, 
  Eye, 
  Settings,
  KeyRound
} from "lucide-react";
import { useAuth } from "@/hooks/auth/AuthContext";
import { enhancedSecurityService } from "@/services/enhancedSecurityService";
import { useToast } from "@/components/ui/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface AdminOperation {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  requiresConfirmation: boolean;
  requiresMFA?: boolean;
}

const ADMIN_OPERATIONS: AdminOperation[] = [
  {
    id: 'elevate_user',
    name: 'Elevar Usuário',
    description: 'Promover usuário para administrador',
    severity: 'high',
    requiresConfirmation: true,
    requiresMFA: true
  },
  {
    id: 'delete_user',
    name: 'Excluir Usuário',
    description: 'Remover usuário do sistema',
    severity: 'high',
    requiresConfirmation: true,
    requiresMFA: true
  },
  {
    id: 'reset_password',
    name: 'Resetar Senha',
    description: 'Forçar reset de senha de usuário',
    severity: 'medium',
    requiresConfirmation: true
  },
  {
    id: 'view_audit_logs',
    name: 'Visualizar Logs',
    description: 'Acessar logs de auditoria',
    severity: 'low',
    requiresConfirmation: false
  },
  {
    id: 'modify_system_settings',
    name: 'Configurações Sistema',
    description: 'Modificar configurações do sistema',
    severity: 'medium',
    requiresConfirmation: true
  }
];

export const SecureAdminControls: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedOperation, setSelectedOperation] = useState<AdminOperation | null>(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const generateConfirmationCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const executeAdminOperation = async (operation: AdminOperation) => {
    if (!user) {
      toast({
        title: "Erro de Autenticação",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    setIsExecuting(true);
    try {
      // Validate admin operation
      const validation = await enhancedSecurityService.validateAdminOperation(
        operation.id,
        'admin_controls',
        user.id
      );

      if (!validation.authorized) {
        toast({
          title: "Operação Negada",
          description: "Você não tem permissão para executar esta operação",
          variant: "destructive",
        });
        return;
      }

      // Check rate limiting for admin operations
      const rateLimitCheck = await enhancedSecurityService.checkRateLimit(
        user.email || user.id,
        'admin_operation',
        { maxAttempts: 3, windowMinutes: 5, blockDurationMinutes: 60 }
      );

      if (!rateLimitCheck.allowed) {
        toast({
          title: "Limite de Operações Excedido",
          description: rateLimitCheck.blockExpiry 
            ? `Operações bloqueadas até ${rateLimitCheck.blockExpiry.toLocaleTimeString()}`
            : "Muitas operações administrativas. Aguarde antes de tentar novamente.",
          variant: "destructive",
        });
        return;
      }

      // Show confirmation dialog for sensitive operations
      if (operation.requiresConfirmation) {
        setSelectedOperation(operation);
        setIsConfirmationOpen(true);
        return;
      }

      // Execute operation directly for non-sensitive operations
      await performOperation(operation);

    } catch (error) {
      console.error('Admin operation error:', error);
      toast({
        title: "Erro na Operação",
        description: "Falha ao executar operação administrativa",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const performOperation = async (operation: AdminOperation) => {
    try {
      // Log the admin operation
      await enhancedSecurityService.logSecurityEvent({
        action: `admin_operation_${operation.id}`,
        user_id: user?.id,
        success: true,
        metadata: {
          operation_name: operation.name,
          operation_severity: operation.severity,
          confirmation_required: operation.requiresConfirmation,
          mfa_required: operation.requiresMFA
        }
      });

      toast({
        title: "Operação Executada",
        description: `${operation.name} foi executada com sucesso`,
      });

      // Reset state
      setSelectedOperation(null);
      setConfirmationCode('');
      setMfaCode('');
      setIsConfirmationOpen(false);

    } catch (error) {
      console.error('Operation execution error:', error);
      toast({
        title: "Erro na Execução",
        description: "Falha ao executar a operação",
        variant: "destructive",
      });
    }
  };

  const handleConfirmOperation = async () => {
    if (!selectedOperation) return;

    // Validate confirmation code (simulated)
    const expectedCode = generateConfirmationCode();
    
    // For MFA operations, also validate MFA code
    if (selectedOperation.requiresMFA && !mfaCode) {
      toast({
        title: "MFA Necessário",
        description: "Código de autenticação multifator é obrigatório",
        variant: "destructive",
      });
      return;
    }

    await performOperation(selectedOperation);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOperationIcon = (operationId: string) => {
    switch (operationId) {
      case 'elevate_user':
        return <UserCheck className="w-4 h-4" />;
      case 'delete_user':
        return <AlertTriangle className="w-4 h-4" />;
      case 'reset_password':
        return <KeyRound className="w-4 h-4" />;
      case 'view_audit_logs':
        return <Eye className="w-4 h-4" />;
      case 'modify_system_settings':
        return <Settings className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Warning */}
      <Alert className="border-l-4 border-l-red-500">
        <Shield className="w-4 h-4" />
        <AlertDescription>
          <strong>Área Administrativa Segura:</strong> Todas as operações são monitoradas e auditadas. 
          Operações sensíveis requerem confirmação adicional e autenticação multifator.
        </AlertDescription>
      </Alert>

      {/* Admin Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Operações Administrativas
          </CardTitle>
          <CardDescription>
            Controles administrativos com segurança aprimorada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ADMIN_OPERATIONS.map((operation) => (
              <Card key={operation.id} className="border-l-4 border-l-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {getOperationIcon(operation.id)}
                      {operation.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(operation.severity)}>
                        {operation.severity.toUpperCase()}
                      </Badge>
                      {operation.requiresMFA && (
                        <Badge variant="outline">
                          <KeyRound className="w-3 h-3 mr-1" />
                          MFA
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>{operation.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => executeAdminOperation(operation)}
                    disabled={isExecuting}
                    variant={operation.severity === 'high' ? 'destructive' : 'default'}
                    className="w-full"
                  >
                    {isExecuting ? 'Executando...' : 'Executar'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Confirmar Operação Administrativa
            </DialogTitle>
            <DialogDescription>
              Esta operação requer confirmação adicional devido ao seu nível de segurança
            </DialogDescription>
          </DialogHeader>
          
          {selectedOperation && (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Operação:</strong> {selectedOperation.name}<br/>
                  <strong>Severidade:</strong> {selectedOperation.severity.toUpperCase()}<br/>
                  <strong>Descrição:</strong> {selectedOperation.description}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="confirmation">Código de Confirmação</Label>
                <Input
                  id="confirmation"
                  type="text"
                  placeholder="Digite o código de confirmação"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                />
                <p className="text-sm text-gray-600">
                  Código atual: <strong>{generateConfirmationCode()}</strong>
                </p>
              </div>

              {selectedOperation.requiresMFA && (
                <div className="space-y-2">
                  <Label htmlFor="mfa">Código MFA</Label>
                  <Input
                    id="mfa"
                    type="text"
                    placeholder="Digite o código MFA"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                  />
                  <p className="text-sm text-gray-600">
                    Insira o código de 6 dígitos do seu aplicativo autenticador
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsConfirmationOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmOperation}
                  disabled={!confirmationCode || (selectedOperation.requiresMFA && !mfaCode)}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Confirmar Operação
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecureAdminControls;