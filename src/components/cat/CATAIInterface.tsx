
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, Copy, Trash2, Clock } from 'lucide-react';
import { useCATAI } from '@/hooks/useCATAI';
import { useToast } from '@/hooks/use-toast';

interface CATAIInterfaceProps {
  attendantId: string;
  attendantName: string;
  catLocation: string;
  latitude?: number;
  longitude?: number;
}

const CATAIInterface = ({ 
  attendantId, 
  attendantName, 
  catLocation, 
  latitude, 
  longitude 
}: CATAIInterfaceProps) => {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const { queries, loading, submitQuery, getUserQueries, submitFeedback } = useCATAI();
  const { toast } = useToast();

  useEffect(() => {
    loadQueryHistory();
  }, [attendantId]);

  const loadQueryHistory = async () => {
    await getUserQueries(attendantId);
  };

  const submitQuestion = async () => {
    if (!currentQuestion.trim()) return;

    try {
      const result = await submitQuery(
        attendantId,
        attendantName,
        currentQuestion,
        catLocation,
        latitude,
        longitude
      );

      if (result) {
        setCurrentResponse(result.response);
        setCurrentQuestion('');
      }
    } catch (error) {
      console.error('Error submitting question:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Resposta copiada para a área de transferência",
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const clearCurrentResponse = () => {
    setCurrentResponse('');
  };

  const handleFeedback = async (queryId: string, isUseful: boolean) => {
    await submitFeedback(queryId, isUseful);
  };

  return (
    <div className="space-y-6">
      {/* Question Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Interface CAT AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Pergunta do Turista</label>
            <Textarea
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              placeholder="Digite a pergunta do turista aqui..."
              className="min-h-[100px]"
            />
          </div>
          
          <Button 
            onClick={submitQuestion}
            disabled={loading || !currentQuestion.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Enviar Pergunta'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Current Response */}
      {currentResponse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resposta Atual</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(currentResponse)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCurrentResponse}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="whitespace-pre-wrap">{currentResponse}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Query History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Perguntas</CardTitle>
        </CardHeader>
        <CardContent>
          {queries.length > 0 ? (
            <div className="space-y-4">
              {queries.slice(0, 10).map((query) => (
                <div key={query.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-sm">{query.question}</p>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(query.created_at).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <p className="text-sm whitespace-pre-wrap">{query.response}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(query.response)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant={query.feedback_useful === true ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFeedback(query.id, true)}
                      >
                        👍 Útil
                      </Button>
                      <Button
                        variant={query.feedback_useful === false ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFeedback(query.id, false)}
                      >
                        👎 Não útil
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhuma pergunta encontrada
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CATAIInterface;
