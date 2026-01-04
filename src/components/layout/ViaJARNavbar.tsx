import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Shield, ArrowRight, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ViaJARLogo from "./ViaJARLogo";
import { menuService } from "@/services/admin/menuService";

const ViaJARNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // Menu simplificado - apenas 5 itens principais (marketing-first)
  const [navigationItems, setNavigationItems] = useState([
    { name: "Soluções", path: "/solucoes", hasDropdown: true },
    { name: "Cases", path: "/casos-sucesso" },
    { name: "Preços", path: "/precos" },
    { name: "Sobre", path: "/sobre" },
    { name: "Contato", path: "/contato" },
  ]);

  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = useState(false);
  const solutionsDropdownRef = useRef<HTMLDivElement>(null);
  
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
      if (solutionsDropdownRef.current && !solutionsDropdownRef.current.contains(event.target as Node)) {
        setSolutionsDropdownOpen(false);
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
            {navigationItems.map(item => {
              if (item.hasDropdown && item.name === "Soluções") {
                return (
                  <div key={item.name} className="relative" ref={solutionsDropdownRef}>
                    <button
                      onClick={() => setSolutionsDropdownOpen(!solutionsDropdownOpen)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1 ${
                        isActivePath(item.path) 
                          ? "text-viajar-cyan bg-viajar-cyan/10" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {item.name}
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${solutionsDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {solutionsDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-[600px] bg-white rounded-xl shadow-xl border border-border/50 py-4 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                        <div className="grid grid-cols-2 gap-6 px-4">
                          {/* Para Empresários */}
                          <div>
                            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-viajar-cyan" />
                              Para Empresários
                            </h3>
                            <ul className="space-y-2">
                              <li>
                                <Link 
                                  to="/solucoes#revenue-optimizer"
                                  className="block p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                                  onClick={() => setSolutionsDropdownOpen(false)}
                                >
                                  <div className="font-semibold text-sm text-foreground group-hover:text-viajar-cyan transition-colors">
                                    Revenue Optimizer
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Maximize receita com precificação inteligente
                                  </div>
                                </Link>
                              </li>
                              <li>
                                <Link 
                                  to="/solucoes#market-intelligence"
                                  className="block p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                                  onClick={() => setSolutionsDropdownOpen(false)}
                                >
                                  <div className="font-semibold text-sm text-foreground group-hover:text-viajar-cyan transition-colors">
                                    Market Intelligence
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Entenda seu mercado e concorrentes
                                  </div>
                                </Link>
                              </li>
                              <li>
                                <Link 
                                  to="/solucoes#ia-conversacional"
                                  className="block p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                                  onClick={() => setSolutionsDropdownOpen(false)}
                                >
                                  <div className="font-semibold text-sm text-foreground group-hover:text-viajar-cyan transition-colors">
                                    IA Conversacional
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Assistente inteligente para seu negócio
                                  </div>
                                </Link>
                              </li>
                            </ul>
                          </div>

                          {/* Para Setor Público */}
                          <div>
                            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                              <Shield className="h-4 w-4 text-viajar-cyan" />
                              Para Setor Público
                            </h3>
                            <ul className="space-y-2">
                              <li>
                                <Link 
                                  to="/solucoes#inventario-turistico"
                                  className="block p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                                  onClick={() => setSolutionsDropdownOpen(false)}
                                >
                                  <div className="font-semibold text-sm text-foreground group-hover:text-viajar-cyan transition-colors">
                                    Inventário Turístico
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Gestão completa de atrativos
                                  </div>
                                </Link>
                              </li>
                              <li>
                                <Link 
                                  to="/solucoes#gestao-cats"
                                  className="block p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                                  onClick={() => setSolutionsDropdownOpen(false)}
                                >
                                  <div className="font-semibold text-sm text-foreground group-hover:text-viajar-cyan transition-colors">
                                    Gestão de CATs
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Controle total dos Centros de Atendimento
                                  </div>
                                </Link>
                              </li>
                              <li>
                                <Link 
                                  to="/solucoes#analytics-governamental"
                                  className="block p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                                  onClick={() => setSolutionsDropdownOpen(false)}
                                >
                                  <div className="font-semibold text-sm text-foreground group-hover:text-viajar-cyan transition-colors">
                                    Analytics Governamental
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Dados para tomada de decisão
                                  </div>
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="border-t border-border/50 mt-4 pt-4 px-4">
                          <Link 
                            to="/solucoes"
                            className="text-sm font-medium text-viajar-cyan hover:text-viajar-cyan/80 flex items-center gap-1"
                            onClick={() => setSolutionsDropdownOpen(false)}
                          >
                            Ver todas as soluções
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
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
              );
            })}
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
              {navigationItems.map(item => {
                if (item.hasDropdown && item.name === "Soluções") {
                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => setSolutionsDropdownOpen(!solutionsDropdownOpen)}
                        className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors flex items-center justify-between ${
                          isActivePath(item.path) 
                            ? "text-viajar-cyan bg-viajar-cyan/10" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {item.name}
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${solutionsDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {solutionsDropdownOpen && (
                        <div className="px-4 py-2 space-y-2 bg-muted/30 rounded-lg mt-1">
                          <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Para Empresários</div>
                          <Link to="/solucoes#revenue-optimizer" onClick={() => { setIsOpen(false); setSolutionsDropdownOpen(false); }} className="block py-2 text-sm text-foreground">
                            Revenue Optimizer
                          </Link>
                          <Link to="/solucoes#market-intelligence" onClick={() => { setIsOpen(false); setSolutionsDropdownOpen(false); }} className="block py-2 text-sm text-foreground">
                            Market Intelligence
                          </Link>
                          <Link to="/solucoes#ia-conversacional" onClick={() => { setIsOpen(false); setSolutionsDropdownOpen(false); }} className="block py-2 text-sm text-foreground">
                            IA Conversacional
                          </Link>
                          
                          <div className="text-xs font-semibold text-muted-foreground uppercase mb-2 mt-4">Para Setor Público</div>
                          <Link to="/solucoes#inventario-turistico" onClick={() => { setIsOpen(false); setSolutionsDropdownOpen(false); }} className="block py-2 text-sm text-foreground">
                            Inventário Turístico
                          </Link>
                          <Link to="/solucoes#gestao-cats" onClick={() => { setIsOpen(false); setSolutionsDropdownOpen(false); }} className="block py-2 text-sm text-foreground">
                            Gestão de CATs
                          </Link>
                          <Link to="/solucoes#analytics-governamental" onClick={() => { setIsOpen(false); setSolutionsDropdownOpen(false); }} className="block py-2 text-sm text-foreground">
                            Analytics Governamental
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                }
                
                return (
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
                );
              })}
              
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
