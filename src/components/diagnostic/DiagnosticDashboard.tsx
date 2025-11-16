/**
 * Diagnostic Dashboard Component
 * Dashboard de resultados do diagnóstico com gamificação
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Star, 
  Trophy, 
  Award,
  CheckCircle,
  ArrowRight,
  Clock,
  Download,
  Share2,
  Calendar,
  Users,
  BarChart3,
  Zap,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuestionnaireAnswers } from '@/types/diagnostic';
import { AnalysisResult, Recommendation, BusinessProfile } from '@/services/diagnostic/analysisService';

interface DiagnosticDashboardProps {
  answers: QuestionnaireAnswers;
  analysisResult: AnalysisResult;
  onImplement: (recommendation: Recommendation) => void;
  onExport?: () => void;
  onShare?: () => void;
  className?: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  requirements: {
    score?: number;
    category?: string;
    businessType?: string;
  };
}

const DiagnosticDashboard: React.FC<DiagnosticDashboardProps> = ({
  answers,
  analysisResult,
  onImplement,
  onExport,
  onShare,
  className
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);

  // Sistema de badges baseado no perfil
  const availableBadges: Badge[] = [
    {
      id: 'hotel-expert',
      name: 'Hotel Expert',
      description: 'Perfil completo de hotel',
      icon: '🏨',
      earned: answers.businessType === 'hotel' && analysisResult.overallScore >= 80,
      requirements: { businessType: 'hotel', score: 80 }
    },
    {
      id: 'agency-master',
      name: 'Agência Master',
      description: 'Agência experiente',
      icon: '🚌',
      earned: answers.businessType === 'agency' && analysisResult.overallScore >= 85,
      requirements: { businessType: 'agency', score: 85 }
    },
    {
      id: 'gastronomy-star',
      name: 'Gastronomia Star',
      description: 'Restaurante destacado',
      icon: '🍽️',
      earned: answers.businessType === 'restaurant' && analysisResult.overallScore >= 75,
      requirements: { businessType: 'restaurant', score: 75 }
    },
    {
      id: 'data-lover',
      name: 'Data Lover',
      description: 'Empresa analítica',
      icon: '📊',
      earned: answers.goals.includes('melhorar_analytics') && analysisResult.overallScore >= 70,
      requirements: { category: 'analytics', score: 70 }
    },
    {
      id: 'growth-champion',
      name: 'Growth Champion',
      description: 'Alto potencial de crescimento',
      icon: '🚀',
      earned: analysisResult.growthPotential >= 80,
      requirements: { score: 80 }
    },
    {
      id: 'roi-master',
      name: 'ROI Master',
      description: 'Excelente retorno sobre investimento',
      icon: '💰',
      earned: analysisResult.estimatedROI >= 300,
      requirements: { score: 300 }
    }
  ];

  useEffect(() => {
    const earned = availableBadges.filter(badge => badge.earned);
    setEarnedBadges(earned);
  }, [analysisResult]);

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-blue-500';
      case 5: return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue': return <TrendingUp className="w-4 h-4" />;
      case 'marketing': return <Target className="w-4 h-4" />;
      case 'operations': return <Users className="w-4 h-4" />;
      case 'technology': return <Zap className="w-4 h-4" />;
      case 'analytics': return <BarChart3 className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'revenue': return 'text-green-600 bg-green-100';
      case 'marketing': return 'text-blue-600 bg-blue-100';
      case 'operations': return 'text-purple-600 bg-purple-100';
      case 'technology': return 'text-orange-600 bg-orange-100';
      case 'analytics': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto space-y-6", className)}>
      {/* Header com Score e Badges */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                Resultado do Diagnóstico
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Análise personalizada para {answers.businessType === 'hotel' ? 'hotel' : 
                 answers.businessType === 'agency' ? 'agência' :
                 answers.businessType === 'restaurant' ? 'restaurante' : 'negócio'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Score Geral */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-3xl font-bold text-primary">{analysisResult.overallScore}</div>
              <div className="text-sm text-muted-foreground">Score Geral</div>
              <Progress value={analysisResult.overallScore} className="mt-2" />
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{analysisResult.growthPotential}%</div>
              <div className="text-sm text-muted-foreground">Potencial de Crescimento</div>
              <Progress value={analysisResult.growthPotential} className="mt-2" />
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{Math.round(analysisResult.estimatedROI)}%</div>
              <div className="text-sm text-muted-foreground">ROI Estimado</div>
              <Progress value={Math.min(analysisResult.estimatedROI / 5, 100)} className="mt-2" />
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{earnedBadges.length}</div>
              <div className="text-sm text-muted-foreground">Badges Conquistados</div>
              <div className="flex justify-center gap-1 mt-2">
                {earnedBadges.slice(0, 3).map((badge, index) => (
                  <span key={index} className="text-lg">{badge.icon}</span>
                ))}
                {earnedBadges.length > 3 && (
                  <span className="text-sm text-muted-foreground">+{earnedBadges.length - 3}</span>
                )}
              </div>
            </div>
          </div>

          {/* Badges Conquistados */}
          {earnedBadges.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Badges Conquistados
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {earnedBadges.map((badge) => (
                  <div key={badge.id} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <div className="font-medium text-yellow-800">{badge.name}</div>
                      <div className="text-sm text-yellow-600">{badge.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs de Conteúdo */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="implementation">Implementação</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Perfil do Negócio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Perfil do Negócio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-600 mb-2">Forças</h4>
                  <ul className="space-y-1">
                    {analysisResult.businessProfile.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-orange-600 mb-2">Oportunidades</h4>
                  <ul className="space-y-1">
                    {analysisResult.businessProfile.opportunities.map((opportunity, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Target className="w-3 h-3 text-orange-600" />
                        {opportunity}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Métricas de Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Métricas de Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Nível de Risco</span>
                    <Badge variant={analysisResult.businessProfile.riskLevel === 'low' ? 'default' : 
                                 analysisResult.businessProfile.riskLevel === 'medium' ? 'secondary' : 'destructive'}>
                      {analysisResult.businessProfile.riskLevel === 'low' ? 'Baixo' :
                       analysisResult.businessProfile.riskLevel === 'medium' ? 'Médio' : 'Alto'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Posição no Mercado</span>
                    <Badge variant="outline">
                      {analysisResult.businessProfile.marketPosition === 'leader' ? 'Líder' :
                       analysisResult.businessProfile.marketPosition === 'challenger' ? 'Desafiante' :
                       analysisResult.businessProfile.marketPosition === 'follower' ? 'Seguidor' : 'Nicho'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Receita Estimada</span>
                    <span className="font-medium">
                      R$ {analysisResult.businessProfile.estimatedRevenue.toLocaleString()}/mês
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recomendações */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="space-y-4">
            {analysisResult.recommendations.map((recommendation, index) => (
              <Card key={recommendation.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{recommendation.name}</h3>
                        <Badge className={getPriorityColor(recommendation.priority)}>
                          Prioridade {recommendation.priority}
                        </Badge>
                        <Badge className={getCategoryColor(recommendation.category)}>
                          {getCategoryIcon(recommendation.category)}
                          {recommendation.category}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{recommendation.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(recommendation.confidence * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Confiança</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold text-green-600">
                        {recommendation.estimatedROI}%
                      </div>
                      <div className="text-sm text-muted-foreground">ROI Estimado</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold text-blue-600">
                        {recommendation.implementationTime}
                      </div>
                      <div className="text-sm text-muted-foreground">Tempo de Implementação</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold text-purple-600">
                        {recommendation.features.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Funcionalidades</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={() => onImplement(recommendation)} className="flex items-center gap-2">
                      Implementar
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Implementação */}
        <TabsContent value="implementation" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fase 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Fase 1 (Imediata)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysisResult.implementationPlan.phase1.map((rec, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{rec.name}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Fase 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Fase 2 (3-6 meses)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysisResult.implementationPlan.phase2.map((rec, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">{rec.name}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Fase 3 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Fase 3 (6-12 meses)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysisResult.implementationPlan.phase3.map((rec, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                    <Star className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">{rec.name}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Insights da IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Oportunidade Principal</h4>
                  <p className="text-sm text-blue-700">
                    Seu negócio tem potencial para crescer {analysisResult.growthPotential}% 
                    com as recomendações sugeridas.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">ROI Esperado</h4>
                  <p className="text-sm text-green-700">
                    Investimento em tecnologia pode gerar retorno de {Math.round(analysisResult.estimatedROI)}% 
                    em 6 meses.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DiagnosticDashboard;
