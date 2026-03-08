// @ts-nocheck
/**
 * Auto Translation Utility
 * Utilitário para tradução automática de conteúdo
 */

import { destinationTranslationService, type DestinationData } from '@/services/translation/DestinationTranslationService';
import { eventTranslationService, type EventData } from '@/services/translation/EventTranslationService';
import { routeTranslationService, type RouteData } from '@/services/translation/RouteTranslationService';
import { regionTranslationService, type RegionData } from '@/services/translation/RegionTranslationService';
import type { LanguageCode } from '@/utils/translationHelpers';

// Idiomas principais para tradução automática
const MAIN_LANGUAGES: LanguageCode[] = ['en-US', 'es-ES', 'fr-FR', 'de-DE'];

/**
 * Traduz automaticamente um destino para os idiomas principais
 */
export async function autoTranslateDestination(destination: DestinationData): Promise<void> {
  try {
    console.log(`🌐 [AutoTranslate] Traduzindo destino: ${destination.name}`);
    
    // Traduzir para cada idioma principal
    const translationPromises = MAIN_LANGUAGES.map(lang =>
      destinationTranslationService.getOrCreateTranslation(destination, lang).catch(error => {
        console.error(`❌ [AutoTranslate] Erro ao traduzir destino para ${lang}:`, error);
        return null;
      })
    );

    await Promise.all(translationPromises);
    console.log(`✅ [AutoTranslate] Destino traduzido com sucesso`);
  } catch (error) {
    console.error('❌ [AutoTranslate] Erro ao traduzir destino:', error);
    // Não lançar erro - tradução é opcional
  }
}

/**
 * Traduz automaticamente um evento para os idiomas principais
 */
export async function autoTranslateEvent(event: EventData): Promise<void> {
  try {
    console.log(`🌐 [AutoTranslate] Traduzindo evento: ${event.name || event.title}`);
    
    const translationPromises = MAIN_LANGUAGES.map(lang =>
      eventTranslationService.getOrCreateTranslation(event, lang).catch(error => {
        console.error(`❌ [AutoTranslate] Erro ao traduzir evento para ${lang}:`, error);
        return null;
      })
    );

    await Promise.all(translationPromises);
    console.log(`✅ [AutoTranslate] Evento traduzido com sucesso`);
  } catch (error) {
    console.error('❌ [AutoTranslate] Erro ao traduzir evento:', error);
    // Não lançar erro - tradução é opcional
  }
}

/**
 * Traduz automaticamente um roteiro para os idiomas principais
 */
export async function autoTranslateRoute(route: RouteData): Promise<void> {
  try {
    console.log(`🌐 [AutoTranslate] Traduzindo roteiro: ${route.title || route.name}`);
    
    const translationPromises = MAIN_LANGUAGES.map(lang =>
      routeTranslationService.getOrCreateTranslation(route, lang).catch(error => {
        console.error(`❌ [AutoTranslate] Erro ao traduzir roteiro para ${lang}:`, error);
        return null;
      })
    );

    await Promise.all(translationPromises);
    console.log(`✅ [AutoTranslate] Roteiro traduzido com sucesso`);
  } catch (error) {
    console.error('❌ [AutoTranslate] Erro ao traduzir roteiro:', error);
    // Não lançar erro - tradução é opcional
  }
}

/**
 * Traduz automaticamente uma região para os idiomas principais
 */
export async function autoTranslateRegion(region: RegionData): Promise<void> {
  try {
    console.log(`🌐 [AutoTranslate] Traduzindo região: ${region.name}`);
    
    const translationPromises = MAIN_LANGUAGES.map(lang =>
      regionTranslationService.getOrCreateTranslation(region, lang).catch(error => {
        console.error(`❌ [AutoTranslate] Erro ao traduzir região para ${lang}:`, error);
        return null;
      })
    );

    await Promise.all(translationPromises);
    console.log(`✅ [AutoTranslate] Região traduzida com sucesso`);
  } catch (error) {
    console.error('❌ [AutoTranslate] Erro ao traduzir região:', error);
    // Não lançar erro - tradução é opcional
  }
}

