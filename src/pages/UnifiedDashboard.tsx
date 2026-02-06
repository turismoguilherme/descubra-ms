import React from 'react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import UnifiedLoginSystem from '@/components/unified/UnifiedLoginSystem';
import AttendantDashboardRestored from '@/components/cat/AttendantDashboardRestored';
import SecretaryDashboard from '@/components/secretary/SecretaryDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users, Shield, Bot } from 'lucide-react';

const UnifiedDashboard = () => {
  const { user } = useAuth();
  const { userRole, canAccess } = useRoleBasedAccess();

  // Se não estiver logado, mostrar sistema de login
  if (!user) {
    return <UnifiedLoginSystem />;
  }

  // Redirecionar baseado no role do usuário
  switch (userRole) {
    case 'attendant':
    case 'cat_attendant':
      return <Navigate to="/viajar/dashboard" replace />;
    
    case 'secretary':
    case 'gestor_municipal':
      return <Navigate to="/viajar/dashboard" replace />;
    
    case 'private':
    case 'user':
      // Redirecionar para dashboard empresarial com todas as funcionalidades
      return <Navigate to="/viajar/dashboard" replace />;
    
    case 'admin':
      return <Navigate to="/viajar/dashboard" replace />;
    
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="text-center space-y-4">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto" />
              <h2 className="text-xl font-semibold">Role não identificado</h2>
              <p className="text-gray-600">
                Não foi possível identificar seu tipo de usuário.
              </p>
            </CardContent>
          </Card>
        </div>
      );
  }
};

export default UnifiedDashboard;

