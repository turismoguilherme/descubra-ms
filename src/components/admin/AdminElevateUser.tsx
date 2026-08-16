import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { elevateToAdmin } from "@/utils/elevateToAdmin";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { securityAuditService } from "@/services/securityAuditService";

export const AdminElevateUser = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleElevateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Digite um email válido");
      return;
    }

    // Validação adicional de segurança
    const confirmElevation = confirm(
      `⚠️ OPERAÇÃO CRÍTICA: Você está elevando o usuário "${email}" para administrador. Esta ação será auditada e não pode ser desfeita facilmente. Confirma?`
    );
    
    if (!confirmElevation) {
      await securityAuditService.logSecurityEvent({
        action: 'admin_elevation_cancelled',
        success: false,
        errorMessage: 'User cancelled admin elevation',
        metadata: { targetEmail: email }
      });
      return;
    }

    setIsLoading(true);
    try {
      // Log da tentativa
      await securityAuditService.logSecurityEvent({
        action: 'admin_elevation_attempt',
        success: true,
        metadata: { targetEmail: email }
      });

      await elevateToAdmin(email);
      setEmail("");
      
      // Log do sucesso
      await securityAuditService.logSecurityEvent({
        action: 'admin_elevation_success',
        success: true,
        metadata: { targetEmail: email }
      });
      
    } catch (error) {
      console.error("Erro ao elevar usuário:", error);
      toast.error("Erro ao elevar usuário");
      
      // Log do erro
      await securityAuditService.logSecurityEvent({
        action: 'admin_elevation_error',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        metadata: { targetEmail: email }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Elevar Usuário para Admin
        </CardTitle>
        <CardDescription className="text-orange-700">
          ⚠️ OPERAÇÃO CRÍTICA: Esta ação concede privilégios administrativos completos e será auditada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleElevateUser} className="space-y-4">
          <Input
            type="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !email}
            className="w-full"
          >
            {isLoading ? "Processando..." : "Elevar para Admin"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};