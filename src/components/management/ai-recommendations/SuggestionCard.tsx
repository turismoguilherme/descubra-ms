
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, BarChart, Users, MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { Suggestion } from "@/types/management";
import { msRegions } from "../PerformanceDashboard";

interface SuggestionCardProps {
  suggestion: Suggestion;
  feedbackSent: Record<string, boolean>;
  onFeedback: (id: string, isPositive: boolean) => void;
}

const SuggestionCard = ({ suggestion, feedbackSent, onFeedback }: SuggestionCardProps) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'event': return <Calendar size={18} />;
      case 'promotion': return <BarChart size={18} />;
      case 'partnership': return <Users size={18} />;
      default: return <MessageCircle size={18} />;
    }
  };

  return (
    <Card key={suggestion.id} className="p-4">
      <div className="flex justify-between items-start">
        <div className="flex space-x-3">
          <div className={`p-2 rounded-md ${
            suggestion.priority === 'high' ? 'bg-red-100' : 
            suggestion.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
          }`}>
            {getCategoryIcon(suggestion.category)}
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium">{msRegions[suggestion.regionId as keyof typeof msRegions] || suggestion.regionId}</span>
              <Badge variant="outline" className="text-xs">
                {suggestion.category}
              </Badge>
              <Badge className={`text-xs ${
                suggestion.priority === 'high' ? 'bg-red-100 text-red-800 hover:bg-red-100' : 
                suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : 
                'bg-blue-100 text-blue-800 hover:bg-blue-100'
              }`}>
                {suggestion.priority === 'high' ? 'Alta' : 
                suggestion.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
              </Badge>
            </div>
            <p className="text-gray-800">{suggestion.text}</p>
            <p className="text-xs text-gray-500 mt-1">
              Gerado em {new Date(suggestion.timestamp).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {!feedbackSent[suggestion.id] ? (
            <>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => onFeedback(suggestion.id, true)}
              >
                <ThumbsUp size={16} />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => onFeedback(suggestion.id, false)}
              >
                <ThumbsDown size={16} />
              </Button>
            </>
          ) : (
            <span className="text-xs text-green-600">Feedback enviado</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SuggestionCard;
