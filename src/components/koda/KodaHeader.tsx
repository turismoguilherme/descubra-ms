import React from "react";
import { MapPin, Compass, Languages } from "lucide-react";
import { useKodaLanguage } from "@/hooks/useKodaLanguage";
import enTranslations from "@/locales/koda/en.json";
import frTranslations from "@/locales/koda/fr.json";

interface KodaHeaderProps {
  onClearConversation: () => void;
  messages: unknown[];
}

const KodaHeader = ({ onClearConversation, messages }: KodaHeaderProps) => {
  const { language, toggleLanguage } = useKodaLanguage();
  const t = language === 'fr' ? frTranslations : enTranslations;

  return (
    <div className="text-center text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1"></div>
        <div className="flex-1 flex items-center justify-center gap-2">
          <MapPin className="w-6 h-6 text-red-400" />
          <h1 className="text-3xl font-bold">{t.header.title}</h1>
          <Compass className="w-6 h-6 text-red-400" />
        </div>
        <div className="flex-1 flex justify-end">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
            title={language === 'en' ? 'Switch to French' : 'Passer à l\'anglais'}
          >
            <Languages className="w-4 h-4" />
            <span className="font-medium">{language === 'en' ? 'FR' : 'EN'}</span>
          </button>
        </div>
      </div>
      <p className="text-lg text-gray-200">
        {t.header.subtitle}
      </p>
      <div className="flex items-center justify-center gap-4 mt-4">
        <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
          {t.header.badges?.maple || '🍁 Maple Country'}
        </span>
        <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
          {t.header.badges?.mountains || '🏔️ Rocky Mountains'}
        </span>
        <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
          {t.header.badges?.wonders || '🌲 Natural Wonders'}
        </span>
      </div>
    </div>
  );
};

export default KodaHeader;
