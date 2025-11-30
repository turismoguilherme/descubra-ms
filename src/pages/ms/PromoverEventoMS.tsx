import React from 'react';
import UniversalLayout from '@/components/layout/UniversalLayout';
import EventPromotionForm from '@/components/events/EventPromotionForm';
import { Megaphone, Star, TrendingUp, Users } from 'lucide-react';

const PromoverEventoMS = () => {
  return (
    <UniversalLayout>
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green py-16">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative ms-container text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <Megaphone size={48} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Promova seu Evento
            </h1>
            <p className="text-white/95 text-xl max-w-3xl mx-auto leading-relaxed">
              Destaque seu evento para milhares de turistas e moradores de Mato Grosso do Sul
            </p>
          </div>
        </div>

        {/* Benefícios */}
        <div className="bg-white py-12 border-b">
          <div className="ms-container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Mais Visibilidade</h3>
                <p className="text-gray-600 text-sm">
                  Seu evento em destaque para milhares de usuários
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Mais Público</h3>
                <p className="text-gray-600 text-sm">
                  Aumente a participação no seu evento
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Alcance Regional</h3>
                <p className="text-gray-600 text-sm">
                  Turistas de todo o Brasil veem seu evento
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-gradient-to-b from-gray-50 to-white py-12">
          <div className="ms-container">
            <div className="max-w-4xl mx-auto">
              <EventPromotionForm />
            </div>
          </div>
        </div>
      </main>
    </UniversalLayout>
  );
};

export default PromoverEventoMS;

