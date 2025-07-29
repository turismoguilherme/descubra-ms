import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Brain,
  Lightbulb,
  Clock,
  BarChart,
  AlertTriangle,
  RefreshCcw,
  Loader2
} from 'lucide-react';

interface AiInsight {
  id: string;
  region: string;
  insight_type: string;
  title: string;
  description: string;
  confidence_score: number;
  recommendations: string;
  status: string;
  created_at: string;
}

const AiPerformanceMonitoring = () => {
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ai_insights')
      .select('id, region, insight_type, title, description, confidence_score, recommendations, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10); // Limita aos 10 insights mais recentes
    
    if (error) {
      console.error('Erro ao buscar insights da IA:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar insights de performance da IA.",
        variant: "destructive",
      });
    } else {
      setInsights(data || []);
    }
    setLoading(false);
  };

  const handleGenerateNewInsights = async () => {
    setIsGenerating(true);
    toast({
      title: "Gerando Novos Insights",
      description: "Solicitando à IA para gerar novos relatórios de otimização...",
      duration: 5000
    });
    try {
      // Chamar a Edge Function ai-optimizer
      const response = await fetch(`${supabase.functions.url}/ai-optimizer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Não precisa de corpo, a função coleta seus próprios dados
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro desconhecido ao gerar insights.');
      }

      const data = await response.json();
      toast({
        title: "Insights Gerados!",
        description: "Novos insights de otimização da IA foram gerados com sucesso.",
        variant: "success",
      });
      console.log('Novos insights gerados:', data.optimization_insights);
      fetchInsights(); // Recarrega a lista para mostrar os novos insights
    } catch (error: any) {
      console.error('Erro ao gerar novos insights da IA:', error);
      toast({
        title: "Erro ao Gerar Insights",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getInsightBadgeVariant = (status: string) => {
    switch (status) {
      case 'action_required': return 'destructive';
      case 'reviewed': return 'default';
      case 'active': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center"><Brain className="w-5 h-5 mr-2" /> Monitoramento de Performance da IA</CardTitle>
          <Button onClick={handleGenerateNewInsights} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4 mr-2" />
            )}
            Gerar Novos Insights
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando insights de performance da IA...</p>
          ) : insights.length === 0 ? (
            <p>Nenhum insight de performance da IA encontrado. Clique em "Gerar Novos Insights" para começar.</p>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <Card key={insight.id} className="shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold flex items-center">
                        <Lightbulb className="w-4 h-4 mr-1 text-yellow-500" /> {insight.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Tipo: {insight.insight_type} | Confiança: {(insight.confidence_score * 100).toFixed(0)}% | Status: 
                        <Badge variant={getInsightBadgeVariant(insight.status)} className="ml-1">{insight.status}</Badge>
                      </p>
                      {insight.recommendations && (
                        <div className="mt-2 p-2 bg-gray-100 rounded-md">
                          <h4 className="font-medium text-gray-700">Recomendações:</h4>
                          <pre className="whitespace-pre-wrap text-xs">{insight.recommendations}</pre>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Criado em: {new Date(insight.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AiPerformanceMonitoring; 