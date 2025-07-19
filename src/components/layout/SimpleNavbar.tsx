import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SimpleNavbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              FlowTrip
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/solucoes">
              <Button variant="ghost">Soluções</Button>
            </Link>
            <Link to="/precos">
              <Button variant="ghost">Preços</Button>
            </Link>
            <Link to="/contato">
              <Button variant="ghost">Contato</Button>
            </Link>
            <Link to="/master-dashboard">
              <Button variant="outline">Master Dashboard</Button>
            </Link>
            <Link to="/ms">
              <Button>Ver MS</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SimpleNavbar; 