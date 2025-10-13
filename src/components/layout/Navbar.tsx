import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import UserMenu from "./UserMenu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  
  // Detectar tenant do path atual
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentTenant = pathSegments[0]; // 'ms', 'mt', etc.
  const isTenantPath = currentTenant && currentTenant.length === 2;
  
  console.log("🏛️ NAVBAR: Tenant detectado:", currentTenant, "isTenantPath:", isTenantPath);
  
  const isActivePath = (path: string) => {
    // Considerar tenant no path ativo
    const fullPath = isTenantPath ? `/${currentTenant}${path}` : path;
    return location.pathname === fullPath;
  };
  
  const getPathWithTenant = (path: string) => {
    return isTenantPath ? `/${currentTenant}${path}` : path;
  };
  
  const navItems = [{
    name: "Início",
    path: "/"
  }, {
    name: "Destinos",
    path: "/destinos"
  }, {
    name: "Eventos",
    path: "/eventos"
  }, {
    name: "Roteiros",
    path: "/roteiros"
  }, {
    name: "Parceiros",
    path: "/parceiros"
  }, {
    name: "Sobre",
    path: "/sobre"
  }];
  
  const authenticatedNavItems = [{
    name: "Guatá IA",
    path: "/guata"
  }, {
    name: "Passaporte Digital",
    path: "/passaporte"
  }];
  
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="ms-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={getPathWithTenant("/")} className="flex items-center justify-center flex-1 md:flex-none md:justify-start">
            <div className="flex items-center">
              <img 
                alt="Descubra Mato Grosso do Sul" 
                src="/images/logo-descubra-ms.png?v=6" 
                className="h-12 w-auto transition-transform duration-300 hover:scale-105 object-contain" 
                style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
                loading="eager" 
                onError={(e) => {
                  console.error('Erro ao carregar logo:', e);
                  e.currentTarget.src = '/images/logo-descubra-ms.png';
                }}
                onLoad={() => console.log('Logo carregada com sucesso!')}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              <Link 
                key={item.name} 
                to={getPathWithTenant(item.path)} 
                className={`text-sm font-medium transition-colors hover:text-ms-primary-blue ${isActivePath(item.path) ? "text-ms-primary-blue border-b-2 border-ms-primary-blue pb-1" : "text-gray-700"}`}
              >
                {item.name}
              </Link>
            ))}
            
            {user && authenticatedNavItems.map(item => (
              <Link 
                key={item.name} 
                to={getPathWithTenant(item.path)} 
                className={`text-sm font-medium transition-colors hover:text-ms-primary-blue ${isActivePath(item.path) ? "text-ms-primary-blue border-b-2 border-ms-primary-blue pb-1" : "text-gray-700"}`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <UserMenu />
            ) : (
              <>
                <Link to={getPathWithTenant("/login")}>
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link to={getPathWithTenant("/register")}>
                  <Button size="sm" className="bg-ms-secondary-yellow text-ms-primary-blue hover:bg-ms-secondary-yellow/90 font-semibold text-slate-950">
                    Cadastrar
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navItems.map(item => (
                <Link 
                  key={item.name} 
                  to={getPathWithTenant(item.path)} 
                  className={`block px-3 py-2 text-base font-medium transition-colors ${isActivePath(item.path) ? "text-ms-primary-blue bg-blue-50" : "text-gray-700 hover:text-ms-primary-blue hover:bg-gray-50"}`} 
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {user && authenticatedNavItems.map(item => (
                <Link 
                  key={item.name} 
                  to={getPathWithTenant(item.path)} 
                  className={`block px-3 py-2 text-base font-medium transition-colors ${isActivePath(item.path) ? "text-ms-primary-blue bg-blue-50" : "text-gray-700 hover:text-ms-primary-blue hover:bg-gray-50"}`} 
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Auth */}
              <div className="pt-4 pb-3 border-t border-gray-200">
                {user ? (
                  <div className="px-3">
                    <UserMenu />
                  </div>
                ) : (
                  <div className="space-y-2 px-3">
                    <Link to={getPathWithTenant("/login")} onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Entrar
                      </Button>
                    </Link>
                    <Link to={getPathWithTenant("/register")} onClick={() => setIsOpen(false)}>
                      <Button size="sm" className="w-full bg-ms-secondary-yellow text-ms-primary-blue hover:bg-ms-secondary-yellow/90 font-semibold">
                        Cadastrar
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

export default Navbar;