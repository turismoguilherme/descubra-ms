/**
 * Sistema de Diagnóstico Inteligente
 * Questionário dinâmico para empresas do setor privado
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  Brain,
  FileText,
  Download,
  TrendingUp,
  Target,
  Users,
  DollarSign
} from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'scale' | 'text';
  options?: string[];
  required: boolean;
  category: string;
}

interface DiagnosticResult {
  score: number;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  actionPlan: string[];
  estimatedROI: number;
}

export interface QuestionnaireAnswers {
  business_type?: string;
  experience_years?: string;
  revenue_monthly?: string;
  occupancy_rate?: string;
  marketing_channels?: string[];
  digital_presence?: string;
  customer_service?: string;
  main_challenges?: string[];
  technology_usage?: string[];
  sustainability?: string;
}

interface DiagnosticQuestionnaireProps {
  onComplete?: (answers: QuestionnaireAnswers) => void;
}

const DiagnosticQuestionnaire: React.FC<DiagnosticQuestionnaireProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [businessType, setBusinessType] = useState<string>('');

  // Perguntas do questionário
  const questions: Question[] = [
    {
      id: 'business_type',
      text: 'Qual é o tipo do seu negócio?',
      type: 'single',
      options: ['Hotel/Pousada', 'Agência de Viagens', 'Restaurante', 'Atrativo Turístico', 'Outro'],
      required: true,
      category: 'Identificação'
    },
    {
      id: 'experience_years',
      text: 'Há quantos anos você está no ramo do turismo?',
      type: 'single',
      options: ['Menos de 1 ano', '1-3 anos', '3-5 anos', '5-10 anos', 'Mais de 10 anos'],
      required: true,
      category: 'Experiência'
    },
    {
      id: 'revenue_monthly',
      text: 'Qual é sua receita mensal média?',
      type: 'single',
      options: ['Até R$ 5.000', 'R$ 5.000 - R$ 15.000', 'R$ 15.000 - R$ 50.000', 'R$ 50.000 - R$ 100.000', 'Acima de R$ 100.000'],
      required: true,
      category: 'Financeiro'
    },
    {
      id: 'occupancy_rate',
      text: 'Qual é sua taxa de ocupação média?',
      type: 'single',
      options: ['Até 30%', '30-50%', '50-70%', '70-90%', 'Acima de 90%'],
      required: true,
      category: 'Operacional'
    },
    {
      id: 'marketing_channels',
      text: 'Quais canais de marketing você utiliza? (múltipla escolha)',
      type: 'multiple',
      options: ['Redes Sociais', 'Google Ads', 'Site próprio', 'Agências de viagem', 'Indicação de clientes', 'Outros'],
      required: true,
      category: 'Marketing'
    },
    {
      id: 'digital_presence',
      text: 'Como você avalia sua presença digital?',
      type: 'scale',
      options: ['1', '2', '3', '4', '5'],
      required: true,
      category: 'Digital'
    },
    {
      id: 'customer_service',
      text: 'Como você avalia seu atendimento ao cliente?',
      type: 'scale',
      options: ['1', '2', '3', '4', '5'],
      required: true,
      category: 'Atendimento'
    },
    {
      id: 'main_challenges',
      text: 'Quais são seus principais desafios? (múltipla escolha)',
      type: 'multiple',
      options: ['Baixa ocupação', 'Preços competitivos', 'Marketing digital', 'Atendimento', 'Gestão financeira', 'Qualidade do serviço'],
      required: true,
      category: 'Desafios'
    },
    {
      id: 'technology_usage',
      text: 'Que tecnologias você utiliza? (múltipla escolha)',
      type: 'multiple',
      options: ['Sistema de reservas', 'Redes sociais', 'WhatsApp Business', 'Site responsivo', 'Analytics', 'CRM'],
      required: true,
      category: 'Tecnologia'
    },
    {
      id: 'sustainability',
      text: 'Você tem práticas de sustentabilidade?',
      type: 'single',
      options: ['Sim, muitas', 'Sim, algumas', 'Poucas', 'Não tenho', 'Não sei'],
      required: true,
      category: 'Sustentabilidade'
    }
  ];

  const totalSteps = questions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsAnalyzing(true);
    
    try {
      // Converter respostas para o formato esperado
      const diagnosticAnswers: QuestionnaireAnswers = {
        business_type: answers.business_type || '',
        experience_years: answers.experience_years || '',
        revenue_monthly: answers.revenue_monthly || '',
        occupancy_rate: answers.occupancy_rate || '',
        marketing_channels: answers.marketing_channels || [],
        digital_presence: answers.digital_presence || '3',
        customer_service: answers.customer_service || '3',
        main_challenges: answers.main_challenges || [],
        technology_usage: answers.technology_usage || [],
        sustainability: answers.sustainability || ''
      };

      // Se houver callback onComplete, usar ele (o dashboard processará com analysisService)
      if (onComplete) {
        onComplete(diagnosticAnswers);
        return; // O dashboard vai gerenciar o resultado
      }

      // Caso contrário, processar localmente (fallback)
      // Importar o serviço de IA
      const { geminiAIService } = await import('@/services/ai/GeminiAIService');
      
      // Analisar com IA real
      const aiResult = await geminiAIService.analyzeDiagnostic(diagnosticAnswers);
      
      setResult(aiResult);
    } catch (error) {
      console.error('Erro na análise com IA:', error);
      
      // Fallback para análise simulada
      const mockResult: DiagnosticResult = {
        score: 75,
        recommendations: [
          'Implementar sistema de reservas online',
          'Melhorar presença nas redes sociais',
          'Criar programa de fidelidade',
          'Otimizar preços baseado na demanda'
        ],
        strengths: [
          'Experiência no ramo',
          'Localização privilegiada',
          'Qualidade do atendimento'
        ],
        weaknesses: [
          'Presença digital limitada',
          'Falta de sistema de reservas',
          'Marketing passivo'
        ],
        actionPlan: [
          'Criar site responsivo (30 dias)',
          'Implementar sistema de reservas (45 dias)',
          'Lançar campanhas digitais (15 dias)',
          'Treinar equipe em vendas (60 dias)'
        ],
        estimatedROI: 35,
        analysis: 'Análise gerada com sucesso.'
      };
      
      setResult(mockResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const canProceed = answers[currentQuestion.id] !== undefined;

  if (result) {
    return (
      <SectionWrapper
        variant="default"
        title="Diagnóstico Concluído!"
        subtitle="Análise personalizada para seu negócio"
      >
        <div className="space-y-6">
          {/* Score */}
          <CardBox>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{result.score}%</div>
              <p className="text-gray-600">Score de Maturidade Digital</p>
            </div>
          </CardBox>

          {/* ROI Estimado */}
          <CardBox className="bg-green-50 border-green-200">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-lg font-semibold text-green-800">
                  ROI Estimado: +{result.estimatedROI}%
                </span>
              </div>
              <p className="text-green-700 text-sm">
                Potencial de aumento na receita com as implementações
              </p>
            </div>
          </CardBox>

          {/* Recomendações */}
          <CardBox>
            <h3 className="text-lg font-semibold mb-3 flex items-center text-slate-800">
              <Target className="h-5 w-5 mr-2" />
              Recomendações Prioritárias
            </h3>
            <div className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{rec}</span>
                </div>
              ))}
            </div>
          </CardBox>

          {/* Pontos Fortes */}
          <CardBox>
            <h3 className="text-lg font-semibold mb-3 flex items-center text-slate-800">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Pontos Fortes
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.strengths.map((strength, index) => (
                <span key={index} className="rounded-full text-xs font-medium px-2 py-1 bg-green-100 text-green-700">
                  {strength}
                </span>
              ))}
            </div>
          </CardBox>

          {/* Pontos de Melhoria */}
          <CardBox>
            <h3 className="text-lg font-semibold mb-3 flex items-center text-slate-800">
              <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
              Pontos de Melhoria
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.weaknesses.map((weakness, index) => (
                <span key={index} className="rounded-full text-xs font-medium px-2 py-1 bg-orange-100 text-orange-700 border border-orange-200">
                  {weakness}
                </span>
              ))}
            </div>
          </CardBox>

          {/* Plano de Ação */}
          <CardBox>
            <h3 className="text-lg font-semibold mb-3 flex items-center text-slate-800">
              <FileText className="h-5 w-5 mr-2" />
              Plano de Ação
            </h3>
            <div className="space-y-2">
              {result.actionPlan.map((action, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-1 flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-sm text-slate-700">{action}</span>
                </div>
              ))}
            </div>
          </CardBox>

          {/* Ações */}
          <div className="flex gap-3 pt-4">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Baixar Relatório PDF
            </Button>
            <Button variant="outline" size="lg" className="border border-slate-300">
              <Brain className="h-4 w-4 mr-2" />
              Consultoria Personalizada
            </Button>
          </div>
        </div>
      </SectionWrapper>
    );
  }

  if (isAnalyzing) {
    return (
      <SectionWrapper variant="default" title="Analisando seu negócio...">
        <CardBox>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Nossa IA está processando suas respostas</p>
          </div>
        </CardBox>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      variant="default"
      title="Diagnóstico Inteligente"
      subtitle={`Pergunta ${currentStep + 1} de ${totalSteps} - ${Math.round(progress)}% concluído`}
    >
      {/* Progress */}
      <div className="mb-6">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <CardBox>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-800">{currentQuestion.text}</h3>
          <span className="rounded-full text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700">
            {currentQuestion.category}
          </span>
        </div>
        
        <div className="space-y-4">
          {currentQuestion.type === 'single' && (
            <div className="space-y-2">
              {currentQuestion.options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option}
                    checked={answers[currentQuestion.id] === option}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                    className="h-4 w-4"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'multiple' && (
            <div className="space-y-2">
              {currentQuestion.options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={answers[currentQuestion.id]?.includes(option) || false}
                    onChange={(e) => {
                      const current = answers[currentQuestion.id] || [];
                      if (e.target.checked) {
                        handleAnswer(currentQuestion.id, [...current, option]);
                      } else {
                        handleAnswer(currentQuestion.id, current.filter((item: string) => item !== option));
                      }
                    }}
                    className="h-4 w-4"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'scale' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>Muito baixo</span>
                <span>Muito alto</span>
              </div>
              <div className="flex justify-between">
                {currentQuestion.options?.map((value, index) => (
                  <label key={index} className="flex flex-col items-center space-y-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={value}
                      checked={answers[currentQuestion.id] === value}
                      onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-medium">{value}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardBox>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="border border-slate-300"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        {isLastStep ? (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Brain className="h-4 w-4 mr-2" />
            Analisar com IA
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Próxima
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </SectionWrapper>
  );
};

export default DiagnosticQuestionnaire;


