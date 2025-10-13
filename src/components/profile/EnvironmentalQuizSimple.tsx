import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Star, 
  Trophy,
  Heart,
  Shield,
  Target,
  Award
} from 'lucide-react';

interface PantanalAnimal {
  id: string;
  name: string;
  scientific_name: string;
  image: string;
  habitat: string;
  diet: string;
  curiosities: string[];
  conservation_status: string;
  unlock_requirement?: string;
  is_unlocked: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: 'characteristics' | 'conservation' | 'action' | 'impact';
  animalId: string;
}

interface EnvironmentalQuizSimpleProps {
  animals: PantanalAnimal[];
  onClose?: () => void;
  onQuizComplete?: (score: number) => void;
}

const EnvironmentalQuizSimple: React.FC<EnvironmentalQuizSimpleProps> = ({
  animals = [],
  onClose,
  onQuizComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Gerar perguntas baseadas nos animais
  const generateQuestions = (): QuizQuestion[] => {
    const questions: QuizQuestion[] = [];
    
    animals.forEach(animal => {
      // Perguntas sobre características
      questions.push({
        id: `${animal.id}-char-1`,
        question: `Qual é o principal alimento do(a) ${animal.name}?`,
        options: [
          animal.diet,
          'Plantas aquáticas',
          'Peixes pequenos',
          'Insetos'
        ],
        correct: 0,
        explanation: `O(a) ${animal.name} se alimenta principalmente de ${animal.diet.toLowerCase()}.`,
        category: 'characteristics',
        animalId: animal.id
      });

      // Perguntas sobre conservação
      questions.push({
        id: `${animal.id}-cons-1`,
        question: `Qual é o status de conservação do(a) ${animal.name}?`,
        options: [
          animal.conservation_status,
          'Criticamente em Perigo',
          'Extinto',
          'Não avaliado'
        ],
        correct: 0,
        explanation: `O(a) ${animal.name} tem status de conservação: ${animal.conservation_status}.`,
        category: 'conservation',
        animalId: animal.id
      });
    });

    return questions.slice(0, 5); // 5 perguntas simples
  };

  const [questions] = useState<QuizQuestion[]>(generateQuestions());
  const currentQ = questions[currentQuestion];

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    if (answerIndex === currentQ.correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
      if (onQuizComplete) {
        onQuizComplete(Math.round((score / questions.length) * 100));
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'characteristics':
        return <BookOpen className="h-4 w-4" />;
      case 'conservation':
        return <Shield className="h-4 w-4" />;
      case 'action':
        return <Heart className="h-4 w-4" />;
      case 'impact':
        return <Target className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'characteristics':
        return 'bg-blue-100 text-blue-800';
      case 'conservation':
        return 'bg-red-100 text-red-800';
      case 'action':
        return 'bg-green-100 text-green-800';
      case 'impact':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return { message: "Excelente! Você é um verdadeiro guardião do Pantanal!", icon: <Trophy className="h-8 w-8 text-yellow-500" />, color: "text-yellow-600" };
    if (score >= 70) return { message: "Muito bom! Você conhece bem o Pantanal!", icon: <Award className="h-8 w-8 text-blue-500" />, color: "text-blue-600" };
    if (score >= 50) return { message: "Bom! Continue aprendendo sobre o Pantanal!", icon: <Star className="h-8 w-8 text-green-500" />, color: "text-green-600" };
    return { message: "Continue estudando! O Pantanal tem muito a ensinar!", icon: <BookOpen className="h-8 w-8 text-gray-500" />, color: "text-gray-600" };
  };

  if (quizCompleted) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            {getScoreMessage(Math.round((score / questions.length) * 100)).icon}
          </div>
          
          <div className="mb-6">
            <h3 className={`text-2xl font-bold ${getScoreMessage(Math.round((score / questions.length) * 100)).color}`}>
              {Math.round((score / questions.length) * 100)}%
            </h3>
            <p className="text-lg text-gray-600">
              {getScoreMessage(Math.round((score / questions.length) * 100)).message}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-blue-800">Respostas Corretas</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{questions.length - score}</div>
              <div className="text-sm text-green-800">Respostas Incorretas</div>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={onClose}
              className="w-full bg-ms-primary-blue hover:bg-blue-700"
            >
              Fechar Quiz
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setCurrentQuestion(0);
                setScore(0);
                setQuizCompleted(false);
                setSelectedAnswer(null);
                setShowResult(false);
              }}
              className="w-full"
            >
              Refazer Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <Badge className={`${getCategoryColor(currentQ.category)} flex items-center`}>
            {getCategoryIcon(currentQ.category)}
            <span className="ml-1">
              {currentQ.category === 'characteristics' ? 'Características' :
               currentQ.category === 'conservation' ? 'Conservação' :
               currentQ.category === 'action' ? 'Ações' : 'Impacto'}
            </span>
          </Badge>
          <div className="text-sm text-gray-500">
            Pergunta {currentQuestion + 1} de {questions.length}
          </div>
        </div>
        <CardTitle className="text-lg">{currentQ.question}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {currentQ.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedAnswer === index ? "default" : "outline"}
              className={`w-full justify-start text-left h-auto p-4 ${
                showResult 
                  ? index === currentQ.correct 
                    ? "bg-green-100 border-green-500 text-green-800" 
                    : selectedAnswer === index 
                      ? "bg-red-100 border-red-500 text-red-800"
                      : "bg-gray-50"
                  : selectedAnswer === index 
                    ? "bg-ms-primary-blue text-white" 
                    : "hover:bg-gray-50"
              }`}
              onClick={() => !showResult && handleAnswer(index)}
              disabled={showResult}
            >
              <div className="flex items-center">
                {showResult && index === currentQ.correct && (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                )}
                {showResult && selectedAnswer === index && index !== currentQ.correct && (
                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                )}
                <span>{option}</span>
              </div>
            </Button>
          ))}
        </div>

        {showResult && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Explicação:</h4>
            <p className="text-blue-700 text-sm">{currentQ.explanation}</p>
          </div>
        )}

        {showResult && (
          <Button 
            onClick={handleNext}
            className="w-full mt-4 bg-ms-primary-blue hover:bg-blue-700"
          >
            {currentQuestion < questions.length - 1 ? 'Próxima Pergunta' : 'Ver Resultado'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EnvironmentalQuizSimple;
