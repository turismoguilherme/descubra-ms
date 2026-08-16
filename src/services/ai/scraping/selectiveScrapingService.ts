/**
 * Serviço de Web Scraping Seletivo para Guatá Inteligente
 * Busca informações de sites confiáveis e oficiais sobre MS
 */

export interface ScrapedData {
  title: string;
  content: string;
  url: string;
  timestamp: Date;
  source: string;
  confidence: number; // 0-1
}

export interface ScrapingResult {
  success: boolean;
  data?: ScrapedData[];
  error?: string;
  source: string;
  timestamp: Date;
}

export interface SiteConfig {
  url: string;
  selectors: {
    title: string;
    content: string;
    links?: string;
  };
  priority: number; // 1 = mais alta
  updateFrequency: number; // horas
  lastUpdate?: Date;
}

export class SelectiveScrapingService {
  private readonly SITES_CONFIG: Record<string, SiteConfig> = {
    // PRIORIDADE 1: Sites Oficiais
    bioparque: {
      url: 'https://bioparque.com.br',
      selectors: {
        title: 'h1, .title, .main-title',
        content: '.content, .description, .info',
        links: 'a[href*="horario"], a[href*="preco"]'
      },
      priority: 1,
      updateFrequency: 6
    },
    
    fundtur: {
      url: 'https://fundtur.ms.gov.br',
      selectors: {
        title: 'h1, .page-title',
        content: '.content, .description, .news-content',
        links: 'a[href*="turismo"], a[href*="atracao"]'
      },
      priority: 1,
      updateFrequency: 12
    },
    
    // PRIORIDADE 2: Sites de Turismo
    visitbrasil: {
      url: 'https://visitbrasil.com/bonito',
      selectors: {
        title: 'h1, .destination-title',
        content: '.destination-content, .attractions',
        links: 'a[href*="bonito"], a[href*="pantanal"]'
      },
      priority: 2,
      updateFrequency: 24
    },
    
    // PRIORIDADE 3: Sites de Clima
    climatempo: {
      url: 'https://www.climatempo.com.br/previsao-do-tempo/cidade/225/campogrande-ms',
      selectors: {
        title: '.city-name, .location-name',
        content: '.temperature, .weather-description',
        links: 'a[href*="previsao"]'
      },
      priority: 3,
      updateFrequency: 1
    }
  };

  private cache: Map<string, { data: ScrapedData[]; timestamp: Date }> = new Map();

  constructor() {}

  /**
   * Busca informações de um site específico
   */
  async scrapeSite(siteKey: string, query?: string): Promise<ScrapingResult> {
    const config = this.SITES_CONFIG[siteKey];
    if (!config) {
      return {
        success: false,
        error: `Site não configurado: ${siteKey}`,
        source: siteKey,
        timestamp: new Date()
      };
    }

    // Verifica cache
    const cacheKey = `${siteKey}_${query || 'general'}`;
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached.timestamp, config.updateFrequency)) {
      return {
        success: true,
        data: cached.data,
        source: siteKey,
        timestamp: cached.timestamp
      };
    }

    try {
      // Simula scraping (em produção, usaria Puppeteer ou similar)
      const scrapedData = await this.simulateScraping(config, query);
      
      // Atualiza cache
      this.cache.set(cacheKey, {
        data: scrapedData,
        timestamp: new Date()
      });

      return {
        success: true,
        data: scrapedData,
        source: siteKey,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: `Scraping error for ${siteKey}: ${error}`,
        source: siteKey,
        timestamp: new Date()
      };
    }
  }

  /**
   * Simula scraping de dados (em produção seria real)
   */
  private async simulateScraping(config: SiteConfig, query?: string): Promise<ScrapedData[]> {
    // Dados simulados baseados no site
    const mockData: Record<string, ScrapedData[]> = {
      bioparque: [
        {
          title: 'Bioparque Pantanal - Maior Aquário de Água Doce do Mundo',
          content: 'O Bioparque Pantanal está localizado em Campo Grande, MS. Horário de funcionamento: Terça a domingo, das 8h às 17h. Entrada gratuita. Endereço: Av. Afonso Pena, 6001.',
          url: 'https://bioparque.com.br',
          timestamp: new Date(),
          source: 'bioparque',
          confidence: 0.95
        }
      ],
      
      fundtur: [
        {
          title: 'Fundação de Turismo de MS - Informações Oficiais',
          content: 'Informações oficiais sobre turismo em Mato Grosso do Sul. Principais destinos: Pantanal, Bonito, Campo Grande. Dados atualizados sobre atrações e eventos.',
          url: 'https://fundtur.ms.gov.br',
          timestamp: new Date(),
          source: 'fundtur',
          confidence: 0.90
        }
      ],
      
      visitbrasil: [
        {
          title: 'Bonito MS - Paraíso do Ecoturismo',
          content: 'Bonito é conhecido por suas águas cristalinas e ecoturismo. Principais atrações: Gruta do Lago Azul, Rio Sucuri, Buraco das Araras. Agendamento obrigatório para maioria das atividades.',
          url: 'https://visitbrasil.com/bonito',
          timestamp: new Date(),
          source: 'visitbrasil',
          confidence: 0.85
        }
      ],
      
      climatempo: [
        {
          title: 'Previsão do Tempo - Campo Grande MS',
          content: 'Clima atual em Campo Grande: 32°C, ensolarado. Umidade: 45%. Previsão para os próximos dias: sol com algumas nuvens.',
          url: 'https://www.climatempo.com.br/previsao-do-tempo/cidade/225/campogrande-ms',
          timestamp: new Date(),
          source: 'climatempo',
          confidence: 0.80
        }
      ]
    };

    // Retorna dados baseados no site
    const siteData = mockData[config.url.split('/')[2] || 'default'] || [];
    
    // Filtra por query se fornecida
    if (query) {
      return siteData.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.content.toLowerCase().includes(query.toLowerCase())
      );
    }

    return siteData;
  }

  /**
   * Busca informações de múltiplos sites
   */
  async scrapeMultipleSites(query: string): Promise<{
    results: ScrapingResult[];
    errors: string[];
    totalSources: number;
  }> {
    const sites = Object.keys(this.SITES_CONFIG);
    const results: ScrapingResult[] = [];
    const errors: string[] = [];

    // Executa scraping em paralelo
    const scrapingPromises = sites.map(site => this.scrapeSite(site, query));
    const scrapingResults = await Promise.allSettled(scrapingPromises);

    scrapingResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        results.push(result.value);
      } else if (result.status === 'rejected') {
        errors.push(`Site ${sites[index]} failed: ${result.reason}`);
      } else if (result.status === 'fulfilled' && !result.value.success) {
        errors.push(result.value.error || 'Unknown error');
      }
    });

    return {
      results,
      errors,
      totalSources: sites.length
    };
  }

  /**
   * Busca informações prioritárias (parceiros primeiro)
   */
  async scrapeWithPriority(query: string): Promise<ScrapedData[]> {
    const allResults = await this.scrapeMultipleSites(query);
    
    // Combina todos os dados
    const allData: ScrapedData[] = [];
    allResults.results.forEach(result => {
      if (result.data) {
        allData.push(...result.data);
      }
    });

    // Ordena por prioridade e confiança
    return allData.sort((a, b) => {
      const priorityA = this.SITES_CONFIG[a.source]?.priority || 999;
      const priorityB = this.SITES_CONFIG[b.source]?.priority || 999;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      return b.confidence - a.confidence;
    });
  }

  /**
   * Verifica se o cache ainda é válido
   */
  private isCacheValid(timestamp: Date, maxAgeHours: number): boolean {
    const now = new Date();
    const diffHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
    return diffHours < maxAgeHours;
  }

  /**
   * Limpa cache expirado
   */
  async cleanExpiredCache(): Promise<void> {
    const now = new Date();
    const expiredKeys: string[] = [];

    this.cache.forEach((value, key) => {
      const siteKey = key.split('_')[0];
      const config = this.SITES_CONFIG[siteKey];
      
      if (config && !this.isCacheValid(value.timestamp, config.updateFrequency)) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.cache.delete(key));
  }

  /**
   * Adiciona novo site para scraping
   */
  addSite(key: string, config: SiteConfig): void {
    this.SITES_CONFIG[key] = config;
  }

  /**
   * Remove site do scraping
   */
  removeSite(key: string): void {
    delete this.SITES_CONFIG[key];
    
    // Remove do cache também
    const keysToDelete = Array.from(this.cache.keys()).filter(k => k.startsWith(key));
    keysToDelete.forEach(k => this.cache.delete(k));
  }

  /**
   * Obtém estatísticas de scraping
   */
  getStats(): {
    totalSites: number;
    cachedEntries: number;
    lastUpdate: Date;
  } {
    const lastUpdate = Array.from(this.cache.values())
      .map(entry => entry.timestamp)
      .sort((a, b) => b.getTime() - a.getTime())[0] || new Date(0);

    return {
      totalSites: Object.keys(this.SITES_CONFIG).length,
      cachedEntries: this.cache.size,
      lastUpdate
    };
  }
}

// Instância singleton
export const selectiveScrapingService = new SelectiveScrapingService(); 