
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { Skeleton } from '@/components/ui/skeleton';

const ProfileCompletionChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profileComplete, loading, user } = useProfileCompletion();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user) {
      console.log("🔍 PROFILE CHECKER: Verificando perfil", {
        profileComplete,
        currentPath: location.pathname,
        userEmail: user.email
      });

      // Detectar tenant do path atual
      const pathSegments = location.pathname.split('/').filter(Boolean);
      const currentTenant = pathSegments[0]; // 'ms', 'mt', etc.
      const isTenantPath = currentTenant && currentTenant.length === 2;
      
      console.log("🏛️ PROFILE CHECKER: Tenant detectado:", currentTenant, "isTenantPath:", isTenantPath);

      // Rotas que não precisam de perfil completo
      const allowedPaths = [
        '/register', 
        '/login', 
        '/password-reset', 
        '/admin-seed',
        '/admin-login',
        '/auth',
        '/destinos',
        '/eventos',
        '/roteiros',
        '/parceiros',
        '/sobre',
        '/mapa',
        '/guata',
        '/passaporte'
      ];

      // Verificar se é uma rota permitida (com ou sem tenant)
      const isAllowedPath = allowedPaths.some(allowedPath => 
        location.pathname === allowedPath || 
        (isTenantPath && location.pathname === `/${currentTenant}${allowedPath}`)
      );
      
      console.log("✅ PROFILE CHECKER: É rota permitida?", isAllowedPath);
      
      if (profileComplete === false && !isAllowedPath) {
        // Manter contexto do tenant ao redirecionar
        const redirectPath = isTenantPath ? `/${currentTenant}/register` : '/register';
        console.log("🚨 PROFILE CHECKER: Perfil incompleto, redirecionando para", redirectPath);
        navigate(redirectPath);
      }
    }
  }, [profileComplete, loading, user, navigate, location.pathname]);

  // Mostrar loading enquanto verifica o perfil
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProfileCompletionChecker;
