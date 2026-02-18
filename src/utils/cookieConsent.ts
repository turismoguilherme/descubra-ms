/**
 * Utilitário para verificar consentimento de cookies
 */

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface ConsentData {
  accepted: boolean;
  timestamp: string;
  preferences: CookiePreferences;
}

/**
 * Obtém as preferências de cookies salvas
 * @param platform - Plataforma ('viajar' ou 'descubra_ms')
 * @returns Preferências de cookies ou null se não houver consentimento
 */
export function getCookieConsent(platform: 'viajar' | 'descubra_ms' = 'descubra_ms'): ConsentData | null {
  if (typeof window === 'undefined') return null;
  
  const storageKey = `cookie-consent-${platform}`;
  const saved = localStorage.getItem(storageKey);
  
  if (!saved) return null;
  
  try {
    const consentData: ConsentData = JSON.parse(saved);
    return consentData;
  } catch (e) {
    console.error('Erro ao parsear consentimento de cookies:', e);
    return null;
  }
}

/**
 * Verifica se o usuário aceitou cookies de analytics
 * @param platform - Plataforma ('viajar' ou 'descubra_ms')
 * @returns true se analytics foi aceito, false caso contrário
 */
export function hasAnalyticsConsent(platform: 'viajar' | 'descubra_ms' = 'descubra_ms'): boolean {
  const consent = getCookieConsent(platform);
  return consent?.preferences.analytics === true;
}

/**
 * Verifica se há algum consentimento salvo
 * @param platform - Plataforma ('viajar' ou 'descubra_ms')
 * @returns true se há consentimento salvo, false caso contrário
 */
export function hasConsent(platform: 'viajar' | 'descubra_ms' = 'descubra_ms'): boolean {
  return getCookieConsent(platform) !== null;
}











