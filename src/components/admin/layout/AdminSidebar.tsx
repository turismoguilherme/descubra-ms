import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CreditCard, 
  Settings,
  FileText,
  Menu,
  UserCog,
  MapPin,
  DollarSign,
  Shield,
  Activity,
  FileCheck,
  Bot,
  Lightbulb,
  ListChecks,
  ChevronDown,
  Calendar,
  Users2,
  Ticket
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    path: '/viajar/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Gestão ViajARTur',
    path: '/viajar/admin/viajar',
    icon: Building2,
    children: [
      { label: 'Funcionários', path: '/viajar/admin/viajar/employees', icon: Users },
      { label: 'Clientes', path: '/viajar/admin/viajar/clients', icon: Building2 },
      { label: 'Assinaturas', path: '/viajar/admin/viajar/subscriptions', icon: CreditCard },
      { label: 'Configurações', path: '/viajar/admin/viajar/settings', icon: Settings },
    ],
  },
  {
    label: 'Gestão Descubra MS',
    path: '/viajar/admin/descubra-ms',
    icon: MapPin,
    children: [
      { label: 'Conteúdo', path: '/viajar/admin/descubra-ms/content', icon: FileText },
      { label: 'Menus', path: '/viajar/admin/descubra-ms/menus', icon: Menu },
      { label: 'Usuários', path: '/viajar/admin/descubra-ms/users', icon: UserCog },
      { label: 'Eventos', path: '/viajar/admin/descubra-ms/events', icon: Calendar },
      { label: 'Parceiros', path: '/viajar/admin/descubra-ms/partners', icon: Users2 },
      { label: 'Passaporte Digital', path: '/viajar/admin/descubra-ms/passport', icon: Ticket },
      { label: 'Configurações', path: '/viajar/admin/descubra-ms/settings', icon: Settings },
    ],
  },
  {
    label: 'Financeiro',
    path: '/viajar/admin/financial',
    icon: DollarSign,
    children: [
      { label: 'Pagamentos', path: '/viajar/admin/financial/payments', icon: CreditCard },
      { label: 'Reconciliação', path: '/viajar/admin/financial/reconciliation', icon: FileCheck },
      { label: 'Relatórios', path: '/viajar/admin/financial/reports', icon: FileText },
    ],
  },
  {
    label: 'Sistema',
    path: '/viajar/admin/system',
    icon: Shield,
    children: [
      { label: 'Fallback', path: '/viajar/admin/system/fallback', icon: Activity },
      { label: 'Monitoramento', path: '/viajar/admin/system/monitoring', icon: Activity },
      { label: 'Logs', path: '/viajar/admin/system/logs', icon: FileCheck },
    ],
  },
  {
    label: 'IA Administradora',
    path: '/viajar/admin/ai',
    icon: Bot,
    children: [
      { label: 'Chat', path: '/viajar/admin/ai/chat', icon: Bot },
      { label: 'Sugestões', path: '/viajar/admin/ai/suggestions', icon: Lightbulb },
      { label: 'Ações Pendentes', path: '/viajar/admin/ai/actions', icon: ListChecks },
    ],
  },
];

export default function AdminSidebar() {
  const location = useLocation();
  const { canAccess } = useAdminPermissions();

  const isActive = (path: string) => {
    if (path === '/viajar/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 shadow-lg">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-base font-bold text-gray-900">Área Admin</h2>
        <p className="text-xs text-gray-500 mt-1">ViajARTur & Descubra MS</p>
      </div>

      <nav className="space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const hasActiveChild = item.children?.some(child => isActive(child.path));
          const isExpanded = expandedItems.has(item.path) || active || hasActiveChild;
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.path}>
              <div className="flex items-center">
                <Link
                  to={item.path}
                  className={cn(
                    "flex-1 flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all",
                    active || hasActiveChild
                      ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("h-4 w-4", active || hasActiveChild ? "text-blue-600" : "text-gray-500")} />
                  <span>{item.label}</span>
                </Link>
                {hasChildren && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleExpand(item.path);
                    }}
                    className="ml-1 p-1 rounded hover:bg-gray-100"
                  >
                    <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isExpanded && "rotate-180")} />
                  </button>
                )}
              </div>

              {hasChildren && isExpanded && (
                <div className="ml-4 mt-1 mb-2 pl-4 border-l-2 border-gray-200 space-y-0.5">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const childActive = isActive(child.path);
                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-all",
                          childActive
                            ? "text-blue-700 font-semibold bg-blue-50 border border-blue-200"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <ChildIcon className={cn("h-3.5 w-3.5", childActive ? "text-blue-600" : "text-gray-400")} />
                        <span>{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

