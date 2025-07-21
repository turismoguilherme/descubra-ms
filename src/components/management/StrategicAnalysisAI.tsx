import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Download,
  RefreshCw,
  Eye,
  BarChart3,
  Globe,
  Users,
  DollarSign,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  strategicAnalysisAI,
  StrategicAnalysis,
  AnalysisRequest
} from '@/services/ai/strategicAnalysisAI';

interface StrategicAnalysisAIProps {
  region?: string;
  userRole?: string;
}

const StrategicAnalysisAI = ({ region, userRole }: StrategicAnalysisAIProps) => {
  const [analysis, setAnalysis] = useState<StrategicAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState<'comprehensive' | 'competitive' | 'trend' | 'forecast'>('comprehensive');
  const [timeRange, setTimeRange] = useState('30');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [includeBenchmarking, setIncludeBenchmarking] = useState(true);
  const [includeForecast, setIncludeForecast] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');
  const { toast } = useToast();

  const availableFocusAreas = [
    'marketing',
    'infrastructure',
    'service_quality',
    'digital_transformation',
    'sustainability',
    'partnerships',
    'technology',
    'customer_experience'
  ];

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      console.log('🧠 Iniciando análise estratégica...');

      const request: AnalysisRequest = {
        region: region || 'centro_oeste',
        analysis_type: analysisType,
        time_period: {
          start: new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        },
        focus_areas: focusAreas.length > 0 ? focusAreas : undefined,
        include_benchmarking: includeBenchmarking,
        include_forecast: includeForecast
      };

      const result = await strategicAnalysisAI.generateStrategicAnalysis(request);
      setAnalysis(result);

      toast({
        title: "Análise Concluída",
        description: `Confiança: ${Math.round(result.confidence_score * 100)}%`,
      });

    } catch (error) {
      console.error('❌ Erro ao gerar análise:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a análise estratégica",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'marketing': return <TrendingUp className="h-4 w-4" />;
      case 'infrastructure': return <Target className="h-4 w-4" />;
      case 'service': return <Users className="h-4 w-4" />;
      case 'partnership': return <Globe className="h-4 w-4" />;
      case 'technology': return <Brain className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const exportAnalysis = () => {
    if (!analysis) return;

    const exportData = {
      analysis: analysis,
      generated_at: new Date().toISOString(),
      parameters: {
        analysis_type: analysisType,
        time_range: timeRange,
        focus_areas: focusAreas,
        include_benchmarking: includeBenchmarking,
        include_forecast: includeForecast
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strategic_analysis_${region}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Análise Exportada",
      description: "Análise estratégica exportada com sucesso"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">IA de Análise Estratégica</h2>
          <p className="text-gray-600">Análise inteligente para desenvolvimento turístico</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAnalysis} disabled={!analysis}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={generateAnalysis} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Gerar Análise
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações da Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Tipo de Análise</label>
              <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Análise Completa</SelectItem>
                  <SelectItem value="competitive">Análise Competitiva</SelectItem>
                  <SelectItem value="trend">Análise de Tendências</SelectItem>
                  <SelectItem value="forecast">Previsões</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Período de Análise</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Região</label>
              <Select value={region} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="centro_oeste">Centro-Oeste</SelectItem>
                  <SelectItem value="pantanal">Pantanal</SelectItem>
                  <SelectItem value="bonito">Bonito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Áreas de Foco</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {availableFocusAreas.map((area) => (
                <label key={area} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={focusAreas.includes(area)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFocusAreas([...focusAreas, area]);
                      } else {
                        setFocusAreas(focusAreas.filter(a => a !== area));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm capitalize">{area.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeBenchmarking}
                onChange={(e) => setIncludeBenchmarking(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Incluir benchmarking competitivo</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeForecast}
                onChange={(e) => setIncludeForecast(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Incluir previsões futuras</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Resultados da Análise */}
      {analysis && (
        <div className="space-y-6">
          {/* Resumo Executivo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-blue-600" />
                  Resumo Executivo
                </div>
                <Badge className={getRiskLevelColor(analysis.risk_assessment.overall_risk_level)}>
                  Risco {analysis.risk_assessment.overall_risk_level}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
              </div>
            </CardContent>
          </Card>

          {/* Insights Principais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                Insights Principais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.key_insights.map((insight, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recomendações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Recomendações Estratégicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.recommendations.map((recommendation) => (
                  <div key={recommendation.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(recommendation.category)}
                        <h4 className="font-semibold">{recommendation.title}</h4>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(recommendation.priority)}>
                          {recommendation.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {recommendation.implementation_cost}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{recommendation.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Impacto Esperado:</span>
                        <p className="text-gray-600">{recommendation.expected_impact}</p>
                      </div>
                      <div>
                        <span className="font-medium">Prazo:</span>
                        <p className="text-gray-600">{recommendation.timeline_months} meses</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <span className="font-medium text-sm">Métricas de Sucesso:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {recommendation.success_metrics.map((metric, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {metric}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Análise Competitiva */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                Análise Competitiva
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Posição de Mercado:</span>
                    <Badge className="ml-2 capitalize">
                      {analysis.competitive_analysis.market_position}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Market Share Estimado:</span>
                    <span className="ml-2 text-lg font-bold text-blue-600">
                      {analysis.competitive_analysis.market_share_estimate}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Vantagens Competitivas</h4>
                    <div className="space-y-1">
                      {analysis.competitive_analysis.competitive_advantages.map((advantage, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{advantage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Oportunidades de Diferenciação</h4>
                    <div className="space-y-1">
                      {analysis.competitive_analysis.differentiation_opportunities.map((opportunity, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 text-yellow-600" />
                          <span>{opportunity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avaliação de Riscos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Avaliação de Riscos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.risk_assessment.risks.map((risk, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{risk.risk_name}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="capitalize">
                          {risk.category}
                        </Badge>
                        <Badge className={getRiskLevelColor(risk.probability)}>
                          {risk.probability}
                        </Badge>
                        <Badge className={getRiskLevelColor(risk.impact)}>
                          {risk.impact}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{risk.description}</p>
                    
                    <div>
                      <span className="font-medium text-sm">Ações de Mitigação:</span>
                      <div className="mt-1 space-y-1">
                        {risk.mitigation_actions.map((action, actionIndex) => (
                          <div key={actionIndex} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Métricas de Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Métricas de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {analysis.performance_metrics.current_period.total_visitors.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Visitantes Atuais</div>
                  <div className={`text-sm ${analysis.performance_metrics.growth_rates.visitors_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis.performance_metrics.growth_rates.visitors_growth >= 0 ? '+' : ''}
                    {analysis.performance_metrics.growth_rates.visitors_growth.toFixed(1)}%
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    R$ {analysis.performance_metrics.current_period.revenue_estimate.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Receita Estimada</div>
                  <div className={`text-sm ${analysis.performance_metrics.growth_rates.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis.performance_metrics.growth_rates.revenue_growth >= 0 ? '+' : ''}
                    {analysis.performance_metrics.growth_rates.revenue_growth.toFixed(1)}%
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {analysis.performance_metrics.current_period.satisfaction_score.toFixed(1)}/5
                  </div>
                  <div className="text-sm text-gray-600">Satisfação</div>
                  <div className={`text-sm ${analysis.performance_metrics.growth_rates.satisfaction_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis.performance_metrics.growth_rates.satisfaction_growth >= 0 ? '+' : ''}
                    {analysis.performance_metrics.growth_rates.satisfaction_growth.toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Previsões */}
          {analysis.forecast && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Previsões Futuras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(analysis.forecast).filter(([key]) => key !== 'confidence_intervals').map(([period, data]: [string, any]) => (
                    <div key={period} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3 capitalize">
                        {period.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Visitantes:</span>
                          <p className="text-lg font-bold text-blue-600">
                            {data.expected_visitors.toLocaleString()}
                          </p>
                        </div>
                        
                        <div>
                          <span className="font-medium">Receita:</span>
                          <p className="text-lg font-bold text-green-600">
                            R$ {data.expected_revenue.toLocaleString()}
                          </p>
                        </div>
                        
                        <div>
                          <span className="font-medium">Temporadas de Pico:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {data.peak_seasons.map((season: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {season}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default StrategicAnalysisAI; 