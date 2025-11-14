/**
 * Configuração de Deploy para ViaJAR Dashboard
 * Configurações para diferentes ambientes (dev, staging, prod)
 */

const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    supabaseUrl: process.env.VITE_SUPABASE_URL,
    supabaseKey: process.env.VITE_SUPABASE_ANON_KEY,
    monitoring: {
      enabled: true,
      level: 'debug',
      endpoint: 'http://localhost:3001/monitoring'
    },
    cache: {
      enabled: true,
      ttl: 5 * 60 * 1000, // 5 minutos
      maxSize: 100
    },
    features: {
      realtimeHeatmap: true,
      predictiveAnalytics: true,
      collaborativeSessions: true,
      advancedMonitoring: true
    }
  },

  staging: {
    apiUrl: 'https://staging-api.viajar.com.br',
    supabaseUrl: process.env.VITE_SUPABASE_URL,
    supabaseKey: process.env.VITE_SUPABASE_ANON_KEY,
    monitoring: {
      enabled: true,
      level: 'info',
      endpoint: 'https://staging-monitoring.viajar.com.br'
    },
    cache: {
      enabled: true,
      ttl: 10 * 60 * 1000, // 10 minutos
      maxSize: 500
    },
    features: {
      realtimeHeatmap: true,
      predictiveAnalytics: true,
      collaborativeSessions: true,
      advancedMonitoring: true
    }
  },

  production: {
    apiUrl: 'https://api.viajar.com.br',
    supabaseUrl: process.env.VITE_SUPABASE_URL,
    supabaseKey: process.env.VITE_SUPABASE_ANON_KEY,
    monitoring: {
      enabled: true,
      level: 'warn',
      endpoint: 'https://monitoring.viajar.com.br'
    },
    cache: {
      enabled: true,
      ttl: 30 * 60 * 1000, // 30 minutos
      maxSize: 1000
    },
    features: {
      realtimeHeatmap: true,
      predictiveAnalytics: true,
      collaborativeSessions: true,
      advancedMonitoring: true
    }
  }
};

// Determinar ambiente
const environment = process.env.NODE_ENV || 'development';

// Configuração atual
const currentConfig = config[environment];

// Validações de segurança para produção
if (environment === 'production') {
  // Verificar variáveis obrigatórias
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias não encontradas: ${missingVars.join(', ')}`);
  }

  // Configurações de segurança
  currentConfig.security = {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true,
    enableCSRFProtection: true
  };
}

// Configurações de build
const buildConfig = {
  // Otimizações de produção
  optimization: {
    minify: environment === 'production',
    treeshake: true,
    compress: environment === 'production',
    sourcemap: environment !== 'production'
  },

  // Configurações de bundle
  bundle: {
    chunkSize: environment === 'production' ? 250000 : 1000000, // 250KB em produção
    maxChunks: environment === 'production' ? 20 : 50,
    enableCodeSplitting: true
  },

  // Configurações de cache
  cache: {
    static: {
      maxAge: environment === 'production' ? 31536000 : 0, // 1 ano em produção
      etag: true
    },
    api: {
      maxAge: environment === 'production' ? 300 : 60, // 5 min em produção, 1 min em dev
      staleWhileRevalidate: 60
    }
  }
};

// Configurações de monitoramento
const monitoringConfig = {
  // Métricas de performance
  performance: {
    enableWebVitals: true,
    enableResourceTiming: true,
    enableNavigationTiming: true,
    sampleRate: environment === 'production' ? 0.1 : 1.0 // 10% em produção
  },

  // Métricas de erro
  errors: {
    enableGlobalErrorHandling: true,
    enableUnhandledRejectionHandling: true,
    enableConsoleErrorCapture: environment !== 'production',
    sampleRate: environment === 'production' ? 0.5 : 1.0 // 50% em produção
  },

  // Métricas de uso
  usage: {
    enableUserInteractionTracking: true,
    enablePageViewTracking: true,
    enableFeatureUsageTracking: true,
    sampleRate: environment === 'production' ? 0.2 : 1.0 // 20% em produção
  }
};

// Configurações de CDN
const cdnConfig = {
  enabled: environment === 'production',
  domains: [
    'https://cdn.viajar.com.br',
    'https://assets.viajar.com.br'
  ],
  fallback: 'https://api.viajar.com.br'
};

// Configurações de PWA
const pwaConfig = {
  enabled: environment === 'production',
  name: 'ViaJAR Dashboard',
  shortName: 'ViaJAR',
  description: 'Dashboard de Turismo Inteligente',
  themeColor: '#059669',
  backgroundColor: '#ffffff',
  display: 'standalone',
  orientation: 'portrait',
  startUrl: '/',
  scope: '/',
  icons: [
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png'
    }
  ]
};

// Exportar configuração completa
export default {
  environment,
  ...currentConfig,
  build: buildConfig,
  monitoring: monitoringConfig,
  cdn: cdnConfig,
  pwa: pwaConfig
};

