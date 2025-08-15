// Exemplo de integração RAG no Guatá
// Mostra como usar o sistema RAG no componente existente

import React, { useState } from 'react';
import { guataRAGIntegration } from '@/services/ai/guataRAGIntegration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Info, AlertCircle } from 'lucide-react';

interface GuataRAGExampleProps {
  onResponse?: (response: any) => void;
}

export const GuataRAGExample: React.FC<GuataRAGExampleProps> = ({ onResponse }) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await guataRAGIntegration.askQuestionWithRAG(
        question,
        'user-123',
        'session-456',
        'turismo',
        'Campo Grande'
      );

      setResponse(result);
      onResponse?.(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Pergunte ao Guatá sobre turismo no MS..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
        />
        <Button 
          onClick={handleAskQuestion} 
          disabled={isLoading || !question.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Perguntar'}
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-2 text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Buscando informações atualizadas...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Response */}
      {response && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Resposta do Guatá</CardTitle>
              <div className="flex gap-2">
                <Badge variant={response.ragEnabled ? "default" : "secondary"}>
                  {response.ragEnabled ? 'RAG' : 'Fallback'}
                </Badge>
                <Badge variant="outline">
                  {Math.round(response.confidence * 100)}% confiança
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Answer */}
            <div>
              <h4 className="font-semibold mb-2">Resposta:</h4>
              <p className="text-gray-700">{response.answer}</p>
            </div>

            {/* Sources */}
            {response.sources && response.sources.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Fontes consultadas:
                </h4>
                <div className="space-y-2">
                  {response.sources.map((source, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{source.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(source.relevance * 100)}% relevância
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{source.content}</p>
                      {source.url && (
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 text-xs hover:underline"
                        >
                          Ver fonte →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Info className="w-4 h-4" />
                <span>
                  Processado em {response.processingTime}ms
                  {response.fallbackUsed && ' (usando fallback)'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
