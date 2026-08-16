import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RotateCcw, BookOpen, Loader2, Zap, Trophy, Star, Award, Target, Users, MapPin, Heart } from 'lucide-react';
import { PantanalAnimal } from './PantanalAvatarSelector';
import DynamicQuizService, { QuizQuestion } from '@/services/quiz/DynamicQuizService';
import { useAuth } from '@/hooks/useAuth';

// Interface movida para DynamicQuizService

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
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<{
    gemini: { used: number; limit: number; available: boolean };
    google: { used: number; limit: number; available: boolean };
  } | null>(null);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [forceRender, setForceRender] = useState(0);

  // Carregar quiz dinâmico
  useEffect(() => {
    const loadQuiz = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        console.log('🔄 Carregando quiz...');
        
        // Carregar status das APIs
        const status = await DynamicQuizService.getAPIStatus(user.id);
        setApiStatus(status);
        console.log('📊 Status das APIs:', status);
        
        // Gerar quiz híbrido
        const quizQuestions = await DynamicQuizService.generateHybridQuiz(user.id);
        console.log('❓ Perguntas carregadas:', quizQuestions.length);
        setQuestions(quizQuestions);
      } catch (error) {
        console.error('❌ Erro ao carregar quiz:', error);
        // Fallback para perguntas básicas
        const fallbackQuestions = [
          {
            id: 'fallback_1',
            question: 'O que é um turismólogo e qual sua importância para MS?',
            options: [
              'Apenas um guia turístico',
              'Profissional que planeja e desenvolve o turismo sustentável',
              'Só trabalha com hotéis',
              'Não tem importância'
            ],
            correctAnswer: 1,
            explanation: 'O turismólogo é o profissional que estuda o turismo como fenômeno social e econômico, planeja destinos turísticos e promove o turismo sustentável, essencial para o desenvolvimento de MS.',
            category: 'Turismo',
            isDynamic: false
          },
          {
            id: 'fallback_2',
            question: 'Qual é o principal bioma de Mato Grosso do Sul?',
            options: [
              'Apenas Pantanal',
              'Pantanal e Cerrado',
              'Só Cerrado',
              'Amazônia'
            ],
            correctAnswer: 1,
            explanation: 'MS abriga principalmente o Pantanal e o Cerrado, dois biomas de extrema importância para a biodiversidade brasileira e o ecoturismo.',
            category: 'Biodiversidade',
            isDynamic: false
          }
        ];
        console.log('🔄 Usando perguntas de fallback:', fallbackQuestions.length);
        setQuestions(fallbackQuestions);
      } finally {
        setLoading(false);
        console.log('✅ Quiz carregado!');
      }
    };

    loadQuiz();
  }, [user?.id]);

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
    console.log('🔄 Próxima pergunta:', currentQuestion, 'de', questions.length - 1);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      console.log('➡️ Indo para pergunta:', currentQuestion + 1);
    } else {
      console.log('🏁 Finalizando quiz...');
      const finalScore = (score + (selectedAnswer === questions[currentQuestion].correctAnswer ? 1 : 0)) / questions.length * 100;
      const badges = calculateBadges(finalScore, score + (selectedAnswer === questions[currentQuestion].correctAnswer ? 1 : 0), questions.length);
      console.log('🏆 Badges calculados:', badges);
      console.log('📊 Score final:', finalScore);
      setEarnedBadges(badges);
      setQuizCompleted(true);
      setForceRender(prev => prev + 1);
      console.log('✅ Quiz finalizado!');
      console.log('🔍 Estado quizCompleted:', true);
      console.log('🔍 Estado earnedBadges:', badges);
      console.log('🔍 Total de perguntas:', questions.length);
      console.log('🔍 Pergunta atual:', currentQuestion);
      console.log('🔍 setQuizCompleted(true) chamado!');
      console.log('🔍 Forçando re-render com forceRender...');
      if (onQuizComplete) {
        onQuizComplete(finalScore);
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
    setShowDetailedResults(false);
    setEarnedBadges([]);
  };

  // Calcular badges baseado na performance
  const calculateBadges = (finalScore: number, correctAnswers: number, totalQuestions: number) => {
    const badges: string[] = [];
    
    if (finalScore >= 100) {
      badges.push('Perfeito! 🌟');
    } else if (finalScore >= 80) {
      badges.push('Excelente! 🏆');
    } else if (finalScore >= 60) {
      badges.push('Muito Bom! ⭐');
    } else {
      badges.push('Continue Estudando! 📚');
    }

    // Badges específicos por categoria
    const categories = questions.map(q => q.category);
    const uniqueCategories = [...new Set(categories)];
    
    if (categories.includes('Turismo')) {
      badges.push('Turismólogo em Formação! 🗺️');
    }
    if (categories.includes('Biodiversidade')) {
      badges.push('Protetor da Natureza! 🌱');
    }
    if (categories.includes('Turismo Sustentável')) {
      badges.push('Defensor do Turismo Responsável! ♻️');
    }
    if (categories.includes('Turismo Cultural')) {
      badges.push('Guardião da Cultura! 🏛️');
    }
    if (categories.includes('Turismo Rural')) {
      badges.push('Amigo do Campo! 🌾');
    }

    return badges;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 80) return 'Excelente! Você conhece bem Mato Grosso do Sul!';
    if (percentage >= 60) return 'Bom! Continue aprendendo sobre MS!';
    return 'Continue estudando! MS tem muito a ensinar!';
  };

  console.log('🔍 RENDERIZANDO COMPONENTE - quizCompleted:', quizCompleted, 'score:', score, 'questions.length:', questions.length, 'forceRender:', forceRender);
  
  if (quizCompleted) {
    console.log('🎯 ENTRANDO NA CONDIÇÃO quizCompleted!');
    console.log('🔍 quizCompleted é true, renderizando tela de parabéns!');
    console.log('🔍 VERIFICANDO SE É TRUE:', quizCompleted === true);
    console.log('🔍 forceRender:', forceRender);
    const finalScore = (score / questions.length) * 100;
    console.log('🎉 RENDERIZANDO TELA DE PARABÉNS! Score:', finalScore, 'Badges:', earnedBadges);
    console.log('🔍 quizCompleted:', quizCompleted);
    console.log('🔍 earnedBadges:', earnedBadges);
    console.log('🔍 score:', score);
    console.log('🔍 questions.length:', questions.length);
    
    return (
      <Card className="max-w-4xl mx-auto shadow-lg border-0 bg-gradient-to-br from-green-50 to-blue-50">
        <CardContent className="p-8">
          {/* Cabeçalho de Parabéns */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Parabéns! 🎉</h2>
            <p className="text-lg text-gray-600 mb-4">Você concluiu o Quiz Educativo de MS!</p>
            
            {/* Badges Conquistados */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {earnedBadges.map((badge, index) => (
                <Badge key={index} variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-sm px-3 py-1">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Estatísticas Principais */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-white/70 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-gray-600">Acertos</div>
            </div>
            <div className="p-4 bg-white/70 rounded-lg text-center">
              <div className="text-3xl font-bold text-red-600">{questions.length - score}</div>
              <div className="text-sm text-gray-600">Erros</div>
            </div>
            <div className="p-4 bg-white/70 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">{questions.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="p-4 bg-white/70 rounded-lg text-center">
              <div className={`text-3xl font-bold ${getScoreColor(finalScore)}`}>
                {finalScore.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Pontuação</div>
            </div>
          </div>
          
          {/* Botões de Ação */}
          <div className="flex gap-4 justify-center mb-6">
            <Button 
              onClick={() => setShowDetailedResults(!showDetailedResults)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {showDetailedResults ? 'Ocultar' : 'Ver'} Explicações Detalhadas
            </Button>
            <Button 
              onClick={handleRestartQuiz}
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Refazer Quiz
            </Button>
            {onClose && (
              <Button 
                onClick={onClose}
                variant="outline"
                className="border-gray-300"
              >
                Fechar
              </Button>
            )}
          </div>
          
          {/* Explicações Detalhadas */}
          {showDetailedResults && (
            <div className="mt-8 space-y-6">
              <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
                📚 Análise Detalhada das Respostas
              </h3>
              
              {questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer;
                
                return (
                  <Card key={question.id} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Pergunta {index + 1}: {question.question}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {question.category}
                          </Badge>
                        </div>
                        <div className="ml-4">
                          {isCorrect ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-600" />
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Explicação:
                        </h5>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {question.explanation}
                        </p>
                      </div>
                      
                      {!isCorrect && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-800 text-sm">
                            <strong>Dica:</strong> Continue estudando sobre {question.category.toLowerCase()} para melhorar seu conhecimento!
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              
              {/* Sugestões de Estudo */}
              <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
                <CardContent className="p-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Sugestões para Continuar Aprendendo
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-semibold text-gray-800">📖 Estude Mais Sobre:</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Turismo sustentável em MS</li>
                        <li>• Biodiversidade do Pantanal e Cerrado</li>
                        <li>• Patrimônio cultural sul-mato-grossense</li>
                        <li>• Turismo rural e cultural</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-gray-800">🎯 Próximos Passos:</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Visite destinos turísticos de MS</li>
                        <li>• Participe de eventos culturais</li>
                        <li>• Apoie o turismo sustentável</li>
                        <li>• Compartilhe conhecimento</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-gradient-to-br from-blue-50 to-green-50">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Gerando Quiz Inteligente...
          </h3>
          <p className="text-gray-600">
            Buscando informações sobre Mato Grosso do Sul
          </p>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-gradient-to-br from-red-50 to-orange-50">
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Erro ao Carregar Quiz
          </h3>
          <p className="text-red-700 mb-4">
            Não foi possível carregar as perguntas. Tente novamente.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Recarregar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestionData = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-gradient-to-br from-blue-50 to-green-50">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <span>Quiz Educativo de MS</span>
            {currentQuestionData.isDynamic && (
              <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-300">
                <Zap className="h-3 w-3 mr-1" />
                IA
              </Badge>
            )}
          </CardTitle>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {currentQuestion + 1} de {questions.length}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          Aprenda sobre turismo, cultura e meio ambiente em Mato Grosso do Sul
        </p>
        <Progress value={progress} className="h-2" />
        
        {/* Status das APIs */}
        {apiStatus && (
          <div className="mt-2 text-xs text-gray-600">
            <span className="mr-4">
              Gemini: {apiStatus.gemini.used}/{apiStatus.gemini.limit}
            </span>
            <span>
              Google: {apiStatus.google.used}/{apiStatus.google.limit}
            </span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {currentQuestionData.question}
          </h3>
          <Badge variant="outline" className="text-xs">
            {currentQuestionData.category}
          </Badge>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestionData.options.map((option, index) => {
            let buttonClass = "w-full text-left p-4 rounded-lg border transition-all duration-200 ";
            
            if (showResult) {
              if (index === currentQuestionData.correctAnswer) {
                buttonClass += "border-green-500 bg-green-50 text-green-800";
              } else if (index === selectedAnswer && index !== currentQuestionData.correctAnswer) {
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
                  {showResult && index === currentQuestionData.correctAnswer && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {showResult && index === selectedAnswer && index !== currentQuestionData.correctAnswer && (
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
            <p className="text-blue-700 text-sm">{currentQuestionData.explanation}</p>
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
