import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const routeLabels: Record<string, string> = {
  '/viajar/admin': 'Dashboard',
  '/viajar/admin/viajar': 'ViajARTur',
  '/viajar/admin/viajar/employees': 'Funcionários',
  '/viajar/admin/viajar/clients': 'Clientes',
  '/viajar/admin/viajar/subscriptions': 'Assinaturas',
  '/viajar/admin/viajar/pages': 'Páginas',
  '/viajar/admin/viajar/settings': 'Configurações',
  '/viajar/admin/descubra-ms': 'Descubra MS',
  '/viajar/admin/descubra-ms/homepage': 'Homepage',
  '/viajar/admin/descubra-ms/destinations': 'Destinos',
  '/viajar/admin/descubra-ms/events': 'Eventos',
  '/viajar/admin/descubra-ms/partners': 'Parceiros',
  '/viajar/admin/descubra-ms/passport': 'Passaporte Digital',
  '/viajar/admin/descubra-ms/content': 'Conteúdo',
  '/viajar/admin/descubra-ms/users': 'Usuários',
  '/viajar/admin/descubra-ms/settings': 'Configurações',
  '/viajar/admin/financial': 'Financeiro',
  '/viajar/admin/financial/payments': 'Pagamentos',
  '/viajar/admin/financial/reports': 'Relatórios',
  '/viajar/admin/system': 'Sistema',
  '/viajar/admin/system/fallback': 'Fallback',
  '/viajar/admin/system/monitoring': 'Monitoramento',
  '/viajar/admin/system/logs': 'Auditoria',
  '/viajar/admin/ai': 'IA Administradora',
  '/viajar/admin/ai/chat': 'Chat',
  '/viajar/admin/ai/suggestions': 'Sugestões',
  '/viajar/admin/ai/actions': 'Ações Pendentes',
};

export default function AdminBreadcrumb() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);
  
  const breadcrumbs = paths.map((_, index) => {
    const path = '/' + paths.slice(0, index + 1).join('/');
    return {
      path,
      label: routeLabels[path] || paths[index].charAt(0).toUpperCase() + paths[index].slice(1),
    };
  });

  // Adicionar "Admin" no início se não estiver no dashboard
  if (location.pathname !== '/viajar/admin') {
    breadcrumbs.unshift({
      path: '/viajar/admin',
      label: 'Dashboard',
    });
  }

  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link
        to="/viajar/admin"
        className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <div key={crumb.path} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-[#E5E5E5]" />
            {isLast ? (
              <span className="text-[#0A0A0A] font-medium">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.path}
                className="text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

