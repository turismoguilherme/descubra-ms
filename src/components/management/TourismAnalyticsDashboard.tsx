import React, { useEffect, useState } from 'react';
import { TourismAnalysisService } from '@/services/ai/tourismAnalysisService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  LineChart,
  PieChart 
} from '@/components/charts';

export function TourismAnalyticsDashboard() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const analysisService = new TourismAnalysisService();

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const data = await analysisService.analyzeRegion();
      setAnalysis(data);
    } catch (error) {
      console.error('Erro ao carregar análise:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Progress value={30} className="w-[60%]" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          Não foi possível carregar os dados da análise.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard de Análise Turística</h1>
        <Button onClick={loadAnalysis}>Atualizar Dados</Button>
      </div>

      <Tabs defaultValue="visitors">
        <TabsList>
          <TabsTrigger value="visitors">Visitantes</TabsTrigger>
          <TabsTrigger value="economic">Impacto Econômico</TabsTrigger>
          <TabsTrigger value="infrastructure">Infraestrutura</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfação</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="visitors">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Perfil Demográfico</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart 
                  data={analysis.visitorProfile.demographics.ageGroups}
                  title="Distribuição por Idade"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Origem dos Visitantes</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart 
                  data={analysis.visitorProfile.demographics.origins}
                  title="Principais Origens"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comportamento</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart 
                  data={analysis.visitorProfile.behavior}
                  title="Padrões de Comportamento"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="economic">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gastos Turísticos</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart 
                  data={analysis.economicImpact.spending}
                  title="Evolução dos Gastos"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geração de Empregos</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart 
                  data={analysis.economicImpact.jobs}
                  title="Empregos por Setor"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="infrastructure">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Transportes</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart 
                  data={analysis.infrastructure.transportation}
                  title="Infraestrutura de Transportes"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hospedagem</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart 
                  data={analysis.infrastructure.accommodation}
                  title="Capacidade Hoteleira"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atrativos</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart 
                  data={analysis.infrastructure.attractions}
                  title="Distribuição de Atrativos"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="satisfaction">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Satisfação Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <span className="text-6xl font-bold">
                    {analysis.satisfaction.overall}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart 
                  data={analysis.satisfaction.byCategory}
                  title="Satisfação por Categoria"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendências de Curto Prazo</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart 
                  data={analysis.trends.shortTerm}
                  title="Próximos 12 Meses"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendências de Longo Prazo</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart 
                  data={analysis.trends.longTerm}
                  title="Próximos 5 Anos"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recomendações</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Infraestrutura</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4">
                {analysis.recommendations.infrastructure.map((rec: string, i: number) => (
                  <li key={i} className="mb-2">{rec}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Marketing</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4">
                {analysis.recommendations.marketing.map((rec: string, i: number) => (
                  <li key={i} className="mb-2">{rec}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4">
                {analysis.recommendations.products.map((rec: string, i: number) => (
                  <li key={i} className="mb-2">{rec}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 