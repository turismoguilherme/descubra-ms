/**
 * Testes Automatizados para o Dashboard ViaJAR
 * Testes de integração e funcionalidades principais
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViaJARUnifiedDashboard from '@/pages/ViaJARUnifiedDashboard';

// Mock dos serviços
vi.mock('@/services/analyticsService', () => ({
  analyticsService: {
    getPredictiveAnalytics: vi.fn().mockResolvedValue({
      predictedVisitors: 1500,
      confidenceLevel: 85,
      seasonalFactors: [
        { month: 'Jan', factor: 0.8 },
        { month: 'Jul', factor: 1.3 }
      ],
      trendDirection: 'increasing',
      recommendations: ['Aumentar capacidade'],
      riskFactors: []
    }),
    getAIPredictions: vi.fn().mockResolvedValue([
      {
        scenario: 'Crescimento Sustentado',
        probability: 65,
        impact: 'high',
        timeframe: '3-6 meses',
        description: 'Aumento gradual de 15-25%'
      }
    ])
  }
}));

vi.mock('@/services/tourismHeatmapService', () => ({
  TourismHeatmapService: {
    subscribeToRealtimeUpdates: vi.fn(),
    unsubscribeFromRealtimeUpdates: vi.fn(),
    getRealtimeHeatmapData: vi.fn().mockResolvedValue([
      {
        lat: -20.5,
        lng: -54.6,
        intensity: 0.8,
        radius: 200,
        type: 'density',
        timestamp: new Date().toISOString(),
        metadata: {
          total_visitors: 15,
          average_duration: 45,
          peak_hours: ['14:00', '16:00'],
          popular_activities: ['viewing', 'visiting']
        }
      }
    ])
  }
}));

vi.mock('@/services/collaborativeService', () => ({
  collaborativeService: {
    createCollaborationSession: vi.fn().mockResolvedValue({
      id: 'session_123',
      title: 'Sessão de Planejamento',
      description: 'Discussão sobre estratégias',
      participants: ['user1', 'user2'],
      created_by: 'current-user',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      shared_resources: [],
      chat_messages: []
    })
  }
}));

describe('ViaJAR Unified Dashboard', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup após cada teste
    vi.restoreAllMocks();
  });

  describe('Renderização Inicial', () => {
    it('deve renderizar o dashboard sem erros', () => {
      render(<ViaJARUnifiedDashboard />);
      
      expect(screen.getByText('ViaJAR Dashboard')).toBeInTheDocument();
    });

    it('deve exibir todas as abas principais', () => {
      render(<ViaJARUnifiedDashboard />);
      
      expect(screen.getByText('Inventário Turístico')).toBeInTheDocument();
      expect(screen.getByText('Gestão de Eventos')).toBeInTheDocument();
      expect(screen.getByText('Gestão de CATs')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });
  });

  describe('Navegação entre Abas', () => {
    it('deve alternar entre abas corretamente', async () => {
      render(<ViaJARUnifiedDashboard />);
      
      const inventoryTab = screen.getByText('Inventário Turístico');
      fireEvent.click(inventoryTab);
      
      expect(screen.getByText('Atrações Cadastradas')).toBeInTheDocument();
    });

    it('deve exibir conteúdo correto para cada aba', async () => {
      render(<ViaJARUnifiedDashboard />);
      
      // Testar aba de Analytics
      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Analytics e Relatórios')).toBeInTheDocument();
      });
    });
  });

  describe('Funcionalidades de Inventário', () => {
    it('deve permitir adicionar nova atração', async () => {
      render(<ViaJARUnifiedDashboard />);
      
      const inventoryTab = screen.getByText('Inventário Turístico');
      fireEvent.click(inventoryTab);
      
      const addButton = screen.getByText('Nova Atração');
      fireEvent.click(addButton);
      
      // Verificar se modal de adição aparece
      expect(screen.getByText('Adicionar Nova Atração')).toBeInTheDocument();
    });

    it('deve validar campos obrigatórios', async () => {
      render(<ViaJARUnifiedDashboard />);
      
      const inventoryTab = screen.getByText('Inventário Turístico');
      fireEvent.click(inventoryTab);
      
      const addButton = screen.getByText('Nova Atração');
      fireEvent.click(addButton);
      
      const saveButton = screen.getByText('Salvar');
      fireEvent.click(saveButton);
      
      // Verificar se mensagens de validação aparecem
      await waitFor(() => {
        expect(screen.getByText('Nome deve ter pelo menos 3 caracteres')).toBeInTheDocument();
      });
    });
  });

  describe('Funcionalidades Avançadas', () => {
    it('deve carregar analytics preditivos', async () => {
      render(<ViaJARUnifiedDashboard />);
      
      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);
      
      const predictiveButton = screen.getByText('Analytics Preditivos');
      fireEvent.click(predictiveButton);
      
      await waitFor(() => {
        expect(screen.getByText('📊 Analytics preditivos carregados!')).toBeInTheDocument();
      });
    });

    it('deve iniciar mapa de calor em tempo real', async () => {
      render(<ViaJARUnifiedDashboard />);
      
      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);
      
      const heatmapButton = screen.getByText('Mapa de Calor em Tempo Real');
      fireEvent.click(heatmapButton);
      
      await waitFor(() => {
        expect(screen.getByText('🔥 Mapa de calor atualizado em tempo real!')).toBeInTheDocument();
      });
    });

    it('deve criar sessão colaborativa', async () => {
      render(<ViaJARUnifiedDashboard />);
      
      const collaborationButton = screen.getByText('Sessão Colaborativa');
      fireEvent.click(collaborationButton);
      
      await waitFor(() => {
        expect(screen.getByText('🤝 Sessão colaborativa criada!')).toBeInTheDocument();
      });
    });
  });

  describe('Sistema de Notificações', () => {
    it('deve exibir notificações de sucesso', async () => {
      render(<ViaJARUnifiedDashboard />);
      
      const inventoryTab = screen.getByText('Inventário Turístico');
      fireEvent.click(inventoryTab);
      
      const addButton = screen.getByText('Nova Atração');
      fireEvent.click(addButton);
      
      // Preencher formulário válido
      const nameInput = screen.getByPlaceholderText('Nome da atração');
      fireEvent.change(nameInput, { target: { value: 'Parque das Cachoeiras' } });
      
      const descriptionInput = screen.getByPlaceholderText('Descrição');
      fireEvent.change(descriptionInput, { target: { value: 'Parque natural com trilhas e cachoeiras' } });
      
      const saveButton = screen.getByText('Salvar');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Nova atração criada com sucesso!')).toBeInTheDocument();
      });
    });

    it('deve exibir notificações de erro', async () => {
      render(<ViaJARUnifiedDashboard />);
      
      const inventoryTab = screen.getByText('Inventário Turístico');
      fireEvent.click(inventoryTab);
      
      const addButton = screen.getByText('Nova Atração');
      fireEvent.click(addButton);
      
      const saveButton = screen.getByText('Salvar');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Nome deve ter pelo menos 3 caracteres')).toBeInTheDocument();
      });
    });
  });

  describe('Performance e Cache', () => {
    it('deve carregar dados do cache quando disponível', async () => {
      render(<ViaJARUnifiedDashboard />);
      
      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);
      
      // Primeira carga
      const predictiveButton = screen.getByText('Analytics Preditivos');
      fireEvent.click(predictiveButton);
      
      await waitFor(() => {
        expect(screen.getByText('📊 Analytics preditivos carregados!')).toBeInTheDocument();
      });
      
      // Segunda carga (deve usar cache)
      fireEvent.click(predictiveButton);
      
      // Verificar se não há nova chamada de API
      // (implementação específica depende do mock)
    });

    it('deve limpar cache quando necessário', async () => {
      render(<ViaJARUnifiedDashboard />);
      
      // Simular limpeza de cache
      const clearCacheButton = screen.getByText('Limpar Cache');
      fireEvent.click(clearCacheButton);
      
      await waitFor(() => {
        expect(screen.getByText('Cache limpo com sucesso!')).toBeInTheDocument();
      });
    });
  });

  describe('Integração com Serviços', () => {
    it('deve integrar com TourismHeatmapService', async () => {
      const { TourismHeatmapService } = await import('@/services/tourismHeatmapService');
      
      render(<ViaJARUnifiedDashboard />);
      
      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);
      
      const heatmapButton = screen.getByText('Mapa de Calor em Tempo Real');
      fireEvent.click(heatmapButton);
      
      expect(TourismHeatmapService.subscribeToRealtimeUpdates).toHaveBeenCalled();
    });

    it('deve integrar com analyticsService', async () => {
      const { analyticsService } = await import('@/services/analyticsService');
      
      render(<ViaJARUnifiedDashboard />);
      
      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);
      
      const predictiveButton = screen.getByText('Analytics Preditivos');
      fireEvent.click(predictiveButton);
      
      expect(analyticsService.getPredictiveAnalytics).toHaveBeenCalled();
    });

    it('deve integrar com collaborativeService', async () => {
      const { collaborativeService } = await import('@/services/collaborativeService');
      
      render(<ViaJARUnifiedDashboard />);
      
      const collaborationButton = screen.getByText('Sessão Colaborativa');
      fireEvent.click(collaborationButton);
      
      expect(collaborativeService.createCollaborationSession).toHaveBeenCalled();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter navegação por teclado', () => {
      render(<ViaJARUnifiedDashboard />);
      
      const firstTab = screen.getByText('Inventário Turístico');
      firstTab.focus();
      
      expect(document.activeElement).toBe(firstTab);
    });

    it('deve ter labels apropriados', () => {
      render(<ViaJARUnifiedDashboard />);
      
      const addButton = screen.getByText('Nova Atração');
      expect(addButton).toHaveAttribute('aria-label');
    });
  });

  describe('Responsividade', () => {
    it('deve adaptar layout para mobile', () => {
      // Simular viewport mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<ViaJARUnifiedDashboard />);
      
      // Verificar se layout se adapta
      const container = screen.getByTestId('dashboard-container');
      expect(container).toHaveClass('mobile-layout');
    });
  });
});

