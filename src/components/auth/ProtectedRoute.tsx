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
    return <div>Carregando...</div>;
  }

  // Verificar autenticação
  if (!user) {
    return <Navigate to="/ms/login" state={{ from: location }} replace />;
  }

  // Verificar perfil do usuário
  if (!userProfile) {
    return <Navigate to="/ms/complete-profile" state={{ from: location }} replace />;
  }

  // Verificar permissões de role
  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/ms/unauthorized" replace />;
  }

  // Verificar região se necessário
  if (requireRegion && !userProfile.region_id) {
    return <Navigate to="/ms/select-region" replace />;
  }

  // Verificar cidade se necessário
  if (requireCity && !userProfile.city_id) {
    return <Navigate to="/ms/select-city" replace />;
  }

  // Verificações específicas por role
  switch (userProfile.role) {
    case 'master_admin':
      // Acesso total
      return <>{children}</>;

    case 'state_admin':
      // Verificar se tem região associada
      if (!userProfile.region_id) {
        return <Navigate to="/ms/select-region" replace />;
      }
      break;

    case 'city_admin':
      // Verificar se tem cidade associada
      if (!userProfile.city_id) {
        return <Navigate to="/ms/select-city" replace />;
      }
      break;

    case 'cat_attendant':
      // Verificar se tem CAT associado
      if (!userProfile.cat_id) {
        return <Navigate to="/ms/select-cat" replace />;
      }
      break;

    case 'collaborator':
      // Verificar se tem permissões necessárias
      if (!userProfile.permissions?.length) {
        return <Navigate to="/ms/pending-approval" replace />;
      }
      break;

    default:
      // Usuário regular
      break;
  }

  return <>{children}</>;
} 