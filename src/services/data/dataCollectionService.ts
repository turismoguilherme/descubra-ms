import { supabase } from '@/integrations/supabase/client';

interface CollectedData {
  visitorData: {
    totalVisitors: number;
    avgStay: number;
    visitorProfile: {
      business: string;
      leisure: string;
      events: string;
    };
    topAttractions: string[];
  };
  economicData: {
    avgSpending: number;
    revenueByCategory: Record<string, number>;
    jobsCreated: number;
  };
  communityData: {
    localSuggestions: any[];
    satisfactionScore: number;
    participationRate: number;
  };
}

export class DataCollectionService {
  async collectAllData(): Promise<CollectedData> {
    try {
      const [
        visitorData,
        economicData,
        communityData
      ] = await Promise.all([
        this.collectVisitorData(),
        this.collectEconomicData(),
        this.collectCommunityData()
      ]);

      return {
        visitorData,
        economicData,
        communityData
      };
    } catch (error) {
      console.error('Erro ao coletar dados:', error);
      throw error;
    }
  }

  private async collectVisitorData() {
    const { data: visitors, error: visitorError } = await supabase
      .from('visitor_statistics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (visitorError) throw visitorError;

    const { data: attractions, error: attractionError } = await supabase
      .from('attractions')
      .select('name, visit_count')
      .order('visit_count', { ascending: false })
      .limit(5);

    if (attractionError) throw attractionError;

    return {
      totalVisitors: visitors.total_count,
      avgStay: visitors.average_stay,
      visitorProfile: {
        business: visitors.business_percentage + '%',
        leisure: visitors.leisure_percentage + '%',
        events: visitors.events_percentage + '%'
      },
      topAttractions: attractions.map(a => a.name)
    };
  }

  private async collectEconomicData() {
    const { data: economic, error } = await supabase
      .from('economic_impact')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    return {
      avgSpending: economic.average_spending,
      revenueByCategory: economic.revenue_by_category,
      jobsCreated: economic.jobs_created
    };
  }

  private async collectCommunityData() {
    const { data: community, error: communityError } = await supabase
      .from('community_engagement')
      .select(`
        suggestions:community_suggestions(content),
        satisfaction_score,
        participation_rate
      `)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (communityError) throw communityError;

    return {
      localSuggestions: community.suggestions,
      satisfactionScore: community.satisfaction_score,
      participationRate: community.participation_rate
    };
  }

  // Método para validação de dados
  async validateData(data: CollectedData): Promise<boolean> {
    // Validar dados dos visitantes
    if (!this.isValidVisitorData(data.visitorData)) {
      console.error('Dados de visitantes inválidos');
      return false;
    }

    // Validar dados econômicos
    if (!this.isValidEconomicData(data.economicData)) {
      console.error('Dados econômicos inválidos');
      return false;
    }

    // Validar dados da comunidade
    if (!this.isValidCommunityData(data.communityData)) {
      console.error('Dados da comunidade inválidos');
      return false;
    }

    return true;
  }

  private isValidVisitorData(data: CollectedData['visitorData']): boolean {
    return (
      typeof data.totalVisitors === 'number' &&
      data.totalVisitors >= 0 &&
      typeof data.avgStay === 'number' &&
      data.avgStay >= 0 &&
      Array.isArray(data.topAttractions) &&
      data.topAttractions.length > 0
    );
  }

  private isValidEconomicData(data: CollectedData['economicData']): boolean {
    return (
      typeof data.avgSpending === 'number' &&
      data.avgSpending >= 0 &&
      typeof data.jobsCreated === 'number' &&
      data.jobsCreated >= 0
    );
  }

  private isValidCommunityData(data: CollectedData['communityData']): boolean {
    return (
      Array.isArray(data.localSuggestions) &&
      typeof data.satisfactionScore === 'number' &&
      data.satisfactionScore >= 0 &&
      data.satisfactionScore <= 10 &&
      typeof data.participationRate === 'number' &&
      data.participationRate >= 0 &&
      data.participationRate <= 100
    );
  }
} 