import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import {
  ChevronRight,
  LogOut,
  Menu,
  Building2,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AdminNotifications } from '@/components/admin/notifications/AdminNotifications';
import { adminModulesConfig, AdminModule, Platform } from '@/config/adminModulesConfig';

// Definição das permissões por cargo
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  master_admin: ['*'],
  admin: ['*', 'communication'],
  tech: ['*', 'communication'],
  financeiro: ['dashboard', 'financial', 'reports'],
  rh: ['dashboard', 'employees', 'salaries'],
  comercial: ['dashboard', 'clients', 'subscriptions', 'partners'],
  platforms: ['dashboard', 'viajar', 'descubra_ms'],
  editor: ['dashboard', 'events', 'destinations'],
  atendente: ['dashboard', 'cat', 'users'],
};

// Usar configuração centralizada de módulos admin
// A configuração está em src/config/adminModulesConfig.ts
const navigationItems = adminModulesConfig;

interface ModernAdminLayoutProps {
  children: React.ReactNode;
}

export default function ModernAdminLayout({ children }: ModernAdminLayoutProps) {
  const { user, userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard']);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userRole = userProfile?.role || 'user';

    // Detectar qual plataforma está sendo editada
  const getCurrentPlatform = (): Platform => {
    if (location.pathname.includes('/viajar/admin/viajar')) {
      return 'viajar';
    }
    if (location.pathname.includes('/descubra-ms')) {
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

  const filterNavItems = (items: AdminModule[]): AdminModule[] => {
    return items.filter(item => {
    if (!hasPermission(item.permission)) return false;
    if (item.children) {
        item.children = filterNavItems(item.children);
      return item.children.length > 0;
    }
    return true;
  });
  };

  const filteredNavItems = filterNavItems(navigationItems);

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
    const expandParents = (items: AdminModule[]) => {
      items.forEach(item => {
        if (item.children) {
          const hasActiveChild = item.children.some(child => 
            isActive(child.path) || (child.children && child.children.some(gc => isActive(gc.path)))
          );
          if (hasActiveChild && !expandedItems.includes(item.id)) {
          setExpandedItems(prev => [...prev, item.id]);
        }
          expandParents(item.children);
      }
    });
    };
    expandParents(navigationItems);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <ViaJARNavbar />
      
      {/* Header com gradiente azul-roxo - Igual aos outros dashboards */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-3xl font-bold">
                Dashboard <span className="text-blue-200">Administrativo</span>
              </h1>
              <p className="text-blue-100 mt-1 md:mt-2 text-sm md:text-base">
                {userProfile?.full_name || 'Administrador'} - {userRole === 'master_admin' ? 'Master Admin' : userRole}
              </p>
              </div>
            <div className="flex gap-2 md:gap-4 items-center w-full md:w-auto">
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
              {/* Notificações */}
              <AdminNotifications />
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

      <div className="flex flex-col md:flex-row relative" style={{ minHeight: 'calc(100vh - 64px - 128px)' }}>
        {/* Botão Menu Mobile */}
        <div className="md:hidden fixed top-20 left-4 z-50">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white shadow-lg">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Administração</h2>
                <nav className="space-y-2">
                  {filteredNavItems.map((item) => {
                    const Icon = item.icon;
                    const hasChildren = item.children && item.children.length > 0;
                    const isExpanded = expandedItems.includes(item.id);
                    const isItemActive = item.path ? isActive(item.path) : item.children?.some(c => isActive(c.path) || c.children?.some(gc => isActive(gc.path)));

                    const renderNavItem = (navItem: AdminModule, level: number = 0): React.ReactNode => {
                      const NavIcon = navItem.icon;
                      const hasNavChildren = navItem.children && navItem.children.length > 0;
                      const isNavExpanded = expandedItems.includes(navItem.id);
                      const isNavActive = navItem.path ? isActive(navItem.path) : navItem.children?.some(c => isActive(c.path) || c.children?.some(gc => isActive(gc.path)));

                      if (hasNavChildren) {
                        return (
                          <div key={navItem.id} className={level > 0 ? "mt-1" : ""}>
                            <button
                              onClick={() => toggleExpanded(navItem.id)}
                              className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                                isNavActive 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <NavIcon className="h-4 w-4" />
                              <span className="flex-1">{navItem.label}</span>
                              <ChevronRight className={cn(
                                "h-4 w-4 transition-transform",
                                isNavExpanded && "rotate-90"
                              )} />
                            </button>
                            {isNavExpanded && (
                              <div className={cn("mt-1 space-y-1", level === 0 ? "ml-4" : "ml-6")}>
                                {navItem.children?.map((child) => renderNavItem(child, level + 1))}
                              </div>
                            )}
                          </div>
                        );
                      } else {
                        return (
                          <Link
                            key={navItem.id}
                            to={navItem.path || '#'}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                              level === 0 ? 'text-base' : level === 1 ? 'text-sm' : 'text-xs'
                            } ${
                              isActive(navItem.path)
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <NavIcon className="h-4 w-4" />
                            <span>{navItem.label}</span>
                          </Link>
                        );
                      }
                    };

                    return renderNavItem(item);
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Sidebar Esquerda - Igual aos outros dashboards (branca) - Responsiva */}
        <div className="hidden md:block w-64 bg-white shadow-lg flex-shrink-0 relative md:max-h-[calc(100vh-64px-128px)] overflow-y-auto">
          <div className="p-4 md:p-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-4 md:mb-6">Administração</h2>
            <nav className="space-y-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems.includes(item.id);
                const isItemActive = item.path ? isActive(item.path) : item.children?.some(c => isActive(c.path) || c.children?.some(gc => isActive(gc.path)));

                const renderNavItem = (navItem: AdminModule, level: number = 0): React.ReactNode => {
                  const NavIcon = navItem.icon;
                  const hasNavChildren = navItem.children && navItem.children.length > 0;
                  const isNavExpanded = expandedItems.includes(navItem.id);
                  const isNavActive = navItem.path ? isActive(navItem.path) : navItem.children?.some(c => isActive(c.path) || c.children?.some(gc => isActive(gc.path)));

                  if (hasNavChildren) {
              return (
                      <div key={navItem.id} className={level > 0 ? "mt-1" : ""}>
                    <button
                          onClick={() => toggleExpanded(navItem.id)}
                          className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                            isNavActive 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <NavIcon className="h-4 w-4" />
                          <span className="flex-1">{navItem.label}</span>
                          <ChevronRight className={cn(
                            "h-4 w-4 transition-transform",
                            isNavExpanded && "rotate-90"
                          )} />
                    </button>
                        {isNavExpanded && (
                          <div className={cn("mt-1 space-y-1", level === 0 ? "ml-4" : "ml-6")}>
                            {navItem.children?.map((child) => renderNavItem(child, level + 1))}
                    </div>
                  )}
                </div>
              );
                  } else {
                    return (
                      <Link
                        key={navItem.id}
                        to={navItem.path || '#'}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                          level === 0 ? 'text-base' : level === 1 ? 'text-sm' : 'text-xs'
                        } ${
                          isActive(navItem.path)
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <NavIcon className="h-4 w-4" />
                        <span>{navItem.label}</span>
                      </Link>
                    );
                  }
                };

                return renderNavItem(item);
              })}
        </nav>
          </div>
        </div>

        {/* Conteúdo Principal - Igual aos outros dashboards - Responsivo */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-gray-50" style={{ maxHeight: 'calc(100vh - 64px - 128px)' }}>
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
