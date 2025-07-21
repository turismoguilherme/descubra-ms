
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, Copy, Trash2, Clock, Brain, Database, Globe, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { tourismRAGService, RAGQuery, RAGResponse } from '@/services/ai/tourismRAGService';
import { useAuth } from '@/hooks/useAuth';

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
  const [currentResponse, setCurrentResponse] = useState<RAGResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [knowledgeBaseStats, setKnowledgeBaseStats] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = async () => {
    try {
      console.log('🚀 Inicializando sistema RAG para atendente...');
      
      // Inicializar base de conhecimento
      await tourismRAGService.initializeKnowledgeBase();
      
      // Obter estatísticas
      const stats = tourismRAGService.getKnowledgeBaseStats();
      setKnowledgeBaseStats(stats);
      setLastUpdate(stats.lastUpdate.toLocaleString('pt-BR'));
      
      console.log('✅ Sistema RAG inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar sistema RAG:', error);
      toast({
        title: "Erro de Sistema",
        description: "Não foi possível inicializar o assistente inteligente. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const submitQuestion = async () => {
    if (!currentQuestion.trim()) return;

    setLoading(true);
    try {
      console.log('🔍 Processando pergunta do turista:', currentQuestion);

      // Construir query RAG
      const query: RAGQuery = {
        question: currentQuestion,
        context: {
          catLocation,
          currentTime: new Date().toLocaleString('pt-BR'),
          userPreferences: user?.preferences || []
        },
        filters: {
          region: 'centro_oeste' // MS
        }
      };

      // Gerar resposta usando RAG
      const response = await tourismRAGService.generateResponse(query);
      
      setCurrentResponse(response);
      setCurrentQuestion('');

      console.log('✅ Resposta gerada com sucesso. Confiança:', response.confidence);

      // Mostrar toast de sucesso
      toast({
        title: "Resposta Gerada",
        description: `Confiança: ${Math.round(response.confidence * 100)}%`,
      });

    } catch (error) {
      console.error('❌ Erro ao processar pergunta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua pergunta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
    setCurrentResponse(null);
  };

  const updateKnowledgeBase = async () => {
    try {
      setLoading(true);
      await tourismRAGService.updateKnowledgeBase();
      
      const stats = tourismRAGService.getKnowledgeBaseStats();
      setKnowledgeBaseStats(stats);
      setLastUpdate(stats.lastUpdate.toLocaleString('pt-BR'));
      
      toast({
        title: "Base Atualizada",
        description: "Informações turísticas atualizadas com sucesso",
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar base:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a base de conhecimento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'alumia': return <Database className="h-4 w-4" />;
      case 'government': return <Globe className="h-4 w-4" />;
      case 'social_media': return <TrendingUp className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="mr-2 h-5 w-5 text-blue-600" />
              Assistente Inteligente CAT
            </div>
            <Badge variant="outline" className="text-xs">
              RAG v2.0
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {knowledgeBaseStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-blue-600">{knowledgeBaseStats.totalItems}</div>
                <div className="text-gray-600">Itens na Base</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">{knowledgeBaseStats.byType?.attraction || 0}</div>
                <div className="text-gray-600">Atrações</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600">{knowledgeBaseStats.byType?.restaurant || 0}</div>
                <div className="text-gray-600">Restaurantes</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-600">{knowledgeBaseStats.byType?.hotel || 0}</div>
                <div className="text-gray-600">Hotéis</div>
              </div>
            </div>
          )}
          <div className="mt-3 text-xs text-gray-500">
            Última atualização: {lastUpdate}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={updateKnowledgeBase}
              disabled={loading}
              className="ml-2 h-6 px-2"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : '🔄'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Question Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Pergunta do Turista
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Digite a pergunta do turista:</label>
            <Textarea
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              placeholder="Ex: Onde posso comer peixe típico do Pantanal? Quais são os horários do Parque das Nações? Como chegar ao Bonito?"
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
                Processando com IA...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Gerar Resposta Inteligente
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Current Response */}
      {currentResponse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resposta para o Turista</span>
              <div className="flex items-center gap-2">
                <Badge className={getConfidenceColor(currentResponse.confidence)}>
                  {Math.round(currentResponse.confidence * 100)}% confiança
                </Badge>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(currentResponse.answer)}
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
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Resposta principal */}
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="whitespace-pre-wrap text-gray-800">{currentResponse.answer}</p>
            </div>

            {/* Fontes utilizadas */}
            {currentResponse.sources.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Fontes consultadas:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentResponse.sources.map((source, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                      {getSourceIcon(source.source)}
                      <span className="font-medium">{source.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {source.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sugestões */}
            {currentResponse.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Sugestões para o turista:</h4>
                <div className="flex flex-wrap gap-2">
                  {currentResponse.suggestions.map((suggestion, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Perguntas relacionadas */}
            {currentResponse.related_questions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Perguntas relacionadas:</h4>
                <div className="space-y-1">
                  {currentResponse.related_questions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(question)}
                      className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Informações do CAT */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Informações do CAT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Local:</span> {catLocation}
            </div>
            <div>
              <span className="font-medium">Atendente:</span> {attendantName}
            </div>
            {latitude && longitude && (
              <>
                <div>
                  <span className="font-medium">Latitude:</span> {latitude.toFixed(6)}
                </div>
                <div>
                  <span className="font-medium">Longitude:</span> {longitude.toFixed(6)}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CATAIInterface;
