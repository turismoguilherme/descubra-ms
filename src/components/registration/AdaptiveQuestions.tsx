import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useMultiTenant } from '@/config/multiTenant';

interface AdaptiveQuestionsProps {
  onComplete: (answers: QuestionAnswers) => void;
  onBack: () => void;
  initialAnswers?: Partial<QuestionAnswers>;
}

export interface QuestionAnswers {
  // Tipo de usuário
  user_type: string; // 'morador' ou 'turista'
  
  // Perguntas universais
  age_range: string;
  gender: string;
  origin_state: string;
  travel_purpose: string;
  
  // CEP (apenas para moradores)
  zip_code?: string;
  
  // Informações adicionais
  additional_info: string;
  preferences: string[];
}

interface Question {
  id: string;
  text: string;
  type: 'radio' | 'text' | 'textarea';
  options?: string[];
  required: boolean;
  category: 'universal';
}

const UNIVERSAL_QUESTIONS: Question[] = [
  {
    id: 'user_type',
    text: 'Você é morador ou turista?',
    type: 'radio',
    options: ['Morador', 'Turista'],
    required: true,
    category: 'universal'
  },
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
    user_type: '',
    age_range: '',
    gender: '',
    origin_state: '',
    travel_purpose: '',
    additional_info: '',
    preferences: [],
    ...initialAnswers
  });

  // Determinar se é morador para mostrar pergunta de CEP
  const isResident = answers.user_type === 'Morador';

  // Pergunta de CEP (apenas para moradores)
  const cepQuestion: Question = {
    id: 'zip_code',
    text: 'Qual seu CEP?',
    type: 'text',
    required: true,
    category: 'universal'
  };

  // Combinar perguntas universais com CEP (se aplicável)
  // Usar useMemo para recalcular quando user_type mudar
  const allQuestions = useMemo(() => {
    const baseQuestions = [...UNIVERSAL_QUESTIONS];
    
    // Se for morador, adicionar pergunta de CEP após as perguntas universais
    if (isResident) {
      baseQuestions.push(cepQuestion);
    }
    
    return baseQuestions;
  }, [isResident]);

  const totalSteps = allQuestions.length + 1; // +1 para informações adicionais
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => {
      const newAnswers = {
      ...prev,
        [questionId]: value
      };
      
      // Se mudou o tipo de usuário
      if (questionId === 'user_type') {
        if (value !== 'Morador') {
          // Se mudou para turista, remover CEP
          delete newAnswers.zip_code;
        }
        // Se mudou para morador e já passou da pergunta de propósito, 
        // a pergunta de CEP será adicionada automaticamente pelo useMemo
      }
      
      return newAnswers;
    });
  };

  const handleNext = () => {
    // Se mudou para morador e ainda não passou pela pergunta de CEP, ajustar o step
    if (currentStep < allQuestions.length - 1) {
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
      const answer = answers[currentQuestion.id as keyof QuestionAnswers];
      return answer && (typeof answer === 'string' ? answer.trim() !== '' : Array.isArray(answer) ? answer.length > 0 : true);
    }
    
    return true;
  };

  const renderQuestion = (question: Question) => {
    const currentAnswer = answers[question.id as keyof QuestionAnswers];

    switch (question.type) {
      case 'radio':
        return (
          <RadioGroup
            value={currentAnswer as string || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'text':
        return (
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            value={currentAnswer as string || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.id === 'zip_code' ? '00000-000' : 'Digite sua resposta...'}
            maxLength={question.id === 'zip_code' ? 9 : undefined}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={currentAnswer as string || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Digite sua resposta..."
            rows={4}
          />
        );

      default:
        return null;
    }
  };

  const renderCurrentStep = () => {
    // Garantir que o step atual está dentro do range válido
    const validStep = Math.min(currentStep, allQuestions.length - 1);
    const question = allQuestions[validStep];
    
    if (question) {
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
        <CardTitle>
          Perguntas Personalizadas
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