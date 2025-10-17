/**
 * AI Recommendation Engine Component
 * Motor de recomendações baseado em IA para análise de negócios
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Star,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Users,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuestionnaireAnswers } from './DiagnosticQuestionnaire';
import { AnalysisResult, Recommendation, BusinessProfile } from '@/services/diagnostic/analysisService';
import { analyzeBusinessProfile } from '@/services/diagnostic/analysisService';

interface AIRecommendationEngineProps {
  answers: QuestionnaireAnswers;
  onRecommendations: (result: AnalysisResult) => void;
  onAnalysis?: (isAnalyzing: boolean) => void;
  className?: string;
}

const AIRecommendationEngine: React.FC<AIRecommendationEngineProps> = ({
  answers,
  onRecommendations,
  onAnalysis,
  className
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const analysisSteps = [
    { id: 'profile', name: 'Análise do Perfil', icon: Users, description: 'Identificando características do negócio' },
    { id: 'challenges', name: 'Análise de Desafios', icon: Target, description: 'Mapeando desafios e oportunidades' },
    { id: 'recommendations', name: 'Geração de Recomendações', icon: Brain, description: 'Criando soluções personalizadas' },
    { id: 'optimization', name: 'Otimização', icon: TrendingUp, description: 'Refinando recomendações' }
  ];

  useEffect(() => {
    performAnalysis();
  }, [answers]);

  const performAnalysis = async () => {
    setIsAnalyzing(true);
    onAnalysis?.(true);

    try {
      // Simular análise passo a passo
      for (let i = 0; i < analysisSteps.length; i++) {
        setCurrentStep(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Realizar análise real
      const result = await analyzeBusinessProfile(answers);
      setAnalysisResult(result);
      onRecommendations(result);
    } catch (error) {
      console.error('Erro na análise:', error);
    } finally {
      setIsAnalyzing(false);
      onAnalysis?.(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800 border-red-200';
      case 2: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 4: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 5: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue': return <TrendingUp className="w-4 h-4" />;
      case 'marketing': return <Target className="w-4 h-4" />;
      case 'operations': return <Settings className="w-4 h-4" />;
      case 'technology': return <Zap className="w-4 h-4" />;
      case 'analytics': return <BarChart3 className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'revenue': return 'text-green-600';
      case 'marketing': return 'text-blue-600';
      case 'operations': return 'text-purple-600';
      case 'technology': return 'text-orange-600';
      case 'analytics': return 'text-indigo-600';
      default: return 'text-gray-600';
    }
  };

  if (isAnalyzing) {
    return (
      <Card className={cn("w-full max-w-4xl mx-auto", className)}>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-primary animate-pulse" />
            <CardTitle className="text-2xl">Análise Inteligente em Andamento</CardTitle>
          </div>
          <p className="text-muted-foreground">
            Nossa IA está processando suas respostas para gerar recomendações personalizadas
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {analysisSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                    isCompleted ? "bg-green-100 border-green-500 text-green-600" :
                    isActive ? "bg-primary/10 border-primary text-primary animate-pulse" :
                    "bg-muted border-muted-foreground/20 text-muted-foreground"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={cn(
                      "font-medium transition-colors",
                      isCompleted ? "text-green-700" :
                      isActive ? "text-primary" :
                      "text-muted-foreground"
                    )}>
                      {step.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  
                  {isActive && (
                    <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Analisando dados do mercado e tendências do setor turístico...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysisResult) {
    return (
      <Card className={cn("w-full max-w-4xl mx-auto", className)}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Preparando análise...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
      {/* Resumo da Análise */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              <CardTitle>Análise Completa</CardTitle>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {analysisResult.overallScore}/100
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{analysisResult.overallScore}</div>
              <div className="text-sm text-muted-foreground">Score Geral</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analysisResult.growthPotential}%</div>
              <div className="text-sm text-muted-foreground">Potencial de Crescimento</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{Math.round(analysisResult.estimatedROI)}%</div>
              <div className="text-sm text-muted-foreground">ROI Estimado</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Perfil do Negócio</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-green-600 mb-1">Forças</div>
                  <ul className="space-y-1">
                    {analysisResult.businessProfile.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-orange-600 mb-1">Oportunidades</div>
                  <ul className="space-y-1">
                    {analysisResult.businessProfile.opportunities.map((opportunity, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Target className="w-3 h-3 text-orange-600" />
                        {opportunity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Recomendações Personalizadas
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {analysisResult.recommendations.map((recommendation, index) => (
            <div key={recommendation.id} className="border rounded-lg p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{recommendation.name}</h3>
                    <Badge className={getPriorityColor(recommendation.priority)}>
                      Prioridade {recommendation.priority}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{recommendation.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(recommendation.category)}
                      <span className={getCategoryColor(recommendation.category)}>
                        {recommendation.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>ROI: {recommendation.estimatedROI}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{recommendation.implementationTime}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(recommendation.confidence * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Confiança</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Funcionalidades</h4>
                  <ul className="space-y-1">
                    {recommendation.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Benefícios</h4>
                  <ul className="space-y-1">
                    {recommendation.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-3 h-3 text-blue-600" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="flex items-center gap-2">
                  Ver Detalhes
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIRecommendationEngine;
