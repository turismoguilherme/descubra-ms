/**
 * 🧪 PÁGINA DE TESTE DO GUATÁ INTELLIGENT TOURISM
 * Interface para testar todas as funcionalidades do Guatá
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import UniversalLayout from '@/components/layout/UniversalLayout';
import { guataIntelligentTourismService } from '@/services/ai/guataIntelligentTourismService';

interface TestResult {
  id: string;
  question: string;
  answer: string;
  confidence: number;
  processingTime: number;
  usedRealSearch: boolean;
  searchMethod: string;
  sources: string[];
  timestamp: Date;
}

const GuataTest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isTestingQuestion, setIsTestingQuestion] = useState(false);
  const [testQuestion, setTestQuestion] = useState('');
  const [apiStatus, setApiStatus] = useState<any>({});

  // Verificar status das APIs
  useEffect(() => {
    checkAPIStatus();
  }, []);

  const checkAPIStatus = () => {
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const googleSearchKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
    const googleEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;
    const serpApiKey = import.meta.env.VITE_SERPAPI_KEY;

    setApiStatus({
      gemini: !!geminiKey,
      googleSearch: !!(googleSearchKey && googleEngineId),
      serpAPI: !!serpApiKey,
      hasWebSearch: !!(googleSearchKey && googleEngineId) || !!serpApiKey
    });
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    try {
      console.log('🧪 Executando todos os testes...');
      // Teste básico do Guatá
      const testQuestions = [
        "Oi",
        "O que fazer em Campo Grande?",
        "Hotel em Bonito",
        "Rota Bioceânica"
      ];
      
      for (const question of testQuestions) {
        console.log(`🧪 Testando: ${question}`);
        const result = await guataIntelligentTourismService.processQuestion({
          question,
          userId: 'test',
          sessionId: 'test-session',
          userLocation: 'Mato Grosso do Sul'
        });
        
        console.log(`✅ Resposta: ${result.answer.substring(0, 100)}...`);
      }
      
      toast({
        title: "Testes Concluídos",
        description: "Todos os testes foram executados. Verifique o console para detalhes.",
        variant: "default"
      });
      
    } catch (error) {
      console.error('❌ Erro nos testes:', error);
      toast({
        title: "Erro nos Testes",
        description: "Ocorreu um erro durante a execução dos testes.",
        variant: "destructive"
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const testCustomQuestion = async () => {
    if (!testQuestion.trim()) {
      toast({
        title: "Pergunta Vazia",
        description: "Digite uma pergunta para testar.",
        variant: "destructive"
      });
      return;
    }

    setIsTestingQuestion(true);
    
    try {
      console.log('🧪 Testando pergunta personalizada:', testQuestion);
      
      const response = await guataIntelligentTourismService.processQuestion({
        question: testQuestion,
        userId: user?.id || 'test-user',
        sessionId: `test-session-${Date.now()}`,
        userLocation: 'Mato Grosso do Sul'
      });

      const testResult: TestResult = {
        id: `test-${Date.now()}`,
        question: testQuestion,
        answer: response.answer,
        confidence: response.confidence,
        processingTime: response.processingTime,
        usedRealSearch: response.usedRealSearch,
        searchMethod: response.searchMethod,
        sources: response.sources,
        timestamp: new Date()
      };

      setTestResults(prev => [testResult, ...prev]);
      
      toast({
        title: "Teste Concluído",
        description: `Resposta gerada em ${response.processingTime}ms`,
        variant: "default"
      });
      
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      toast({
        title: "Erro no Teste",
        description: "Ocorreu um erro durante o teste.",
        variant: "destructive"
      });
    } finally {
      setIsTestingQuestion(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status: boolean) => {
    return status ? '✅' : '❌';
  };

  return (
    <UniversalLayout>
      <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green">
        <div className="ms-container max-w-6xl mx-auto py-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🧪 Guatá Intelligent Tourism - Testes
            </h1>
            <p className="text-white/80 text-lg">
              Interface para testar todas as funcionalidades do Guatá
            </p>
          </div>

          {/* Status das APIs */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">🔧 Status das APIs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🤖</span>
                  <span className="font-semibold text-white">Gemini AI</span>
                </div>
                <p className={`text-sm ${getStatusColor(apiStatus.gemini)}`}>
                  {getStatusIcon(apiStatus.gemini)} {apiStatus.gemini ? 'Configurada' : 'Não configurada'}
                </p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🔍</span>
                  <span className="font-semibold text-white">Google Search</span>
                </div>
                <p className={`text-sm ${getStatusColor(apiStatus.googleSearch)}`}>
                  {getStatusIcon(apiStatus.googleSearch)} {apiStatus.googleSearch ? 'Configurada' : 'Não configurada'}
                </p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🔍</span>
                  <span className="font-semibold text-white">SerpAPI</span>
                </div>
                <p className={`text-sm ${getStatusColor(apiStatus.serpAPI)}`}>
                  {getStatusIcon(apiStatus.serpAPI)} {apiStatus.serpAPI ? 'Configurada' : 'Não configurada'}
                </p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🌐</span>
                  <span className="font-semibold text-white">Pesquisa Web</span>
                </div>
                <p className={`text-sm ${getStatusColor(apiStatus.hasWebSearch)}`}>
                  {getStatusIcon(apiStatus.hasWebSearch)} {apiStatus.hasWebSearch ? 'Ativa' : 'Inativa'}
                </p>
              </div>
            </div>
          </div>

          {/* Controles de Teste */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Teste Automático */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">🤖 Teste Automático</h3>
              <p className="text-white/80 mb-4">
                Executa uma bateria completa de testes para verificar todas as funcionalidades.
              </p>
              <button
                onClick={runAllTests}
                disabled={isRunningTests}
                className="w-full bg-ms-accent-orange hover:bg-ms-accent-orange/90 disabled:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {isRunningTests ? 'Executando Testes...' : 'Executar Todos os Testes'}
              </button>
            </div>

            {/* Teste Personalizado */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">🎯 Teste Personalizado</h3>
              <p className="text-white/80 mb-4">
                Teste uma pergunta específica para verificar o comportamento do Guatá.
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  value={testQuestion}
                  onChange={(e) => setTestQuestion(e.target.value)}
                  placeholder="Digite sua pergunta aqui..."
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-ms-accent-orange"
                />
                <button
                  onClick={testCustomQuestion}
                  disabled={isTestingQuestion || !testQuestion.trim()}
                  className="w-full bg-ms-discovery-teal hover:bg-ms-discovery-teal/90 disabled:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {isTestingQuestion ? 'Testando...' : 'Testar Pergunta'}
                </button>
              </div>
            </div>
          </div>

          {/* Resultados dos Testes */}
          {testResults.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">📊 Resultados dos Testes</h3>
                <button
                  onClick={clearResults}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Limpar Resultados
                </button>
              </div>
              
              <div className="space-y-4">
                {testResults.map((result) => (
                  <div key={result.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-white text-sm">
                        ❓ {result.question}
                      </h4>
                      <span className="text-xs text-white/60">
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="text-white/80 text-sm mb-3">
                      {result.answer.substring(0, 200)}...
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-white/60">
                      <span>⏱️ {result.processingTime}ms</span>
                      <span>📊 {Math.round(result.confidence * 100)}%</span>
                      <span>🌐 {result.usedRealSearch ? 'Web Search' : 'Local'}</span>
                      <span>🔍 {result.searchMethod}</span>
                      <span>📚 {result.sources.length} fontes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instruções */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mt-8">
            <h3 className="text-xl font-bold text-white mb-4">📋 Instruções</h3>
            <div className="text-white/80 space-y-2">
              <p>• <strong>Teste Automático:</strong> Executa uma bateria completa de testes para verificar todas as funcionalidades.</p>
              <p>• <strong>Teste Personalizado:</strong> Digite uma pergunta específica para testar o comportamento do Guatá.</p>
              <p>• <strong>Status das APIs:</strong> Verifica se as APIs necessárias estão configuradas.</p>
              <p>• <strong>Resultados:</strong> Mostra os resultados dos testes com métricas de performance.</p>
            </div>
          </div>

          {/* Botão de Volta */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/descubramatogrossodosul/guata')}
              className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              ← Voltar para o Guatá
            </button>
          </div>
        </div>
      </div>
    </UniversalLayout>
  );
};

export default GuataTest;

