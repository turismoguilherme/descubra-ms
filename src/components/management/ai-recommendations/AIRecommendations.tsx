
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import SuggestionCard from "./SuggestionCard";
import ChatInterface from "./ChatInterface";
import AboutAI from "./AboutAI";
import { mockSuggestions } from "./mockSuggestions";

interface AIRecommendationsProps {
  region: string;
}

const AIRecommendations = ({ region }: AIRecommendationsProps) => {
  const [feedbackSent, setFeedbackSent] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const suggestions = mockSuggestions[region] || mockSuggestions["all"];

  const handleFeedback = (id: string, isPositive: boolean) => {
    console.log(`Feedback ${isPositive ? 'positivo' : 'negativo'} para sugestão ${id}`);
    setFeedbackSent(prev => ({ ...prev, [id]: true }));
    
    toast({
      title: isPositive ? "Feedback positivo registrado" : "Feedback negativo registrado",
      description: isPositive 
        ? "Obrigado por sua avaliação positiva!" 
        : "Sua avaliação nos ajudará a melhorar as recomendações.",
    });
    // In a real app, this would send the feedback to an API
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">IA sugere {suggestions.length} ações</h3>
        <Button variant="outline" size="sm">
          Exportar relatório
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <SuggestionCard 
              key={suggestion.id}
              suggestion={suggestion}
              feedbackSent={feedbackSent}
              onFeedback={handleFeedback}
            />
          ))}
        </div>

        <div className="space-y-4">
          <ChatInterface region={region} />
          <AboutAI />
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;
