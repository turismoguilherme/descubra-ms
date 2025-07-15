
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { Skeleton } from '@/components/ui/skeleton';

const ProfileCompletionChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profileComplete, loading, user } = useProfileCompletion();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Só verificar se não está carregando e tem usuário
    if (!loading && user && profileComplete === false) {
      const allowedPaths = [
        '/register', 
        '/login', 
        '/password-reset', 
        '/admin-seed',
        '/admin-login',
        '/complete-profile',
        '/admin-user-management'
      ];

      const isAllowedPath = allowedPaths.includes(location.pathname);
      
      // Só redirecionar se não está numa rota permitida
      if (!isAllowedPath) {
        navigate('/complete-profile');
      }
    }
  }, [profileComplete, loading, user, location.pathname, navigate]);

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
