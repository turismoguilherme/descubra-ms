import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
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
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Bell,
  Search,
  Moon,
  Sun,
  LogOut,
  Wallet,
  PieChart,
  Receipt,
  UserCheck,
  Calendar,
  Map,
  Megaphone,
  Briefcase,
  BookOpen,
  Cog,
  HelpCircle,
  Stamp,
  CreditCard,
  Database,
  Edit3,
  Globe,
  Activity,
  Zap,
  UserCog
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
      { id: 'company-settings', label: 'Configurações', icon: Cog, path: '/viajar/admin/viajar/settings', permission: 'settings', platform: 'viajar' },
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
      { id: 'ai-chat', label: 'Assistente', icon: Bot, path: '/viajar/admin/ai/chat', permission: 'ai', platform: 'system' },
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Fechar menu mobile ao navegar
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - Fixo no topo */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="h-full flex items-center justify-between px-4 lg:px-6">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex text-slate-600"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo */}
            <Link to="/viajar/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <span className="text-white font-bold">V</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-lg text-slate-800">Admin</span>
                <span className="text-xs block text-slate-500">Painel de Controle</span>
              </div>
            </Link>

            {/* Platform Badge */}
            {currentPlatform !== 'system' && (
              <div className={cn(
                "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg ml-4",
                currentPlatform === 'viajar' 
                  ? "bg-blue-50 border border-blue-200" 
                  : "bg-emerald-50 border border-emerald-200"
              )}>
                {currentPlatform === 'viajar' ? (
                  <>
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">ViajARTur</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">Descubra MS</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar..."
                className="w-64 pl-9 h-9 bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>

            {/* System Status */}
            <Button variant="ghost" size="sm" className="hidden lg:flex items-center gap-2 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs">Online</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative text-slate-600">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {(userProfile?.full_name || user?.email || 'A')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-medium text-slate-700">
                      {userProfile?.full_name || 'Administrador'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {userRole === 'master_admin' ? 'Master Admin' : userRole}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 hidden lg:block text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Ajuda
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 bottom-0 z-40 bg-[#0F4C3A] transition-all duration-300 overflow-hidden",
        sidebarOpen ? "w-64" : "w-0 lg:w-16",
        mobileMenuOpen ? "w-64" : ""
      )}>
        <nav className="h-full flex flex-col">
          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems.includes(item.id);
              const isItemActive = item.path ? isActive(item.path) : item.children?.some(c => isActive(c.path));

              // Cor do item baseado na plataforma
              const getPlatformColor = (platform?: string) => {
                if (platform === 'viajar') return 'text-blue-300';
                if (platform === 'descubra-ms') return 'text-emerald-300';
                return 'text-white';
              };

              return (
                <div key={item.id}>
                  {hasChildren ? (
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                        isItemActive
                          ? "bg-white/15 text-white"
                          : "text-emerald-100 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className={cn("h-5 w-5 flex-shrink-0", getPlatformColor(item.platform))} />
                      {(sidebarOpen || mobileMenuOpen) && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronRight className={cn(
                            "h-4 w-4 transition-transform",
                            isExpanded && "rotate-90"
                          )} />
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      to={item.path || '#'}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                        isItemActive
                          ? "bg-white/15 text-white"
                          : "text-emerald-100 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {(sidebarOpen || mobileMenuOpen) && <span>{item.label}</span>}
                    </Link>
                  )}

                  {/* Children items */}
                  {hasChildren && isExpanded && (sidebarOpen || mobileMenuOpen) && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-emerald-700/50 pl-3">
                      {item.children?.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.id}
                            to={child.path || '#'}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                              isActive(child.path)
                                ? "bg-white/15 text-white"
                                : "text-emerald-200/70 hover:bg-white/10 hover:text-white"
                            )}
                          >
                            <ChildIcon className="h-4 w-4" />
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {(sidebarOpen || mobileMenuOpen) && (
            <div className="p-4 border-t border-emerald-700/50">
              <div className="flex items-center gap-2 text-emerald-200/70 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Sistema Online</span>
              </div>
              <div className="text-emerald-300/50 text-xs mt-1">Versão 2.0.0</div>
            </div>
          )}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className={cn(
        "pt-16 min-h-screen transition-all duration-300",
        sidebarOpen ? "lg:ml-64" : "lg:ml-16"
      )}>
        {/* Platform Context Bar */}
        {currentPlatform !== 'system' && (
          <div className={cn(
            "border-b px-6 py-3",
            currentPlatform === 'viajar' 
              ? "bg-blue-50 border-blue-100" 
              : "bg-emerald-50 border-emerald-100"
          )}>
            <div className="flex items-center gap-3">
              {currentPlatform === 'viajar' ? (
                <>
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800">ViajARTur</h3>
                    <p className="text-xs text-blue-600">Plataforma SaaS de Gestão Turística</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-800">Descubra Mato Grosso do Sul</h3>
                    <p className="text-xs text-emerald-600">Portal Oficial de Turismo</p>
                  </div>
                </>
              )}
              <div className="ml-auto">
                <Button variant="outline" size="sm" className={cn(
                  currentPlatform === 'viajar' 
                    ? "border-blue-300 text-blue-700 hover:bg-blue-100" 
                    : "border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                )}>
                  <Globe className="h-4 w-4 mr-2" />
                  Ver no Site
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
