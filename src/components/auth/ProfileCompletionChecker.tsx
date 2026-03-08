
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
      const currentTenant = pathSegments[0]; // 'ms', 'descubramatogrossodosul', etc.
      const isDescubraMS = currentTenant === 'descubramatogrossodosul' || currentTenant === 'ms';
      const isTenantPath = isDescubraMS || (currentTenant && currentTenant.length === 2);
      
      console.log("🏛️ PROFILE CHECKER: Tenant detectado:", currentTenant, "isTenantPath:", isTenantPath, "isDescubraMS:", isDescubraMS);

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

      // Rotas ViaJAR que não precisam de verificação de perfil
      const viajarPaths = [
        '/viajar',
        '/viajar/login',
        '/viajar/register',
        '/viajar/dashboard',
        '/viajar/inventario',
        '/viajar/relatorios',
        '/viajar/master-dashboard',
        '/viajar/atendente',
        '/viajar/municipal',
        '/viajar/estadual',
        '/viajar/forgot-password',
        '/viajar/forgot-password',
        '/viajar/precos',
        '/viajar/sobre',
        '/viajar/contato',
        '/relatorios',
        '/inventario-turistico',
        '/dashboard-empresarial'
      ];

      // Verificar se é uma rota permitida (com ou sem tenant)
      const isAllowedPath = allowedPaths.some(allowedPath => 
        location.pathname === allowedPath || 
        (isTenantPath && location.pathname === `/${currentTenant}${allowedPath}`)
      );

      // Verificar se é uma rota ViaJAR (não precisa de verificação de perfil)
      const isViajarPath = viajarPaths.some(viajarPath => 
        location.pathname.startsWith(viajarPath)
      );
      
      console.log("✅ PROFILE CHECKER: É rota permitida?", isAllowedPath);
      console.log("🎯 PROFILE CHECKER: É rota ViaJAR?", isViajarPath);
      
      // Pular verificação de perfil para rotas ViaJAR
      if (isViajarPath) {
        console.log("🚀 PROFILE CHECKER: Rota ViaJAR detectada, pulando verificação de perfil");
        return;
      }
      
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
