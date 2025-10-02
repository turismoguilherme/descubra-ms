import { supabase } from "@/integrations/supabase/client";
import { 
  CATAttendant, 
  CATLocation, 
  TouristService, 
  TouristInteraction, 
  PublicReport, 
  EmergencyAlert, 
  PublicSectorStats 
} from "@/types/public-sector";

export const publicSectorService = {
  // --- CAT Attendants ---
  async getAttendants(): Promise<CATAttendant[]> {
    const { data, error } = await supabase
      .from('cat_attendants')
      .select(`
        *,
        location:cat_locations(name, address, city)
      `)
      .eq('is_active', true)
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createAttendant(attendant: Omit<CATAttendant, 'id' | 'created_at' | 'updated_at'>): Promise<CATAttendant | null> {
    const { data, error } = await supabase
      .from('cat_attendants')
      .insert(attendant)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAttendant(id: string, updates: Partial<CATAttendant>): Promise<CATAttendant | null> {
    const { data, error } = await supabase
      .from('cat_attendants')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- CAT Locations ---
  async getLocations(): Promise<CATLocation[]> {
    const { data, error } = await supabase
      .from('cat_locations')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createLocation(location: Omit<CATLocation, 'id' | 'created_at' | 'updated_at'>): Promise<CATLocation | null> {
    const { data, error } = await supabase
      .from('cat_locations')
      .insert(location)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- Tourist Services ---
  async getServices(locationId?: string): Promise<TouristService[]> {
    let query = supabase
      .from('tourist_services')
      .select(`
        *,
        location:cat_locations(name, address),
        attendant:cat_attendants(name, email)
      `)
      .eq('is_public_service', true);

    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    const { data, error } = await query.order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createService(service: Omit<TouristService, 'id' | 'created_at' | 'updated_at'>): Promise<TouristService | null> {
    const { data, error } = await supabase
      .from('tourist_services')
      .insert(service)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- Tourist Interactions ---
  async getInteractions(filters: {
    locationId?: string;
    attendantId?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  } = {}): Promise<TouristInteraction[]> {
    let query = supabase
      .from('tourist_interactions')
      .select(`
        *,
        attendant:cat_attendants(name, email),
        location:cat_locations(name, address)
      `);

    if (filters.locationId) {
      query = query.eq('location_id', filters.locationId);
    }
    if (filters.attendantId) {
      query = query.eq('attendant_id', filters.attendantId);
    }
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createInteraction(interaction: Omit<TouristInteraction, 'id' | 'created_at' | 'updated_at'>): Promise<TouristInteraction | null> {
    const { data, error } = await supabase
      .from('tourist_interactions')
      .insert(interaction)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateInteraction(id: string, updates: Partial<TouristInteraction>): Promise<TouristInteraction | null> {
    const { data, error } = await supabase
      .from('tourist_interactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- Public Reports ---
  async getReports(): Promise<PublicReport[]> {
    const { data, error } = await supabase
      .from('public_reports')
      .select('*')
      .order('generated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createReport(report: Omit<PublicReport, 'id' | 'generated_at'>): Promise<PublicReport | null> {
    const { data, error } = await supabase
      .from('public_reports')
      .insert(report)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- Emergency Alerts ---
  async getAlerts(): Promise<EmergencyAlert[]> {
    const { data, error } = await supabase
      .from('emergency_alerts')
      .select(`
        *,
        location:cat_locations(name, address),
        created_by_user:profiles(full_name, email)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createAlert(alert: Omit<EmergencyAlert, 'id' | 'created_at'>): Promise<EmergencyAlert | null> {
    const { data, error } = await supabase
      .from('emergency_alerts')
      .insert(alert)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAlert(id: string, updates: Partial<EmergencyAlert>): Promise<EmergencyAlert | null> {
    const { data, error } = await supabase
      .from('emergency_alerts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- Analytics & Stats ---
  async getPublicSectorStats(period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<PublicSectorStats> {
    const now = new Date();
    let dateFrom: string;

    switch (period) {
      case 'today':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFrom = weekAgo.toISOString();
        break;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        dateFrom = monthAgo.toISOString();
        break;
      case 'year':
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        dateFrom = yearAgo.toISOString();
        break;
    }

    // Get interactions data
    const { data: interactions, error: interactionsError } = await supabase
      .from('tourist_interactions')
      .select(`
        *,
        attendant:cat_attendants(name),
        location:cat_locations(name)
      `)
      .gte('created_at', dateFrom);

    if (interactionsError) throw interactionsError;

    const interactionsData = interactions || [];
    const totalInteractions = interactionsData.length;

    // Calculate today's interactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const interactionsToday = interactionsData.filter(i => 
      new Date(i.created_at) >= today
    ).length;

    // Calculate this week's interactions
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const interactionsThisWeek = interactionsData.filter(i => 
      new Date(i.created_at) >= weekAgo
    ).length;

    // Calculate this month's interactions
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const interactionsThisMonth = interactionsData.filter(i => 
      new Date(i.created_at) >= monthAgo
    ).length;

    // Get attendants count
    const { data: attendants, error: attendantsError } = await supabase
      .from('cat_attendants')
      .select('id')
      .eq('is_active', true);

    if (attendantsError) throw attendantsError;

    // Get locations count
    const { data: locations, error: locationsError } = await supabase
      .from('cat_locations')
      .select('id')
      .eq('is_active', true);

    if (locationsError) throw locationsError;

    // Calculate average satisfaction
    const satisfactionRatings = interactionsData
      .filter(i => i.satisfaction_rating)
      .map(i => i.satisfaction_rating);
    const averageSatisfaction = satisfactionRatings.length > 0 
      ? satisfactionRatings.reduce((sum, rating) => sum + rating, 0) / satisfactionRatings.length 
      : 0;

    // Get emergency alerts count
    const { data: alerts, error: alertsError } = await supabase
      .from('emergency_alerts')
      .select('id')
      .eq('status', 'active');

    if (alertsError) throw alertsError;

    // Group by hour
    const interactionsByHour = interactionsData.reduce((acc: Record<string, number>, interaction) => {
      const hour = new Date(interaction.created_at).getHours();
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      acc[hourKey] = (acc[hourKey] || 0) + 1;
      return acc;
    }, {});

    // Find peak hour
    const peakHour = Object.entries(interactionsByHour)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    // Group by day
    const interactionsByDay = interactionsData.reduce((acc: Record<string, number>, interaction) => {
      const day = new Date(interaction.created_at).toLocaleDateString('pt-BR', { weekday: 'long' });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    // Group by interaction type
    const interactionsByType = interactionsData.reduce((acc: Record<string, number>, interaction) => {
      acc[interaction.interaction_type] = (acc[interaction.interaction_type] || 0) + 1;
      return acc;
    }, {});

    // Group by location
    const interactionsByLocation = interactionsData.reduce((acc: Record<string, number>, interaction) => {
      const location = interaction.location?.name || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});

    // Group by attendant
    const interactionsByAttendant = interactionsData.reduce((acc: Record<string, { interactions: number; rating: number }>, interaction) => {
      const attendant = interaction.attendant?.name || 'Unknown';
      if (!acc[attendant]) {
        acc[attendant] = { interactions: 0, rating: 0 };
      }
      acc[attendant].interactions++;
      if (interaction.satisfaction_rating) {
        acc[attendant].rating = (acc[attendant].rating + interaction.satisfaction_rating) / 2;
      }
      return acc;
    }, {});

    // Find most popular service
    const serviceCounts = interactionsData.reduce((acc: Record<string, number>, interaction) => {
      acc[interaction.service_requested] = (acc[interaction.service_requested] || 0) + 1;
      return acc;
    }, {});

    const mostPopularService = Object.entries(serviceCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    return {
      total_interactions: totalInteractions,
      interactions_today: interactionsToday,
      interactions_this_week: interactionsThisWeek,
      interactions_this_month: interactionsThisMonth,
      active_attendants: attendants?.length || 0,
      total_locations: locations?.length || 0,
      average_satisfaction: parseFloat(averageSatisfaction.toFixed(2)),
      emergency_alerts: alerts?.length || 0,
      peak_hour: peakHour,
      most_popular_service: mostPopularService,
      interactions_by_hour: Object.entries(interactionsByHour).map(([hour, count]) => ({ hour, count })),
      interactions_by_day: Object.entries(interactionsByDay).map(([day, count]) => ({ day, count })),
      satisfaction_trend: [], // TODO: Implement trend calculation
      top_attendants: Object.entries(interactionsByAttendant)
        .map(([attendant, data]) => ({ attendant, interactions: data.interactions, rating: data.rating }))
        .sort((a, b) => b.interactions - a.interactions)
        .slice(0, 5),
      top_locations: Object.entries(interactionsByLocation)
        .map(([location, count]) => ({ location, interactions: count }))
        .sort((a, b) => b.interactions - a.interactions)
        .slice(0, 5)
    };
  }
};
