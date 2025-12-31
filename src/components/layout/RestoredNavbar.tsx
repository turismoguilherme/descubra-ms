import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import UserMenu from "./UserMenu";
import OverFlowOneLogo from "./OverFlowOneLogo";

const RestoredNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("🧭 NAVBAR: Componente RestoredNavbar montado");
    console.log("🧭 NAVBAR: Usuário autenticado:", !!user);
    console.log("🧭 NAVBAR: Localização atual:", location.pathname);
    
    return () => {
      console.log("🧭 NAVBAR: Componente RestoredNavbar desmontado");
    };
  }, [user, location.pathname]);

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  // Detectar se estamos no contexto FlowTrip (página principal) ou MS
  const isFlowTrip = !location.pathname.startsWith('/descubrams') && !location.pathname.startsWith('/ms');

  console.log("🧭 NAVBAR: Renderizando navbar, isFlowTrip:", isFlowTrip);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo FlowTrip */}
          <OverFlowOneLogo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isFlowTrip ? (
              // Menu FlowTrip SaaS
              <>
                <Link to="/solucoes" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActivePath('/solucoes') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                }`}>
                  Soluções
                </Link>
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
                <Link to="/master-dashboard" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActivePath('/master-dashboard') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                }`}>
                  Master Dashboard
                </Link>
              </>
            ) : (
              // Menu MS (estado)
              <>
                <Link to="/descubrams/destinos" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActivePath('/descubrams/destinos') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                }`}>
                  Destinos
                </Link>
                <Link to="/descubrams/eventos" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActivePath('/descubrams/eventos') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                }`}>
                  Eventos
                </Link>
                <Link to="/descubrams/roteiros" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActivePath('/descubrams/roteiros') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                }`}>
                  Roteiros
                </Link>
                <Link to="/descubrams/parceiros" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActivePath('/descubrams/parceiros') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                }`}>
                  Parceiros
                </Link>
                <Link to="/descubrams/sobre" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActivePath('/descubrams/sobre') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                }`}>
                  Sobre
                </Link>
              </>
            )}
            
            {/* Menu autenticado */}
            {user && (
              <>
                {isFlowTrip ? (
                  // Menu autenticado FlowTrip
                  <>
                    <Link to="/dashboard-empresarial" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                      isActivePath('/dashboard-empresarial') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                    }`}>
                      Dashboard
                    </Link>
                    <Link to="/inventario-turistico" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                      isActivePath('/inventario-turistico') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                    }`}>
                      Inventário
                    </Link>
                  </>
                ) : (
                  // Menu autenticado MS
                  <>
                    <Link to="/descubrams/guata" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                      isActivePath('/descubrams/guata') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                    }`}>
                      Guatá IA
                    </Link>
                    <Link to="/descubrams/passaporte" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                      isActivePath('/descubrams/passaporte') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                    }`}>
                      Passaporte Digital
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <UserMenu />
            ) : (
              <>
                {isFlowTrip ? (
                  // CTA FlowTrip
                  <>
                    <Link to="/viajar/login">
                      <Button variant="ghost" size="sm">
                        Entrar
                      </Button>
                    </Link>
                    <Link to="/descubrams/register">
                      <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                        Cadastrar
                      </Button>
                    </Link>
                  </>
                ) : (
                  // CTA MS
                  <>
                    <Link to="/descubrams/login">
                      <Button variant="ghost" size="sm">
                        Entrar
                      </Button>
                    </Link>
                    <Link to="/descubrams/register">
                      <Button size="sm" className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 font-semibold">
                        Cadastrar
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
              onClick={() => {
                console.log("🧭 NAVBAR: Alternando menu mobile");
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
              {isFlowTrip ? (
                // Menu mobile FlowTrip
                <>
                  <Link to="/solucoes" className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath('/solucoes') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`} onClick={() => setIsOpen(false)}>
                    Soluções
                  </Link>
                  <Link to="/servicos" className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath('/servicos') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`} onClick={() => setIsOpen(false)}>
                    Serviços
                  </Link>
                  <Link to="/parceiros-comerciais" className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath('/parceiros-comerciais') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
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
                  <Link to="/master-dashboard" className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath('/master-dashboard') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`} onClick={() => setIsOpen(false)}>
                    Master Dashboard
                  </Link>
                </>
              ) : (
                // Menu mobile MS
                <>
                  <Link to="/descubrams/destinos" className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath('/descubrams/destinos') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`} onClick={() => setIsOpen(false)}>
                    Destinos
                  </Link>
                  <Link to="/descubrams/eventos" className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath('/descubrams/eventos') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`} onClick={() => setIsOpen(false)}>
                    Eventos
                  </Link>
                  <Link to="/descubrams/roteiros" className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath('/descubrams/roteiros') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`} onClick={() => setIsOpen(false)}>
                    Roteiros
                  </Link>
                  <Link to="/descubrams/parceiros" className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath('/descubrams/parceiros') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`} onClick={() => setIsOpen(false)}>
                    Parceiros
                  </Link>
                  <Link to="/descubrams/sobre" className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath('/descubrams/sobre') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`} onClick={() => setIsOpen(false)}>
                    Sobre
                  </Link>
                </>
              )}
              
              {/* Menu autenticado mobile */}
              {user && (
                <>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    {isFlowTrip ? (
                      // Menu autenticado mobile FlowTrip
                      <>
                        <Link to="/dashboard-empresarial" className={`block px-3 py-2 text-base font-medium transition-colors ${
                          isActivePath('/dashboard-empresarial') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        }`} onClick={() => setIsOpen(false)}>
                          Dashboard
                        </Link>
                        <Link to="/inventario-turistico" className={`block px-3 py-2 text-base font-medium transition-colors ${
                          isActivePath('/inventario-turistico') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        }`} onClick={() => setIsOpen(false)}>
                          Inventário
                        </Link>
                      </>
                    ) : (
                      // Menu autenticado mobile MS
                      <>
                        <Link to="/descubrams/guata" className={`block px-3 py-2 text-base font-medium transition-colors ${
                          isActivePath('/descubrams/guata') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        }`} onClick={() => setIsOpen(false)}>
                          Guatá IA
                        </Link>
                        <Link to="/descubrams/passaporte" className={`block px-3 py-2 text-base font-medium transition-colors ${
                          isActivePath('/descubrams/passaporte') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        }`} onClick={() => setIsOpen(false)}>
                          Passaporte Digital
                        </Link>
                      </>
                    )}
                  </div>
                </>
              )}
              
              {/* CTA mobile */}
              {!user && (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  {isFlowTrip ? (
                    // CTA mobile FlowTrip
                    <>
                      <Link to="/viajar/login" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
                        Entrar
                      </Link>
                      <Link to="/descubrams/register" className="block px-3 py-2 text-base font-medium text-blue-600 hover:bg-blue-50" onClick={() => setIsOpen(false)}>
                        Cadastrar
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/descubrams/login" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
                        Entrar
                      </Link>
                      <Link to="/descubrams/register" className="block px-3 py-2 text-base font-medium text-blue-600 hover:bg-blue-50" onClick={() => setIsOpen(false)}>
                        Cadastrar
                      </Link>
                    </>
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

export default RestoredNavbar; 