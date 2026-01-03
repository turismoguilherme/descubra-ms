import React from "react";

interface KodaSuggestionQuestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const KodaSuggestionQuestions = ({ onSuggestionClick }: KodaSuggestionQuestionsProps) => {
  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h3 className="text-xl font-semibold text-white mb-4">Suggested questions:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
          className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md text-left text-gray-700 transition-all hover:bg-red-50"
          onClick={() => onSuggestionClick("What are the best places to visit in Banff?")}
        >
          "What are the best places to visit in Banff?"
        </button>
        <button 
          className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md text-left text-gray-700 transition-all hover:bg-red-50"
          onClick={() => onSuggestionClick("Best time to see the Northern Lights?")}
        >
          "Best time to see the Northern Lights?"
        </button>
        <button 
          className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md text-left text-gray-700 transition-all hover:bg-red-50"
          onClick={() => onSuggestionClick("Tell me about Canadian cuisine")}
        >
          "Tell me about Canadian cuisine"
        </button>
        <button 
          className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md text-left text-gray-700 transition-all hover:bg-red-50"
          onClick={() => onSuggestionClick("What to do in Vancouver?")}
        >
          "What to do in Vancouver?"
        </button>
        <button 
          className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md text-left text-gray-700 transition-all hover:bg-red-50"
          onClick={() => onSuggestionClick("How to plan a trip to Niagara Falls?")}
        >
          "How to plan a trip to Niagara Falls?"
        </button>
        <button 
          className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md text-left text-gray-700 transition-all hover:bg-red-50"
          onClick={() => onSuggestionClick("Best ski resorts in Canada?")}
        >
          "Best ski resorts in Canada?"
        </button>
      </div>
    </div>
  );
};

export default KodaSuggestionQuestions;
