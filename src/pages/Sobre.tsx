import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Target, Eye, Award, Users } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';

const Sobre = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Sobre a ViaJAR
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Transformando o turismo brasileiro com tecnologia e inovação
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl border border-blue-100">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nossa Missão</h2>
              <p className="text-gray-600 text-lg">
                Democratizar o acesso à tecnologia de ponta para o setor turístico, 
                permitindo que governos e empresas de qualquer tamanho possam oferecer 
                experiências excepcionais aos turistas.
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-8 rounded-2xl border border-cyan-100">
              <div className="w-14 h-14 bg-gradient-to-r from-cyan-600 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                <Eye className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nossa Visão</h2>
              <p className="text-gray-600 text-lg">
                Ser a plataforma líder em gestão inteligente de turismo no Brasil, 
                conectando destinos, turistas e gestores através de tecnologia inovadora 
                e inteligência artificial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-cyan-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Quer fazer parte dessa história?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Entre em contato e descubra como podemos transformar o turismo na sua região.
          </p>
          <Link to="/contato">
            <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 text-lg">
              Falar Conosco
            </Button>
          </Link>
        </div>
      </section>

      <ViaJARFooter />
    </div>
  );
};

export default Sobre;
