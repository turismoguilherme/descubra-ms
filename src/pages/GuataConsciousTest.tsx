// Página de teste para o Guatá Consciente
// Permite testar todas as funcionalidades do novo sistema

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Search, 
  Shield, 
  Globe, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Zap,
  TrendingUp,
  Database,
  RefreshCw
} from 'lucide-react';
import { guataConsciousService } from '@/services/ai/guataConsciousService';
import { guataWebSearchService } from '@/services/ai/guataWebSearchService';
import { guataVerificationService } from '@/services/ai/guataVerificationService';
import GuataDiagnosticDashboard from '@/components/guata/GuataDiagnosticDashboard';

interface TestResult {
  question: string;
  response: any;
  processingTime: number;
  timestamp: string;
  success: boolean;
  error?: string;
}

const GuataConsciousTest: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);

  const testQuestion = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      console.log('🧠 Testando pergunta:', question);
      
      const startTime = Date.now();
      const response = await guataConsciousService.processQuestion({
        question: question.trim(),
        userId: 'test-user',
        sessionId: `test-${Date.now()}`,
        context: 'test'
      });
      const processingTime = Date.now() - startTime;

      const result: TestResult = {
        question: question.trim(),
        response,
        processingTime,
        timestamp: new Date().toISOString(),
        success: true
      };

      setTestResults(prev => [result, ...prev.slice(0, 9)]); // Manter apenas últimos 10
      setQuestion('');
      
      console.log('✅ Teste bem-sucedido:', response);
      
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      
      const result: TestResult = {
        question: question.trim(),
        response: null,
        processingTime: 0,
        timestamp: new Date().toISOString(),
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };

      setTestResults(prev => [result, ...prev.slice(0, 9)]);
    } finally {
      setIsLoading(false);
    }
  };

  const runQuickTests = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Executando testes rápidos...');
      
      const quickQuestions = [
        'O que fazer em Bonito?',
        'Como é o Pantanal?',
        'Onde comer em Campo Grande?',
        'Quais são as atrações de Corumbá?',
        'Como chegar em MS?'
      ];

      const results: TestResult[] = [];
      
      for (const q of quickQuestions) {
        try {
          const startTime = Date.now();
          const response = await guataConsciousService.processQuestion({
            question: q,
            userId: 'test-user',
            sessionId: `test-${Date.now()}`,
            context: 'test'
          });
          const processingTime = Date.now() - startTime;

          results.push({
            question: q,
            response,
            processingTime,
            timestamp: new Date().toISOString(),
            success: true
          });

          console.log(`✅ Teste rápido: "${q}" - ${Math.round(response.confidence * 100)}% confiança`);
          
        } catch (error) {
          console.error(`❌ Teste rápido falhou: "${q}"`, error);
          
          results.push({
            question: q,
            response: null,
            processingTime: 0,
            timestamp: new Date().toISOString(),
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
        
        // Pequena pausa entre testes
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setTestResults(prev => [...results, ...prev.slice(0, 5)]); // Adicionar no início, manter máximo 15
      console.log('✅ Testes rápidos concluídos');
      
    } catch (error) {
      console.error('❌ Erro nos testes rápidos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'unverified': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Brain className="h-10 w-10 text-blue-600" />
            Guatá Consciente - Teste
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Teste o novo sistema de IA consciente do Guatá com base de conhecimento verdadeira, 
            verificação em tempo real e busca web inteligente.
          </p>
        </div>

        {/* Controles */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Controles de Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Digite sua pergunta sobre turismo em MS..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && testQuestion()}
                  disabled={isLoading}
                />
              </div>
              
              <Button 
                onClick={testQuestion} 
                disabled={isLoading || !question.trim()}
                className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                Testar
              </Button>
              
              <Button 
                onClick={runQuickTests} 
                disabled={isLoading}
                variant="outline"
                className="min-w-[140px]"
              >
                <Zap className="h-4 w-4 mr-2" />
                Testes Rápidos
              </Button>
              
              <Button 
                onClick={clearResults} 
                disabled={isLoading || testResults.length === 0}
                variant="outline"
              >
                <Database className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {testResults.length > 0 && (
                  <span>Total de testes: {testResults.length}</span>
                )}
              </div>
              
              <Button
                onClick={() => setShowDashboard(!showDashboard)}
                variant="outline"
                size="sm"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {showDashboard ? 'Ocultar' : 'Mostrar'} Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard (condicional) */}
        {showDashboard && (
          <div className="mb-8">
            <GuataDiagnosticDashboard />
          </div>
        )}

        {/* Resultados dos Testes */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Resultados dos Testes ({testResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white">
                    {/* Pergunta */}
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-lg text-gray-900">
                        {result.question}
                      </h4>
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                        <Badge variant="outline" className="text-xs">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </Badge>
                      </div>
                    </div>

                    {result.success ? (
                      <div className="space-y-3">
                        {/* Resposta */}
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Resposta:</h5>
                          <p className="text-gray-800 bg-gray-50 p-3 rounded border">
                            {result.response.answer}
                          </p>
                        </div>

                        {/* Metadados */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">
                              {Math.round(result.response.confidence * 100)}%
                            </div>
                            <p className="text-xs text-blue-700">Confiança</p>
                          </div>
                          
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-lg font-bold text-green-600">
                              {result.processingTime}ms
                            </div>
                            <p className="text-xs text-green-700">Tempo</p>
                          </div>
                          
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-lg font-bold text-purple-600">
                              {result.response.sources.length}
                            </div>
                            <p className="text-xs text-purple-700">Fontes</p>
                          </div>
                          
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <Badge className={getVerificationColor(result.response.metadata.verificationStatus)}>
                              {result.response.metadata.verificationStatus === 'verified' ? 'Verificado' : 
                               result.response.metadata.verificationStatus === 'partial' ? 'Parcial' : 'Não Verificado'}
                            </Badge>
                            <p className="text-xs text-orange-700 mt-1">Status</p>
                          </div>
                        </div>

                        {/* Fontes */}
                        {result.response.sources.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Fontes Consultadas:</h5>
                            <div className="space-y-2">
                              {result.response.sources.map((source: any, sourceIndex: number) => (
                                <div key={sourceIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                  <Globe className="h-4 w-4 text-gray-500" />
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{source.title}</p>
                                    <p className="text-xs text-gray-600">{source.type}</p>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {new Date(source.lastUpdated).toLocaleDateString()}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sugestões */}
                        {result.response.metadata.suggestions.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Sugestões:</h5>
                            <div className="flex flex-wrap gap-2">
                              {result.response.metadata.suggestions.map((suggestion: string, suggestionIndex: number) => (
                                <Badge key={suggestionIndex} variant="secondary" className="text-xs">
                                  {suggestion}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                        <p className="text-red-700 font-medium">Erro no teste</p>
                        <p className="text-red-600 text-sm">{result.error}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Como Usar Este Teste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-800">Teste Individual:</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Digite uma pergunta sobre turismo em MS</li>
                  <li>• Clique em "Testar" para processar</li>
                  <li>• Analise a resposta e metadados</li>
                  <li>• Verifique confiança e fontes</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-gray-800">Testes Rápidos:</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Clique em "Testes Rápidos" para executar 5 perguntas</li>
                  <li>• Testa funcionalidades principais automaticamente</li>
                  <li>• Compara respostas e tempos de processamento</li>
                  <li>• Identifica problemas rapidamente</li>
                </ul>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="text-center">
              <h4 className="font-semibold mb-3 text-gray-800">O que o Guatá Consciente oferece:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="font-medium text-blue-800">Base de Conhecimento Verdadeira</p>
                  <p className="text-blue-700">Dados verificados e atualizados sobre MS</p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <Search className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-green-800">Busca Web Inteligente</p>
                  <p className="text-green-700">Informações sempre atualizadas da internet</p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="font-medium text-purple-800">Verificação em Tempo Real</p>
                  <p className="text-purple-700">Garantia de informações confiáveis</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuataConsciousTest;
































