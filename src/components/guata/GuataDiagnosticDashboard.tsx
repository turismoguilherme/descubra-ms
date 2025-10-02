// Guatá Diagnostic Dashboard - Monitora o funcionamento do chatbot consciente
// Sistema de diagnóstico em tempo real para identificar e resolver problemas

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Search, 
  Shield, 
  Globe, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Database,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react';
import { guataConsciousService } from '@/services/ai/guataConsciousService';
import { guataWebSearchService } from '@/services/ai/guataWebSearchService';
import { guataVerificationService } from '@/services/ai/guataVerificationService';

interface DiagnosticData {
  conscious: {
    status: string;
    knowledgeBaseSize: number;
    categories: number;
    lastUpdate: string;
  };
  webSearch: {
    status: string;
    cacheSize: number;
    lastSearch: string;
  };
  verification: {
    status: string;
    cacheSize: number;
    verificationMethods: string[];
  };
  overall: {
    status: string;
    confidence: number;
    lastTest: string;
  };
}

const GuataDiagnosticDashboard: React.FC = () => {
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    runDiagnostic();
  }, []);

  const runDiagnostic = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Executando diagnóstico completo do Guatá...');
      
      // Executar diagnósticos em paralelo
      const [consciousHealth, webSearchHealth, verificationHealth] = await Promise.allSettled([
        guataConsciousService.healthCheck(),
        guataWebSearchService.healthCheck(),
        guataVerificationService.healthCheck()
      ]);

      // Processar resultados
      const data: DiagnosticData = {
        conscious: {
          status: consciousHealth.status === 'fulfilled' ? consciousHealth.value.status : 'unhealthy',
          knowledgeBaseSize: consciousHealth.status === 'fulfilled' ? consciousHealth.value.knowledgeBaseSize : 0,
          categories: consciousHealth.status === 'fulfilled' ? consciousHealth.value.categories : 0,
          lastUpdate: consciousHealth.status === 'fulfilled' ? consciousHealth.value.lastUpdate : 'Erro'
        },
        webSearch: {
          status: webSearchHealth.status === 'fulfilled' ? webSearchHealth.value.status : 'unhealthy',
          cacheSize: webSearchHealth.status === 'fulfilled' ? webSearchHealth.value.cacheSize : 0,
          lastSearch: webSearchHealth.status === 'fulfilled' ? webSearchHealth.value.lastSearch : 'Erro'
        },
        verification: {
          status: verificationHealth.status === 'fulfilled' ? verificationHealth.value.status : 'unhealthy',
          cacheSize: verificationHealth.status === 'fulfilled' ? verificationHealth.value.cacheSize : 0,
          verificationMethods: verificationHealth.status === 'fulfilled' ? verificationHealth.value.verificationMethods : []
        },
        overall: {
          status: 'healthy',
          confidence: 0,
          lastTest: new Date().toISOString()
        }
      };

      // Calcular status geral
      const statuses = [data.conscious.status, data.webSearch.status, data.verification.status];
      const healthyCount = statuses.filter(s => s === 'healthy').length;
      const totalCount = statuses.length;
      
      data.overall.status = healthyCount === totalCount ? 'healthy' : 
                           healthyCount >= totalCount / 2 ? 'degraded' : 'unhealthy';
      data.overall.confidence = healthyCount / totalCount;

      setDiagnosticData(data);
      setLastRefresh(new Date());
      
      console.log('✅ Diagnóstico concluído:', data);
      
    } catch (error) {
      console.error('❌ Erro no diagnóstico:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runTest = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Executando teste do Guatá...');
      
      const testQuestions = [
        'O que fazer em Bonito?',
        'Como é o Pantanal?',
        'Onde comer em Campo Grande?',
        'Quais são as atrações de Corumbá?'
      ];

      const results = [];
      
      for (const question of testQuestions) {
        try {
          console.log(`🧪 Testando: "${question}"`);
          
          const startTime = Date.now();
          const response = await guataConsciousService.processQuestion({
            question,
            userId: 'test-user',
            sessionId: `test-${Date.now()}`,
            context: 'test'
          });
          const processingTime = Date.now() - startTime;
          
          results.push({
            question,
            success: true,
            confidence: response.confidence,
            processingTime,
            sources: response.sources.length,
            verificationStatus: response.metadata.verificationStatus,
            timestamp: new Date().toISOString()
          });
          
          console.log(`✅ Teste bem-sucedido: ${Math.round(response.confidence * 100)}% confiança`);
          
        } catch (error) {
          console.error(`❌ Teste falhou para "${question}":`, error);
          
          results.push({
            question,
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            timestamp: new Date().toISOString()
          });
        }
        
        // Pequena pausa entre testes
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setTestResults(results);
      console.log('✅ Testes concluídos:', results);
      
    } catch (error) {
      console.error('❌ Erro nos testes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllCaches = async () => {
    try {
      console.log('🧹 Limpando todos os caches...');
      
      guataWebSearchService.clearCache();
      guataVerificationService.clearCache();
      
      console.log('✅ Caches limpos com sucesso');
      
      // Executar diagnóstico novamente
      await runDiagnostic();
      
    } catch (error) {
      console.error('❌ Erro ao limpar caches:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertCircle className="h-4 w-4" />;
      case 'unhealthy': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (!diagnosticData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Carregando diagnóstico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Dashboard de Diagnóstico - Guatá Consciente
          </h1>
          <p className="text-gray-600">Monitoramento em tempo real do sistema de IA</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={runDiagnostic} 
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button 
            onClick={runTest} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            Executar Testes
          </Button>
          
          <Button 
            onClick={clearAllCaches} 
            disabled={isLoading}
            variant="destructive"
          >
            <Database className="h-4 w-4 mr-2" />
            Limpar Caches
          </Button>
        </div>
      </div>

      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Status Geral do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon(diagnosticData.overall.status)}
              </div>
              <Badge className={getStatusColor(diagnosticData.overall.status)}>
                {diagnosticData.overall.status === 'healthy' ? 'Saudável' : 
                 diagnosticData.overall.status === 'degraded' ? 'Degradado' : 'Problemático'}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">Status Geral</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {Math.round(diagnosticData.overall.confidence * 100)}%
              </div>
              <p className="text-sm text-gray-600">Confiança</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600">
                {new Date(diagnosticData.overall.lastTest).toLocaleTimeString()}
              </p>
              <p className="text-xs text-gray-500">Último Teste</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">
                {lastRefresh.toLocaleTimeString()}
              </p>
              <p className="text-xs text-gray-500">Última Atualização</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Componentes Individuais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Serviço Consciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Serviço Consciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <Badge className={getStatusColor(diagnosticData.conscious.status)}>
                {diagnosticData.conscious.status === 'healthy' ? 'Saudável' : 
                 diagnosticData.conscious.status === 'degraded' ? 'Degradado' : 'Problemático'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Base de Conhecimento:</span>
              <span className="font-medium">{diagnosticData.conscious.knowledgeBaseSize} itens</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Categorias:</span>
              <span className="font-medium">{diagnosticData.conscious.categories}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Última Atualização:</span>
              <span className="text-sm text-gray-600">
                {new Date(diagnosticData.conscious.lastUpdate).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Busca Web */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-600" />
              Busca Web
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <Badge className={getStatusColor(diagnosticData.webSearch.status)}>
                {diagnosticData.webSearch.status === 'healthy' ? 'Saudável' : 
                 diagnosticData.webSearch.status === 'degraded' ? 'Degradado' : 'Problemático'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Cache:</span>
              <span className="font-medium">{diagnosticData.webSearch.cacheSize} itens</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Última Busca:</span>
              <span className="text-sm text-gray-600">
                {diagnosticData.webSearch.lastSearch === 'Nunca' ? 'Nunca' : 
                 new Date(diagnosticData.webSearch.lastSearch).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Verificação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Verificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <Badge className={getStatusColor(diagnosticData.verification.status)}>
                {diagnosticData.verification.status === 'healthy' ? 'Saudável' : 
                 diagnosticData.verification.status === 'degraded' ? 'Degradado' : 'Problemático'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Cache:</span>
              <span className="font-medium">{diagnosticData.verification.cacheSize} itens</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Métodos:</span>
              <span className="text-sm text-gray-600">
                {diagnosticData.verification.verificationMethods.length}
              </span>
            </div>
            
            <div className="text-xs text-gray-500">
              {diagnosticData.verification.verificationMethods.join(', ')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resultados dos Testes */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Resultados dos Testes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{result.question}</p>
                    <p className="text-sm text-gray-600">
                      {result.success ? (
                        <>
                          Confiança: {Math.round(result.confidence * 100)}% | 
                          Tempo: {result.processingTime}ms | 
                          Fontes: {result.sources} | 
                          Verificação: {result.verificationStatus}
                        </>
                      ) : (
                        `Erro: ${result.error}`
                      )}
                    </p>
                  </div>
                  
                  <div className="ml-4">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
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
            Como Usar Este Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Monitoramento:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Status geral do sistema em tempo real</li>
                <li>• Saúde de cada componente individual</li>
                <li>• Tamanho das bases de dados e caches</li>
                <li>• Últimas atualizações e testes</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Ações:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Atualizar:</strong> Executa diagnóstico completo</li>
                <li>• <strong>Executar Testes:</strong> Testa funcionalidades</li>
                <li>• <strong>Limpar Caches:</strong> Remove dados antigos</li>
                <li>• <strong>Monitorar:</strong> Acompanha mudanças</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuataDiagnosticDashboard;
































