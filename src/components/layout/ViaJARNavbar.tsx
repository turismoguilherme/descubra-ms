// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ViaJARLogo from "./ViaJARLogo";
import { menuService } from "@/services/admin/menuService";

/** Itens padrão do marketing Viajar (sem /solucoes — página fora do layout atual). */
const DEFAULT_VIAJAR_NAV_ITEMS = [
  { name: "Cases", path: "/casos-sucesso" },
  { name: "Preços", path: "/precos" },
  { name: "Sobre", path: "/sobre" },
  { name: "Contato", path: "/contato" },
];

function isHiddenMarketingNavItem(item: { name: string; path: string }) {
  const path = (item.path || "").toLowerCase().split("?")[0];
  const label = (item.name || "").trim().toLowerCase();
  return path === "/solucoes" || label === "soluções" || label === "solucoes";
}

const ViaJARNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navigationItems, setNavigationItems] = useState(DEFAULT_VIAJAR_NAV_ITEMS);
  
  // Carregar menu do banco de dados
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const menus = await menuService.getMenus('viajar', 'main');
        if (menus && menus.length > 0) {
          const activeMenus = menus
            .filter((menu: unknown) => menu.is_active)
            .map((menu: unknown) => ({
              name: menu.label,
              path: menu.path || '/',
            }))
            .sort((a: unknown, b: unknown) => {
              const menuA = menus.find((m: unknown) => m.label === a.name);
              const menuB = menus.find((m: unknown) => m.label === b.name);
              return (menuA?.order_index || 0) - (menuB?.order_index || 0);
            });

          const withoutLegacySolucoes = activeMenus.filter(
            (item: { name: string; path: string }) => !isHiddenMarketingNavItem(item)
          );

          if (withoutLegacySolucoes.length > 0) {
            setNavigationItems(withoutLegacySolucoes);
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

  // Dashboard simplificado - apenas Dashboard e Admin
  const dashboardItems = [
    { name: "Dashboard", path: "/viajar/dashboard" },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 border-b ${
      isScrolled 
        ? 'bg-guata-deep shadow-md border-guata-gold/25' 
        : 'bg-guata-deep border-guata-gold/15'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <ViaJARLogo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  isActivePath(item.path)
                    ? 'text-guata-gold bg-guata-gold/15'
                    : 'text-white hover:text-guata-gold-light hover:bg-white/10'
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
                  className="gap-2 text-white hover:text-guata-gold-light hover:bg-white/10"
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
                            ? 'bg-guata-gold/15 text-guata-forest font-medium' 
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
                              ? 'bg-guata-gold/15 text-guata-forest' 
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
                    <Button variant="ghost" className="text-white hover:text-guata-gold-light hover:bg-white/10">
                      Entrar
                  </Button>
                </Link>
                <Link to="/viajar/register">
                  <Button className="bg-gradient-to-r from-guata-gold to-guata-gold-light hover:from-guata-gold-light hover:to-guata-gold text-guata-deep gap-2 relative group shadow-[0_0_20px_rgba(201,162,76,0.35)] hover:shadow-[0_0_28px_rgba(201,162,76,0.45)]">
                    <div className="absolute inset-0 bg-gradient-to-r from-guata-gold to-guata-gold-light rounded opacity-0 group-hover:opacity-25 blur-xl transition-opacity duration-300" />
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
              className="text-white hover:text-guata-gold-light"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 bg-guata-deep border-t border-guata-gold/20 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActivePath(item.path) ? 'text-guata-gold bg-white/10' : 'text-white hover:bg-white/10'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 space-y-2 border-t border-white/15 mt-4">
                {user ? (
                  <>
                    <p className="px-4 text-xs font-semibold text-guata-cream/80 uppercase tracking-wider">Dashboard</p>
                    {dashboardItems.map(item => (
                      <Link 
                        key={item.name} 
                        to={item.path} 
                        className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                          isActivePath(item.path) 
                            ? "text-guata-gold bg-white/10" 
                            : "text-white hover:bg-white/10"
                        }`} 
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link 
                        to="/viajar/admin" 
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-guata-gold" 
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
                      <Button variant="outline" className="w-full border-guata-cream/40 text-white hover:bg-white/10">
                        Entrar
                      </Button>
                    </Link>
                    <Link to="/viajar/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-guata-gold hover:bg-guata-gold-light text-guata-deep font-semibold">
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
