// Serviço de Banco de Dados do Guatá Human
// Gerencia todas as operações PostgreSQL para turismo de MS

import { createClient } from '@supabase/supabase-js';

export interface TouristAttraction {
    id: string;
    name: string;
    description: string;
    category: string;
    location: string;
    city: string;
    state: string;
    address?: string;
    phone?: string;
    website?: string;
    email?: string;
    coordinates?: { lat: number; lng: number };
    average_price?: number;
    opening_hours?: any;
    best_time_to_visit?: string;
    accessibility_info?: string;
    images?: string[];
    tags: string[];
    official_source?: string;
    last_verified: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Itinerary {
    id: string;
    title: string;
    description: string;
    duration_days: number;
    difficulty_level?: string;
    target_audience?: string;
    total_cost_estimate?: number;
    season_recommendation?: string;
    attractions: string[];
    daily_schedule: any;
    transportation_info?: string;
    accommodation_suggestions?: string;
    tips?: string;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserMemory {
    id: string;
    user_id?: string;
    session_id: string;
    memory_type: 'preferences' | 'conversation_history' | 'travel_style';
    memory_key: string;
    memory_value: any;
    expires_at?: string;
    created_at: string;
    updated_at: string;
}

export interface FeedbackEntry {
    id: string;
    session_id: string;
    user_id?: string;
    question_id: string;
    original_question: string;
    original_answer: string;
    rating: 'positive' | 'negative' | 'neutral';
    comment?: string;
    correction?: string;
    learning_patterns?: any;
    applied_corrections?: any;
    created_at: string;
}

export interface Event {
    id: string;
    title: string;
    description: string;
    event_type?: string;
    location?: string;
    city?: string;
    start_date?: string;
    end_date?: string;
    start_time?: string;
    end_time?: string;
    price_info?: string;
    website?: string;
    contact_info?: any;
    is_recurring: boolean;
    recurrence_pattern?: any;
    source?: string;
    last_verified: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface VerifiedPartner {
    id: string;
    business_name: string;
    business_type?: string;
    description?: string;
    location?: string;
    city?: string;
    contact_info?: any;
    services?: any;
    pricing_info?: string;
    verification_status: string;
    verification_date?: string;
    verified_by?: string;
    rating?: number;
    review_count: number;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

export interface SearchStats {
    id: string;
    session_id?: string;
    user_id?: string;
    query: string;
    query_category?: string;
    results_count?: number;
    response_time_ms?: number;
    confidence_score?: number;
    sources_used?: any;
    user_satisfaction?: string;
    created_at: string;
}

export class GuataDatabaseService {
  private supabase: any = null;

  constructor() {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase conectado com sucesso');
      } else {
        console.warn('⚠️ Variáveis do Supabase não configuradas, usando modo simulado');
        this.supabase = null;
      }
    } catch (error) {
      console.warn('⚠️ Erro ao conectar com Supabase, usando modo simulado:', error);
      this.supabase = null;
    }
  }

    // ===== ATRAÇÕES TURÍSTICAS =====
    async getAttractions(filters?: {
        city?: string;
        category?: string;
        tags?: string[];
        price_range?: { min: number; max: number };
        limit?: number;
    }): Promise<TouristAttraction[]> {
        try {
            if (!this.supabase) {
                console.log('📊 Retornando dados simulados de atrações');
                return this.getSimulatedAttractions(filters);
            }

            let query = this.supabase
                .from('guata_tourist_attractions')
                .select('*')
                .eq('is_active', true);

            if (filters?.city) {
                query = query.eq('city', filters.city);
            }
            if (filters?.category) {
                query = query.eq('category', filters.category);
            }
            if (filters?.tags && filters.tags.length > 0) {
                query = query.overlaps('tags', filters.tags);
            }
            if (filters?.price_range) {
                query = query.gte('average_price', filters.price_range.min)
                           .lte('average_price', filters.price_range.max);
            }
            if (filters?.limit) {
                query = query.limit(filters.limit);
            }

            const { data, error } = await query.order('name');
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erro ao buscar atrativos:', error);
            return this.getSimulatedAttractions(filters);
        }
    }

    async getAttractionById(id: string): Promise<TouristAttraction | null> {
        try {
            const { data, error } = await this.supabase
                .from('guata_tourist_attractions')
                .select('*')
                .eq('id', id)
                .eq('is_active', true)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao buscar atrativo por ID:', error);
            return null;
        }
    }

    async searchAttractions(searchTerm: string): Promise<TouristAttraction[]> {
        try {
            const { data, error } = await this.supabase
                .from('guata_tourist_attractions')
                .select('*')
                .eq('is_active', true)
                .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
                .order('name');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erro ao pesquisar atrativos:', error);
            return [];
        }
    }

    // ===== ROTEIROS =====
    async getItineraries(filters?: {
        duration_days?: number;
        difficulty_level?: string;
        target_audience?: string;
        limit?: number;
    }): Promise<Itinerary[]> {
        try {
            if (!this.supabase) {
                console.log('📊 Retornando dados simulados de roteiros');
                return this.getSimulatedItineraries(filters);
            }

            let query = this.supabase
                .from('guata_itineraries')
                .select('*');

            if (filters?.duration_days) {
                query = query.eq('duration_days', filters.duration_days);
            }
            if (filters?.difficulty_level) {
                query = query.eq('difficulty_level', filters.difficulty_level);
            }
            if (filters?.target_audience) {
                query = query.eq('target_audience', filters.target_audience);
            }
            if (filters?.limit) {
                query = query.limit(filters.limit);
            }

            const { data, error } = await query.order('duration_days');
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erro ao buscar roteiros:', error);
            return this.getSimulatedItineraries(filters);
        }
    }

    async getItineraryById(id: string): Promise<Itinerary | null> {
        try {
            const { data, error } = await this.supabase
                .from('guata_itineraries')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao buscar roteiro por ID:', error);
            return null;
        }
    }

    // ===== MEMÓRIA PERSISTENTE =====
    async getUserMemory(
        sessionId: string,
        userId?: string,
        memoryType?: string
    ): Promise<UserMemory[]> {
        try {
            let query = this.supabase
                .from('guata_user_memory')
                .select('*')
                .eq('session_id', sessionId);

            if (userId) {
                query = query.eq('user_id', userId);
            }
            if (memoryType) {
                query = query.eq('memory_type', memoryType);
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erro ao buscar memória do usuário:', error);
            return [];
        }
    }

    async saveUserMemory(memory: Omit<UserMemory, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
        try {
            const { data, error } = await this.supabase
                .from('guata_user_memory')
                .upsert(memory, { onConflict: 'user_id,session_id,memory_type,memory_key' })
                .select('id')
                .single();

            if (error) throw error;
            return data?.id || null;
        } catch (error) {
            console.error('Erro ao salvar memória do usuário:', error);
            return null;
        }
    }

    async deleteUserMemory(memoryId: string): Promise<boolean> {
        try {
            const { error } = await this.supabase
                .from('guata_user_memory')
                .delete()
                .eq('id', memoryId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Erro ao deletar memória do usuário:', error);
            return false;
        }
    }

    // ===== FEEDBACK =====
    async saveFeedback(feedback: Omit<FeedbackEntry, 'id' | 'created_at'>): Promise<string | null> {
        try {
            const { data, error } = await this.supabase
                .from('guata_feedback')
                .insert(feedback)
                .select('id')
                .single();

            if (error) throw error;
            return data?.id || null;
        } catch (error) {
            console.error('Erro ao salvar feedback:', error);
            return null;
        }
    }

    async getFeedbackBySession(sessionId: string): Promise<FeedbackEntry[]> {
        try {
            const { data, error } = await this.supabase
                .from('guata_feedback')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erro ao buscar feedback da sessão:', error);
            return [];
        }
    }

    async getLearningPatterns(): Promise<any[]> {
        try {
            const { data, error } = await this.supabase
                .from('guata_feedback')
                .select('learning_patterns')
                .not('learning_patterns', 'is', null);

            if (error) throw error;
            return data?.map(item => item.learning_patterns).filter(Boolean) || [];
        } catch (error) {
            console.error('Erro ao buscar padrões de aprendizado:', error);
            return [];
        }
    }

    // ===== EVENTOS =====
    async getUpcomingEvents(days: number = 30): Promise<Event[]> {
        try {
            if (!this.supabase) {
                console.log('📊 Retornando dados simulados de eventos');
                return this.getSimulatedEvents();
            }

            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + days);

            const { data, error } = await this.supabase
                .from('guata_events')
                .select('*')
                .eq('is_active', true)
                .gte('start_date', new Date().toISOString().split('T')[0])
                .lte('start_date', futureDate.toISOString().split('T')[0])
                .order('start_date');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erro ao buscar eventos futuros:', error);
            return this.getSimulatedEvents();
        }
    }

    // ===== PARCEIROS =====
    async getVerifiedPartners(filters?: {
        city?: string;
        business_type?: string;
        limit?: number;
    }): Promise<VerifiedPartner[]> {
        try {
            if (!this.supabase) {
                console.log('📊 Retornando dados simulados de parceiros');
                return this.getSimulatedPartners(filters);
            }

            let query = this.supabase
                .from('guata_verified_partners')
                .select('*')
                .eq('verification_status', 'verified')
                .eq('is_active', true);

            if (filters?.city) {
                query = query.eq('city', filters.city);
            }
            if (filters?.business_type) {
                query = query.eq('business_type', filters.business_type);
            }
            if (filters?.limit) {
                query = query.limit(filters.limit);
            }

            const { data, error } = await query.order('rating', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erro ao buscar parceiros verificados:', error);
            return this.getSimulatedPartners(filters);
        }
    }

    // ===== ESTATÍSTICAS =====
    async saveSearchStats(stats: Omit<SearchStats, 'id' | 'created_at'>): Promise<string | null> {
        try {
            if (!this.supabase) {
                console.log('📊 Modo simulado: estatísticas de busca não salvas');
                return `simulated-${Date.now()}`;
            }

            const { data, error } = await this.supabase
                .from('guata_search_stats')
                .insert(stats)
                .select('id')
                .single();

            if (error) throw error;
            return data?.id || null;
        } catch (error) {
            console.error('Erro ao salvar estatísticas de busca:', error);
            return null;
        }
    }

    async getSearchStats(limit: number = 100): Promise<SearchStats[]> {
        try {
            if (!this.supabase) {
                console.log('📊 Retornando estatísticas simuladas de busca');
                return [];
            }

            const { data, error } = await this.supabase
                .from('guata_search_stats')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erro ao buscar estatísticas de busca:', error);
            return [];
        }
    }

    // ===== UTILITÁRIOS =====
    async getDatabaseStats(): Promise<{
        attractions: number;
        itineraries: number;
        events: number;
        partners: number;
        feedback: number;
        searches: number;
    }> {
        try {
            if (!this.supabase) {
                console.log('📊 Retornando estatísticas simuladas do banco');
                return {
                    attractions: 3,
                    itineraries: 2,
                    events: 1,
                    partners: 1,
                    feedback: 0,
                    searches: 0
                };
            }

            const [
                attractionsResult,
                itinerariesResult,
                eventsResult,
                partnersResult,
                feedbackResult,
                searchesResult
            ] = await Promise.all([
                this.supabase.from('guata_tourist_attractions').select('id', { count: 'exact' }),
                this.supabase.from('guata_itineraries').select('id', { count: 'exact' }),
                this.supabase.from('guata_events').select('id', { count: 'exact' }),
                this.supabase.from('guata_verified_partners').select('id', { count: 'exact' }),
                this.supabase.from('guata_feedback').select('id', { count: 'exact' }),
                this.supabase.from('guata_search_stats').select('id', { count: 'exact' })
            ]);

            return {
                attractions: attractionsResult.count || 0,
                itineraries: itinerariesResult.count || 0,
                events: eventsResult.count || 0,
                partners: partnersResult.count || 0,
                feedback: feedbackResult.count || 0,
                searches: searchesResult.count || 0
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas do banco:', error);
            return {
                attractions: 3,
                itineraries: 2,
                events: 1,
                partners: 1,
                feedback: 0,
                searches: 0
            };
        }
    }

    async cleanupExpiredData(): Promise<boolean> {
        try {
            if (!this.supabase) {
                console.log('📊 Modo simulado: limpeza de dados não aplicável');
                return true;
            }

            const now = new Date().toISOString();

            // Limpar memória expirada
            await this.supabase
                .from('guata_user_memory')
                .delete()
                .lt('expires_at', now);

            // Limpar estatísticas antigas (mais de 90 dias)
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

            await this.supabase
                .from('guata_search_stats')
                .delete()
                .lt('created_at', ninetyDaysAgo.toISOString());

            return true;
        } catch (error) {
            console.error('Erro ao limpar dados expirados:', error);
            return false;
        }
    }

    // ===== DADOS SIMULADOS =====
    private getSimulatedAttractions(filters?: any): TouristAttraction[] {
        const attractions: TouristAttraction[] = [
            {
                id: '1',
                name: 'Aquário do Pantanal',
                description: 'O maior aquário de água doce do mundo, localizado em Campo Grande.',
                category: 'turismo',
                location: 'Centro',
                city: 'Campo Grande',
                state: 'MS',
                address: 'Rua das Garças, 1000',
                phone: '(67) 3321-4466',
                website: 'https://aquariodopantanal.ms.gov.br',
                email: 'contato@aquariodopantanal.ms.gov.br',
                coordinates: { lat: -20.4486, lng: -54.6295 },
                average_price: 50,
                opening_hours: { open: '09:00', close: '17:00' },
                best_time_to_visit: 'Manhã',
                accessibility_info: 'Acessível para cadeirantes',
                images: ['aquario1.jpg', 'aquario2.jpg'],
                tags: ['aquário', 'família', 'educativo'],
                official_source: 'turismo.ms.gov.br',
                last_verified: new Date().toISOString(),
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: '2',
                name: 'Gruta do Lago Azul',
                description: 'Uma das mais belas grutas do Brasil, com lago subterrâneo de águas cristalinas.',
                category: 'ecoturismo',
                location: 'Bonito',
                city: 'Bonito',
                state: 'MS',
                address: 'Rodovia MS-178, km 50',
                phone: '(67) 3255-1644',
                website: 'https://bonito.ms.gov.br',
                email: 'turismo@bonito.ms.gov.br',
                coordinates: { lat: -21.1261, lng: -56.4836 },
                average_price: 120,
                opening_hours: { open: '08:00', close: '16:00' },
                best_time_to_visit: 'Manhã',
                accessibility_info: 'Acesso limitado',
                images: ['gruta1.jpg', 'gruta2.jpg'],
                tags: ['gruta', 'natureza', 'aventura'],
                official_source: 'visitms.com.br',
                last_verified: new Date().toISOString(),
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: '3',
                name: 'Passeio de Barco no Pantanal',
                description: 'Experiência única de navegação pelos rios do Pantanal sul-mato-grossense.',
                category: 'ecoturismo',
                location: 'Pantanal',
                city: 'Corumbá',
                state: 'MS',
                address: 'Porto Geral',
                phone: '(67) 3231-4455',
                website: 'https://corumba.ms.gov.br',
                email: 'turismo@corumba.ms.gov.br',
                coordinates: { lat: -19.0084, lng: -57.6515 },
                average_price: 200,
                opening_hours: { open: '06:00', close: '18:00' },
                best_time_to_visit: 'Amanhecer',
                accessibility_info: 'Acesso por barco',
                images: ['pantanal1.jpg', 'pantanal2.jpg'],
                tags: ['pantanal', 'barco', 'natureza'],
                official_source: 'turismo.ms.gov.br',
                last_verified: new Date().toISOString(),
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];

        // Aplicar filtros
        let filtered = attractions;
        
        if (filters?.city) {
            filtered = filtered.filter(a => a.city.toLowerCase().includes(filters.city.toLowerCase()));
        }
        if (filters?.category) {
            filtered = filtered.filter(a => a.category === filters.category);
        }
        if (filters?.tags && filters.tags.length > 0) {
            filtered = filtered.filter(a => a.tags.some(tag => filters.tags.includes(tag)));
        }
        if (filters?.limit) {
            filtered = filtered.slice(0, filters.limit);
        }

        return filtered;
    }

    private getSimulatedItineraries(filters?: any): Itinerary[] {
        const itineraries: Itinerary[] = [
            {
                id: '1',
                title: 'Roteiro Completo de Bonito',
                description: '3 dias explorando as principais atrações de Bonito, incluindo grutas, cachoeiras e flutuação.',
                duration_days: 3,
                difficulty_level: 'moderado',
                target_audience: 'família',
                total_cost_estimate: 1500,
                season_recommendation: 'abril a outubro',
                attractions: ['Gruta do Lago Azul', 'Rio Sucuri', 'Buraco das Araras'],
                daily_schedule: {
                    'dia1': ['Chegada', 'Gruta do Lago Azul', 'Jantar'],
                    'dia2': ['Flutuação Rio Sucuri', 'Buraco das Araras', 'Jantar'],
                    'dia3': ['Cachoeiras', 'Partida']
                },
                transportation_info: 'Transfer incluído',
                accommodation_suggestions: 'Hotéis em Bonito',
                tips: 'Levar roupas de banho e protetor solar',
                is_featured: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: '2',
                title: 'Pantanal em 2 Dias',
                description: 'Imersão no Pantanal sul-mato-grossense com safáris fotográficos e passeios de barco.',
                duration_days: 2,
                difficulty_level: 'fácil',
                target_audience: 'aventura',
                total_cost_estimate: 800,
                season_recommendation: 'maio a setembro',
                attractions: ['Passeio de Barco', 'Safári Fotográfico', 'Observação de Aves'],
                daily_schedule: {
                    'dia1': ['Chegada', 'Passeio de Barco', 'Jantar'],
                    'dia2': ['Safári', 'Partida']
                },
                transportation_info: 'Barco e 4x4 incluídos',
                accommodation_suggestions: 'Pousadas no Pantanal',
                tips: 'Levar binóculos e câmera',
                is_featured: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];

        // Aplicar filtros
        let filtered = itineraries;
        
        if (filters?.duration_days) {
            filtered = filtered.filter(i => i.duration_days === filters.duration_days);
        }
        if (filters?.difficulty_level) {
            filtered = filtered.filter(i => i.difficulty_level === filters.difficulty_level);
        }
        if (filters?.target_audience) {
            filtered = filtered.filter(i => i.target_audience === filters.target_audience);
        }
        if (filters?.limit) {
            filtered = filtered.slice(0, filters.limit);
        }

        return filtered;
    }

    private getSimulatedEvents(): Event[] {
        const events: Event[] = [
            {
                id: '1',
                title: 'Festival de Inverno de Bonito',
                description: 'Festival cultural com música, gastronomia e atividades turísticas em Bonito.',
                event_type: 'cultural',
                location: 'Centro de Bonito',
                city: 'Bonito',
                start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias
                end_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 9 dias
                start_time: '18:00',
                end_time: '23:00',
                price_info: 'Gratuito',
                website: 'https://bonito.ms.gov.br',
                contact_info: { phone: '(67) 3255-1644', email: 'festival@bonito.ms.gov.br' },
                is_recurring: false,
                recurrence_pattern: null,
                source: 'turismo.ms.gov.br',
                last_verified: new Date().toISOString(),
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];

        return events;
    }

    private getSimulatedPartners(filters?: any): VerifiedPartner[] {
        const partners: VerifiedPartner[] = [
            {
                id: '1',
                business_name: 'Hotel Pantanal',
                business_type: 'hospedagem',
                description: 'Hotel 4 estrelas no coração do Pantanal sul-mato-grossense.',
                city: 'Corumbá',
                state: 'MS',
                address: 'Rua do Comércio, 123',
                phone: '(67) 3231-4455',
                website: 'https://hotelpantanal.com.br',
                email: 'reservas@hotelpantanal.com.br',
                rating: 4.5,
                review_count: 150,
                verification_status: 'verified',
                verification_date: new Date().toISOString(),
                specializations: ['pantanal', 'ecoturismo', 'safári'],
                services: ['hospedagem', 'restaurante', 'passeios'],
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];

        // Aplicar filtros
        let filtered = partners;
        
        if (filters?.city) {
            filtered = filtered.filter(p => p.city.toLowerCase().includes(filters.city.toLowerCase()));
        }
        if (filters?.business_type) {
            filtered = filtered.filter(p => p.business_type === filters.business_type);
        }
        if (filters?.limit) {
            filtered = filtered.slice(0, filters.limit);
        }

        return filtered;
    }
}

export const guataDatabaseService = new GuataDatabaseService();

// Limpeza automática a cada hora
setInterval(() => {
    guataDatabaseService.cleanupExpiredData();
}, 60 * 60 * 1000);
