import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface DashboardMetrics {
  totalCATs: number;
  touristsToday: number;
  totalAttractions: number;
  totalEvents: number;
  cats: Array<{
    id: string;
    name: string;
    location: string;
    tourists: number;
    rating: number;
    status: 'excellent' | 'good' | 'needs_improvement';
    attendants: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: 'event' | 'tourist' | 'attraction' | 'cat';
    message: string;
    timestamp: Date;
  }>;
  touristsByDay: Array<{
    date: string;
    count: number;
  }>;
  touristsByOrigin: Array<{
    origin: string;
    count: number;
  }>;
}

export interface DashboardAlert {
  id: string;
  type: 'warning' | 'info' | 'error' | 'success';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  actionUrl?: string;
  actionLabel?: string;
}

export function useDashboardMetrics(refreshInterval: number = 5 * 60 * 1000) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCATs: 0,
    touristsToday: 0,
    totalAttractions: 0,
    totalEvents: 0,
    cats: [],
    recentActivities: [],
    touristsByDay: [],
    touristsByOrigin: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [isRealtime, setIsRealtime] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const loadMetricsRef = useRef<() => Promise<void>>();

  const loadMetrics = useCallback(async () => {
    try {
      setError(null);
      
      // Buscar métricas em paralelo
      const [
        catsResult,
        touristsTodayResult,
        attractionsResult,
        eventsResult,
        touristsByDayResult,
        touristsByOriginResult,
        recentActivitiesResult
      ] = await Promise.all([
        // Total de CATs ativos
        supabase
          .from('cat_locations')
          .select('id, name, address, city, latitude, longitude, is_active, contact_phone, contact_email')
          .eq('is_active', true)
          .order('name', { ascending: true }),
        
        // Turistas hoje (usando cat_tourists)
        supabase
          .from('cat_tourists')
          .select('id, visit_date, origin_state, origin_country')
          .eq('visit_date', new Date().toISOString().split('T')[0]),
        
        // Total de atrações ativas
        supabase
          .from('tourism_inventory')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true),
        
        // Total de eventos futuros
        supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .gte('start_date', new Date().toISOString())
          .eq('is_visible', true),
        
        // Turistas por dia (últimos 7 dias)
        supabase
          .from('cat_tourists')
          .select('visit_date')
          .gte('visit_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('visit_date', { ascending: true }),
        
        // Turistas por origem
        supabase
          .from('cat_tourists')
          .select('origin_state, origin_country')
          .not('origin_state', 'is', null)
          .gte('visit_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
        
        // Atividades recentes (últimas 10)
        supabase
          .from('cat_tourists')
          .select('id, visit_date, visit_time, name, created_at')
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      // Processar dados dos CATs
      const catsData = catsResult.data || [];
      
      // Buscar estatísticas de cada CAT
      const catsWithStats = await Promise.all(
        catsData.map(async (cat) => {
          // Contar turistas hoje neste CAT
          const { count: touristsCount } = await supabase
            .from('cat_tourists')
            .select('id', { count: 'exact', head: true })
            .eq('visit_date', new Date().toISOString().split('T')[0])
            .eq('cat_id', cat.id);
          
          // Buscar avaliações (se existir tabela de avaliações)
          // Por enquanto, usar dados mockados para rating
          const rating = 4.5; // TODO: Buscar de tabela de avaliações
          
          // Contar atendentes (se existir tabela de atendentes)
          const attendants = 2; // TODO: Buscar de tabela de atendentes
          
          // Determinar status baseado em métricas
          let status: 'excellent' | 'good' | 'needs_improvement' = 'good';
          if (rating >= 4.5 && (touristsCount || 0) > 50) {
            status = 'excellent';
          } else if (rating < 4.0 || (touristsCount || 0) < 10) {
            status = 'needs_improvement';
          }
          
          return {
            id: cat.id,
            name: cat.name,
            location: cat.address || cat.city || 'Localização não informada',
            tourists: touristsCount || 0,
            rating,
            status,
            attendants
          };
        })
      );

      // Processar turistas por dia
      const touristsByDayData = touristsByDayResult.data || [];
      const touristsByDayMap = new Map<string, number>();
      touristsByDayData.forEach((item) => {
        const date = item.visit_date || new Date().toISOString().split('T')[0];
        touristsByDayMap.set(date, (touristsByDayMap.get(date) || 0) + 1);
      });
      
      const touristsByDay = Array.from(touristsByDayMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Processar turistas por origem
      const touristsByOriginData = touristsByOriginResult.data || [];
      const originMap = new Map<string, number>();
      touristsByOriginData.forEach((item) => {
        const origin = item.origin_state || item.origin_country || 'Não informado';
        originMap.set(origin, (originMap.get(origin) || 0) + 1);
      });
      
      const touristsByOrigin = Array.from(originMap.entries())
        .map(([origin, count]) => ({ origin, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10

      // Processar atividades recentes
      const recentActivitiesData = recentActivitiesResult.data || [];
      const recentActivities = recentActivitiesData.map((item, index) => ({
        id: item.id || `activity-${index}`,
        type: 'tourist' as const,
        message: item.name 
          ? `${item.name} visitou o CAT`
          : 'Novo turista registrado',
        timestamp: new Date(item.created_at || item.visit_time || new Date())
      }));

      // Buscar eventos próximos (próximos 3 dias)
      const upcomingEventsResult = await supabase
        .from('events')
        .select('id, name, start_date, location')
        .gte('start_date', new Date().toISOString())
        .lte('start_date', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString())
        .eq('is_visible', true)
        .order('start_date', { ascending: true })
        .limit(5);

      // Gerar alertas inteligentes
      const newAlerts: DashboardAlert[] = [];

      // Alertas de eventos próximos
      if (upcomingEventsResult.data && upcomingEventsResult.data.length > 0) {
        upcomingEventsResult.data.forEach((event) => {
          const eventDate = new Date(event.start_date);
          const daysUntil = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          if (daysUntil <= 2) {
            newAlerts.push({
              id: `event-${event.id}`,
              type: 'info',
              title: 'Evento Próximo',
              message: `${event.name} acontece em ${daysUntil} ${daysUntil === 1 ? 'dia' : 'dias'}`,
              priority: daysUntil === 0 ? 'high' : 'medium',
              timestamp: new Date(),
              actionUrl: '#events',
              actionLabel: 'Ver Evento'
            });
          }
        });
      }

      // Alertas de CATs com baixa performance
      catsWithStats.forEach((cat) => {
        if (cat.status === 'needs_improvement') {
          newAlerts.push({
            id: `cat-${cat.id}`,
            type: 'warning',
            title: 'CAT com Baixa Performance',
            message: `${cat.name} está com rating ${cat.rating.toFixed(1)} e apenas ${cat.tourists} turistas hoje`,
            priority: 'medium',
            timestamp: new Date(),
            actionUrl: '#cats',
            actionLabel: 'Ver CAT'
          });
        }
      });

      // Alertas de superlotação (se houver dados de capacidade)
      // TODO: Implementar quando tivermos dados de capacidade das atrações

      // Atualizar métricas
      setMetrics({
        totalCATs: catsData.length,
        touristsToday: touristsTodayResult.data?.length || 0,
        totalAttractions: attractionsResult.count || 0,
        totalEvents: eventsResult.count || 0,
        cats: catsWithStats,
        recentActivities,
        touristsByDay,
        touristsByOrigin
      });

      setAlerts(newAlerts);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar métricas:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Erro ao carregar métricas. Verifique sua conexão e tente novamente.';
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

  // Atualizar ref quando loadMetrics mudar
  useEffect(() => {
    loadMetricsRef.current = loadMetrics;
  }, [loadMetrics]);

  // Configurar WebSockets para atualizações em tempo real
  useEffect(() => {
    // Limpar subscription anterior se existir
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Criar canal para atualizações em tempo real
    const channel = supabase
      .channel('dashboard_metrics_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cat_tourists'
        },
        () => {
          console.log('🔄 Atualização em tempo real - cat_tourists');
          setIsRealtime(true);
          // Recarregar métricas quando houver mudanças
          if (loadMetricsRef.current) {
            loadMetricsRef.current();
          }
          // Resetar flag após 2 segundos
          setTimeout(() => setIsRealtime(false), 2000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        () => {
          console.log('🔄 Atualização em tempo real - events');
          setIsRealtime(true);
          if (loadMetricsRef.current) {
            loadMetricsRef.current();
          }
          setTimeout(() => setIsRealtime(false), 2000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cat_locations'
        },
        () => {
          console.log('🔄 Atualização em tempo real - cat_locations');
          setIsRealtime(true);
          if (loadMetricsRef.current) {
            loadMetricsRef.current();
          }
          setTimeout(() => setIsRealtime(false), 2000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tourism_inventory'
        },
        () => {
          console.log('🔄 Atualização em tempo real - tourism_inventory');
          setIsRealtime(true);
          if (loadMetricsRef.current) {
            loadMetricsRef.current();
          }
          setTimeout(() => setIsRealtime(false), 2000);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conectado ao Supabase Realtime');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erro na conexão Realtime');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []); // Executar apenas uma vez na montagem

  useEffect(() => {
    // Carregar métricas inicialmente
    loadMetrics();

    // Configurar refresh automático
    const interval = setInterval(loadMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [loadMetrics, refreshInterval]);

  return {
    metrics,
    loading,
    error,
    alerts,
    isRealtime,
    refresh: loadMetrics
  };
}

