// Configurações do ambiente
export const ENV = {
  // API Keys
  GEMINI_API_KEY: 'AIzaSyCX7Cmid7hQDDucWtNoP5zJ4uDsDgmPJmw',
  
  // URLs base
  BASE_URL: 'http://localhost:8081',
  API_URL: 'http://localhost:8081/api',
  
  // Configurações do Supabase
  SUPABASE_URL: 'https://hvtrpkbjgbuypkskqcqm.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dHJwa2JqZ2J1eXBrc2txY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzIzODgsImV4cCI6MjA2NzYwODM4OH0.gHxmJIedckwQxz89DUHx4odzTbPefFeadW3T7cYcW2Q',
  
  // Configurações da aplicação
  APP_NAME: 'Descubra MS',
  APP_VERSION: '1.0.0',
  
  // Configurações do tenant
  DEFAULT_TENANT: 'ms',
  
  // Configurações do Guatá
  GUATA: {
    AVATAR_URL: '/guata-mascote.jpg',
    NAME: 'Guatá',
    DESCRIPTION: 'Seu guia de turismo inteligente',
    DEFAULT_GREETING: 'Olá! Eu sou o Guatá, seu guia turístico virtual. Como posso ajudar você a descobrir o Mato Grosso do Sul hoje?'
  },
  
  // Configurações de cache
  CACHE_DURATION: 60 * 60 * 1000, // 1 hora em milissegundos
  
  // Configurações de rate limiting
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 15,
    REQUESTS_PER_DAY: 1500
  },
  
  // Configurações de timeout
  REQUEST_TIMEOUT: 30000, // 30 segundos
  
  // Configurações de logging
  LOG_LEVEL: 'info',
  
  // Feature flags
  FEATURES: {
    ENABLE_GEMINI: true,
    ENABLE_VOICE: true,
    ENABLE_ANALYTICS: true,
    ENABLE_HEATMAP: true
  }
};