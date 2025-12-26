import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Target, Eye, Award, Users, MapPin, Compass, Heart, TreePine, Star, ArrowRight } from 'lucide-react';
import UniversalLayout from '@/components/layout/UniversalLayout';
import logoDescubra from '@/assets/images/logo-descubra-ms-v2.png';

const SobreMS = () => {
  return (
    <UniversalLayout>
      <main className="flex-grow bg-gradient-to-b from-blue-50 via-white to-green-50">
        {/* Hero Section - Mesmo estilo de Destinos */}
        <div className="relative bg-gradient-to-r from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green py-20">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative ms-container text-center">
            <div className="flex justify-center mb-6">
              <img 
                src={logoDescubra} 
                alt="Descubra Mato Grosso do Sul" 
                className="h-20 w-auto drop-shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = "/images/logo-descubra-ms.png";
                }}
              />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Sobre o Descubra MS
              </h1>
            <p className="text-white/95 text-xl max-w-3xl mx-auto leading-relaxed">
              Sua plataforma completa para explorar as maravilhas do estado mais biodiverso do Brasil.
              Do Pantanal ao Cerrado, conectamos você às experiências mais autênticas.
              </p>
            </div>
          </div>

        {/* Missão e Visão */}
        <div className="ms-container py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-ms-primary-blue mb-8 text-center">
              Nossa Essência
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="group bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-3 rounded-full">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-ms-primary-blue">Nossa Missão</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Conectar turistas a experiências autênticas no Mato Grosso do Sul, 
                  promovendo o turismo sustentável e valorizando a cultura local, 
                  a biodiversidade única do Pantanal e as belezas naturais do Cerrado.
                </p>
              </div>
              <div className="group bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-ms-pantanal-green to-ms-discovery-teal p-3 rounded-full">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-ms-pantanal-green">Nossa Visão</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Ser a principal plataforma de turismo do Centro-Oeste brasileiro, 
                  reconhecida pela inovação tecnológica e pelo compromisso com o 
                  desenvolvimento sustentável das comunidades locais.
                </p>
              </div>
            </div>
          </div>

          {/* Por que MS - Cards estilo Destinos */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-ms-primary-blue mb-8 text-center">
              Por que Mato Grosso do Sul?
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="group bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100">
                <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg text-ms-primary-blue mb-2">Pantanal</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  A maior planície alagável do planeta, com biodiversidade incomparável
                </p>
              </div>
              <div className="group bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-green-100">
                <div className="bg-gradient-to-r from-ms-pantanal-green to-ms-discovery-teal p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Compass className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg text-ms-pantanal-green mb-2">Bonito</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Águas cristalinas e cavernas espetaculares em ecoturismo premiado
                </p>
              </div>
              <div className="group bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-emerald-100">
                <div className="bg-gradient-to-r from-emerald-500 to-ms-discovery-teal p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <TreePine className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg text-emerald-600 mb-2">Serra da Bodoquena</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Cachoeiras, trilhas e uma natureza exuberante preservada
                </p>
              </div>
              <div className="group bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-orange-100">
                <div className="bg-gradient-to-r from-ms-accent-orange to-yellow-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg text-ms-accent-orange mb-2">Cultura Rica</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Tradições indígenas, gastronomia típica e festas populares
                </p>
              </div>
            </div>
          </div>

          {/* Estatísticas - Estilo moderno */}
          <div className="bg-gradient-to-r from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              Mato Grosso do Sul em Números
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors">
                <div className="text-4xl font-bold text-white mb-2">79</div>
                <div className="text-blue-100 text-sm font-medium">Municípios</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors">
                <div className="text-4xl font-bold text-white mb-2">357.145</div>
                <div className="text-blue-100 text-sm font-medium">km² de Área</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors">
                <div className="text-4xl font-bold text-white mb-2">650+</div>
                <div className="text-blue-100 text-sm font-medium">Espécies de Aves</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors">
                <div className="text-4xl font-bold text-white mb-2">2.8M</div>
                <div className="text-blue-100 text-sm font-medium">Habitantes</div>
              </div>
            </div>
          </div>

          {/* Valores */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-ms-primary-blue mb-8 text-center">
              Nossos Valores
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="group flex items-start gap-4 p-6 rounded-xl hover:bg-blue-50 transition-colors">
                <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-3 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                  <h3 className="font-bold text-ms-primary-blue text-lg mb-2">Excelência</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Buscamos oferecer as melhores experiências turísticas com qualidade e inovação constante.
                  </p>
                </div>
              </div>
              <div className="group flex items-start gap-4 p-6 rounded-xl hover:bg-green-50 transition-colors">
                <div className="bg-gradient-to-r from-ms-pantanal-green to-ms-discovery-teal p-3 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform">
                  <TreePine className="w-6 h-6 text-white" />
              </div>
              <div>
                  <h3 className="font-bold text-ms-pantanal-green text-lg mb-2">Sustentabilidade</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Promovemos o turismo responsável que preserva nossos recursos naturais e culturais.
                  </p>
                </div>
              </div>
              <div className="group flex items-start gap-4 p-6 rounded-xl hover:bg-orange-50 transition-colors">
                <div className="bg-gradient-to-r from-ms-accent-orange to-yellow-500 p-3 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                  <h3 className="font-bold text-ms-accent-orange text-lg mb-2">Comunidade</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Valorizamos as comunidades locais e trabalhamos para o desenvolvimento regional.
                  </p>
                </div>
              </div>
              </div>
            </div>
          </div>

        {/* CTA Final */}
        <div className="bg-gradient-to-r from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green py-16">
          <div className="ms-container text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para Descobrir o MS?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Explore destinos incríveis, participe de eventos únicos e ganhe recompensas 
              com nosso Passaporte Digital.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/descubramatogrossodosul/destinos">
                <Button size="lg" className="bg-white text-ms-primary-blue hover:bg-gray-100 font-semibold px-8 group">
                  Explorar Destinos
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/descubramatogrossodosul/passaporte">
                <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white/20 font-semibold px-8">
                  <Star className="mr-2 w-5 h-5" />
                  Passaporte Digital
                </Button>
              </Link>
            </div>
          </div>
      </div>
      </main>
    </UniversalLayout>
  );
};

export default SobreMS;
