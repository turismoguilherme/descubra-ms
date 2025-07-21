import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/hooks/auth/AuthProvider';
import { testUsers } from '../users/testUsers';
import { supabase } from '@/integrations/supabase/client';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn()
    },
    from: vi.fn()
  }
}));

describe('Controle de Acesso por Perfil', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Teste para Admin Master
  it('Admin Master deve ter acesso total', async () => {
    // Mock do login
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: { id: 'master-id' }, session: {} },
      error: null
    });

    // Mock do perfil
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: testUsers.masterAdmin.profile,
        error: null
      })
    }));

    // Renderizar app com rota protegida
    render(
      <MemoryRouter initialEntries={['/ms/tourism-management']}>
        <AuthProvider>
          {/* App */}
        </AuthProvider>
      </MemoryRouter>
    );

    // Verificar acesso
    await waitFor(() => {
      expect(screen.getByText('Gestão do Turismo')).toBeInTheDocument();
    });
  });

  // Teste para Admin Estadual
  it('Admin Estadual deve ter acesso apenas ao seu estado', async () => {
    // Mock do login
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: { id: 'state-id' }, session: {} },
      error: null
    });

    // Mock do perfil
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: testUsers.stateAdmin.profile,
        error: null
      })
    }));

    // Renderizar app com rota protegida
    render(
      <MemoryRouter initialEntries={['/ms/tourism-management']}>
        <AuthProvider>
          {/* App */}
        </AuthProvider>
      </MemoryRouter>
    );

    // Verificar acesso
    await waitFor(() => {
      expect(screen.getByText('Gestão do Turismo')).toBeInTheDocument();
    });
  });

  // Teste para Admin Municipal
  it('Admin Municipal deve ter acesso apenas à sua cidade', async () => {
    // Mock do login
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: { id: 'city-id' }, session: {} },
      error: null
    });

    // Mock do perfil
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: testUsers.cityAdmin.profile,
        error: null
      })
    }));

    // Renderizar app com rota protegida
    render(
      <MemoryRouter initialEntries={['/ms/municipal-admin']}>
        <AuthProvider>
          {/* App */}
        </AuthProvider>
      </MemoryRouter>
    );

    // Verificar acesso
    await waitFor(() => {
      expect(screen.getByText('Gestão Municipal')).toBeInTheDocument();
    });
  });

  // Teste para Atendente CAT
  it('Atendente CAT deve ter acesso apenas às funcionalidades do CAT', async () => {
    // Mock do login
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: { id: 'cat-id' }, session: {} },
      error: null
    });

    // Mock do perfil
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: testUsers.catAttendant.profile,
        error: null
      })
    }));

    // Renderizar app com rota protegida
    render(
      <MemoryRouter initialEntries={['/ms/cat-attendant']}>
        <AuthProvider>
          {/* App */}
        </AuthProvider>
      </MemoryRouter>
    );

    // Verificar acesso
    await waitFor(() => {
      expect(screen.getByText('CAT Digital')).toBeInTheDocument();
    });
  });

  // Teste para Colaborador
  it('Colaborador deve ter acesso apenas às suas permissões', async () => {
    // Mock do login
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: { id: 'collab-id' }, session: {} },
      error: null
    });

    // Mock do perfil
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: testUsers.collaborator.profile,
        error: null
      })
    }));

    // Renderizar app com rota protegida
    render(
      <MemoryRouter initialEntries={['/ms/collaborator']}>
        <AuthProvider>
          {/* App */}
        </AuthProvider>
      </MemoryRouter>
    );

    // Verificar acesso
    await waitFor(() => {
      expect(screen.getByText('Área do Colaborador')).toBeInTheDocument();
    });
  });

  // Teste para Usuário Regular
  it('Usuário Regular não deve ter acesso às áreas administrativas', async () => {
    // Mock do login
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: { id: 'user-id' }, session: {} },
      error: null
    });

    // Mock do perfil
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: testUsers.regularUser.profile,
        error: null
      })
    }));

    // Renderizar app com rota protegida
    render(
      <MemoryRouter initialEntries={['/ms/tourism-management']}>
        <AuthProvider>
          {/* App */}
        </AuthProvider>
      </MemoryRouter>
    );

    // Verificar redirecionamento
    await waitFor(() => {
      expect(screen.getByText('Acesso Não Autorizado')).toBeInTheDocument();
    });
  });
}); 