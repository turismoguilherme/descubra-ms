
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import FlowTripLogoProfessional from './FlowTripLogoProfessional';
import { Button } from '@/components/ui/button';

const FlowTripHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Funcionalidades', href: '#funcionalidades' },
    { name: 'Resultados', href: '#resultados' },
    { name: 'Cases', href: '#cases' },
    { name: 'Portal', href: '#portal' }
  ];

  return (
    <header className="bg-white border-b border-flowtrip-border sticky top-0 z-50 flowtrip-shadow-professional">
      <div className="flowtrip-container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <FlowTripLogoProfessional size="md" />
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-flowtrip-text-secondary hover:text-flowtrip-navy-primary font-medium transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button 
              variant="outline"
              className="border-flowtrip-navy-primary text-flowtrip-navy-primary hover:bg-flowtrip-navy-primary hover:text-white"
            >
              Ver Demo MS
            </Button>
            <Button 
              className="bg-flowtrip-navy-primary text-white hover:bg-flowtrip-gray-primary"
            >
              Falar Conosco
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-flowtrip-navy-primary"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-flowtrip-border">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-flowtrip-text-secondary hover:text-flowtrip-navy-primary hover:bg-flowtrip-gray-light transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              
              <div className="pt-4 pb-3 border-t border-flowtrip-border space-y-2 px-3">
                <Button 
                  variant="outline"
                  className="w-full border-flowtrip-navy-primary text-flowtrip-navy-primary hover:bg-flowtrip-navy-primary hover:text-white"
                >
                  Ver Demo MS
                </Button>
                <Button 
                  className="w-full bg-flowtrip-navy-primary text-white hover:bg-flowtrip-gray-primary"
                >
                  Falar Conosco
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default FlowTripHeader;
