
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

      // Rotas que não precisam de perfil completo
      const allowedPaths = [
        '/register', 
        '/login', 
        '/password-reset', 
        '/admin-seed',
        '/admin-login',
        '/complete-profile' // Adiciona a nova página à lista de permissões
      ];

      const isAllowedPath = allowedPaths.includes(location.pathname);
      
      if (profileComplete === false && !isAllowedPath) {
        console.log("🚨 PROFILE CHECKER: Perfil incompleto, redirecionando para /complete-profile");
        navigate('/complete-profile');
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
