/**
 * Plano Diretor Integration Service
 * Integra com funcionalidades existentes para coletar dados automáticos
 */

import { supabase } from '@/integrations/supabase/client';
import { inventoryService } from './inventoryService';

export class PlanoDiretorIntegrationService {
  /**
   * Coletar todos os dados disponíveis para diagnóstico
   */
  async collectAllData(municipioNome: string, municipioUf: string): Promise<any> {
    try {
      const [inventario, cats, eventos, analytics] = await Promise.all([
        this.getInventarioData(municipioNome, municipioUf),
        this.getCATsData(municipioNome, municipioUf),
        this.getEventosData(municipioNome, municipioUf),
        this.getAnalyticsData(municipioNome, municipioUf)
      ]);

      return {
        situacaoAtual: {
          atrativos: inventario.total,
          atrativosAtivos: inventario.ativos,
          cats: cats.total,
          eventos: eventos.total,
          eventosConfirmados: eventos.confirmados
        },
        inventario: inventario,
        cats: cats,
        eventos: eventos,
        analytics: analytics,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao coletar dados:', error);
      throw error;
    }
  }

  /**
   * Coletar dados do inventário turístico
   */
  private async getInventarioData(municipioNome: string, municipioUf: string): Promise<any> {
    try {
      const atracoes = await inventoryService.getAttractions({
        city: municipioNome,
        state: municipioUf,
        is_active: true
      });

      return {
        total: atracoes.length,
        ativos: atracoes.filter(a => a.is_active).length,
        porCategoria: this.groupByCategory(atracoes),
        detalhes: atracoes.map(a => ({
          nome: a.name,
          categoria: a.category_id,
          status: a.status,
          ativo: a.is_active
        }))
      };
    } catch (error) {
      console.error('Erro ao coletar dados do inventário:', error);
      return { total: 0, ativos: 0, porCategoria: {}, detalhes: [] };
    }
  }

  /**
   * Coletar dados de CATs
   */
  private async getCATsData(municipioNome: string, municipioUf: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('cat_locations')
        .select(`
          *,
          cat_checkins(count)
        `)
        .ilike('city', `%${municipioNome}%`)
        .eq('state', municipioUf);

      if (error) throw error;

      const cats = data || [];
      const totalCheckins = cats.reduce((sum, cat) => {
        return sum + (cat.cat_checkins?.[0]?.count || 0);
      }, 0);

      return {
        total: cats.length,
        ativos: cats.filter(cat => cat.is_active).length,
        totalCheckins: totalCheckins,
        detalhes: cats.map(cat => ({
          nome: cat.name,
          endereco: cat.address,
          ativo: cat.is_active,
          checkins: cat.cat_checkins?.[0]?.count || 0
        }))
      };
    } catch (error) {
      console.error('Erro ao coletar dados de CATs:', error);
      return { total: 0, ativos: 0, totalCheckins: 0, detalhes: [] };
    }
  }

  /**
   * Coletar dados de eventos
   */
  private async getEventosData(municipioNome: string, municipioUf: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .ilike('location', `%${municipioNome}%`)
        .gte('start_date', new Date().toISOString().split('T')[0])
        .order('start_date', { ascending: true });

      if (error) throw error;

      const eventos = data || [];
      const confirmados = eventos.filter(e => e.status === 'confirmed' || e.status === 'active');

      return {
        total: eventos.length,
        confirmados: confirmados.length,
        planejados: eventos.filter(e => e.status === 'planned').length,
        detalhes: eventos.map(e => ({
          nome: e.name,
          data: e.start_date,
          status: e.status,
          local: e.location
        }))
      };
    } catch (error) {
      console.error('Erro ao coletar dados de eventos:', error);
      return { total: 0, confirmados: 0, planejados: 0, detalhes: [] };
    }
  }

  /**
   * Coletar dados de analytics
   */
  private async getAnalyticsData(municipioNome: string, municipioUf: string): Promise<any> {
    try {
      // Buscar dados de check-ins recentes
      const { data: checkins, error: checkinsError } = await supabase
        .from('cat_checkins')
        .select(`
          *,
          cat_locations!inner(city, state)
        `)
        .ilike('cat_locations.city', `%${municipioNome}%`)
        .eq('cat_locations.state', municipioUf)
        .gte('checkin_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('checkin_date', { ascending: false });

      if (checkinsError) throw checkinsError;

      const totalCheckins = checkins?.length || 0;
      const checkinsPorDia = this.groupByDate(checkins || []);

      return {
        checkinsUltimos30Dias: totalCheckins,
        checkinsPorDia: checkinsPorDia,
        mediaDiaria: totalCheckins / 30
      };
    } catch (error) {
      console.error('Erro ao coletar dados de analytics:', error);
      return { checkinsUltimos30Dias: 0, checkinsPorDia: {}, mediaDiaria: 0 };
    }
  }

  /**
   * Agrupar atrações por categoria
   */
  private groupByCategory(atracoes: any[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    atracoes.forEach(acao => {
      const categoria = acao.category_id || 'outro';
      grouped[categoria] = (grouped[categoria] || 0) + 1;
    });
    return grouped;
  }

  /**
   * Agrupar check-ins por data
   */
  private groupByDate(checkins: any[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    checkins.forEach(checkin => {
      const date = checkin.checkin_date || checkin.created_at?.split('T')[0];
      if (date) {
        grouped[date] = (grouped[date] || 0) + 1;
      }
    });
    return grouped;
  }
}



