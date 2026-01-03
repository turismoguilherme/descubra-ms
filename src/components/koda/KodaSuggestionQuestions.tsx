import React from "react";
import { useKodaLanguage } from "@/hooks/useKodaLanguage";
import enTranslations from "@/locales/koda/en.json";
import frTranslations from "@/locales/koda/fr.json";

interface KodaSuggestionQuestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const EN_SUGGESTIONS = [
  "What are the best places to visit in Banff?",
  "Best time to see the Northern Lights?",
  "Tell me about Canadian cuisine",
  "What to do in Vancouver?",
  "How to plan a trip to Niagara Falls?",
  "Best ski resorts in Canada?"
];

const FR_SUGGESTIONS = [
  "Quels sont les meilleurs endroits à visiter à Banff?",
  "Meilleur moment pour voir les aurores boréales?",
  "Parlez-moi de la cuisine canadienne",
  "Que faire à Vancouver?",
  "Comment planifier un voyage aux chutes du Niagara?",
  "Meilleures stations de ski au Canada?"
];

const KodaSuggestionQuestions = ({ onSuggestionClick }: KodaSuggestionQuestionsProps) => {
  const { language } = useKodaLanguage();
  const t = language === 'fr' ? frTranslations : enTranslations;
  const suggestions = language === 'fr' ? FR_SUGGESTIONS : EN_SUGGESTIONS;

  return (
    <div className="bg-black/20 rounded-xl p-6 h-fit">
      <h3 className="text-xl font-semibold text-white mb-4">
        {language === 'fr' ? 'Questions suggérées:' : 'Suggested questions:'}
      </h3>
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <button 
            key={index}
            className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-lg text-left text-white transition-all border border-white/10 hover:border-white/30"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default KodaSuggestionQuestions;
