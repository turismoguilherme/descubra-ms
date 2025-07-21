import React, { useEffect, useState } from 'react';
import { StrategicAdvisorService } from '@/services/ai/strategicAdvisorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function StrategicAdvisorDashboard() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const advisorService = new StrategicAdvisorService();

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const data = await advisorService.analyzeAndAdvise({});
      setAnalysis(data);
    } catch (error) {
      console.error('Erro ao carregar análise:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium">Analisando dados...</h3>
          <p className="text-sm text-gray-500">
            Nossa IA está processando os dados para gerar insights valiosos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seção de Insights */}
      <Card>
        <CardHeader>
          <CardTitle>{analysis?.insights.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-lg">{analysis?.insights.summary}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Alert>
                <AlertDescription>
                  <h4 className="font-medium mb-2">Oportunidades</h4>
                  <ul className="list-disc pl-4">
                    {analysis?.insights.opportunities.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertDescription>
                  <h4 className="font-medium mb-2">Desafios</h4>
                  <ul className="list-disc pl-4">
                    {analysis?.insights.challenges.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>{analysis?.recommendations.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="immediate">
            <TabsList>
              <TabsTrigger value="immediate">Imediato</TabsTrigger>
              <TabsTrigger value="medium">Médio Prazo</TabsTrigger>
              <TabsTrigger value="long">Longo Prazo</TabsTrigger>
            </TabsList>

            <TabsContent value="immediate">
              <ul className="space-y-2">
                {analysis?.recommendations.immediate.map((item: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center">
                      {index + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </TabsContent>

            {/* Conteúdo similar para outras tabs */}
          </Tabs>
        </CardContent>
      </Card>

      {/* Seção do Plano de Ação */}
      <Card>
        <CardHeader>
          <CardTitle>{analysis?.actionPlan.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Próximos Passos</h4>
              <ul className="space-y-2">
                {analysis?.actionPlan.steps.map((step: any, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mt-1">
                      {index + 1}
                    </span>
                    <div>
                      <h5 className="font-medium">{step.title}</h5>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Resultados Esperados</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc pl-4">
                  {analysis?.actionPlan.expectedResults.map((result: string, index: number) => (
                    <li key={index}>{result}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 