import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/roles';

export interface CreateUserRoleParams {
  user_id: string;
  role: UserRole;
  region_id?: string;
  city_id?: string;
}

export interface UpdateUserRoleParams {
  role?: UserRole;
  region_id?: string;
  city_id?: string;
}

export class RoleService {
  /**
   * Cria um novo role para um usuário
   */
  static async createUserRole(params: CreateUserRoleParams) {
    const { data, error } = await supabase
      .from('user_roles')
      .insert([params])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar role: ${error.message}`);
    }

    return data;
  }

  /**
   * Atualiza o role de um usuário
   */
  static async updateUserRole(userId: string, params: UpdateUserRoleParams) {
    const { data, error } = await supabase
      .from('user_roles')
      .update(params)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar role: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtém o role de um usuário
   */
  static async getUserRole(userId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(`Erro ao obter role: ${error.message}`);
    }

    return data;
  }

  /**
   * Lista todos os usuários com um role específico
   */
  static async getUsersByRole(role: UserRole) {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        user_profiles (
          id,
          full_name,
          email
        )
      `)
      .eq('role', role);

    if (error) {
      throw new Error(`Erro ao listar usuários por role: ${error.message}`);
    }

    return data;
  }

  /**
   * Lista usuários por região
   */
  static async getUsersByRegion(regionId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        user_profiles (
          id,
          full_name,
          email
        )
      `)
      .eq('region_id', regionId);

    if (error) {
      throw new Error(`Erro ao listar usuários por região: ${error.message}`);
    }

    return data;
  }

  /**
   * Lista usuários por cidade
   */
  static async getUsersByCity(cityId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        user_profiles (
          id,
          full_name,
          email
        )
      `)
      .eq('city_id', cityId);

    if (error) {
      throw new Error(`Erro ao listar usuários por cidade: ${error.message}`);
    }

    return data;
  }

  /**
   * Remove o role de um usuário
   */
  static async removeUserRole(userId: string) {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao remover role: ${error.message}`);
    }

    return true;
  }

  /**
   * Verifica se um usuário tem permissão para acessar dados de uma região
   */
  static async canAccessRegion(userId: string, regionId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role, region_id')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    // Admin e diretor estadual podem acessar qualquer região
    if (data.role === 'admin' || data.role === 'diretor_estadual') {
      return true;
    }

    // Gestor regional só pode acessar sua região
    if (data.role === 'gestor_igr') {
      return data.region_id === regionId;
    }

    return false;
  }

  /**
   * Verifica se um usuário tem permissão para acessar dados de uma cidade
   */
  static async canAccessCity(userId: string, cityId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role, city_id, region_id')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    // Admin e diretor estadual podem acessar qualquer cidade
    if (data.role === 'admin' || data.role === 'diretor_estadual') {
      return true;
    }

    // Gestor regional pode acessar cidades de sua região
    if (data.role === 'gestor_igr') {
      // Verificar se a cidade pertence à região do gestor
      const { data: cityData } = await supabase
        .from('cities')
        .select('region_id')
        .eq('id', cityId)
        .single();

      return cityData?.region_id === data.region_id;
    }

    // Gestor municipal e atendente só podem acessar sua cidade
    if (data.role === 'gestor_municipal' || data.role === 'atendente') {
      return data.city_id === cityId;
    }

    return false;
  }

  /**
   * REMOVIDO: Função de criação de usuários de teste removida por segurança
   * Use a interface de administração adequada para criar usuários
   */
} 