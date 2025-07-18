
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plane, BarChart3 } from 'lucide-react';

const FlowTripHeroSection = () => {
  const stats = [
    { number: '6', label: 'Estados' },
    { number: '150+', label: 'Municípios' },
    { number: '50k+', label: 'Turistas' }
  ];

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="flowtrip-container">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Title */}
          <h1 className="flowtrip-title-hero mb-6 leading-tight">
            Transforme seu Destino em Referência
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-flowtrip-text-secondary mb-8 font-medium">
            Plataforma SaaS para gestão turística estadual
          </p>
          
          {/* Description */}
          <p className="flowtrip-text-lead mb-12 max-w-3xl mx-auto">
            Sistema completo de gestão turística que conecta dados, pessoas e experiências 
            para transformar estados e municípios em destinos turísticos de referência nacional.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="bg-flowtrip-navy-primary text-white hover:bg-flowtrip-gray-primary px-8 py-4 text-lg"
            >
              <Plane className="mr-2 h-5 w-5" />
              Ver Demonstração
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-flowtrip-navy-primary text-flowtrip-navy-primary hover:bg-flowtrip-navy-primary hover:text-white px-8 py-4 text-lg"
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Case MS
            </Button>
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-flowtrip-navy-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-flowtrip-text-secondary font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlowTripHeroSection;
