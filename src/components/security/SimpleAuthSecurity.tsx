import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface SimpleAuthSecurityProps {
  children: React.ReactNode;
  operationType: 'login' | 'register' | 'admin_operation';
}

export const SimpleAuthSecurity: React.FC<SimpleAuthSecurityProps> = ({
  children,
  operationType
}) => {
  const getTitle = () => {
    switch (operationType) {
      case 'login':
        return 'Login';
      case 'register':
        return 'Registro';
      case 'admin_operation':
        return 'Operação Administrativa';
      default:
        return 'Acesso';
    }
  };

  const getDescription = () => {
    switch (operationType) {
      case 'login':
        return 'Faça login para acessar sua conta';
      case 'register':
        return 'Crie sua conta para começar';
      case 'admin_operation':
        return 'Acesso restrito para administradores';
      default:
        return 'Sistema de acesso seguro';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          {getTitle()}
        </CardTitle>
        <CardDescription>
          {getDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default SimpleAuthSecurity;