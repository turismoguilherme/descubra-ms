import { supabase } from '@/integrations/supabase/client';

// Tipos para eventos automáticos
export interface AutoEvent {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: {
    address: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  category: 'cultural' | 'gastronomia' | 'esporte' | 'negocios' | 'turismo' | 'outros';
  source: 'sympla' | 'eventbrite' | 'facebook' | 'instagram' | 'government' | 'manual';
  external_id?: string;
  external_url?: string;
  image_url?: string;
  price_range?: string;
  tags: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventSource {
  name: string;
  url: string;
  api_key?: string; // Adicionado para chaves de API
  active: boolean;
  last_sync: string;
}

export class AutoEventService {
  private static instance: AutoEventService;

  private constructor() {
    // Construtor privado para garantir que a classe só possa ser instanciada via getInstance()
  }

  public static getInstance(): AutoEventService {
    if (!AutoEventService.instance) {
      AutoEventService.instance = new AutoEventService();
    }
    return AutoEventService.instance;
  }

  private sources: EventSource[] = [
    {
      name: 'Sympla',
      url: 'https://api.sympla.com.br/public/v3/events', // URL atualizada da API pública do Sympla (exemplo)
      api_key: import.meta.env.VITE_SYMPLA_API_KEY as string, // Usar variável de ambiente
      active: true,
      last_sync: new Date().toISOString()
    },
    {
      name: 'Eventbrite',
      url: 'https://www.eventbriteapi.com/v3/events',
      active: true,
      last_sync: new Date().toISOString()
    },
    {
      name: 'Facebook Events',
      url: 'https://graph.facebook.com/v18.0/search',
      active: false, // Desativado por enquanto, pois o foco é Sympla e APIs governamentais
      last_sync: new Date().toISOString()
    },
    {
      name: 'Secretaria de Turismo MS',
      url: 'https://api.turismo.ms.gov.br/events',
      active: true,
      last_sync: new Date().toISOString()
    }
  ];

  // Buscar eventos automaticamente de fontes externas
  async fetchAutoEvents(city: string = 'Campo Grande', limit: number = 50): Promise<AutoEvent[]> {
    console.log('🔄 Buscando eventos automáticos para:', city);
    
    const events: AutoEvent[] = [];
    
    try {
      // Buscar de múltiplas fontes em paralelo
      const promises = this.sources
        .filter(source => source.active)
        .map(source => this.fetchFromSource(source, city, limit));
      
      const results = await Promise.allSettled(promises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          events.push(...result.value);
        } else {
          console.error(`❌ Erro ao buscar de ${this.sources[index].name}:`, result.reason);
        }
      });

      // Salvar eventos no banco
      await this.saveEvents(events);
      
      console.log(`✅ ${events.length} eventos encontrados e salvos`);
      return events;
      
    } catch (error) {
      console.error('❌ Erro ao buscar eventos automáticos:', error);
      throw error;
    }
  }

  // Buscar eventos de uma fonte específica
  private async fetchFromSource(source: EventSource, city: string, limit: number): Promise<AutoEvent[]> {
    const events: AutoEvent[] = [];
    
    try {
      switch (source.name) {
        case 'Sympla':
          if (source.api_key) { // Verificar se a chave da API existe
            events.push(...await this.fetchFromSympla(city, limit, source.api_key));
          } else {
            console.warn('⚠️ Chave de API da Sympla não configurada. Pulando busca de eventos da Sympla.');
          }
          break;
        case 'Eventbrite':
          // Implementação futura para Eventbrite
          console.warn('⚠️ Implementação da API Eventbrite pendente.');
          break;
        case 'Facebook Events':
          // Implementação futura para Facebook Events
          console.warn('⚠️ Implementação da API Facebook Events pendente.');
          break;
        case 'Secretaria de Turismo MS':
          events.push(...await this.fetchFromGovernmentAPI(city, limit));
          break;
      }
    } catch (error) {
      console.error(`❌ Erro ao buscar de ${source.name}:`, error);
    }
    
    return events;
  }

  // Buscar eventos da Sympla
  private async fetchFromSympla(city: string, limit: number, apiKey: string): Promise<AutoEvent[]> {
    // Lógica para chamar a API real do Sympla
    console.log(`📡 Chamando API da Sympla para ${city} com chave: ${apiKey ? '*****' : 'N/A'}`);
    const symplaEvents: AutoEvent[] = [];

    try {
      // A Sympla API de eventos públicos requer autenticação e pode ter filtros de localização.
      // A URL abaixo é um exemplo e pode precisar ser ajustada para a API real que permite listar eventos abertos ao público.
      const response = await fetch(`${this.sources[0].url}?city=${encodeURIComponent(city)}&limit=${limit}`, {
        headers: {
          'S_TOKEN': apiKey, // Exemplo de como a Sympla pode esperar o token
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar eventos da Sympla: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Mapear os dados da resposta da API Sympla para o formato AutoEvent
      // Esta é uma simulação, a estrutura real da resposta da Sympla API precisaria ser validada.
      data.events.forEach((event: any) => {
        symplaEvents.push({
          id: `sympla-${event.id}`,
          title: event.name,
          description: event.description,
          start_date: event.start_date,
          end_date: event.end_date,
          location: {
            address: event.address.street,
            city: event.address.city,
            coordinates: { lat: event.address.latitude, lng: event.address.longitude }
          },
          category: event.category || 'outros', // Ajustar categorias conforme API Sympla
          source: 'sympla',
          external_id: event.id,
          external_url: event.url,
          image_url: event.image_url || '',
          price_range: event.price_range || '',
          tags: event.tags || [],
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      });

    } catch (error) {
      console.error('❌ Erro ao buscar da Sympla API real:', error);
    }

    return symplaEvents.slice(0, limit);
  }

  // Buscar eventos do Eventbrite (simulado) - Removido lógica simulada para foco na integração real
  private async fetchFromEventbrite(city: string, limit: number): Promise<AutoEvent[]> {
    return []; // A ser implementado
  }

  // Buscar eventos do Facebook (simulado) - Removido lógica simulada para foco na integração real
  private async fetchFromFacebook(city: string, limit: number): Promise<AutoEvent[]> {
    return []; // A ser implementado
  }

  // Buscar eventos da API governamental (simulado) - Mantido para exemplo, mas será integrado com API real
  private async fetchFromGovernmentAPI(city: string, limit: number): Promise<AutoEvent[]> {
    const governmentEvents: AutoEvent[] = [
      {
        id: `gov-${Date.now()}-1`,
        title: 'Semana do Turismo MS',
        description: 'Evento oficial da Secretaria de Turismo com palestras e workshops.',
        start_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
        location: {
          address: 'Palácio Popular da Cultura',
          city: 'Campo Grande',
          coordinates: { lat: -20.4450, lng: -54.6350 }
        },
        category: 'turismo',
        source: 'government',
        external_id: 'gov-22222',
        external_url: 'https://www.turismo.ms.gov.br/semana-do-turismo', // Adicionando URL externa de exemplo
        image_url: 'https://images.unsplash.com/photo-1517457210988-c0b0532551a1?w=400',
        price_range: 'Gratuito',
        tags: ['turismo', 'seminário', 'MS', 'oficial'],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return governmentEvents.slice(0, limit);
  }

  // Salvar eventos no banco de dados
  private async saveEvents(events: AutoEvent[]): Promise<void> {
    try {
      for (const event of events) {
        // Verificar se o evento já existe
        const { data: existing } = await supabase
          .from('auto_events')
          .select('id')
          .eq('external_id', event.external_id)
          .eq('source', event.source)
          .single();

        if (!existing) {
          // Inserir novo evento
          await supabase
            .from('auto_events')
            .insert([event]);
        } else {
          // Atualizar evento existente
          await supabase
            .from('auto_events')
            .update({
              ...event,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao salvar eventos:', error);
      throw error;
    }
  }

  // Buscar eventos salvos
  async getEvents(filters?: {
    city?: string;
    category?: string;
    start_date?: string;
    end_date?: string;
    source?: string;
  }): Promise<AutoEvent[]> {
    try {
      let query = supabase
        .from('auto_events')
        .select('*')
        .eq('active', true)
        .order('start_date', { ascending: true });

      if (filters?.city) {
        query = query.eq('location->>city', filters.city);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.start_date) {
        query = query.gte('start_date', filters.start_date);
      }

      if (filters?.end_date) {
        query = query.lte('end_date', filters.end_date);
      }

      if (filters?.source) {
        query = query.eq('source', filters.source);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar eventos:', error);
      throw error;
    }
  }

  // Sincronizar eventos automaticamente
  async syncEvents(): Promise<void> {
    console.log('🔄 Iniciando sincronização automática de eventos...');
    
    try {
      const cities = ['Campo Grande', 'Bonito', 'Corumbá', 'Dourados'];
      
      for (const city of cities) {
        await this.fetchAutoEvents(city, 20);
      }
      
      console.log('✅ Sincronização concluída');
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      throw error;
    }
  }

  // Obter estatísticas de eventos
  async getEventStats(): Promise<{
    total_events: number;
    by_category: Record<string, number>;
    by_source: Record<string, number>;
    upcoming_events: number;
  }> {
    try {
      const { data: events, error } = await supabase
        .from('auto_events')
        .select('*')
        .eq('active', true);

      if (error) throw error;

      const stats = {
        total_events: events?.length || 0,
        by_category: {} as Record<string, number>,
        by_source: {} as Record<string, number>,
        upcoming_events: 0
      };

      events?.forEach(event => {
        // Contar por categoria
        stats.by_category[event.category] = (stats.by_category[event.category] || 0) + 1;
        
        // Contar por fonte
        stats.by_source[event.source] = (stats.by_source[event.source] || 0) + 1;
        
        // Contar eventos futuros
        if (new Date(event.start_date) > new Date()) {
          stats.upcoming_events++;
        }
      });

      return stats;
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      throw error;
    }
  }
}

// Instância singleton
export const autoEventService = AutoEventService.getInstance(); 