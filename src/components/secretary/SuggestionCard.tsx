/**
 * Suggestion Card Component
 * Card individual para exibir uma sugestão de IA com opções de aceitar/rejeitar/editar
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Edit, Sparkles, AlertCircle } from 'lucide-react';
import { IASuggestion } from '@/types/planoDiretor';

interface SuggestionCardProps {
  suggestion: IASuggestion;
  onAccept: () => void;
  onReject: () => void;
  onEdit: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onAccept,
  onReject,
  onEdit
}) => {
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      objetivo: 'Objetivo',
      estrategia: 'Estratégia',
      acao: 'Ação',
      descricao: 'Descrição',
      valor: 'Valor'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      objetivo: 'bg-blue-100 text-blue-800',
      estrategia: 'bg-purple-100 text-purple-800',
      acao: 'bg-green-100 text-green-800',
      descricao: 'bg-gray-100 text-gray-800',
      valor: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'bg-gray-100 text-gray-800';
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="border-blue-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <Badge className={getTypeColor(suggestion.type)}>
              {getTypeLabel(suggestion.type)}
            </Badge>
            {suggestion.confidence !== undefined && (
              <Badge className={getConfidenceColor(suggestion.confidence)} variant="outline">
                {Math.round(suggestion.confidence * 100)}% confiança
              </Badge>
            )}
          </div>
        </div>

        <h4 className="font-semibold text-sm mb-2">{suggestion.title}</h4>
        <p className="text-sm text-gray-700 mb-3">{suggestion.content}</p>

        {suggestion.source && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <AlertCircle className="h-3 w-3" />
            <span>Baseado em: {suggestion.source}</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={onAccept}
            className="flex-1"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Aceitar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onReject}
          >
            <XCircle className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestionCard;

