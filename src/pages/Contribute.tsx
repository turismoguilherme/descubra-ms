
import React, { useRef } from 'react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CommunitySuggestionForm from "@/components/community/CommunitySuggestionForm";
import CommunitySuggestionsList from "@/components/community/CommunitySuggestionsList";
import { CommunitySuggestion } from '@/types/community-contributions';

const Contribute = () => {
  const listRef = useRef<{ fetchSuggestions: () => Promise<void> }>(null);

  const handleSuggestionCreated = (suggestion: CommunitySuggestion) => {
    // Após criar uma sugestão, recarregar a lista
    if (listRef.current) {
      listRef.current.fetchSuggestions();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 px-4 bg-gray-50">
        <div className="ms-container space-y-12">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-ms-primary-blue leading-tight">
            Participe do Turismo em Mato Grosso do Sul
          </h1>
          <p className="text-lg text-center text-gray-700 max-w-3xl mx-auto mb-8">
            Sua voz importa! Compartilhe suas ideias, sugira novos destinos ou eventos, e ajude a construir o futuro do turismo em nossa região.
          </p>
          
          {/* Formulário de Nova Sugestão */}
          <CommunitySuggestionForm onSuggestionCreated={handleSuggestionCreated} />

          <div className="flex justify-center my-8">
            <hr className="border-t-2 border-ms-primary-blue w-24" />
          </div>

          {/* Lista de Sugestões da Comunidade */}
          <h2 className="text-3xl font-bold text-center text-ms-primary-blue mb-8">
            O que a Comunidade Sugeriu
          </h2>
          <CommunitySuggestionsList ref={listRef} defaultStatusFilter="all" defaultSortBy="recent" />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contribute;
