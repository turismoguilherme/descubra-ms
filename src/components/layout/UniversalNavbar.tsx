import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/context/BrandContext";
import UserMenu from "./UserMenu";

const UniversalNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { config, isOverflowOne } = useBrand();
  const location = useLocation();

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 relative z-50">
      <div className="ms-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isOverflowOne ? "/" : "/ms"} className="flex items-center justify-center flex-1 md:flex-none md:justify-start">
            <div className="flex items-center">
              <img 
                alt={config.logo.alt}
                src={config.logo.src}
                className="h-12 w-auto transition-transform duration-300 hover:scale-105 object-contain" 
                loading="eager"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
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
            {config.navigation.map(item => (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`text-sm font-medium transition-colors hover:text-ms-primary-blue ${
                  isActivePath(item.path) 
                    ? "text-ms-primary-blue border-b-2 border-ms-primary-blue pb-1" 
                    : "text-gray-700"
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {user && config.authenticatedNavigation.map(item => (
              <Link 
                key={item.name} 
                to={item.path} 
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
              {config.navigation.map(item => (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath(item.path) 
                      ? "text-ms-primary-blue bg-blue-50" 
                      : "text-gray-700 hover:text-ms-primary-blue hover:bg-gray-50"
                  }`} 
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {user && config.authenticatedNavigation.map(item => (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActivePath(item.path) 
                      ? "text-ms-primary-blue bg-blue-50" 
                      : "text-gray-700 hover:text-ms-primary-blue hover:bg-gray-50"
                  }`} 
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