// @ts-nocheck
import { ReactNode, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ForcePasswordChange from './ForcePasswordChange';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  requireRegion?: boolean;
  requireCity?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles = [],
  requireRegion = false,
  requireCity = false
}: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();
  const [mustChangePassword, setMustChangePassword] = useState<boolean | null>(null);
  const [checkingPassword, setCheckingPassword] = useState(true);

  // Verificar se usuário precisa trocar senha
  useEffect(() => {
    const checkPasswordChange = async () => {
      if (!user?.id) {
        setCheckingPassword(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_metadata')
          .select('must_change_password')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao verificar must_change_password:', error);
          setMustChangePassword(false);
        } else {
          setMustChangePassword(data?.must_change_password || false);
        }
      } catch (error) {
        console.error('Erro ao verificar senha:', error);
        setMustChangePassword(false);
      } finally {
        setCheckingPassword(false);
      }
    };

    if (user && !loading) {
      checkPasswordChange();
    } else {
      setCheckingPassword(false);
    }
  }, [user, loading]);

  // Aguardar carregamento inicial
  if (loading || checkingPassword) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Verificar se precisa trocar senha
  if (mustChangePassword === true && user) {
    return (
      <ForcePasswordChange
        onPasswordChanged={() => {
          setMustChangePassword(false);
          window.location.reload();
        }}
      />
    );
  }

  // Verificar autenticação — somente via Supabase Auth
  if (!user) {
    const isViaJARRoute = location.pathname.startsWith('/viajar') || 
                         location.pathname.startsWith('/attendant-dashboard') || 
                         location.pathname.startsWith('/secretary-dashboard') || 
                         location.pathname.startsWith('/private-dashboard') || 
                         location.pathname.startsWith('/unified');
    const loginPath = isViaJARRoute ? '/viajar/login' : '/descubrams/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (!userProfile) {
    const isViaJARRoute = location.pathname.startsWith('/viajar') || 
                         location.pathname.startsWith('/attendant-dashboard') || 
                         location.pathname.startsWith('/secretary-dashboard') || 
                         location.pathname.startsWith('/private-dashboard') || 
                         location.pathname.startsWith('/unified');
    const loginPath = isViaJARRoute ? '/viajar/login' : '/descubrams/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Verificar permissões de role (do perfil real Supabase)
  const userRole = userProfile?.role || 'user';

  if (allowedRoles.length > 0) {
    if (!allowedRoles.includes(userRole)) {
      const isViaJARRoute = location.pathname.startsWith('/viajar') || 
                           location.pathname.startsWith('/attendant-dashboard') || 
                           location.pathname.startsWith('/secretary-dashboard') || 
                           location.pathname.startsWith('/private-dashboard') || 
                           location.pathname.startsWith('/unified');
      const loginPath = isViaJARRoute ? '/viajar/login' : '/descubrams/login';
      return <Navigate to={loginPath} replace />;
    }
  }

  // Verificar região se necessário
  if (requireRegion && !userProfile.region_id) {
    return <Navigate to="/descubrams/select-region" replace />;
  }

  // Verificar cidade se necessário
  if (requireCity && !userProfile.city_id) {
    return <Navigate to="/descubrams/select-city" replace />;
  }

  // Verificações específicas por role
  switch (userRole) {
    case 'master_admin':
      return <>{children}</>;
    case 'state_admin':
      if (!userProfile.region_id) {
        return <Navigate to="/descubrams/select-region" replace />;
      }
      break;
    case 'city_admin':
      if (!userProfile.city_id) {
        return <Navigate to="/descubrams/select-city" replace />;
      }
      break;
    case 'cat_attendant':
      if (!(userProfile as any).cat_id) {
        return <Navigate to="/descubrams/select-cat" replace />;
      }
      break;
    case 'collaborator':
      if (!(userProfile as any).permissions?.length) {
        return <Navigate to="/descubrams/pending-approval" replace />;
      }
      break;
    default:
      break;
  }

  return <>{children}</>;
}
