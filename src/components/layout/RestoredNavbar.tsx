import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import UserMenu from "./UserMenu";
import FlowTripLogo from "./FlowTripLogo";

const RestoredNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  // Detectar se estamos no contexto FlowTrip (página principal) ou MS
  const isFlowTrip = !location.pathname.startsWith('/ms');

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo FlowTrip */}
          <FlowTripLogo isFlowTrip={isFlowTrip} />

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
                <Link to="/sobre-flowtrip" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActivePath('/sobre-flowtrip') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
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
                <Link to="/ms/destinos" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActivePath('/ms/destinos') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                }`}>
                  Destinos
                </Link>
                <Link to="/ms/eventos" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActivePath('/ms/eventos') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                }`}>
                  Eventos
                </Link>
                <Link to="/ms/roteiros" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActivePath('/ms/roteiros') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                }`}>
                  Roteiros
                </Link>
                <Link to="/ms/parceiros" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActivePath('/ms/parceiros') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                }`}>
                  Parceiros
                </Link>
                <Link to="/ms/sobre" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActivePath('/ms/sobre') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                }`}>
                  Sobre
                </Link>
              </>
            )}
            
            {/* Menu autenticado */}
            {user && (
              <>
                <Link to="/ms/guata" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActivePath('/ms/guata') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                }`}>
                  Guatá IA
                </Link>
                <Link to="/ms/passaporte" className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActivePath('/ms/passaporte') ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700"
                }`}>
                  Passaporte Digital
                </Link>
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
                    <Link to="/contato">
                      <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                        Agendar Demo
                      </Button>
                    </Link>
                    <Link to="/ms">
                      <Button variant="outline" size="sm">
                        Ver Case MS
                      </Button>
                    </Link>
                  </>
                ) : (
                  // CTA MS
                  <>
                    <Link to="/ms/login">
                      <Button variant="ghost" size="sm">
                        Entrar
                      </Button>
                    </Link>
                    <Link to="/ms/register">
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
              {isFlowTrip ? (
                // Menu mobile FlowTrip
                <>
                  <Link to="/solucoes" className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath('/solucoes') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`} onClick={() => setIsOpen(false)}>
                    Soluções
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
                  <Link to="/sobre-flowtrip" className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath('/sobre-flowtrip') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
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
                  <Link to="/ms/destinos" className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath('/ms/destinos') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`} onClick={() => setIsOpen(false)}>
                    Destinos
                  </Link>
                  <Link to="/ms/eventos" className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath('/ms/eventos') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`} onClick={() => setIsOpen(false)}>
                    Eventos
                  </Link>
                  <Link to="/ms/roteiros" className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath('/ms/roteiros') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`} onClick={() => setIsOpen(false)}>
                    Roteiros
                  </Link>
                  <Link to="/ms/parceiros" className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath('/ms/parceiros') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`} onClick={() => setIsOpen(false)}>
                    Parceiros
                  </Link>
                  <Link to="/ms/sobre" className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath('/ms/sobre') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`} onClick={() => setIsOpen(false)}>
                    Sobre
                  </Link>
                </>
              )}
              
              {/* Menu autenticado mobile */}
              {user && (
                <>
                  <Link to="/ms/guata" className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath('/ms/guata') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`} onClick={() => setIsOpen(false)}>
                    Guatá IA
                  </Link>
                  <Link to="/ms/passaporte" className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath('/ms/passaporte') ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`} onClick={() => setIsOpen(false)}>
                    Passaporte Digital
                  </Link>
                </>
              )}

              {/* Mobile Auth */}
              <div className="pt-4 pb-3 border-t border-gray-200">
                {user ? (
                  <div className="px-3">
                    <UserMenu />
                  </div>
                ) : (
                  <div className="space-y-2 px-3">
                    {isFlowTrip ? (
                      <>
                        <Link to="/contato" onClick={() => setIsOpen(false)}>
                          <Button size="sm" className="w-full bg-blue-600 text-white hover:bg-blue-700">
                            Agendar Demo
                          </Button>
                        </Link>
                        <Link to="/ms" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" size="sm" className="w-full">
                            Ver Case MS
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/ms/login" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" size="sm" className="w-full justify-start">
                            Entrar
                          </Button>
                        </Link>
                        <Link to="/ms/register" onClick={() => setIsOpen(false)}>
                          <Button size="sm" className="w-full bg-yellow-400 text-blue-900 hover:bg-yellow-300 font-semibold">
                            Cadastrar
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

export default RestoredNavbar; 