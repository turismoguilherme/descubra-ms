import React from 'react';
import UniversalLayout from '@/components/layout/UniversalLayout';
import { EventSubmissionForm } from '@/components/events/EventSubmissionForm';
import { Calendar } from 'lucide-react';

const CadastrarEventoMS = () => {
  return (
    <UniversalLayout>
      <main className="flex-grow bg-gradient-to-b from-blue-50 via-white to-green-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green py-16">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative ms-container text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <Calendar size={48} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Cadastrar Evento
            </h1>
            <p className="text-white/95 text-xl max-w-3xl mx-auto leading-relaxed">
              Divulgue seu evento para milhares de turistas em Mato Grosso do Sul
            </p>
          </div>
        </div>

        {/* Formulário */}
        <div className="ms-container py-12">
          <div className="max-w-4xl mx-auto">
            <EventSubmissionForm />
          </div>
        </div>
      </main>
    </UniversalLayout>
  );
};

export default CadastrarEventoMS;

