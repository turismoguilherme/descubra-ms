import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/context/BrandContext";
import UserMenu from "./UserMenu";

const UniversalNavbar = () => {
  console.log("🧭 NAVBAR: Componente UniversalNavbar sendo renderizado");
  
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { config, isOverflowOne } = useBrand();
  const location = useLocation();
  
  console.log("🧭 NAVBAR: Estado - user:", !!user, "isOverflowOne:", isOverflowOne, "pathname:", location.pathname);

  // Memoizar a função de verificação de path ativo para melhor performance
  const isActivePath = useMemo(() => {
    return (path: string) => location.pathname === path;
  }, [location.pathname]);

  // Memoizar os itens de navegação para evitar re-renderizações desnecessárias
  const navigationItems = useMemo(() => config.navigation, [config.navigation]);
  const authenticatedNavigationItems = useMemo(() => config.authenticatedNavigation, [config.authenticatedNavigation]);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 relative z-50">
      <div className="ms-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isOverflowOne ? "/" : "/ms"} className="flex items-center justify-center flex-1 md:flex-none md:justify-start">
            <div className="flex items-center">
              {/* Logo SVG Definitiva */}
              <svg 
                width="180" 
                height="48" 
                viewBox="0 0 180 48" 
                className="h-12 w-auto"
                style={{ display: 'block' }}
              >
                {/* Fundo com gradiente */}
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor:'#1e40af', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#059669', stopOpacity:1}} />
                  </linearGradient>
                </defs>
                
                {/* Retângulo de fundo */}
                <rect width="180" height="48" fill="url(#logoGradient)" rx="8"/>
                
                {/* Ícone binocular/câmera */}
                <circle cx="24" cy="24" r="8" fill="white" opacity="0.9"/>
                <circle cx="40" cy="24" r="8" fill="white" opacity="0.9"/>
                <path d="M32 16 Q36 20 32 24 Q36 28 32 32" stroke="white" strokeWidth="2" fill="none" opacity="0.7"/>
                
                {/* Texto principal */}
                <text 
                  x="60" 
                  y="20" 
                  fill="white" 
                  fontSize="12" 
                  fontWeight="bold"
                  fontFamily="Arial, sans-serif"
                >
                  DESCUBRA
                </text>
                <text 
                  x="60" 
                  y="35" 
                  fill="white" 
                  fontSize="10" 
                  fontWeight="600"
                  fontFamily="Arial, sans-serif"
                >
                  MATO GROSSO DO SUL
                </text>
              </svg>
              <img 
                alt={config.logo.alt}
                src={`${config.logo.src}?v=6`}
                className="h-12 w-auto transition-transform duration-300 hover:scale-105 object-contain" 
                style={{ display: 'none', maxWidth: '100%', height: 'auto' }}
                loading="eager"
                onLoad={() => console.log('✅ Logo carregada com sucesso no UniversalNavbar!')}
                onError={(e) => {
                  console.error('❌ Erro ao carregar logo no UniversalNavbar:', e);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <span 
                className="text-lg font-bold text-ms-primary-blue"
                style={{ display: 'none' }}
              >
                {isOverflowOne ? "OverFlow One" : "Descubra MS"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map(item => (
              <Link 
                key={item.name} 
                to={item.path}
                onClick={() => console.log('🔗 NAVBAR: Clicou em', item.name, '->', item.path)}
                className={`text-sm font-medium transition-colors hover:text-ms-primary-blue ${
                  isActivePath(item.path) 
                    ? "text-ms-primary-blue border-b-2 border-ms-primary-blue pb-1" 
                    : "text-gray-700"
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {user && authenticatedNavigationItems.map(item => (
              <Link 
                key={item.name} 
                to={item.path}
                onClick={() => console.log('🔗 NAVBAR: Clicou em (auth)', item.name, '->', item.path)}
                className={`text-sm font-medium transition-colors hover:text-ms-primary-blue ${
                  isActivePath(item.path) 
                    ? "text-ms-primary-blue border-b-2 border-ms-primary-blue pb-1" 
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
              <UserMenu />
            ) : (
              <>
                {isOverflowOne ? (
                  <>
                    <Link to="/contato">
                      <Button size="sm" className="bg-ms-primary-blue text-white hover:bg-ms-primary-blue/90">
                        {config.cta.primary}
                      </Button>
                    </Link>
                    <Link to="/ms">
                      <Button variant="outline" size="sm">
                        {config.cta.secondary}
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/ms/login">
                      <Button variant="ghost" size="sm">
                        {config.cta.secondary}
                      </Button>
                    </Link>
                    <Link to="/ms/register">
                      <Button size="sm" className="bg-ms-secondary-yellow text-ms-primary-blue hover:bg-ms-secondary-yellow/90 font-semibold text-slate-950">
                        {config.cta.primary}
                      </Button>
                    </Link>
                  </>
                )}
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
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navigationItems.map(item => (
                <Link 
                  key={item.name} 
                  to={item.path}
                  onClick={() => {
                    console.log('🔗 NAVBAR MOBILE: Clicou em', item.name, '->', item.path);
                    setIsOpen(false);
                  }}
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath(item.path) 
                      ? "text-ms-primary-blue bg-blue-50" 
                      : "text-gray-700 hover:text-ms-primary-blue hover:bg-gray-50"
                  }`} 
                >
                  {item.name}
                </Link>
              ))}
              
              {user && authenticatedNavigationItems.map(item => (
                <Link 
                  key={item.name} 
                  to={item.path}
                  onClick={() => {
                    console.log('🔗 NAVBAR MOBILE AUTH: Clicou em', item.name, '->', item.path);
                    setIsOpen(false);
                  }}
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath(item.path) 
                      ? "text-ms-primary-blue bg-blue-50" 
                      : "text-gray-700 hover:text-ms-primary-blue hover:bg-gray-50"
                  }`} 
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
                    {isOverflowOne ? (
                      <>
                        <Link to="/contato" onClick={() => setIsOpen(false)}>
                          <Button size="sm" className="w-full bg-ms-primary-blue text-white hover:bg-ms-primary-blue/90">
                            {config.cta.primary}
                          </Button>
                        </Link>
                        <Link to="/ms" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" size="sm" className="w-full">
                            {config.cta.secondary}
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/ms/login" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" size="sm" className="w-full justify-start">
                            {config.cta.secondary}
                          </Button>
                        </Link>
                        <Link to="/ms/register" onClick={() => setIsOpen(false)}>
                          <Button size="sm" className="w-full bg-ms-secondary-yellow text-ms-primary-blue hover:bg-ms-secondary-yellow/90 font-semibold">
                            {config.cta.primary}
                          </Button>
                        </Link>
                      </>
                    )}
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

export default UniversalNavbar;