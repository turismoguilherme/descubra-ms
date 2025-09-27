// 🔑 CONFIGURAÇÃO DE APIS E CHAVES
// Sistema centralizado para gerenciar todas as APIs externas

export const API_CONFIG = {
  // Google Custom Search API
  GOOGLE: {
    SEARCH_API_KEY: import.meta.env.VITE_GOOGLE_SEARCH_API_KEY || '',
    SEARCH_ENGINE_ID: import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID || '',
    isConfigured: () => Boolean(API_CONFIG.GOOGLE.SEARCH_API_KEY && API_CONFIG.GOOGLE.SEARCH_ENGINE_ID)
  },

  // OpenWeather API para clima
  WEATHER: {
    API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY || '',
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    isConfigured: () => Boolean(API_CONFIG.WEATHER.API_KEY)
  },

  // APIs do governo brasileiro
  GOVERNMENT: {
    TOURISM_API: 'https://dados.turismo.gov.br/api',
    IBGE_API: 'https://servicodados.ibge.gov.br/api/v1',
    isConfigured: () => true // APIs públicas sem chave
  },

  // Gemini AI
  GEMINI: {
    API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
    isConfigured: () => Boolean(API_CONFIG.GEMINI.API_KEY)
  },

  // Supabase
  SUPABASE: {
    URL: import.meta.env.VITE_SUPABASE_URL || 'https://hvtrpkbjgbuypkskqcqm.supabase.co',
    ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dHJwa2JqZ2J1eXBrc2txY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzIzODgsImV4cCI6MjA2NzYwODM4OH0.gHxmJIedckwQxz89DUHx4odzTbPefFeadW3T7cYcW2Q',
    isConfigured: () => Boolean(API_CONFIG.SUPABASE.URL && API_CONFIG.SUPABASE.ANON_KEY)
  }
};

// Status geral das configurações
export const getAPIStatus = () => {
  return {
    google: API_CONFIG.GOOGLE.isConfigured(),
    weather: API_CONFIG.WEATHER.isConfigured(),
    government: API_CONFIG.GOVERNMENT.isConfigured(),
    gemini: API_CONFIG.GEMINI.isConfigured(),
    supabase: API_CONFIG.SUPABASE.isConfigured(),
    
    // Calcular score geral
    overallScore: Object.values({
      google: API_CONFIG.GOOGLE.isConfigured(),
      weather: API_CONFIG.WEATHER.isConfigured(),
      government: API_CONFIG.GOVERNMENT.isConfigured(),
      gemini: API_CONFIG.GEMINI.isConfigured(),
      supabase: API_CONFIG.SUPABASE.isConfigured()
    }).filter(Boolean).length
  };
};

// Instruções para configuração
export const API_SETUP_INSTRUCTIONS = {
  google: {
    name: 'Google Custom Search API',
    description: 'Para busca web real e atualizada',
    instructions: [
      '1. Acesse: https://console.developers.google.com/',
      '2. Crie um projeto e ative a "Custom Search API"',
      '3. Gere uma chave de API',
      '4. Crie um mecanismo de busca em: https://cse.google.com/',
      '5. Adicione as variáveis: VITE_GOOGLE_SEARCH_API_KEY e VITE_GOOGLE_SEARCH_ENGINE_ID'
    ],
    priority: 'Alta - Essencial para busca web real'
  },
  
  weather: {
    name: 'OpenWeather API',
    description: 'Para informações climáticas atuais',
    instructions: [
      '1. Acesse: https://openweathermap.org/api',
      '2. Crie uma conta gratuita',
      '3. Obtenha sua chave de API',
      '4. Adicione a variável: VITE_OPENWEATHER_API_KEY'
    ],
    priority: 'Média - Melhora respostas sobre clima'
  },
  
  gemini: {
    name: 'Google Gemini AI',
    description: 'Para processamento inteligente de linguagem',
    instructions: [
      '1. Acesse: https://ai.google.dev/',
      '2. Obtenha uma chave de API do Gemini',
      '3. Adicione a variável: VITE_GEMINI_API_KEY'
    ],
    priority: 'Crítica - Obrigatória para funcionamento'
  }
};

console.log('🔑 API Config carregada:', getAPIStatus());














