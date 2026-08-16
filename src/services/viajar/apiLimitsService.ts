/**
 * API Limits Service
 * Gerencia limites de uso por plano (Professional e Government)
 */

import { PlanTier } from '@/services/subscriptionService';
import { APIType } from './apiCacheService';
import { apiUsageTrackingService } from './apiUsageTrackingService';

export interface APILimit {
  daily: number;
  monthly: number;
}

export interface LimitsConfig {
  gemini: APILimit;
  google_search: APILimit;
  openweather: APILimit;
  google_places: APILimit;
}

// Limites por plano (Professional e Government)
const PLAN_LIMITS: Record<PlanTier, LimitsConfig> = {
  freemium: {
    gemini: { daily: 200, monthly: 6000 },
    google_search: { daily: 80, monthly: 2400 },
    openweather: { daily: 333, monthly: 10000 },
    google_places: { daily: 16, monthly: 500 },
  },
  professional: {
    gemini: { daily: 500, monthly: 15000 },
    google_search: { daily: 200, monthly: 6000 },
    openweather: { daily: 1666, monthly: 50000 },
    google_places: { daily: 66, monthly: 2000 },
  },
  enterprise: {
    gemini: { daily: 1000, monthly: 30000 },
    google_search: { daily: 400, monthly: 12000 },
    openweather: { daily: 3333, monthly: 100000 },
    google_places: { daily: 133, monthly: 4000 },
  },
  government: {
    gemini: { daily: 2000, monthly: 60000 },
    google_search: { daily: 800, monthly: 24000 },
    openweather: { daily: 16666, monthly: 500000 },
    google_places: { daily: 333, monthly: 10000 },
  },
};

export interface LimitCheckResult {
  allowed: boolean;
  currentUsage: number;
  limit: number;
  percentage: number;
  remaining: number;
  warning?: 'none' | 'approaching' | 'near_limit' | 'at_limit';
}

class APILimitsService {
  /**
   * Verifica se usuário pode fazer chamada à API
   */
  async checkLimit(
    userId: string,
    planTier: PlanTier,
    apiType: APIType
  ): Promise<LimitCheckResult> {
    const limits = PLAN_LIMITS[planTier];
    const limit = limits[apiType];

    // Buscar uso do dia
    const todayUsage = await apiUsageTrackingService.getTodayUsage(userId);
    if (!todayUsage) {
      return {
        allowed: true,
        currentUsage: 0,
        limit: limit.daily,
        percentage: 0,
        remaining: limit.daily,
        warning: 'none',
      };
    }

    const usageMap: Record<APIType, number> = {
      gemini: todayUsage.geminiCalls,
      google_search: todayUsage.googleSearchCalls,
      openweather: todayUsage.openweatherCalls,
      google_places: todayUsage.googlePlacesCalls,
    };

    const currentUsage = usageMap[apiType];
    const percentage = (currentUsage / limit.daily) * 100;
    const remaining = Math.max(0, limit.daily - currentUsage);

    // Determinar nível de alerta
    let warning: 'none' | 'approaching' | 'near_limit' | 'at_limit' = 'none';
    if (percentage >= 100) {
      warning = 'at_limit';
    } else if (percentage >= 95) {
      warning = 'near_limit';
    } else if (percentage >= 80) {
      warning = 'approaching';
    }

    // Permitir sempre (soft limits - não bloqueia)
    return {
      allowed: true,
      currentUsage,
      limit: limit.daily,
      percentage: Math.round(percentage * 100) / 100,
      remaining,
      warning,
    };
  }

  /**
   * Obtém limites do plano
   */
  getPlanLimits(planTier: PlanTier): LimitsConfig {
    return PLAN_LIMITS[planTier];
  }

  /**
   * Verifica se está próximo do limite (para alertas)
   */
  async shouldShowAlert(
    userId: string,
    planTier: PlanTier,
    apiType: APIType
  ): Promise<boolean> {
    const check = await this.checkLimit(userId, planTier, apiType);
    return check.warning === 'approaching' || 
           check.warning === 'near_limit' || 
           check.warning === 'at_limit';
  }
}

export const apiLimitsService = new APILimitsService();

