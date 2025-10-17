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

  // Debug: Log do estado atual
  console.log('🔐 ProtectedRoute: Verificando acesso:', {
    user: user ? { id: user.id, email: user.email } : null,
    userProfile: userProfile ? { user_id: userProfile.user_id, role: userProfile.role } : null,
    loading,
    pathname: location.pathname
  });

  // Verificar se há usuário de teste no localStorage (fallback)
  const testUserId = localStorage.getItem('test_user_id');
  const testUserData = localStorage.getItem('test_user_data');
  
  if (!user && testUserId && testUserData) {
    console.log('🔐 ProtectedRoute: Usuário de teste encontrado no localStorage, aguardando AuthProvider...');
    // Aguardar um pouco mais para o AuthProvider processar
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Carregando usuário de teste...</p>
      </div>
    </div>;
  }

  // Verificar autenticação
  if (!user) {
    // Redirecionar para o login correto baseado na rota
    const loginPath = location.pathname.startsWith('/viajar') ? '/viajar/login' : '/ms/login';
    console.warn('🔐 ProtectedRoute: usuário não autenticado. Redirecionando para', loginPath, { from: location.pathname });
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Verificar perfil do usuário
  if (!userProfile) {
    // Redirecionar para o login correto baseado na rota
    const loginPath = location.pathname.startsWith('/viajar') ? '/viajar/login' : '/ms/login';
    console.warn('🔐 ProtectedRoute: userProfile ausente. Redirecionando para', loginPath, { from: location.pathname });
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Verificar permissões de role
  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile.role)) {
    // Redirecionar para o login correto baseado na rota
    const loginPath = location.pathname.startsWith('/viajar') ? '/viajar/login' : '/ms/login';
    console.warn('🔐 ProtectedRoute: role não permitida.', { role: userProfile.role, allowedRoles, from: location.pathname });
    return <Navigate to={loginPath} replace />;
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
      // Verificar se tem CAT associado
      if (!(userProfile as any).cat_id) {
        console.warn('🔐 ProtectedRoute: cat_attendant sem cat_id. Redirecionando para /ms/select-cat');
        return <Navigate to="/ms/select-cat" replace />;
      }
      break;

    case 'collaborator':
      // Verificar se tem permissões necessárias
      if (!(userProfile as any).permissions?.length) {
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