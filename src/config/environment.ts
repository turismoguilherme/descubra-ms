// Configurações do ambiente
export const config = {
  mapbox: {
    accessToken: 'pk.eyJ1IjoidGVzdCIsImEiOiJjbGQxMjM0NTYifQ.dummyToken',
    getToken: () => 'pk.eyJ1IjoidGVzdCIsImEiOiJjbGQxMjM0NTYifQ.dummyToken',
    setToken: () => {},
    isValidToken: () => true
  }
};

// Detectar ambiente automaticamente
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Em produção, usar a URL atual
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.origin;
    }
  }
  // Em desenvolvimento, usar localhost
  return 'http://localhost:8080';
};

export const ENV = {
  // API Keys - SECURITY: All API keys moved to secure edge functions
  // No API keys stored in frontend for security
  
  // URLs base - detectadas automaticamente
  BASE_URL: getBaseUrl(),
  API_URL: `${getBaseUrl()}/api`,
  
  // Configurações do Supabase - SECURITY: Use environment variables only
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  
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

  // Configurações do Koda (Canada)
  KODA: {
    AVATAR_URL: '/koda-mascote.jpg',
    NAME: 'Koda',
    DESCRIPTION: 'Your friendly Canadian travel guide',
    DEFAULT_GREETING: "Hey there! I'm Koda, your moose buddy and guide to the wonders of Canada! How can I help you explore the Great White North today?"
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
    ENABLE_HEATMAP: true,
    ENABLE_RAG: true,
    ENABLE_PSE: false,

    // Overflow Studio flags
    STUDIO_ENABLED: true,
    STUDIO_INVENTORY_V1: true,
    STUDIO_SITE_V1: true,
    STUDIO_TEMPLATES_ALL: true,
    STUDIO_AI_COPILOT_V1: true,

    // Commercial integrations
    CRM_HUBSPOT_ENABLED: false,
    BILLING_STRIPE_ENABLED: true
  },

  RAG: {
    DEFAULT_STATE: 'MS',
    TOP_K: 8,
    CONFIDENCE_THRESHOLD: 0.75,
    MAX_LATENCY_MS: 2500,
    EMBEDDING_DIM: 384
  }
};