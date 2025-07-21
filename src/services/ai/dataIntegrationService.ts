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
    // Coleta dados de perfil dos turistas
    const { data: profiles } = await supabase
      .from('tourist_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Coleta avaliações e feedback
    const { data: reviews } = await supabase
      .from('tourist_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    // Coleta dados de permanência
    const { data: stays } = await supabase
      .from('tourist_stays')
      .select('*')
      .order('check_in', { ascending: false });

    return {
      profiles,
      reviews,
      stays
    };
  }

  private async collectCityData() {
    // Coleta dados de infraestrutura
    const { data: infrastructure } = await supabase
      .from('city_infrastructure')
      .select('*');

    // Coleta dados de mobilidade
    const { data: mobility } = await supabase
      .from('city_mobility')
      .select('*')
      .order('timestamp', { ascending: false });

    // Coleta dados de atrativos
    const { data: attractions } = await supabase
      .from('tourist_attractions')
      .select('*');

    return {
      infrastructure,
      mobility,
      attractions
    };
  }

  private async collectEventsData() {
    // Coleta dados de eventos
    const { data: events } = await supabase
      .from('city_events')
      .select('*')
      .order('start_date', { ascending: true });

    // Coleta dados de participação
    const { data: participation } = await supabase
      .from('event_participation')
      .select('*')
      .order('created_at', { ascending: false });

    return {
      events,
      participation
    };
  }

  private async collectEconomicData() {
    // Coleta dados de gastos turísticos
    const { data: spending } = await supabase
      .from('tourist_spending')
      .select('*')
      .order('date', { ascending: false });

    // Coleta dados de empregos
    const { data: jobs } = await supabase
      .from('tourism_jobs')
      .select('*');

    // Coleta dados de investimentos
    const { data: investments } = await supabase
      .from('tourism_investments')
      .select('*')
      .order('date', { ascending: false });

    return {
      spending,
      jobs,
      investments
    };
  }
} 