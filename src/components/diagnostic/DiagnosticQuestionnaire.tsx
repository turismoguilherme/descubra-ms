/**
 * Diagnostic Questionnaire Component
 * Questionário inteligente e adaptativo para análise de negócios turísticos
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Check, Brain, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuestionnaireAnswers {
  businessType: 'hotel' | 'agency' | 'restaurant' | 'attraction' | 'other';
  businessSize: 'small' | 'medium' | 'large';
  currentChallenges: string[];
  goals: string[];
  budget: 'low' | 'medium' | 'high';
  timeline: 'immediate' | '3months' | '6months' | '1year';
  technicalLevel: 'beginner' | 'intermediate' | 'advanced';
  location: string;
  experience: number;
  teamSize: number;
}

interface DiagnosticQuestionnaireProps {
  onComplete: (answers: QuestionnaireAnswers) => void;
  onProgress?: (progress: number) => void;
  businessType?: string;
  className?: string;
}

const DiagnosticQuestionnaire: React.FC<DiagnosticQuestionnaireProps> = ({
  onComplete,
  onProgress,
  businessType,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Configuração das perguntas baseada no tipo de negócio
  const getQuestions = (type?: string) => {
    const baseQuestions = [
      {
        id: 'businessType',
        title: 'Qual é o tipo do seu negócio?',
        type: 'radio',
        options: [
          { value: 'hotel', label: 'Hotel/Pousada', icon: '🏨', description: 'Hospedagem' },
          { value: 'agency', label: 'Agência de Viagem', icon: '🚌', description: 'Pacotes e roteiros' },
          { value: 'restaurant', label: 'Restaurante', icon: '🍽️', description: 'Gastronomia' },
          { value: 'attraction', label: 'Atração Turística', icon: '🎯', description: 'Pontos turísticos' },
          { value: 'other', label: 'Outro', icon: '🏢', description: 'Outros serviços' }
        ]
      },
      {
        id: 'businessSize',
        title: 'Qual o tamanho do seu negócio?',
        type: 'radio',
        options: [
          { value: 'small', label: 'Pequeno', description: '1-10 funcionários' },
          { value: 'medium', label: 'Médio', description: '11-50 funcionários' },
          { value: 'large', label: 'Grande', description: '50+ funcionários' }
        ]
      },
      {
        id: 'currentChallenges',
        title: 'Quais são seus principais desafios?',
        type: 'checkbox',
        options: [
          { value: 'ocupacao', label: 'Baixa ocupação', description: 'Quartos/mesas vazias' },
          { value: 'precos', label: 'Precificação', description: 'Como definir preços' },
          { value: 'marketing', label: 'Marketing', description: 'Divulgação e vendas' },
          { value: 'concorrencia', label: 'Concorrência', description: 'Diferenciação' },
          { value: 'tecnologia', label: 'Tecnologia', description: 'Digitalização' },
          { value: 'gestao', label: 'Gestão', description: 'Processos internos' },
          { value: 'clientes', label: 'Fidelização', description: 'Retenção de clientes' }
        ]
      },
      {
        id: 'goals',
        title: 'Quais são seus objetivos principais?',
        type: 'checkbox',
        options: [
          { value: 'aumentar_receita', label: 'Aumentar receita', description: 'Crescimento financeiro' },
          { value: 'melhorar_analytics', label: 'Melhorar analytics', description: 'Dados e insights' },
          { value: 'automatizar', label: 'Automatizar processos', description: 'Eficiência operacional' },
          { value: 'expandir', label: 'Expandir negócio', description: 'Crescimento geográfico' },
          { value: 'digitalizar', label: 'Digitalizar', description: 'Transformação digital' },
          { value: 'sustentabilidade', label: 'Sustentabilidade', description: 'Práticas sustentáveis' }
        ]
      },
      {
        id: 'budget',
        title: 'Qual seu orçamento mensal para tecnologia?',
        type: 'radio',
        options: [
          { value: 'low', label: 'Até R$ 500', description: 'Soluções básicas' },
          { value: 'medium', label: 'R$ 500 - R$ 2.000', description: 'Soluções intermediárias' },
          { value: 'high', label: 'R$ 2.000+', description: 'Soluções avançadas' }
        ]
      },
      {
        id: 'timeline',
        title: 'Quando você gostaria de ver resultados?',
        type: 'radio',
        options: [
          { value: 'immediate', label: 'Imediatamente', description: '0-30 dias' },
          { value: '3months', label: '3 meses', description: 'Curto prazo' },
          { value: '6months', label: '6 meses', description: 'Médio prazo' },
          { value: '1year', label: '1 ano', description: 'Longo prazo' }
        ]
      },
      {
        id: 'technicalLevel',
        title: 'Qual seu nível técnico?',
        type: 'radio',
        options: [
          { value: 'beginner', label: 'Iniciante', description: 'Preciso de ajuda' },
          { value: 'intermediate', label: 'Intermediário', description: 'Alguma experiência' },
          { value: 'advanced', label: 'Avançado', description: 'Experiência sólida' }
        ]
      },
      {
        id: 'location',
        title: 'Em qual cidade/região você está?',
        type: 'text',
        placeholder: 'Ex: Campo Grande, MS'
      },
      {
        id: 'experience',
        title: 'Há quantos anos você trabalha no turismo?',
        type: 'number',
        min: 0,
        max: 50
      },
      {
        id: 'teamSize',
        title: 'Quantas pessoas trabalham no seu negócio?',
        type: 'number',
        min: 1,
        max: 1000
      }
    ];

    // Filtrar perguntas baseado no tipo de negócio
    if (type === 'hotel') {
      return baseQuestions.filter(q => 
        !['businessType'].includes(q.id)
      );
    }

    return baseQuestions;
  };

  const questions = getQuestions(businessType);
  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
      onProgress?.(progress);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsAnalyzing(true);
    
    // Simular análise (será substituído pela IA real)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onComplete(answers as QuestionnaireAnswers);
    setIsAnalyzing(false);
  };

  const canProceed = () => {
    if (!currentQuestion) return false;
    
    const currentAnswer = answers[currentQuestion.id as keyof QuestionnaireAnswers];
    
    if (currentQuestion.type === 'checkbox') {
      return Array.isArray(currentAnswer) && currentAnswer.length > 0;
    }
    
    return currentAnswer !== undefined && currentAnswer !== '';
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const currentAnswer = answers[currentQuestion.id as keyof QuestionnaireAnswers];

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">{currentQuestion.title}</h2>
          {currentQuestion.description && (
            <p className="text-muted-foreground">{currentQuestion.description}</p>
          )}
        </div>

        {currentQuestion.type === 'radio' && (
          <RadioGroup
            value={currentAnswer as string}
            onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
            className="space-y-3"
          >
            {currentQuestion.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    {option.icon && <span className="text-2xl">{option.icon}</span>}
                    <div>
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      )}
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {currentQuestion.type === 'checkbox' && (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={option.value}
                  checked={(currentAnswer as string[])?.includes(option.value) || false}
                  onCheckedChange={(checked) => {
                    const current = (currentAnswer as string[]) || [];
                    if (checked) {
                      handleAnswer(currentQuestion.id, [...current, option.value]);
                    } else {
                      handleAnswer(currentQuestion.id, current.filter(v => v !== option.value));
                    }
                  }}
                />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    {option.icon && <span className="text-2xl">{option.icon}</span>}
                    <div>
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      )}
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        )}

        {currentQuestion.type === 'text' && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder={currentQuestion.placeholder}
              value={currentAnswer as string || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        )}

        {currentQuestion.type === 'number' && (
          <div className="space-y-2">
            <input
              type="number"
              min={currentQuestion.min}
              max={currentQuestion.max}
              value={currentAnswer as number || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, parseInt(e.target.value) || 0)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        )}
      </div>
    );
  };

  if (isAnalyzing) {
    return (
      <Card className={cn("w-full max-w-2xl mx-auto", className)}>
        <CardContent className="p-8 text-center space-y-6">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
              <Brain className="w-5 h-5" />
              Analisando seu perfil...
            </h3>
            <p className="text-muted-foreground">
              Nossa IA está processando suas respostas para gerar recomendações personalizadas
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Target className="w-4 h-4" />
            <span>Identificando oportunidades de crescimento</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-6 h-6 text-primary" />
          <CardTitle className="text-2xl">Diagnóstico Inteligente</CardTitle>
        </div>
        <p className="text-muted-foreground">
          Vamos personalizar sua experiência na ViaJAR com base no seu negócio
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {Math.round(progress)}% completo
          </Badge>
          <Badge variant="outline">
            {currentStep + 1} de {questions.length}
          </Badge>
        </div>
        <Progress value={progress} className="mt-4" />
      </CardHeader>
      
      <CardContent className="p-6">
        {renderQuestion()}
        
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            {currentStep === questions.length - 1 ? (
              <>
                <Check className="w-4 h-4" />
                Analisar
              </>
            ) : (
              <>
                Próxima
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosticQuestionnaire;
