import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ViaJARLogo from "./ViaJARLogo";
import { menuService } from "@/services/admin/menuService";

const ViaJARNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navigationItems, setNavigationItems] = useState([
    { name: "Início", path: "/" },
    { name: "Soluções", path: "/solucoes" },
    { name: "Cases", path: "/casos-sucesso" },
    { name: "Preços", path: "/precos" },
    { name: "Dados de Turismo", path: "/dados-turismo" },
    { name: "Sobre", path: "/sobre" },
    { name: "Contato", path: "/contato" },
  ]);
  
  // Carregar menu do banco de dados
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const menus = await menuService.getMenus('viajar', 'main');
        if (menus && menus.length > 0) {
          const activeMenus = menus
            .filter((menu: any) => menu.is_active)
            .map((menu: any) => ({
              name: menu.label,
              path: menu.path || '/',
            }))
            .sort((a: any, b: any) => {
              const menuA = menus.find((m: any) => m.label === a.name);
              const menuB = menus.find((m: any) => m.label === b.name);
              return (menuA?.order_index || 0) - (menuB?.order_index || 0);
            });
          
          if (activeMenus.length > 0) {
            setNavigationItems(activeMenus);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar menu do banco:', error);
        // Manter itens padrão em caso de erro
      }
    };
    
    loadMenu();
  }, []);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Verificar se o AuthProvider está disponível
  let auth = null;
  try {
    auth = useAuth();
  } catch (error) {
    return (
      <nav className="bg-white/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <ViaJARLogo size="md" />
            <div className="h-9 w-24 bg-muted animate-pulse rounded-lg"></div>
          </div>
        </div>
      </nav>
    );
  }
  
  const { user, userProfile, loading } = auth;
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const userRole = userProfile?.role?.toLowerCase() || '';
  const isAdmin = !loading && 
                  user && 
                  userProfile && 
                  (userRole === 'admin' || 
                   userRole === 'master_admin' || 
                   userRole === 'tech' ||
                   userRole === 'master admin' ||
                   userRole === 'tech admin');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDashboardOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActivePath = (path: string) => location.pathname === path;

  const dashboardItems = [
    { name: "Dashboard", path: "/viajar/dashboard" },
    { name: "Guilherme", path: "/viajar/intelligence" },
    { name: "Inventário", path: "/viajar/inventario" },
    { name: "Relatórios", path: "/viajar/relatorios" },
    { name: "Leads", path: "/viajar/leads" },
    { name: "Setor Público", path: "/viajar/setor-publico" },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-border/50' 
        : 'bg-white/80 backdrop-blur-md border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <ViaJARLogo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigationItems.map(item => (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActivePath(item.path) 
                    ? "text-viajar-cyan bg-viajar-cyan/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <Button 
                  variant="ghost"
                  className="gap-2 text-foreground hover:bg-muted/50"
                  onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                >
                  Dashboard
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDashboardOpen ? 'rotate-180' : ''}`} />
                </Button>
                
                {isDashboardOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 border border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {dashboardItems.map(item => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`block px-4 py-2.5 text-sm transition-colors ${
                          isActivePath(item.path) 
                            ? 'bg-viajar-cyan/10 text-viajar-cyan font-medium' 
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                        onClick={() => setIsDashboardOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    {isAdmin && (
                      <>
                        <div className="border-t border-border/50 my-2"></div>
                        <Link
                          to="/viajar/admin"
                          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                            isActivePath('/viajar/admin') 
                              ? 'bg-viajar-cyan/10 text-viajar-cyan' 
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          }`}
                          onClick={() => setIsDashboardOpen(false)}
                        >
                          <Shield className="h-4 w-4" />
                          Área Admin
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/viajar/login">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    Entrar
                  </Button>
                </Link>
                <Link to="/viajar/register">
                  <Button className="bg-viajar-slate hover:bg-viajar-slate/90 text-white gap-2">
                    Começar Agora
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsOpen(!isOpen)} 
              className="text-foreground"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              {navigationItems.map(item => (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActivePath(item.path) 
                      ? "text-viajar-cyan bg-viajar-cyan/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`} 
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 space-y-2 border-t border-border/50 mt-4">
                {user ? (
                  <>
                    <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dashboard</p>
                    {dashboardItems.map(item => (
                      <Link 
                        key={item.name} 
                        to={item.path} 
                        className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                          isActivePath(item.path) 
                            ? "text-viajar-cyan bg-viajar-cyan/10" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`} 
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link 
                        to="/viajar/admin" 
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-viajar-cyan" 
                        onClick={() => setIsOpen(false)}
                      >
                        <Shield className="h-4 w-4" />
                        Área Admin
                      </Link>
                    )}
                  </>
                ) : (
                  <div className="space-y-2 px-4">
                    <Link to="/viajar/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Entrar
                      </Button>
                    </Link>
                    <Link to="/viajar/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-viajar-slate hover:bg-viajar-slate/90 text-white">
                        Começar Agora
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ViaJARNavbar;
