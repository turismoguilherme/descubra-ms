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
  Ticket,
  ChevronLeft,
  Home,
  Globe,
  Image,
  Video,
  Link as LinkIcon,
  Search
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
    label: 'ViajARTur',
    path: '/viajar/admin/viajar',
    icon: Building2,
    children: [
      { label: 'Funcionários', path: '/viajar/admin/viajar/employees', icon: Users },
      { label: 'Clientes', path: '/viajar/admin/viajar/clients', icon: Building2 },
      { label: 'Assinaturas', path: '/viajar/admin/viajar/subscriptions', icon: CreditCard },
      { label: 'Páginas', path: '/viajar/admin/viajar/pages', icon: FileText },
      { label: 'Configurações', path: '/viajar/admin/viajar/settings', icon: Settings },
    ],
  },
  {
    label: 'Descubra MS',
    path: '/viajar/admin/descubra-ms',
    icon: MapPin,
    children: [
      { label: 'Homepage', path: '/viajar/admin/descubra-ms/homepage', icon: Home },
      { label: 'Destinos', path: '/viajar/admin/descubra-ms/destinations', icon: MapPin },
      { label: 'Eventos', path: '/viajar/admin/descubra-ms/events', icon: Calendar },
      { label: 'Parceiros', path: '/viajar/admin/descubra-ms/partners', icon: Users2 },
      { label: 'Configurações de Parceiros', path: '/viajar/admin/descubra-ms/partner-settings', icon: Settings },
      { label: 'Passaporte Digital', path: '/viajar/admin/descubra-ms/passport', icon: Ticket },
      { label: 'Conteúdo', path: '/viajar/admin/descubra-ms/content', icon: FileText },
      { label: 'Usuários', path: '/viajar/admin/descubra-ms/users', icon: UserCog },
      { label: 'Configurações', path: '/viajar/admin/descubra-ms/settings', icon: Settings },
    ],
  },
  {
    label: 'Financeiro',
    path: '/viajar/admin/financial',
    icon: DollarSign,
    children: [
      { label: 'Gestão Financeira', path: '/viajar/admin/financial', icon: DollarSign },
      { label: 'Pagamentos', path: '/viajar/admin/financial/payments', icon: CreditCard },
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
      { label: 'Auditoria', path: '/viajar/admin/system/logs', icon: FileCheck },
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
      { label: 'Base de Conhecimento', path: '/viajar/admin/ai/knowledge-base', icon: FileText },
      { label: 'Editor de Prompts', path: '/viajar/admin/ai/prompts', icon: Bot },
    ],
  },
];

export default function AdminSidebar() {
  const location = useLocation();
  const { canAccess } = useAdminPermissions();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path: string) => {
    if (path === '/viajar/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Expandir automaticamente seções com item ativo
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    const expanded = new Set<string>();
    sidebarItems.forEach(item => {
      if (item.children?.some(child => isActive(child.path))) {
        expanded.add(item.path);
      }
    });
    // Se nenhum item está ativo, expandir todos por padrão
    if (expanded.size === 0) {
      sidebarItems.forEach(item => {
        if (item.children) {
          expanded.add(item.path);
        }
      });
    }
    return expanded;
  });

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
    <div className={cn(
      "bg-[#F8F9FA] border-r border-[#E5E5E5] min-h-screen transition-all duration-200 flex flex-col",
      isCollapsed ? "w-16" : "w-60"
    )}>
      {/* Header */}
      <div className="h-16 border-b border-[#E5E5E5] bg-white flex items-center justify-between px-4">
        {!isCollapsed && (
          <div>
            <h2 className="text-sm font-semibold text-[#0A0A0A]">Admin</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">ViajARTur & Descubra MS</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-[#F0F0F0] transition-colors"
          title={isCollapsed ? "Expandir" : "Colapsar"}
        >
          <ChevronLeft className={cn("h-4 w-4 text-[#6B7280] transition-transform", isCollapsed && "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const hasActiveChild = item.children?.some(child => isActive(child.path));
          const isExpanded = expandedItems.has(item.path);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.path} className="mb-0.5">
              <div className="flex items-center">
                <Link
                  to={item.path}
                  className={cn(
                    "flex-1 flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all relative",
                    active || hasActiveChild
                      ? "bg-white text-[#0A0A0A] shadow-sm border-l-2 border-[#3B82F6]"
                      : "text-[#6B7280] hover:bg-white/60 hover:text-[#0A0A0A]"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={cn(
                    "h-4 w-4 flex-shrink-0",
                    active || hasActiveChild ? "text-[#3B82F6]" : "text-[#6B7280]"
                  )} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
                {hasChildren && !isCollapsed && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleExpand(item.path);
                    }}
                    className="ml-1 p-1 rounded hover:bg-[#FAFAFA] transition-colors"
                  >
                    <ChevronDown className={cn(
                      "h-3.5 w-3.5 text-[#6B7280] transition-transform",
                      isExpanded && "rotate-180"
                    )} />
                  </button>
                )}
              </div>

              {hasChildren && isExpanded && !isCollapsed && (
                <div className="ml-3 mt-0.5 pl-3 border-l border-[#E5E5E5] space-y-0.5">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const childActive = isActive(child.path);
                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                          childActive
                            ? "bg-white text-[#3B82F6] font-semibold shadow-sm"
                            : "text-[#6B7280] hover:bg-white/60 hover:text-[#0A0A0A]"
                        )}
                      >
                        <ChildIcon className={cn(
                          "h-3.5 w-3.5 flex-shrink-0",
                          childActive ? "text-[#3B82F6]" : "text-[#6B7280]"
                        )} />
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

