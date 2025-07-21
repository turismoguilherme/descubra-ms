import { supabase } from '@/integrations/supabase/client';
import { geminiClient } from '@/config/gemini';

// Tipos para roteiros turísticos
export interface TourismRoute {
  id: string;
  name: string;
  description: string;
  duration_hours: number;
  distance_km: number;
  difficulty: 'facil' | 'medio' | 'dificil';
  category: 'cultural' | 'natureza' | 'gastronomia' | 'aventura' | 'familia' | 'romantico' | 'negocios';
  target_audience: string[];
  attractions: RouteAttraction[];
  waypoints: RouteWaypoint[];
  estimated_cost: {
    min: number;
    max: number;
    currency: string;
  };
  best_time: {
    season: string[];
    time_of_day: string[];
    weather_conditions: string[];
  };
  accessibility: {
    wheelchair_accessible: boolean;
    pet_friendly: boolean;
    child_friendly: boolean;
    senior_friendly: boolean;
  };
  tags: string[];
  rating: number;
  review_count: number;
  created_by: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RouteAttraction {
  id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
  visit_duration_minutes: number;
  cost_range: string;
  category: string;
  highlights: string[];
  tips: string[];
}

export interface RouteWaypoint {
  order: number;
  attraction_id: string;
  travel_time_minutes: number;
  travel_distance_km: number;
  transport_mode: 'car' | 'bus' | 'walk' | 'bike' | 'boat';
  notes: string;
}

export interface RouteRequest {
  user_preferences: {
    interests: string[];
    budget_range: string;
    duration_hours: number;
    group_size: number;
    accessibility_needs: string[];
    transport_preference: string;
  };
  location: {
    city: string;
    region: string;
    coordinates?: { lat: number; lng: number };
  };
  special_requirements?: string[];
}

// Novas interfaces que mapeiam as tabelas do Supabase (criadas na migração 20250721100000_create_tourism_passport_tables.sql)
export interface Route {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface Checkpoint {
  id: string;
  route_id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  stamp_image_url: string | null;
  reward_id: string | null;
  order: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  reward_type: string | null;
  value: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface UserStamp {
  id: string;
  user_id: string;
  checkpoint_id: string;
  route_id: string;
  stamped_at: string;
}

export interface UserReward {
  id: string;
  user_id: string;
  reward_id: string;
  awarded_at: string;
}

class TourismRouteService {
  // ATENÇÃO: As interfaces TourismRoute, RouteAttraction e RouteWaypoint
  // e os métodos relacionados à IA (generatePersonalizedRoute, buildRoutePrompt,
  // parseAIRouteResponse, getAvailableAttractions, generateBioceanicRoute,
  // generateExtendedStayRoute, rateRoute) ainda utilizam a antiga estrutura
  // de 'tourism_routes' e objetos aninhados.
  // Estes métodos precisarão ser refatorados futuramente para interagir
  // com as novas tabelas 'routes' e 'checkpoints' e suas interfaces.
  // Por enquanto, vamos focar nos novos métodos CRUD para as novas tabelas.

  // --- MÉTODOS CRUD PARA public.routes ---

  async createRoute(routeData: Omit<Route, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>): Promise<Route> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      const { data, error } = await supabase
        .from('routes')
        .insert({
          ...routeData,
          created_by: user.id,
          updated_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Roteiro criado (public.routes):', data.name);
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar roteiro (public.routes):', error);
      throw error;
    }
  }

  async getRoutes(): Promise<Route[]> {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true }); // Ordenar por nome

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar roteiros (public.routes):', error);
      throw error;
    }
  }

  async getRouteById(id: string): Promise<Route | null> {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 é "no rows found"
      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar roteiro por ID (public.routes):', error);
      throw error;
    }
  }

  async updateRoute(id: string, updates: Partial<Omit<Route, 'id' | 'created_at' | 'created_by'>>): Promise<Route> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      const { data, error } = await supabase
        .from('routes')
        .update({
          ...updates,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Roteiro atualizado (public.routes):', data.name);
      return data;
    } catch (error) {
      console.error('❌ Erro ao atualizar roteiro (public.routes):', error);
      throw error;
    }
  }

  async deleteRoute(id: string): Promise<void> {
    try {
      // O RLS já cuidará das permissões de deleção
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Roteiro excluído (public.routes):', id);
    } catch (error) {
      console.error('❌ Erro ao excluir roteiro (public.routes):', error);
      throw error;
    }
  }

  // --- MÉTODOS CRUD PARA public.checkpoints ---

  async createCheckpoint(checkpointData: Omit<Checkpoint, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>): Promise<Checkpoint> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      const { data, error } = await supabase
        .from('checkpoints')
        .insert({
          ...checkpointData,
          created_by: user.id,
          updated_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Checkpoint criado:', data.name);
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar checkpoint:', error);
      throw error;
    }
  }

  async getCheckpointsByRouteId(routeId: string): Promise<Checkpoint[]> {
    try {
      const { data, error } = await supabase
        .from('checkpoints')
        .select('*')
        .eq('route_id', routeId)
        .order('order', { ascending: true }); // Ordenar por campo 'order'

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar checkpoints:', error);
      throw error;
    }
  }

  async updateCheckpoint(id: string, updates: Partial<Omit<Checkpoint, 'id' | 'route_id' | 'created_at' | 'created_by'>>): Promise<Checkpoint> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      const { data, error } = await supabase
        .from('checkpoints')
        .update({
          ...updates,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Checkpoint atualizado:', data.name);
      return data;
    } catch (error) {
      console.error('❌ Erro ao atualizar checkpoint:', error);
      throw error;
    }
  }

  async deleteCheckpoint(id: string): Promise<void> {
    try {
      // O RLS já cuidará das permissões de deleção
      const { error } = await supabase
        .from('checkpoints')
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Checkpoint excluído:', id);
    } catch (error) {
      console.error('❌ Erro ao excluir checkpoint:', error);
      throw error;
    }
  }

  // Gerar roteiro personalizado com IA
  async generatePersonalizedRoute(request: RouteRequest): Promise<TourismRoute> {
    try {
      console.log('🧠 Gerando roteiro personalizado...');

      // Buscar atrações disponíveis
      const attractions = await this.getAvailableAttractions(request.location.city);
      
      // Gerar roteiro com IA
      const prompt = this.buildRoutePrompt(request, attractions);
      const aiResponse = await geminiClient.generateContent(prompt);
      
      // Processar resposta da IA
      const routeData = this.parseAIRouteResponse(aiResponse, request);
      
      // Salvar roteiro
      const route = await this.createRoute(routeData);
      
      console.log('✅ Roteiro personalizado gerado:', route.name);
      return route;
      
    } catch (error) {
      console.error('❌ Erro ao gerar roteiro personalizado:', error);
      throw error;
    }
  }

  // Construir prompt para IA
  private buildRoutePrompt(request: RouteRequest, attractions: any[]): string {
    return `
Você é um especialista em turismo de Mato Grosso do Sul. Crie um roteiro turístico personalizado baseado nas preferências do usuário.

PREFERÊNCIAS DO USUÁRIO:
- Interesses: ${request.user_preferences.interests.join(', ')}
- Orçamento: ${request.user_preferences.budget_range}
- Duração: ${request.user_preferences.duration_hours} horas
- Tamanho do grupo: ${request.user_preferences.group_size} pessoas
- Necessidades de acessibilidade: ${request.user_preferences.accessibility_needs.join(', ')}
- Preferência de transporte: ${request.user_preferences.transport_preference}
- Localização: ${request.location.city}, ${request.location.region}
- Requisitos especiais: ${request.special_requirements?.join(', ') || 'Nenhum'}

ATRAÇÕES DISPONÍVEIS:
${attractions.map(att => `- ${att.name}: ${att.description} (${att.category})`).join('\n')}

INSTRUÇÕES:
1. Crie um roteiro otimizado que maximize a experiência do usuário
2. Considere tempo de deslocamento entre atrações
3. Inclua dicas práticas e recomendações
4. Calcule custo estimado realista
5. Considere acessibilidade e necessidades especiais
6. Sugira horários ideais para cada atração
7. Inclua opções de alimentação e descanso

FORMATO DE RESPOSTA (JSON):
{
  "name": "Nome do Roteiro",
  "description": "Descrição detalhada",
  "duration_hours": 8,
  "distance_km": 25,
  "difficulty": "facil",
  "category": "cultural",
  "target_audience": ["familia", "casais"],
  "attractions": [
    {
      "name": "Nome da Atração",
      "description": "Descrição",
      "visit_duration_minutes": 60,
      "highlights": ["destaque1", "destaque2"],
      "tips": ["dica1", "dica2"]
    }
  ],
  "estimated_cost": {
    "min": 100,
    "max": 300,
    "currency": "BRL"
  },
  "best_time": {
    "season": ["primavera", "outono"],
    "time_of_day": ["manhã", "tarde"],
    "weather_conditions": ["ensolarado", "poucas nuvens"]
  },
  "accessibility": {
    "wheelchair_accessible": true,
    "pet_friendly": false,
    "child_friendly": true,
    "senior_friendly": true
  },
  "tags": ["tag1", "tag2"]
}
`;
  }

  // Processar resposta da IA
  private parseAIRouteResponse(aiResponse: string, request: RouteRequest): Omit<TourismRoute, 'id' | 'created_at' | 'updated_at'> {
    try {
      // Extrair JSON da resposta da IA
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta da IA não contém JSON válido');
      }

      const routeData = JSON.parse(jsonMatch[0]);
      
      // Construir waypoints baseado nas atrações
      const waypoints: RouteWaypoint[] = routeData.attractions.map((attraction: any, index: number) => ({
        order: index + 1,
        attraction_id: `attraction-${index}`,
        travel_time_minutes: index === 0 ? 0 : 30, // Simular tempo de viagem
        travel_distance_km: index === 0 ? 0 : 5, // Simular distância
        transport_mode: request.user_preferences.transport_preference as any,
        notes: `Deslocamento para ${attraction.name}`
      }));

      return {
        name: routeData.name,
        description: routeData.description,
        duration_hours: routeData.duration_hours,
        distance_km: routeData.distance_km,
        difficulty: routeData.difficulty,
        category: routeData.category,
        target_audience: routeData.target_audience,
        attractions: routeData.attractions,
        waypoints,
        estimated_cost: routeData.estimated_cost,
        best_time: routeData.best_time,
        accessibility: routeData.accessibility,
        tags: routeData.tags,
        rating: 0,
        review_count: 0,
        created_by: 'ai-system',
        active: true
      };
    } catch (error) {
      console.error('❌ Erro ao processar resposta da IA:', error);
      throw error;
    }
  }

  // Buscar atrações disponíveis
  private async getAvailableAttractions(city: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('tourism_data')
        .select('*')
        .eq('active', true)
        .eq('location->>city', city)
        .in('type', ['attraction', 'restaurant', 'hotel']);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar atrações:', error);
      return [];
    }
  }

  // Gerar roteiro para Rota Bioceânica
  async generateBioceanicRoute(): Promise<TourismRoute> {
    const bioceanicRoute: Omit<TourismRoute, 'id' | 'created_at' | 'updated_at'> = {
      name: 'Rota Bioceânica - Experiência Completa',
      description: 'Roteiro especializado para viajantes da Rota Bioceânica, explorando as melhores atrações de Campo Grande e região.',
      duration_hours: 24,
      distance_km: 150,
      difficulty: 'facil',
      category: 'negocios',
      target_audience: ['executivos', 'viajantes internacionais', 'caminhoneiros'],
      attractions: [
        {
          id: 'bioceanic-1',
          name: 'Centro de Convenções Rubens Gil de Camillo',
          description: 'Principal centro de eventos da região, ideal para negócios e convenções.',
          location: {
            address: 'Av. Afonso Pena, 4001',
            city: 'Campo Grande',
            coordinates: { lat: -20.4431, lng: -54.6474 }
          },
          visit_duration_minutes: 120,
          cost_range: 'Gratuito - R$ 500',
          category: 'negocios',
          highlights: ['Infraestrutura moderna', 'Localização central', 'Estacionamento amplo'],
          tips: ['Reserve com antecedência', 'Verifique agenda de eventos']
        },
        {
          id: 'bioceanic-2',
          name: 'Feira Central',
          description: 'Experiência gastronômica única com comidas típicas do Pantanal.',
          location: {
            address: 'Rua 14 de Julho, Centro',
            city: 'Campo Grande',
            coordinates: { lat: -20.4400, lng: -54.6400 }
          },
          visit_duration_minutes: 90,
          cost_range: 'R$ 30-80',
          category: 'gastronomia',
          highlights: ['Comida típica', 'Ambiente autêntico', 'Preços acessíveis'],
          tips: ['Visite no jantar', 'Experimente o peixe frito']
        },
        {
          id: 'bioceanic-3',
          name: 'Parque das Nações Indígenas',
          description: 'Parque urbano com lago e área de lazer, ideal para relaxamento.',
          location: {
            address: 'Av. Afonso Pena, s/n',
            city: 'Campo Grande',
            coordinates: { lat: -20.4486, lng: -54.6295 }
          },
          visit_duration_minutes: 60,
          cost_range: 'Gratuito',
          category: 'natureza',
          highlights: ['Lago artificial', 'Trilhas', 'Área de lazer'],
          tips: ['Visite no final da tarde', 'Leve água']
        }
      ],
      waypoints: [
        {
          order: 1,
          attraction_id: 'bioceanic-1',
          travel_time_minutes: 0,
          travel_distance_km: 0,
          transport_mode: 'car',
          notes: 'Ponto de partida'
        },
        {
          order: 2,
          attraction_id: 'bioceanic-2',
          travel_time_minutes: 15,
          travel_distance_km: 3,
          transport_mode: 'car',
          notes: 'Deslocamento para Feira Central'
        },
        {
          order: 3,
          attraction_id: 'bioceanic-3',
          travel_time_minutes: 10,
          travel_distance_km: 2,
          transport_mode: 'car',
          notes: 'Deslocamento para Parque'
        }
      ],
      estimated_cost: {
        min: 100,
        max: 300,
        currency: 'BRL'
      },
      best_time: {
        season: ['primavera', 'outono', 'inverno'],
        time_of_day: ['manhã', 'tarde', 'noite'],
        weather_conditions: ['ensolarado', 'poucas nuvens']
      },
      accessibility: {
        wheelchair_accessible: true,
        pet_friendly: false,
        child_friendly: true,
        senior_friendly: true
      },
      tags: ['rota bioceânica', 'negócios', 'gastronomia', 'relaxamento'],
      rating: 4.8,
      review_count: 45,
      created_by: 'system',
      active: true
    };

    return this.createRoute(bioceanicRoute);
  }

  // Gerar roteiro para aumentar permanência em Campo Grande
  async generateExtendedStayRoute(): Promise<TourismRoute> {
    const extendedRoute: Omit<TourismRoute, 'id' | 'created_at' | 'updated_at'> = {
      name: 'Campo Grande - Experiência Completa de 3 Dias',
      description: 'Roteiro para transformar Campo Grande de cidade de passagem em destino turístico, explorando cultura, gastronomia e natureza.',
      duration_hours: 72,
      distance_km: 80,
      difficulty: 'facil',
      category: 'cultural',
      target_audience: ['turistas', 'familias', 'casais'],
      attractions: [
        {
          id: 'extended-1',
          name: 'Museu de Arte Contemporânea',
          description: 'Museu com exposições de arte moderna e contemporânea.',
          location: {
            address: 'Rua Antônio Maria Coelho, 6000',
            city: 'Campo Grande',
            coordinates: { lat: -20.4500, lng: -54.6300 }
          },
          visit_duration_minutes: 120,
          cost_range: 'R$ 10-20',
          category: 'cultural',
          highlights: ['Arte contemporânea', 'Exposições temporárias', 'Arquitetura moderna'],
          tips: ['Visite no período da manhã', 'Verifique programação']
        },
        {
          id: 'extended-2',
          name: 'Mercado Municipal',
          description: 'Mercado tradicional com produtos regionais e gastronomia local.',
          location: {
            address: 'Rua 7 de Setembro, 65',
            city: 'Campo Grande',
            coordinates: { lat: -20.4420, lng: -54.6380 }
          },
          visit_duration_minutes: 90,
          cost_range: 'R$ 20-60',
          category: 'gastronomia',
          highlights: ['Produtos regionais', 'Comida típica', 'Ambiente autêntico'],
          tips: ['Visite no café da manhã', 'Experimente o tereré']
        },
        {
          id: 'extended-3',
          name: 'Horto Florestal',
          description: 'Parque natural com trilhas e área de preservação ambiental.',
          location: {
            address: 'Rua Rodolfo José Pinho, s/n',
            city: 'Campo Grande',
            coordinates: { lat: -20.4550, lng: -54.6250 }
          },
          visit_duration_minutes: 180,
          cost_range: 'Gratuito',
          category: 'natureza',
          highlights: ['Trilhas naturais', 'Biodiversidade', 'Paisagem preservada'],
          tips: ['Use protetor solar', 'Leve água e lanche']
        }
      ],
      waypoints: [
        {
          order: 1,
          attraction_id: 'extended-1',
          travel_time_minutes: 0,
          travel_distance_km: 0,
          transport_mode: 'car',
          notes: 'Dia 1 - Manhã'
        },
        {
          order: 2,
          attraction_id: 'extended-2',
          travel_time_minutes: 20,
          travel_distance_km: 4,
          transport_mode: 'car',
          notes: 'Dia 1 - Tarde'
        },
        {
          order: 3,
          attraction_id: 'extended-3',
          travel_time_minutes: 15,
          travel_distance_km: 3,
          transport_mode: 'car',
          notes: 'Dia 2 - Manhã'
        }
      ],
      estimated_cost: {
        min: 200,
        max: 600,
        currency: 'BRL'
      },
      best_time: {
        season: ['primavera', 'outono'],
        time_of_day: ['manhã', 'tarde'],
        weather_conditions: ['ensolarado', 'poucas nuvens']
      },
      accessibility: {
        wheelchair_accessible: true,
        pet_friendly: true,
        child_friendly: true,
        senior_friendly: true
      },
      tags: ['cultura', 'gastronomia', 'natureza', 'família'],
      rating: 4.9,
      review_count: 78,
      created_by: 'system',
      active: true
    };

    return this.createRoute(extendedRoute);
  }

  // Avaliar roteiro
  async rateRoute(routeId: string, rating: number, review?: string): Promise<void> {
    try {
      // Buscar roteiro atual
      const route = await this.getRouteById(routeId);
      if (!route) throw new Error('Roteiro não encontrado');

      // Calcular nova média
      const newRating = (route.rating * route.review_count + rating) / (route.review_count + 1);

      // Atualizar roteiro
      await supabase
        .from('tourism_routes')
        .update({
          rating: newRating,
          review_count: route.review_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', routeId);

      // Salvar review se fornecido
      if (review) {
        await supabase
          .from('route_reviews')
          .insert([{
            route_id: routeId,
            rating,
            review,
            created_at: new Date().toISOString()
          }]);
      }

      console.log('✅ Avaliação salva');
    } catch (error) {
      console.error('❌ Erro ao avaliar roteiro:', error);
      throw error;
    }
  }
}

// Instância singleton
export const tourismRouteService = new TourismRouteService(); 