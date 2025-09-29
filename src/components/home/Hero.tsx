import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Camera, Calendar } from 'lucide-react';

const HeroSimple = () => {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Descubra Mato Grosso do Sul
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Explore destinos incríveis, crie roteiros únicos e viva experiências inesquecíveis
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              <MapPin className="mr-2 h-5 w-5" />
              Explorar Destinos
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
              <Camera className="mr-2 h-5 w-5" />
              Ver Galerias
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">
              <Calendar className="mr-2 h-5 w-5" />
              Eventos
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSimple;