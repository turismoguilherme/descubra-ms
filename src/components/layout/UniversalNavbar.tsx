import React, { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Search as SearchIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/context/BrandContext";
import UserMenu from "./UserMenu";
import { LanguageSelector } from "./LanguageSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { touristRegions2025 } from "@/data/touristRegions2025";
import { useSearchOverlay } from "@/context/SearchOverlayContext";

const UniversalNavbar = () => {

  const [isOpen, setIsOpen] = useState(false);
  const { open: openSearch } = useSearchOverlay();
  
  // Verificar se o AuthProvider está disponível
  let auth = null;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('UniversalNavbar: AuthProvider não disponível:', error);
    
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
  
  let brandContext = null;
  try {
    brandContext = useBrand();
    
  } catch (error) {
    
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
  
  // Verificar se veio de /eventos através do parâmetro na URL
  const isFromEventos = location.search.includes('from=eventos');
  const shouldShowOnlyEventos = location.pathname === '/eventos' || (location.pathname === '/descubrams/cadastrar-evento' && isFromEventos);
  

  // Memoizar a função de verificação de path ativo para melhor performance
  const isActivePath = useMemo(() => {
    return (path: string) => location.pathname === path;
  }, [location.pathname]);

  // Memoizar os itens de navegação para evitar re-renderizações desnecessárias
  const navigationItems = useMemo(() => config.navigation, [config.navigation]);
  const authenticatedNavigationItems = useMemo(() => config.authenticatedNavigation, [config.authenticatedNavigation]);

  // Log do link do logo (fora do JSX)
  useEffect(() => {
    
  }, [isOverflowOne, location.pathname]);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 relative" style={{ zIndex: 1000 }}>
      <div className="ms-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isOverflowOne ? "/" : "/descubrams"} className="flex items-center justify-center flex-1 md:flex-none md:justify-start">
            <div className="flex items-center">
              {(() => {
                
                return (
                  <img
                    key={`${config.logo.src}-${location.pathname === '/eventos' ? Date.now() : ''}`}
                    alt={config.logo.alt}
                    src={location.pathname === '/eventos' && config.logo.src.includes('supabase.co') 
                      ? `${config.logo.src}${config.logo.src.includes('?') ? '&' : '?'}t=${Date.now()}`
                      : config.logo.src}
                    className="h-16 w-auto transition-transform duration-300 hover:scale-105 object-contain"
                    loading="eager"
                    onLoad={(e) => {
                      
                    }}
                    onError={(e) => {
                      console.error('❌ Erro ao carregar logo PNG:', e);
                      
                      console.log('Tentando fallback...');
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('fallback=true')) {
                        target.src = `/images/logo-descubra-ms.png?fallback=true`;
                      }
                    }}
                  />
                );
              })()}
              <span 
                className="hidden text-lg font-bold text-ms-primary-blue"
                style={{ display: 'none' }}
              >
                {isOverflowOne ? "OverFlow One" : "Descubra Mato Grosso do Sul"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Simplificado */}
          {/* Se estiver em /eventos ou veio de /eventos (via parâmetro), centralizar apenas "Eventos" */}
          {shouldShowOnlyEventos ? (
            <div className="hidden md:flex items-center justify-center flex-1">
              {navigationItems
                .filter(item => item.name === 'Eventos')
                .map(item => (
                <Link 
                  key={item.name} 
                  to={item.path}
                  onClick={() => console.log('🔗 NAVBAR: Clicou em', item.name, '->', item.path)}
                  className="text-sm font-medium transition-colors hover:text-ms-primary-blue text-ms-primary-blue border-b-2 border-ms-primary-blue pb-1"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-6">
              {/* Dropdown Regiões Turísticas (apenas para MS) */}
              {isMS && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-ms-primary-blue text-gray-700 data-[state=open]:text-ms-primary-blue">
                    Regiões Turísticas
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 max-h-[400px] overflow-y-auto z-[1100]">
                    {touristRegions2025.slice(0, 4).map(region => (
                      <DropdownMenuItem key={region.slug} asChild>
                        <Link 
                          to={`/descubrams/regioes/${region.slug}`}
                          className="cursor-pointer flex items-center gap-2"
                        >
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: region.color }}
                          />
                          <span>{region.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem asChild>
                      <Link 
                        to="/descubrams/mapa-turistico"
                        className="cursor-pointer font-semibold text-ms-primary-blue"
                      >
                        Ver todas as regiões →
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Links principais - Eventos, Parceiros e Guatá */}
              {navigationItems
                .filter(item => {
                  // Mostrar Mapa Turístico, Eventos e Parceiros no menu principal (para MS)
                  if (isMS) {
                    return ['Mapa Turístico', 'Eventos', 'Parceiros'].includes(item.name);
                  }
                  return true;
                })
                .map(item => (
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
              
              {/* Guatá */}
              {isMS && (
                <Link 
                  to="/descubrams/guata"
                  onClick={() => console.log('🔗 NAVBAR: Clicou em Guatá -> /descubrams/guata')}
                  className={`text-sm font-medium transition-colors hover:text-ms-primary-blue ${
                    isActivePath('/descubrams/guata') 
                      ? "text-ms-primary-blue border-b-2 border-ms-primary-blue pb-1" 
                      : "text-gray-700"
                  }`}
                >
                  Guatá
                </Link>
              )}
            </div>
          )}

          {/* Desktop Auth + Busca */}
          {/* Esconder botões de autenticação quando estiver em /eventos ou veio de /eventos */}
          {!shouldShowOnlyEventos && (
            <div className="hidden md:flex items-center space-x-4">
              <button
                type="button"
                onClick={openSearch}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-ms-primary-blue transition-colors"
                aria-label="Buscar destinos, eventos e regiões"
              >
                <SearchIcon className="h-5 w-5" />
              </button>
              <LanguageSelector />
              {user ? (
                <>
                <UserMenu />
                </>
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
          )}

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
              {/* Regiões Turísticas (Mobile) - Esconder quando veio de /eventos */}
              {isMS && !shouldShowOnlyEventos && (
                <>
                  <div className="px-3 py-2 text-base font-semibold text-ms-primary-blue">
                    Regiões Turísticas
                  </div>
                  {touristRegions2025.slice(0, 4).map(region => (
                    <Link
                      key={region.slug}
                      to={`/descubrams/destinos?regiao=${region.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="block px-6 py-2 text-sm text-gray-700 hover:text-ms-primary-blue hover:bg-gray-50"
                    >
                      {region.name}
                    </Link>
                  ))}
                  <Link
                    to="/descubrams/mapa-turistico"
                    onClick={() => setIsOpen(false)}
                    className="block px-6 py-2 text-sm font-semibold text-ms-primary-blue hover:bg-gray-50"
                  >
                    Ver todas as regiões →
                  </Link>
                  <div className="border-t border-gray-200 my-2"></div>
                </>
              )}

              {/* Links principais - Eventos, Parceiros e Guatá */}
              {/* Se veio de /eventos, mostrar apenas "Eventos" */}
              {shouldShowOnlyEventos ? (
                navigationItems
                  .filter(item => item.name === 'Eventos')
                  .map(item => (
                    <Link 
                      key={item.name} 
                      to={item.path}
                      onClick={() => {
                        console.log('🔗 NAVBAR MOBILE: Clicou em', item.name, '->', item.path);
                        setIsOpen(false);
                      }}
                      className="block px-3 py-2 text-base font-medium transition-colors text-ms-primary-blue bg-blue-50"
                    >
                      {item.name}
                    </Link>
                  ))
              ) : (
                <>
                  {navigationItems
                    .filter(item => {
                      if (isMS) {
                        return ['Mapa Turístico', 'Eventos', 'Parceiros'].includes(item.name);
                      }
                      return true;
                    })
                    .map(item => (
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
                  
                  {/* Guatá (Mobile) */}
                  {isMS && (
                    <Link 
                      to="/descubrams/guata"
                      onClick={() => {
                        console.log('🔗 NAVBAR MOBILE: Clicou em Guatá -> /descubrams/guata');
                        setIsOpen(false);
                      }}
                      className={`block px-3 py-2 text-base font-medium transition-colors ${
                        isActivePath('/descubrams/guata') 
                          ? "text-ms-primary-blue bg-blue-50" 
                          : "text-gray-700 hover:text-ms-primary-blue hover:bg-gray-50"
                      }`}
                    >
                      Guatá
                    </Link>
                  )}
                </>
              )}
              
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

              {/* Mobile Auth - Esconder quando estiver em /eventos ou veio de /eventos */}
              {!shouldShowOnlyEventos && (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="px-3 mb-3">
                    <LanguageSelector />
                  </div>
                  {user ? (
                    <>
                    <div className="px-3">
                      <UserMenu />
                    </div>
                    </>
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
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default UniversalNavbar;