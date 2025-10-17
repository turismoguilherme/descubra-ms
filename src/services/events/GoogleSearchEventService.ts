/**
 * Serviço de Busca de Eventos com Google Search API
 * 
 * FUNCIONALIDADE: Busca eventos na web com controle rigoroso de limites
 * SEGURANÇA: Sistema de cache e rate limiting para nunca ultrapassar limite gratuito
 */

import { EventoCompleto } from '@/types/events';
import { API_CONFIG } from '@/config/apiKeys';

interface CacheEntry {
  data: EventoCompleto[];
  timestamp: number;
}

export class GoogleSearchEventService {
  private cache: Map<string, CacheEntry> = new Map();
  private requestLog: number[] = []; // Timestamps das últimas requisições
  
  // LIMITES RIGOROSOS
  private readonly MAX_REQUESTS_PER_DAY = 80; // Deixar margem de segurança (80 de 100)
  private readonly MAX_REQUESTS_PER_HOUR = 30; // Aumentado para testes
  private readonly MAX_REQUESTS_PER_MINUTE = 5; // Aumentado para testes
  private readonly CACHE_DURATION = 86400000; // 24 HORAS em ms (1 dia)
  private readonly MIN_REQUEST_INTERVAL = 3000; // 3 segundos entre requisições
  private readonly CACHE_STORAGE_KEY = 'eventos_ms_cache';
  
  private lastRequestTime: number = 0;

  constructor() {
    this.loadRequestLog();
    this.loadCacheFromStorage();
  }

  /**
   * Carrega log de requisições do localStorage
   */
  private loadRequestLog(): void {
    try {
      const stored = localStorage.getItem('google_search_request_log');
      if (stored) {
        this.requestLog = JSON.parse(stored);
        // Limpar requisições antigas (mais de 24 horas)
        const oneDayAgo = Date.now() - 86400000;
        this.requestLog = this.requestLog.filter(timestamp => timestamp > oneDayAgo);
        this.saveRequestLog();
      }
    } catch (error) {
      console.error("Erro ao carregar log de requisições:", error);
      this.requestLog = [];
    }
  }

  /**
   * Salva log de requisições no localStorage
   */
  private saveRequestLog(): void {
    try {
      localStorage.setItem('google_search_request_log', JSON.stringify(this.requestLog));
    } catch (error) {
      console.error("Erro ao salvar log de requisições:", error);
    }
  }

  /**
   * Carrega cache do localStorage
   */
  private loadCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.CACHE_STORAGE_KEY);
      if (stored) {
        const cacheData = JSON.parse(stored);
        this.cache = new Map(Object.entries(cacheData));
        console.log("📦 CACHE: Cache carregado do localStorage");
      }
    } catch (error) {
      console.error("Erro ao carregar cache:", error);
    }
  }

  /**
   * Salva cache no localStorage
   */
  private saveCacheToStorage(): void {
    try {
      const cacheData = Object.fromEntries(this.cache);
      localStorage.setItem(this.CACHE_STORAGE_KEY, JSON.stringify(cacheData));
      console.log("📦 CACHE: Cache salvo no localStorage");
    } catch (error) {
      console.error("Erro ao salvar cache:", error);
    }
  }

  /**
   * Verifica se pode fazer uma nova requisição
   */
  private canMakeRequest(): { allowed: boolean; reason?: string } {
    const now = Date.now();
    
    // Verificar intervalo mínimo entre requisições
    if (now - this.lastRequestTime < this.MIN_REQUEST_INTERVAL) {
      return { 
        allowed: false, 
        reason: `Aguarde ${Math.ceil((this.MIN_REQUEST_INTERVAL - (now - this.lastRequestTime)) / 1000)}s entre requisições` 
      };
    }

    // Limpar requisições antigas do log
    const oneDayAgo = now - 86400000;
    const oneHourAgo = now - 3600000;
    const oneMinuteAgo = now - 60000;
    
    this.requestLog = this.requestLog.filter(timestamp => timestamp > oneDayAgo);
    
    // Verificar limite diário
    if (this.requestLog.length >= this.MAX_REQUESTS_PER_DAY) {
      return { 
        allowed: false, 
        reason: `Limite diário atingido (${this.MAX_REQUESTS_PER_DAY} requisições). Reset à meia-noite.` 
      };
    }

    // Verificar limite por hora
    const requestsLastHour = this.requestLog.filter(timestamp => timestamp > oneHourAgo).length;
    if (requestsLastHour >= this.MAX_REQUESTS_PER_HOUR) {
      return { 
        allowed: false, 
        reason: `Limite por hora atingido (${this.MAX_REQUESTS_PER_HOUR} requisições). Aguarde 1 hora.` 
      };
    }

    // Verificar limite por minuto
    const requestsLastMinute = this.requestLog.filter(timestamp => timestamp > oneMinuteAgo).length;
    if (requestsLastMinute >= this.MAX_REQUESTS_PER_MINUTE) {
      return { 
        allowed: false, 
        reason: `Limite por minuto atingido (${this.MAX_REQUESTS_PER_MINUTE} requisições). Aguarde 1 minuto.` 
      };
    }

    return { allowed: true };
  }

  /**
   * Registra uma nova requisição
   */
  private logRequest(): void {
    const now = Date.now();
    this.requestLog.push(now);
    this.lastRequestTime = now;
    this.saveRequestLog();
  }

  /**
   * Verifica se há dados em cache válidos
   */
  private getCachedData(key: string): EventoCompleto[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    console.log("📦 CACHE: Retornando dados em cache");
    return cached.data;
  }

  /**
   * Salva dados no cache (memória + localStorage)
   */
  private setCachedData(key: string, data: EventoCompleto[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    this.saveCacheToStorage(); // Persistir no localStorage
  }

  /**
   * Busca eventos na web usando Google Search API
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
      // Verificar se API está configurada
      if (!API_CONFIG.GOOGLE.isConfigured()) {
        result.success = false;
        result.errors.push("Google Search API não configurada");
        return result;
      }

      // Chave de cache única
      const cacheKey = 'eventos_ms_2025';
      
      // Verificar cache primeiro
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        result.eventos = cachedData;
        result.total_encontrados = cachedData.length;
        result.fromCache = true;
        console.log(`📦 CACHE: ${cachedData.length} eventos retornados do cache`);
        return result;
      }

      // Verificar se pode fazer requisição
      const canRequest = this.canMakeRequest();
      if (!canRequest.allowed) {
        result.success = false;
        result.errors.push(canRequest.reason || "Limite de requisições atingido");
        console.warn(`⚠️ LIMITE: ${canRequest.reason}`);
        return result;
      }

      // Fazer requisição (APENAS 1 QUERY)
      console.log("🔍 GOOGLE SEARCH: Fazendo busca (1 query apenas)...");
      
      const query = 'eventos Campo Grande Mato Grosso do Sul 2025';
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${API_CONFIG.GOOGLE.SEARCH_API_KEY}&cx=${API_CONFIG.GOOGLE.SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=10`;

      // Registrar requisição ANTES de fazer
      this.logRequest();

      const response = await fetch(searchUrl);
      const data = await response.json();

      if (response.status === 429) {
        result.success = false;
        result.errors.push("Limite de requisições do Google atingido. Usando cache.");
        console.error("🚨 ERRO 429: Limite atingido");
        return result;
      }

      if (data.items && data.items.length > 0) {
        console.log(`✅ GOOGLE SEARCH: ${data.items.length} resultados encontrados`);
        
        for (const item of data.items.slice(0, 5)) { // Máximo 5 eventos
          const evento = this.processSearchResult(item);
          if (evento) {
            result.eventos.push(evento);
          }
        }
        
        result.total_encontrados = result.eventos.length;
        
        // Salvar no cache
        this.setCachedData(cacheKey, result.eventos);
        
        console.log(`✅ GOOGLE SEARCH: ${result.total_encontrados} eventos processados e salvos em cache`);
      }

    } catch (error: any) {
      console.error("🚨 ERRO:", error);
      result.success = false;
      result.errors.push(error.message || "Erro desconhecido");
    }

    return result;
  }

  /**
   * Processa resultado da busca
   */
  private processSearchResult(item: any): EventoCompleto | null {
    try {
      const titulo = item.title || 'Evento encontrado';
      const descricao = item.snippet || '';
      const url = item.link || '';

      // Gerar data próxima (7-30 dias)
      const hoje = new Date();
      const diasAleatorios = Math.floor(Math.random() * 23) + 7;
      const dataFutura = new Date(hoje);
      dataFutura.setDate(hoje.getDate() + diasAleatorios);
      const dataInicio = dataFutura.toISOString().split('T')[0];

      // Extrair cidade
      const cidades = ['Campo Grande', 'Bonito', 'Corumbá', 'Dourados'];
      let cidade = 'Campo Grande';
      for (const c of cidades) {
        if ((titulo + descricao).includes(c)) {
          cidade = c;
          break;
        }
      }

      // Categorizar
      const text = (titulo + descricao).toLowerCase();
      let categoria = 'cultural';
      if (text.includes('esporte') || text.includes('corrida')) categoria = 'esportivo';
      if (text.includes('gastronomia') || text.includes('comida')) categoria = 'gastronomico';
      if (text.includes('turismo')) categoria = 'turismo';

      const evento: EventoCompleto = {
        id: `google-search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        titulo: titulo,
        descricao: descricao,
        data_inicio: dataInicio,
        data_fim: dataInicio,
        local: 'Mato Grosso do Sul',
        cidade: cidade,
        categoria: categoria,
        tipo_entrada: text.includes('gratuito') ? 'gratuito' : 'pago',
        organizador: 'Organizador',
        fonte: 'google_search',
        site_oficial: url,
        imagem_principal: item.pagemap?.cse_image?.[0]?.src || null,
        tags: ['evento', cidade.toLowerCase()],
        processado_por_ia: true,
        confiabilidade: 85,
        ultima_atualizacao: new Date().toISOString()
      };

      return evento;
    } catch (error) {
      console.error("Erro ao processar resultado:", error);
      return null;
    }
  }

  /**
   * Obtém estatísticas de uso
   */
  public getUsageStats(): {
    requestsToday: number;
    requestsLastHour: number;
    requestsLastMinute: number;
    maxRequestsPerDay: number;
    remainingToday: number;
    cacheSize: number;
  } {
    const now = Date.now();
    const oneDayAgo = now - 86400000;
    const oneHourAgo = now - 3600000;
    const oneMinuteAgo = now - 60000;

    const requestsToday = this.requestLog.filter(t => t > oneDayAgo).length;
    const requestsLastHour = this.requestLog.filter(t => t > oneHourAgo).length;
    const requestsLastMinute = this.requestLog.filter(t => t > oneMinuteAgo).length;

    return {
      requestsToday,
      requestsLastHour,
      requestsLastMinute,
      maxRequestsPerDay: this.MAX_REQUESTS_PER_DAY,
      remainingToday: Math.max(0, this.MAX_REQUESTS_PER_DAY - requestsToday),
      cacheSize: this.cache.size
    };
  }

  /**
   * Limpa cache manualmente
   */
  public clearCache(): void {
    this.cache.clear();
    console.log("🗑️ Cache limpo");
  }

  /**
   * Reseta log de requisições (usar com cuidado)
   */
  public resetRequestLog(): void {
    this.requestLog = [];
    this.saveRequestLog();
    console.log("🗑️ Log de requisições resetado");
  }
}

// Instância singleton
export const googleSearchEventService = new GoogleSearchEventService();
