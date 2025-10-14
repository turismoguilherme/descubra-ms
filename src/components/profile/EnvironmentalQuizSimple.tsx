import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RotateCcw, BookOpen } from 'lucide-react';
import { PantanalAnimal } from './PantanalAvatarSelector';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

interface EnvironmentalQuizProps {
  animals: PantanalAnimal[];
  onClose?: () => void;
  onQuizComplete?: (score: number) => void;
}

const EnvironmentalQuizSimple: React.FC<EnvironmentalQuizProps> = ({
  animals = [],
  onClose,
  onQuizComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);

  // Perguntas do quiz sobre o Pantanal
  const questions: QuizQuestion[] = [
    {
      id: '1',
      question: 'Qual é a principal ameaça à biodiversidade do Pantanal?',
      options: [
        'Mudanças climáticas',
        'Desmatamento e queimadas',
        'Poluição da água',
        'Turismo excessivo'
      ],
      correctAnswer: 1,
      explanation: 'O desmatamento e as queimadas são as principais ameaças ao Pantanal, causando perda de habitat e desequilíbrio ecológico.',
      category: 'Conservação'
    },
    {
      id: '2',
      question: 'Qual animal é considerado o "rei do Pantanal"?',
      options: [
        'Arara-azul',
        'Onça-pintada',
        'Tuiuiú',
        'Capivara'
      ],
      correctAnswer: 1,
      explanation: 'A onça-pintada é conhecida como o "rei do Pantanal" por ser o maior predador terrestre da região.',
      category: 'Fauna'
    },
    {
      id: '3',
      question: 'O que significa "Pantanal"?',
      options: [
        'Lugar de águas',
        'Lugar de animais',
        'Lugar de plantas',
        'Lugar de pedras'
      ],
      correctAnswer: 0,
      explanation: 'Pantanal vem de "pântano", significando "lugar de águas", referindo-se às extensas áreas alagadas da região.',
      category: 'Geografia'
    },
    {
      id: '4',
      question: 'Qual é a melhor época para observar a fauna do Pantanal?',
      options: [
        'Período de cheia (dezembro a março)',
        'Período de seca (abril a novembro)',
        'Durante as chuvas',
        'Qualquer época do ano'
      ],
      correctAnswer: 1,
      explanation: 'O período de seca (abril a novembro) é ideal para observação da fauna, pois os animais se concentram nas áreas com água.',
      category: 'Turismo'
    },
    {
      id: '5',
      question: 'Qual é a importância do Pantanal para o mundo?',
      options: [
        'Reserva de água doce',
        'Regulador climático',
        'Reserva da biosfera da UNESCO',
        'Todas as alternativas'
      ],
      correctAnswer: 3,
      explanation: 'O Pantanal é importante por ser reserva de água doce, regulador climático e reserva da biosfera da UNESCO.',
      category: 'Importância'
    }
  ];

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
      if (onQuizComplete) {
        onQuizComplete((score + (selectedAnswer === questions[currentQuestion].correctAnswer ? 1 : 0)) / questions.length * 100);
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
    setAnswers([]);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 80) return 'Excelente! Você conhece bem o Pantanal!';
    if (percentage >= 60) return 'Bom! Continue aprendendo sobre o Pantanal!';
    return 'Continue estudando! O Pantanal tem muito a ensinar!';
  };

  if (quizCompleted) {
    const finalScore = (score / questions.length) * 100;
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Quiz Concluído! 🎉
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(finalScore)}`}>
              {Math.round(finalScore)}%
            </div>
            <p className="text-lg text-gray-600 mt-2">
              {getScoreMessage(finalScore)}
            </p>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-gray-600">Acertos</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{questions.length - score}</div>
              <div className="text-sm text-gray-600">Erros</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRestartQuiz} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Refazer Quiz
            </Button>
            {onClose && (
              <Button onClick={onClose}>
                Fechar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-xl font-bold text-gray-900">
            Quiz Educativo do Pantanal
          </CardTitle>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {currentQuestion + 1} de {questions.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {question.question}
          </h3>
          <Badge variant="outline" className="text-xs">
            {question.category}
          </Badge>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            let buttonClass = "w-full text-left p-4 rounded-lg border transition-all duration-200 ";
            
            if (showResult) {
              if (index === question.correctAnswer) {
                buttonClass += "border-green-500 bg-green-50 text-green-800";
              } else if (index === selectedAnswer && index !== question.correctAnswer) {
                buttonClass += "border-red-500 bg-red-50 text-red-800";
              } else {
                buttonClass += "border-gray-200 bg-gray-50 text-gray-600";
              }
            } else if (selectedAnswer === index) {
              buttonClass += "border-blue-500 bg-blue-50 text-blue-800";
            } else {
              buttonClass += "border-gray-200 hover:border-blue-300 hover:bg-blue-50";
            }

            return (
              <button
                key={index}
                className={buttonClass}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showResult && index === question.correctAnswer && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {showResult && index === selectedAnswer && index !== question.correctAnswer && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showResult && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Explicação:
            </h4>
            <p className="text-blue-700 text-sm">{question.explanation}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          {!showResult ? (
            <Button 
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="bg-green-600 hover:bg-green-700"
            >
              Responder
            </Button>
          ) : (
            <Button onClick={handleNextQuestion} className="bg-blue-600 hover:bg-blue-700">
              {currentQuestion < questions.length - 1 ? 'Próxima Pergunta' : 'Ver Resultado'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnvironmentalQuizSimple;
