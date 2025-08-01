import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { UserRole, RoleBasedAccess, ROLE_CONFIG, RolePermissions } from '@/types/roles';
// Utilities removidos - funcionalidade de teste não necessária em produção

export const useRoleBasedAccess = (): RoleBasedAccess => {
  const { user, userProfile } = useAuth();

  const roleData = useMemo(() => {
    // Verificar se está em modo de teste
    // Verificar dados de teste no localStorage para desenvolvimento
    const testUserData = localStorage.getItem('test-user-data');
    const testToken = localStorage.getItem('supabase.auth.token');
    
    if (testUserData && testToken === 'test-token') {
      const testData = JSON.parse(testUserData);
      if (testData) {
        const role = testData.role as UserRole;
        const config = ROLE_CONFIG[role] || ROLE_CONFIG.user;

        const cityMapping = {
          'atendente': 'campo-grande',
          'gestor_municipal': 'campo-grande', 
          'gestor_igr': 'dourados',
          'diretor_estadual': 'campo-grande'
        };

        return {
          userRole: role,
          permissions: config.permissions,
          regionId: role === 'gestor_igr' ? 'igr-grande-dourados' : 'regiao-pantanal',
          cityId: cityMapping[role] || 'campo-grande'
        };
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

  return {
    userRole: roleData.userRole,
    regionId: roleData.regionId,
    cityId: roleData.cityId,
    permissions: roleData.permissions,
    canAccess,
    getDashboardComponent,
    getDisplayName,
    getDescription
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