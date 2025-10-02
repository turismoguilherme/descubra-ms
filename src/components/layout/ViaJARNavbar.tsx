import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Building2, BarChart3, Map, Brain, Crown } from "lucide-react";
import { useViaJARAuth } from "@/hooks/useViaJARAuth";
import ViaJARLogo from "./ViaJARLogo";

const ViaJARNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, userProfile } = useViaJARAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("🧭 VIAJAR-NAVBAR: Componente montado");
    console.log("🧭 VIAJAR-NAVBAR: Usuário autenticado:", !!user);
    console.log("🧭 VIAJAR-NAVBAR: Localização atual:", location.pathname);
    
    return () => {
      console.log("🧭 VIAJAR-NAVBAR: Componente desmontado");
    };
  }, [user, location.pathname]);

  // Detectar se é mobile e fechar menu quando necessário
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(false); // Fechar menu em desktop
      }
    };

    checkIsMobile(); // Verificar no carregamento inicial
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Fechar menu mobile quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const navbar = document.querySelector('[data-navbar]');
      
      if (isOpen && navbar && !navbar.contains(target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await useViaJARAuth().signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <>
      <style>
        {`
          @media (min-width: 768px) {
            .mobile-menu-overlay {
              display: none !important;
            }
            .mobile-menu-button {
              display: none !important;
            }
          }
        `}
      </style>
      <nav className="bg-white shadow-sm border-b border-gray-200 relative z-50" data-navbar>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
          {/* Logo ViaJAR */}
          <Link to="/" className="flex items-center">
            <ViaJARLogo />
          </Link>

          {/* Desktop Navigation - Menu horizontal normal */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/servicos" className={`text-sm font-medium transition-colors hover:text-cyan-600 ${
              isActivePath('/servicos') ? "text-cyan-600 border-b-2 border-cyan-600 pb-1" : "text-gray-700"
            }`}>
              Serviços
            </Link>
            <Link to="/parceiros" className={`text-sm font-medium transition-colors hover:text-cyan-600 ${
              isActivePath('/parceiros') ? "text-cyan-600 border-b-2 border-cyan-600 pb-1" : "text-gray-700"
            }`}>
              Parceiros
            </Link>
            <Link to="/viajar/precos" className={`text-sm font-medium transition-colors hover:text-cyan-600 ${
              isActivePath('/viajar/precos') ? "text-cyan-600 border-b-2 border-cyan-600 pb-1" : "text-gray-700"
            }`}>
              Preços
            </Link>
            <Link to="/viajar/sobre" className={`text-sm font-medium transition-colors hover:text-cyan-600 ${
              isActivePath('/viajar/sobre') ? "text-cyan-600 border-b-2 border-cyan-600 pb-1" : "text-gray-700"
            }`}>
              Sobre
            </Link>
            <Link to="/viajar/contato" className={`text-sm font-medium transition-colors hover:text-cyan-600 ${
              isActivePath('/viajar/contato') ? "text-cyan-600 border-b-2 border-cyan-600 pb-1" : "text-gray-700"
            }`}>
              Contato
            </Link>
        <Link to="/relatorios" className={`text-sm font-medium transition-colors hover:text-cyan-600 ${
          isActivePath('/relatorios') ? "text-cyan-600 border-b-2 border-cyan-600 pb-1" : "text-gray-700"
        }`}>
          Relatórios
        </Link>
        <Link to="/leads" className={`text-sm font-medium transition-colors hover:text-cyan-600 ${
          isActivePath('/leads') ? "text-cyan-600 border-b-2 border-cyan-600 pb-1" : "text-gray-700"
        }`}>
          Leads
        </Link>
        <Link to="/setor-publico" className={`text-sm font-medium transition-colors hover:text-cyan-600 ${
          isActivePath('/setor-publico') ? "text-cyan-600 border-b-2 border-cyan-600 pb-1" : "text-gray-700"
        }`}>
          Setor Público
        </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {userProfile?.name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{userProfile?.name || "Usuário"}</p>
                    <p className="text-gray-500 text-xs">{userProfile?.user_type || "empresa"}</p>
                  </div>
                </div>

                {/* Dashboard Links based on user type */}
                {userProfile?.user_type === 'master_admin' && (
                  <Link to="/viajar/master-dashboard">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      Master Dashboard
                    </Button>
                  </Link>
                )}

                {userProfile?.user_type === 'empresa' && (
                  <Link to="/viajar/dashboard">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                )}

                {userProfile?.user_type === 'atendente' && (
                  <Link to="/viajar/atendente">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Map className="h-4 w-4" />
                      Atendente
                    </Button>
                  </Link>
                )}

                {userProfile?.user_type === 'gestor_municipal' && (
                  <Link to="/viajar/municipal">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Municipal
                    </Button>
                  </Link>
                )}

                {userProfile?.user_type === 'gestor_estadual' && (
                  <Link to="/viajar/estadual">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Estadual
                    </Button>
                  </Link>
                )}

                {/* Sign Out */}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/viajar/login">
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link to="/viajar/register">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                    Começar
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button - Só aparece em mobile */}
          <div className="mobile-menu-button md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - Só aparece em mobile */}
        {isOpen && (
          <div className="mobile-menu-overlay fixed inset-0 bg-white flex flex-col items-center justify-center z-50 md:hidden">
            <div className="space-y-6 text-center">
              <Link
                to="/servicos"
                className={`text-2xl font-medium transition-colors hover:text-cyan-600 ${
                  isActivePath('/servicos') ? "text-cyan-600" : "text-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Serviços
              </Link>
              <Link
                to="/parceiros"
                className={`text-2xl font-medium transition-colors hover:text-cyan-600 ${
                  isActivePath('/parceiros') ? "text-cyan-600" : "text-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Parceiros
              </Link>
              <Link
                to="/viajar/precos"
                className={`text-2xl font-medium transition-colors hover:text-cyan-600 ${
                  isActivePath('/viajar/precos') ? "text-cyan-600" : "text-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Preços
              </Link>
              <Link
                to="/viajar/sobre"
                className={`text-2xl font-medium transition-colors hover:text-cyan-600 ${
                  isActivePath('/viajar/sobre') ? "text-cyan-600" : "text-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Sobre
              </Link>
              <Link
                to="/viajar/contato"
                className={`text-2xl font-medium transition-colors hover:text-cyan-600 ${
                  isActivePath('/viajar/contato') ? "text-cyan-600" : "text-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Contato
              </Link>
        <Link
          to="/relatorios"
          className={`text-2xl font-medium transition-colors hover:text-cyan-600 ${
            isActivePath('/relatorios') ? "text-cyan-600" : "text-gray-700"
          }`}
          onClick={() => setIsOpen(false)}
        >
          Relatórios
        </Link>
        <Link
          to="/leads"
          className={`text-2xl font-medium transition-colors hover:text-cyan-600 ${
            isActivePath('/leads') ? "text-cyan-600" : "text-gray-700"
          }`}
          onClick={() => setIsOpen(false)}
        >
          Leads
        </Link>
        <Link
          to="/setor-publico"
          className={`text-2xl font-medium transition-colors hover:text-cyan-600 ${
            isActivePath('/setor-publico') ? "text-cyan-600" : "text-gray-700"
          }`}
          onClick={() => setIsOpen(false)}
        >
          Setor Público
        </Link>

              {/* Mobile Auth */}
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">{userProfile?.name || "Usuário"}</p>
                      <p className="text-xs text-gray-500">{userProfile?.user_type || "empresa"}</p>
                    </div>
                    
                    {/* Mobile Dashboard Links */}
                    {userProfile?.user_type === 'master_admin' && (
                      <Link
                        to="/viajar/master-dashboard"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-cyan-600"
                      >
                        Master Dashboard
                      </Link>
                    )}

                    {userProfile?.user_type === 'empresa' && (
                      <Link
                        to="/viajar/dashboard"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-cyan-600"
                      >
                        Dashboard
                      </Link>
                    )}

                    {userProfile?.user_type === 'atendente' && (
                      <Link
                        to="/viajar/atendente"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-cyan-600"
                      >
                        Atendente
                      </Link>
                    )}

                    {userProfile?.user_type === 'gestor_municipal' && (
                      <Link
                        to="/viajar/municipal"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-cyan-600"
                      >
                        Municipal
                      </Link>
                    )}

                    {userProfile?.user_type === 'gestor_estadual' && (
                      <Link
                        to="/viajar/estadual"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-cyan-600"
                      >
                        Estadual
                      </Link>
                    )}

                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-cyan-600"
                    >
                      Sair
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/viajar/login"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-cyan-600"
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/viajar/register"
                      className="block px-3 py-2 text-base font-medium text-cyan-600 hover:text-cyan-700"
                    >
                      Começar
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </nav>
    </>
  );
};

export default ViaJARNavbar;

