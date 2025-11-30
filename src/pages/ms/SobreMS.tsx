import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Target, Eye, Award, Users, MapPin, Compass, Heart, TreePine } from 'lucide-react';
import UniversalLayout from '@/components/layout/UniversalLayout';

const SobreMS = () => {
  return (
    <UniversalLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-green-700 text-white py-20">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Sobre o Descubra Mato Grosso do Sul
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Sua plataforma completa para explorar as maravilhas do estado mais biodiverso do Brasil
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-8 h-8 text-blue-600" />
                  <h2 className="text-2xl font-bold text-blue-900">Nossa Missão</h2>
                </div>
                <p className="text-gray-700">
                  Conectar turistas a experiências autênticas no Mato Grosso do Sul, 
                  promovendo o turismo sustentável e valorizando a cultura local, 
                  a biodiversidade única do Pantanal e as belezas naturais do Cerrado.
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-8 h-8 text-green-600" />
                  <h2 className="text-2xl font-bold text-green-900">Nossa Visão</h2>
                </div>
                <p className="text-gray-700">
                  Ser a principal plataforma de turismo do Centro-Oeste brasileiro, 
                  reconhecida pela inovação tecnológica e pelo compromisso com o 
                  desenvolvimento sustentável das comunidades locais.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Por que MS */}
        <section className="py-20 bg-gradient-to-b from-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Por que Mato Grosso do Sul?
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Pantanal</h3>
                <p className="text-gray-600 text-sm">
                  A maior planície alagável do planeta, com biodiversidade incomparável
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <Compass className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Bonito</h3>
                <p className="text-gray-600 text-sm">
                  Águas cristalinas e cavernas espetaculares em ecoturismo premiado
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <TreePine className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Serra da Bodoquena</h3>
                <p className="text-gray-600 text-sm">
                  Cachoeiras, trilhas e uma natureza exuberante preservada
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Cultura Rica</h3>
                <p className="text-gray-600 text-sm">
                  Tradições indígenas, gastronomia típica e festas populares
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-blue-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">79</div>
                <div className="text-blue-200">Municípios</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">357.145</div>
                <div className="text-blue-200">km² de Área</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">650+</div>
                <div className="text-blue-200">Espécies de Aves</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">2.8M</div>
                <div className="text-blue-200">Habitantes</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Pronto para Descobrir o MS?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Explore destinos incríveis, participe de eventos únicos e ganhe recompensas 
              com nosso Passaporte Digital.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/descubramatogrossodosul/destinos">
                <Button size="lg" className="bg-white text-green-700 hover:bg-gray-100 font-semibold">
                  Explorar Destinos
                </Button>
              </Link>
              <Link to="/descubramatogrossodosul/passaporte">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Ver Passaporte Digital
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </UniversalLayout>
  );
};

export default SobreMS;
