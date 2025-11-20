/**
 * Analytics Service
 * Agrega dados de pesquisas com turistas e gera estatísticas
 */

import { supabase } from '@/integrations/supabase/client';

export interface SurveyAnalytics {
  total_surveys: number;
  period_start: string;
  period_end: string;
  origin_distribution: { origin: string; count: number; percentage: number }[];
  question_type_distribution: { type: string; count: number; percentage: number }[];
  motivation_distribution: { motivation: string; count: number; percentage: number }[];
  age_distribution: { age_range: string; count: number; percentage: number }[];
  top_questions: { question: string; count: number }[];
  trends: {
    period: string;
    survey_count: number;
    avg_questions_per_survey: number;
  }[];
}

export interface CATAnalytics {
  cat_id: string;
  cat_name: string;
  total_surveys: number;
  avg_surveys_per_day: number;
  peak_hours: { hour: number; count: number }[];
  most_common_questions: { question: string; count: number }[];
  tourist_origins: { origin: string; count: number }[];
}

export class AnalyticsService {
  /**
   * Agregar dados de pesquisas com turistas
   */
  async aggregateSurveyData(
    filters?: {
      startDate?: string;
      endDate?: string;
      catId?: string;
      attendantId?: string;
    }
  ): Promise<SurveyAnalytics> {
    try {
      let query = supabase
        .from('tourist_surveys')
        .select('*');

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters?.catId) {
        query = query.eq('cat_location_id', filters.catId);
      }

      if (filters?.attendantId) {
        query = query.eq('attendant_id', filters.attendantId);
      }

      const { data: surveys, error } = await query;

      if (error) throw error;

      const total = surveys?.length || 0;

      // Processar distribuições
      const originCounts: Record<string, number> = {};
      const questionTypeCounts: Record<string, number> = {};
      const motivationCounts: Record<string, number> = {};
      const ageCounts: Record<string, number> = {};
      const questionCounts: Record<string, number> = {};

      (surveys || []).forEach((survey: any) => {
        // Origem
        if (survey.tourist_origin) {
          originCounts[survey.tourist_origin] = (originCounts[survey.tourist_origin] || 0) + 1;
        }

        // Tipo de pergunta
        if (Array.isArray(survey.question_types)) {
          survey.question_types.forEach((type: string) => {
            questionTypeCounts[type] = (questionTypeCounts[type] || 0) + 1;
          });
        }

        // Motivação
        if (Array.isArray(survey.motivations)) {
          survey.motivations.forEach((motivation: string) => {
            motivationCounts[motivation] = (motivationCounts[motivation] || 0) + 1;
          });
        }

        // Idade
        if (survey.tourist_age_range) {
          ageCounts[survey.tourist_age_range] = (ageCounts[survey.tourist_age_range] || 0) + 1;
        }

        // Perguntas feitas
        if (Array.isArray(survey.questions_asked)) {
          survey.questions_asked.forEach((item: any) => {
            if (item.question) {
              questionCounts[item.question] = (questionCounts[item.question] || 0) + 1;
            }
          });
        }
      });

      const calculatePercentage = (count: number) => total > 0 ? (count / total) * 100 : 0;

      // Gerar tendências (por semana)
      const trends = this.generateTrends(surveys || [], filters?.startDate, filters?.endDate);

      return {
        total_surveys: total,
        period_start: filters?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: filters?.endDate || new Date().toISOString(),
        origin_distribution: Object.entries(originCounts)
          .map(([origin, count]) => ({
            origin,
            count,
            percentage: calculatePercentage(count),
          }))
          .sort((a, b) => b.count - a.count),
        question_type_distribution: Object.entries(questionTypeCounts)
          .map(([type, count]) => ({
            type,
            count,
            percentage: calculatePercentage(count),
          }))
          .sort((a, b) => b.count - a.count),
        motivation_distribution: Object.entries(motivationCounts)
          .map(([motivation, count]) => ({
            motivation,
            count,
            percentage: calculatePercentage(count),
          }))
          .sort((a, b) => b.count - a.count),
        age_distribution: Object.entries(ageCounts)
          .map(([age_range, count]) => ({
            age_range,
            count,
            percentage: calculatePercentage(count),
          }))
          .sort((a, b) => b.count - a.count),
        top_questions: Object.entries(questionCounts)
          .map(([question, count]) => ({ question, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        trends,
      };
    } catch (error) {
      console.error('Erro ao agregar dados de pesquisas:', error);
      throw error;
    }
  }

  /**
   * Gerar tendências por período
   */
  private generateTrends(
    surveys: any[],
    startDate?: string,
    endDate?: string
  ): SurveyAnalytics['trends'] {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const trends: SurveyAnalytics['trends'] = [];
    const current = new Date(start);

    while (current <= end) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekSurveys = surveys.filter((s: any) => {
        const surveyDate = new Date(s.created_at);
        return surveyDate >= weekStart && surveyDate < weekEnd;
      });

      const totalQuestions = weekSurveys.reduce((acc: number, s: any) => {
        return acc + (Array.isArray(s.questions_asked) ? s.questions_asked.length : 0);
      }, 0);

      trends.push({
        period: weekStart.toISOString().split('T')[0],
        survey_count: weekSurveys.length,
        avg_questions_per_survey: weekSurveys.length > 0 ? totalQuestions / weekSurveys.length : 0,
      });

      current.setDate(current.getDate() + 7);
    }

    return trends;
  }

  /**
   * Análise por CAT
   */
  async getCATAnalytics(catId: string, period?: { start: string; end: string }): Promise<CATAnalytics | null> {
    try {
      // Buscar informações do CAT
      const { data: cat, error: catError } = await supabase
        .from('attendant_allowed_locations')
        .select('id, name')
        .eq('id', catId)
        .single();

      if (catError || !cat) {
        return null;
      }

      // Buscar pesquisas do CAT
      let query = supabase
        .from('tourist_surveys')
        .select('*')
        .eq('cat_location_id', catId);

      if (period?.start) {
        query = query.gte('created_at', period.start);
      }

      if (period?.end) {
        query = query.lte('created_at', period.end);
      }

      const { data: surveys, error } = await query;

      if (error) throw error;

      const total = surveys?.length || 0;
      const days = period
        ? Math.ceil((new Date(period.end).getTime() - new Date(period.start).getTime()) / (1000 * 60 * 60 * 24))
        : 30;

      // Processar horários de pico
      const hourCounts: Record<number, number> = {};
      const questionCounts: Record<string, number> = {};
      const originCounts: Record<string, number> = {};

      (surveys || []).forEach((survey: any) => {
        const hour = new Date(survey.created_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;

        if (Array.isArray(survey.questions_asked)) {
          survey.questions_asked.forEach((item: any) => {
            if (item.question) {
              questionCounts[item.question] = (questionCounts[item.question] || 0) + 1;
            }
          });
        }

        if (survey.tourist_origin) {
          originCounts[survey.tourist_origin] = (originCounts[survey.tourist_origin] || 0) + 1;
        }
      });

      return {
        cat_id: catId,
        cat_name: cat.name,
        total_surveys: total,
        avg_surveys_per_day: days > 0 ? total / days : 0,
        peak_hours: Object.entries(hourCounts)
          .map(([hour, count]) => ({ hour: parseInt(hour), count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        most_common_questions: Object.entries(questionCounts)
          .map(([question, count]) => ({ question, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        tourist_origins: Object.entries(originCounts)
          .map(([origin, count]) => ({ origin, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
      };
    } catch (error) {
      console.error('Erro ao buscar análise do CAT:', error);
      return null;
    }
  }

  /**
   * Gerar insights automáticos (preparado para Gemini)
   */
  async generateInsights(analytics: SurveyAnalytics): Promise<string[]> {
    const insights: string[] = [];

    // Insight 1: Origem predominante
    if (analytics.origin_distribution.length > 0) {
      const topOrigin = analytics.origin_distribution[0];
      if (topOrigin.percentage > 40) {
        insights.push(
          `${topOrigin.percentage.toFixed(1)}% dos turistas vêm de ${topOrigin.origin}. Considere campanhas direcionadas para este estado.`
        );
      }
    }

    // Insight 2: Tipo de pergunta mais comum
    if (analytics.question_type_distribution.length > 0) {
      const topQuestionType = analytics.question_type_distribution[0];
      insights.push(
        `A maioria das perguntas (${topQuestionType.percentage.toFixed(1)}%) é sobre ${topQuestionType.type}. Prepare materiais informativos sobre este tema.`
      );
    }

    // Insight 3: Motivação principal
    if (analytics.motivation_distribution.length > 0) {
      const topMotivation = analytics.motivation_distribution[0];
      insights.push(
        `${topMotivation.percentage.toFixed(1)}% dos turistas vêm para ${topMotivation.motivation}. Desenvolva ofertas específicas para esta motivação.`
      );
    }

    // Insight 4: Tendência
    if (analytics.trends.length >= 2) {
      const recent = analytics.trends[analytics.trends.length - 1];
      const previous = analytics.trends[analytics.trends.length - 2];
      const change = ((recent.survey_count - previous.survey_count) / previous.survey_count) * 100;
      
      if (Math.abs(change) > 10) {
        insights.push(
          `Tendência: ${change > 0 ? 'aumento' : 'redução'} de ${Math.abs(change).toFixed(1)}% no número de pesquisas.`
        );
      }
    }

    return insights;
  }
}

export const analyticsService = new AnalyticsService();
