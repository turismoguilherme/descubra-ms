import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Target,
  AlertTriangle,
  BarChart3,
  LineChart,
  PieChart,
  Download,
  Lightbulb,
  Brain
} from 'lucide-react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
// PredictiveAnalytics removido - funcionalidade será integrada no superTourismAI quando necessário

interface AdvancedAnalyticsDashboardProps {
  className?: string;
}

const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({ className = '' }) => {
  const { cityId, regionId } = useRoleBasedAccess();
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [demandForecast, setDemandForecast] = useState<DemandForecast[]>([]);
  const [seasonality, setSeasonality] = useState<SeasonalityPattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [cityId, regionId]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Dados mockados temporariamente - funcionalidade será integrada no futuro
      const insightsData = [
        {
          id: 1,
          title: "Crescimento do Turismo de Eventos",
          description: "Campo Grande tem potencial para se tornar hub de eventos regionais",
          impact: "high",
          confidence: 0.85,
          category: "eventos"
        }
      ];
      const forecastData = [
        {
          period: "Próximos 3 meses",
          predictedVisitors: 15000,
          variance: 15,
          factors: ["clima", "eventos", "promoções"]
        }
      ];
      const seasonalityData = [
        {
          month: "Janeiro",
          pattern: "alta",
          factor: "verão e férias escolares"
        }
      ];

      setInsights(insightsData);
      setDemandForecast(forecastData);
      setSeasonality(seasonalityData);
    } catch (error) {
      console.error('❌ Erro ao carregar dados analíticos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <TrendingUp className="h-4 w-4" />;
      case 'low': return <Target className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const renderDemandForecast = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5 text-blue-500" />
          Previsão de Demanda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {demandForecast.slice(0, 3).map((forecast, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{forecast.period}</h4>
                <Badge variant="outline">
                  ±{forecast.variance}% variação
                </Badge>
              </div>
              
              <div className="text-2xl font-bold text-blue-600 mb-3">
                {forecast.predictedVisitors.toLocaleString()} visitantes
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Clima</div>
                  <Progress value={forecast.factors.weather * 100} className="h-2 mt-1" />
                  <div className="text-xs mt-1">{Math.round(forecast.factors.weather * 100)}%</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Eventos</div>
                  <Progress value={forecast.factors.events * 100} className="h-2 mt-1" />
                  <div className="text-xs mt-1">{Math.round(forecast.factors.events * 100)}%</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Histórico</div>
                  <Progress value={forecast.factors.historical * 100} className="h-2 mt-1" />
                  <div className="text-xs mt-1">{Math.round(forecast.factors.historical * 100)}%</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Externos</div>
                  <Progress value={forecast.factors.external * 100} className="h-2 mt-1" />
                  <div className="text-xs mt-1">{Math.round(forecast.factors.external * 100)}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderSeasonalityAnalysis = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-500" />
          Análise de Sazonalidade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {seasonality
            .sort((a, b) => b.expectedVisitors - a.expectedVisitors)
            .slice(0, 6)
            .map((pattern, index) => (
              <div key={pattern.month} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{pattern.monthName}</h4>
                  <Badge 
                    variant={index < 2 ? "default" : index < 4 ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {index < 2 ? 'Alto' : index < 4 ? 'Médio' : 'Baixo'}
                  </Badge>
                </div>
                
                <div className="text-lg font-bold text-green-600 mb-2">
                  {pattern.expectedVisitors.toLocaleString()}
                </div>
                
                <div className="mb-2">
                  <Progress value={pattern.confidenceLevel * 100} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">
                    Confiança: {Math.round(pattern.confidenceLevel * 100)}%
                  </div>
                </div>
                
                <div className="space-y-1">
                  {pattern.factors.slice(0, 2).map((factor, idx) => (
                    <div key={idx} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                      {factor}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderStrategicInsights = () => (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <Card key={index} className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getImpactIcon(insight.impact)}
              {insight.title}
              <Badge 
                variant="outline" 
                className={`ml-auto text-xs ${getImpactColor(insight.impact)} text-white border-none`}
              >
                Impacto {insight.impact === 'high' ? 'Alto' : insight.impact === 'medium' ? 'Médio' : 'Baixo'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{insight.description}</p>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Confiança: {Math.round(insight.confidence * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{insight.timeframe}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Recomendações:
              </h4>
              <ul className="space-y-1">
                {insight.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com Ações */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-500" />
            Analytics Preditivo
          </h2>
          <p className="text-gray-600 mt-1">
            Insights estratégicos baseados em análise preditiva de dados
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadAnalyticsData}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Atualizar Dados
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Próximo Mês</span>
            </div>
            <div className="text-2xl font-bold">
              {demandForecast.length > 0 ? demandForecast[0].predictedVisitors.toLocaleString() : '---'}
            </div>
            <p className="text-xs text-gray-500">Visitantes previstos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Confiança Média</span>
            </div>
            <div className="text-2xl font-bold">
              {insights.length > 0 ? Math.round((insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length) * 100) : 0}%
            </div>
            <p className="text-xs text-gray-500">Nas previsões</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Insights Gerados</span>
            </div>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-gray-500">Recomendações ativas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Pico Sazonal</span>
            </div>
            <div className="text-2xl font-bold">
              {seasonality.length > 0 ? seasonality.sort((a, b) => b.expectedVisitors - a.expectedVisitors)[0]?.monthName.slice(0, 3) : '---'}
            </div>
            <p className="text-xs text-gray-500">Melhor período</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights Estratégicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Insights Estratégicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            renderStrategicInsights()
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum insight estratégico disponível no momento.</p>
              <Button className="mt-4" onClick={loadAnalyticsData}>
                Gerar Insights
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid de Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderDemandForecast()}
        {renderSeasonalityAnalysis()}
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard; 