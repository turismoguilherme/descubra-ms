/**
 * User Data Aggregation Service
 * Serviço para agregar dados de usuários (turistas e moradores) e gerar insights
 */

import { supabase } from '@/integrations/supabase/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface UserInsights {
  totalUsers: number;
  byType: {
    turista: number;
    morador: number;
  };
  byOrigin: {
    country: Record<string, number>;
    state: Record<string, number>;
    city: Record<string, number>;
  };
  byTravelMotives: Record<string, number>;
  byStayDuration: Record<string, number>;
  byDemographics: {
    ageGroups: Record<string, number>;
    gender: Record<string, number>;
  };
  byInterests: Record<string, number>;
  byTravelOrganization: Record<string, number>;
  trends: {
    mostCommonOrigin: string;
    mostCommonMotive: string;
    averageStayDuration: string;
    mostCommonAgeGroup: string;
  };
}

export interface AIInsights {
  profileSummary: string;
  keyFindings: string[];
  opportunities: string[];
  recommendations: string[];
  marketingSuggestions: string[];
}

export class UserDataAggregationService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
  }

  /**
   * Agregar dados de usuários
   */
  async aggregateUserData(municipalityId?: string): Promise<UserInsights> {
    try {
      // Buscar todos os perfis de usuários
      let query = supabase
        .from('user_profiles')
        .select('*');

      // Se tiver filtro por município, aplicar (assumindo que há campo city ou state)
      // Por enquanto, buscar todos

      const { data: profiles, error } = await query;

      if (error) throw error;

      const profilesList = profiles || [];

      // Agregar dados
      const byType = {
        turista: 0,
        morador: 0,
      };

      const byOrigin = {
        country: {} as Record<string, number>,
        state: {} as Record<string, number>,
        city: {} as Record<string, number>,
      };

      const byTravelMotives: Record<string, number> = {};
      const byStayDuration: Record<string, number> = {};
      const byAgeGroups: Record<string, number> = {};
      const byGender: Record<string, number> = {};
      const byInterests: Record<string, number> = {};
      const byTravelOrganization: Record<string, number> = {};

      for (const profile of profilesList) {
        // Por tipo
        if (profile.user_type === 'turista' || profile.user_type === 'tourist') {
          byType.turista++;
        } else if (profile.user_type === 'morador' || profile.user_type === 'resident') {
          byType.morador++;
        }

        // Por origem
        if (profile.country) {
          byOrigin.country[profile.country] = (byOrigin.country[profile.country] || 0) + 1;
        }
        if (profile.state) {
          byOrigin.state[profile.state] = (byOrigin.state[profile.state] || 0) + 1;
        }
        if (profile.city) {
          byOrigin.city[profile.city] = (byOrigin.city[profile.city] || 0) + 1;
        }

        // Por motivos de viagem
        if (profile.travel_motives && Array.isArray(profile.travel_motives)) {
          for (const motive of profile.travel_motives) {
            byTravelMotives[motive] = (byTravelMotives[motive] || 0) + 1;
          }
        }

        // Por duração da estadia
        if (profile.stay_duration) {
          byStayDuration[profile.stay_duration] = (byStayDuration[profile.stay_duration] || 0) + 1;
        }

        // Por organização da viagem
        if (profile.travel_organization) {
          byTravelOrganization[profile.travel_organization] = (byTravelOrganization[profile.travel_organization] || 0) + 1;
        }

        // Por gênero
        if (profile.gender) {
          byGender[profile.gender] = (byGender[profile.gender] || 0) + 1;
        }

        // Por faixa etária (calcular a partir de birth_date se disponível)
        if (profile.birth_date) {
          const age = this.calculateAge(profile.birth_date);
          const ageGroup = this.getAgeGroup(age);
          byAgeGroups[ageGroup] = (byAgeGroups[ageGroup] || 0) + 1;
        }
      }

      // Calcular tendências
      const mostCommonOrigin = this.getMostCommon(byOrigin.state);
      const mostCommonMotive = this.getMostCommon(byTravelMotives);
      const mostCommonStayDuration = this.getMostCommon(byStayDuration);
      const mostCommonAgeGroup = this.getMostCommon(byAgeGroups);

      return {
        totalUsers: profilesList.length,
        byType,
        byOrigin,
        byTravelMotives,
        byStayDuration,
        byDemographics: {
          ageGroups: byAgeGroups,
          gender: byGender,
        },
        byInterests, // TODO: extrair de campos específicos
        byTravelOrganization,
        trends: {
          mostCommonOrigin: mostCommonOrigin || 'N/A',
          mostCommonMotive: mostCommonMotive || 'N/A',
          averageStayDuration: mostCommonStayDuration || 'N/A',
          mostCommonAgeGroup: mostCommonAgeGroup || 'N/A',
        },
      };
    } catch (error) {
      console.error('Erro ao agregar dados de usuários:', error);
      throw error;
    }
  }

  /**
   * Analisar dados de usuários com IA
   */
  async analyzeUserDataWithAI(userData: UserInsights): Promise<AIInsights> {
    try {
      if (!this.genAI) {
        return this.getFallbackAIInsights(userData);
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
Você é um consultor especializado em turismo e marketing de destinos. Analise os seguintes dados de perfil dos turistas e moradores e forneça insights acionáveis:

Total de Usuários: ${userData.totalUsers}
Turistas: ${userData.byType.turista}
Moradores: ${userData.byType.morador}

Origem Principal: ${userData.trends.mostCommonOrigin}
Motivo Mais Comum: ${userData.trends.mostCommonMotive}
Duração Média: ${userData.trends.averageStayDuration}
Faixa Etária Mais Comum: ${userData.trends.mostCommonAgeGroup}

Top 5 Origens (Estado):
${Object.entries(userData.byOrigin.state)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([state, count]) => `- ${state}: ${count} usuários`)
  .join('\n')}

Top 5 Motivos de Viagem:
${Object.entries(userData.byTravelMotives)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([motive, count]) => `- ${motive}: ${count} usuários`)
  .join('\n')}

Forneça uma resposta em JSON:
{
  "profileSummary": "Resumo do perfil médio do turista em 2-3 frases",
  "keyFindings": ["achado1", "achado2", "achado3"],
  "opportunities": ["oportunidade1", "oportunidade2"],
  "recommendations": ["recomendação1", "recomendação2"],
  "marketingSuggestions": ["sugestão de marketing1", "sugestão de marketing2"]
}

Seja específico e acionável. Foque em ajudar a secretaria a criar estratégias de marketing e produtos turísticos.
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          profileSummary: parsed.profileSummary || '',
          keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
          opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
          marketingSuggestions: Array.isArray(parsed.marketingSuggestions) ? parsed.marketingSuggestions : [],
        };
      }

      return this.getFallbackAIInsights(userData);
    } catch (error) {
      console.error('Erro ao analisar dados com IA:', error);
      return this.getFallbackAIInsights(userData);
    }
  }

  /**
   * Calcular idade a partir de data de nascimento
   */
  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Obter faixa etária
   */
  private getAgeGroup(age: number): string {
    if (age < 18) return '0-17';
    if (age < 25) return '18-24';
    if (age < 35) return '25-34';
    if (age < 45) return '35-44';
    if (age < 55) return '45-54';
    if (age < 65) return '55-64';
    return '65+';
  }

  /**
   * Obter item mais comum
   */
  private getMostCommon(record: Record<string, number>): string | null {
    const entries = Object.entries(record);
    if (entries.length === 0) return null;
    
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }

  /**
   * Fallback quando IA não está disponível
   */
  private getFallbackAIInsights(userData: UserInsights): AIInsights {
    return {
      profileSummary: `Perfil dos usuários: ${userData.totalUsers} usuários cadastrados, sendo ${userData.byType.turista} turistas e ${userData.byType.morador} moradores. Origem principal: ${userData.trends.mostCommonOrigin}.`,
      keyFindings: [
        `Origem principal: ${userData.trends.mostCommonOrigin}`,
        `Motivo mais comum: ${userData.trends.mostCommonMotive}`,
        `Duração média: ${userData.trends.averageStayDuration}`,
      ],
      opportunities: [
        'Criar pacotes específicos para origem principal',
        'Desenvolver produtos alinhados ao motivo mais comum',
      ],
      recommendations: [
        'Focar marketing na origem principal',
        'Criar experiências para duração média identificada',
      ],
      marketingSuggestions: [
        `Criar campanha direcionada para ${userData.trends.mostCommonOrigin}`,
        'Desenvolver conteúdo sobre motivo mais comum',
      ],
    };
  }
}

export const userDataAggregationService = new UserDataAggregationService();

