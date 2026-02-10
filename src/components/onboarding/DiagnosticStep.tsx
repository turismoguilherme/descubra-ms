// @ts-nocheck
/**
 * Etapa de Diagnóstico do Onboarding
 * Questionário obrigatório para avaliação do negócio
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  DollarSign,
  Globe,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface DiagnosticStepProps {
  data: unknown;
  onNext: (data?: unknown) => void;
  onPrevious: () => void;
}

const DiagnosticStep: React.FC<DiagnosticStepProps> = ({ data, onNext }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const dataObj = data as Record<string, unknown>;
  const [answers, setAnswers] = useState<Record<string, unknown>>((dataObj.diagnosticAnswers as Record<string, unknown>) || {});

  const questions = [
    {
      id: 'business_type',
      title: 'Qual é o principal foco do seu negócio?',
      type: 'radio',
      options: [
        { value: 'hospedagem', label: 'Hospedagem', description: 'Hotéis, pousadas, hostels' },
        { value: 'gastronomia', label: 'Gastronomia', description: 'Restaurantes, bares, cafés' },
        { value: 'atrativos', label: 'Atrativos', description: 'Pontos turísticos, parques' },
        { value: 'servicos', label: 'Serviços', description: 'Agências, guias, transporte' },
        { value: 'eventos', label: 'Eventos', description: 'Organização de eventos' }
      ]
    },
    {
      id: 'revenue_monthly',
      title: 'Qual é sua receita mensal média?',
      type: 'radio',
      options: [
        { value: 'ate_5k', label: 'Até R$ 5.000', description: 'Negócio pequeno' },
        { value: '5k_15k', label: 'R$ 5.000 - R$ 15.000', description: 'Negócio médio' },
        { value: '15k_50k', label: 'R$ 15.000 - R$ 50.000', description: 'Negócio grande' },
        { value: '50k_100k', label: 'R$ 50.000 - R$ 100.000', description: 'Negócio muito grande' },
        { value: 'acima_100k', label: 'Acima de R$ 100.000', description: 'Negócio corporativo' }
      ]
    },
    {
      id: 'occupancy_rate',
      title: 'Qual é sua taxa de ocupação média?',
      type: 'radio',
      options: [
        { value: 'ate_30', label: 'Até 30%', description: 'Baixa ocupação' },
        { value: '30_50', label: '30% - 50%', description: 'Ocupação moderada' },
        { value: '50_70', label: '50% - 70%', description: 'Boa ocupação' },
        { value: '70_90', label: '70% - 90%', description: 'Alta ocupação' },
        { value: 'acima_90', label: 'Acima de 90%', description: 'Ocupação excelente' }
      ]
    },
    {
      id: 'marketing_channels',
      title: 'Quais canais de marketing você utiliza? (pode selecionar vários)',
      type: 'checkbox',
      options: [
        { value: 'redes_sociais', label: 'Redes Sociais', description: 'Instagram, Facebook, TikTok' },
        { value: 'google_ads', label: 'Google Ads', description: 'Anúncios no Google' },
        { value: 'site_proprio', label: 'Site Próprio', description: 'Website institucional' },
        { value: 'booking', label: 'Booking.com', description: 'Plataformas de reserva' },
        { value: 'agencia', label: 'Agências de Viagem', description: 'Parcerias com agências' },
        { value: 'indicacao', label: 'Indicação', description: 'Marketing boca a boca' },
        { value: 'outros', label: 'Outros', description: 'Outros canais' }
      ]
    },
    {
      id: 'digital_presence',
      title: 'Como você avalia sua presença digital?',
      type: 'slider',
      description: 'De 1 (muito baixa) a 5 (excelente)',
      min: 1,
      max: 5,
      step: 1,
      labels: ['Muito Baixa', 'Baixa', 'Média', 'Alta', 'Excelente']
    },
    {
      id: 'customer_service',
      title: 'Como você avalia seu atendimento ao cliente?',
      type: 'slider',
      description: 'De 1 (muito baixo) a 5 (excelente)',
      min: 1,
      max: 5,
      step: 1,
      labels: ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Excelente']
    },
    {
      id: 'main_challenges',
      title: 'Quais são seus principais desafios? (pode selecionar vários)',
      type: 'checkbox',
      options: [
        { value: 'baixa_ocupacao', label: 'Baixa Ocupação', description: 'Dificuldade para atrair clientes' },
        { value: 'precos', label: 'Preços', description: 'Definir preços competitivos' },
        { value: 'marketing', label: 'Marketing', description: 'Divulgação e promoção' },
        { value: 'qualidade', label: 'Qualidade', description: 'Manter padrão de qualidade' },
        { value: 'concorrencia', label: 'Concorrência', description: 'Competição no mercado' },
        { value: 'sazonalidade', label: 'Sazonalidade', description: 'Variação de demanda' },
        { value: 'tecnologia', label: 'Tecnologia', description: 'Modernização e inovação' },
        { value: 'recursos', label: 'Recursos', description: 'Falta de capital ou pessoal' }
      ]
    },
    {
      id: 'technology_usage',
      title: 'Quais tecnologias você utiliza? (pode selecionar vários)',
      type: 'checkbox',
      options: [
        { value: 'sistema_reservas', label: 'Sistema de Reservas', description: 'Software de gestão' },
        { value: 'redes_sociais', label: 'Redes Sociais', description: 'Instagram, Facebook' },
        { value: 'site_responsivo', label: 'Site Responsivo', description: 'Website mobile-friendly' },
        { value: 'pagamento_digital', label: 'Pagamento Digital', description: 'PIX, cartão online' },
        { value: 'analytics', label: 'Analytics', description: 'Google Analytics, etc.' },
        { value: 'crm', label: 'CRM', description: 'Gestão de clientes' },
        { value: 'automacao', label: 'Automação', description: 'Chatbots, emails automáticos' },
        { value: 'nenhuma', label: 'Nenhuma', description: 'Não uso tecnologia' }
      ]
    },
    {
      id: 'sustainability',
      title: 'Como você avalia suas práticas de sustentabilidade?',
      type: 'radio',
      options: [
        { value: 'nao_tenho', label: 'Não tenho práticas', description: 'Não implementei ainda' },
        { value: 'basicas', label: 'Básicas', description: 'Algumas práticas simples' },
        { value: 'intermediarias', label: 'Intermediárias', description: 'Práticas moderadas' },
        { value: 'avancadas', label: 'Avançadas', description: 'Práticas completas' },
        { value: 'exemplares', label: 'Exemplares', description: 'Referência em sustentabilidade' }
      ]
    },
    {
      id: 'goals',
      title: 'Qual é seu principal objetivo para os próximos 12 meses?',
      type: 'radio',
      options: [
        { value: 'aumentar_receita', label: 'Aumentar Receita', description: 'Crescer financeiramente' },
        { value: 'melhorar_qualidade', label: 'Melhorar Qualidade', description: 'Elevar padrão de serviço' },
        { value: 'expandir_mercado', label: 'Expandir Mercado', description: 'Atrair novos clientes' },
        { value: 'reduzir_custos', label: 'Reduzir Custos', description: 'Otimizar operações' },
        { value: 'modernizar', label: 'Modernizar', description: 'Implementar tecnologia' },
        { value: 'sustentabilidade', label: 'Sustentabilidade', description: 'Práticas sustentáveis' }
      ]
    }
  ];

  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswer = (questionId: string, answer: unknown) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Última pergunta - processar diagnóstico
      onNext({ diagnosticAnswers: answers });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQ.id];

  const renderQuestion = () => {
    switch (currentQ.type) {
      case 'radio':
        return (
          <RadioGroup
            value={currentAnswer}
            onValueChange={(value) => handleAnswer(currentQ.id, value)}
            className="space-y-4"
          >
            {currentQ.options?.map((option) => (
              <div key={option.value} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={option.value} className="font-medium cursor-pointer">
                    {option.label}
                  </Label>
                  {option.description && (
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="space-y-4">
            {currentQ.options?.map((option) => (
              <div key={option.value} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={option.value}
                  checked={currentAnswer?.includes(option.value) || false}
                  onCheckedChange={(checked) => {
                    const currentAnswers = currentAnswer || [];
                    if (checked) {
                      handleAnswer(currentQ.id, [...currentAnswers, option.value]);
                    } else {
                      handleAnswer(currentQ.id, currentAnswers.filter((a: string) => a !== option.value));
                    }
                  }}
                />
                <div className="flex-1">
                  <Label htmlFor={option.value} className="font-medium cursor-pointer">
                    {option.label}
                  </Label>
                  {option.description && (
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {currentAnswer || currentQ.min}
              </div>
              <p className="text-gray-600">{currentQ.description}</p>
            </div>
            
            <Slider
              value={[currentAnswer || currentQ.min]}
              onValueChange={([value]) => handleAnswer(currentQ.id, value)}
              min={currentQ.min}
              max={currentQ.max}
              step={currentQ.step}
              className="w-full"
            />
            
            <div className="flex justify-between text-sm text-gray-500">
              {currentQ.labels?.map((label, index) => (
                <span key={index} className="text-center flex-1">
                  {label}
                </span>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    if (!currentAnswer) return false;
    if (currentQ.type === 'checkbox' && currentAnswer.length === 0) return false;
    return true;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Brain className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800">
            Diagnóstico do seu negócio
          </h2>
        </div>
        <p className="text-gray-600">
          Responda as perguntas para receber recomendações personalizadas
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Pergunta {currentQuestion + 1} de {totalQuestions}</span>
          <span>{Math.round(progress)}% concluído</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {currentQ.title}
              </h3>
              {currentQ.description && (
                <p className="text-gray-600">{currentQ.description}</p>
              )}
            </div>

            {renderQuestion()}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="flex items-center space-x-2"
        >
          <span>Anterior</span>
        </Button>

        <div className="flex items-center space-x-4">
          {!canProceed() && (
            <div className="flex items-center space-x-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span>Selecione uma opção para continuar</span>
            </div>
          )}
          
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center space-x-2"
          >
            <span>
              {currentQuestion === totalQuestions - 1 ? 'Finalizar Diagnóstico' : 'Próxima'}
            </span>
            {currentQuestion === totalQuestions - 1 ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Target className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Dicas */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">
          💡 Dicas para um diagnóstico preciso
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Seja honesto nas suas respostas</li>
          <li>• Não há respostas certas ou erradas</li>
          <li>• Quanto mais preciso, melhores as recomendações</li>
          <li>• Você pode refazer o diagnóstico depois</li>
        </ul>
      </div>
    </div>
  );
};

export default DiagnosticStep;
