/**
 * Etapa de Resultados do Onboarding
 * Mostra os resultados do diagnóstico e próximos passos
 */

// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb,
  BarChart3,
  Calendar,
  Star,
  ArrowRight,
  Download,
  Share2
} from 'lucide-react';

interface ResultsStepProps {
  data: unknown;
  onNext: (data?: unknown) => void;
  onPrevious: () => void;
}

const ResultsStep: React.FC<ResultsStepProps> = ({ data, onNext }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    // Simular análise com IA
    const analyzeDiagnostic = async () => {
      setIsAnalyzing(true);
      
      // Simular delay da IA
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Gerar resultado baseado nas respostas
      const result = generateAnalysisResult(data);
      setAnalysisResult(result);
      setIsAnalyzing(false);
    };

    analyzeDiagnostic();
  }, [data]);

  const generateAnalysisResult = (data: unknown) => {
    const answers = data.diagnosticAnswers || {};
    
    // Lógica simples de análise baseada nas respostas
    let score = 50; // Score base
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Análise baseada no tipo de negócio
    if (answers.business_type === 'hospedagem') {
      score += 10;
      strengths.push('Foco em hospedagem bem definido');
    }

    // Análise da receita
    if (answers.revenue_monthly === 'acima_100k') {
      score += 15;
      strengths.push('Receita sólida');
    } else if (answers.revenue_monthly === 'ate_5k') {
      score -= 10;
      weaknesses.push('Receita baixa');
    }

    // Análise da ocupação
    if (answers.occupancy_rate === 'acima_90') {
      score += 15;
      strengths.push('Alta taxa de ocupação');
    } else if (answers.occupancy_rate === 'ate_30') {
      score -= 15;
      weaknesses.push('Baixa taxa de ocupação');
    }

    // Análise da presença digital
    const digitalPresence = parseInt(answers.digital_presence) || 3;
    if (digitalPresence >= 4) {
      score += 10;
      strengths.push('Boa presença digital');
    } else if (digitalPresence <= 2) {
      score -= 10;
      weaknesses.push('Presença digital limitada');
    }

    // Análise dos canais de marketing
    const marketingChannels = answers.marketing_channels || [];
    if (marketingChannels.length >= 3) {
      score += 10;
      strengths.push('Diversificação em marketing');
    } else if (marketingChannels.length <= 1) {
      score -= 10;
      weaknesses.push('Canais de marketing limitados');
    }

    // Análise dos desafios
    const challenges = answers.main_challenges || [];
    if (challenges.includes('baixa_ocupacao')) {
      score -= 5;
      recommendations.push('Implementar estratégias de marketing para aumentar ocupação');
    }
    if (challenges.includes('marketing')) {
      score -= 5;
      recommendations.push('Desenvolver plano de marketing digital');
    }
    if (challenges.includes('tecnologia')) {
      score -= 5;
      recommendations.push('Investir em modernização tecnológica');
    }

    // Análise da tecnologia
    const technology = answers.technology_usage || [];
    if (technology.includes('sistema_reservas')) {
      score += 5;
      strengths.push('Sistema de reservas implementado');
    } else {
      score -= 5;
      recommendations.push('Implementar sistema de reservas online');
    }

    // Garantir score entre 0 e 100
    score = Math.max(0, Math.min(100, score));

    // Gerar recomendações baseadas no score
    if (score < 40) {
      recommendations.push('Focar em melhorias básicas de operação');
      recommendations.push('Desenvolver estratégia de marketing');
      recommendations.push('Investir em treinamento da equipe');
    } else if (score < 70) {
      recommendations.push('Otimizar processos existentes');
      recommendations.push('Expandir canais de marketing');
      recommendations.push('Melhorar experiência do cliente');
    } else {
      recommendations.push('Manter excelência operacional');
      recommendations.push('Explorar novas oportunidades de mercado');
      recommendations.push('Considerar expansão do negócio');
    }

    // Adicionar recomendações específicas baseadas no tipo de negócio
    if (answers.business_type === 'hospedagem') {
      recommendations.push('Implementar programa de fidelidade');
      recommendations.push('Otimizar preços baseado na demanda');
    } else if (answers.business_type === 'gastronomia') {
      recommendations.push('Criar menu sazonal');
      recommendations.push('Implementar sistema de delivery');
    }

    return {
      score,
      strengths: strengths.length > 0 ? strengths : ['Potencial de crescimento'],
      weaknesses: weaknesses.length > 0 ? weaknesses : ['Áreas de melhoria identificadas'],
      recommendations: recommendations.slice(0, 6), // Máximo 6 recomendações
      estimatedROI: Math.round(score * 0.4 + 20), // ROI baseado no score
      nextSteps: [
        'Revisar recomendações personalizadas',
        'Implementar melhorias prioritárias',
        'Acompanhar métricas de performance',
        'Refazer diagnóstico em 3 meses'
      ]
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Regular';
    return 'Precisa Melhorar';
  };

  if (isAnalyzing) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
            <Target className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Analisando seu diagnóstico
          </h2>
          <p className="text-gray-600">
            Nossa IA está processando suas respostas para gerar recomendações personalizadas
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span>Processando dados...</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Analisando respostas do questionário</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Aplicando algoritmos de IA</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span className="text-sm text-gray-400">Gerando recomendações personalizadas</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysisResult) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
          <CheckCircle className="h-4 w-4" />
          <span>Diagnóstico Concluído</span>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800">
          Seus resultados personalizados
        </h2>
        <p className="text-gray-600">
          Baseado no seu perfil e respostas, aqui estão suas recomendações
        </p>
      </div>

      {/* Score Principal */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(analysisResult.score)}`}>
                  {analysisResult.score}
                </div>
                <div className="text-xs text-gray-500">pontos</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {getScoreLabel(analysisResult.score)}
              </h3>
              <p className="text-gray-600">
                Score de performance do seu negócio
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>ROI Estimado: +{analysisResult.estimatedROI}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Potencial de Crescimento</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pontos Fortes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Pontos Fortes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysisResult.strengths.map((strength: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{strength}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Áreas de Melhoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <span>Áreas de Melhoria</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysisResult.weaknesses.map((weakness: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{weakness}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            <span>Recomendações Personalizadas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysisResult.recommendations.map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <span className="text-sm text-gray-700">{recommendation}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Próximos Passos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            <span>Próximos Passos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysisResult.nextSteps.map((step: string, index: number) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <span className="text-sm text-gray-700">{step}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="outline" className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Baixar Relatório</span>
        </Button>
        
        <Button variant="outline" className="flex items-center space-x-2">
          <Share2 className="h-4 w-4" />
          <span>Compartilhar</span>
        </Button>
        
        <Button onClick={() => onNext()} className="flex items-center space-x-2">
          <span>Continuar para Dashboard</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ResultsStep;
