// @ts-nocheck
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { UserRole, RoleBasedAccess, ROLE_CONFIG, RolePermissions } from '@/types/roles';

/**
 * Hook para controle de acesso baseado em roles.
 * SEGURANÇA: Usa SOMENTE dados do Supabase Auth (via AuthProvider).
 * Não aceita dados do localStorage ou qualquer fonte client-side.
 */
export const useRoleBasedAccess = (): RoleBasedAccess => {
  let auth = null;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('useRoleBasedAccess: AuthProvider não disponível:', error);
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
    // SEGURANÇA: Derivar role SOMENTE do perfil autenticado via Supabase
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

  const role = roleData.userRole;
  const isAdmin = role === 'admin' || role === 'diretor_estadual';
  const isManager = role === 'gestor_igr' || role === 'gestor_municipal' || role === 'diretor_estadual';
  const isSecretary = role === 'gestor_municipal';
  const isAttendant = role === 'atendente' || role === 'cat_attendant';
  const isPrivate = role === 'user';

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

export const usePermission = (permission: keyof RolePermissions): boolean => {
  const { canAccess } = useRoleBasedAccess();
  return canAccess(permission);
};

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
