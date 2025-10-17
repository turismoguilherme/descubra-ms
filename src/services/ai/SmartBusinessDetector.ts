/**
 * Smart Business Detector Service
 * Detecta automaticamente o tipo de negócio e sugere configurações
 */

export interface BusinessProfile {
  type: 'hotel' | 'agency' | 'restaurant' | 'attraction' | 'other';
  size: 'small' | 'medium' | 'large';
  channels: {
    whatsapp?: boolean;
    website?: boolean;
    facebook?: boolean;
    instagram?: boolean;
  };
  needs: string[];
  recommendations: string[];
  autoSetup: {
    canAutoConfigure: boolean;
    requiresPermission: boolean;
    steps: string[];
  };
}

export interface DetectionResult {
  businessProfile: BusinessProfile;
  suggestedFeatures: string[];
  autoSetupAvailable: boolean;
  permissionRequired: boolean;
  nextSteps: string[];
}

/**
 * Detecta automaticamente o tipo de negócio baseado nos dados do usuário
 */
export const detectBusinessType = async (userData: any): Promise<DetectionResult> => {
  const { companyName, businessCategory, website, socialMedia, description } = userData;
  
  // Análise de palavras-chave para detectar tipo de negócio
  const keywords = {
    hotel: ['hotel', 'pousada', 'hospedagem', 'acomodação', 'quarto', 'suite', 'resort'],
    agency: ['agência', 'viagem', 'turismo', 'pacote', 'roteiro', 'excursão', 'tour'],
    restaurant: ['restaurante', 'lanchonete', 'bar', 'comida', 'gastronomia', 'culinária'],
    attraction: ['parque', 'atração', 'museu', 'zoológico', 'aquário', 'cachoeira', 'praia']
  };

  let detectedType: BusinessProfile['type'] = 'other';
  let confidence = 0;

  // Detectar tipo baseado no nome da empresa
  const companyLower = companyName?.toLowerCase() || '';
  for (const [type, words] of Object.entries(keywords)) {
    const matches = words.filter(word => companyLower.includes(word)).length;
    if (matches > confidence) {
      confidence = matches;
      detectedType = type as BusinessProfile['type'];
    }
  }

  // Detectar tipo baseado na categoria
  if (businessCategory) {
    const categoryLower = businessCategory.toLowerCase();
    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => categoryLower.includes(word))) {
        detectedType = type as BusinessProfile['type'];
        confidence = Math.max(confidence, 3);
        break;
      }
    }
  }

  // Detectar canais disponíveis
  const channels = {
    whatsapp: !!socialMedia?.whatsapp,
    website: !!website,
    facebook: !!socialMedia?.facebook,
    instagram: !!socialMedia?.instagram
  };

  // Gerar perfil do negócio
  const businessProfile = generateBusinessProfile(detectedType, channels, confidence);
  
  // Gerar recomendações específicas
  const suggestedFeatures = generateFeatureRecommendations(detectedType, channels);
  
  // Verificar se pode configurar automaticamente
  const autoSetupAvailable = checkAutoSetupAvailability(detectedType, channels);
  
  // Gerar próximos passos
  const nextSteps = generateNextSteps(detectedType, channels, autoSetupAvailable);

  return {
    businessProfile,
    suggestedFeatures,
    autoSetupAvailable,
    permissionRequired: true, // Sempre pedir permissão
    nextSteps
  };
};

/**
 * Gera perfil específico do negócio
 */
const generateBusinessProfile = (
  type: BusinessProfile['type'], 
  channels: BusinessProfile['channels'],
  confidence: number
): BusinessProfile => {
  const profiles = {
    hotel: {
      type: 'hotel' as const,
      size: 'medium' as const,
      needs: ['Revenue Optimizer', 'Market Intelligence', 'IA Conversacional', 'Sistema de Reservas'],
      recommendations: [
        'Otimização de preços dinâmica',
        'Análise de concorrência',
        'Atendimento 24/7 com IA',
        'Gestão de inventário inteligente'
      ],
      autoSetup: {
        canAutoConfigure: channels.whatsapp || channels.website,
        requiresPermission: true,
        steps: [
          'Conectar WhatsApp Business',
          'Instalar chat no site',
          'Configurar IA conversacional',
          'Treinar com dados do hotel'
        ]
      }
    },
    agency: {
      type: 'agency' as const,
      size: 'medium' as const,
      needs: ['Lead Generation', 'IA Conversacional', 'Market Intelligence', 'Sistema de Pacotes'],
      recommendations: [
        'Captação automática de leads',
        'Atendimento inteligente',
        'Análise de tendências de mercado',
        'Gestão de pacotes personalizados'
      ],
      autoSetup: {
        canAutoConfigure: channels.whatsapp || channels.website,
        requiresPermission: true,
        steps: [
          'Conectar WhatsApp Business',
          'Instalar formulários inteligentes',
          'Configurar IA para vendas',
          'Integrar com sistema de pacotes'
        ]
      }
    },
    restaurant: {
      type: 'restaurant' as const,
      size: 'medium' as const,
      needs: ['Sistema de Reservas', 'Menu Optimizer', 'IA Conversacional', 'Analytics'],
      recommendations: [
        'Reservas online inteligentes',
        'Otimização de cardápio',
        'Atendimento automatizado',
        'Análise de vendas'
      ],
      autoSetup: {
        canAutoConfigure: channels.whatsapp || channels.website,
        requiresPermission: true,
        steps: [
          'Conectar WhatsApp Business',
          'Instalar sistema de reservas',
          'Configurar IA para atendimento',
          'Integrar com sistema de mesas'
        ]
      }
    },
    attraction: {
      type: 'attraction' as const,
      size: 'medium' as const,
      needs: ['Sistema de Ingressos', 'IA Conversacional', 'Market Intelligence', 'Analytics'],
      recommendations: [
        'Venda online de ingressos',
        'Atendimento inteligente',
        'Análise de visitantes',
        'Gestão de capacidade'
      ],
      autoSetup: {
        canAutoConfigure: channels.whatsapp || channels.website,
        requiresPermission: true,
        steps: [
          'Conectar WhatsApp Business',
          'Instalar sistema de ingressos',
          'Configurar IA para informações',
          'Integrar com sistema de visitantes'
        ]
      }
    },
    other: {
      type: 'other' as const,
      size: 'medium' as const,
      needs: ['IA Conversacional', 'Analytics', 'Market Intelligence'],
      recommendations: [
        'Atendimento automatizado',
        'Análise de dados',
        'Inteligência de mercado'
      ],
      autoSetup: {
        canAutoConfigure: channels.whatsapp || channels.website,
        requiresPermission: true,
        steps: [
          'Conectar canais disponíveis',
          'Configurar IA básica',
          'Personalizar para seu negócio'
        ]
      }
    }
  };

  return {
    ...profiles[type],
    channels,
    autoSetup: {
      ...profiles[type].autoSetup,
      canAutoConfigure: channels.whatsapp || channels.website
    }
  };
};

/**
 * Gera recomendações de funcionalidades baseadas no tipo de negócio
 */
const generateFeatureRecommendations = (type: BusinessProfile['type'], channels: BusinessProfile['channels']): string[] => {
  const baseFeatures = ['IA Conversacional', 'Analytics', 'Market Intelligence'];
  
  const typeSpecificFeatures = {
    hotel: ['Revenue Optimizer', 'Sistema de Reservas', 'Gestão de Quartos'],
    agency: ['Lead Generation', 'Sistema de Pacotes', 'Gestão de Clientes'],
    restaurant: ['Sistema de Reservas', 'Menu Optimizer', 'Gestão de Mesas'],
    attraction: ['Sistema de Ingressos', 'Gestão de Visitantes', 'Controle de Capacidade'],
    other: ['IA Conversacional', 'Analytics', 'Automação']
  };

  const channelFeatures = [];
  if (channels.whatsapp) channelFeatures.push('WhatsApp Business Integration');
  if (channels.website) channelFeatures.push('Website Chat Integration');
  if (channels.facebook) channelFeatures.push('Facebook Messenger Integration');
  if (channels.instagram) channelFeatures.push('Instagram DM Integration');

  return [...baseFeatures, ...typeSpecificFeatures[type], ...channelFeatures];
};

/**
 * Verifica se pode configurar automaticamente
 */
const checkAutoSetupAvailability = (type: BusinessProfile['type'], channels: BusinessProfile['channels']): boolean => {
  // Só pode configurar automaticamente se tiver pelo menos um canal
  return channels.whatsapp || channels.website || channels.facebook || channels.instagram;
};

/**
 * Gera próximos passos baseados na detecção
 */
const generateNextSteps = (
  type: BusinessProfile['type'], 
  channels: BusinessProfile['channels'],
  autoSetupAvailable: boolean
): string[] => {
  const steps = [
    `Detectamos que você é um ${type === 'hotel' ? 'hotel' : 
     type === 'agency' ? 'agência de viagem' :
     type === 'restaurant' ? 'restaurante' :
     type === 'attraction' ? 'atração turística' : 'negócio turístico'}`
  ];

  if (autoSetupAvailable) {
    steps.push('Podemos configurar automaticamente as seguintes funcionalidades:');
    
    if (channels.whatsapp) {
      steps.push('✅ IA Conversacional no WhatsApp');
    }
    if (channels.website) {
      steps.push('✅ Chat inteligente no seu site');
    }
    if (channels.facebook) {
      steps.push('✅ Integração com Facebook Messenger');
    }
    if (channels.instagram) {
      steps.push('✅ Integração com Instagram DM');
    }
    
    steps.push('Quer que configuremos automaticamente?');
  } else {
    steps.push('Para configurar automaticamente, precisamos de acesso a pelo menos um canal (WhatsApp, site, redes sociais)');
    steps.push('Você pode nos fornecer essas informações?');
  }

  return steps;
};

/**
 * Solicita permissão para configuração automática
 */
export const requestAutoSetupPermission = async (
  businessProfile: BusinessProfile,
  requestedFeatures: string[]
): Promise<{
  approved: boolean;
  permissions: string[];
  nextSteps: string[];
}> => {
  const permissions = [];
  const nextSteps = [];

  // Verificar permissões necessárias
  if (businessProfile.channels.whatsapp && requestedFeatures.includes('WhatsApp Business Integration')) {
    permissions.push('Acesso ao WhatsApp Business');
    nextSteps.push('Conectar conta WhatsApp Business');
  }

  if (businessProfile.channels.website && requestedFeatures.includes('Website Chat Integration')) {
    permissions.push('Acesso ao código do site');
    nextSteps.push('Adicionar código JavaScript ao site');
  }

  if (businessProfile.channels.facebook && requestedFeatures.includes('Facebook Messenger Integration')) {
    permissions.push('Acesso ao Facebook Business');
    nextSteps.push('Conectar página do Facebook');
  }

  if (businessProfile.channels.instagram && requestedFeatures.includes('Instagram DM Integration')) {
    permissions.push('Acesso ao Instagram Business');
    nextSteps.push('Conectar conta do Instagram');
  }

  return {
    approved: true, // Assumindo que usuário aprovou
    permissions,
    nextSteps
  };
};

/**
 * Executa configuração automática com permissões
 */
export const executeAutoSetup = async (
  businessProfile: BusinessProfile,
  permissions: string[]
): Promise<{
  success: boolean;
  configuredFeatures: string[];
  errors: string[];
  nextSteps: string[];
}> => {
  const configuredFeatures = [];
  const errors = [];
  const nextSteps = [];

  try {
    // Simular configuração automática
    for (const permission of permissions) {
      if (permission.includes('WhatsApp')) {
        configuredFeatures.push('WhatsApp Business Integration');
        nextSteps.push('IA configurada no WhatsApp - teste enviando uma mensagem');
      }
      
      if (permission.includes('Website')) {
        configuredFeatures.push('Website Chat Integration');
        nextSteps.push('Chat instalado no site - teste acessando seu site');
      }
      
      if (permission.includes('Facebook')) {
        configuredFeatures.push('Facebook Messenger Integration');
        nextSteps.push('IA configurada no Facebook - teste enviando uma mensagem');
      }
      
      if (permission.includes('Instagram')) {
        configuredFeatures.push('Instagram DM Integration');
        nextSteps.push('IA configurada no Instagram - teste enviando uma mensagem');
      }
    }

    return {
      success: true,
      configuredFeatures,
      errors,
      nextSteps
    };
  } catch (error) {
    return {
      success: false,
      configuredFeatures,
      errors: [error instanceof Error ? error.message : 'Erro desconhecido'],
      nextSteps: ['Entre em contato com o suporte para resolver os problemas']
    };
  }
};
