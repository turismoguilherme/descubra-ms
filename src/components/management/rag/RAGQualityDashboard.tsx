import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Database,
  Brain,
  Zap,
  Target,
  Users
} from 'lucide-react';

interface RAGMetrics {
  totalQueries: number;
  averageConfidence: number;
  cacheHitRate: number;
  averageResponseTime: number;
  sourceDistribution: {
    fts: number;
    embedding: number;
    pse: number;
    api: number;
  };
  confidenceDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  queryTypes: {
    hotel: number;
    restaurant: number;
    attraction: number;
    event: number;
    transport: number;
    weather: number;
    tourism: number;
    other: number;
  };
  dailyQueries: Array<{
    date: string;
    count: number;
    avgConfidence: number;
  }>;
  topSources: Array<{
    domain: string;
    usage: number;
    avgRelevance: number;
  }>;
  knowledgeGaps: Array<{
    category: string;
    frequency: number;
    avgConfidence: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function RAGQualityDashboard() {
  const [metrics, setMetrics] = useState<RAGMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadRAGMetrics();
  }, []);

  const loadRAGMetrics = async () => {
    try {
      setLoading(true);
      
      // Carregar métricas do RAG
      const metricsData = await fetchRAGMetrics();
      setMetrics(metricsData);
      
    } catch (error) {
      console.error('Erro ao carregar métricas RAG:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRAGMetrics = async (): Promise<RAGMetrics> => {
    // Simular dados para demonstração
    // Em produção, você buscaria do Supabase
    
    const now = new Date();
    const dailyQueries = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 10,
        avgConfidence: Math.random() * 0.3 + 0.7
      };
    }).reverse();

    return {
      totalQueries: 1247,
      averageConfidence: 0.83,
      cacheHitRate: 0.67,
      averageResponseTime: 1250,
      sourceDistribution: {
        fts: 45,
        embedding: 28,
        pse: 18,
        api: 9
      },
      confidenceDistribution: {
        high: 65,
        medium: 25,
        low: 10
      },
      queryTypes: {
        hotel: 23,
        restaurant: 18,
        attraction: 25,
        event: 12,
        transport: 8,
        weather: 6,
        tourism: 5,
        other: 3
      },
      dailyQueries,
      topSources: [
        { domain: 'turismo.ms.gov.br', usage: 35, avgRelevance: 0.92 },
        { domain: 'ms.gov.br', usage: 28, avgRelevance: 0.89 },
        { domain: 'bonito-ms.com.br', usage: 22, avgRelevance: 0.85 },
        { domain: 'secult.ms.gov.br', usage: 15, avgRelevance: 0.88 }
      ],
      knowledgeGaps: [
        { category: 'eventos', frequency: 12, avgConfidence: 0.45 },
        { category: 'transporte', frequency: 8, avgConfidence: 0.52 },
        { category: 'preços', frequency: 15, avgConfidence: 0.38 }
      ]
    };
  };

  const refreshMetrics = () => {
    setLastRefresh(new Date());
    loadRAGMetrics();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando métricas RAG...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar métricas</h3>
        <p className="text-gray-600 mb-4">Não foi possível carregar as métricas do sistema RAG.</p>
        <Button onClick={refreshMetrics} variant="outline">
          Tentar novamente
        </Button>
      </div>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return <Badge className="bg-green-100 text-green-800">Alta</Badge>;
    if (confidence >= 0.6) return <Badge className="bg-yellow-100 text-yellow-800">Média</Badge>;
    return <Badge className="bg-red-100 text-red-800">Baixa</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Qualidade RAG</h1>
          <p className="text-gray-600 mt-2">
            Monitoramento em tempo real do sistema de Retrieval Augmented Generation
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Última atualização</p>
            <p className="text-sm font-medium">{lastRefresh.toLocaleTimeString()}</p>
          </div>
          <Button onClick={refreshMetrics} variant="outline" size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Queries</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalQueries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-600 mr-1" />
              +12% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confiança Média</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.averageConfidence * 100)}%</div>
            <Progress value={metrics.averageConfidence * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Meta: 85% | Atual: {Math.round(metrics.averageConfidence * 100)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.cacheHitRate * 100)}%</div>
            <Progress value={metrics.cacheHitRate * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Respostas em cache
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 text-green-600 mr-1" />
              -15% desde a semana passada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de análise */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sources">Fontes</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="gaps">Lacunas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição de fontes */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Fontes</CardTitle>
                <CardDescription>Como o RAG utiliza diferentes tipos de busca</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(metrics.sourceDistribution).map(([key, value]) => ({
                        name: key.toUpperCase(),
                        value
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(metrics.sourceDistribution).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição de confiança */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Confiança</CardTitle>
                <CardDescription>Qualidade das respostas geradas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(metrics.confidenceDistribution).map(([key, value]) => ({
                    level: key === 'high' ? 'Alta' : key === 'medium' ? 'Média' : 'Baixa',
                    percentage: value
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Queries por tipo */}
          <Card>
            <CardHeader>
              <CardTitle>Queries por Categoria</CardTitle>
              <CardDescription>Distribuição dos tipos de perguntas recebidas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(metrics.queryTypes).map(([key, value]) => ({
                  category: key === 'hotel' ? 'Hotéis' : 
                           key === 'restaurant' ? 'Restaurantes' :
                           key === 'attraction' ? 'Atrativos' :
                           key === 'event' ? 'Eventos' :
                           key === 'transport' ? 'Transporte' :
                           key === 'weather' ? 'Tempo' :
                           key === 'tourism' ? 'Turismo' : 'Outros',
                  count: value
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          {/* Top fontes */}
          <Card>
            <CardHeader>
              <CardTitle>Top Fontes de Informação</CardTitle>
              <CardDescription>Domínios mais utilizados e sua relevância</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topSources.map((source, index) => (
                  <div key={source.domain} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{source.domain}</p>
                        <p className="text-sm text-gray-500">
                          Relevância: {Math.round(source.avgRelevance * 100)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{source.usage} usos</p>
                      <Progress value={source.avgRelevance * 100} className="w-20 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance ao longo do tempo */}
          <Card>
            <CardHeader>
              <CardTitle>Performance ao Longo do Tempo</CardTitle>
              <CardDescription>Evolução das métricas nos últimos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.dailyQueries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="count" stroke="#8884d8" name="Queries" />
                  <Line yAxisId="right" type="monotone" dataKey="avgConfidence" stroke="#82ca9d" name="Confiança" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-6">
          {/* Lacunas de conhecimento */}
          <Card>
            <CardHeader>
              <CardTitle>Lacunas de Conhecimento Identificadas</CardTitle>
              <CardDescription>Áreas que precisam de melhoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.knowledgeGaps.map((gap, index) => (
                  <div key={gap.category} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium capitalize">{gap.category}</p>
                        <p className="text-sm text-gray-500">
                          {gap.frequency} queries com baixa confiança
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Confiança média</p>
                      <p className={`font-semibold ${getConfidenceColor(gap.avgConfidence)}`}>
                        {Math.round(gap.avgConfidence * 100)}%
                      </p>
                      {getConfidenceBadge(gap.avgConfidence)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ações recomendadas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span>Ações Recomendadas</span>
          </CardTitle>
          <CardDescription>
            Sugestões para melhorar a qualidade do sistema RAG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-lg border">
              <h4 className="font-medium text-blue-900 mb-2">🔍 Expandir Base de Conhecimento</h4>
              <p className="text-sm text-blue-700">
                Adicionar mais fontes oficiais para reduzir lacunas de conhecimento
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <h4 className="font-medium text-blue-900 mb-2">🧮 Implementar Embeddings Reais</h4>
              <p className="text-sm text-blue-700">
                Substituir embeddings simulados por modelo real para melhor relevância
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <h4 className="font-medium text-blue-900 mb-2">⏰ Otimizar Cron Jobs</h4>
              <p className="text-sm text-blue-700">
                Configurar atualizações automáticas para manter informações frescas
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <h4 className="font-medium text-blue-900 mb-2">💾 Melhorar Cache</h4>
              <p className="text-sm text-blue-700">
                Implementar cache persistente para reduzir tempo de resposta
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


