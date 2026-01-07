/**
 * Tourism Inventory Service
 * Serviço para gerenciamento de inventário turístico no Supabase
 */

import { supabase } from '@/integrations/supabase/client';
import { seturValidationService } from './seturValidationService';

export interface TourismAttraction {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  category_id?: string;
  subcategory_id?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  opening_hours?: any; // JSONB
  price_range?: 'free' | 'low' | 'medium' | 'high';
  capacity?: number;
  amenities?: string[]; // JSONB
  images?: string[]; // JSONB
  videos?: string[]; // JSONB
  meta_title?: string;
  meta_description?: string;
  tags?: string[];
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
  is_featured?: boolean;
  is_active?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  // Campos SeTur
  setur_code?: string;
  setur_category_code?: string;
  legal_name?: string;
  registration_number?: string;
  license_number?: string;
  license_expiry_date?: string;
  responsible_name?: string;
  responsible_cpf?: string;
  responsible_email?: string;
  responsible_phone?: string;
  accessibility_features?: any; // JSONB
  capacity_details?: any; // JSONB
  payment_methods?: any; // JSONB
  languages_spoken?: string[];
  certifications?: any; // JSONB
  last_verified_date?: string;
  verification_status?: 'pending' | 'verified' | 'expired' | 'needs_update';
  data_completeness_score?: number;
  setur_compliance_score?: number;
}

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parent_id?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface InventoryFilters {
  category_id?: string;
  city?: string;
  state?: string;
  status?: string;
  is_active?: boolean;
  is_featured?: boolean;
  search?: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number; // Busca por raio
}

export class InventoryService {
  /**
   * Buscar todas as atrações com filtros opcionais
   */
  async getAttractions(filters?: InventoryFilters): Promise<TourismAttraction[]> {
    console.log('🔧 INVENTORYSERVICE: getAttractions chamado com filtros:', filters);

    try {
      let query = supabase
        .from('tourism_inventory')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('🔧 INVENTORYSERVICE: Query inicial criada');

      if (filters) {
        console.log('🔧 INVENTORYSERVICE: Aplicando filtros...');
        if (filters.category_id) {
          query = query.eq('category_id', filters.category_id);
          console.log('🔧 INVENTORYSERVICE: Filtro category_id aplicado:', filters.category_id);
        }
        if (filters.city) {
          query = query.eq('city', filters.city);
          console.log('🔧 INVENTORYSERVICE: Filtro city aplicado:', filters.city);
        }
        if (filters.state) {
          query = query.eq('state', filters.state);
          console.log('🔧 INVENTORYSERVICE: Filtro state aplicado:', filters.state);
        }
        if (filters.status) {
          query = query.eq('status', filters.status);
          console.log('🔧 INVENTORYSERVICE: Filtro status aplicado:', filters.status);
        }
        if (filters.is_active !== undefined) {
          query = query.eq('is_active', filters.is_active);
        }
        if (filters.is_featured !== undefined) {
          query = query.eq('is_featured', filters.is_featured);
        }
        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
        }
      }

      console.log('🔧 INVENTORYSERVICE: Executando query no Supabase...');
      const { data, error } = await query;

      console.log('🔧 INVENTORYSERVICE: Resposta da query - Data count:', data?.length || 0, 'Error:', error);

      if (error) {
        console.error('🔧 INVENTORYSERVICE: Erro na query do Supabase:', error);
        throw error;
      }

      // Se houver filtro de raio, filtrar localmente (Supabase não tem função de distância nativa sem extensão)
      if (filters?.latitude && filters?.longitude && filters?.radius_km && data) {
        console.log('🔧 INVENTORYSERVICE: Aplicando filtro de raio...');
        const filtered = data.filter((item) => {
          if (!item.latitude || !item.longitude) return false;
          const distance = this.calculateDistance(
            filters.latitude!,
            filters.longitude!,
            Number(item.latitude),
            Number(item.longitude)
          );
          return distance <= filters.radius_km!;
        });
        console.log('🔧 INVENTORYSERVICE: Filtro de raio aplicado, itens restantes:', filtered.length);
        return filtered as TourismAttraction[];
      }

      console.log('✅ INVENTORYSERVICE: getAttractions concluído com sucesso, retornando', data?.length || 0, 'itens');
      return (data || []) as TourismAttraction[];
    } catch (error) {
      console.error('❌ INVENTORYSERVICE: Erro ao buscar atrações:', error);
      console.error('❌ INVENTORYSERVICE: Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        code: (error as any)?.code,
        details: (error as any)?.details,
        hint: (error as any)?.hint
      });
      return [];
    }
  }

  /**
   * Buscar atração por ID
   */
  async getAttractionById(id: string): Promise<TourismAttraction | null> {
    try {
      const { data, error } = await supabase
        .from('tourism_inventory')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data as TourismAttraction;
    } catch (error) {
      console.error('Erro ao buscar atração:', error);
      return null;
    }
  }

  /**
   * Criar nova atração
   */
  async createAttraction(attraction: Omit<TourismAttraction, 'id' | 'created_at' | 'updated_at'>): Promise<TourismAttraction> {
    console.log('🔧 INVENTORYSERVICE: createAttraction chamado com dados:', attraction);

    try {
      console.log('🔧 INVENTORYSERVICE: Gerando código SeTur...');
      // Gerar código SeTur se não existir
      let seturCode = attraction.setur_code;
      if (!seturCode) {
        seturCode = await seturValidationService.generateSeTurCode(attraction as TourismAttraction);
        console.log('🔧 INVENTORYSERVICE: Código SeTur gerado:', seturCode);
      }

      // REMOVIDO: Cálculo de scores (colunas não existem na tabela)
      console.log('🔧 INVENTORYSERVICE: Pulando cálculo de scores (colunas não existem)');

      console.log('🔧 INVENTORYSERVICE: Preparando dados para inserção...');
      const { created_by, updated_by, created_at, updated_at, ...attractionWithoutAudit } = attraction;

      const insertData = {
        ...attractionWithoutAudit,
        setur_code: seturCode,
        // REMOVIDO: data_completeness_score e setur_compliance_score (colunas não existem na tabela)
        status: attraction.status || 'draft',
        is_active: attraction.is_active !== undefined ? attraction.is_active : true,
        is_featured: attraction.is_featured || false,
      };

      // Explicitamente definir campos de auditoria como NULL para sobrepor qualquer comportamento automático do Supabase
      insertData.created_by = null;
      insertData.updated_by = null;


      console.log('🔧 INVENTORYSERVICE: Dados preparados para inserção:', insertData);

      console.log('🔧 INVENTORYSERVICE: Executando insert no Supabase...');
      // Temporariamente removendo .select() para evitar possíveis problemas de RLS na consulta
      const { data, error } = await supabase
        .from('tourism_inventory')
        .insert(insertData);

      console.log('🔧 INVENTORYSERVICE: Resposta do Supabase - Error:', error);

      if (error) {
        console.error('🔧 INVENTORYSERVICE: Erro no insert do Supabase:', error);
        throw error;
      }

      console.log('✅ INVENTORYSERVICE: Insert realizado com sucesso');
      // Retornar um objeto básico já que não temos .select()
      return {
        id: 'temp-id-' + Date.now(), // ID temporário já que não temos o real
        ...insertData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as TourismAttraction;
    } catch (error) {
      console.error('❌ INVENTORYSERVICE: Erro ao criar atração:', error);
      console.error('❌ INVENTORYSERVICE: Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        code: (error as any)?.code,
        details: (error as any)?.details,
        hint: (error as any)?.hint
      });
      throw error;
    }
  }

  /**
   * Atualizar atração
   */
  async updateAttraction(id: string, updates: Partial<TourismAttraction>): Promise<TourismAttraction> {
    try {
      // Buscar atração atual para recalcular scores
      const current = await this.getAttractionById(id);
      if (!current) {
        throw new Error('Atração não encontrada');
      }

      // Mesclar atualizações
      const updated = { ...current, ...updates };

      // Recalcular scores se dados foram atualizados
      const completenessScore = await seturValidationService.calculateCompletenessScore(updated);
      const complianceScore = await seturValidationService.calculateComplianceScore(updated);

      // Gerar código SeTur se não existir
      let seturCode = updated.setur_code;
      if (!seturCode) {
        seturCode = await seturValidationService.generateSeTurCode(updated);
      }

      const { data, error } = await supabase
        .from('tourism_inventory')
        .update({
          ...updates,
          setur_code: seturCode,
          data_completeness_score: completenessScore,
          setur_compliance_score: complianceScore,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as TourismAttraction;
    } catch (error) {
      console.error('Erro ao atualizar atração:', error);
      throw error;
    }
  }

  /**
   * Deletar atração
   */
  async deleteAttraction(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tourism_inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar atração:', error);
      throw error;
    }
  }

  /**
   * Buscar categorias
   */
  async getCategories(): Promise<InventoryCategory[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data || []) as InventoryCategory[];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }

  /**
   * Calcular distância entre dois pontos (Haversine)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Exportar atrações para CSV
   */
  async exportToCSV(filters?: InventoryFilters): Promise<string> {
    try {
      const attractions = await this.getAttractions(filters);
      
      if (attractions.length === 0) {
        return 'Nome,Descrição,Endereço,Cidade,Estado,Categoria\n';
      }

      const headers = ['Nome', 'Descrição', 'Endereço', 'Cidade', 'Estado', 'Categoria', 'Status'];
      const rows = attractions.map(attr => [
        attr.name || '',
        (attr.description || '').replace(/,/g, ';'),
        attr.address || '',
        attr.city || '',
        attr.state || '',
        attr.category_id || '',
        attr.status || ''
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return csv;
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      throw error;
    }
  }
}

export const inventoryService = new InventoryService();








