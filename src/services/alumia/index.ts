// Sistema de Integração com ALUMIA - Preparado para Fase Futura
// Integração com plataforma de turismo da ALUMIA

import { 
  AlumiaIntegration, 
  AlumiaDestination, 
  AlumiaEvent, 
  AlumiaBooking, 
  AlumiaAnalytics 
} from '../ai/types';
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert } from '@/integrations/supabase/types';

// Configuração da integração ALUMIA
const ALUMIA_CONFIG = {
  // URLs base (atualizadas para a URL correta da Alumia)
  BASE_URL: import.meta.env.VITE_ALUMIA_BASE_URL || 'https://api.alumia.com.br/v1',
  API_KEY: import.meta.env.VITE_ALUMIA_API_KEY,
  
  // Headers padrão para autenticação
  getHeaders: () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ALUMIA_CONFIG.API_KEY}`,
    'User-Agent': 'OverFlow-One-IA-Consultora/1.0'
  }),
  
  // Verificar se API está configurada
  isConfigured: () => Boolean(ALUMIA_CONFIG.API_KEY),
  
  // Endpoints
  ENDPOINTS: {
    destinations: '/destinations',
    events: '/events',
    bookings: '/bookings',
    analytics: '/analytics',
    sync: '/sync',
    health: '/health',
    regions: '/regions',
    insights: '/insights/tourism',
    benchmarking: '/benchmarking'
  },
  
  // Configurações de sincronização
  SYNC: {
    interval: 15, // minutos
    retryAttempts: 3,
    timeout: 30000, // 30 segundos
    batchSize: 100
  },
  
  // Configurações de cache
  CACHE: {
    destinations: 30, // minutos
    events: 15, // minutos
    bookings: 5, // minutos
    analytics: 60 // minutos
  }
};

// Classe principal para integração com ALUMIA
export class AlumiaService {
  private static instance: AlumiaService;
  private config: AlumiaIntegration;
  private cache: Map<string, { data: any; timestamp: number; expiresAt: number }> = new Map();
  private syncStatus: 'idle' | 'syncing' | 'error' = 'idle';
  private lastSyncTime: string | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = {
      enabled: ALUMIA_CONFIG.isConfigured(),
      baseUrl: ALUMIA_CONFIG.BASE_URL,
      apiKey: ALUMIA_CONFIG.API_KEY,
      syncInterval: ALUMIA_CONFIG.SYNC.interval
    };
    
    // Log do status da configuração
    if (this.config.enabled) {
      console.log('✅ Alumia: Configurada e pronta para uso');
    } else {
      console.log('⚠️ Alumia: Aguardando configuração da API_KEY');
    }
  }

  static getInstance(): AlumiaService {
    if (!AlumiaService.instance) {
      AlumiaService.instance = new AlumiaService();
    }
    return AlumiaService.instance;
  }

  // Inicializar integração
  async initialize(apiKey?: string, baseUrl?: string): Promise<boolean> {
    try {
      console.log('🔗 Inicializando integração com ALUMIA...');
      
      if (apiKey) {
        this.config.apiKey = apiKey;
      }
      
      if (baseUrl) {
        this.config.baseUrl = baseUrl;
      }
      
      // Verificar se temos as credenciais necessárias
      if (!this.config.apiKey) {
        console.warn('⚠️ API Key da ALUMIA não configurada');
        this.config.enabled = false;
        this.config.status = 'disconnected';
        return false;
      }
      
      // Testar conexão
      const isConnected = await this.testConnection();
      
      if (isConnected) {
        this.config.enabled = true;
        this.config.status = 'connected';
        console.log('✅ Integração com ALUMIA ativada');
        
        // Iniciar sincronização automática
        this.startAutoSync();
        
        return true;
      } else {
        this.config.enabled = false;
        this.config.status = 'error';
        console.error('❌ Falha na conexão com ALUMIA');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar ALUMIA:', error);
      this.config.enabled = false;
      this.config.status = 'error';
      return false;
    }
  }

  // Testar conexão com ALUMIA
  private async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.health}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(ALUMIA_CONFIG.SYNC.timeout)
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Erro no teste de conexão ALUMIA:', error);
      return false;
    }
  }

  // Fazer requisição para ALUMIA
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.config.enabled) {
      throw new Error('Integração ALUMIA não está habilitada');
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
    
    // Verificar cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      console.log('📦 Retornando dados do cache ALUMIA:', endpoint);
      return cached.data;
    }

    try {
      console.log('🌐 Fazendo requisição para ALUMIA:', endpoint);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        signal: AbortSignal.timeout(ALUMIA_CONFIG.SYNC.timeout)
      });

      if (!response.ok) {
        throw new Error(`ALUMIA API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache dos dados
      const cacheDuration = this.getCacheDuration(endpoint);
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + (cacheDuration * 60 * 1000)
      });

      return data;
    } catch (error) {
      console.error('❌ Erro na requisição ALUMIA:', error);
      throw error;
    }
  }

  // Obter duração do cache baseado no endpoint
  private getCacheDuration(endpoint: string): number {
    if (endpoint.includes('destinations')) return ALUMIA_CONFIG.CACHE.destinations;
    if (endpoint.includes('events')) return ALUMIA_CONFIG.CACHE.events;
    if (endpoint.includes('bookings')) return ALUMIA_CONFIG.CACHE.bookings;
    if (endpoint.includes('analytics')) return ALUMIA_CONFIG.CACHE.analytics;
    return 5; // 5 minutos padrão
  }

  // Buscar destinos da ALUMIA
  async getDestinations(filters?: {
    category?: string;
    city?: string;
    availability?: boolean;
    accessibility?: string[];
  }): Promise<AlumiaDestination[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.city) queryParams.append('city', filters.city);
      if (filters?.availability !== undefined) queryParams.append('availability', filters.availability.toString());
      if (filters?.accessibility) queryParams.append('accessibility', filters.accessibility.join(','));
      
      const endpoint = `${this.config.endpoints.destinations}?${queryParams.toString()}`;
      
      const data = await this.makeRequest<{ destinations: AlumiaDestination[] }>(endpoint);
      return data.destinations;
    } catch (error) {
      console.error('❌ Erro ao buscar destinos ALUMIA:', error);
      return this.getMockDestinations();
    }
  }

  // Buscar eventos da ALUMIA
  async getEvents(filters?: {
    category?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<AlumiaEvent[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.startDate) queryParams.append('startDate', filters.startDate);
      if (filters?.endDate) queryParams.append('endDate', filters.endDate);
      if (filters?.status) queryParams.append('status', filters.status);
      
      const endpoint = `${this.config.endpoints.events}?${queryParams.toString()}`;
      
      const data = await this.makeRequest<{ events: AlumiaEvent[] }>(endpoint);
      return data.events;
    } catch (error) {
      console.error('❌ Erro ao buscar eventos ALUMIA:', error);
      return this.getMockEvents();
    }
  }

  // Buscar reservas da ALUMIA
  async getBookings(filters?: {
    touristId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AlumiaBooking[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.touristId) queryParams.append('touristId', filters.touristId);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.startDate) queryParams.append('startDate', filters.startDate);
      if (filters?.endDate) queryParams.append('endDate', filters.endDate);
      
      const endpoint = `${this.config.endpoints.bookings}?${queryParams.toString()}`;
      
      const data = await this.makeRequest<{ bookings: AlumiaBooking[] }>(endpoint);
      return data.bookings;
    } catch (error) {
      console.error('❌ Erro ao buscar reservas ALUMIA:', error);
      return this.getMockBookings();
    }
  }

  // Buscar analytics da ALUMIA
  async getAnalytics(period: string = '30d'): Promise<AlumiaAnalytics> {
    try {
      const endpoint = `${this.config.endpoints.analytics}?period=${period}`;
      
      const data = await this.makeRequest<AlumiaAnalytics>(endpoint);
      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar analytics ALUMIA:', error);
      return this.getMockAnalytics();
    }
  }

  // Sincronizar dados com ALUMIA
  async syncData(): Promise<{ success: boolean; message: string; data?: any }> {
    if (this.syncStatus === 'syncing') {
      return { success: false, message: 'Sincronização já em andamento' };
    }

    try {
      this.syncStatus = 'syncing';
      console.log('🔄 Iniciando sincronização com ALUMIA...');
      
      const startTime = Date.now();
      
      // Sincronizar destinos
      const destinations = await this.getDestinations();
      
      // Sincronizar eventos
      const events = await this.getEvents();
      
      // Sincronizar reservas
      const bookings = await this.getBookings();
      
      // Sincronizar analytics
      const analytics = await this.getAnalytics();
      
      // Salvar dados no Supabase
      await this.saveDestinationsToSupabase(destinations);
      await this.saveEventsToSupabase(events);
      await this.saveBookingsToSupabase(bookings);
      await this.saveAnalyticsToSupabase(analytics);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.lastSyncTime = new Date().toISOString();
      this.syncStatus = 'idle';
      
      console.log(`✅ Sincronização ALUMIA concluída em ${duration}ms`);
      
      return {
        success: true,
        message: `Sincronização concluída em ${duration}ms`,
        data: {
          destinations: destinations.length,
          events: events.length,
          bookings: bookings.length,
          analytics: analytics
        }
      };
    } catch (error) {
      this.syncStatus = 'error';
      console.error('❌ Erro na sincronização ALUMIA:', error);
      
      return {
        success: false,
        message: `Erro na sincronização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  // Iniciar sincronização automática
  startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(() => {
      this.syncData();
    }, this.config.syncInterval * 60 * 1000);
    
    console.log(`🔄 Sincronização automática ALUMIA iniciada (${this.config.syncInterval} min)`);
  }

  // Parar sincronização automática
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Sincronização automática ALUMIA parada');
    }
  }

  // Obter status da integração
  getStatus(): {
    enabled: boolean;
    status: string;
    lastSync: string | null;
    syncStatus: string;
    cacheSize: number;
  } {
    return {
      enabled: this.config.enabled,
      status: this.config.status,
      lastSync: this.lastSyncTime,
      syncStatus: this.syncStatus,
      cacheSize: this.cache.size
    };
  }

  // Limpar cache
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Cache ALUMIA limpo');
  }

  // Obter estatísticas de uso
  getStats(): {
    totalRequests: number;
    cacheHits: number;
    cacheMisses: number;
    averageResponseTime: number;
    lastSync: string | null;
  } {
    return {
      totalRequests: 0, // Implementar contador
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      lastSync: this.lastSyncTime
    };
  }

  // Dados mockados para fallback
  private getMockDestinations(): AlumiaDestination[] {
    return [
      {
        id: 'alumia-1',
        name: 'Gruta do Lago Azul - ALUMIA',
        description: 'Uma das mais belas grutas do mundo, com águas cristalinas',
        location: {
          latitude: -21.1261,
          longitude: -56.4847,
          address: 'Rodovia MS-178, Km 0',
          city: 'Bonito',
          state: 'MS'
        },
        category: 'ecoturismo',
        rating: 4.9,
        price: 'R$ 120',
        images: ['https://alumia.com/images/gruta-lago-azul-1.jpg'],
        availability: true,
        accessibility: ['wheelchair_partial'],
        languages: ['pt-BR', 'en-US', 'es-ES'],
        contact: {
          phone: '(67) 3255-1414',
          email: 'contato@grutalagoazul.com',
          website: 'https://grutalagoazul.com'
        },
        operatingHours: {
          open: '08:00',
          close: '17:00',
          days: ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo']
        },
        capacity: {
          max: 200,
          current: 45
        }
      }
    ];
  }

  private getMockEvents(): AlumiaEvent[] {
    return [
      {
        id: 'alumia-event-1',
        name: 'Festival de Inverno Bonito 2024',
        description: 'Festival cultural com música, gastronomia e arte',
        startDate: '2024-07-15',
        endDate: '2024-07-20',
        location: 'Praça da Liberdade, Bonito',
        category: 'cultura',
        price: 50,
        capacity: 1000,
        registered: 750,
        status: 'upcoming',
        organizer: 'Prefeitura de Bonito',
        contact: {
          phone: '(67) 3255-1414',
          email: 'festival@bonito.ms.gov.br'
        },
        images: ['https://alumia.com/images/festival-inverno-1.jpg'],
        tags: ['música', 'gastronomia', 'arte', 'cultura']
      }
    ];
  }

  private getMockBookings(): AlumiaBooking[] {
    return [
      {
        id: 'alumia-booking-1',
        touristId: 'tourist-123',
        serviceType: 'destination',
        serviceId: 'alumia-1',
        date: '2024-07-20',
        time: '14:00',
        people: 2,
        totalPrice: 240,
        status: 'confirmed',
        paymentStatus: 'paid',
        specialRequirements: ['wheelchair_access'],
        createdAt: '2024-07-10T10:00:00Z',
        updatedAt: '2024-07-10T10:30:00Z'
      }
    ];
  }

  private getMockAnalytics(): AlumiaAnalytics {
    return {
      period: '30d',
      totalVisitors: 15000,
      totalBookings: 2500,
      totalRevenue: 450000,
      popularDestinations: [
        {
          id: 'alumia-1',
          name: 'Gruta do Lago Azul',
          visitors: 3500,
          revenue: 420000
        }
      ],
      popularEvents: [
        {
          id: 'alumia-event-1',
          name: 'Festival de Inverno',
          attendees: 750,
          revenue: 37500
        }
      ],
      visitorDemographics: {
        byCountry: {
          'Brasil': 12000,
          'Argentina': 1500,
          'Estados Unidos': 800,
          'Alemanha': 400,
          'Outros': 300
        },
        byAge: {
          '18-25': 3000,
          '26-35': 4500,
          '36-45': 4000,
          '46-55': 2500,
          '55+': 1000
        },
        byLanguage: {
          'pt-BR': 12000,
          'es-ES': 1500,
          'en-US': 800,
          'de-DE': 400,
          'outros': 300
        }
      },
      bookingTrends: [
        {
          date: '2024-07-01',
          bookings: 85,
          revenue: 15300
        },
        {
          date: '2024-07-02',
          bookings: 92,
          revenue: 16560
        }
      ]
    };
  }

  private async saveDestinationsToSupabase(destinations: AlumiaDestination[]): Promise<void> {
    console.log(`💾 Salvando ${destinations.length} destinos da ALUMIA no Supabase...`);
    const inserts = destinations.map(dest => ({
      alumia_id: dest.id,
      name: dest.name,
      description: dest.description,
      latitude: dest.location.latitude,
      longitude: dest.location.longitude,
      address: dest.location.address,
      city: dest.location.city,
      state: dest.location.state,
      category: dest.category,
      rating: dest.rating,
      price: dest.price,
      images: dest.images,
      availability: dest.availability,
      accessibility: dest.accessibility,
      languages: dest.languages,
      contact_phone: dest.contact.phone,
      contact_email: dest.contact.email,
      contact_website: dest.contact.website,
      operating_hours_open: dest.operatingHours.open,
      operating_hours_close: dest.operatingHours.close,
      operating_hours_days: dest.operatingHours.days,
      capacity_max: dest.capacity.max,
      capacity_current: dest.capacity.current,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })) as TablesInsert<'alumia_destinations'>[];

    // Use upsert para evitar duplicatas e atualizar se já existir
    const { error } = await supabase
      .from('alumia_destinations')
      .upsert(inserts, { onConflict: 'alumia_id' });

    if (error) {
      console.error('❌ Erro ao salvar destinos ALUMIA no Supabase:', error);
    } else {
      console.log(`✅ Destinos ALUMIA salvos/atualizados no Supabase.`);
    }
  }

  private async saveEventsToSupabase(events: AlumiaEvent[]): Promise<void> {
    console.log(`💾 Salvando ${events.length} eventos da ALUMIA no Supabase...`);
    const inserts = events.map(event => ({
      alumia_id: event.id,
      name: event.name,
      description: event.description,
      start_date: event.startDate,
      end_date: event.endDate,
      location: event.location,
      category: event.category,
      price: event.price,
      capacity: event.capacity,
      registered: event.registered,
      status: event.status,
      organizer: event.organizer,
      contact_phone: event.contact.phone,
      contact_email: event.contact.email,
      images: event.images,
      tags: event.tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })) as TablesInsert<'alumia_events'>[];

    const { error } = await supabase
      .from('alumia_events')
      .upsert(inserts, { onConflict: 'alumia_id' });

    if (error) {
      console.error('❌ Erro ao salvar eventos ALUMIA no Supabase:', error);
    } else {
      console.log(`✅ Eventos ALUMIA salvos/atualizados no Supabase.`);
    }
  }

  private async saveBookingsToSupabase(bookings: AlumiaBooking[]): Promise<void> {
    console.log(`💾 Salvando ${bookings.length} reservas da ALUMIA no Supabase...`);
    const inserts = bookings.map(booking => ({
      alumia_id: booking.id,
      tourist_id: booking.touristId,
      service_type: booking.serviceType,
      service_id: booking.serviceId,
      date: booking.date,
      time: booking.time,
      people: booking.people,
      total_price: booking.totalPrice,
      status: booking.status,
      payment_status: booking.paymentStatus,
      special_requirements: booking.specialRequirements,
      created_at: booking.createdAt,
      updated_at: booking.updatedAt,
    })) as TablesInsert<'alumia_bookings'>[];

    const { error } = await supabase
      .from('alumia_bookings')
      .upsert(inserts, { onConflict: 'alumia_id' });

    if (error) {
      console.error('❌ Erro ao salvar reservas ALUMIA no Supabase:', error);
    } else {
      console.log(`✅ Reservas ALUMIA salvas/atualizadas no Supabase.`);
    }
  }

  private async saveAnalyticsToSupabase(analytics: AlumiaAnalytics): Promise<void> {
    console.log(`💾 Salvando analytics da ALUMIA no Supabase...`);
    const insert: TablesInsert<'alumia_analytics_data'> = {
      period: analytics.period,
      total_visitors: analytics.totalVisitors,
      total_bookings: analytics.totalBookings,
      total_revenue: analytics.totalRevenue,
      popular_destinations: analytics.popularDestinations,
      popular_events: analytics.popularEvents,
      visitor_demographics_by_country: analytics.visitorDemographics.byCountry,
      visitor_demographics_by_age: analytics.visitorDemographics.byAge,
      visitor_demographics_by_language: analytics.visitorDemographics.byLanguage,
      booking_trends: analytics.bookingTrends,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Para analytics, podemos sempre inserir um novo registro com o período, ou atualizar um existente se for o caso de um período específico.
    // Por simplicidade, vou inserir um novo registro para cada sincronização de analytics.
    const { error } = await supabase
      .from('alumia_analytics_data')
      .insert([insert]);

    if (error) {
      console.error('❌ Erro ao salvar analytics ALUMIA no Supabase:', error);
    } else {
      console.log(`✅ Analytics ALUMIA salvo no Supabase.`);
    }
  }

  /**
   * Método específico para obter insights turísticos para a IA Consultora
   * Usado pelo AIConsultantService
   */
  async getTourismInsights(regionId?: string): Promise<any> {
    console.log('🔍 Alumia: Buscando insights turísticos para região:', regionId);

    if (!this.config.enabled) {
      console.log('⚠️ Alumia: API não configurada, retornando dados simulados');
      return this.generateMockTourismInsights(regionId);
    }

    try {
      const cacheKey = `tourism_insights_${regionId || 'all'}`;
      const cached = this.getCached(cacheKey);
      
      if (cached) {
        console.log('📋 Alumia: Usando dados em cache');
        return cached;
      }

      // Fazer chamada real para a API Alumia
      const response = await fetch(
        `${this.config.baseUrl}${ALUMIA_CONFIG.ENDPOINTS.insights}${regionId ? `?region=${regionId}` : ''}`,
        {
          method: 'GET',
          headers: ALUMIA_CONFIG.getHeaders(),
          signal: AbortSignal.timeout(ALUMIA_CONFIG.SYNC.timeout)
        }
      );

      if (!response.ok) {
        throw new Error(`Alumia API Error: ${response.status} ${response.statusText}`);
      }

      const insights = await response.json();
      
      // Cache dos dados
      this.setCache(cacheKey, insights, ALUMIA_CONFIG.CACHE.analytics);
      
      console.log('✅ Alumia: Insights obtidos com sucesso');
      return insights;

    } catch (error) {
      console.error('❌ Erro ao buscar insights da Alumia:', error);
      // Fallback para dados simulados
      return this.generateMockTourismInsights(regionId);
    }
  }

  /**
   * Gera dados simulados para quando a API ainda não estiver configurada
   */
  private generateMockTourismInsights(regionId?: string): any {
    const regionName = regionId === 'ms' ? 'Mato Grosso do Sul' : (regionId || 'Região não especificada');
    
    return {
      region: regionName,
      period: 'últimos_30_dias',
      status: 'simulated_data',
      insights: {
        visitacao: {
          total_visitantes: 15234,
          crescimento_mensal: 18.5,
          origem_principal: 'São Paulo (35%)',
          pico_visitacao: 'Fins de semana'
        },
        destinos_populares: [
          { nome: 'Pantanal Norte', visitantes: 4521, crescimento: 22 },
          { nome: 'Bonito', visitantes: 3892, crescimento: 15 },
          { nome: 'Aquário Natural', visitantes: 2103, crescimento: 8 }
        ],
        tendencias: [
          'Crescimento no turismo de natureza (+25%)',
          'Aumento de visitantes internacionais (+12%)',
          'Preferência por experiências sustentáveis'
        ],
        benchmarking: {
          posicao_ranking_nacional: 8,
          comparacao_mes_anterior: '+2 posições',
          pontos_fortes: ['Ecoturismo', 'Biodiversidade'],
          areas_melhoria: ['Infraestrutura digital', 'Marketing']
        },
        nota_qualidade: 8.4,
        fonte: 'Alumia - Dados Simulados (aguardando API)',
        ultima_atualizacao: new Date().toISOString()
      }
    };
  }
}

// Instância singleton
export const alumiaService = AlumiaService.getInstance();

// Hooks para React
export const useAlumiaService = () => {
  return alumiaService;
};

// Utilitários
export const formatAlumiaData = (data: any): any => {
  return {
    ...data,
    source: 'alumia',
    timestamp: new Date().toISOString()
  };
};

export const validateAlumiaConfig = (config: Partial<AlumiaIntegration>): boolean => {
  return !!(config.apiKey && config.baseUrl);
}; 