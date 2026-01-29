// @ts-nocheck
/**
 * Diagnostic Questionnaire Component
 * Questionário completo com 10 perguntas base + perguntas adaptativas inteligentes
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { QuestionnaireAnswers } from '@/types/diagnostic';
import { 
  Building2, 
  MapPin, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Sparkles,
  AlertCircle,
  Loader2,
  Brain
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { adaptiveDiagnosticService, AdaptiveQuestion } from '@/services/diagnostic/adaptiveDiagnosticService';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DiagnosticQuestionnaireProps {
  onComplete: (answers: QuestionnaireAnswers) => void;
  onProgress?: (progress: number) => void;
  initialData?: Partial<QuestionnaireAnswers>;
  registrationData?: {
    origin_state?: string;
    travel_purpose?: string;
    age_range?: string;
    preferences?: string[];
  };
}

interface BaseQuestion {
  id: string;
  title: string;
  type: 'radio' | 'checkbox' | 'slider' | 'text';
  options?: { value: string; label: string; description?: string }[];
  min?: number;
  max?: number;
  step?: number;
  labels?: string[];
  required?: boolean;
}

const DiagnosticQuestionnaire: React.FC<DiagnosticQuestionnaireProps> = ({ 
  onComplete,
  onProgress,
  initialData,
  registrationData
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<'basic' | 'questionnaire'>('basic');
  const [basicInfo, setBasicInfo] = useState({
    businessName: initialData?.business_name || '',
    businessType: initialData?.business_type || '',
    city: initialData?.business_city || '',
    state: initialData?.business_state || registrationData?.origin_state || 'MS'
  });
  
  // 10 perguntas base
  const [baseQuestions] = useState<BaseQuestion[]>([
    {
      id: 'revenue_monthly',
      title: 'Qual é sua receita mensal média?',
      type: 'radio',
      required: true,
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
      required: true,
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
      required: true,
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
      required: true,
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
      required: true,
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
      required: true,
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
      required: true,
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
      required: true,
      options: [
        { value: 'nao_tenho', label: 'Não tenho práticas', description: 'Não implementei ainda' },
        { value: 'basicas', label: 'Básicas', description: 'Algumas práticas simples' },
        { value: 'intermediarias', label: 'Intermediárias', description: 'Práticas moderadas' },
        { value: 'avancadas', label: 'Avançadas', description: 'Práticas completas' },
        { value: 'exemplares', label: 'Exemplares', description: 'Referência em sustentabilidade' }
      ]
    },
    {
      id: 'experience_years',
      title: 'Há quantos anos você está no mercado?',
      type: 'radio',
      required: true,
      options: [
        { value: 'menos_1', label: 'Menos de 1 ano', description: 'Iniciante' },
        { value: '1_3', label: '1 a 3 anos', description: 'Estabelecendo' },
        { value: '3_5', label: '3 a 5 anos', description: 'Consolidando' },
        { value: '5_10', label: '5 a 10 anos', description: 'Experiente' },
        { value: 'acima_10', label: 'Acima de 10 anos', description: 'Muito experiente' }
      ]
    },
    {
      id: 'goals',
      title: 'Qual é seu principal objetivo para os próximos 12 meses?',
      type: 'radio',
      required: true,
      options: [
        { value: 'aumentar_receita', label: 'Aumentar Receita', description: 'Crescer financeiramente' },
        { value: 'melhorar_qualidade', label: 'Melhorar Qualidade', description: 'Elevar padrão de serviço' },
        { value: 'expandir_mercado', label: 'Expandir Mercado', description: 'Atrair novos clientes' },
        { value: 'reduzir_custos', label: 'Reduzir Custos', description: 'Otimizar operações' },
        { value: 'modernizar', label: 'Modernizar', description: 'Implementar tecnologia' },
        { value: 'sustentabilidade', label: 'Sustentabilidade', description: 'Práticas sustentáveis' }
      ]
    }
  ]);

  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [followUpQuestions, setFollowUpQuestions] = useState<AdaptiveQuestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFollowUps, setShowFollowUps] = useState(false);
  const [analyzingMessage, setAnalyzingMessage] = useState('');

  const businessTypes = [
    { value: 'hospedagem', label: 'Hospedagem (Hotéis, Pousadas, Hostels)' },
    { value: 'gastronomia', label: 'Gastronomia (Restaurantes, Bares, Cafés)' },
    { value: 'atrativos', label: 'Atrativos (Pontos Turísticos, Parques)' },
    { value: 'servicos', label: 'Serviços (Agências, Guias, Transporte)' },
    { value: 'eventos', label: 'Eventos (Organização de Eventos)' }
  ];

  const totalBaseQuestions = baseQuestions.length;
  const currentQuestion = baseQuestions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion?.id];
  const progress = ((currentQuestionIndex + 1) / totalBaseQuestions) * 100;

  // Inicializar slider com valor padrão se não tiver resposta
  useEffect(() => {
    if (currentQuestion?.type === 'slider' && !currentAnswer) {
      const defaultValue = (currentQuestion.min || 1).toString();
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: defaultValue }));
    }
  }, [currentQuestionIndex, currentQuestion]);

  useEffect(() => {
    if (onProgress) {
      onProgress(progress);
    }
  }, [progress, onProgress]);

  // Buscar cidade/estado do perfil ao carregar componente
  useEffect(() => {
    const fetchProfileLocation = async () => {
      if (!user?.id) return;
      
      // Se já tiver cidade/estado de initialData ou registrationData, não buscar
      if (initialData?.business_city || registrationData?.origin_state) {
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('city, state')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile?.city && profile?.state) {
          setBasicInfo(prev => ({
            ...prev,
            city: profile.city || prev.city,
            state: profile.state || prev.state
          }));
        }
      } catch (error) {
        console.warn('Erro ao buscar localização do perfil:', error);
      }
    };

    fetchProfileLocation();
  }, [user?.id, initialData?.business_city, registrationData?.origin_state]);

  const handleBasicInfoNext = async () => {
    if (!basicInfo.businessName || !basicInfo.businessType || !basicInfo.city || !basicInfo.state) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios (nome, tipo, cidade e estado)',
        variant: 'destructive'
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Salvar informações básicas - usar users table que tem business_type e business_name
      // Também atualizar user_profiles para city e state
      const [usersError, profilesError] = await Promise.all([
        supabase
          .from('users')
          .update({
            business_name: basicInfo.businessName,
            business_type: basicInfo.businessType,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id),
        supabase
          .from('user_profiles')
          .update({
            city: basicInfo.city,
            state: basicInfo.state
          })
          .eq('user_id', user.id)
      ]);

      if (usersError.error) throw usersError.error;
      if (profilesError.error) {
        // Se user_profiles não existir, criar
        const { error: upsertError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            city: basicInfo.city,
            state: basicInfo.state
          });
        if (upsertError) {
          console.warn('Erro ao criar user_profiles:', upsertError);
          // Não bloquear o fluxo se user_profiles falhar
        }
      }

      setCurrentStep('questionnaire');
      if (onProgress) {
        onProgress(10);
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao salvar informações básicas:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao salvar informações',
        variant: 'destructive'
      });
    }
  };

  const handleAnswer = async (questionId: string, answer: unknown) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    // Analisar qualidade da resposta em tempo real (não bloquear navegação)
    // Fazer análise em background sem bloquear UI
    adaptiveDiagnosticService.analyzeAnswerQuality(
      newAnswers,
      questionId,
      answer
    ).then(quality => {
      // Se precisa de esclarecimento, adicionar perguntas de follow-up
      if (quality.needsClarification && quality.suggestedFollowUps.length > 0) {
        setFollowUpQuestions(prev => [...prev, ...quality.suggestedFollowUps]);
      }
    }).catch(error => {
      console.error('Erro ao analisar resposta:', error);
    });
  };

  const handleNext = async () => {
    // Validar resposta atual - verificar se a resposta existe e não está vazia
    const hasAnswer = currentAnswer !== undefined && currentAnswer !== null && 
      (typeof currentAnswer !== 'string' || currentAnswer.trim() !== '') &&
      (!Array.isArray(currentAnswer) || currentAnswer.length > 0);
    
    if (currentQuestion.required && !hasAnswer) {
      toast({
        title: 'Resposta obrigatória',
        description: 'Por favor, responda esta pergunta antes de continuar',
        variant: 'destructive'
      });
      return;
    }

    // Se é a última pergunta base, verificar se precisa de follow-ups
    if (currentQuestionIndex === totalBaseQuestions - 1) {
      setIsAnalyzing(true);
      setAnalyzingMessage('Analisando suas respostas para identificar se precisamos de mais informações...');
      
      try {
        const followUps = await adaptiveDiagnosticService.identifyFollowUpQuestions(answers);
        
        if (followUps.length > 0) {
          setFollowUpQuestions(followUps);
          setShowFollowUps(true);
          setIsAnalyzing(false);
          return;
        }
      } catch (error) {
        console.error('Erro ao identificar follow-ups:', error);
      } finally {
        setIsAnalyzing(false);
        setAnalyzingMessage('');
      }

      // Se não há follow-ups, completar
      handleComplete();
      return;
    }

    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFollowUpAnswer = (questionId: string, answer: unknown) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSkipFollowUps = () => {
    handleComplete();
  };

  const handleCompleteFollowUps = () => {
    handleComplete();
  };

  const handleComplete = () => {
    // Combinar informações básicas com respostas do questionário
    const completeAnswers: QuestionnaireAnswers = {
      business_type: basicInfo.businessType,
      location: `${basicInfo.city}, ${basicInfo.state}`,
      experience_years: answers.experience_years || '5_10',
      revenue_monthly: answers.revenue_monthly || '',
      occupancy_rate: answers.occupancy_rate || '',
      marketing_channels: answers.marketing_channels || [],
      digital_presence: answers.digital_presence?.toString() || '3',
      customer_service: answers.customer_service?.toString() || '3',
      main_challenges: answers.main_challenges || [],
      technology_usage: answers.technology_usage || [],
      sustainability: answers.sustainability || 'basicas',
      ...answers
    };

    onComplete(completeAnswers);
  };

  const renderQuestion = (question: BaseQuestion | AdaptiveQuestion) => {
    const answer = answers[question.id];
    const isAdaptive = 'reason' in question;

    switch (question.type) {
      case 'radio':
        return (
          <RadioGroup
            value={answer as string}
            onValueChange={(value) => handleAnswer(question.id, value)}
            className="space-y-4"
          >
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
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
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Checkbox
                  id={option.value}
                  checked={(answer as string[])?.includes(option.value) || false}
                  onCheckedChange={(checked) => {
                    const currentAnswers = (answer as string[]) || [];
                    if (checked) {
                      handleAnswer(question.id, [...currentAnswers, option.value]);
                    } else {
                      handleAnswer(question.id, currentAnswers.filter((a: string) => a !== option.value));
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
        const sliderValue = answer ? parseInt(answer as string) : (question.min || 1);
        return (
          <div className="space-y-4">
            <div className="px-2">
              <Slider
                value={[sliderValue]}
                onValueChange={(value) => {
                  handleAnswer(question.id, value[0].toString());
                }}
                min={question.min || 1}
                max={question.max || 5}
                step={question.step || 1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                {question.labels?.map((label, index) => (
                  <span key={index}>{label}</span>
                ))}
              </div>
              <div className="text-center mt-4">
                <span className="text-2xl font-bold text-blue-600">
                  {sliderValue}
                </span>
                <span className="text-sm text-gray-600 ml-2">/ {question.max || 5}</span>
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <Input
            value={answer as string || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="Digite sua resposta..."
            className="w-full"
          />
        );

      default:
        return null;
    }
  };

  if (currentStep === 'basic') {
    return (
      <SectionWrapper 
        variant="default" 
        title="Configuração Inicial"
        subtitle="Vamos começar configurando seu perfil"
      >
        <CardBox>
          <div className="space-y-6">
            <div className="text-center space-y-2 pb-6 border-b">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">
                Bem-vindo ao ViajARTur
              </h3>
              <p className="text-sm text-slate-600">
                Configure seu perfil para personalizar sua experiência
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName" className="text-sm font-medium text-slate-700">
                  Nome do seu negócio *
                </Label>
                <Input
                  id="businessName"
                  placeholder="Ex: Hotel Pantanal, Restaurante Sabores do MS"
                  value={basicInfo.businessName}
                  onChange={(e) => setBasicInfo({ ...basicInfo, businessName: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="businessType" className="text-sm font-medium text-slate-700">
                  Tipo de negócio *
                </Label>
                <Select
                  value={basicInfo.businessType}
                  onValueChange={(value) => setBasicInfo({ ...basicInfo, businessType: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o tipo do seu negócio" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mostrar aviso se cidade/estado vieram do perfil */}
              {basicInfo.city && basicInfo.state && !initialData?.business_city && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Localização pré-preenchida:</strong> Usando cidade e estado do seu perfil. 
                    Você pode alterar se necessário.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-slate-700">
                    Cidade *
                  </Label>
                  <Input
                    id="city"
                    placeholder="Ex: Campo Grande"
                    value={basicInfo.city}
                    onChange={(e) => setBasicInfo({ ...basicInfo, city: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="state" className="text-sm font-medium text-slate-700">
                    Estado *
                  </Label>
                  <Select
                    value={basicInfo.state}
                    onValueChange={(value) => setBasicInfo({ ...basicInfo, state: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                      <SelectItem value="SP">São Paulo</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="PR">Paraná</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      <SelectItem value="SC">Santa Catarina</SelectItem>
                      <SelectItem value="BA">Bahia</SelectItem>
                      <SelectItem value="GO">Goiás</SelectItem>
                      <SelectItem value="DF">Distrito Federal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleBasicInfoNext}
                disabled={!basicInfo.businessName || !basicInfo.businessType || !basicInfo.city || !basicInfo.state}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardBox>
      </SectionWrapper>
    );
  }

  // Se está mostrando follow-ups
  if (showFollowUps && followUpQuestions.length > 0) {
    const currentFollowUp = followUpQuestions[0];
    const remainingFollowUps = followUpQuestions.slice(1);

    return (
      <SectionWrapper 
        variant="default" 
        title="Perguntas Adicionais"
        subtitle="Precisamos de algumas informações adicionais para personalizar melhor suas recomendações"
      >
        <CardBox>
          <div className="space-y-6">
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                {currentFollowUp.reason}
              </AlertDescription>
            </Alert>

            <div>
              <Label className="text-base font-semibold mb-4 block">
                {currentFollowUp.question}
              </Label>
              {renderQuestion(currentFollowUp)}
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleSkipFollowUps}
              >
                Pular
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (remainingFollowUps.length > 0) {
                      setFollowUpQuestions(remainingFollowUps);
                    } else {
                      handleCompleteFollowUps();
                    }
                  }}
                  disabled={!answers[currentFollowUp.id]}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {remainingFollowUps.length > 0 ? 'Próxima' : 'Finalizar'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </CardBox>
      </SectionWrapper>
    );
  }

  // Questionário principal
  return (
    <SectionWrapper 
      variant="default" 
      title="Diagnóstico do Negócio"
      subtitle={`Pergunta ${currentQuestionIndex + 1} de ${totalBaseQuestions}`}
    >
      <CardBox>
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progresso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Analyzing Indicator */}
          {isAnalyzing && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                {analyzingMessage || 'Analisando...'}
              </AlertDescription>
            </Alert>
          )}

          {/* Question */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">
              {currentQuestion.title}
            </Label>
            {renderQuestion(currentQuestion)}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          <Button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão Próximo clicado', { currentQuestionIndex, currentAnswer, currentQuestion });
                handleNext();
              }}
              disabled={
                currentQuestion.required && 
                (
                  !currentAnswer || 
                  (Array.isArray(currentAnswer) && currentAnswer.length === 0) ||
                  (typeof currentAnswer === 'string' && currentAnswer.trim() === '')
                )
              }
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
              {currentQuestionIndex === totalBaseQuestions - 1 ? 'Finalizar' : 'Próxima'}
              <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          </div>
        </div>
      </CardBox>
    </SectionWrapper>
  );
};

export default DiagnosticQuestionnaire;
