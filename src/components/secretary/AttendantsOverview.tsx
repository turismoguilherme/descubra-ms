import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { catCheckinService } from '@/services/catCheckinService';
import { Users, MapPin, Clock, TrendingUp, MessageSquare } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ActiveAttendant {
  id: string;
  name: string;
  email: string;
  cat_name: string;
  checkin_time: string;
  distance_from_cat?: number;
}

interface SurveyStats {
  total: number;
  by_origin: { origin: string; count: number }[];
  by_question_type: { type: string; count: number }[];
  by_motivation: { motivation: string; count: number }[];
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export default function AttendantsOverview() {
  const [activeAttendants, setActiveAttendants] = useState<ActiveAttendant[]>([]);
  const [surveyStats, setSurveyStats] = useState<SurveyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([fetchActiveAttendants(), fetchSurveyStats()]);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveAttendants = async () => {
    try {
      // Buscar check-ins ativos (sem checkout) de hoje
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendant_checkins')
        .select(`
          id,
          attendant_id,
          checkin_time,
          distance_from_cat,
          location_id,
          attendant_allowed_locations (
            name
          ),
          user_profiles!attendant_checkins_attendant_id_fkey (
            full_name,
            email
          )
        `)
        .is('checkout_time', null)
        .eq('is_valid', true)
        .gte('checkin_time', `${today}T00:00:00.000Z`)
        .order('checkin_time', { ascending: false });

      if (error) throw error;

      const attendants = (data || []).map((checkin: unknown) => ({
        id: checkin.attendant_id,
        name: checkin.user_profiles?.full_name || 'Atendente',
        email: checkin.user_profiles?.email || '',
        cat_name: checkin.attendant_allowed_locations?.name || 'CAT',
        checkin_time: checkin.checkin_time,
        distance_from_cat: checkin.distance_from_cat ? parseFloat(checkin.distance_from_cat.toString()) : undefined,
      }));

      setActiveAttendants(attendants);
    } catch (error) {
      console.error('Erro ao buscar atendentes ativos:', error);
    }
  };

  const fetchSurveyStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Total de pesquisas hoje
      const { data: totalData, error: totalError } = await supabase
        .from('tourist_surveys')
        .select('id', { count: 'exact', head: true })
        .eq('survey_date', today);

      if (totalError) throw totalError;

      // Pesquisas por origem
      const { data: originData, error: originError } = await supabase
        .from('tourist_surveys')
        .select('tourist_origin')
        .eq('survey_date', today);

      if (originError) throw originError;

      const originCounts: Record<string, number> = {};
      (originData || []).forEach((survey: unknown) => {
        const origin = survey.tourist_origin || 'Não informado';
        originCounts[origin] = (originCounts[origin] || 0) + 1;
      });

      // Pesquisas por tipo de pergunta
      const { data: questionData, error: questionError } = await supabase
        .from('tourist_surveys')
        .select('question_type')
        .eq('survey_date', today);

      if (questionError) throw questionError;

      const questionTypeCounts: Record<string, number> = {};
      (questionData || []).forEach((survey: unknown) => {
        const types = survey.question_type || [];
        types.forEach((type: string) => {
          questionTypeCounts[type] = (questionTypeCounts[type] || 0) + 1;
        });
      });

      // Pesquisas por motivação
      const { data: motivationData, error: motivationError } = await supabase
        .from('tourist_surveys')
        .select('travel_motivation')
        .eq('survey_date', today);

      if (motivationError) throw motivationError;

      const motivationCounts: Record<string, number> = {};
      (motivationData || []).forEach((survey: unknown) => {
        const motivations = survey.travel_motivation || [];
        motivations.forEach((motivation: string) => {
          motivationCounts[motivation] = (motivationCounts[motivation] || 0) + 1;
        });
      });

      setSurveyStats({
        total: totalData?.length || 0,
        by_origin: Object.entries(originCounts)
          .map(([origin, count]) => ({ origin, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        by_question_type: Object.entries(questionTypeCounts)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count),
        by_motivation: Object.entries(motivationCounts)
          .map(([motivation, count]) => ({ motivation, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas de pesquisas:', error);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Atendentes Ativos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Atendentes Ativos Agora
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAttendants.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhum atendente ativo no momento
            </p>
          ) : (
            <div className="space-y-3">
              {activeAttendants.map((attendant) => (
                <div
                  key={attendant.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{attendant.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {attendant.cat_name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="default" className="bg-green-500">
                      Online
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(attendant.checkin_time).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {attendant.distance_from_cat && (
                      <div className="text-xs text-muted-foreground">
                        {Math.round(attendant.distance_from_cat)}m do CAT
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas de Pesquisas */}
      {surveyStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Estatísticas de Pesquisas com Turistas (Hoje)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total */}
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{surveyStats.total}</div>
                <div className="text-sm text-muted-foreground mt-1">Pesquisas realizadas hoje</div>
              </div>

              {/* Por Origem */}
              {surveyStats.by_origin.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Origem dos Turistas</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={surveyStats.by_origin}
                        dataKey="count"
                        nameKey="origin"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label
                      >
                        {surveyStats.by_origin.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Por Tipo de Pergunta */}
              {surveyStats.by_question_type.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Tipos de Perguntas</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={surveyStats.by_question_type}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Por Motivação */}
              {surveyStats.by_motivation.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Motivações da Viagem</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={surveyStats.by_motivation}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="motivation" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

