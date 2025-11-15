import { supabase } from '@/integrations/supabase/client';

// Tipos para o sistema de mapa de calor
export interface TourismMovement {
  id: string;
  user_id?: string;
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  timestamp: string;
  type: 'gps_tracking' | 'check_in' | 'app_usage' | 'social_media';
  activity: 'viewing' | 'visiting' | 'staying' | 'passing_by';
  duration_minutes?: number;
  region: string;
  city: string;
  attraction_id?: string;
  attraction_name?: string;
  source: 'mobile_app' | 'website' | 'social_media' | 'gps_tracking';
}

export interface HeatmapData {
  lat: number;
  lng: number;
  intensity: number; // 0-1
  radius: number; // metros
  type: 'density' | 'duration' | 'engagement';
  timestamp: string;
  metadata: {
    total_visitors: number;
    average_duration: number;
    peak_hours: string[];
    popular_activities: string[];
  };
}

export interface TourismAnalytics {
  total_movements: number;
  unique_visitors: number;
  average_duration: number;
  peak_hours: { hour: number; count: number }[];
  popular_attractions: { name: string; visits: number }[];
  visitor_flow: { from: string; to: string; count: number }[];
  seasonal_trends: { month: string; visitors: number }[];
  demographic_data: {
    age_groups: { range: string; count: number }[];
    origins: { state: string; count: number }[];
    interests: { category: string; count: number }[];
  };
}

export interface HeatmapFilters {
  timeRange?: { start: string; end: string };
  region?: string;
  city?: string;
  type?: 'density' | 'duration' | 'engagement';
  attraction_type?: string[];
  visitor_type?: 'domestic' | 'international' | 'all';
}

export class TourismHeatmapService {
  // Registrar movimento turístico
  async recordMovement(movement: Omit<TourismMovement, 'id' | 'timestamp'>): Promise<TourismMovement> {
    try {
      const { data, error } = await supabase
        .from('tourism_movements')
        .insert([{
          ...movement,
          timestamp: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Movimento turístico registrado:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Erro ao registrar movimento:', error);
      throw error;
    }
  }

  // Gerar dados de mapa de calor
  async generateHeatmapData(filters: HeatmapFilters = {}): Promise<HeatmapData[]> {
    try {
      console.log('🔄 Gerando dados de mapa de calor...');

      // Buscar movimentos baseado nos filtros
      const movements = await this.getMovements(filters);
      
      if (movements.length === 0) {
        return [];
      }

      // Agrupar movimentos por localização
      const locationGroups = this.groupMovementsByLocation(movements);
      
      // Calcular intensidade para cada grupo
      const heatmapData: HeatmapData[] = [];

      for (const [locationKey, groupMovements] of locationGroups) {
        const [lat, lng] = locationKey.split(',').map(Number);
        
        // Calcular métricas
        const totalVisitors = new Set(groupMovements.map(m => m.user_id)).size;
        const averageDuration = groupMovements.reduce((sum, m) => sum + (m.duration_minutes || 0), 0) / groupMovements.length;
        const peakHours = this.calculatePeakHours(groupMovements);
        const popularActivities = this.calculatePopularActivities(groupMovements);

        // Calcular scores necessários uma única vez
        const engagementScore = this.calculateEngagementScore(groupMovements);
        const densityScore = Math.min(1, totalVisitors / 100);
        const durationScore = Math.min(1, averageDuration / 120);

        // Calcular intensidade baseada no tipo de mapa
        let intensity = 0;
        let radius = 100; // raio padrão em metros

        switch (filters.type) {
          case 'density':
            intensity = densityScore;
            radius = Math.max(50, Math.min(200, totalVisitors * 2));
            break;
          
          case 'duration':
            intensity = durationScore;
            radius = Math.max(50, Math.min(200, averageDuration));
            break;
          
          case 'engagement':
            intensity = engagementScore;
            radius = Math.max(50, Math.min(200, engagementScore * 150));
            break;
          
          default:
            // Mapa combinado
            intensity = (densityScore + durationScore + engagementScore) / 3;
            radius = Math.max(50, Math.min(200, intensity * 150));
        }

        heatmapData.push({
          lat,
          lng,
          intensity,
          radius,
          type: filters.type || 'density',
          timestamp: new Date().toISOString(),
          metadata: {
            total_visitors: totalVisitors,
            average_duration: Math.round(averageDuration),
            peak_hours: peakHours,
            popular_activities: popularActivities
          }
        });
      }

      console.log(`✅ Mapa de calor gerado com ${heatmapData.length} pontos`);
      return heatmapData;
    } catch (error) {
      console.error('❌ Erro ao gerar mapa de calor:', error);
      throw error;
    }
  }

  // Buscar movimentos com filtros - usando dados reais de cat_checkins e cat_tourists
  private async getMovements(filters: HeatmapFilters): Promise<TourismMovement[]> {
    try {
      const movements: TourismMovement[] = [];

      // Buscar check-ins de CATs (têm coordenadas GPS)
      let checkinsQuery = supabase
        .from('cat_checkins')
        .select('*, cat_locations(name, city, region)')
        .eq('status', 'active')
        .order('timestamp', { ascending: false });

      if (filters.timeRange) {
        checkinsQuery = checkinsQuery
          .gte('timestamp', filters.timeRange.start)
          .lte('timestamp', filters.timeRange.end);
      }

      const { data: checkins, error: checkinsError } = await checkinsQuery;

      if (checkinsError) {
        console.warn('⚠️ Erro ao buscar check-ins:', checkinsError);
      } else if (checkins) {
        // Converter check-ins para TourismMovement
        checkins.forEach((checkin: any) => {
          if (checkin.latitude && checkin.longitude) {
            const catLocation = checkin.cat_locations;
            movements.push({
              id: checkin.id,
              user_id: checkin.user_id,
              location: {
                lat: Number(checkin.latitude),
                lng: Number(checkin.longitude),
                accuracy: checkin.distance_from_cat ? Number(checkin.distance_from_cat) : undefined
              },
              timestamp: checkin.timestamp || checkin.created_at,
              type: 'check_in',
              activity: 'visiting',
              duration_minutes: 30, // Estimativa padrão para check-in
              region: catLocation?.region || filters.region || 'N/A',
              city: catLocation?.city || filters.city || 'N/A',
              attraction_name: catLocation?.name || checkin.cat_name,
              source: 'mobile_app'
            });
          }
        });
      }

      // Buscar turistas atendidos (para enriquecer dados)
      let touristsQuery = supabase
        .from('cat_tourists')
        .select('*, cat_locations(name, city, region, latitude, longitude)')
        .eq('is_active', true)
        .order('visit_time', { ascending: false });

      if (filters.timeRange) {
        touristsQuery = touristsQuery
          .gte('visit_time', filters.timeRange.start)
          .lte('visit_time', filters.timeRange.end);
      }

      const { data: tourists, error: touristsError } = await touristsQuery;

      if (touristsError) {
        console.warn('⚠️ Erro ao buscar turistas:', touristsError);
      } else if (tourists) {
        // Converter turistas para TourismMovement (usando coordenadas do CAT)
        tourists.forEach((tourist: any) => {
          const catLocation = tourist.cat_locations;
          if (catLocation?.latitude && catLocation?.longitude) {
            movements.push({
              id: tourist.id,
              user_id: tourist.attendant_id,
              location: {
                lat: Number(catLocation.latitude),
                lng: Number(catLocation.longitude)
              },
              timestamp: tourist.visit_time || tourist.visit_date,
              type: 'check_in',
              activity: 'visiting',
              duration_minutes: 45, // Estimativa padrão para atendimento
              region: catLocation.region || filters.region || 'N/A',
              city: catLocation.city || filters.city || 'N/A',
              attraction_name: catLocation.name,
              source: 'mobile_app'
            });
          }
        });
      }

      // Aplicar filtros adicionais
      let filteredMovements = movements;

      if (filters.region && filters.region !== 'all') {
        filteredMovements = filteredMovements.filter(m => m.region === filters.region);
      }

      if (filters.city) {
        filteredMovements = filteredMovements.filter(m => m.city === filters.city);
      }

      console.log(`✅ ${filteredMovements.length} movimentos encontrados`);
      return filteredMovements;
    } catch (error) {
      console.error('❌ Erro ao buscar movimentos:', error);
      // Retornar array vazio em caso de erro para não quebrar a UI
      return [];
    }
  }

  // Agrupar movimentos por localização (com tolerância de 50 metros)
  private groupMovementsByLocation(movements: TourismMovement[]): Map<string, TourismMovement[]> {
    const groups = new Map<string, TourismMovement[]>();
    const tolerance = 0.0005; // Aproximadamente 50 metros

    movements.forEach(movement => {
      let grouped = false;

      for (const [key, groupMovements] of groups) {
        const [groupLat, groupLng] = key.split(',').map(Number);
        
        if (Math.abs(movement.location.lat - groupLat) < tolerance &&
            Math.abs(movement.location.lng - groupLng) < tolerance) {
          groupMovements.push(movement);
          grouped = true;
          break;
        }
      }

      if (!grouped) {
        const key = `${movement.location.lat},${movement.location.lng}`;
        groups.set(key, [movement]);
      }
    });

    return groups;
  }

  // Calcular horários de pico
  private calculatePeakHours(movements: TourismMovement[]): string[] {
    const hourCounts = new Map<number, number>();

    movements.forEach(movement => {
      const hour = new Date(movement.timestamp).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    // Encontrar os 3 horários mais movimentados
    const sortedHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => `${hour.toString().padStart(2, '0')}:00`);

    return sortedHours;
  }

  // Calcular atividades populares
  private calculatePopularActivities(movements: TourismMovement[]): string[] {
    const activityCounts = new Map<string, number>();

    movements.forEach(movement => {
      activityCounts.set(movement.activity, (activityCounts.get(movement.activity) || 0) + 1);
    });

    return Array.from(activityCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([activity]) => activity);
  }

  // Calcular score de engajamento
  private calculateEngagementScore(movements: TourismMovement[]): number {
    let score = 0;
    let totalWeight = 0;

    movements.forEach(movement => {
      let weight = 1;
      let activityScore = 0;

      // Score baseado na atividade
      switch (movement.activity) {
        case 'staying':
          activityScore = 1.0;
          break;
        case 'visiting':
          activityScore = 0.8;
          break;
        case 'viewing':
          activityScore = 0.6;
          break;
        case 'passing_by':
          activityScore = 0.3;
          break;
      }

      // Peso baseado na duração
      if (movement.duration_minutes) {
        weight = Math.min(3, movement.duration_minutes / 30); // Máximo 3x peso para 90+ minutos
      }

      // Peso baseado na fonte
      switch (movement.source) {
        case 'mobile_app':
          weight *= 1.2; // App indica maior engajamento
          break;
        case 'social_media':
          weight *= 1.1; // Redes sociais indicam compartilhamento
          break;
      }

      score += activityScore * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? Math.min(1, score / totalWeight) : 0;
  }

  // Gerar análise turística completa
  async generateTourismAnalytics(filters: HeatmapFilters = {}): Promise<TourismAnalytics> {
    try {
      console.log('🔄 Gerando análise turística...');

      const movements = await this.getMovements(filters);
      
      if (movements.length === 0) {
        return this.getEmptyAnalytics();
      }

      // Calcular métricas básicas
      const uniqueVisitors = new Set(movements.map(m => m.user_id)).size;
      const totalMovements = movements.length;
      const averageDuration = movements.reduce((sum, m) => sum + (m.duration_minutes || 0), 0) / movements.length;

      // Calcular horários de pico
      const peakHours = this.calculatePeakHoursAnalytics(movements);

      // Calcular atrações populares
      const popularAttractions = this.calculatePopularAttractions(movements);

      // Calcular fluxo de visitantes
      const visitorFlow = this.calculateVisitorFlow(movements);

      // Calcular tendências sazonais
      const seasonalTrends = this.calculateSeasonalTrends(movements);

      // Calcular dados demográficos (simulado - integrar com dados reais)
      const demographicData = this.calculateDemographicData(movements);

      const analytics: TourismAnalytics = {
        total_movements: totalMovements,
        unique_visitors: uniqueVisitors,
        average_duration: Math.round(averageDuration),
        peak_hours: peakHours,
        popular_attractions: popularAttractions,
        visitor_flow: visitorFlow,
        seasonal_trends: seasonalTrends,
        demographic_data: demographicData
      };

      console.log('✅ Análise turística gerada com sucesso');
      return analytics;
    } catch (error) {
      console.error('❌ Erro ao gerar análise turística:', error);
      throw error;
    }
  }

  // Calcular horários de pico detalhados
  private calculatePeakHoursAnalytics(movements: TourismMovement[]): { hour: number; count: number }[] {
    const hourCounts = new Map<number, number>();

    movements.forEach(movement => {
      const hour = new Date(movement.timestamp).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    return Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([hour, count]) => ({ hour, count }));
  }

  // Calcular atrações populares
  private calculatePopularAttractions(movements: TourismMovement[]): { name: string; visits: number }[] {
    const attractionCounts = new Map<string, number>();

    movements.forEach(movement => {
      if (movement.attraction_name) {
        attractionCounts.set(movement.attraction_name, (attractionCounts.get(movement.attraction_name) || 0) + 1);
      }
    });

    return Array.from(attractionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, visits]) => ({ name, visits }));
  }

  // Calcular fluxo de visitantes
  private calculateVisitorFlow(movements: TourismMovement[]): { from: string; to: string; count: number }[] {
    const flows = new Map<string, number>();

    // Agrupar movimentos por usuário e ordenar por timestamp
    const userMovements = new Map<string, TourismMovement[]>();
    
    movements.forEach(movement => {
      if (movement.user_id) {
        if (!userMovements.has(movement.user_id)) {
          userMovements.set(movement.user_id, []);
        }
        userMovements.get(movement.user_id)!.push(movement);
      }
    });

    // Calcular fluxos entre locais
    userMovements.forEach(userMoves => {
      const sortedMoves = userMoves.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      for (let i = 0; i < sortedMoves.length - 1; i++) {
        const from = sortedMoves[i].attraction_name || 'Local Desconhecido';
        const to = sortedMoves[i + 1].attraction_name || 'Local Desconhecido';
        const flowKey = `${from} → ${to}`;
        
        flows.set(flowKey, (flows.get(flowKey) || 0) + 1);
      }
    });

    return Array.from(flows.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([flow, count]) => {
        const [from, to] = flow.split(' → ');
        return { from, to, count };
      });
  }

  // Calcular tendências sazonais
  private calculateSeasonalTrends(movements: TourismMovement[]): { month: string; visitors: number }[] {
    const monthCounts = new Map<string, number>();

    movements.forEach(movement => {
      const month = new Date(movement.timestamp).toLocaleDateString('pt-BR', { month: 'long' });
      monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
    });

    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];

    return months.map(month => ({
      month,
      visitors: monthCounts.get(month) || 0
    }));
  }

  // Calcular dados demográficos (simulado)
  private calculateDemographicData(movements: TourismMovement[]): TourismAnalytics['demographic_data'] {
    // Simular dados demográficos baseados nos movimentos
    const ageGroups = [
      { range: '18-25', count: Math.floor(movements.length * 0.25) },
      { range: '26-35', count: Math.floor(movements.length * 0.35) },
      { range: '36-45', count: Math.floor(movements.length * 0.20) },
      { range: '46-55', count: Math.floor(movements.length * 0.15) },
      { range: '55+', count: Math.floor(movements.length * 0.05) }
    ];

    const origins = [
      { state: 'São Paulo', count: Math.floor(movements.length * 0.30) },
      { state: 'Rio de Janeiro', count: Math.floor(movements.length * 0.20) },
      { state: 'Minas Gerais', count: Math.floor(movements.length * 0.15) },
      { state: 'Paraná', count: Math.floor(movements.length * 0.10) },
      { state: 'Outros', count: Math.floor(movements.length * 0.25) }
    ];

    const interests = [
      { category: 'Natureza', count: Math.floor(movements.length * 0.40) },
      { category: 'Cultura', count: Math.floor(movements.length * 0.25) },
      { category: 'Gastronomia', count: Math.floor(movements.length * 0.20) },
      { category: 'Aventura', count: Math.floor(movements.length * 0.15) }
    ];

    return { ageGroups, origins, interests };
  }

  // Retornar análise vazia
  private getEmptyAnalytics(): TourismAnalytics {
    return {
      total_movements: 0,
      unique_visitors: 0,
      average_duration: 0,
      peak_hours: [],
      popular_attractions: [],
      visitor_flow: [],
      seasonal_trends: [],
      demographic_data: {
        ageGroups: [],
        origins: [],
        interests: []
      }
    };
  }

  // Obter estatísticas em tempo real
  async getRealTimeStats(): Promise<{
    active_visitors: number;
    current_hour_visits: number;
    today_visits: number;
    popular_now: string[];
  }> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Buscar check-ins da última hora
      const { data: recentCheckins } = await supabase
        .from('cat_checkins')
        .select('*, cat_locations(name)')
        .eq('status', 'active')
        .gte('timestamp', oneHourAgo.toISOString());

      // Buscar turistas de hoje
      const { data: todayTourists } = await supabase
        .from('cat_tourists')
        .select('*, cat_locations(name)')
        .eq('is_active', true)
        .gte('visit_time', todayStart.toISOString());

      const activeVisitors = new Set([
        ...(recentCheckins?.map(c => c.user_id).filter(Boolean) || []),
        ...(todayTourists?.map(t => t.attendant_id).filter(Boolean) || [])
      ]).size;

      const currentHourVisits = recentCheckins?.length || 0;
      const todayVisits = (recentCheckins?.length || 0) + (todayTourists?.length || 0);

      // Calcular atrações populares agora
      const popularNow: string[] = [];
      const catCounts = new Map<string, number>();

      recentCheckins?.forEach((checkin: any) => {
        const catName = checkin.cat_locations?.name || checkin.cat_name || 'CAT';
        catCounts.set(catName, (catCounts.get(catName) || 0) + 1);
      });

      todayTourists?.forEach((tourist: any) => {
        const catName = tourist.cat_locations?.name || 'CAT';
        catCounts.set(catName, (catCounts.get(catName) || 0) + 1);
      });

      popularNow.push(...Array.from(catCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name]) => name));

      return {
        active_visitors: activeVisitors,
        current_hour_visits: currentHourVisits,
        today_visits: todayVisits,
        popular_now: popularNow
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas em tempo real:', error);
      // Retornar valores padrão em caso de erro
      return {
        active_visitors: 0,
        current_hour_visits: 0,
        today_visits: 0,
        popular_now: []
      };
    }
  }

  // Funcionalidades de tempo real
  subscribeToRealtimeUpdates(callback: (data: any) => void) {
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
    }

    // Subscrever a mudanças em cat_checkins e cat_tourists
    this.realtimeSubscription = supabase
      .channel('tourism_heatmap_realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'cat_checkins' 
        }, 
        (payload) => {
          console.log('🔥 Check-in em tempo real:', payload);
          callback(payload);
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'cat_tourists' 
        }, 
        (payload) => {
          console.log('🔥 Turista em tempo real:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return this.realtimeSubscription;
  }

  unsubscribeFromRealtimeUpdates() {
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
      this.realtimeSubscription = null;
    }
  }

  // Sistema de callbacks para atualizações em tempo real
  addRealtimeCallback(event: string, callback: Function) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  removeRealtimeCallback(event: string, callback: Function) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  triggerRealtimeCallbacks(event: string, data: any) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Mapa de calor em tempo real - usando dados reais
  async getRealtimeHeatmapData(): Promise<HeatmapData[]> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Buscar movimentos da última hora usando o método adaptado
      const movements = await this.getMovements({
        timeRange: {
          start: oneHourAgo.toISOString(),
          end: now.toISOString()
        }
      });

      // Processar dados para mapa de calor
      const heatmapData = this.processMovementsToHeatmap(movements);
      
      // Disparar callbacks de tempo real
      this.triggerRealtimeCallbacks('heatmap_update', heatmapData);
      
      return heatmapData;
    } catch (error) {
      console.error('❌ Erro ao obter mapa de calor em tempo real:', error);
      return [];
    }
  }

  private processMovementsToHeatmap(movements: TourismMovement[]): HeatmapData[] {
    const locationMap = new Map<string, {
      lat: number;
      lng: number;
      count: number;
      totalDuration: number;
      activities: string[];
    }>();

    movements.forEach(movement => {
      const key = `${movement.location.lat.toFixed(4)},${movement.location.lng.toFixed(4)}`;
      
      if (!locationMap.has(key)) {
        locationMap.set(key, {
          lat: movement.location.lat,
          lng: movement.location.lng,
          count: 0,
          totalDuration: 0,
          activities: []
        });
      }

      const location = locationMap.get(key)!;
      location.count++;
      location.totalDuration += movement.duration_minutes || 0;
      location.activities.push(movement.activity);
    });

    return Array.from(locationMap.values()).map(location => ({
      lat: location.lat,
      lng: location.lng,
      intensity: Math.min(location.count / 10, 1), // Normalizar para 0-1
      radius: Math.max(location.count * 50, 100), // Raio baseado na densidade
      type: 'density' as const,
      timestamp: new Date().toISOString(),
      metadata: {
        total_visitors: location.count,
        average_duration: location.totalDuration / location.count,
        peak_hours: [],
        popular_activities: [...new Set(location.activities)]
      }
    }));
  }
}

// Instância singleton
export const tourismHeatmapService = new TourismHeatmapService(); 