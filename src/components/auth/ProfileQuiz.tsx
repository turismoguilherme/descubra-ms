import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, CheckCircle, Award, Star } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: 'pantanal' | 'turismo' | 'cultura' | 'natureza';
}

interface ProfileQuizProps {
  onQuizComplete: (result: any) => void;
  onSkip: () => void;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: '1',
    question: 'Qual é a maior planície alagável do mundo?',
    options: [
      'Pantanal',
      'Amazônia',
      'Cerrado',
      'Caatinga'
    ],
    correctAnswer: 0,
    explanation: 'O Pantanal é a maior planície alagável do mundo, cobrindo cerca de 150.000 km².',
    category: 'pantanal'
  },
  {
    id: '2',
    question: 'Qual cidade de MS é conhecida como "Capital do Ecoturismo"?',
    options: [
      'Campo Grande',
      'Bonito',
      'Corumbá',
      'Dourados'
    ],
    correctAnswer: 1,
    explanation: 'Bonito é mundialmente conhecida por suas águas cristalinas e ecoturismo.',
    category: 'turismo'
  },
  {
    id: '3',
    question: 'Qual é o animal símbolo do Pantanal?',
    options: [
      'Onça-pintada',
      'Tuiuiú',
      'Capivara',
      'Arara-azul'
    ],
    correctAnswer: 1,
    explanation: 'O Tuiuiú é considerado a ave símbolo do Pantanal, majestosa e imponente.',
    category: 'pantanal'
  },
  {
    id: '4',
    question: 'Qual é a principal atividade econômica do Pantanal?',
    options: [
      'Agricultura',
      'Pecuária',
      'Mineracao',
      'Industria'
    ],
    correctAnswer: 1,
    explanation: 'A pecuária é a principal atividade econômica do Pantanal há séculos.',
    category: 'cultura'
  },
  {
    id: '5',
    question: 'Qual é o período de cheia no Pantanal?',
    options: [
      'Janeiro a Março',
      'Abril a Junho',
      'Julho a Setembro',
      'Outubro a Dezembro'
    ],
    correctAnswer: 0,
    explanation: 'O período de cheia no Pantanal ocorre de janeiro a março, quando as águas sobem.',
    category: 'natureza'
  },
  {
    id: '6',
    question: 'Qual é a capital de Mato Grosso do Sul?',
    options: [
      'Bonito',
      'Campo Grande',
      'Corumbá',
      'Dourados'
    ],
    correctAnswer: 1,
    explanation: 'Campo Grande é a capital do estado de Mato Grosso do Sul.',
    category: 'cultura'
  },
  {
    id: '7',
    question: 'Qual é a principal ameaça ao Pantanal?',
    options: [
      'Desmatamento',
      'Poluição',
      'Mudanças climáticas',
      'Todas as anteriores'
    ],
    correctAnswer: 3,
    explanation: 'O Pantanal enfrenta múltiplas ameaças: desmatamento, poluição e mudanças climáticas.',
    category: 'natureza'
  },
  {
    id: '8',
    question: 'Qual é o melhor período para visitar o Pantanal?',
    options: [
      'Dezembro a Março',
      'Abril a Setembro',
      'Outubro a Novembro',
      'Qualquer época'
    ],
    correctAnswer: 1,
    explanation: 'Abril a setembro é o período de seca, ideal para observação de animais.',
    category: 'turismo'
  }
];

const ProfileQuiz = ({ onQuizComplete, onSkip }: ProfileQuizProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      toast({
        title: "Atenção",
        description: "Por favor, selecione uma resposta antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz completo
      handleQuizComplete(newAnswers);
    }
  };

  const handleQuizComplete = async (finalAnswers: number[]) => {
    setSaving(true);

    let correctAnswers = 0;
    const results = [];

    for (let i = 0; i < QUIZ_QUESTIONS.length; i++) {
      const isCorrect = finalAnswers[i] === QUIZ_QUESTIONS[i].correctAnswer;
      if (isCorrect) correctAnswers++;
      
      results.push({
        question: QUIZ_QUESTIONS[i].question,
        userAnswer: finalAnswers[i],
        correctAnswer: QUIZ_QUESTIONS[i].correctAnswer,
        isCorrect,
        explanation: QUIZ_QUESTIONS[i].explanation
      });
    }

    const percentage = Math.round((correctAnswers / QUIZ_QUESTIONS.length) * 100);
    
    let level = 'Explorador Iniciante';
    let badge = '🌱';
    let recommendations = [];

    if (percentage >= 90) {
      level = 'Especialista do Pantanal';
      badge = '🏆';
      recommendations = [
        'Você é um verdadeiro especialista!',
        'Considere se tornar um guia turístico',
        'Compartilhe seu conhecimento com outros'
      ];
    } else if (percentage >= 70) {
      level = 'Conhecedor do MS';
      badge = '🎓';
      recommendations = [
        'Excelente conhecimento sobre MS!',
        'Continue explorando o estado',
        'Visite mais destinos turísticos'
      ];
    } else if (percentage >= 50) {
      level = 'Visitante Interessado';
      badge = '🗺️';
      recommendations = [
        'Bom conhecimento básico!',
        'Leia mais sobre o Pantanal',
        'Planeje uma viagem ao Pantanal'
      ];
    } else {
      level = 'Explorador Iniciante';
      badge = '🌱';
      recommendations = [
        'Continue aprendendo sobre MS!',
        'Explore nosso conteúdo educativo',
        'Faça o quiz novamente quando quiser'
      ];
    }

    const result = {
      score: correctAnswers,
      totalQuestions: QUIZ_QUESTIONS.length,
      percentage,
      level,
      badge,
      recommendations,
      results,
      completedAt: new Date().toISOString()
    };

    // Salvar resultado no localStorage (temporário)
    if (user) {
      try {
        const quizData = {
          user_id: user.id,
          score: correctAnswers,
          total_questions: QUIZ_QUESTIONS.length,
          percentage,
          level,
          answers: finalAnswers,
          completed_at: new Date().toISOString()
        };
        localStorage.setItem('quiz_result', JSON.stringify(quizData));
      } catch (error) {
        console.error('Erro ao salvar resultado do quiz:', error);
      }
    }

    setSaving(false);
    onQuizComplete(result);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              Quiz do Descubra MS
            </CardTitle>
            <Badge variant="outline">
              {currentQuestion + 1} de {QUIZ_QUESTIONS.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800">
                {currentQ.category === 'pantanal' && '🦦 Pantanal'}
                {currentQ.category === 'turismo' && '🏖️ Turismo'}
                {currentQ.category === 'cultura' && '🎭 Cultura'}
                {currentQ.category === 'natureza' && '🌿 Natureza'}
              </Badge>
            </div>

            <h3 className="text-lg font-semibold">
              {currentQ.question}
            </h3>

            <RadioGroup
              value={selectedAnswer?.toString()}
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
              className="space-y-3"
            >
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onSkip}>
              Pular Quiz
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={saving}
              className="bg-ms-primary-blue hover:bg-ms-primary-blue/90"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finalizando...
                </>
              ) : currentQuestion < QUIZ_QUESTIONS.length - 1 ? (
                'Próxima'
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finalizar Quiz
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileQuiz;
