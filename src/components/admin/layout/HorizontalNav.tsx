import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Building2,
  MapPin,
  DollarSign,
  Shield,
  Bot,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NavItem {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navItems: NavItem[] = [
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
      { label: 'Funcionários', path: '/viajar/admin/viajar/employees' },
      { label: 'Clientes', path: '/viajar/admin/viajar/clients' },
      { label: 'Assinaturas', path: '/viajar/admin/viajar/subscriptions' },
      { label: 'Páginas', path: '/viajar/admin/viajar/pages' },
      { label: 'Configurações', path: '/viajar/admin/viajar/settings' },
    ],
  },
  {
    label: 'Descubra MS',
    path: '/viajar/admin/descubra-ms',
    icon: MapPin,
    children: [
      { label: 'Homepage', path: '/viajar/admin/descubra-ms/homepage' },
      { label: 'Destinos', path: '/viajar/admin/descubra-ms/destinations' },
      { label: 'Eventos', path: '/viajar/admin/descubra-ms/events' },
      { label: 'Parceiros', path: '/viajar/admin/descubra-ms/partners' },
      { label: 'Passaporte Digital', path: '/viajar/admin/descubra-ms/passport' },
      { label: 'Conteúdo', path: '/viajar/admin/descubra-ms/content' },
      { label: 'Usuários', path: '/viajar/admin/descubra-ms/users' },
      { label: 'Configurações', path: '/viajar/admin/descubra-ms/settings' },
    ],
  },
  {
    label: 'Financeiro',
    path: '/viajar/admin/financial',
    icon: DollarSign,
    children: [
      { label: 'Receitas', path: '/viajar/admin/financial' },
      { label: 'Contas a Pagar', path: '/viajar/admin/financial/bills' },
      { label: 'Despesas', path: '/viajar/admin/financial/expenses' },
      { label: 'Salários', path: '/viajar/admin/financial/salaries' },
      { label: 'Relatórios', path: '/viajar/admin/financial/reports' },
    ],
  },
  {
    label: 'Sistema',
    path: '/viajar/admin/system',
    icon: Shield,
    children: [
      { label: 'Monitoramento', path: '/viajar/admin/system/monitoring' },
      { label: 'Logs', path: '/viajar/admin/system/logs' },
      { label: 'Configurações', path: '/viajar/admin/system/settings' },
    ],
  },
  {
    label: 'IA',
    path: '/viajar/admin/ai',
    icon: Bot,
    children: [
      { label: 'Chat', path: '/viajar/admin/ai/chat' },
      { label: 'Sugestões', path: '/viajar/admin/ai/suggestions' },
    ],
  },
];

export default function HorizontalNav() {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isActive = (path: string) => {
    if (path === '/viajar/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const hasActiveChild = (item: NavItem) => {
    return item.children?.some(child => isActive(child.path));
  };

  return (
    <nav className="h-12 bg-white dark:bg-white border-b border-gray-200 flex items-center px-6 fixed top-16 left-0 right-0 z-40 overflow-x-auto">
      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path) || hasActiveChild(item);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.path} className="relative">
              {hasChildren ? (
                <div
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.path)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors relative",
                      active
                        ? "text-gray-900"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                    <ChevronDown className="h-3 w-3" />
                    {active && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                    )}
                  </Link>

                  {openDropdown === item.path && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[200px] py-1 z-50">
                      {item.children?.map((child) => {
                        const childActive = isActive(child.path);
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={cn(
                              "flex items-center px-4 py-2 text-sm transition-colors",
                              childActive
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors relative",
                    active
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                  {active && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

