import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const ViaJARNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  
  // Verificar se o AuthProvider está disponível
  let auth = null;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('ViaJARNavbar: AuthProvider não disponível:', error);
    // Retornar navbar sem funcionalidades de usuário
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
  
  const { user, userProfile, loading } = auth;
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Verificar se é admin
  const userRole = userProfile?.role?.toLowerCase() || '';
  const isAdmin = !loading && 
                  user && 
                  userProfile && 
                  (userRole === 'admin' || 
                   userRole === 'master_admin' || 
                   userRole === 'tech' ||
                   userRole === 'master admin' ||
                   userRole === 'tech admin');

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDashboardOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActivePath = (path: string) => location.pathname === path;

  const navigationItems = [
    { name: "Início", path: "/" },
    { name: "Soluções", path: "/solucoes" },
    { name: "Casos de Sucesso", path: "/casos-sucesso" },
    { name: "Preços", path: "/precos" },
    { name: "Sobre", path: "/sobre" },
    { name: "Contato", path: "/contato" },
  ];

  const dashboardItems = [
    { name: "Dashboard", path: "/viajar/dashboard" },
    { name: "Guilherme", path: "/viajar/intelligence" },
    { name: "Inventário", path: "/viajar/inventario" },
    { name: "Relatórios", path: "/viajar/relatorios" },
    { name: "Leads", path: "/viajar/leads" },
    { name: "Setor Público", path: "/viajar/setor-publico" },
    { name: "Sistema CAT", path: "/viajar/attendant-checkin" },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="text-2xl font-bold">
              <span className="text-blue-900">Viaj</span>
              <span className="text-cyan-500">AR</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map(item => (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`text-sm font-medium transition-colors hover:text-cyan-600 ${
                  isActivePath(item.path) 
                    ? "text-cyan-600 border-b-2 border-cyan-600 pb-1" 
                    : "text-gray-700"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                  onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                >
                  Dashboard
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
                
                {isDashboardOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                    {dashboardItems.map(item => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                          isActivePath(item.path) ? 'bg-cyan-50 text-cyan-600' : ''
                        }`}
                        onClick={() => setIsDashboardOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    {isAdmin && (
                      <>
                        <div className="border-t my-1"></div>
                        <Link
                          to="/viajar/admin"
                          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
                            isActivePath('/viajar/admin') 
                              ? 'bg-cyan-50 text-cyan-600' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={() => setIsDashboardOpen(false)}
                        >
                          <Shield className="h-4 w-4" />
                          Área Administrativa
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/viajar/login">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-cyan-600">
                    Entrar
                  </Button>
                </Link>
                <Link to="/viajar/register">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                    Começar Grátis
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(!isOpen)} 
              className="inline-flex items-center justify-center p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="space-y-1">
              {navigationItems.map(item => (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  className={`block px-3 py-2 text-base font-medium transition-colors rounded-md ${
                    isActivePath(item.path) 
                      ? "text-cyan-600 bg-cyan-50" 
                      : "text-gray-700 hover:text-cyan-600 hover:bg-gray-50"
                  }`} 
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 space-y-2">
                {user ? (
                  <>
                    <div className="text-sm font-medium text-gray-500 mb-2">Dashboard</div>
                    {dashboardItems.map(item => (
                      <Link 
                        key={item.name} 
                        to={item.path} 
                        className={`block px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                          isActivePath(item.path) 
                            ? "text-cyan-600 bg-cyan-50" 
                            : "text-gray-700 hover:text-cyan-600 hover:bg-gray-50"
                        }`} 
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    {isAdmin && (
                      <>
                        <div className="border-t my-2"></div>
                        <Link 
                          to="/viajar/admin" 
                          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                            isActivePath('/viajar/admin') 
                              ? "text-cyan-600 bg-cyan-50" 
                              : "text-gray-700 hover:text-cyan-600 hover:bg-gray-50"
                          }`} 
                          onClick={() => setIsOpen(false)}
                        >
                          <Shield className="h-4 w-4" />
                          Área Administrativa
                        </Link>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Link to="/viajar/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        Entrar
                      </Button>
                    </Link>
                    <Link to="/viajar/register" onClick={() => setIsOpen(false)}>
                      <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                        Começar Grátis
                      </Button>
                    </Link>
                  </>
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
