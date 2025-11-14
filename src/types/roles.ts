export type UserRole = 
  | 'admin'
  | 'diretor_estadual'
  | 'gestor_igr'
  | 'gestor_municipal'
  | 'atendente'
  | 'cat_attendant'
  | 'user';

export interface RolePermissions {
  canViewDestinations: boolean;
  canEditDestinations: boolean;
  canViewEvents: boolean;
  canEditEvents: boolean;
  canViewUsers: boolean;
  canEditUsers: boolean;
  canViewAnalytics: boolean;
  canViewReports: boolean;
  canManageCheckins: boolean;
  canViewRegionalData: boolean;
  canViewStateData: boolean;
}

export interface UserRoleData {
  role: UserRole;
  region_id?: string;
  city_id?: string;
  permissions: RolePermissions;
  displayName: string;
  description: string;
  dashboardComponent: string;
}

export const ROLE_CONFIG: Record<UserRole, UserRoleData> = {
  admin: {
    role: 'admin',
    permissions: {
      canViewDestinations: true,
      canEditDestinations: true,
      canViewEvents: true,
      canEditEvents: true,
      canViewUsers: true,
      canEditUsers: true,
      canViewAnalytics: true,
      canViewReports: true,
      canManageCheckins: true,
      canViewRegionalData: true,
      canViewStateData: true,
    },
    displayName: 'Administrador',
    description: 'Acesso total ao sistema',
    dashboardComponent: 'AdminDashboard'
  },
  diretor_estadual: {
    role: 'diretor_estadual',
    permissions: {
      canViewDestinations: true,
      canEditDestinations: true,
      canViewEvents: true,
      canEditEvents: true,
      canViewUsers: true,
      canEditUsers: false,
      canViewAnalytics: true,
      canViewReports: true,
      canManageCheckins: true,
      canViewRegionalData: true,
      canViewStateData: true,
    },
    displayName: 'Diretor Estadual',
    description: 'Gestão estadual completa',
    dashboardComponent: 'EstadualDashboard'
  },
  gestor_igr: {
    role: 'gestor_igr',
    permissions: {
      canViewDestinations: true,
      canEditDestinations: true,
      canViewEvents: true,
      canEditEvents: true,
      canViewUsers: false,
      canEditUsers: false,
      canViewAnalytics: true,
      canViewReports: true,
      canManageCheckins: true,
      canViewRegionalData: true,
      canViewStateData: false,
    },
    displayName: 'Gestor Regional',
    description: 'Gestão regional (IGR)',
    dashboardComponent: 'RegionalDashboard'
  },
  gestor_municipal: {
    role: 'gestor_municipal',
    permissions: {
      canViewDestinations: true,
      canEditDestinations: true,
      canViewEvents: true,
      canEditEvents: true,
      canViewUsers: false,
      canEditUsers: false,
      canViewAnalytics: true,
      canViewReports: false,
      canManageCheckins: true,
      canViewRegionalData: false,
      canViewStateData: false,
    },
    displayName: 'Gestor Municipal',
    description: 'Gestão municipal',
    dashboardComponent: 'MunicipalDashboard'
  },
  atendente: {
    role: 'atendente',
    permissions: {
      canViewDestinations: true,
      canEditDestinations: false,
      canViewEvents: true,
      canEditEvents: false,
      canViewUsers: false,
      canEditUsers: false,
      canViewAnalytics: false,
      canViewReports: false,
      canManageCheckins: true,
      canViewRegionalData: false,
      canViewStateData: false,
    },
    displayName: 'Atendente',
    description: 'Atendimento ao público',
    dashboardComponent: 'AtendenteDashboard'
  },
  cat_attendant: {
    role: 'cat_attendant',
    permissions: {
      canViewDestinations: true,
      canEditDestinations: false,
      canViewEvents: true,
      canEditEvents: false,
      canViewUsers: false,
      canEditUsers: false,
      canViewAnalytics: false,
      canViewReports: false,
      canManageCheckins: true,
      canViewRegionalData: false,
      canViewStateData: false,
    },
    displayName: 'Atendente CAT',
    description: 'Atendente do Centro de Atendimento ao Turista',
    dashboardComponent: 'AtendenteDashboard'
  },
  user: {
    role: 'user',
    permissions: {
      canViewDestinations: true,
      canEditDestinations: false,
      canViewEvents: true,
      canEditEvents: false,
      canViewUsers: false,
      canEditUsers: false,
      canViewAnalytics: false,
      canViewReports: false,
      canManageCheckins: false,
      canViewRegionalData: false,
      canViewStateData: false,
    },
    displayName: 'Usuário',
    description: 'Usuário comum',
    dashboardComponent: 'UserDashboard'
  }
};

export interface RoleBasedAccess {
  userRole: UserRole;
  regionId?: string;
  cityId?: string;
  permissions: RolePermissions;
  canAccess: (permission: keyof RolePermissions) => boolean;
  getDashboardComponent: () => string;
  getDisplayName: () => string;
  getDescription: () => string;
} 