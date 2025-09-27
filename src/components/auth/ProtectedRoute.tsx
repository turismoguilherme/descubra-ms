import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

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

  // Aguardar carregamento inicial
  if (loading) {
    console.log('🔐 ProtectedRoute: loading=true, aguardando...');
    return <div>Carregando...</div>;
  }

  // Verificar autenticação
  if (!user) {
    console.warn('🔐 ProtectedRoute: usuário não autenticado. Redirecionando para /ms/login', { from: location.pathname });
    return <Navigate to="/ms/login" state={{ from: location }} replace />;
  }

  // Verificar perfil do usuário
  if (!userProfile) {
    console.warn('🔐 ProtectedRoute: userProfile ausente. Redirecionando para /ms/complete-profile', { from: location.pathname });
    return <Navigate to="/ms/complete-profile" state={{ from: location }} replace />;
  }

  // Verificar permissões de role
  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile.role)) {
    console.warn('🔐 ProtectedRoute: role não permitida.', { role: userProfile.role, allowedRoles, from: location.pathname });
    return <Navigate to="/ms/unauthorized" replace />;
  }

  // Verificar região se necessário
  if (requireRegion && !userProfile.region_id) {
    console.warn('🔐 ProtectedRoute: requireRegion habilitado e region_id ausente. Redirecionando para /ms/select-region', { from: location.pathname });
    return <Navigate to="/ms/select-region" replace />;
  }

  // Verificar cidade se necessário
  if (requireCity && !userProfile.city_id) {
    console.warn('🔐 ProtectedRoute: requireCity habilitado e city_id ausente. Redirecionando para /ms/select-city', { from: location.pathname });
    return <Navigate to="/ms/select-city" replace />;
  }

  // Verificações específicas por role
  switch (userProfile.role) {
    case 'master_admin':
      console.log('🔐 ProtectedRoute: acesso total (master_admin)');
      return <>{children}</>;

    case 'state_admin':
      if (!userProfile.region_id) {
        console.warn('🔐 ProtectedRoute: state_admin sem region_id. Redirecionando para /ms/select-region');
        return <Navigate to="/ms/select-region" replace />;
      }
      break;

    case 'city_admin':
      if (!userProfile.city_id) {
        console.warn('🔐 ProtectedRoute: city_admin sem city_id. Redirecionando para /ms/select-city');
        return <Navigate to="/ms/select-city" replace />;
      }
      break;

    case 'cat_attendant':
      if (!userProfile.cat_id) {
        console.warn('🔐 ProtectedRoute: cat_attendant sem cat_id. Redirecionando para /ms/select-cat');
        return <Navigate to="/ms/select-cat" replace />;
      }
      break;

    case 'collaborator':
      if (!userProfile.permissions?.length) {
        console.warn('🔐 ProtectedRoute: collaborator sem permissions. Redirecionando para /ms/pending-approval');
        return <Navigate to="/ms/pending-approval" replace />;
      }
      break;

    default:
      console.log('🔐 ProtectedRoute: usuário regular, acesso liberado.');
      break;
  }

  return <>{children}</>;
} 