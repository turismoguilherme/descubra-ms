
import { MailCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface EmailConfirmationMessageProps {
  email: string;
}

const EmailConfirmationMessage = ({ email }: EmailConfirmationMessageProps) => {
  const { resendConfirmationEmail, loading } = useAuth();

  const handleResendClick = async () => {
    await resendConfirmationEmail(email);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-ms-primary-blue to-ms-pantanal-green p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
                <MailCheck className="h-8 w-8 text-green-600" />
            </div>
        </div>
        <h1 className="text-2xl font-semibold text-ms-primary-blue mb-2">
          Verifique seu e-mail!
        </h1>
        <p className="text-gray-600 mb-6">
          Enviamos um link de confirmação para <strong>{email}</strong>. Por favor, clique no link para ativar sua conta.
        </p>
        <p className="text-sm text-gray-500">
          Não recebeu o e-mail? Verifique sua pasta de spam ou{" "}
          <Button 
            variant="link" 
            className="p-0 h-auto text-ms-primary-blue"
            onClick={handleResendClick}
            disabled={loading}
          >
            {loading ? "Reenviando..." : "clique aqui para reenviar"}
          </Button>.
        </p>
        <div className="mt-8">
            <Link to="/descubramatogrossodosul/login" className="text-ms-primary-blue hover:underline font-medium">
                Voltar para o Login
            </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationMessage;
