import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Building2, BarChart3, Map, Brain, Crown } from "lucide-react";
import { useOverflowOneAuth } from "@/hooks/useOverflowOneAuth";
import OverFlowOneLogo from "./OverFlowOneLogo";

const OverflowOneNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userProfile } = useOverflowOneAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("🧭 OVERFLOW-ONE-NAVBAR: Componente montado");
    console.log("🧭 OVERFLOW-ONE-NAVBAR: Usuário autenticado:", !!user);
    console.log("🧭 OVERFLOW-ONE-NAVBAR: Localização atual:", location.pathname);
    
    return () => {
      console.log("🧭 OVERFLOW-ONE-NAVBAR: Componente desmontado");
    };
  }, [user, location.pathname]);

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await useOverflowOneAuth().signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Overflow One */}
          <Link to="/" className="flex items-center">
            <OverFlowOneLogo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/servicos" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
              isActivePath('/servicos') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
            }`}>
              Serviços
            </Link>
            <Link to="/parceiros" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
              isActivePath('/parceiros') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
            }`}>
              Parceiros
            </Link>
            <Link to="/casos-sucesso" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
              isActivePath('/casos-sucesso') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
            }`}>
              Cases
            </Link>
            <Link to="/precos" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
              isActivePath('/precos') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
            }`}>
              Preços
            </Link>
            <Link to="/sobre-overflow-one" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
              isActivePath('/sobre-overflow-one') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
            }`}>
              Sobre
            </Link>
            
            {/* Menu autenticado */}
            {user && (
              <>
                <Link to="/overflow-one/dashboard" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActivePath('/overflow-one/dashboard') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                }`}>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    Dashboard
                  </div>
                </Link>
                    <Link to="/overflow-one/inventario" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                      isActivePath('/overflow-one/inventario') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                    }`}>
                      <div className="flex items-center gap-1">
                        <Map className="h-4 w-4" />
                        Inventário
                      </div>
                    </Link>
                    <Link to="/overflow-one/master-dashboard" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                      isActivePath('/overflow-one/master-dashboard') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                    }`}>
                      <div className="flex items-center gap-1">
                        <Crown className="h-4 w-4" />
                        Master
                      </div>
                    </Link>
              </>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <div className="font-medium">{userProfile?.company_name || 'Empresa'}</div>
                  <div className="text-xs text-gray-500">{userProfile?.contact_person || 'Usuário'}</div>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sair
                </Button>
              </div>
            ) : (
              <>
                <Link to="/overflow-one/login">
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link to="/overflow-one/register">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
                    Cadastrar
                  </Button>
                </Link>
                <Link to="/overflow-one/test-login">
                  <Button size="sm" variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                    Teste
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
              onClick={() => {
                console.log("🧭 OVERFLOW-ONE-NAVBAR: Alternando menu mobile");
                setIsOpen(!isOpen);
              }} 
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
              <Link to="/servicos" className={`block px-3 py-2 text-base font-medium transition-colors ${
                isActivePath('/servicos') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              }`} onClick={() => setIsOpen(false)}>
                Serviços
              </Link>
              <Link to="/parceiros" className={`block px-3 py-2 text-base font-medium transition-colors ${
                isActivePath('/parceiros') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              }`} onClick={() => setIsOpen(false)}>
                Parceiros
              </Link>
              <Link to="/casos-sucesso" className={`block px-3 py-2 text-base font-medium transition-colors ${
                isActivePath('/casos-sucesso') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              }`} onClick={() => setIsOpen(false)}>
                Cases
              </Link>
              <Link to="/precos" className={`block px-3 py-2 text-base font-medium transition-colors ${
                isActivePath('/precos') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              }`} onClick={() => setIsOpen(false)}>
                Preços
              </Link>
              <Link to="/sobre-overflow-one" className={`block px-3 py-2 text-base font-medium transition-colors ${
                isActivePath('/sobre-overflow-one') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              }`} onClick={() => setIsOpen(false)}>
                Sobre
              </Link>
              
              {/* Menu autenticado mobile */}
              {user && (
                <>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <Link to="/overflow-one/dashboard" className={`block px-3 py-2 text-base font-medium transition-colors ${
                      isActivePath('/overflow-one/dashboard') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`} onClick={() => setIsOpen(false)}>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Dashboard
                      </div>
                    </Link>
                        <Link to="/overflow-one/inventario" className={`block px-3 py-2 text-base font-medium transition-colors ${
                          isActivePath('/overflow-one/inventario') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        }`} onClick={() => setIsOpen(false)}>
                          <div className="flex items-center gap-2">
                            <Map className="h-4 w-4" />
                            Inventário
                          </div>
                        </Link>
                        <Link to="/overflow-one/master-dashboard" className={`block px-3 py-2 text-base font-medium transition-colors ${
                          isActivePath('/overflow-one/master-dashboard') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        }`} onClick={() => setIsOpen(false)}>
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4" />
                            Master
                          </div>
                        </Link>
                  </div>
                </>
              )}
              
              {/* CTA mobile */}
              {!user && (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <Link to="/overflow-one/login" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
                    Entrar
                  </Link>
                      <Link to="/overflow-one/register" className="block px-3 py-2 text-base font-medium text-blue-600 hover:bg-blue-50" onClick={() => setIsOpen(false)}>
                        Cadastrar
                      </Link>
                      <Link to="/overflow-one/test-login" className="block px-3 py-2 text-base font-medium text-orange-600 hover:bg-orange-50" onClick={() => setIsOpen(false)}>
                        Teste
                      </Link>
                </div>
              )}

              {/* User info mobile */}
              {user && (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="px-3 py-2 text-sm text-gray-600">
                    <div className="font-medium">{userProfile?.company_name || 'Empresa'}</div>
                    <div className="text-xs text-gray-500">{userProfile?.contact_person || 'Usuário'}</div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                  >
                    Sair
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default OverflowOneNavbar;
