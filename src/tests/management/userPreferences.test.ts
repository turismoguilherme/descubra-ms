import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserPreferences } from '@/components/management/UserPreferences';
import { supabase } from '@/integrations/supabase/client';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => ({
        data: { user: { id: 'test-user-id' } },
        error: null
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              preferences: {
                defaultReportFormat: 'pdf',
                autoRefreshInterval: 30,
                showCommunityData: true,
                showEconomicData: true,
                defaultView: 'insights',
                notificationsEnabled: true,
                customSections: []
              }
            },
            error: null
          }))
        }))
      })),
      upsert: vi.fn(() => ({
        error: null
      }))
    }))
  }
}));

describe('UserPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar preferências do usuário', async () => {
    render(<UserPreferences />);

    await waitFor(() => {
      expect(screen.getByText('Preferências de Análise')).toBeInTheDocument();
    });

    // Verificar valores padrão
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
  });

  it('deve atualizar formato do relatório', async () => {
    render(<UserPreferences />);

    await waitFor(() => {
      expect(screen.getByText('Formato Padrão de Relatório')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'csv' } });

    expect(screen.getByText('CSV')).toBeInTheDocument();
  });

  it('deve atualizar intervalo de atualização', async () => {
    render(<UserPreferences />);

    await waitFor(() => {
      expect(screen.getByLabelText('Intervalo de Atualização (minutos)')).toBeInTheDocument();
    });

    const input = screen.getByLabelText('Intervalo de Atualização (minutos)');
    fireEvent.change(input, { target: { value: '60' } });

    expect(input.value).toBe('60');
  });

  it('deve salvar preferências', async () => {
    render(<UserPreferences />);

    await waitFor(() => {
      expect(screen.getByText('Salvar Preferências')).toBeInTheDocument();
    });

    // Fazer algumas alterações
    const input = screen.getByLabelText('Intervalo de Atualização (minutos)');
    fireEvent.change(input, { target: { value: '60' } });

    // Clicar no botão salvar
    const saveButton = screen.getByText('Salvar Preferências');
    fireEvent.click(saveButton);

    // Verificar se a chamada para o Supabase foi feita
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('user_preferences');
    });
  });

  it('deve lidar com erro ao carregar preferências', async () => {
    // Simular erro
    vi.mocked(supabase.from).mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: new Error('Erro ao carregar')
          }))
        }))
      }))
    }));

    render(<UserPreferences />);

    // Deve mostrar valores padrão
    await waitFor(() => {
      expect(screen.getByText('PDF')).toBeInTheDocument();
    });
  });

  it('deve validar intervalo de atualização', async () => {
    render(<UserPreferences />);

    await waitFor(() => {
      expect(screen.getByLabelText('Intervalo de Atualização (minutos)')).toBeInTheDocument();
    });

    const input = screen.getByLabelText('Intervalo de Atualização (minutos)');
    
    // Tentar valor menor que o mínimo
    fireEvent.change(input, { target: { value: '1' } });
    expect(input.value).toBe('5'); // Deve manter o mínimo

    // Tentar valor maior que o máximo
    fireEvent.change(input, { target: { value: '150' } });
    expect(input.value).toBe('120'); // Deve manter o máximo
  });

  it('deve alternar visualização de dados', async () => {
    render(<UserPreferences />);

    await waitFor(() => {
      expect(screen.getByText('Mostrar Dados da Comunidade')).toBeInTheDocument();
    });

    const communitySwitch = screen.getByRole('switch', { name: 'Mostrar Dados da Comunidade' });
    const economicSwitch = screen.getByRole('switch', { name: 'Mostrar Dados Econômicos' });

    // Alternar switches
    fireEvent.click(communitySwitch);
    fireEvent.click(economicSwitch);

    expect(communitySwitch).not.toBeChecked();
    expect(economicSwitch).not.toBeChecked();
  });
}); 