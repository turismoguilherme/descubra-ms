import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useMultiTenant, getTenantQuestions } from '@/config/multiTenant';
import { geminiClient } from '@/config/gemini';

interface AdaptiveQuestionsProps {
  onComplete: (answers: QuestionAnswers) => void;
  onBack: () => void;
  initialAnswers?: Partial<QuestionAnswers>;
}

export interface QuestionAnswers {
  // Perguntas universais
  age_range: string;
  gender: string;
  origin_state: string;
  travel_purpose: string;
  
  // Perguntas específicas do estado
  state_specific: Record<string, string | string[]>;
  
  // Informações adicionais
  additional_info: string;
  preferences: string[];
}

interface Question {
  id: string;
  text: string;
  type: 'radio' | 'checkbox' | 'text' | 'textarea';
  options?: string[];
  required: boolean;
  category: 'universal' | 'state_specific';
}

const UNIVERSAL_QUESTIONS: Question[] = [
  {
    id: 'age_range',
    text: 'Qual sua faixa etária?',
    type: 'radio',
    options: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
    required: true,
    category: 'universal'
  },
  {
    id: 'gender',
    text: 'Qual seu gênero?',
    type: 'radio',
    options: ['Feminino', 'Masculino', 'Não-binário', 'Prefiro não informar'],
    required: true,
    category: 'universal'
  },
  {
    id: 'origin_state',
    text: 'De qual estado você vem?',
    type: 'text',
    required: true,
    category: 'universal'
  },
  {
    id: 'travel_purpose',
    text: 'Qual o propósito da viagem?',
    type: 'radio',
    options: ['Lazer', 'Negócios', 'Visita a familiares', 'Estudos', 'Outro'],
    required: true,
    category: 'universal'
  }
];

export const AdaptiveQuestions: React.FC<AdaptiveQuestionsProps> = ({
  onComplete,
  onBack,
  initialAnswers
}) => {
  const { currentTenant } = useMultiTenant();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionAnswers>({
    age_range: '',
    gender: '',
    origin_state: '',
    travel_purpose: '',
    state_specific: {},
    additional_info: '',
    preferences: [],
    ...initialAnswers
  });

  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Gerar perguntas específicas do estado usando IA
  const generateStateSpecificQuestions = async () => {
    try {
      setLoading(true);
      
      const prompt = `
        Gere 5 perguntas específicas para turistas visitando ${currentTenant.fullName}.
        As perguntas devem ser sobre:
        - Experiências anteriores na região
        - Interesses específicos do estado
        - Preferências de atividades
        - Conhecimento sobre atrações locais
        
        Retorne apenas as perguntas, uma por linha, sem numeração.
      `;

      const response = await geminiClient.generateContent(prompt);
      const questions = response.split('\n').filter(q => q.trim()).slice(0, 5);
      
      setAiSuggestions(questions);
    } catch (error) {
      console.error('❌ Erro ao gerar perguntas com IA:', error);
      // Fallback para perguntas padrão
      setAiSuggestions([
        'Você já visitou esta região antes?',
        'Tem interesse em ecoturismo?',
        'Prefere turismo urbano ou rural?',
        'Tem interesse em gastronomia local?',
        'Prefere atividades de aventura ou relaxamento?'
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar perguntas específicas do estado
  useEffect(() => {
    generateStateSpecificQuestions();
  }, [currentTenant.slug]);

  // Combinar perguntas universais e específicas
  const allQuestions = [
    ...UNIVERSAL_QUESTIONS,
    ...aiSuggestions.map((question, index) => ({
      id: `state_question_${index}`,
      text: question,
      type: 'radio' as const,
      options: ['Sim', 'Não', 'Talvez', 'Não sei'],
      required: false,
      category: 'state_specific' as const
    }))
  ];

  const totalSteps = allQuestions.length + 1; // +1 para informações adicionais
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleStateSpecificAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      state_specific: {
        ...prev.state_specific,
        [questionId]: value
      }
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const canProceed = () => {
    const currentQuestion = allQuestions[currentStep];
    if (!currentQuestion) return true; // Última etapa (informações adicionais)
    
    if (currentQuestion.required) {
      const answer = currentQuestion.category === 'universal' 
        ? answers[currentQuestion.id as keyof QuestionAnswers]
        : answers.state_specific[currentQuestion.id];
      
      return answer && (typeof answer === 'string' ? answer.trim() !== '' : answer.length > 0);
    }
    
    return true;
  };

  const renderQuestion = (question: Question) => {
    const currentAnswer = question.category === 'universal' 
      ? answers[question.id as keyof QuestionAnswers]
      : answers.state_specific[question.id];

    switch (question.type) {
      case 'radio':
        return (
          <RadioGroup
            value={currentAnswer as string || ''}
            onValueChange={(value) => 
              question.category === 'universal'
                ? handleAnswerChange(question.id, value)
                : handleStateSpecificAnswer(question.id, value)
            }
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={(currentAnswer as string[] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentArray = (currentAnswer as string[]) || [];
                    const newArray = checked
                      ? [...currentArray, option]
                      : currentArray.filter(item => item !== option);
                    handleAnswerChange(question.id, newArray);
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            value={currentAnswer as string || ''}
            onChange={(e) => 
              question.category === 'universal'
                ? handleAnswerChange(question.id, e.target.value)
                : handleStateSpecificAnswer(question.id, e.target.value)
            }
            placeholder="Digite sua resposta..."
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={currentAnswer as string || ''}
            onChange={(e) => 
              question.category === 'universal'
                ? handleAnswerChange(question.id, e.target.value)
                : handleStateSpecificAnswer(question.id, e.target.value)
            }
            placeholder="Digite sua resposta..."
            rows={4}
          />
        );

      default:
        return null;
    }
  };

  const renderCurrentStep = () => {
    if (currentStep < allQuestions.length) {
      const question = allQuestions[currentStep];
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">{question.text}</h3>
            {question.required && (
              <p className="text-sm text-red-500">* Campo obrigatório</p>
            )}
          </div>
          {renderQuestion(question)}
        </div>
      );
    }

    // Última etapa - informações adicionais
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Informações Adicionais</h3>
          <p className="text-sm text-gray-600">
            Conte-nos mais sobre suas preferências e necessidades especiais
          </p>
        </div>
        <Textarea
          value={answers.additional_info}
          onChange={(e) => handleAnswerChange('additional_info', e.target.value)}
          placeholder="Ex: Preferências alimentares, necessidades de acessibilidade, interesses específicos..."
          rows={4}
        />
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Perguntas Personalizadas</span>
          {loading && <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>}
        </CardTitle>
        <CardDescription>
          Ajude-nos a personalizar sua experiência em {currentTenant.fullName}
        </CardDescription>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-gray-500">
          Etapa {currentStep + 1} de {totalSteps}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderCurrentStep()}
        
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Voltar
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentStep === totalSteps - 1 ? 'Finalizar' : 'Próximo'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 