
import React from "react";

interface SuggestionQuestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const SuggestionQuestions = ({ onSuggestionClick }: SuggestionQuestionsProps) => {
  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h3 className="text-xl font-semibold text-white mb-4">Sugestões de perguntas:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
          className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md text-left text-gray-700 transition-all hover:bg-ms-guavira-purple/5"
          onClick={() => onSuggestionClick("Quais são os melhores passeios em Bonito?")}
        >
          "Quais são os melhores passeios em Bonito?"
        </button>
        <button 
          className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md text-left text-gray-700 transition-all hover:bg-ms-guavira-purple/5"
          onClick={() => onSuggestionClick("Melhor época para visitar o Pantanal?")}
        >
          "Melhor época para visitar o Pantanal?"
        </button>
        <button 
          className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md text-left text-gray-700 transition-all hover:bg-ms-guavira-purple/5"
          onClick={() => onSuggestionClick("Me conte sobre a comida típica de MS")}
        >
          "Me conte sobre a comida típica de MS"
        </button>
        <button 
          className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md text-left text-gray-700 transition-all hover:bg-ms-guavira-purple/5"
          onClick={() => onSuggestionClick("O que fazer em Corumbá?")}
        >
          "O que fazer em Corumbá?"
        </button>
      </div>
    </div>
  );
};

export default SuggestionQuestions;
