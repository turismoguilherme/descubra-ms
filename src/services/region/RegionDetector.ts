/**
 * Region Detector Service
 * Serviço para detecção automática de região do usuário
 * - Detecção por perfil do usuário
 * - Detecção por IP (gratuito)
 * - Detecção por dados de upload
 */

export interface Region {
  country: string;
  state?: string;
  city?: string;
  hasAlumia: boolean;
  dataSources: string[];
  timezone: string;
  currency: string;
  language: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  country?: string;
  state?: string;
  city?: string;
  role?: string;
  business_category?: string;
}

export class RegionDetector {
  private static instance: RegionDetector;
  
  private constructor() {}
  
  static getInstance(): RegionDetector {
    if (!RegionDetector.instance) {
      RegionDetector.instance = new RegionDetector();
    }
    return RegionDetector.instance;
  }

  /**
   * Detectar região do usuário
   */
  async detectUserRegion(userProfile: UserProfile): Promise<Region> {
    console.log('🌍 Detectando região do usuário...');
    
    // 1. Verificar perfil do usuário
    if (userProfile.country && userProfile.state) {
      const profileRegion = this.getRegionFromProfile(userProfile);
      console.log('✅ Região detectada pelo perfil:', profileRegion);
      return profileRegion;
    }
    
    // 2. Detectar por IP (gratuito)
    try {
      const ipRegion = await this.detectByIP();
      console.log('✅ Região detectada por IP:', ipRegion);
      return ipRegion;
    } catch (error) {
      console.log('⚠️ Detecção por IP falhou:', error);
    }
    
    // 3. Detectar por dados de upload/CRM
    try {
      const dataRegion = await this.detectFromUserData();
      console.log('✅ Região detectada por dados:', dataRegion);
      return dataRegion;
    } catch (error) {
      console.log('⚠️ Detecção por dados falhou:', error);
    }
    
    // 4. Fallback para região padrão
    console.log('🔄 Usando região padrão (MS)');
    return this.getDefaultRegion();
  }

  /**
   * Obter região do perfil do usuário
   */
  private getRegionFromProfile(userProfile: UserProfile): Region {
    const country = userProfile.country || 'BR';
    const state = userProfile.state || 'MS';
    const city = userProfile.city || 'Campo Grande';
    
    return {
      country,
      state,
      city,
      hasAlumia: country === 'BR' && state === 'MS',
      dataSources: this.getDataSourcesForRegion(country, state),
      timezone: this.getTimezone(country, state),
      currency: this.getCurrency(country),
      language: this.getLanguage(country)
    };
  }

  /**
   * Detectar região por IP (gratuito)
   */
  private async detectByIP(): Promise<Region> {
    try {
      // Usar serviço gratuito de IP
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.reason);
      }
      
      const country = data.country_code || 'BR';
      const state = data.region || 'MS';
      const city = data.city || 'Campo Grande';
      
      return {
        country,
        state,
        city,
        hasAlumia: country === 'BR' && state === 'MS',
        dataSources: this.getDataSourcesForRegion(country, state),
        timezone: data.timezone || this.getTimezone(country, state),
        currency: data.currency || this.getCurrency(country),
        language: data.languages?.split(',')[0] || this.getLanguage(country)
      };
    } catch (error) {
      console.error('Erro na detecção por IP:', error);
      throw error;
    }
  }

  /**
   * Detectar região por dados do usuário
   */
  private async detectFromUserData(): Promise<Region> {
    try {
      // Verificar dados salvos no localStorage
      const savedRegion = localStorage.getItem('user_region');
      if (savedRegion) {
        const region = JSON.parse(savedRegion);
        console.log('✅ Região encontrada no localStorage:', region);
        return region;
      }
      
      // Verificar dados de upload/CRM
      const uploadedFiles = localStorage.getItem('uploaded_files');
      if (uploadedFiles) {
        const files = JSON.parse(uploadedFiles);
        const region = this.extractRegionFromFiles(files);
        if (region) {
          console.log('✅ Região extraída dos arquivos:', region);
          return region;
        }
      }
      
      throw new Error('Nenhum dado de região encontrado');
    } catch (error) {
      console.error('Erro na detecção por dados:', error);
      throw error;
    }
  }

  /**
   * Extrair região dos arquivos
   */
  private extractRegionFromFiles(files: any[]): Region | null {
    // Lógica para extrair região dos arquivos
    // Por enquanto, retornar null
    return null;
  }

  /**
   * Obter fontes de dados para região
   */
  private getDataSourcesForRegion(country: string, state: string): string[] {
    const sources = ['OpenStreetMap', 'Google Custom Search', 'IA Generativa'];
    
    if (country === 'BR' && state === 'MS') {
      sources.unshift('ALUMIA');
    }
    
    if (country === 'BR') {
      sources.push('SETUR', 'EMBRATUR');
    }
    
    if (country === 'US') {
      sources.push('Google Places', 'TripAdvisor');
    }
    
    if (country === 'EU') {
      sources.push('Booking.com', 'APIs Europeias');
    }
    
    return sources;
  }

  /**
   * Obter timezone para região
   */
  private getTimezone(country: string, state: string): string {
    if (country === 'BR') {
      if (state === 'MS') return 'America/Campo_Grande';
      if (state === 'SP') return 'America/Sao_Paulo';
      if (state === 'RJ') return 'America/Sao_Paulo';
      return 'America/Sao_Paulo';
    }
    
    if (country === 'US') {
      return 'America/New_York';
    }
    
    if (country === 'EU') {
      return 'Europe/London';
    }
    
    return 'UTC';
  }

  /**
   * Obter moeda para país
   */
  private getCurrency(country: string): string {
    const currencies: { [key: string]: string } = {
      'BR': 'BRL',
      'US': 'USD',
      'EU': 'EUR',
      'GB': 'GBP',
      'CA': 'CAD',
      'AU': 'AUD'
    };
    
    return currencies[country] || 'USD';
  }

  /**
   * Obter idioma para país
   */
  private getLanguage(country: string): string {
    const languages: { [key: string]: string } = {
      'BR': 'pt-BR',
      'US': 'en-US',
      'EU': 'en-GB',
      'GB': 'en-GB',
      'CA': 'en-CA',
      'AU': 'en-AU'
    };
    
    return languages[country] || 'en-US';
  }

  /**
   * Obter região padrão
   */
  private getDefaultRegion(): Region {
    return {
      country: 'BR',
      state: 'MS',
      city: 'Campo Grande',
      hasAlumia: true,
      dataSources: ['ALUMIA', 'OpenStreetMap', 'Google Custom Search', 'IA Generativa'],
      timezone: 'America/Campo_Grande',
      currency: 'BRL',
      language: 'pt-BR'
    };
  }

  /**
   * Salvar região do usuário
   */
  async saveUserRegion(region: Region): Promise<void> {
    try {
      localStorage.setItem('user_region', JSON.stringify(region));
      console.log('✅ Região salva:', region);
    } catch (error) {
      console.error('Erro ao salvar região:', error);
    }
  }

  /**
   * Obter região salva
   */
  getSavedRegion(): Region | null {
    try {
      const savedRegion = localStorage.getItem('user_region');
      if (savedRegion) {
        return JSON.parse(savedRegion);
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter região salva:', error);
      return null;
    }
  }

  /**
   * Listar regiões disponíveis
   */
  getAvailableRegions(): Region[] {
    return [
      {
        country: 'BR',
        state: 'MS',
        city: 'Campo Grande',
        hasAlumia: true,
        dataSources: ['ALUMIA', 'OpenStreetMap', 'Google Custom Search', 'IA Generativa'],
        timezone: 'America/Campo_Grande',
        currency: 'BRL',
        language: 'pt-BR'
      },
      {
        country: 'BR',
        state: 'RJ',
        city: 'Rio de Janeiro',
        hasAlumia: false,
        dataSources: ['SETUR-RJ', 'OpenStreetMap', 'Google Custom Search', 'IA Generativa'],
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        language: 'pt-BR'
      },
      {
        country: 'BR',
        state: 'SP',
        city: 'São Paulo',
        hasAlumia: false,
        dataSources: ['SETUR-SP', 'OpenStreetMap', 'Google Custom Search', 'IA Generativa'],
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        language: 'pt-BR'
      },
      {
        country: 'US',
        state: 'CA',
        city: 'Los Angeles',
        hasAlumia: false,
        dataSources: ['Google Places', 'TripAdvisor', 'OpenStreetMap', 'IA Generativa'],
        timezone: 'America/Los_Angeles',
        currency: 'USD',
        language: 'en-US'
      },
      {
        country: 'EU',
        state: 'FR',
        city: 'Paris',
        hasAlumia: false,
        dataSources: ['Booking.com', 'Google Places', 'OpenStreetMap', 'IA Generativa'],
        timezone: 'Europe/Paris',
        currency: 'EUR',
        language: 'fr-FR'
      }
    ];
  }
}

export default RegionDetector;
