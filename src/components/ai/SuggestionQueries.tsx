
import { Button } from "@/components/ui/button";

interface SuggestionQueriesProps {
  onSuggestionClick: (suggestion: string) => void;
}

const SuggestionQueries = ({ onSuggestionClick }: SuggestionQueriesProps) => {
  return (
    <div className="mt-3">
      <p className="text-xs text-gray-500 mb-1">Sugestões de perguntas:</p>
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={() => onSuggestionClick("O que os turistas precisam saber sobre Bonito?")}
        >
          Sobre Bonito
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={() => onSuggestionClick("Quais documentos estrangeiros precisam para visitar MS?")}
        >
          Documentos para estrangeiros
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={() => onSuggestionClick("Como é o clima no Pantanal?")}
        >
          Clima no Pantanal
        </Button>
      </div>
    </div>
  );
};

export default SuggestionQueries;
