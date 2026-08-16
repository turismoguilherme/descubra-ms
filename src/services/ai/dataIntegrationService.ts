import { supabase } from '@/integrations/supabase/client';

export class DataIntegrationService {
  async collectTourismData() {
    try {
      // Coleta dados dos turistas
      const touristData = await this.collectTouristData();
      
      // Coleta dados da cidade
      const cityData = await this.collectCityData();
      
      // Coleta dados de eventos
      const eventsData = await this.collectEventsData();
      
      // Coleta dados econômicos
      const economicData = await this.collectEconomicData();

      return {
        tourist: touristData,
        city: cityData,
        events: eventsData,
        economic: economicData
      };
    } catch (error) {
      console.error('Erro ao coletar dados:', error);
      throw error;
    }
  }

  private async collectTouristData() {
    // Coleta dados de perfil dos turistas (alterado de tourist_profiles para user_profiles)
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Coleta avaliações e feedback (tabela tourist_reviews não existe, retornando array vazio)
    const reviews = [];

    // Coleta dados de permanência (tabela tourist_stays não existe, retornando array vazio)
    const stays = [];

    return {
      profiles,
      reviews,
      stays
    };
  }

  private async collectCityData() {
    // Coleta dados de infraestrutura (tabela city_infrastructure não existe, retornando array vazio)
    const infrastructure = [];

    // Coleta dados de mobilidade (tabela city_mobility não existe, retornando array vazio)
    const mobility = [];

    // Coleta dados de atrativos (tabela tourist_attractions não existe, retornando array vazio)
    const attractions = [];

    return {
      infrastructure,
      mobility,
      attractions
    };
  }

  private async collectEventsData() {
    // Coleta dados de eventos (alterado de city_events para events)
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    // Coleta dados de participação (tabela event_participation não existe, retornando array vazio)
    const participation = [];

    return {
      events,
      participation
    };
  }

  private async collectEconomicData() {
    // Coleta dados de gastos turísticos (tabela tourist_spending não existe, retornando array vazio)
    const spending = [];

    // Coleta dados de empregos (tabela tourism_jobs não existe, retornando array vazio)
    const jobs = [];

    // Coleta dados de investimentos (tabela tourism_investments não existe, retornando array vazio)
    const investments = [];

    return {
      spending,
      jobs,
      investments
    };
  }
} 