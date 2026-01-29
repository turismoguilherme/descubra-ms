import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
// StrategicAnalysisAI removido - funcionalidade integrada no superTourismAI

interface StrategicAnalysisProps {
  onAnalysisUpdate?: (analysis: unknown) => void;
}

export function StrategicAnalysis({ onAnalysisUpdate }: StrategicAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // const analysisService = new StrategicAnalysisAI(); // Serviço removido - funcionalidade integrada no superTourismAI

  useEffect(() => {
    loadAnalysis();
  }, []);

  useEffect(() => {
    if (analysis && onAnalysisUpdate) {
      onAnalysisUpdate(analysis);
    }
  }, [analysis, onAnalysisUpdate]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      // const result = await analysisService.analyzeData(); // Serviço removido
      const result = { insights: [], recommendations: [], metrics: {} }; // Placeholder
      setAnalysis(result);
    } catch (error: unknown) {
      console.error('Erro ao carregar análise:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium">Analisando dados turísticos de Campo Grande</h3>
          <p className="text-sm text-gray-500 mt-2">
            Nossa IA está processando os dados para gerar insights estratégicos
          </p>
          <div className="mt-4 space-y-2 text-left max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <span className="animate-pulse w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-sm">Analisando perfil dos visitantes...</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm">Identificando oportunidades da Rota Bioceânica...</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="animate-pulse w-2 h-2 bg-purple-500 rounded-full" />
              <span className="text-sm">Gerando recomendações práticas...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contexto */}
      <Card>
        <CardHeader>
          <CardTitle>Campo Grande: Hub da Rota Bioceânica</CardTitle>
          <CardDescription>
            Análise estratégica para transformar a cidade de ponto de passagem em destino turístico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Capital MS</Badge>
            <Badge variant="outline">Rota Bioceânica</Badge>
            <Badge variant="outline">Hub Logístico</Badge>
            <Badge variant="outline">Eventos & Negócios</Badge>
            <Badge variant="outline">Gastronomia</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      {analysis?.analysis?.insights && (
        <Card>
          <CardHeader>
            <CardTitle>Insights Estratégicos</CardTitle>
            <CardDescription>
              Análise baseada em dados turísticos e contexto local
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.analysis.insights.map((insight: string, index: number) => (
                <Alert key={index} className="border-l-4 border-blue-500">
                  <AlertTitle className="text-blue-700">Insight {index + 1}</AlertTitle>
                  <AlertDescription>{insight}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recomendações */}
      {analysis?.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendações Práticas</CardTitle>
            <CardDescription>
              Ações sugeridas para desenvolvimento turístico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analysis.recommendations).map(([term, recs]: [string, any]) => (
                <div key={term}>
                  <h3 className="text-lg font-medium mb-2">
                    {term === 'immediate' ? 'Ações Imediatas' :
                     term === 'medium' ? 'Médio Prazo' :
                     'Longo Prazo'}
                  </h3>
                  <div className="space-y-3">
                    {recs.map((rec: unknown, index: number) => (
                      <div key={index} className="p-4 border rounded-lg bg-white">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{rec.title}</h4>
                            <p className="text-gray-600 mt-1">{rec.description}</p>
                            {rec.impact && (
                              <p className="text-sm text-gray-500 mt-2">
                                <span className="font-medium">Impacto Esperado:</span> {rec.impact}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas */}
      {analysis?.metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Métricas Principais</CardTitle>
            <CardDescription>
              Indicadores de desempenho do turismo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500">Crescimento de Visitantes</div>
                <div className="text-2xl font-bold text-green-600">
                  +{analysis.metrics.visitorGrowth}%
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500">Média de Permanência</div>
                <div className="text-2xl font-bold">
                  {analysis.metrics.avgStayDuration} dias
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500">Satisfação</div>
                <div className="text-2xl font-bold text-blue-600">
                  {analysis.metrics.satisfactionScore}/10
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500">Impacto Econômico</div>
                <div className="text-2xl font-bold text-purple-600">
                  R$ {analysis.metrics.economicImpact.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 