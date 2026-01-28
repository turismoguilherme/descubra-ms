import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import UserMenu from "./UserMenu";
import { LanguageSelector } from "./LanguageSelector";
import { useBrand } from "@/context/BrandContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation('common');
  
  // Tentar obter logo do BrandContext, com fallback
  let logoUrl = "/images/logo-descubra-ms.png?v=3";
  let logoAlt = "Descubra Mato Grosso do Sul";
  try {
    const brand = useBrand();
    if (brand && brand.isMS) {
      logoUrl = brand.config.logo.src;
      logoAlt = brand.config.logo.alt;
    }
  } catch (error) {
    // BrandContext não disponível, usar fallback
  }
  
  // Detectar tenant do path atual
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentTenant = pathSegments[0]; // 'ms', 'descubramatogrossodosul', etc.
  
  // Verificar se é um path do Descubra MS (aceita 'ms' ou 'descubramatogrossodosul')
  const isDescubraMS = currentTenant === 'descubramatogrossodosul' || currentTenant === 'ms';
  // Aceita também outros tenants de 2 caracteres para compatibilidade
  const isTenantPath = isDescubraMS || (currentTenant && currentTenant.length === 2);
  
  console.log("🏛️ NAVBAR: Tenant detectado:", currentTenant, "isTenantPath:", isTenantPath, "isDescubraMS:", isDescubraMS);
  
  const isActivePath = (path: string) => {
    // Considerar tenant no path ativo
    // Para Descubra MS, usar sempre 'descubramatogrossodosul' como prefixo
    const tenantPrefix = isDescubraMS ? 'descubramatogrossodosul' : currentTenant;
    const fullPath = isTenantPath ? `/${tenantPrefix}${path}` : path;
    return location.pathname === fullPath;
  };
  
  const getPathWithTenant = (path: string) => {
    // Para Descubra MS, usar sempre 'descubramatogrossodosul' como prefixo
    if (isDescubraMS) {
      return `/descubrams${path}`;
    }
    return isTenantPath ? `/${currentTenant}${path}` : path;
  };
  
  const navItems = [{
    nameKey: "nav.home",
    path: "/"
  }, {
    nameKey: "nav.destinations",
    path: "/destinos"
  }, {
    nameKey: "nav.events",
    path: "/eventos"
  }, {
    nameKey: "nav.routes",
    path: "/roteiros"
  }, {
    nameKey: "nav.partners",
    path: "/parceiros"
  }, {
    nameKey: "nav.about",
    path: "/sobre"
  }];
  
  const authenticatedNavItems = [{
    nameKey: "nav.guata",
    path: "/guata"
  }, {
    nameKey: "nav.passport",
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
                alt={logoAlt} 
                src={logoUrl} 
                className="h-12 w-auto transition-transform duration-300 hover:scale-105 object-contain" 
                loading="eager"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/logo-descubra-ms.png?v=3";
                }}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              <Link 
                key={item.nameKey} 
                to={getPathWithTenant(item.path)} 
                className={`text-sm font-medium transition-colors hover:text-ms-primary-blue ${isActivePath(item.path) ? "text-ms-primary-blue border-b-2 border-ms-primary-blue pb-1" : "text-gray-700"}`}
              >
                {t(item.nameKey)}
              </Link>
            ))}
            
            {user && authenticatedNavItems.map(item => (
              <Link 
                key={item.nameKey} 
                to={getPathWithTenant(item.path)} 
                className={`text-sm font-medium transition-colors hover:text-ms-primary-blue ${isActivePath(item.path) ? "text-ms-primary-blue border-b-2 border-ms-primary-blue pb-1" : "text-gray-700"}`}
              >
                {t(item.nameKey)}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector />
            {user ? (
              <UserMenu />
            ) : (
              <>
                <Link to={getPathWithTenant("/login")}>
                  <Button variant="ghost" size="sm">
                    {t('buttons.login')}
                  </Button>
                </Link>
                <Link to={getPathWithTenant("/register")}>
                  <Button size="sm" className="bg-ms-secondary-yellow text-ms-primary-blue hover:bg-ms-secondary-yellow/90 font-semibold text-slate-950">
                    {t('buttons.register')}
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
                  key={item.nameKey} 
                  to={getPathWithTenant(item.path)} 
                  className={`block px-3 py-2 text-base font-medium transition-colors ${isActivePath(item.path) ? "text-ms-primary-blue bg-blue-50" : "text-gray-700 hover:text-ms-primary-blue hover:bg-gray-50"}`} 
                  onClick={() => setIsOpen(false)}
                >
                  {t(item.nameKey)}
                </Link>
              ))}
              
              {user && authenticatedNavItems.map(item => (
                <Link 
                  key={item.nameKey} 
                  to={getPathWithTenant(item.path)} 
                  className={`block px-3 py-2 text-base font-medium transition-colors ${isActivePath(item.path) ? "text-ms-primary-blue bg-blue-50" : "text-gray-700 hover:text-ms-primary-blue hover:bg-gray-50"}`} 
                  onClick={() => setIsOpen(false)}
                >
                  {t(item.nameKey)}
                </Link>
              ))}

              {/* Mobile Auth */}
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="px-3 mb-3">
                  <LanguageSelector />
                </div>
                {user ? (
                  <div className="px-3">
                    <UserMenu />
                  </div>
                ) : (
                  <div className="space-y-2 px-3">
                    <Link to={getPathWithTenant("/login")} onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        {t('buttons.login')}
                      </Button>
                    </Link>
                    <Link to={getPathWithTenant("/register")} onClick={() => setIsOpen(false)}>
                      <Button size="sm" className="w-full bg-ms-secondary-yellow text-ms-primary-blue hover:bg-ms-secondary-yellow/90 font-semibold">
                        {t('buttons.register')}
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