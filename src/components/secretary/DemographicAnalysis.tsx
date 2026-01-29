import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, TrendingUp, MapPin, Calendar, Target } from 'lucide-react';

interface DemographicData {
  age_distribution: { age_range: string; count: number }[];
  gender_distribution: { gender: string; count: number }[];
  origin_distribution: { origin: string; count: number }[];
  travel_purpose_distribution: { purpose: string; count: number }[];
  preferences_distribution: { preference: string; count: number }[];
  total_users: number;
}

interface SurveyData {
  origin_distribution: { origin: string; count: number }[];
  question_type_distribution: { type: string; count: number }[];
  motivation_distribution: { motivation: string; count: number }[];
  total_surveys: number;
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

export default function DemographicAnalysis() {
  const [demographicData, setDemographicData] = useState<DemographicData | null>(null);
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchDemographicData(), fetchSurveyData()]);
    } catch (error: unknown) {
      console.error('Erro ao buscar dados demográficos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDemographicData = async () => {
    try {
      // Calcular data inicial baseado no range
      const now = new Date();
      let startDate: Date;
      switch (dateRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      // Buscar dados de user_profiles (onde podem estar salvos os dados do cadastro)
      // Nota: Os dados podem estar em diferentes campos dependendo da estrutura
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Processar dados demográficos
      // Como os dados podem estar em diferentes formatos, vamos tentar múltiplas fontes
      const ageCounts: Record<string, number> = {};
      const genderCounts: Record<string, number> = {};
      const originCounts: Record<string, number> = {};
      const purposeCounts: Record<string, number> = {};
      const preferenceCounts: Record<string, number> = {};

      (profiles || []).forEach((profile: unknown) => {
        // Tentar extrair dados de diferentes campos possíveis
        const age = profile.age_range || profile.age || null;
        const gender = profile.gender || null;
        const origin = profile.origin_state || profile.state || profile.origin || null;
        const purpose = profile.travel_purpose || profile.purpose || null;
        const preferences = profile.preferences || profile.interests || [];

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

      setDemographicData({
        age_distribution: Object.entries(ageCounts)
          .map(([age_range, count]) => ({ age_range, count }))
          .sort((a, b) => b.count - a.count),
        gender_distribution: Object.entries(genderCounts)
          .map(([gender, count]) => ({ gender, count }))
          .sort((a, b) => b.count - a.count),
        origin_distribution: Object.entries(originCounts)
          .map(([origin, count]) => ({ origin, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10), // Top 10
        travel_purpose_distribution: Object.entries(purposeCounts)
          .map(([purpose, count]) => ({ purpose, count }))
          .sort((a, b) => b.count - a.count),
        preferences_distribution: Object.entries(preferenceCounts)
          .map(([preference, count]) => ({ preference, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10), // Top 10
        total_users: profiles?.length || 0,
      });
    } catch (error: unknown) {
      console.error('Erro ao buscar dados demográficos:', error);
    }
  };

  const fetchSurveyData = async () => {
    try {
      const now = new Date();
      let startDate: Date;
      switch (dateRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      const { data: surveys, error } = await supabase
        .from('tourist_surveys')
        .select('tourist_origin, question_type, travel_motivation')
        .gte('survey_date', startDate.toISOString().split('T')[0]);

      if (error) throw error;

      const originCounts: Record<string, number> = {};
      const questionTypeCounts: Record<string, number> = {};
      const motivationCounts: Record<string, number> = {};

      (surveys || []).forEach((survey: unknown) => {
        if (survey.tourist_origin) {
          originCounts[survey.tourist_origin] = (originCounts[survey.tourist_origin] || 0) + 1;
        }

        if (Array.isArray(survey.question_type)) {
          survey.question_type.forEach((type: string) => {
            questionTypeCounts[type] = (questionTypeCounts[type] || 0) + 1;
          });
        }

        if (Array.isArray(survey.travel_motivation)) {
          survey.travel_motivation.forEach((motivation: string) => {
            motivationCounts[motivation] = (motivationCounts[motivation] || 0) + 1;
          });
        }
      });

      setSurveyData({
        origin_distribution: Object.entries(originCounts)
          .map(([origin, count]) => ({ origin, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        question_type_distribution: Object.entries(questionTypeCounts)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count),
        motivation_distribution: Object.entries(motivationCounts)
          .map(([motivation, count]) => ({ motivation, count }))
          .sort((a, b) => b.count - a.count),
        total_surveys: surveys?.length || 0,
      });
    } catch (error: unknown) {
      console.error('Erro ao buscar dados de pesquisas:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando análise demográfica...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtro de Período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Análise Demográfica de Turistas
          </CardTitle>
          <CardDescription>
            Dados agregados de cadastros e pesquisas com turistas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  dateRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === '7d' ? '7 dias' : range === '30d' ? '30 dias' : range === '90d' ? '90 dias' : 'Todos'}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Usuários</p>
                <p className="text-2xl font-bold">{demographicData?.total_users || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pesquisas Realizadas</p>
                <p className="text-2xl font-bold">{surveyData?.total_surveys || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Origens Diferentes</p>
                <p className="text-2xl font-bold">
                  {demographicData?.origin_distribution.length || 0}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Demográficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribuição por Idade */}
        {demographicData?.age_distribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Faixa Etária</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={demographicData.age_distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age_range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Distribuição por Gênero */}
        {demographicData?.gender_distribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Gênero</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={demographicData.gender_distribution}
                    dataKey="count"
                    nameKey="gender"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {demographicData.gender_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Origem dos Turistas */}
        {demographicData?.origin_distribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Estados de Origem</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={demographicData.origin_distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="origin" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Propósito da Viagem */}
        {demographicData?.travel_purpose_distribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Propósito da Viagem</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={demographicData.travel_purpose_distribution}
                    dataKey="count"
                    nameKey="purpose"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {demographicData.travel_purpose_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dados de Pesquisas com Turistas */}
      {surveyData && surveyData.total_surveys > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipos de Perguntas */}
          {surveyData.question_type_distribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Perguntas nos CATs</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={surveyData.question_type_distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Motivações da Viagem */}
          {surveyData.motivation_distribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Motivações da Viagem (Pesquisas CATs)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={surveyData.motivation_distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="motivation" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Mensagem se não houver dados */}
      {(!demographicData || demographicData.total_users === 0) && (!surveyData || surveyData.total_surveys === 0) && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhum dado demográfico disponível para o período selecionado.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

