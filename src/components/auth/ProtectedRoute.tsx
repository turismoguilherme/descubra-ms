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
  const [waitingForTestUser, setWaitingForTestUser] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState<boolean | null>(null);
  const [checkingPassword, setCheckingPassword] = useState(true);

  // Verificar se há usuário de teste no localStorage e aguardar processamento
  useEffect(() => {
    const testUserId = localStorage.getItem('test_user_id');
    const testUserData = localStorage.getItem('test_user_data');
    
    if (!user && testUserId && testUserData && !waitingForTestUser) {
      console.log('🔐 ProtectedRoute: Usuário de teste detectado, aguardando processamento...');
      setWaitingForTestUser(true);
      
      // Aguardar até 3 segundos para o AuthProvider processar
      const timeout = setTimeout(() => {
        console.log('🔐 ProtectedRoute: Timeout aguardando usuário de teste, continuando...');
        setWaitingForTestUser(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
    
    if (user && waitingForTestUser) {
      console.log('🔐 ProtectedRoute: Usuário de teste processado pelo AuthProvider');
      setWaitingForTestUser(false);
    }
  }, [user, waitingForTestUser]);

  // Verificar se usuário precisa trocar senha
  useEffect(() => {
    const checkPasswordChange = async () => {
      // Pular verificação para usuários de teste
      const testUserId = localStorage.getItem('test_user_id');
      if (testUserId) {
        setMustChangePassword(false);
        setCheckingPassword(false);
        return;
      }

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

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
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

  // Aguardar carregamento inicial ou usuário de teste
  if (loading || waitingForTestUser || checkingPassword) {
    console.log('🔐 ProtectedRoute: loading=true ou aguardando usuário de teste, aguardando...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Verificar se precisa trocar senha (apenas para usuários reais, não de teste)
  const testUserIdForPassword = localStorage.getItem('test_user_id');
  if (mustChangePassword === true && !testUserIdForPassword && user) {
    return (
      <ForcePasswordChange
        onPasswordChanged={() => {
          setMustChangePassword(false);
          // Recarregar página para garantir que tudo está atualizado
          window.location.reload();
        }}
      />
    );
  }

  // Debug: Log do estado atual
  console.log('🔐 ProtectedRoute: Verificando acesso:', {
    user: user ? { id: user.id, email: user.email } : null,
    userProfile: userProfile ? { user_id: userProfile.user_id, role: userProfile.role } : null,
    loading,
    pathname: location.pathname,
    allowedRoles
  });

  // Verificar se há usuário de teste no localStorage (fallback)
  const testUserData = localStorage.getItem('test_user_data');
  const testUserId = localStorage.getItem('test_user_id');
  
  if (!user && testUserId && testUserData) {
    console.log('🔐 ProtectedRoute: Usuário de teste encontrado no localStorage, processando imediatamente...');
    
    try {
      const testUser = JSON.parse(testUserData);
      console.log('🔐 ProtectedRoute: Processando usuário de teste:', testUser);
      console.log('🔐 ProtectedRoute: Roles permitidos:', allowedRoles);
      console.log('🔐 ProtectedRoute: Rota atual:', location.pathname);
      
      // Verificar se o role do usuário de teste está permitido
      if (allowedRoles.length > 0 && !allowedRoles.includes(testUser.role)) {
        console.warn('🔐 ProtectedRoute: Role de usuário de teste não permitida:', {
          userRole: testUser.role,
          allowedRoles,
          pathname: location.pathname
        });
        
        // Para usuários de teste com role não permitida, redirecionar para test-login
        return <Navigate to="/test-login" replace />;
      }
      
      console.log('🔐 ProtectedRoute: Acesso liberado para usuário de teste com role:', testUser.role);
      
      // Para usuários de teste, permitir acesso direto sem redirecionamento
      // O AuthProvider processará em background
      return <>{children}</>;
    } catch (error) {
      console.error('🔐 ProtectedRoute: Erro ao processar usuário de teste:', error);
      // Se houver erro, aguardar o AuthProvider
      return <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando usuário de teste...</p>
        </div>
      </div>;
    }
  }

  // Se não há usuário de teste no localStorage, mas ainda está carregando, aguardar mais
  if (!user && !testUserId && loading) {
    console.log('🔐 ProtectedRoute: Aguardando AuthProvider carregar...');
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Aguardando autenticação...</p>
      </div>
    </div>;
  }

  // Verificar autenticação (apenas para usuários reais)
  if (!user && !testUserId) {
    // Redirecionar para o login correto baseado na rota
    const isViaJARRoute = location.pathname.startsWith('/viajar') || 
                         location.pathname.startsWith('/attendant-dashboard') || 
                         location.pathname.startsWith('/secretary-dashboard') || 
                         location.pathname.startsWith('/private-dashboard') || 
                         location.pathname.startsWith('/unified');
    const loginPath = isViaJARRoute ? '/viajar/login' : '/descubrams/login';
    console.warn('🔐 ProtectedRoute: usuário não autenticado. Redirecionando para', loginPath, { from: location.pathname });
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Verificar perfil do usuário (apenas para usuários reais)
  if (!userProfile && !testUserId) {
    // Redirecionar para o login correto baseado na rota
    const isViaJARRoute = location.pathname.startsWith('/viajar') || 
                         location.pathname.startsWith('/attendant-dashboard') || 
                         location.pathname.startsWith('/secretary-dashboard') || 
                         location.pathname.startsWith('/private-dashboard') || 
                         location.pathname.startsWith('/unified');
    const loginPath = isViaJARRoute ? '/viajar/login' : '/descubrams/login';
    console.warn('🔐 ProtectedRoute: userProfile ausente. Redirecionando para', loginPath, { from: location.pathname });
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Determinar o role do usuário (para usuários de teste, verificar o localStorage)
  let userRole = userProfile?.role || 'user'; // Valor padrão
  if (testUserId && testUserData) {
    try {
      const testUser = JSON.parse(testUserData);
      userRole = testUser.role;
      console.log('🔐 ProtectedRoute: Verificando role de usuário de teste:', userRole);
    } catch (error) {
      console.error('🔐 ProtectedRoute: Erro ao processar usuário de teste para verificação de role:', error);
      userRole = 'user'; // Fallback para user
    }
  }

  // Verificar permissões de role
  if (allowedRoles.length > 0) {
    if (!allowedRoles.includes(userRole)) {
      // Redirecionar para o login correto baseado na rota
      const isViaJARRoute = location.pathname.startsWith('/viajar') || 
                           location.pathname.startsWith('/attendant-dashboard') || 
                           location.pathname.startsWith('/secretary-dashboard') || 
                           location.pathname.startsWith('/private-dashboard') || 
                           location.pathname.startsWith('/unified');
      const loginPath = isViaJARRoute ? '/viajar/login' : '/descubrams/login';
      console.warn('🔐 ProtectedRoute: role não permitida.', { 
        userRole, 
        allowedRoles, 
        from: location.pathname,
        isTestUser: !!testUserId 
      });
      return <Navigate to={loginPath} replace />;
    }
  }

  // Verificar região se necessário
  if (requireRegion && !userProfile.region_id) {
    console.warn('🔐 ProtectedRoute: requireRegion habilitado e region_id ausente. Redirecionando para /descubrams/select-region', { from: location.pathname });
    return <Navigate to="/descubrams/select-region" replace />;
  }

  // Verificar cidade se necessário
  if (requireCity && !userProfile.city_id) {
    console.warn('🔐 ProtectedRoute: requireCity habilitado e city_id ausente. Redirecionando para /descubrams/select-city', { from: location.pathname });
    return <Navigate to="/descubrams/select-city" replace />;
  }

  // Verificações específicas por role
  const currentRole = userRole || userProfile?.role || 'user';
  switch (currentRole) {
    case 'master_admin':
      console.log('🔐 ProtectedRoute: acesso total (master_admin)');
      return <>{children}</>;

    case 'state_admin':
      if (!userProfile.region_id) {
        console.warn('🔐 ProtectedRoute: state_admin sem region_id. Redirecionando para /descubrams/select-region');
        return <Navigate to="/descubrams/select-region" replace />;
      }
      break;

    case 'city_admin':
      if (!userProfile.city_id) {
        console.warn('🔐 ProtectedRoute: city_admin sem city_id. Redirecionando para /descubrams/select-city');
        return <Navigate to="/descubrams/select-city" replace />;
      }
      break;

    case 'cat_attendant':
      // Verificar se tem CAT associado (apenas para usuários reais, não de teste)
      if (!(userProfile as any).cat_id && !testUserId) {
        console.warn('🔐 ProtectedRoute: cat_attendant sem cat_id. Redirecionando para /descubrams/select-cat');
        return <Navigate to="/descubrams/select-cat" replace />;
      }
      break;

    case 'collaborator':
      // Verificar se tem permissões necessárias
      if (!(userProfile as any).permissions?.length) {
        console.warn('🔐 ProtectedRoute: collaborator sem permissions. Redirecionando para /descubrams/pending-approval');
        return <Navigate to="/descubrams/pending-approval" replace />;
      }
      break;

    default:
      console.log('🔐 ProtectedRoute: usuário regular, acesso liberado.');
      break;
  }

  return <>{children}</>;
}