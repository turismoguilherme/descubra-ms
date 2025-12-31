import React, { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/context/BrandContext";
import UserMenu from "./UserMenu";
import { LanguageSelector } from "./LanguageSelector";

const UniversalNavbar = () => {
  const enableDebugLogs = import.meta.env.VITE_DEBUG_LOGS === 'true';
  const safeLog = (payload: any) => {
    if (!enableDebugLogs) return;
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,timestamp:Date.now(),sessionId:'debug-session',runId:'run1'})}).catch(()=>{});
  };

  console.log("🧭 NAVBAR: Componente UniversalNavbar sendo renderizado");
  // #region agent log
  safeLog({location:'UniversalNavbar.tsx:9',message:'UniversalNavbar iniciando renderização',data:{timestamp:Date.now()},hypothesisId:'D'});
  // #endregion
  
  const [isOpen, setIsOpen] = useState(false);
  
  // Verificar se o AuthProvider está disponível
  let auth = null;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('UniversalNavbar: AuthProvider não disponível:', error);
    // #region agent log
    safeLog({location:'UniversalNavbar.tsx:19',message:'UniversalNavbar AuthProvider erro capturado',data:{error:String(error)},hypothesisId:'C'});
    // #endregion
    // Retornar navbar sem funcionalidades de usuário
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200 relative" style={{ zIndex: 1000 }}>
        <div className="ms-container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="h-12 w-32 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
  
  // Verificar se o BrandProvider está disponível
  // #region agent log
  safeLog({location:'UniversalNavbar.tsx:37',message:'UniversalNavbar ANTES de chamar useBrand',data:{timestamp:Date.now()},hypothesisId:'B'});
  // #endregion
  let brandContext = null;
  try {
    brandContext = useBrand();
    // #region agent log
    safeLog({location:'UniversalNavbar.tsx:40',message:'UniversalNavbar useBrand sucesso',data:{hasContext:!!brandContext},hypothesisId:'B'});
    // #endregion
  } catch (error) {
    // #region agent log
    safeLog({location:'UniversalNavbar.tsx:42',message:'UniversalNavbar BrandProvider erro capturado',data:{error:String(error),errorMessage:error instanceof Error?error.message:'unknown'},hypothesisId:'C'});
    // #endregion
    console.error('UniversalNavbar: BrandProvider não disponível:', error);
    // Retornar navbar básica sem branding
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200 relative" style={{ zIndex: 1000 }}>
        <div className="ms-container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="h-12 w-32 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
  
  const { user } = auth;
  const { config, isOverflowOne, isMS } = brandContext;
  const location = useLocation();
  
  console.log("🧭 NAVBAR: Estado - user:", !!user, "isOverflowOne:", isOverflowOne, "isMS:", isMS, "pathname:", location.pathname);

  // Memoizar a função de verificação de path ativo para melhor performance
  const isActivePath = useMemo(() => {
    return (path: string) => location.pathname === path;
  }, [location.pathname]);

  // Memoizar os itens de navegação para evitar re-renderizações desnecessárias
  const navigationItems = useMemo(() => config.navigation, [config.navigation]);
  const authenticatedNavigationItems = useMemo(() => config.authenticatedNavigation, [config.authenticatedNavigation]);

  // Log do link do logo (fora do JSX)
  useEffect(() => {
    // #region agent log
    safeLog({location:'UniversalNavbar.tsx:95',message:'UniversalNavbar logo link',data:{isOverflowOne,linkTo:isOverflowOne?'/':'/descubrams',pathname:location.pathname},hypothesisId:'C'});
    // #endregion
  }, [isOverflowOne, location.pathname]);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 relative" style={{ zIndex: 1000 }}>
      <div className="ms-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isOverflowOne ? "/" : "/descubrams"} className="flex items-center justify-center flex-1 md:flex-none md:justify-start">
            <div className="flex items-center">
              <img
                key={config.logo.src}
                alt={config.logo.alt}
                src={config.logo.src}
                className="h-12 w-auto transition-transform duration-300 hover:scale-105 object-contain"
                loading="eager"
                onError={(e) => {
                  console.error('❌ Erro ao carregar logo PNG:', e);
                  console.log('Tentando fallback...');
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('fallback=true')) {
                    target.src = `/images/logo-descubra-ms.png?fallback=true`;
                  }
                }}
              />
              <span 
                className="hidden text-lg font-bold text-ms-primary-blue"
                style={{ display: 'none' }}
              >
                {isOverflowOne ? "OverFlow One" : "Descubra Mato Grosso do Sul"}
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
            <LanguageSelector />
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
                    <Link to="/descubrams">
                      <Button variant="outline" size="sm">
                        {config.cta.secondary}
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/descubrams/login">
                      <Button variant="ghost" size="sm">
                        {config.cta.secondary}
                      </Button>
                    </Link>
                    <Link to="/descubrams/register">
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
                <div className="px-3 mb-3">
                  <LanguageSelector />
                </div>
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
                        <Link to="/descubrams" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" size="sm" className="w-full">
                            {config.cta.secondary}
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/descubrams/login" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" size="sm" className="w-full justify-start">
                            {config.cta.secondary}
                          </Button>
                        </Link>
                        <Link to="/descubrams/register" onClick={() => setIsOpen(false)}>
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