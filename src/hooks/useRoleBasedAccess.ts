import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { UserRole, RoleBasedAccess, ROLE_CONFIG, RolePermissions } from '@/types/roles';
// Utilities removidos - funcionalidade de teste não necessária em produção

export const useRoleBasedAccess = (): RoleBasedAccess => {
  // Verificar se o AuthProvider está disponível
  let auth = null;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('useRoleBasedAccess: AuthProvider não disponível:', error);
    // Retornar valores padrão se não há auth
    return {
      userRole: 'user' as UserRole,
      permissions: ROLE_CONFIG.user.permissions,
      regionId: null,
      cityId: null,
      canAccess: () => false,
      isManager: false,
      isAdmin: false,
      isSecretary: false,
      isAttendant: false,
      isPrivate: false
    };
  }
  
  const { user, userProfile } = auth;

  const roleData = useMemo(() => {
    try {
      // Verificar se está em modo de teste
      // Verificar dados de teste no localStorage para desenvolvimento
      let testUserId: string | null = null;
      let testUserData: string | null = null;
      
      try {
        testUserId = typeof window !== 'undefined' ? localStorage.getItem('test_user_id') : null;
        testUserData = typeof window !== 'undefined' ? localStorage.getItem('test_user_data') : null;
      } catch (e) {
        // localStorage pode não estar disponível
        console.warn('🔍 useRoleBasedAccess: localStorage não disponível:', e);
      }
      
      if (testUserId && testUserData) {
        try {
          const testData = JSON.parse(testUserData);
          console.log('🔍 useRoleBasedAccess: Detectando usuário de teste:', testData);
          
          if (testData) {
            const role = testData.role as UserRole;
            const config = ROLE_CONFIG[role] || ROLE_CONFIG.user;

            const cityMapping: Record<string, string> = {
              'atendente': 'campo-grande',
              'cat_attendant': 'campo-grande',
              'gestor_municipal': 'campo-grande', 
              'gestor_igr': 'dourados',
              'diretor_estadual': 'campo-grande'
            };

            console.log('🔍 useRoleBasedAccess: Role detectado:', role, 'Config:', config);

            return {
              userRole: role,
              permissions: config.permissions,
              regionId: role === 'gestor_igr' ? 'igr-grande-dourados' : 'regiao-pantanal',
              cityId: cityMapping[role] || 'campo-grande'
            };
          }
        } catch (error) {
          console.error('🔍 useRoleBasedAccess: Erro ao processar usuário de teste:', error);
        }
      }

      if (!user || !userProfile) {
        return {
          userRole: 'user' as UserRole,
          permissions: ROLE_CONFIG.user.permissions,
          regionId: undefined,
          cityId: undefined
        };
      }

      const role = userProfile.role as UserRole;
      const config = ROLE_CONFIG[role] || ROLE_CONFIG.user;

      return {
        userRole: role,
        permissions: config.permissions,
        regionId: userProfile.region_id || undefined,
        cityId: userProfile.city_id || undefined
      };
    } catch (error) {
      console.error('🔍 useRoleBasedAccess: Erro no useMemo:', error);
      // Retornar valores padrão em caso de erro
      return {
        userRole: 'user' as UserRole,
        permissions: ROLE_CONFIG.user.permissions,
        regionId: undefined,
        cityId: undefined
      };
    }
  }, [user, userProfile]);

  const canAccess = (permission: keyof RolePermissions): boolean => {
    return roleData.permissions[permission] || false;
  };

  const getDashboardComponent = (): string => {
    const role = roleData.userRole;
    return ROLE_CONFIG[role]?.dashboardComponent || 'UserDashboard';
  };

  const getDisplayName = (): string => {
    const role = roleData.userRole;
    return ROLE_CONFIG[role]?.displayName || 'Usuário';
  };

  const getDescription = (): string => {
    const role = roleData.userRole;
    return ROLE_CONFIG[role]?.description || 'Usuário comum';
  };

  // Calcular flags de role
  const role = roleData.userRole;
  const isAdmin = role === 'admin' || role === 'diretor_estadual';
  const isManager = role === 'gestor_igr' || role === 'gestor_municipal' || role === 'diretor_estadual';
  const isSecretary = role === 'gestor_municipal';
  const isAttendant = role === 'atendente' || role === 'cat_attendant';
  const isPrivate = role === 'user';

  console.log('🔍 useRoleBasedAccess: Flags calculadas:', {
    role,
    isAdmin,
    isManager,
    isSecretary,
    isAttendant,
    isPrivate
  });

  return {
    userRole: roleData.userRole,
    regionId: roleData.regionId,
    cityId: roleData.cityId,
    permissions: roleData.permissions,
    canAccess,
    getDashboardComponent,
    getDisplayName,
    getDescription,
    isAdmin,
    isManager,
    isSecretary,
    isAttendant,
    isPrivate
  };
};

// Hook auxiliar para verificar se o usuário tem acesso a uma funcionalidade específica
export const usePermission = (permission: keyof RolePermissions): boolean => {
  const { canAccess } = useRoleBasedAccess();
  return canAccess(permission);
};

// Hook auxiliar para obter informações do role atual
export const useCurrentRole = () => {
  const roleAccess = useRoleBasedAccess();
  
  return {
    role: roleAccess.userRole,
    displayName: roleAccess.getDisplayName(),
    description: roleAccess.getDescription(),
    dashboardComponent: roleAccess.getDashboardComponent(),
    regionId: roleAccess.regionId,
    cityId: roleAccess.cityId
  };
}; 