import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Award, Target } from 'lucide-react';

interface QuizResultProps {
  result: {
    score: number;
    totalQuestions: number;
    percentage: number;
    level: string;
    badge: string;
    recommendations: string[];
    results: unknown[];
  };
  onContinue: () => void;
  onRetake: () => void;
}

const QuizResult = ({ result, onContinue, onRetake }: QuizResultProps) => {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return 'Excelente! Você é um verdadeiro especialista!';
    if (percentage >= 70) return 'Muito bom! Você conhece bem o MS!';
    if (percentage >= 50) return 'Bom conhecimento! Continue aprendendo!';
    return 'Continue estudando! Você pode melhorar!';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-2 border-ms-primary-blue">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-ms-primary-blue to-ms-secondary-teal rounded-full flex items-center justify-center text-white text-3xl">
              {result.badge}
            </div>
          </div>
          <CardTitle className="text-2xl text-ms-primary-blue">
            Quiz Concluído!
          </CardTitle>
          <p className="text-gray-600">
            {getScoreMessage(result.percentage)}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Pontuação */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(result.percentage)} mb-2`}>
              {result.score}/{result.totalQuestions}
            </div>
            <div className="text-lg text-gray-600 mb-4">
              {result.percentage}% de acerto
            </div>
            <Progress value={result.percentage} className="h-3 mb-4" />
          </div>

          {/* Nível e Badge */}
          <div className="text-center">
            <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-ms-primary-blue to-ms-secondary-teal text-white">
              {result.badge} {result.level}
            </Badge>
          </div>

          {/* Recomendações */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <Target className="w-5 h-5 mr-2 text-ms-primary-blue" />
              Recomendações para você:
            </h3>
            <div className="space-y-2">
              {result.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Star className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo das Respostas */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <Award className="w-5 h-5 mr-2 text-ms-primary-blue" />
              Resumo das Respostas:
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>Corretas:</span>
                <span className="font-semibold text-green-600">{result.score}</span>
              </div>
              <div className="flex justify-between">
                <span>Incorretas:</span>
                <span className="font-semibold text-red-600">{result.totalQuestions - result.score}</span>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex space-x-3">
            <Button 
              onClick={onRetake}
              variant="outline"
              className="flex-1"
            >
              Refazer Quiz
            </Button>
            <Button 
              onClick={onContinue}
              className="flex-1 bg-ms-primary-blue hover:bg-ms-primary-blue/90"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResult;
