import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Star, 
  Trophy,
  Heart,
  Shield,
  Zap,
  Target,
  Award
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

interface EnvironmentalQuizProps {
  animals: PantanalAnimal[];
  onClose?: () => void;
  onQuizComplete?: (score: number) => void;
}

const EnvironmentalQuiz: React.FC<EnvironmentalQuizProps> = ({
  animals,
  onClose,
  onQuizComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isOpen, setIsOpen] = useState(true);

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

      // Perguntas sobre habitat
      questions.push({
        id: `${animal.id}-hab-1`,
        question: `Onde o(a) ${animal.name} vive no Pantanal?`,
        options: [
          animal.habitat,
          'Apenas na Mata Atlântica',
          'Somente em cativeiro',
          'Apenas no Cerrado'
        ],
        correct: 0,
        explanation: `O(a) ${animal.name} habita principalmente ${animal.habitat.toLowerCase()}.`,
        category: 'characteristics',
        animalId: animal.id
      });

      // Perguntas sobre curiosidades
      if (animal.curiosities.length > 0) {
        questions.push({
          id: `${animal.id}-cur-1`,
          question: `Qual é uma curiosidade sobre o(a) ${animal.name}?`,
          options: [
            animal.curiosities[0],
            'É o menor animal do Pantanal',
            'Vive apenas 1 ano',
            'Não é nativo do Brasil'
          ],
          correct: 0,
          explanation: animal.curiosities[0],
          category: 'characteristics',
          animalId: animal.id
        });
      }

      // Perguntas sobre ações práticas
      questions.push({
        id: `${animal.id}-action-1`,
        question: `Como posso ajudar a proteger o(a) ${animal.name}?`,
        options: [
          'Visitando o Pantanal de forma responsável',
          'Caçando outros animais',
          'Desmatando áreas de habitat',
          'Ignorando as leis ambientais'
        ],
        correct: 0,
        explanation: 'A melhor forma de ajudar é visitando o Pantanal de forma responsável e sustentável, respeitando a fauna e flora local.',
        category: 'action',
        animalId: animal.id
      });

      // Perguntas sobre impacto
      questions.push({
        id: `${animal.id}-impact-1`,
        question: `O que acontece se o(a) ${animal.name} desaparecer do Pantanal?`,
        options: [
          'Desequilíbrio no ecossistema',
          'Nada acontece',
          'Outros animais se beneficiam',
          'O Pantanal fica mais limpo'
        ],
        correct: 0,
        explanation: 'Cada animal tem um papel importante no ecossistema. Sua extinção causaria desequilíbrio ecológico.',
        category: 'impact',
        animalId: animal.id
      });
    });

    return questions.sort(() => Math.random() - 0.5).slice(0, 10); // 10 perguntas aleatórias
  };

  const [questions] = useState<QuizQuestion[]>(generateQuestions());
  const currentQ = questions[currentQuestion];

  useEffect(() => {
    if (!showResult && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleAnswer(-1); // Resposta incorreta por timeout
    }
  }, [timeLeft, showResult]);

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
      setTimeLeft(30);
    } else {
      setQuizCompleted(true);
      if (onQuizComplete) {
        onQuizComplete(Math.round((score / questions.length) * 100));
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
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

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-ms-primary-blue">
            🌿 Quiz Educativo do Pantanal
          </DialogTitle>
          <p className="text-center text-gray-600">
            Teste seus conhecimentos sobre a biodiversidade do Pantanal!
          </p>
        </DialogHeader>

        {!quizCompleted ? (
          <div className="space-y-6">
            {/* Progresso */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Pergunta {currentQuestion + 1} de {questions.length}</span>
                <span className="flex items-center">
                  <Zap className="h-4 w-4 mr-1" />
                  {timeLeft}s
                </span>
              </div>
              <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
            </div>

            {/* Pergunta */}
            <Card>
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
                    Pontuação: {score}/{currentQuestion + (showResult ? 1 : 0)}
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
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              {getScoreMessage(Math.round((score / questions.length) * 100)).icon}
            </div>
            
            <div>
              <h3 className={`text-2xl font-bold ${getScoreMessage(Math.round((score / questions.length) * 100)).color}`}>
                {Math.round((score / questions.length) * 100)}%
              </h3>
              <p className="text-lg text-gray-600">
                {getScoreMessage(Math.round((score / questions.length) * 100)).message}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                onClick={handleClose}
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
                  setTimeLeft(30);
                }}
                className="w-full"
              >
                Refazer Quiz
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnvironmentalQuiz;

