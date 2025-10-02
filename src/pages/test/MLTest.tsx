import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  BarChart3, 
  TrendingUp, 
  Target, 
  Zap,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Cpu,
  BarChart
} from 'lucide-react';

interface MLModel {
  id: string;
  name: string;
  status: 'active' | 'training' | 'error' | 'idle';
  accuracy: number;
  lastTraining: string;
  predictions: number;
  description: string;
}

interface PredictionResult {
  id: string;
  input: string;
  prediction: string;
  confidence: number;
  timestamp: string;
}

const MLTest: React.FC = () => {
  const [models, setModels] = useState<MLModel[]>([
    {
      id: 'guata-personality',
      name: 'Guatá Personalidade',
      status: 'active',
      accuracy: 94.2,
      lastTraining: new Date().toISOString(),
      predictions: 15420,
      description: 'Modelo de personalidade do Guatá baseado em GPT'
    },
    {
      id: 'tourism-recommendation',
      name: 'Recomendações Turísticas',
      status: 'active',
      accuracy: 87.5,
      lastTraining: new Date().toISOString(),
      predictions: 8920,
      description: 'Sistema de recomendação de destinos turísticos'
    },
    {
      id: 'sentiment-analysis',
      name: 'Análise de Sentimento',
      status: 'training',
      accuracy: 91.8,
      lastTraining: new Date().toISOString(),
      predictions: 2340,
      description: 'Análise de sentimento em comentários e avaliações'
    },
    {
      id: 'user-behavior',
      name: 'Comportamento do Usuário',
      status: 'idle',
      accuracy: 78.3,
      lastTraining: new Date().toISOString(),
      predictions: 5670,
      description: 'Predição de comportamento e preferências do usuário'
    },
    {
      id: 'content-classification',
      name: 'Classificação de Conteúdo',
      status: 'error',
      accuracy: 0,
      lastTraining: new Date().toISOString(),
      predictions: 0,
      description: 'Classificação automática de conteúdo turístico'
    }
  ]);

  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testInput, setTestInput] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'training':
        return <Activity className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'idle':
        return <Clock className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Ativo</Badge>;
      case 'training':
        return <Badge variant="secondary" className="bg-blue-500">Treinando</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'idle':
        return <Badge variant="outline">Inativo</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const runMLTests = async () => {
    setIsRunning(true);
    
    // Simular testes de ML
    const testInputs = [
      'Quero conhecer praias em Mato Grosso do Sul',
      'Qual o melhor hotel para família?',
      'Eventos culturais em Campo Grande',
      'Roteiro de 3 dias em Bonito',
      'Restaurantes típicos da região'
    ];

    const newPredictions: PredictionResult[] = [];

    for (let i = 0; i < testInputs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const prediction: PredictionResult = {
        id: `pred-${Date.now()}-${i}`,
        input: testInputs[i],
        prediction: generateMockPrediction(testInputs[i]),
        confidence: Math.random() * 20 + 80, // 80-100%
        timestamp: new Date().toISOString()
      };
      
      newPredictions.push(prediction);
      setPredictions(prev => [prediction, ...prev.slice(0, 9)]); // Manter apenas 10 predições
    }

    setIsRunning(false);
  };

  const generateMockPrediction = (input: string): string => {
    const responses = [
      'Recomendo visitar Bonito e suas cachoeiras cristalinas',
      'Sugestão: Hotel Fazenda para experiência familiar completa',
      'Confira o Festival de Inverno e feiras artesanais',
      'Roteiro: Pantanal + Bonito + Campo Grande',
      'Experimente o arroz carreteiro e peixe assado'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const testCustomInput = async () => {
    if (!testInput.trim()) return;
    
    setIsRunning(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const prediction: PredictionResult = {
      id: `pred-${Date.now()}`,
      input: testInput,
      prediction: generateMockPrediction(testInput),
      confidence: Math.random() * 20 + 80,
      timestamp: new Date().toISOString()
    };
    
    setPredictions(prev => [prediction, ...prev.slice(0, 9)]);
    setTestInput('');
    setIsRunning(false);
  };

  const getModelHealth = () => {
    const activeCount = models.filter(m => m.status === 'active').length;
    const totalCount = models.length;
    const healthPercentage = (activeCount / totalCount) * 100;
    
    if (healthPercentage >= 80) return { status: 'excellent', color: 'text-green-500' };
    if (healthPercentage >= 60) return { status: 'good', color: 'text-yellow-500' };
    return { status: 'needs_attention', color: 'text-red-500' };
  };

  const health = getModelHealth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="h-8 w-8 text-purple-500" />
              Teste de Machine Learning - Descubra MS
            </h1>
            <p className="text-gray-600 mt-2">
              Monitoramento e teste dos modelos de IA do sistema
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${health.color}`}>
              {models.filter(m => m.status === 'active').length}/{models.length} Modelos
            </div>
            <div className="text-sm text-gray-500">
              Status: {health.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Alertas */}
        {models.some(m => m.status === 'error') && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              <strong>Atenção:</strong> Alguns modelos de ML estão com problemas. 
              Verifique os logs de treinamento e execute os testes.
            </AlertDescription>
          </Alert>
        )}

        {/* Controles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Controles de Teste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={runMLTests} 
                  disabled={isRunning}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isRunning ? 'Executando...' : 'Executar Testes Automáticos'}
                </Button>
                <Button variant="outline" onClick={() => setPredictions([])}>
                  Limpar Resultados
                </Button>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Digite uma pergunta para testar o Guatá..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && testCustomInput()}
                />
                <Button 
                  onClick={testCustomInput}
                  disabled={isRunning || !testInput.trim()}
                  variant="outline"
                >
                  Testar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status dos Modelos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => (
            <Card key={model.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(model.status)}
                    {model.name}
                  </CardTitle>
                  {getStatusBadge(model.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{model.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Precisão:</span>
                    <span className={model.accuracy > 90 ? 'text-green-500' : model.accuracy > 80 ? 'text-yellow-500' : 'text-red-500'}>
                      {model.accuracy}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Predições:</span>
                    <span>{model.predictions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Último treino:</span>
                    <span>{new Date(model.lastTraining).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resultados de Predições */}
        {predictions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resultados de Predições
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {predictions.map((prediction) => (
                  <div key={prediction.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Entrada:</strong> {prediction.input}
                        </p>
                        <p className="text-sm">
                          <strong>Resposta:</strong> {prediction.prediction}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <div className={`font-medium ${prediction.confidence > 90 ? 'text-green-500' : prediction.confidence > 80 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {prediction.confidence.toFixed(1)}% confiança
                        </div>
                        <div className="text-gray-500">
                          {new Date(prediction.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total de Predições</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {models.reduce((sum, model) => sum + model.predictions, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Precisão Média</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(models.reduce((sum, model) => sum + model.accuracy, 0) / models.length).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Modelos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {models.filter(m => m.status === 'active').length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MLTest;


