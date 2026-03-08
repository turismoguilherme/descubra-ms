// @ts-nocheck
/**
 * Serviço de Busca de Eventos com Google Search via Edge Function
 * 
 * FUNCIONALIDADE: Busca eventos na web via Edge Function segura
 * SEGURANÇA: Todas as chamadas passam pelo servidor (API keys protegidas)
 */

import { EventoCompleto } from '@/types/events';
import { supabase } from '@/integrations/supabase/client';

interface CacheEntry {
  data: EventoCompleto[];
  timestamp: number;
}

export class GoogleSearchEventService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_DURATION = 86400000; // 24 horas

  constructor() {
    this.loadCacheFromStorage();
  }

  private loadCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem('eventos_ms_cache');
      if (stored) {
        const cacheData = JSON.parse(stored);
        this.cache = new Map(Object.entries(cacheData));
      }
    } catch {
      // ignore
    }
  }

  private saveCacheToStorage(): void {
    try {
      const cacheData = Object.fromEntries(this.cache);
      localStorage.setItem('eventos_ms_cache', JSON.stringify(cacheData));
    } catch {
      // ignore
    }
  }

  private getCachedData(key: string): EventoCompleto[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  private setCachedData(key: string, data: EventoCompleto[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    this.saveCacheToStorage();
  }

  /**
   * Chama Edge Function de busca Google
   */
  private async callSearchProxy(query: string, maxResults: number = 10): Promise<any[]> {
    const { data, error } = await supabase.functions.invoke('guata-google-search-proxy', {
      body: { query, maxResults, location: 'Mato Grosso do Sul' }
    });

    if (error) {
      console.warn('[GoogleSearchEventService] Edge Function error:', error);
      return [];
    }

    if (!data?.success || !Array.isArray(data?.results)) {
      console.warn('[GoogleSearchEventService] Sem resultados:', data?.error || data?.message);
      return [];
    }

    return data.results;
  }

  /**
   * Buscar sugestões de eventos para secretaria cadastrar
   */
  public async suggestEventsForRegistration(
    location?: string,
    date?: string
  ): Promise<{
    success: boolean;
    eventos: EventoCompleto[];
    total_encontrados: number;
    errors: string[];
    fromCache: boolean;
  }> {
    const result = {
      success: true,
      eventos: [] as EventoCompleto[],
      total_encontrados: 0,
      errors: [] as string[],
      fromCache: false
    };

    try {
      let query = 'eventos Mato Grosso do Sul 2025';
      if (location) query = `eventos ${location} Mato Grosso do Sul 2025`;
      if (date) {
        const dateObj = new Date(date);
        const month = dateObj.toLocaleString('pt-BR', { month: 'long' });
        query = `eventos ${location || 'Mato Grosso do Sul'} ${month} 2025`;
      }

      const cacheKey = `suggestions_${location || 'ms'}_${date || 'all'}`;
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        result.eventos = cachedData;
        result.total_encontrados = cachedData.length;
        result.fromCache = true;
        return result;
      }

      const items = await this.callSearchProxy(query, 10);
      const eventos = items.map((item, i) => this.processSearchResult(item, location, date)).filter(Boolean) as EventoCompleto[];

      this.setCachedData(cacheKey, eventos);
      result.eventos = eventos;
      result.total_encontrados = eventos.length;
      return result;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      result.success = false;
      result.errors.push(err.message);
      return result;
    }
  }

  /**
   * Busca eventos na web usando Edge Function
   */
  public async searchEvents(): Promise<{
    success: boolean;
    eventos: EventoCompleto[];
    total_encontrados: number;
    errors: string[];
    fromCache: boolean;
  }> {
    const result = {
      success: true,
      eventos: [] as EventoCompleto[],
      total_encontrados: 0,
      errors: [] as string[],
      fromCache: false
    };

    try {
      const cacheKey = 'eventos_ms_2025';
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        result.eventos = cachedData;
        result.total_encontrados = cachedData.length;
        result.fromCache = true;
        return result;
      }

      const query = 'eventos Campo Grande Mato Grosso do Sul 2025';
      const items = await this.callSearchProxy(query, 10);

      for (const item of items.slice(0, 5)) {
        const evento = this.processSearchResult(item);
        if (evento) result.eventos.push(evento);
      }

      result.total_encontrados = result.eventos.length;
      this.setCachedData(cacheKey, result.eventos);
      return result;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      result.success = false;
      result.errors.push(err.message);
      return result;
    }
  }

  private processSearchResult(item: any, location?: string, date?: string): EventoCompleto | null {
    try {
      const titulo = item.title || item.snippet?.substring(0, 60) || 'Evento encontrado';
      const descricao = item.snippet || item.description || '';
      const url = item.url || item.link || '';

      const hoje = new Date();
      const diasAleatorios = Math.floor(Math.random() * 23) + 7;
      const dataFutura = new Date(hoje);
      dataFutura.setDate(hoje.getDate() + diasAleatorios);
      const dataInicio = dataFutura.toISOString().split('T')[0];

      const cidades = ['Campo Grande', 'Bonito', 'Corumbá', 'Dourados'];
      let cidade = 'Campo Grande';
      for (const c of cidades) {
        if ((titulo + descricao).includes(c)) { cidade = c; break; }
      }

      const text = (titulo + descricao).toLowerCase();
      let categoria = 'cultural';
      if (text.includes('esporte') || text.includes('corrida')) categoria = 'esportivo';
      if (text.includes('gastronomia') || text.includes('comida')) categoria = 'gastronomico';
      if (text.includes('turismo')) categoria = 'turismo';

      return {
        id: `google-search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        titulo, descricao, data_inicio: dataInicio, data_fim: dataInicio,
        local: 'Mato Grosso do Sul', cidade, categoria,
        tipo_entrada: text.includes('gratuito') ? 'gratuito' : 'pago',
        organizador: 'Organizador', fonte: 'google_search',
        site_oficial: url, imagem_principal: null,
        tags: ['evento', cidade.toLowerCase()],
        processado_por_ia: true, confiabilidade: 85,
        ultima_atualizacao: new Date().toISOString()
      };
    } catch {
      return null;
    }
  }

  public getUsageStats() {
    return {
      requestsToday: 0, requestsLastHour: 0, requestsLastMinute: 0,
      maxRequestsPerDay: 80, remainingToday: 80, cacheSize: this.cache.size
    };
  }

  public clearCache(): void {
    this.cache.clear();
    localStorage.removeItem('eventos_ms_cache');
  }

  public resetRequestLog(): void {
    // No-op — rate limiting agora é feito server-side
  }
}

export const googleSearchEventService = new GoogleSearchEventService();
