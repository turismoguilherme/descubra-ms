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
  
  // Atualizar aba quando initialTab mudar
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

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

                  {/* Perfil do turista */}
                  <CardBox>
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-slate-800">Perfil do Turista Típico</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                      Baseado em dados oficiais do governo (ALUMIA)
                    </p>
                    <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Faixa Etária:</span>
                    <span className="text-sm text-purple-600 font-semibold">
                      {MOCK_MARKET_INTELLIGENCE.touristProfile.ageRange}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Renda:</span>
                    <span className="text-sm text-purple-600 font-semibold">
                      {MOCK_MARKET_INTELLIGENCE.touristProfile.income}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Transporte:</span>
                    <span className="text-sm text-purple-600 font-semibold">
                      {MOCK_MARKET_INTELLIGENCE.touristProfile.transport}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Permanência:</span>
                    <span className="text-sm text-purple-600 font-semibold">
                      {MOCK_MARKET_INTELLIGENCE.touristProfile.stayDuration}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Reserva:</span>
                    <span className="text-sm text-purple-600 font-semibold">
                      {MOCK_MARKET_INTELLIGENCE.touristProfile.bookingWindow}
                    </span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Interesses:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {MOCK_MARKET_INTELLIGENCE.touristProfile.interests.map((interest, i) => (
                        <Badge key={i} variant="secondary" className="rounded-full text-xs px-2 py-0.5">{interest}</Badge>
                      ))}
                    </div>
                  </div>
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
                {/* Comparação você vs mercado */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <CardBox>
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-600">Taxa de Ocupação</span>
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

                  <CardBox>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-600">Preço Médio</span>
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

                  <CardBox>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-600">Tempo Médio</span>
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
              </SectionWrapper>
            )}
          </>
        ) : (
          /* Quando hideHeader=false, mostrar tabs normalmente */
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

                {/* Perfil do turista */}
                <CardBox>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Perfil do Turista Típico</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Baseado em dados oficiais do governo (ALUMIA)
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-slate-700">Faixa Etária:</span>
                      <span className="text-sm text-purple-600 font-semibold">
                        {MOCK_MARKET_INTELLIGENCE.touristProfile.ageRange}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-slate-700">Renda:</span>
                      <span className="text-sm text-purple-600 font-semibold">
                        {MOCK_MARKET_INTELLIGENCE.touristProfile.income}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-slate-700">Transporte:</span>
                      <span className="text-sm text-purple-600 font-semibold">
                        {MOCK_MARKET_INTELLIGENCE.touristProfile.transport}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-slate-700">Permanência:</span>
                      <span className="text-sm text-purple-600 font-semibold">
                        {MOCK_MARKET_INTELLIGENCE.touristProfile.stayDuration}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-slate-700">Reserva:</span>
                      <span className="text-sm text-purple-600 font-semibold">
                        {MOCK_MARKET_INTELLIGENCE.touristProfile.bookingWindow}
                      </span>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-slate-700">Interesses:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {MOCK_MARKET_INTELLIGENCE.touristProfile.interests.map((interest, i) => (
                          <Badge key={i} variant="secondary" className="rounded-full text-xs px-2 py-0.5">{interest}</Badge>
                        ))}
                      </div>
                    </div>
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
              {/* Comparação você vs mercado */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <CardBox>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-600">Taxa de Ocupação</span>
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

                <CardBox>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-600">Preço Médio</span>
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

                <CardBox>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-600">Tempo Médio</span>
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


