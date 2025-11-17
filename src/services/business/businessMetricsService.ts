/**
 * Business Metrics Service
 * Serviço para métricas personalizadas por tipo de negócio
 */

import { BusinessType } from '@/hooks/useBusinessType';

export interface BusinessMetric {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  description?: string;
  category: 'revenue' | 'occupancy' | 'marketing' | 'operations' | 'customer';
}

export interface BusinessMetricsConfig {
  businessType: BusinessType;
  metrics: BusinessMetric[];
  kpis: {
    primary: string[];
    secondary: string[];
  };
  labels: {
    [key: string]: string;
  };
}

/**
 * Configurações de métricas por tipo de negócio
 */
const METRICS_CONFIG: Record<string, BusinessMetricsConfig> = {
  hotel: {
    businessType: 'hotel',
    metrics: [
      {
        id: 'occupancy_rate',
        label: 'Taxa de Ocupação',
        value: 0,
        unit: '%',
        icon: 'Bed',
        description: 'Percentual de quartos ocupados',
        category: 'occupancy'
      },
      {
        id: 'adr',
        label: 'ADR',
        value: 0,
        unit: 'R$',
        icon: 'DollarSign',
        description: 'Average Daily Rate - Preço médio por diária',
        category: 'revenue'
      },
      {
        id: 'revpar',
        label: 'RevPAR',
        value: 0,
        unit: 'R$',
        icon: 'TrendingUp',
        description: 'Revenue per Available Room',
        category: 'revenue'
      },
      {
        id: 'avg_stay',
        label: 'Permanência Média',
        value: 0,
        unit: 'dias',
        icon: 'Calendar',
        description: 'Tempo médio de permanência dos hóspedes',
        category: 'operations'
      },
      {
        id: 'cancellation_rate',
        label: 'Taxa de Cancelamento',
        value: 0,
        unit: '%',
        icon: 'XCircle',
        description: 'Percentual de reservas canceladas',
        category: 'operations'
      }
    ],
    kpis: {
      primary: ['occupancy_rate', 'adr', 'revpar'],
      secondary: ['avg_stay', 'cancellation_rate']
    },
    labels: {
      occupancy_rate: 'Taxa de Ocupação',
      adr: 'ADR (Preço Médio)',
      revpar: 'RevPAR',
      avg_stay: 'Permanência Média',
      cancellation_rate: 'Taxa de Cancelamento'
    }
  },
  pousada: {
    businessType: 'pousada',
    metrics: [
      {
        id: 'occupancy_rate',
        label: 'Taxa de Ocupação',
        value: 0,
        unit: '%',
        icon: 'Home',
        description: 'Percentual de quartos ocupados',
        category: 'occupancy'
      },
      {
        id: 'adr',
        label: 'Preço Médio',
        value: 0,
        unit: 'R$',
        icon: 'DollarSign',
        description: 'Preço médio por diária',
        category: 'revenue'
      },
      {
        id: 'avg_stay',
        label: 'Permanência Média',
        value: 0,
        unit: 'dias',
        icon: 'Calendar',
        description: 'Tempo médio de permanência',
        category: 'operations'
      },
      {
        id: 'repeat_guests',
        label: 'Hóspedes Recorrentes',
        value: 0,
        unit: '%',
        icon: 'Users',
        description: 'Percentual de hóspedes que retornam',
        category: 'customer'
      }
    ],
    kpis: {
      primary: ['occupancy_rate', 'adr'],
      secondary: ['avg_stay', 'repeat_guests']
    },
    labels: {
      occupancy_rate: 'Taxa de Ocupação',
      adr: 'Preço Médio',
      avg_stay: 'Permanência Média',
      repeat_guests: 'Hóspedes Recorrentes'
    }
  },
  restaurante: {
    businessType: 'restaurante',
    metrics: [
      {
        id: 'avg_ticket',
        label: 'Ticket Médio',
        value: 0,
        unit: 'R$',
        icon: 'DollarSign',
        description: 'Valor médio por pedido',
        category: 'revenue'
      },
      {
        id: 'tables_turnover',
        label: 'Giro de Mesas',
        value: 0,
        unit: 'vezes/dia',
        icon: 'RefreshCw',
        description: 'Quantas vezes a mesa é ocupada por dia',
        category: 'operations'
      },
      {
        id: 'occupancy_rate',
        label: 'Taxa de Ocupação',
        value: 0,
        unit: '%',
        icon: 'Users',
        description: 'Percentual de mesas ocupadas',
        category: 'occupancy'
      },
      {
        id: 'customer_satisfaction',
        label: 'Satisfação do Cliente',
        value: 0,
        unit: '/5',
        icon: 'Star',
        description: 'Avaliação média dos clientes',
        category: 'customer'
      }
    ],
    kpis: {
      primary: ['avg_ticket', 'tables_turnover'],
      secondary: ['occupancy_rate', 'customer_satisfaction']
    },
    labels: {
      avg_ticket: 'Ticket Médio',
      tables_turnover: 'Giro de Mesas',
      occupancy_rate: 'Taxa de Ocupação',
      customer_satisfaction: 'Satisfação do Cliente'
    }
  },
  agencia: {
    businessType: 'agencia',
    metrics: [
      {
        id: 'bookings',
        label: 'Reservas',
        value: 0,
        unit: 'unidades',
        icon: 'Calendar',
        description: 'Número de reservas realizadas',
        category: 'revenue'
      },
      {
        id: 'avg_package_value',
        label: 'Valor Médio do Pacote',
        value: 0,
        unit: 'R$',
        icon: 'DollarSign',
        description: 'Valor médio por pacote vendido',
        category: 'revenue'
      },
      {
        id: 'conversion_rate',
        label: 'Taxa de Conversão',
        value: 0,
        unit: '%',
        icon: 'Target',
        description: 'Percentual de leads convertidos',
        category: 'marketing'
      },
      {
        id: 'customer_retention',
        label: 'Retenção de Clientes',
        value: 0,
        unit: '%',
        icon: 'Users',
        description: 'Percentual de clientes que retornam',
        category: 'customer'
      }
    ],
    kpis: {
      primary: ['bookings', 'avg_package_value'],
      secondary: ['conversion_rate', 'customer_retention']
    },
    labels: {
      bookings: 'Reservas',
      avg_package_value: 'Valor Médio do Pacote',
      conversion_rate: 'Taxa de Conversão',
      customer_retention: 'Retenção de Clientes'
    }
  },
  guia: {
    businessType: 'guia',
    metrics: [
      {
        id: 'tours',
        label: 'Passeios Realizados',
        value: 0,
        unit: 'unidades',
        icon: 'MapPin',
        description: 'Número de passeios realizados',
        category: 'operations'
      },
      {
        id: 'avg_tour_value',
        label: 'Valor Médio do Passeio',
        value: 0,
        unit: 'R$',
        icon: 'DollarSign',
        description: 'Valor médio por passeio',
        category: 'revenue'
      },
      {
        id: 'customer_satisfaction',
        label: 'Satisfação do Cliente',
        value: 0,
        unit: '/5',
        icon: 'Star',
        description: 'Avaliação média dos clientes',
        category: 'customer'
      },
      {
        id: 'repeat_customers',
        label: 'Clientes Recorrentes',
        value: 0,
        unit: '%',
        icon: 'Users',
        description: 'Percentual de clientes que retornam',
        category: 'customer'
      }
    ],
    kpis: {
      primary: ['tours', 'avg_tour_value'],
      secondary: ['customer_satisfaction', 'repeat_customers']
    },
    labels: {
      tours: 'Passeios Realizados',
      avg_tour_value: 'Valor Médio do Passeio',
      customer_satisfaction: 'Satisfação do Cliente',
      repeat_customers: 'Clientes Recorrentes'
    }
  },
  atracao: {
    businessType: 'atracao',
    metrics: [
      {
        id: 'visitors',
        label: 'Visitantes',
        value: 0,
        unit: 'pessoas',
        icon: 'Users',
        description: 'Número de visitantes',
        category: 'occupancy'
      },
      {
        id: 'avg_ticket',
        label: 'Ticket Médio',
        value: 0,
        unit: 'R$',
        icon: 'DollarSign',
        description: 'Valor médio do ingresso',
        category: 'revenue'
      },
      {
        id: 'occupancy_rate',
        label: 'Taxa de Ocupação',
        value: 0,
        unit: '%',
        icon: 'BarChart3',
        description: 'Percentual de capacidade utilizada',
        category: 'occupancy'
      },
      {
        id: 'customer_satisfaction',
        label: 'Satisfação do Visitante',
        value: 0,
        unit: '/5',
        icon: 'Star',
        description: 'Avaliação média dos visitantes',
        category: 'customer'
      }
    ],
    kpis: {
      primary: ['visitors', 'avg_ticket'],
      secondary: ['occupancy_rate', 'customer_satisfaction']
    },
    labels: {
      visitors: 'Visitantes',
      avg_ticket: 'Ticket Médio',
      occupancy_rate: 'Taxa de Ocupação',
      customer_satisfaction: 'Satisfação do Visitante'
    }
  },
  transporte: {
    businessType: 'transporte',
    metrics: [
      {
        id: 'trips',
        label: 'Viagens Realizadas',
        value: 0,
        unit: 'unidades',
        icon: 'Navigation',
        description: 'Número de viagens realizadas',
        category: 'operations'
      },
      {
        id: 'avg_trip_value',
        label: 'Valor Médio da Viagem',
        value: 0,
        unit: 'R$',
        icon: 'DollarSign',
        description: 'Valor médio por viagem',
        category: 'revenue'
      },
      {
        id: 'occupancy_rate',
        label: 'Taxa de Ocupação',
        value: 0,
        unit: '%',
        icon: 'Users',
        description: 'Percentual de assentos ocupados',
        category: 'occupancy'
      },
      {
        id: 'punctuality',
        label: 'Pontualidade',
        value: 0,
        unit: '%',
        icon: 'Clock',
        description: 'Percentual de viagens no horário',
        category: 'operations'
      }
    ],
    kpis: {
      primary: ['trips', 'avg_trip_value'],
      secondary: ['occupancy_rate', 'punctuality']
    },
    labels: {
      trips: 'Viagens Realizadas',
      avg_trip_value: 'Valor Médio da Viagem',
      occupancy_rate: 'Taxa de Ocupação',
      punctuality: 'Pontualidade'
    }
  },
  evento: {
    businessType: 'evento',
    metrics: [
      {
        id: 'events',
        label: 'Eventos Realizados',
        value: 0,
        unit: 'unidades',
        icon: 'Calendar',
        description: 'Número de eventos realizados',
        category: 'operations'
      },
      {
        id: 'avg_attendance',
        label: 'Público Médio',
        value: 0,
        unit: 'pessoas',
        icon: 'Users',
        description: 'Número médio de participantes',
        category: 'occupancy'
      },
      {
        id: 'avg_ticket',
        label: 'Ticket Médio',
        value: 0,
        unit: 'R$',
        icon: 'DollarSign',
        description: 'Valor médio do ingresso',
        category: 'revenue'
      },
      {
        id: 'customer_satisfaction',
        label: 'Satisfação do Público',
        value: 0,
        unit: '/5',
        icon: 'Star',
        description: 'Avaliação média dos participantes',
        category: 'customer'
      }
    ],
    kpis: {
      primary: ['events', 'avg_attendance'],
      secondary: ['avg_ticket', 'customer_satisfaction']
    },
    labels: {
      events: 'Eventos Realizados',
      avg_attendance: 'Público Médio',
      avg_ticket: 'Ticket Médio',
      customer_satisfaction: 'Satisfação do Público'
    }
  },
  outro: {
    businessType: 'outro',
    metrics: [
      {
        id: 'revenue',
        label: 'Receita',
        value: 0,
        unit: 'R$',
        icon: 'DollarSign',
        description: 'Receita total',
        category: 'revenue'
      },
      {
        id: 'customers',
        label: 'Clientes',
        value: 0,
        unit: 'pessoas',
        icon: 'Users',
        description: 'Número de clientes',
        category: 'customer'
      },
      {
        id: 'avg_transaction',
        label: 'Transação Média',
        value: 0,
        unit: 'R$',
        icon: 'TrendingUp',
        description: 'Valor médio por transação',
        category: 'revenue'
      },
      {
        id: 'customer_satisfaction',
        label: 'Satisfação do Cliente',
        value: 0,
        unit: '/5',
        icon: 'Star',
        description: 'Avaliação média dos clientes',
        category: 'customer'
      }
    ],
    kpis: {
      primary: ['revenue', 'customers'],
      secondary: ['avg_transaction', 'customer_satisfaction']
    },
    labels: {
      revenue: 'Receita',
      customers: 'Clientes',
      avg_transaction: 'Transação Média',
      customer_satisfaction: 'Satisfação do Cliente'
    }
  }
};

/**
 * Obter configuração de métricas para um tipo de negócio
 */
export const getBusinessMetricsConfig = (businessType: BusinessType): BusinessMetricsConfig | null => {
  if (!businessType) return null;
  return METRICS_CONFIG[businessType] || METRICS_CONFIG.outro;
};

/**
 * Obter métricas disponíveis para um tipo de negócio
 */
export const getBusinessMetrics = (businessType: BusinessType): BusinessMetric[] => {
  const config = getBusinessMetricsConfig(businessType);
  return config?.metrics || [];
};

/**
 * Obter labels personalizados para um tipo de negócio
 */
export const getBusinessMetricLabel = (businessType: BusinessType, metricId: string): string => {
  const config = getBusinessMetricsConfig(businessType);
  return config?.labels[metricId] || metricId;
};

/**
 * Verificar se uma métrica é relevante para um tipo de negócio
 */
export const isMetricRelevant = (businessType: BusinessType, metricId: string): boolean => {
  const metrics = getBusinessMetrics(businessType);
  return metrics.some(m => m.id === metricId);
};

