// @ts-nocheck
/**
 * User Data Aggregation Service
 * SEGURANÇA: Usa callGeminiProxy (Edge Function) em vez de API key direta
 */

import { supabase } from '@/integrations/supabase/client';
import { callGeminiProxy } from '../ai/geminiProxy';

export interface UserInsights {
  totalUsers: number;
  byType: { turista: number; morador: number };
  byOrigin: { country: Record<string, number>; state: Record<string, number>; city: Record<string, number> };
  byTravelMotives: Record<string, number>;
  byStayDuration: Record<string, number>;
  byDemographics: { ageGroups: Record<string, number>; gender: Record<string, number> };
  byInterests: Record<string, number>;
  byTravelOrganization: Record<string, number>;
  trends: { mostCommonOrigin: string; mostCommonMotive: string; averageStayDuration: string; mostCommonAgeGroup: string };
}

export interface AIInsights {
  profileSummary: string;
  keyFindings: string[];
  opportunities: string[];
  recommendations: string[];
  marketingSuggestions: string[];
}

export class UserDataAggregationService {
  async aggregateUserData(municipalityId?: string): Promise<UserInsights> {
    try {
      const { data: profiles, error } = await supabase.from('user_profiles').select('*');
      if (error) throw error;
      const profilesList = profiles || [];

      const byType = { turista: 0, morador: 0 };
      const byOrigin = { country: {} as Record<string, number>, state: {} as Record<string, number>, city: {} as Record<string, number> };
      const byTravelMotives: Record<string, number> = {};
      const byStayDuration: Record<string, number> = {};
      const byAgeGroups: Record<string, number> = {};
      const byGender: Record<string, number> = {};
      const byTravelOrganization: Record<string, number> = {};

      for (const profile of profilesList) {
        if (profile.user_type === 'turista' || profile.user_type === 'tourist') byType.turista++;
        else if (profile.user_type === 'morador' || profile.user_type === 'resident') byType.morador++;
        if (profile.country) byOrigin.country[profile.country] = (byOrigin.country[profile.country] || 0) + 1;
        if (profile.state) byOrigin.state[profile.state] = (byOrigin.state[profile.state] || 0) + 1;
        if (profile.city) byOrigin.city[profile.city] = (byOrigin.city[profile.city] || 0) + 1;
        if (profile.travel_motives && Array.isArray(profile.travel_motives)) {
          for (const motive of profile.travel_motives) byTravelMotives[motive] = (byTravelMotives[motive] || 0) + 1;
        }
        if (profile.stay_duration) byStayDuration[profile.stay_duration] = (byStayDuration[profile.stay_duration] || 0) + 1;
        if (profile.travel_organization) byTravelOrganization[profile.travel_organization] = (byTravelOrganization[profile.travel_organization] || 0) + 1;
        if (profile.gender) byGender[profile.gender] = (byGender[profile.gender] || 0) + 1;
        if (profile.birth_date) {
          const ageGroup = this.getAgeGroup(this.calculateAge(profile.birth_date));
          byAgeGroups[ageGroup] = (byAgeGroups[ageGroup] || 0) + 1;
        }
      }

      return {
        totalUsers: profilesList.length,
        byType,
        byOrigin,
        byTravelMotives,
        byStayDuration,
        byDemographics: { ageGroups: byAgeGroups, gender: byGender },
        byInterests: {},
        byTravelOrganization,
        trends: {
          mostCommonOrigin: this.getMostCommon(byOrigin.state) || 'N/A',
          mostCommonMotive: this.getMostCommon(byTravelMotives) || 'N/A',
          averageStayDuration: this.getMostCommon(byStayDuration) || 'N/A',
          mostCommonAgeGroup: this.getMostCommon(byAgeGroups) || 'N/A',
        },
      };
    } catch (error) {
      console.error('Erro ao agregar dados de usuários:', error);
      throw error;
    }
  }

  async analyzeUserDataWithAI(userData: UserInsights): Promise<AIInsights> {
    try {
      const prompt = `
Analise os dados de perfil dos turistas:
Total: ${userData.totalUsers}, Turistas: ${userData.byType.turista}, Moradores: ${userData.byType.morador}
Origem: ${userData.trends.mostCommonOrigin}, Motivo: ${userData.trends.mostCommonMotive}

Forneça JSON: { "profileSummary": "...", "keyFindings": [], "opportunities": [], "recommendations": [], "marketingSuggestions": [] }
`;
      const result = await callGeminiProxy(prompt, { temperature: 0.7, maxOutputTokens: 1500 });
      if (result.ok && result.text) {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
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
      }
      return this.getFallbackAIInsights(userData);
    } catch (error) {
      console.error('Erro ao analisar dados com IA:', error);
      return this.getFallbackAIInsights(userData);
    }
  }

  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() - birth.getMonth() < 0 || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return age;
  }

  private getAgeGroup(age: number): string {
    if (age < 18) return '0-17';
    if (age < 25) return '18-24';
    if (age < 35) return '25-34';
    if (age < 45) return '35-44';
    if (age < 55) return '45-54';
    if (age < 65) return '55-64';
    return '65+';
  }

  private getMostCommon(record: Record<string, number>): string | null {
    const entries = Object.entries(record);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }

  private getFallbackAIInsights(userData: UserInsights): AIInsights {
    return {
      profileSummary: `${userData.totalUsers} usuários cadastrados. Origem principal: ${userData.trends.mostCommonOrigin}.`,
      keyFindings: [`Origem: ${userData.trends.mostCommonOrigin}`, `Motivo: ${userData.trends.mostCommonMotive}`],
      opportunities: ['Criar pacotes para origem principal'],
      recommendations: ['Focar marketing na origem principal'],
      marketingSuggestions: [`Campanha para ${userData.trends.mostCommonOrigin}`],
    };
  }
}

export const userDataAggregationService = new UserDataAggregationService();
