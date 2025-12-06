import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  DollarSign,
  Shield,
  Bot,
  Users,
  FileText,
  Settings,
  ChevronRight,
  LogOut,
  Wallet,
  PieChart,
  Receipt,
  UserCheck,
  Calendar,
  Map,
  Briefcase,
  BookOpen,
  Cog,
  Stamp,
  CreditCard,
  Database,
  Edit3,
  Activity,
  Zap,
  UserCog,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Definição das permissões por cargo
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  master_admin: ['*'],
  admin: ['*'],
  tech: ['*'],
  financeiro: ['dashboard', 'financial', 'reports'],
  rh: ['dashboard', 'employees', 'salaries'],
  comercial: ['dashboard', 'clients', 'subscriptions', 'partners'],
  editor: ['dashboard', 'content', 'events', 'destinations', 'menus'],
  atendente: ['dashboard', 'cat', 'users'],
};

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  children?: NavItem[];
  permission?: string;
  platform?: 'viajar' | 'descubra-ms' | 'system';
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/viajar/admin',
    permission: 'dashboard',
    platform: 'system',
  },
  {
    id: 'viajar',
    label: 'ViajARTur',
    icon: Building2,
    permission: 'viajar',
    platform: 'viajar',
    children: [
      { id: 'viajar-content', label: 'Editar Páginas', icon: Edit3, path: '/viajar/admin/editor/viajar', permission: 'content', platform: 'viajar' },
      { id: 'employees', label: 'Funcionários', icon: Users, path: '/viajar/admin/viajar/employees', permission: 'employees', platform: 'viajar' },
      { id: 'clients', label: 'Clientes', icon: UserCheck, path: '/viajar/admin/viajar/clients', permission: 'clients', platform: 'viajar' },
      { id: 'subscriptions', label: 'Assinaturas', icon: Receipt, path: '/viajar/admin/viajar/subscriptions', permission: 'subscriptions', platform: 'viajar' },
    ],
  },
  {
    id: 'descubra-ms',
    label: 'Descubra MS',
    icon: MapPin,
    permission: 'descubra_ms',
    platform: 'descubra-ms',
    children: [
      { id: 'ms-content', label: 'Editar Páginas', icon: Edit3, path: '/viajar/admin/editor/descubra-ms', permission: 'content', platform: 'descubra-ms' },
      { id: 'destinations', label: 'Destinos', icon: Map, path: '/viajar/admin/descubra-ms/destinations', permission: 'destinations', platform: 'descubra-ms' },
      { id: 'events', label: 'Eventos', icon: Calendar, path: '/viajar/admin/descubra-ms/events', permission: 'events', platform: 'descubra-ms' },
      { id: 'partners', label: 'Parceiros', icon: Briefcase, path: '/viajar/admin/descubra-ms/partners', permission: 'partners', platform: 'descubra-ms' },
      { id: 'passport', label: 'Passaporte Digital', icon: Stamp, path: '/viajar/admin/descubra-ms/passport', permission: 'passport', platform: 'descubra-ms' },
      { id: 'menus', label: 'Menus', icon: BookOpen, path: '/viajar/admin/descubra-ms/menus', permission: 'menus', platform: 'descubra-ms' },
      { id: 'users', label: 'Usuários', icon: Users, path: '/viajar/admin/descubra-ms/users', permission: 'users', platform: 'descubra-ms' },
    ],
  },
  {
    id: 'financial',
    label: 'Financeiro',
    icon: DollarSign,
    permission: 'financial',
    platform: 'system',
    children: [
      { id: 'overview', label: 'Visão Geral', icon: PieChart, path: '/viajar/admin/financial', permission: 'financial', platform: 'system' },
      { id: 'bills', label: 'Contas a Pagar', icon: Receipt, path: '/viajar/admin/financial/bills', permission: 'financial', platform: 'system' },
      { id: 'revenue', label: 'Receitas', icon: Wallet, path: '/viajar/admin/financial/revenue', permission: 'financial', platform: 'system' },
      { id: 'accounts', label: 'Contas Bancárias', icon: CreditCard, path: '/viajar/admin/financial/accounts', permission: 'financial', platform: 'system' },
      { id: 'suppliers', label: 'Fornecedores', icon: Users, path: '/viajar/admin/financial/suppliers', permission: 'financial', platform: 'system' },
      { id: 'reports', label: 'Relatórios', icon: FileText, path: '/viajar/admin/financial/reports', permission: 'reports', platform: 'system' },
    ],
  },
  {
    id: 'team',
    label: 'Equipe',
    icon: UserCog,
    permission: 'team',
    platform: 'system',
    children: [
      { id: 'team-members', label: 'Membros', icon: Users, path: '/viajar/admin/team/members', permission: 'team', platform: 'system' },
      { id: 'team-activities', label: 'Atividades', icon: Activity, path: '/viajar/admin/team/activities', permission: 'team', platform: 'system' },
      { id: 'team-permissions', label: 'Permissões', icon: Shield, path: '/viajar/admin/team/permissions', permission: 'team', platform: 'system' },
    ],
  },
  {
    id: 'database',
    label: 'Banco de Dados',
    icon: Database,
    permission: 'database',
    platform: 'system',
    children: [
      { id: 'db-tables', label: 'Gerenciar Tabelas', icon: Database, path: '/viajar/admin/database', permission: 'database', platform: 'system' },
    ],
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: Settings,
    permission: 'settings',
    platform: 'system',
    children: [
      { id: 'platform', label: 'Plataforma', icon: Globe, path: '/viajar/admin/settings/platform', permission: 'settings', platform: 'system' },
      { id: 'policies', label: 'Políticas e Termos', icon: FileText, path: '/viajar/admin/settings/policies', permission: 'settings', platform: 'system' },
      { id: 'system-health', label: 'Saúde do Sistema', icon: Activity, path: '/viajar/admin/system/health', permission: 'system', platform: 'system' },
      { id: 'system-logs', label: 'Logs', icon: FileText, path: '/viajar/admin/system/logs', permission: 'system', platform: 'system' },
    ],
  },
  {
    id: 'ai',
    label: 'IA Autônoma',
    icon: Bot,
    permission: 'ai',
    platform: 'system',
    children: [
      { id: 'ai-agent', label: 'Agente Autônomo', icon: Zap, path: '/viajar/admin/ai/agent', permission: 'ai', platform: 'system' },
      { id: 'ai-tasks', label: 'Tarefas Automáticas', icon: Activity, path: '/viajar/admin/ai/tasks', permission: 'ai', platform: 'system' },
    ],
  },
];

interface ModernAdminLayoutProps {
  children: React.ReactNode;
}

export default function ModernAdminLayout({ children }: ModernAdminLayoutProps) {
  const { user, userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard']);

  const userRole = userProfile?.role || 'user';

  // Detectar qual plataforma está sendo editada
  const getCurrentPlatform = (): 'viajar' | 'descubra-ms' | 'system' => {
    if (location.pathname.includes('/editor/viajar') || location.pathname.includes('/viajar/admin/viajar')) {
      return 'viajar';
    }
    if (location.pathname.includes('/editor/descubra-ms') || location.pathname.includes('/descubra-ms')) {
      return 'descubra-ms';
    }
    return 'system';
  };

  const currentPlatform = getCurrentPlatform();

  const hasPermission = (permission?: string): boolean => {
    if (!permission) return true;
    const permissions = ROLE_PERMISSIONS[userRole] || [];
    return permissions.includes('*') || permissions.includes(permission);
  };

  const filteredNavItems = navigationItems.filter(item => {
    if (!hasPermission(item.permission)) return false;
    if (item.children) {
      item.children = item.children.filter(child => hasPermission(child.permission));
      return item.children.length > 0;
    }
    return true;
  });

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === '/viajar/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/viajar/admin');
  };

  useEffect(() => {
    navigationItems.forEach(item => {
      if (item.children?.some(child => isActive(child.path))) {
        if (!expandedItems.includes(item.id)) {
          setExpandedItems(prev => [...prev, item.id]);
        }
      }
    });
  }, [location.pathname]);


  return (
    <div className="min-h-screen bg-gray-50">
      <ViaJARNavbar />
      
      {/* Header com gradiente azul-roxo - Igual aos outros dashboards */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                Dashboard <span className="text-blue-200">Administrativo</span>
              </h1>
              <p className="text-blue-100 mt-2">
                {userProfile?.full_name || 'Administrador'} - {userRole === 'master_admin' ? 'Master Admin' : userRole}
              </p>
            </div>
            <div className="flex gap-4">
              {/* Platform Badge */}
              {currentPlatform !== 'system' && (
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                  currentPlatform === 'viajar' 
                    ? "bg-blue-500/30 border border-blue-300/50" 
                    : "bg-emerald-500/30 border border-emerald-300/50"
                )}>
                  {currentPlatform === 'viajar' ? (
                    <>
                      <Building2 className="h-4 w-4" />
                      <span className="text-sm font-medium">ViajARTur</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">Descubra MS</span>
                    </>
                  )}
                </div>
              )}
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Esquerda - Igual aos outros dashboards (branca) */}
        <div className="w-64 bg-white shadow-lg flex-shrink-0">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Administração</h2>
            <nav className="space-y-2">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedItems.includes(item.id);
                const isItemActive = item.path ? isActive(item.path) : item.children?.some(c => isActive(c.path));

                return (
                  <div key={item.id}>
                    {hasChildren ? (
                      <>
                        <button
                          onClick={() => toggleExpanded(item.id)}
                          className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                            isItemActive 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="flex-1">{item.label}</span>
                          <ChevronRight className={cn(
                            "h-4 w-4 transition-transform",
                            isExpanded && "rotate-90"
                          )} />
                        </button>
                        {isExpanded && (
                          <div className="ml-4 mt-1 space-y-1">
                            {item.children?.map((child) => {
                              const ChildIcon = child.icon;
                              return (
                                <Link
                                  key={child.id}
                                  to={child.path || '#'}
                                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                                    isActive(child.path)
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  <ChildIcon className="h-4 w-4" />
                                  <span>{child.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        to={item.path || '#'}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                          isItemActive 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Conteúdo Principal - Igual aos outros dashboards */}
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
