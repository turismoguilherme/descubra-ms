
import React from "react";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { supabase } from "@/integrations/supabase/client";

interface SecurityValidatorProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'tech' | 'gestor' | 'municipal' | 'municipal_manager' | 'atendente';
  fallback?: React.ReactNode;
}

export const SecurityValidator: React.FC<SecurityValidatorProps> = ({
  children,
  requiredRole,
  fallback = <div>Acesso negado</div>
}) => {
  const { userRole, isAuthenticated, loading } = useSecureAuth();

  if (loading) {
    return <div>Verificando permissões...</div>;
  }

  if (!isAuthenticated) {
    return fallback;
  }

  if (requiredRole && userRole !== requiredRole && !['admin', 'tech'].includes(userRole || '')) {
    return fallback;
  }

  return <>{children}</>;
};

export const validateSecureOperation = async (operation: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Log security validation attempt
    await supabase.rpc('log_security_event', {
      p_user_id: user.id,
      p_action: `security_validation_${operation}`,
      p_success: true,
      p_metadata: {
        operation,
        timestamp: new Date().toISOString(),
        source: 'SecurityValidator'
      }
    });

    return true;
  } catch (error) {
    console.error('Security validation error:', error);
    return false;
  }
};

export default SecurityValidator;
