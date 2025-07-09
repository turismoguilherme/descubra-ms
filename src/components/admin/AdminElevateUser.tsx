import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { elevateToAdmin } from "@/utils/elevateToAdmin";
import { toast } from "sonner";

export const AdminElevateUser = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleElevateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Digite um email válido");
      return;
    }

    setIsLoading(true);
    try {
      await elevateToAdmin(email);
      setEmail("");
    } catch (error) {
      console.error("Erro ao elevar usuário:", error);
      toast.error("Erro ao elevar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Elevar Usuário para Admin</CardTitle>
        <CardDescription>
          Digite o email do usuário que deseja tornar administrador
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