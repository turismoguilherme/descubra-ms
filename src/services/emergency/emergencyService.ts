import { 
  EmergencyAlert, 
  EmergencyContact, 
  WeatherAlert, 
  HealthAlert, 
  SafetyAlert, 
  EmergencyResponse,
  EmergencyConfig 
} from './emergencyTypes';

class EmergencyService {
  private config: EmergencyConfig = {
    enabled: true,
    autoCheck: true,
    checkInterval: 30, // 30 minutos
    sources: {
      weather: ['INMET', 'CPTEC'],
      health: ['Ministério da Saúde', 'SES-MS'],
      safety: ['Polícia Militar', 'Defesa Civil']
    },
    defaultContacts: [
      {
        id: 'emergency-001',
        name: 'Polícia Militar',
        phone: '190',
        description: 'Emergências policiais',
        category: 'police',
        available24h: true,
        languages: ['pt-BR']
      },
      {
        id: 'emergency-002',
        name: 'Bombeiros',
        phone: '193',
        description: 'Emergências de incêndio e resgate',
        category: 'fire',
        available24h: true,
        languages: ['pt-BR']
      },
      {
        id: 'emergency-003',
        name: 'SAMU',
        phone: '192',
        description: 'Emergências médicas',
        category: 'ambulance',
        available24h: true,
        languages: ['pt-BR']
      }
    ]
  };

  private emergencyContacts: EmergencyContact[] = [
    // Contatos de Campo Grande
    {
      id: 'contact-cg-001',
      name: 'Hospital Regional de Mato Grosso do Sul',
      phone: '(67) 3314-5000',
      description: 'Hospital público de referência',
      category: 'hospital',
      location: 'Campo Grande, MS',
      address: 'Av. Senador Filinto Müller, 555',
      available24h: true,
      languages: ['pt-BR']
    },
    {
      id: 'contact-cg-002',
      name: 'Hospital Universitário Maria Aparecida Pedrossian',
      phone: '(67) 3345-7000',
      description: 'Hospital universitário',
      category: 'hospital',
      location: 'Campo Grande, MS',
      address: 'Av. Senador Filinto Müller, 555',
      available24h: true,
      languages: ['pt-BR']
    },
    {
      id: 'contact-cg-003',
      name: 'Delegacia de Turismo',
      phone: '(67) 3321-1234',
      description: 'Apoio específico para turistas',
      category: 'tourism_support',
      location: 'Campo Grande, MS',
      address: 'Centro de Campo Grande',
      available24h: false,
      languages: ['pt-BR', 'en']
    },

    // Contatos de Bonito
    {
      id: 'contact-bonito-001',
      name: 'Hospital Municipal de Bonito',
      phone: '(67) 3255-1234',
      description: 'Hospital municipal',
      category: 'hospital',
      location: 'Bonito, MS',
      address: 'Rua Principal, 123',
      available24h: true,
      languages: ['pt-BR']
    },
    {
      id: 'contact-bonito-002',
      name: 'Posto de Informações Turísticas',
      phone: '(67) 3255-5678',
      description: 'Informações e apoio para turistas',
      category: 'tourism_support',
      location: 'Bonito, MS',
      address: 'Centro de Bonito',
      available24h: false,
      languages: ['pt-BR', 'en', 'es']
    },

    // Contatos de Corumbá
    {
      id: 'contact-corumba-001',
      name: 'Hospital Santa Casa de Corumbá',
      phone: '(67) 3231-1234',
      description: 'Hospital de referência na região',
      category: 'hospital',
      location: 'Corumbá, MS',
      address: 'Rua Domingos Sahib, 123',
      available24h: true,
      languages: ['pt-BR']
    }
  ];

  private weatherAlerts: WeatherAlert[] = [
    {
      id: 'weather-001',
      location: 'Mato Grosso do Sul',
      type: 'heat',
      severity: 'medium',
      description: 'Onda de calor com temperaturas acima de 35°C',
      issuedAt: '2025-01-02T10:00:00Z',
      validUntil: '2025-01-05T18:00:00Z',
      temperature: {
        min: 25,
        max: 38,
        unit: 'celsius'
      },
      recommendations: [
        'Mantenha-se hidratado',
        'Evite exposição ao sol entre 10h e 16h',
        'Use protetor solar',
        'Procure locais com sombra'
      ]
    }
  ];

  private healthAlerts: HealthAlert[] = [
    {
      id: 'health-001',
      location: 'Mato Grosso do Sul',
      type: 'vaccination',
      severity: 'low',
      description: 'Campanha de vacinação contra febre amarela',
      issuedAt: '2025-01-01T08:00:00Z',
      validUntil: '2025-03-31T18:00:00Z',
      affectedPopulation: 'Turistas e residentes',
      prevention: [
        'Vacina contra febre amarela (10 dias antes da viagem)',
        'Uso de repelente',
        'Roupas que cubram braços e pernas'
      ],
      treatment: [
        'Procurar atendimento médico imediatamente se apresentar sintomas'
      ],
      hospitals: this.emergencyContacts.filter(c => c.category === 'hospital')
    }
  ];

  private safetyAlerts: SafetyAlert[] = [
    {
      id: 'safety-001',
      location: 'Bonito, MS',
      type: 'road',
      severity: 'low',
      description: 'Manutenção na estrada de acesso a algumas grutas',
      issuedAt: '2025-01-02T06:00:00Z',
      validUntil: '2025-01-15T18:00:00Z',
      affectedAreas: ['Gruta do Lago Azul', 'Gruta de São Miguel'],
      recommendations: [
        'Verifique o estado da estrada antes de sair',
        'Consulte agências locais sobre condições',
        'Tenha plano alternativo de roteiro'
      ],
      emergencyContacts: this.emergencyContacts.filter(c => c.location === 'Bonito, MS')
    }
  ];

  /**
   * Buscar alertas ativos para uma localização
   */
  async getActiveAlerts(location: string): Promise<EmergencyResponse> {
    console.log(`🚨 Buscando alertas ativos para: ${location}`);
    
    try {
      const now = new Date();
      const activeWeather = this.weatherAlerts.filter(alert => 
        new Date(alert.validUntil) > now
      );
      
      const activeHealth = this.healthAlerts.filter(alert => 
        !alert.validUntil || new Date(alert.validUntil) > now
      );
      
      const activeSafety = this.safetyAlerts.filter(alert => 
        !alert.validUntil || new Date(alert.validUntil) > now
      );

      const locationContacts = this.emergencyContacts.filter(contact => 
        !contact.location || contact.location.toLowerCase().includes(location.toLowerCase())
      );

      console.log(`✅ Encontrados ${activeWeather.length + activeHealth.length + activeSafety.length} alertas ativos`);
      
      return {
        success: true,
        weather: activeWeather,
        health: activeHealth,
        safety: activeSafety,
        contacts: locationContacts,
        message: 'Alertas verificados com sucesso'
      };

    } catch (error) {
      console.error('❌ Erro ao buscar alertas:', error);
      return {
        success: false,
        error: 'Erro interno ao buscar alertas'
      };
    }
  }

  /**
   * Buscar contatos de emergência para uma localização
   */
  async getEmergencyContacts(location?: string): Promise<EmergencyContact[]> {
    console.log(`📞 Buscando contatos de emergência para: ${location || 'MS'}`);
    
    if (location) {
      return this.emergencyContacts.filter(contact => 
        !contact.location || contact.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    return this.emergencyContacts;
  }

  /**
   * Verificar se há alertas críticos
   */
  async hasCriticalAlerts(location: string): Promise<boolean> {
    const alerts = await this.getActiveAlerts(location);
    
    if (!alerts.success) return false;
    
    const criticalWeather = alerts.weather?.some(alert => alert.severity === 'critical') || false;
    const criticalHealth = alerts.health?.some(alert => alert.severity === 'critical') || false;
    const criticalSafety = alerts.safety?.some(alert => alert.severity === 'critical') || false;
    
    return criticalWeather || criticalHealth || criticalSafety;
  }

  /**
   * Obter recomendações de segurança para turistas
   */
  async getTouristSafetyRecommendations(location: string): Promise<string[]> {
    const alerts = await this.getActiveAlerts(location);
    const recommendations: string[] = [];
    
    if (alerts.weather) {
      alerts.weather.forEach(alert => {
        recommendations.push(...alert.recommendations);
      });
    }
    
    if (alerts.health) {
      alerts.health.forEach(alert => {
        recommendations.push(...alert.prevention);
      });
    }
    
    if (alerts.safety) {
      alerts.safety.forEach(alert => {
        recommendations.push(...alert.recommendations);
      });
    }
    
    // Recomendações gerais
    recommendations.push(
      'Tenha sempre um telefone carregado',
      'Anote os contatos de emergência locais',
      'Informe sua localização para familiares',
      'Mantenha documentos importantes consigo'
    );
    
    return recommendations;
  }

  /**
   * Verificar configuração do sistema
   */
  getConfig(): EmergencyConfig {
    return this.config;
  }
}

export const emergencyService = new EmergencyService(); 