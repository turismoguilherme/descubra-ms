import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataCollectionService } from '@/services/data/dataCollectionService';
import { supabase } from '@/integrations/supabase/client';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                total_count: 1500,
                average_stay: 2.5,
                business_percentage: 30,
                leisure_percentage: 45,
                events_percentage: 25
              },
              error: null
            }))
          }))
        }))
      }))
    }))
  }
}));

describe('DataCollectionService', () => {
  let service: DataCollectionService;

  beforeEach(() => {
    service = new DataCollectionService();
    vi.clearAllMocks();
  });

  it('deve coletar dados de visitantes', async () => {
    const data = await service.collectAllData();
    
    expect(data.visitorData).toBeDefined();
    expect(data.visitorData.totalVisitors).toBe(1500);
    expect(data.visitorData.avgStay).toBe(2.5);
    expect(data.visitorData.visitorProfile).toEqual({
      business: '30%',
      leisure: '45%',
      events: '25%'
    });
  });

  it('deve validar dados corretamente', async () => {
    const validData = {
      visitorData: {
        totalVisitors: 1500,
        avgStay: 2.5,
        topAttractions: ['Parque das Nações']
      },
      economicData: {
        avgSpending: 500,
        jobsCreated: 100
      },
      communityData: {
        localSuggestions: [],
        satisfactionScore: 8.5,
        participationRate: 75
      }
    };

    const isValid = await service.validateData(validData);
    expect(isValid).toBe(true);
  });

  it('deve rejeitar dados inválidos', async () => {
    const invalidData = {
      visitorData: {
        totalVisitors: -1, // Número negativo inválido
        avgStay: 2.5,
        topAttractions: []
      },
      economicData: {
        avgSpending: 500,
        jobsCreated: 100
      },
      communityData: {
        localSuggestions: [],
        satisfactionScore: 11, // Maior que 10, inválido
        participationRate: 75
      }
    };

    const isValid = await service.validateData(invalidData);
    expect(isValid).toBe(false);
  });

  it('deve lidar com erros do Supabase', async () => {
    // Simular erro do Supabase
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: new Error('Erro de conexão')
            }))
          }))
        }))
      }))
    }));

    await expect(service.collectAllData()).rejects.toThrow();
  });

  it('deve coletar dados econômicos', async () => {
    // Mock para dados econômicos
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                average_spending: 500,
                revenue_by_category: { 'hospedagem': 1000000 },
                jobs_created: 100
              },
              error: null
            }))
          }))
        }))
      }))
    }));

    const data = await service.collectAllData();
    
    expect(data.economicData).toBeDefined();
    expect(data.economicData.avgSpending).toBe(500);
    expect(data.economicData.jobsCreated).toBe(100);
  });

  it('deve coletar dados da comunidade', async () => {
    // Mock para dados da comunidade
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                suggestions: [{ content: 'Sugestão teste' }],
                satisfaction_score: 8.5,
                participation_rate: 75
              },
              error: null
            }))
          }))
        }))
      }))
    }));

    const data = await service.collectAllData();
    
    expect(data.communityData).toBeDefined();
    expect(data.communityData.satisfactionScore).toBe(8.5);
    expect(data.communityData.participationRate).toBe(75);
    expect(data.communityData.localSuggestions).toHaveLength(1);
  });
}); 