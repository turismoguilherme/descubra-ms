import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const ViaJARNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const isActivePath = (path: string) => location.pathname === path;

  const navigationItems = [
    { name: "Início", path: "/" },
    { name: "Soluções", path: "/solucoes" },
    { name: "Casos de Sucesso", path: "/casos-sucesso" },
    { name: "Preços", path: "/precos" },
    { name: "Para Governos", path: "/governos" },
    { name: "Sobre", path: "/sobre" },
    { name: "Contato", path: "/contato" },
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
              <Link to="/viajar/dashboard">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                  Dashboard
                </Button>
              </Link>
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
                  <Link to="/viajar/dashboard" onClick={() => setIsOpen(false)}>
                    <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                      Dashboard
                    </Button>
                  </Link>
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
