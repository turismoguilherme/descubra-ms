/**
 * IA Suggestions Panel
 * Painel lateral para exibir sugestões de IA de forma transparente
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, X } from 'lucide-react';
import SuggestionCard from './SuggestionCard';
import { IASuggestion } from '@/types/planoDiretor';

interface IASuggestionsPanelProps {
  suggestions: IASuggestion[];
  onAccept: (suggestion: IASuggestion) => void;
  onReject: (suggestionId: string) => void;
  onEdit: (suggestion: IASuggestion) => void;
  onClose?: () => void;
  title?: string;
}

const IASuggestionsPanel: React.FC<IASuggestionsPanelProps> = ({
  suggestions,
  onAccept,
  onReject,
  onEdit,
  onClose,
  title = 'Sugestões de IA'
}) => {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Sparkles className="h-5 w-5 text-blue-600" />
            {title}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-blue-700 mt-1">
          {suggestions.length} sugestão(ões) gerada(s) por IA. Revise antes de aplicar.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onAccept={() => onAccept(suggestion)}
            onReject={() => onReject(suggestion.id)}
            onEdit={() => onEdit(suggestion)}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default IASuggestionsPanel;

