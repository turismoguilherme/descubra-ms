// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, MapPin, Target, TrendingUp, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CustomerProfile {
  age_distribution: { age_range: string; count: number; percentage: number }[];
  gender_distribution: { gender: string; count: number; percentage: number }[];
  origin_distribution: { origin: string; count: number; percentage: number }[];
  travel_purpose_distribution: { purpose: string; count: number; percentage: number }[];
  preferences_distribution: { preference: string; count: number; percentage: number }[];
  total_tourists: number;
}

interface MarketingInsight {
  type: 'opportunity' | 'trend' | 'recommendation';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export default function CustomerProfileSection() {
  const { user, userProfile } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [insights, setInsights] = useState<MarketingInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityId, setCityId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserCity();
  }, [userProfile]);

  useEffect(() => {
    if (cityId) {
      fetchCustomerProfile();
    }
  }, [cityId]);

  const fetchUserCity = async () => {
    if (!userProfile?.city_id) {
      setLoading(false);
      return;
    }
    setCityId(userProfile.city_id);
  };

  const fetchCustomerProfile = async () => {
    setLoading(true);
    try {
      // Buscar dados agregados de turistas da região
      // Nota: Os dados podem estar em user_profiles ou em uma tabela específica
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('city_id', cityId)
        .or('user_type.eq.turista,user_type.eq.tourist');

      if (error) throw error;

      // Processar dados
      const ageCounts: Record<string, number> = {};
      const genderCounts: Record<string, number> = {};
      const originCounts: Record<string, number> = {};
      const purposeCounts: Record<string, number> = {};
      const preferenceCounts: Record<string, number> = {};

      (profiles || []).forEach((profile: unknown) => {
        // Extrair dados demográficos
        const age = profile.age_range || null;
        const gender = profile.gender || null;
        const origin = profile.origin_state || profile.state || null;
        const purpose = profile.travel_purpose || null;
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

      const total = profiles?.length || 0;

      // Calcular percentuais
      const calculatePercentage = (count: number) => total > 0 ? (count / total) * 100 : 0;

      setProfile({
        age_distribution: Object.entries(ageCounts)
          .map(([age_range, count]) => ({
            age_range,
            count,
            percentage: calculatePercentage(count),
          }))
          .sort((a, b) => b.count - a.count),
        gender_distribution: Object.entries(genderCounts)
          .map(([gender, count]) => ({
            gender,
            count,
            percentage: calculatePercentage(count),
          }))
          .sort((a, b) => b.count - a.count),
        origin_distribution: Object.entries(originCounts)
          .map(([origin, count]) => ({
            origin,
            count,
            percentage: calculatePercentage(count),
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        travel_purpose_distribution: Object.entries(purposeCounts)
          .map(([purpose, count]) => ({
            purpose,
            count,
            percentage: calculatePercentage(count),
          }))
          .sort((a, b) => b.count - a.count),
        preferences_distribution: Object.entries(preferenceCounts)
          .map(([preference, count]) => ({
            preference,
            count,
            percentage: calculatePercentage(count),
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        total_tourists: total,
      });

      // Gerar insights de marketing
      generateMarketingInsights(ageCounts, originCounts, purposeCounts, preferenceCounts);
    } catch (error: unknown) {
      console.error('Erro ao buscar perfil de clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMarketingInsights = (
    ageCounts: Record<string, number>,
    originCounts: Record<string, number>,
    purposeCounts: Record<string, number>,
    preferenceCounts: Record<string, number>
  ) => {
    const newInsights: MarketingInsight[] = [];

    // Insight 1: Faixa etária predominante
    const topAge = Object.entries(ageCounts).sort((a, b) => b[1] - a[1])[0];
    if (topAge && topAge[1] > 0) {
      newInsights.push({
        type: 'trend',
        title: `Faixa Etária Predominante: ${topAge[0]} anos`,
        description: `${topAge[1]} turistas (${((topAge[1] / Object.values(ageCounts).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%) estão nesta faixa etária. Adapte seus serviços e comunicação para este público.`,
        priority: 'high',
      });
    }

    // Insight 2: Estado de origem principal
    const topOrigin = Object.entries(originCounts).sort((a, b) => b[1] - a[1])[0];
    if (topOrigin && topOrigin[1] > 0) {
      newInsights.push({
        type: 'opportunity',
        title: `Foco em Marketing: ${topOrigin[0]}`,
        description: `${topOrigin[1]} turistas vêm de ${topOrigin[0]}. Considere campanhas direcionadas para este estado.`,
        priority: 'high',
      });
    }

    // Insight 3: Propósito da viagem
    const topPurpose = Object.entries(purposeCounts).sort((a, b) => b[1] - a[1])[0];
    if (topPurpose && topPurpose[1] > 0) {
      newInsights.push({
        type: 'recommendation',
        title: `Propósito Principal: ${topPurpose[0]}`,
        description: `A maioria dos turistas vem para ${topPurpose[0].toLowerCase()}. Desenvolva ofertas específicas para este propósito.`,
        priority: 'medium',
      });
    }

    // Insight 4: Preferências
    const topPreference = Object.entries(preferenceCounts).sort((a, b) => b[1] - a[1])[0];
    if (topPreference && topPreference[1] > 0) {
      newInsights.push({
        type: 'opportunity',
        title: `Interesse em: ${topPreference[0]}`,
        description: `${topPreference[1]} turistas têm interesse em ${topPreference[0].toLowerCase()}. Destaque este aspecto em suas ofertas.`,
        priority: 'medium',
      });
    }

    setInsights(newInsights);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando perfil de clientes...</p>
      </div>
    );
  }

  if (!cityId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Alert>
            <AlertDescription>
              Para visualizar o perfil de clientes, é necessário ter uma cidade associada ao seu perfil.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!profile || profile.total_tourists === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Nenhum dado de turistas disponível para sua região ainda.</p>
          <p className="text-sm mt-2">Os dados aparecerão conforme turistas se cadastrarem na plataforma.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Perfil dos Clientes da Região
          </CardTitle>
          <CardDescription>
            Dados agregados e anonimizados de turistas que visitam sua região
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{profile.total_tourists}</div>
              <div className="text-sm text-muted-foreground mt-1">Turistas na Região</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {profile.origin_distribution.length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Estados de Origem</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {profile.preferences_distribution.length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Interesses Identificados</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights de Marketing */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Insights de Marketing
            </CardTitle>
            <CardDescription>
              Recomendações baseadas no perfil dos seus clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <Alert
                  key={index}
                  className={
                    insight.priority === 'high'
                      ? 'border-orange-200 bg-orange-50'
                      : insight.priority === 'medium'
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  }
                >
                  <div className="flex items-start gap-3">
                    {insight.type === 'opportunity' && <Target className="h-4 w-4 mt-0.5 text-orange-600" />}
                    {insight.type === 'trend' && <TrendingUp className="h-4 w-4 mt-0.5 text-blue-600" />}
                    {insight.type === 'recommendation' && <Lightbulb className="h-4 w-4 mt-0.5 text-purple-600" />}
                    <div className="flex-1">
                      <div className="font-semibold">{insight.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{insight.description}</div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribuição por Idade */}
        {profile.age_distribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Faixa Etária</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={profile.age_distribution}>
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
        {profile.gender_distribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Gênero</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={profile.gender_distribution}
                    dataKey="count"
                    nameKey="gender"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {profile.gender_distribution.map((entry, index) => (
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

        {/* Top Estados de Origem */}
        {profile.origin_distribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Estados de Origem</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={profile.origin_distribution}>
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
        {profile.travel_purpose_distribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Propósito da Viagem</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={profile.travel_purpose_distribution}
                    dataKey="count"
                    nameKey="purpose"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {profile.travel_purpose_distribution.map((entry, index) => (
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

        {/* Top Interesses */}
        {profile.preferences_distribution.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Top 10 Interesses dos Turistas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={profile.preferences_distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="preference" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

