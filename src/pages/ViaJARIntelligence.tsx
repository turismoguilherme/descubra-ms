import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { 
  TrendingUp, 
  Target, 
  MapPin, 
  DollarSign, 
  Users, 
  Calendar,
  TrendingDown,
  AlertCircle,
  Lightbulb,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Brain
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useBusinessType } from '@/hooks/useBusinessType';
import { getBusinessMetricLabel, isMetricRelevant } from '@/services/business/businessMetricsService';
import { regionalDataIntegrationService } from '@/services/private/regionalDataIntegrationService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, ShieldOff, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';

// Dados mockados - serão substituídos pela ALUMIA API
const MOCK_REVENUE_PREDICTION = {
  nextDays: [
    { date: '15/Out', occupancy: 45, suggestedPrice: 320, revenue: 14400 },
    { date: '16/Out', occupancy: 48, suggestedPrice: 340, revenue: 16320 },
    { date: '17/Out', occupancy: 88, suggestedPrice: 580, revenue: 51040 },
    { date: '18/Out', occupancy: 92, suggestedPrice: 650, revenue: 59800 },
    { date: '19/Out', occupancy: 85, suggestedPrice: 620, revenue: 52700 },
    { date: '20/Out', occupancy: 51, suggestedPrice: 380, revenue: 19380 },
    { date: '21/Out', occupancy: 38, suggestedPrice: 300, revenue: 11400 },
  ],
  currentPrice: 400,
  averageOccupancy: 64,
  projectedIncrease: 35
};

const MOCK_MARKET_INTELLIGENCE = {
  touristOrigin: [
    { state: 'São Paulo', percentage: 45, value: 4500 },
    { state: 'Paraná', percentage: 30, value: 3000 },
    { state: 'Santa Catarina', percentage: 15, value: 1500 },
    { state: 'Rio de Janeiro', percentage: 7, value: 700 },
    { state: 'Outros', percentage: 3, value: 300 },
  ],
  touristProfile: {
    ageRange: '35-50 anos',
    income: 'Classe A/B',
    interests: ['Ecoturismo', 'Aventura', 'Gastronomia'],
    transport: 'Carro próprio (85%)',
    stayDuration: '3-4 dias',
    bookingWindow: '15-30 dias antes'
  },
  marketingROI: [
    { channel: 'Google Ads', investment: 2000, return: 12000, roi: 6.0 },
    { channel: 'Instagram', investment: 800, return: 4800, roi: 6.0 },
    { channel: 'Facebook', investment: 500, return: 2000, roi: 4.0 },
    { channel: 'Email', investment: 200, return: 1500, roi: 7.5 },
  ]
};

const MOCK_COMPETITIVE_BENCHMARK = {
  yourPerformance: {
    occupancy: 68,
    avgPrice: 420,
    rating: 4.3,
    avgStay: 2.8
  },
  marketAverage: {
    occupancy: 72,
    avgPrice: 390,
    rating: 4.5,
    avgStay: 3.2
  },
  competitors: [
    { name: 'Concorrente A', occupancy: 75, avgPrice: 380, rating: 4.6 },
    { name: 'Concorrente B', occupancy: 70, avgPrice: 410, rating: 4.4 },
    { name: 'Concorrente C', occupancy: 71, avgPrice: 385, rating: 4.5 },
  ]
};

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

interface ViaJARIntelligenceProps {
  initialTab?: 'revenue' | 'market' | 'benchmark';
  hideHeader?: boolean; // Para quando renderizado dentro de outro dashboard
}

export default function ViaJARIntelligence(props: ViaJARIntelligenceProps = {}) {
  const { initialTab = 'revenue', hideHeader = false } = props;
  const [activeTab, setActiveTab] = useState(initialTab);
  const { businessType } = useBusinessType();
  const { userProfile, user } = useAuth();
  const { toast } = useToast();
  const [regionalData, setRegionalData] = useState<any>(null);
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [loadingConsent, setLoadingConsent] = useState(true);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(['revenue', 'occupancy', 'pricing', 'ratings']);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [savingConsent, setSavingConsent] = useState(false);
  const [localTouristData, setLocalTouristData] = useState<any>(null);
  const [loadingLocalData, setLoadingLocalData] = useState(false);
  
  // Atualizar aba quando initialTab mudar
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Verificar consentimento
  useEffect(() => {
    const checkConsent = async () => {
      if (!user?.id) {
        setLoadingConsent(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('data_sharing_consents')
          .select('consent_given, data_types_shared, revoked_at')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data && data.consent_given && !data.revoked_at) {
          setHasConsent(true);
          setSelectedDataTypes(data.data_types_shared || []);
        } else {
          setHasConsent(false);
        }
      } catch (error) {
        console.error('Erro ao verificar consentimento:', error);
        setHasConsent(false);
      } finally {
        setLoadingConsent(false);
      }
    };

    checkConsent();
  }, [user]);

  // Carregar dados regionais
  useEffect(() => {
    const loadRegionalData = async () => {
      // Detectar estado do usuário (por enquanto, assumir MS)
      // TODO: Obter do perfil do usuário
      const userState = 'MS'; // userProfile?.state || 'MS';
      
      try {
        const data = await regionalDataIntegrationService.getRegionalData(userState, businessType || undefined);
        setRegionalData(data);
      } catch (error) {
        console.error('Erro ao carregar dados regionais:', error);
      }
    };

    loadRegionalData();
  }, [businessType, userProfile]);

  // Carregar dados locais de turistas
  useEffect(() => {
    const loadLocalTouristData = async () => {
      if (!userProfile?.city_id) {
        setLoadingLocalData(false);
        return;
      }

      setLoadingLocalData(true);
      try {
        // Buscar dados agregados de turistas da região
        const { data: profiles, error } = await supabase
          .from('user_profiles')
          .select('age_range, gender, origin_state, travel_purpose, preferences')
          .eq('city_id', userProfile.city_id)
          .or('user_type.eq.turista,user_type.eq.tourist');

        if (error) throw error;

        if (!profiles || profiles.length === 0) {
          setLocalTouristData(null);
          setLoadingLocalData(false);
          return;
        }

        // Processar dados
        const ageCounts: Record<string, number> = {};
        const genderCounts: Record<string, number> = {};
        const originCounts: Record<string, number> = {};
        const purposeCounts: Record<string, number> = {};
        const preferenceCounts: Record<string, number> = {};

        profiles.forEach((profile: any) => {
          const age = profile.age_range;
          const gender = profile.gender;
          const origin = profile.origin_state || profile.state;
          const purpose = profile.travel_purpose;
          const preferences = profile.preferences || profile.travel_motives || [];

          if (age) ageCounts[age] = (ageCounts[age] || 0) + 1;
          if (gender) genderCounts[gender] = (genderCounts[gender] || 0) + 1;
          if (origin) originCounts[origin] = (originCounts[origin] || 0) + 1;
          if (purpose) purposeCounts[purpose] = (purposeCounts[purpose] || 0) + 1;
          
          if (Array.isArray(preferences)) {
            preferences.forEach((pref: string) => {
              preferenceCounts[pref] = (preferenceCounts[pref] || 0) + 1;
            });
          }
        });

        const total = profiles.length;
        const calculatePercentage = (count: number) => total > 0 ? (count / total) * 100 : 0;

        setLocalTouristData({
          total_tourists: total,
          age_distribution: Object.entries(ageCounts)
            .map(([age_range, count]) => ({ age_range, count, percentage: calculatePercentage(count) }))
            .sort((a, b) => b.count - a.count),
          gender_distribution: Object.entries(genderCounts)
            .map(([gender, count]) => ({ gender, count, percentage: calculatePercentage(count) }))
            .sort((a, b) => b.count - a.count),
          origin_distribution: Object.entries(originCounts)
            .map(([origin, count]) => ({ origin, count, percentage: calculatePercentage(count) }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
          travel_purpose_distribution: Object.entries(purposeCounts)
            .map(([purpose, count]) => ({ purpose, count, percentage: calculatePercentage(count) }))
            .sort((a, b) => b.count - a.count),
          preferences_distribution: Object.entries(preferenceCounts)
            .map(([preference, count]) => ({ preference, count, percentage: calculatePercentage(count) }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
        });
      } catch (error) {
        console.error('Erro ao carregar dados locais de turistas:', error);
        setLocalTouristData(null);
      } finally {
        setLoadingLocalData(false);
      }
    };

    loadLocalTouristData();
  }, [userProfile]);

  // Salvar consentimento
  const handleSaveConsent = async () => {
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return;
    }

    if (selectedDataTypes.length === 0) {
      toast({
        title: 'Selecione tipos de dados',
        description: 'Selecione pelo menos um tipo de dado para compartilhar',
        variant: 'destructive',
      });
      return;
    }

    if (!hasReadTerms) {
      toast({
        title: 'Leia os termos',
        description: 'Por favor, leia e aceite os termos de consentimento',
        variant: 'destructive',
      });
      return;
    }

    setSavingConsent(true);
    try {
      const { error } = await supabase
        .from('data_sharing_consents')
        .upsert({
          user_id: user.id,
          consent_given: true,
          consent_date: new Date().toISOString(),
          data_types_shared: selectedDataTypes,
          revoked_at: null,
          consent_version: '1.0',
          terms_url: window.location.origin + '/termos-consentimento-benchmarking',
          ip_address: null,
          user_agent: navigator.userAgent,
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      setHasConsent(true);
      toast({
        title: 'Consentimento registrado!',
        description: 'Agora você pode acessar o Competitive Benchmark.',
      });
    } catch (error: any) {
      console.error('Erro ao salvar consentimento:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o consentimento. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSavingConsent(false);
    }
  };

  return (
    <div className={`${hideHeader ? '' : 'min-h-screen'} bg-gradient-to-br from-background via-background to-purple-50/30 dark:to-purple-950/20`}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header - Oculto se hideHeader for true */}
        {!hideHeader && (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Brain className="h-8 w-8 text-purple-600" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  ViaJAR Intelligence Suite
                </h1>
              </div>
              <p className="text-muted-foreground">
                Inteligência artificial para decisões estratégicas do seu negócio
              </p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Powered by IA
            </Badge>
          </div>
        )}

        {/* Alert sobre dados ALUMIA - Oculto se hideHeader for true */}
        {!hideHeader && (
        <Alert className="border-purple-200 bg-purple-50/50">
          <AlertCircle className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-sm">
            <strong>Dados de Demonstração:</strong> Estas análises usam dados simulados. 
            Quando conectado à <strong>ALUMIA (Plataforma do Governo MS)</strong>, 
            você terá acesso a dados reais e oficiais do mercado turístico.
          </AlertDescription>
        </Alert>
        )}

        {/* Quando hideHeader=true, mostrar apenas o conteúdo da aba específica, sem tabs */}
        {hideHeader ? (
          <>
            {/* TAB 1: Revenue Optimizer */}
            {activeTab === 'revenue' && (
              <SectionWrapper 
                variant="default" 
                title="Revenue Optimizer"
                subtitle="Otimize sua receita com insights inteligentes baseados em dados reais"
              >
                {/* Mensagem quando não houver business_type */}
                {!businessType && (
                  <CardBox className="mb-6 border-amber-200 bg-amber-50">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-amber-900 mb-1">Configure seu tipo de negócio</p>
                        <p className="text-sm text-amber-700">
                          Complete o onboarding para ver métricas personalizadas para o seu tipo de negócio.
                        </p>
                      </div>
                    </div>
                  </CardBox>
                )}

                {/* Cards de métricas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <CardBox>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-slate-600">
                        {businessType === 'hotel' || businessType === 'pousada' 
                          ? 'Preço Atual' 
                          : businessType === 'restaurante' 
                          ? 'Ticket Médio'
                          : businessType === 'agencia'
                          ? 'Valor Médio do Pacote'
                          : 'Preço Atual'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800">R$ {MOCK_REVENUE_PREDICTION.currentPrice}</div>
                    <p className="text-xs text-slate-500 mt-1">
                      {businessType === 'hotel' || businessType === 'pousada' 
                        ? 'por noite' 
                        : businessType === 'restaurante' 
                        ? 'por pedido'
                        : businessType === 'agencia'
                        ? 'por pacote'
                        : 'atual'}
                    </p>
                  </CardBox>

                  <CardBox>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-slate-600">Aumento Projetado</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
                      +{MOCK_REVENUE_PREDICTION.projectedIncrease}%
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">em receita anual</p>
                  </CardBox>

                  {isMetricRelevant(businessType, 'occupancy_rate') && (
                    <CardBox>
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-600">
                          {getBusinessMetricLabel(businessType, 'occupancy_rate') || 'Ocupação Média'}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {MOCK_REVENUE_PREDICTION.averageOccupancy}%
                      </div>
                      <p className="text-xs text-slate-500 mt-1">próximos 7 dias</p>
                    </CardBox>
                  )}

                  <CardBox>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-slate-600">Melhor Dia</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-600">18/Out</div>
                    <p className="text-xs text-slate-500 mt-1">R$ 650 sugerido</p>
                  </CardBox>
                </div>

                {/* Gráfico de previsão */}
                <CardBox className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Previsão de Demanda e Precificação Dinâmica</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    IA analisa dados históricos, eventos programados e clima para sugerir preços otimizados
                  </p>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={MOCK_REVENUE_PREDICTION.nextDays}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" label={{ value: 'Ocupação (%)', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: 'Preço (R$)', angle: 90, position: 'insideRight' }} />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="occupancy" stroke="#8B5CF6" name="Ocupação Prevista (%)" strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="suggestedPrice" stroke="#10B981" name="Preço Sugerido (R$)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardBox>

                {/* Recomendações da IA */}
                <CardBox>
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    <h3 className="text-lg font-semibold text-slate-800">Recomendações Estratégicas da IA</h3>
                  </div>
                  <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <ArrowUpRight className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Alta Demanda: 17-19 de Outubro</p>
                    <p className="text-sm text-green-700 mt-1">
                      Evento "Festival de Ecoturismo" na região. Aumente preços para R$ 580-650. 
                      Contrate 2 funcionários extras para lavanderia e café da manhã.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Baixa Temporada: 20-21 de Outubro</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Ofereça promoção "3 diárias com 20% off" para aumentar ocupação. 
                      Aproveite para fazer manutenções preventivas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Atenção: Preço Abaixo do Mercado</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Seu preço atual (R$ 400) está 10% abaixo da média regional (R$ 440). 
                      Considere reajuste gradual de +10% sem perder competitividade.
                    </p>
                  </div>
                </div>
                </div>
              </CardBox>
            </SectionWrapper>
            )}

            {/* TAB 2: Market Intelligence */}
            {activeTab === 'market' && (
              <SectionWrapper 
                variant="default" 
                title="Market Intelligence"
                subtitle="Análise de mercado e tendências baseadas em dados reais"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Origem dos turistas */}
                  <CardBox className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-slate-800">Origem dos Turistas</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      Dados coletados dos CATs (Centros de Atendimento ao Turista) via ALUMIA
                    </p>
                    <div className="relative z-0">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={MOCK_MARKET_INTELLIGENCE.touristOrigin}
                            dataKey="percentage"
                            nameKey="state"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={(entry) => `${entry.state} (${entry.percentage}%)`}
                          >
                            {MOCK_MARKET_INTELLIGENCE.touristOrigin.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardBox>

                  {/* Perfil do turista - Expandido com dados locais e regionais */}
                  <CardBox>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-slate-800">Perfil do Turista</h3>
                    </div>
                      {localTouristData && localTouristData.total_tourists > 0 && (
                        <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                          Dados Locais
                        </Badge>
                      )}
                    </div>

                    {loadingLocalData ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                        <p className="text-sm text-slate-600">Carregando dados locais...</p>
                      </div>
                    ) : localTouristData && localTouristData.total_tourists > 0 ? (
                      <>
                        {/* Dados Locais - Versão Compacta */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <h4 className="text-sm font-semibold text-slate-800">Dados Locais</h4>
                            <Badge variant="secondary" className="text-xs">
                              {localTouristData.total_tourists} turistas
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {localTouristData.age_distribution.length > 0 && (
                              <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                <p className="text-xs text-slate-600 mb-0.5">Idade</p>
                                <p className="text-sm font-semibold text-blue-700">
                                  {localTouristData.age_distribution[0].age_range}
                                </p>
                              </div>
                            )}
                            {localTouristData.gender_distribution.length > 0 && (
                              <div className="p-2 bg-purple-50 rounded border border-purple-200">
                                <p className="text-xs text-slate-600 mb-0.5">Gênero</p>
                                <p className="text-sm font-semibold text-purple-700">
                                  {localTouristData.gender_distribution[0].gender}
                                </p>
                              </div>
                            )}
                            {localTouristData.origin_distribution.length > 0 && (
                              <div className="p-2 bg-green-50 rounded border border-green-200">
                                <p className="text-xs text-slate-600 mb-0.5">Origem</p>
                                <p className="text-sm font-semibold text-green-700 truncate" title={localTouristData.origin_distribution[0].origin}>
                                  {localTouristData.origin_distribution[0].origin}
                                </p>
                              </div>
                            )}
                            {localTouristData.travel_purpose_distribution.length > 0 && (
                              <div className="p-2 bg-orange-50 rounded border border-orange-200">
                                <p className="text-xs text-slate-600 mb-0.5">Propósito</p>
                                <p className="text-sm font-semibold text-orange-700 truncate" title={localTouristData.travel_purpose_distribution[0].purpose}>
                                  {localTouristData.travel_purpose_distribution[0].purpose}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Separador */}
                        <div className="border-t border-slate-200 my-3"></div>
                      </>
                    ) : null}

                    {/* Dados Regionais (ALUMIA) - Sempre visível */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4 text-purple-600" />
                        <h4 className="text-sm font-semibold text-slate-800">Perfil Regional</h4>
                        <Badge variant="outline" className="text-xs">
                          ALUMIA
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">
                        Dados oficiais do estado/região
                      </p>
                      <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-xs font-medium text-slate-700">Faixa Etária:</span>
                          <span className="text-xs text-purple-600 font-semibold">
                      {MOCK_MARKET_INTELLIGENCE.touristProfile.ageRange}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-xs font-medium text-slate-700">Renda:</span>
                          <span className="text-xs text-purple-600 font-semibold">
                      {MOCK_MARKET_INTELLIGENCE.touristProfile.income}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-xs font-medium text-slate-700">Transporte:</span>
                          <span className="text-xs text-purple-600 font-semibold">
                      {MOCK_MARKET_INTELLIGENCE.touristProfile.transport}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-xs font-medium text-slate-700">Permanência:</span>
                          <span className="text-xs text-purple-600 font-semibold">
                      {MOCK_MARKET_INTELLIGENCE.touristProfile.stayDuration}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-xs font-medium text-slate-700">Reserva:</span>
                          <span className="text-xs text-purple-600 font-semibold">
                      {MOCK_MARKET_INTELLIGENCE.touristProfile.bookingWindow}
                    </span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                          <span className="text-xs font-medium text-slate-700">Interesses:</span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {MOCK_MARKET_INTELLIGENCE.touristProfile.interests.map((interest, i) => (
                              <Badge key={i} variant="secondary" className="rounded-full text-xs px-1.5 py-0.5">
                                {interest}
                              </Badge>
                      ))}
                    </div>
                  </div>
                      </div>
                      {(!localTouristData || localTouristData.total_tourists === 0) && (
                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                          💡 Conforme mais turistas se cadastrarem, você verá dados locais aqui.
                        </div>
                      )}
                    </div>
                  </CardBox>
                </div>

                {/* ROI de Marketing */}
                <CardBox className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-slate-800">ROI de Marketing por Canal</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Onde investir seu orçamento de marketing baseado em dados reais
                  </p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={MOCK_MARKET_INTELLIGENCE.marketingROI}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="channel" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="investment" fill="#EF4444" name="Investimento (R$)" />
                      <Bar dataKey="return" fill="#10B981" name="Retorno (R$)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardBox>

                {/* Recomendações de Marketing */}
                <CardBox>
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    <h3 className="text-lg font-semibold text-slate-800">Recomendações de Marketing (IA)</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <ArrowUpRight className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Foque em São Paulo (45% do público)</p>
                        <p className="text-sm text-green-700 mt-1">
                          Invista R$ 1.400 (70% do orçamento) em anúncios segmentados para SP capital. 
                          Use palavras-chave: "ecoturismo perto de SP", "aventura fim de semana".
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Janela de Decisão: 15-30 dias</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Turistas reservam com 15-30 dias de antecedência. Intensifique campanhas 
                          3-4 semanas antes de eventos importantes na região.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-purple-900">Email Marketing tem maior ROI (7.5x)</p>
                        <p className="text-sm text-purple-700 mt-1">
                          Com apenas R$ 200 de investimento, email marketing gera R$ 1.500 de retorno. 
                          Crie newsletter mensal com dicas de turismo e promoções exclusivas.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardBox>
              </SectionWrapper>
            )}

            {/* TAB 3: Competitive Benchmark */}
            {activeTab === 'benchmark' && (
              <SectionWrapper 
                variant="default" 
                title="Competitive Benchmark"
                subtitle="Compare-se com seus concorrentes usando dados reais"
              >
                {/* Verificar consentimento */}
                {loadingConsent ? (
                  <CardBox className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Verificando consentimento...</p>
                  </CardBox>
                ) : !hasConsent ? (
                  <CardBox className="p-8 bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <div className="max-w-2xl mx-auto space-y-6 text-center">
                      <ShieldCheck className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">
                        Consentimento Necessário
                      </h3>
                      <p className="text-slate-600 mb-4">
                        Para acessar o Competitive Benchmark, você precisa ter aceito o termo de consentimento durante o onboarding.
                      </p>
                      <p className="text-sm text-slate-500 mb-6">
                        Se você ainda não aceitou o termo, acesse as Configurações da sua conta para revisar e aceitar o termo de consentimento.
                      </p>
                      <div className="space-y-3">
                        <p className="text-sm text-slate-500">
                          Acesse as Configurações da sua conta (ícone de engrenagem) para revisar e aceitar o termo de consentimento.
                        </p>
                        <Button
                          onClick={() => {
                            // Redirecionar para dashboard abrindo configurações na aba de consentimento
                            window.location.href = '/viajar/dashboard?settingsTab=consent';
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Ir para Configurações
                        </Button>
                      </div>
                    </div>
                  </CardBox>
                ) : (
                  <>
                {/* Comparação você vs mercado */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {isMetricRelevant(businessType, 'occupancy_rate') && (
                    <CardBox>
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-600">
                          {getBusinessMetricLabel(businessType, 'occupancy_rate') || 'Taxa de Ocupação'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-slate-500">Você</p>
                          <p className="text-xl font-bold text-slate-800">{MOCK_COMPETITIVE_BENCHMARK.yourPerformance.occupancy}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Média do Mercado</p>
                          <p className="text-lg font-semibold text-slate-600">{MOCK_COMPETITIVE_BENCHMARK.marketAverage.occupancy}%</p>
                        </div>
                        <Badge variant={MOCK_COMPETITIVE_BENCHMARK.yourPerformance.occupancy < MOCK_COMPETITIVE_BENCHMARK.marketAverage.occupancy ? 'destructive' : 'default'} className="rounded-full text-xs px-2 py-0.5">
                          {MOCK_COMPETITIVE_BENCHMARK.yourPerformance.occupancy < MOCK_COMPETITIVE_BENCHMARK.marketAverage.occupancy ? (
                            <>-4pp abaixo <ArrowDownRight className="h-3 w-3 ml-1" /></>
                          ) : (
                            <>+4pp acima <ArrowUpRight className="h-3 w-3 ml-1" /></>
                          )}
                        </Badge>
                      </div>
                    </CardBox>
                  )}

                  <CardBox>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-600">
                        {businessType === 'hotel' || businessType === 'pousada' 
                          ? 'Preço Médio (ADR)'
                          : businessType === 'restaurante' 
                          ? 'Ticket Médio'
                          : businessType === 'agencia'
                          ? 'Valor Médio do Pacote'
                          : 'Preço Médio'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-slate-500">Você</p>
                        <p className="text-xl font-bold text-slate-800">R$ {MOCK_COMPETITIVE_BENCHMARK.yourPerformance.avgPrice}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Média do Mercado</p>
                        <p className="text-lg font-semibold text-slate-600">R$ {MOCK_COMPETITIVE_BENCHMARK.marketAverage.avgPrice}</p>
                      </div>
                      <Badge variant="default" className="rounded-full text-xs px-2 py-0.5 bg-green-600">
                        +7.7% acima <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Badge>
                    </div>
                  </CardBox>

                  <CardBox>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-600">Avaliação</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-slate-500">Você</p>
                        <p className="text-xl font-bold text-slate-800">{MOCK_COMPETITIVE_BENCHMARK.yourPerformance.rating} ⭐</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Média do Mercado</p>
                        <p className="text-lg font-semibold text-slate-600">{MOCK_COMPETITIVE_BENCHMARK.marketAverage.rating} ⭐</p>
                      </div>
                      <Badge variant="destructive" className="rounded-full text-xs px-2 py-0.5">
                        -0.2 abaixo <ArrowDownRight className="h-3 w-3 ml-1" />
                      </Badge>
                    </div>
                  </CardBox>

                  {(businessType === 'hotel' || businessType === 'pousada') && (
                    <CardBox>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-600">
                          {getBusinessMetricLabel(businessType, 'avg_stay') || 'Permanência Média'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-slate-500">Você</p>
                          <p className="text-xl font-bold text-slate-800">{MOCK_COMPETITIVE_BENCHMARK.yourPerformance.avgStay} dias</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Média do Mercado</p>
                          <p className="text-lg font-semibold text-slate-600">{MOCK_COMPETITIVE_BENCHMARK.marketAverage.avgStay} dias</p>
                        </div>
                        <Badge variant="destructive" className="rounded-full text-xs px-2 py-0.5">
                          -0.4 dias <ArrowDownRight className="h-3 w-3 ml-1" />
                        </Badge>
                      </div>
                    </CardBox>
                  )}
                </div>

                {/* Tabela de concorrentes */}
                <CardBox className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Comparação Detalhada com Concorrentes</h3>
                  </div>
                      <p className="text-sm text-slate-600 mb-4">
                        Dados agregados e anonimizados de estabelecimentos similares na região
                      </p>
                      {regionalData && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-700">
                            <strong>Fonte:</strong> {regionalData.source === 'ALUMIA' 
                              ? 'ALUMIA - Dados oficiais agregados e anonimizados'
                              : 'Google Scholar - Pesquisa acadêmica e estudos de mercado'}
                          </p>
                        </div>
                      )}
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-xs uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left">Estabelecimento</th>
                          <th className="px-6 py-3 text-center">Ocupação</th>
                          <th className="px-6 py-3 text-center">Preço Médio</th>
                          <th className="px-6 py-3 text-center">Avaliação</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-purple-50 border-b border-purple-200 font-semibold">
                          <td className="px-6 py-4">Seu Estabelecimento</td>
                          <td className="px-6 py-4 text-center">{MOCK_COMPETITIVE_BENCHMARK.yourPerformance.occupancy}%</td>
                          <td className="px-6 py-4 text-center">R$ {MOCK_COMPETITIVE_BENCHMARK.yourPerformance.avgPrice}</td>
                          <td className="px-6 py-4 text-center">{MOCK_COMPETITIVE_BENCHMARK.yourPerformance.rating} ⭐</td>
                        </tr>
                        {MOCK_COMPETITIVE_BENCHMARK.competitors.map((comp, i) => (
                          <tr key={i} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-500">{comp.name}</td>
                            <td className="px-6 py-4 text-center text-gray-600">{comp.occupancy}%</td>
                            <td className="px-6 py-4 text-center text-gray-600">R$ {comp.avgPrice}</td>
                            <td className="px-6 py-4 text-center text-gray-600">{comp.rating} ⭐</td>
                          </tr>
                        ))}
                        <tr className="bg-gray-100 font-semibold">
                          <td className="px-6 py-4">Média do Mercado</td>
                          <td className="px-6 py-4 text-center">{MOCK_COMPETITIVE_BENCHMARK.marketAverage.occupancy}%</td>
                          <td className="px-6 py-4 text-center">R$ {MOCK_COMPETITIVE_BENCHMARK.marketAverage.avgPrice}</td>
                          <td className="px-6 py-4 text-center">{MOCK_COMPETITIVE_BENCHMARK.marketAverage.rating} ⭐</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardBox>

                {/* Insights e recomendações */}
                <CardBox>
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    <h3 className="text-lg font-semibold text-slate-800">Insights e Oportunidades de Melhoria</h3>
                  </div>
                  <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Ocupação 4pp abaixo da média</p>
                    <p className="text-sm text-red-700 mt-1">
                      Sua ocupação (68%) está abaixo do mercado (72%). Considere: 
                      (1) Reduzir preço em 5-10% temporariamente, ou 
                      (2) Investir mais em marketing digital, ou 
                      (3) Criar promoções para dias de semana.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <TrendingDown className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Avaliação 0.2 pontos abaixo</p>
                    <p className="text-sm text-red-700 mt-1">
                      Principais reclamações no mercado: limpeza e atendimento. 
                      Foque em treinamento da equipe e inspeção de qualidade rigorosa.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Calendar className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Hóspedes ficam menos tempo (-0.4 dias)</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Ofereça pacotes de 3+ diárias com 15-20% de desconto. 
                      Crie roteiros e experiências exclusivas para incentivar permanência maior.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <ArrowUpRight className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Preço 7.7% acima da média - Ótimo!</p>
                    <p className="text-sm text-green-700 mt-1">
                      Você consegue cobrar mais que a média mantendo ocupação competitiva. 
                      Isso indica valor percebido alto. Continue investindo em diferenciais.
                    </p>
                  </div>
                </div>
                  </div>
                </CardBox>
                  </>
                )}
              </SectionWrapper>
            )}
          </>
        ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-background/50 backdrop-blur-sm">
            <TabsTrigger value="revenue" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue Optimizer
            </TabsTrigger>
            <TabsTrigger value="market" className="gap-2">
              <Users className="h-4 w-4" />
              Market Intelligence
            </TabsTrigger>
            <TabsTrigger value="benchmark" className="gap-2">
              <Target className="h-4 w-4" />
              Competitive Benchmark
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Revenue Optimizer */}
          <TabsContent value="revenue" className="mt-6">
            <SectionWrapper 
              variant="default" 
              title="Revenue Optimizer"
              subtitle="Otimize sua receita com insights inteligentes baseados em dados reais"
            >
              {/* Cards de métricas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <CardBox>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-slate-600">Preço Atual</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">R$ {MOCK_REVENUE_PREDICTION.currentPrice}</div>
                  <p className="text-xs text-slate-500 mt-1">por noite</p>
                </CardBox>

                <CardBox>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-slate-600">Aumento Projetado</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
                    +{MOCK_REVENUE_PREDICTION.projectedIncrease}%
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">em receita anual</p>
                </CardBox>

                <CardBox>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-600">Ocupação Média</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {MOCK_REVENUE_PREDICTION.averageOccupancy}%
                  </div>
                  <p className="text-xs text-slate-500 mt-1">próximos 7 dias</p>
                </CardBox>

                <CardBox>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-slate-600">Melhor Dia</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-600">18/Out</div>
                  <p className="text-xs text-slate-500 mt-1">R$ 650 sugerido</p>
                </CardBox>
              </div>

              {/* Gráfico de previsão */}
              <CardBox className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-slate-800">Previsão de Demanda e Precificação Dinâmica</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  IA analisa dados históricos, eventos programados e clima para sugerir preços otimizados
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={MOCK_REVENUE_PREDICTION.nextDays}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" label={{ value: 'Ocupação (%)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Preço (R$)', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="occupancy" stroke="#8B5CF6" name="Ocupação Prevista (%)" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="suggestedPrice" stroke="#10B981" name="Preço Sugerido (R$)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardBox>

              {/* Recomendações da IA */}
              <CardBox>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-slate-800">Recomendações Estratégicas da IA</h3>
                </div>
                <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <ArrowUpRight className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Alta Demanda: 17-19 de Outubro</p>
                    <p className="text-sm text-green-700 mt-1">
                      Evento "Festival de Ecoturismo" na região. Aumente preços para R$ 580-650. 
                      Contrate 2 funcionários extras para lavanderia e café da manhã.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Baixa Temporada: 20-21 de Outubro</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Ofereça promoção "3 diárias com 20% off" para aumentar ocupação. 
                      Aproveite para fazer manutenções preventivas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Atenção: Preço Abaixo do Mercado</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Seu preço atual (R$ 400) está 10% abaixo da média regional (R$ 440). 
                      Considere reajuste gradual de +10% sem perder competitividade.
                    </p>
                  </div>
                </div>
                </div>
              </CardBox>
            </SectionWrapper>
          </TabsContent>

          {/* TAB 2: Market Intelligence */}
          <TabsContent value="market" className="mt-6">
            <SectionWrapper 
              variant="default" 
              title="Market Intelligence"
              subtitle="Análise de mercado e tendências baseadas em dados reais"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Origem dos turistas */}
                <CardBox>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Origem dos Turistas</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Dados coletados dos CATs (Centros de Atendimento ao Turista) via ALUMIA
                  </p>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={MOCK_MARKET_INTELLIGENCE.touristOrigin}
                        dataKey="percentage"
                        nameKey="state"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry) => `${entry.state} (${entry.percentage}%)`}
                      >
                        {MOCK_MARKET_INTELLIGENCE.touristOrigin.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardBox>

                {/* Perfil do turista - Expandido com dados locais e regionais */}
                <CardBox>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-slate-800">Perfil do Turista</h3>
                  </div>
                    {localTouristData && localTouristData.total_tourists > 0 && (
                      <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                        Dados Locais
                      </Badge>
                    )}
                  </div>

                  {loadingLocalData ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                      <p className="text-sm text-slate-600">Carregando dados locais...</p>
                    </div>
                  ) : localTouristData && localTouristData.total_tourists > 0 ? (
                    <>
                      {/* Dados Locais - Versão Compacta */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <h4 className="text-sm font-semibold text-slate-800">Dados Locais</h4>
                          <Badge variant="secondary" className="text-xs">
                            {localTouristData.total_tourists} turistas
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {localTouristData.age_distribution.length > 0 && (
                            <div className="p-2 bg-blue-50 rounded border border-blue-200">
                              <p className="text-xs text-slate-600 mb-0.5">Idade</p>
                              <p className="text-sm font-semibold text-blue-700">
                                {localTouristData.age_distribution[0].age_range}
                              </p>
                            </div>
                          )}
                          {localTouristData.gender_distribution.length > 0 && (
                            <div className="p-2 bg-purple-50 rounded border border-purple-200">
                              <p className="text-xs text-slate-600 mb-0.5">Gênero</p>
                              <p className="text-sm font-semibold text-purple-700">
                                {localTouristData.gender_distribution[0].gender}
                              </p>
                            </div>
                          )}
                          {localTouristData.origin_distribution.length > 0 && (
                            <div className="p-2 bg-green-50 rounded border border-green-200">
                              <p className="text-xs text-slate-600 mb-0.5">Origem</p>
                              <p className="text-sm font-semibold text-green-700 truncate" title={localTouristData.origin_distribution[0].origin}>
                                {localTouristData.origin_distribution[0].origin}
                              </p>
                            </div>
                          )}
                          {localTouristData.travel_purpose_distribution.length > 0 && (
                            <div className="p-2 bg-orange-50 rounded border border-orange-200">
                              <p className="text-xs text-slate-600 mb-0.5">Propósito</p>
                              <p className="text-sm font-semibold text-orange-700 truncate" title={localTouristData.travel_purpose_distribution[0].purpose}>
                                {localTouristData.travel_purpose_distribution[0].purpose}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Separador */}
                      <div className="border-t border-slate-200 my-3"></div>
                    </>
                  ) : null}

                  {/* Dados Regionais (ALUMIA) - Sempre visível */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <h4 className="text-sm font-semibold text-slate-800">Perfil Regional</h4>
                      <Badge variant="outline" className="text-xs">
                        ALUMIA
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                      Dados oficiais do estado/região
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-xs font-medium text-slate-700">Faixa Etária:</span>
                        <span className="text-xs text-purple-600 font-semibold">
                          {MOCK_MARKET_INTELLIGENCE.touristProfile.ageRange}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-xs font-medium text-slate-700">Renda:</span>
                        <span className="text-xs text-purple-600 font-semibold">
                          {MOCK_MARKET_INTELLIGENCE.touristProfile.income}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-xs font-medium text-slate-700">Transporte:</span>
                        <span className="text-xs text-purple-600 font-semibold">
                          {MOCK_MARKET_INTELLIGENCE.touristProfile.transport}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-xs font-medium text-slate-700">Permanência:</span>
                        <span className="text-xs text-purple-600 font-semibold">
                          {MOCK_MARKET_INTELLIGENCE.touristProfile.stayDuration}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-xs font-medium text-slate-700">Reserva:</span>
                        <span className="text-xs text-purple-600 font-semibold">
                          {MOCK_MARKET_INTELLIGENCE.touristProfile.bookingWindow}
                        </span>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="text-xs font-medium text-slate-700">Interesses:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {MOCK_MARKET_INTELLIGENCE.touristProfile.interests.map((interest, i) => (
                            <Badge key={i} variant="secondary" className="rounded-full text-xs px-1.5 py-0.5">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    {(!localTouristData || localTouristData.total_tourists === 0) && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                        💡 Conforme mais turistas se cadastrarem, você verá dados locais aqui.
                      </div>
                    )}
                  </div>
                </CardBox>
              </div>

              {/* ROI de Marketing */}
              <CardBox className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-slate-800">ROI de Marketing por Canal</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Onde investir seu orçamento de marketing baseado em dados reais
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={MOCK_MARKET_INTELLIGENCE.marketingROI}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="investment" fill="#EF4444" name="Investimento (R$)" />
                    <Bar dataKey="return" fill="#10B981" name="Retorno (R$)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardBox>

              {/* Recomendações de Marketing */}
              <CardBox>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-slate-800">Recomendações de Marketing (IA)</h3>
                </div>
                <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <ArrowUpRight className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Foque em São Paulo (45% do público)</p>
                    <p className="text-sm text-green-700 mt-1">
                      Invista R$ 1.400 (70% do orçamento) em anúncios segmentados para SP capital. 
                      Use palavras-chave: "ecoturismo perto de SP", "aventura fim de semana".
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Janela de Decisão: 15-30 dias</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Turistas reservam com 15-30 dias de antecedência. Intensifique campanhas 
                      3-4 semanas antes de eventos importantes na região.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-900">Email Marketing tem maior ROI (7.5x)</p>
                    <p className="text-sm text-purple-700 mt-1">
                      Com apenas R$ 200 de investimento, email marketing gera R$ 1.500 de retorno. 
                      Crie newsletter mensal com dicas de turismo e promoções exclusivas.
                    </p>
                  </div>
                </div>
                </div>
              </CardBox>
            </SectionWrapper>
          </TabsContent>

          {/* TAB 3: Competitive Benchmark */}
          <TabsContent value="benchmark" className="mt-6">
            <SectionWrapper 
              variant="default" 
              title="Competitive Benchmark"
              subtitle="Compare-se com seus concorrentes usando dados reais"
            >
              {/* Verificar consentimento */}
              {loadingConsent ? (
                <CardBox className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Verificando consentimento...</p>
                </CardBox>
              ) : !hasConsent ? (
                <CardBox className="p-8 bg-gradient-to-br from-blue-50 to-white border-blue-200">
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div className="text-center">
                      <ShieldCheck className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">
                        Consentimento para Benchmarking Competitivo
                      </h3>
                      <p className="text-slate-600">
                        Para acessar o Competitive Benchmark, precisamos do seu consentimento para compartilhar dados agregados e anonimizados.
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-3">Selecione os tipos de dados que você permite compartilhar:</h4>
                        <div className="space-y-2">
                          {[
                            { id: 'revenue', label: 'Receita (agregada e anonimizada)' },
                            { id: 'occupancy', label: 'Taxa de Ocupação (agregada e anonimizada)' },
                            { id: 'pricing', label: 'Preço Médio (agregado e anonimizado)' },
                            { id: 'ratings', label: 'Avaliações (agregadas e anonimizadas)' },
                            { id: 'stay_duration', label: 'Duração Média da Estadia (agregada e anonimizada)' },
                          ].map((option) => (
                            <div key={option.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`data-type-mobile-${option.id}`}
                                checked={selectedDataTypes.includes(option.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedDataTypes([...selectedDataTypes, option.id]);
                                  } else {
                                    setSelectedDataTypes(selectedDataTypes.filter(id => id !== option.id));
                                  }
                                }}
                              />
                              <Label htmlFor={`data-type-mobile-${option.id}`} className="text-sm text-slate-700 cursor-pointer">
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <Checkbox
                          id="read-terms-mobile"
                          checked={hasReadTerms}
                          onCheckedChange={(checked) => setHasReadTerms(checked as boolean)}
                        />
                        <div className="flex-1">
                          <Label htmlFor="read-terms-mobile" className="text-sm font-medium text-slate-700 cursor-pointer">
                            Li e concordo com os{' '}
                            <a href="/termos-consentimento-benchmarking" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Termos de Consentimento para Benchmarking Competitivo
                            </a>
                          </Label>
                          <p className="text-xs text-slate-600 mt-2">
                            Seus dados serão utilizados de forma agregada e anonimizada para gerar insights de mercado e comparações competitivas, sempre em conformidade com a LGPD. Seus dados individuais nunca serão identificados ou compartilhados diretamente.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                        <Button
                          onClick={handleSaveConsent}
                          disabled={savingConsent || !hasReadTerms || selectedDataTypes.length === 0}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {savingConsent ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Salvando...
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Aceitar e Continuar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardBox>
              ) : (
                <>
              {/* Comparação você vs mercado */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {isMetricRelevant(businessType, 'occupancy_rate') && (
                    <CardBox>
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-600">
                          {getBusinessMetricLabel(businessType, 'occupancy_rate') || 'Taxa de Ocupação'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-slate-500">Você</p>
                          <p className="text-xl font-bold text-slate-800">{MOCK_COMPETITIVE_BENCHMARK.yourPerformance.occupancy}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Média do Mercado</p>
                          <p className="text-lg font-semibold text-slate-600">{MOCK_COMPETITIVE_BENCHMARK.marketAverage.occupancy}%</p>
                        </div>
                        <Badge variant={MOCK_COMPETITIVE_BENCHMARK.yourPerformance.occupancy < MOCK_COMPETITIVE_BENCHMARK.marketAverage.occupancy ? 'destructive' : 'default'} className="rounded-full text-xs px-2 py-0.5">
                          {MOCK_COMPETITIVE_BENCHMARK.yourPerformance.occupancy < MOCK_COMPETITIVE_BENCHMARK.marketAverage.occupancy ? (
                            <>-4pp abaixo <ArrowDownRight className="h-3 w-3 ml-1" /></>
                          ) : (
                            <>+4pp acima <ArrowUpRight className="h-3 w-3 ml-1" /></>
                          )}
                        </Badge>
                      </div>
                    </CardBox>
                  )}

                  <CardBox>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-600">
                        {businessType === 'hotel' || businessType === 'pousada' 
                          ? 'Preço Médio (ADR)'
                          : businessType === 'restaurante' 
                          ? 'Ticket Médio'
                          : businessType === 'agencia'
                          ? 'Valor Médio do Pacote'
                          : 'Preço Médio'}
                      </span>
                    </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-slate-500">Você</p>
                      <p className="text-xl font-bold text-slate-800">R$ {MOCK_COMPETITIVE_BENCHMARK.yourPerformance.avgPrice}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Média do Mercado</p>
                      <p className="text-lg font-semibold text-slate-600">R$ {MOCK_COMPETITIVE_BENCHMARK.marketAverage.avgPrice}</p>
                    </div>
                    <Badge variant="default" className="rounded-full text-xs px-2 py-0.5 bg-green-600">
                      +7.7% acima <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Badge>
                  </div>
                </CardBox>

                <CardBox>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-600">Avaliação</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-slate-500">Você</p>
                      <p className="text-xl font-bold text-slate-800">{MOCK_COMPETITIVE_BENCHMARK.yourPerformance.rating} ⭐</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Média do Mercado</p>
                      <p className="text-lg font-semibold text-slate-600">{MOCK_COMPETITIVE_BENCHMARK.marketAverage.rating} ⭐</p>
                    </div>
                    <Badge variant="destructive" className="rounded-full text-xs px-2 py-0.5">
                      -0.2 abaixo <ArrowDownRight className="h-3 w-3 ml-1" />
                    </Badge>
                  </div>
                </CardBox>

                  {(businessType === 'hotel' || businessType === 'pousada') && (
                    <CardBox>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-600">
                          {getBusinessMetricLabel(businessType, 'avg_stay') || 'Permanência Média'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-slate-500">Você</p>
                          <p className="text-xl font-bold text-slate-800">{MOCK_COMPETITIVE_BENCHMARK.yourPerformance.avgStay} dias</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Média do Mercado</p>
                          <p className="text-lg font-semibold text-slate-600">{MOCK_COMPETITIVE_BENCHMARK.marketAverage.avgStay} dias</p>
                        </div>
                        <Badge variant="destructive" className="rounded-full text-xs px-2 py-0.5">
                          -0.4 dias <ArrowDownRight className="h-3 w-3 ml-1" />
                        </Badge>
                      </div>
                    </CardBox>
                  )}
              </div>

              {/* Tabela de concorrentes */}
              <CardBox className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-slate-800">Comparação Detalhada com Concorrentes</h3>
                </div>
                      <p className="text-sm text-slate-600 mb-4">
                        Dados agregados e anonimizados de estabelecimentos similares na região
                      </p>
                      {regionalData && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-700">
                            <strong>Fonte:</strong> {regionalData.source === 'ALUMIA' 
                              ? 'ALUMIA - Dados oficiais agregados e anonimizados'
                              : 'Google Scholar - Pesquisa acadêmica e estudos de mercado'}
                          </p>
                        </div>
                      )}
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">Estabelecimento</th>
                        <th className="px-6 py-3 text-center">Ocupação</th>
                        <th className="px-6 py-3 text-center">Preço Médio</th>
                        <th className="px-6 py-3 text-center">Avaliação</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-purple-50 border-b border-purple-200 font-semibold">
                        <td className="px-6 py-4">Seu Estabelecimento</td>
                        <td className="px-6 py-4 text-center">{MOCK_COMPETITIVE_BENCHMARK.yourPerformance.occupancy}%</td>
                        <td className="px-6 py-4 text-center">R$ {MOCK_COMPETITIVE_BENCHMARK.yourPerformance.avgPrice}</td>
                        <td className="px-6 py-4 text-center">{MOCK_COMPETITIVE_BENCHMARK.yourPerformance.rating} ⭐</td>
                      </tr>
                      {MOCK_COMPETITIVE_BENCHMARK.competitors.map((comp, i) => (
                        <tr key={i} className="bg-white border-b hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-500">{comp.name}</td>
                          <td className="px-6 py-4 text-center text-gray-600">{comp.occupancy}%</td>
                          <td className="px-6 py-4 text-center text-gray-600">R$ {comp.avgPrice}</td>
                          <td className="px-6 py-4 text-center text-gray-600">{comp.rating} ⭐</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-semibold">
                        <td className="px-6 py-4">Média do Mercado</td>
                        <td className="px-6 py-4 text-center">{MOCK_COMPETITIVE_BENCHMARK.marketAverage.occupancy}%</td>
                        <td className="px-6 py-4 text-center">R$ {MOCK_COMPETITIVE_BENCHMARK.marketAverage.avgPrice}</td>
                        <td className="px-6 py-4 text-center">{MOCK_COMPETITIVE_BENCHMARK.marketAverage.rating} ⭐</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardBox>

              {/* Insights e recomendações */}
              <CardBox>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-slate-800">Insights e Oportunidades de Melhoria</h3>
                </div>
                <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Ocupação 4pp abaixo da média</p>
                    <p className="text-sm text-red-700 mt-1">
                      Sua ocupação (68%) está abaixo do mercado (72%). Considere: 
                      (1) Reduzir preço em 5-10% temporariamente, ou 
                      (2) Investir mais em marketing digital, ou 
                      (3) Criar promoções para dias de semana.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <TrendingDown className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Avaliação 0.2 pontos abaixo</p>
                    <p className="text-sm text-red-700 mt-1">
                      Principais reclamações no mercado: limpeza e atendimento. 
                      Foque em treinamento da equipe e inspeção de qualidade rigorosa.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Calendar className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Hóspedes ficam menos tempo (-0.4 dias)</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Ofereça pacotes de 3+ diárias com 15-20% de desconto. 
                      Crie roteiros e experiências exclusivas para incentivar permanência maior.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <ArrowUpRight className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Preço 7.7% acima da média - Ótimo!</p>
                    <p className="text-sm text-green-700 mt-1">
                      Você consegue cobrar mais que a média mantendo ocupação competitiva. 
                      Isso indica valor percebido alto. Continue investindo em diferenciais.
                    </p>
                  </div>
                </div>
                </div>
              </CardBox>
                </>
              )}
            </SectionWrapper>
          </TabsContent>
        </Tabs>
        )}

        {/* Footer com CTA */}
        {!hideHeader && (
          <CardBox className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-800">
                  💡 Quer insights ainda mais precisos?
                </p>
                <p className="text-xs text-slate-600">
                  Quando conectarmos à ALUMIA, você terá dados oficiais do governo MS em tempo real
                </p>
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                Falar com Consultor
              </Button>
            </div>
          </CardBox>
        )}
      </div>
    </div>
  );
}


