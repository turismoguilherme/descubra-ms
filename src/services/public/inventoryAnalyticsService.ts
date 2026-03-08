// @ts-nocheck
/**
 * Inventory Analytics Service
 * SEGURANÇA: Usa callGeminiProxy (Edge Function) em vez de API key direta
 */

import { supabase } from '@/integrations/supabase/client';
import { TourismAttraction } from './inventoryService';
import { callGeminiProxy } from '../ai/geminiProxy';

export interface CompletenessAnalysis {
  overallScore: number;
  byCategory: Record<string, { score: number; total: number; complete: number; incomplete: number }>;
  recommendations: string[];
}

export interface Improvement {
  field: string;
  currentValue: any;
  suggestedValue: any;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface BenchmarkComparison {
  metric: string;
  currentValue: number;
  averageValue: number;
  benchmarkValue: number;
  difference: number;
  status: 'above' | 'below' | 'equal';
}

export interface OutdatedAlert {
  inventoryId: string;
  name: string;
  lastUpdated: string;
  daysSinceUpdate: number;
  recommendedAction: string;
}

export class InventoryAnalyticsService {
  async analyzeCompleteness(municipalityId?: string): Promise<CompletenessAnalysis> {
    try {
      let query = supabase.from('tourism_inventory').select('*');
      const { data: inventory, error } = await query;
      if (error) throw error;

      const items = (inventory || []) as TourismAttraction[];
      const byCategory: Record<string, any> = {};
      let totalScore = 0;
      let totalItems = 0;

      for (const item of items) {
        const category = item.category_id || 'outros';
        if (!byCategory[category]) byCategory[category] = { score: 0, total: 0, complete: 0, incomplete: 0 };
        const completenessScore = (item as any).data_completeness_score || 0;
        byCategory[category].score += completenessScore;
        byCategory[category].total += 1;
        if (completenessScore >= 80) byCategory[category].complete += 1;
        else byCategory[category].incomplete += 1;
        totalScore += completenessScore;
        totalItems += 1;
      }

      for (const category in byCategory) {
        if (byCategory[category].total > 0) {
          byCategory[category].score = Math.round(byCategory[category].score / byCategory[category].total);
        }
      }

      const overallScore = totalItems > 0 ? Math.round(totalScore / totalItems) : 0;
      return { overallScore, byCategory, recommendations: this.generateCompletenessRecommendations(byCategory, overallScore) };
    } catch (error) {
      console.error('Erro ao analisar completude:', error);
      throw error;
    }
  }

  async suggestImprovements(inventory: TourismAttraction): Promise<Improvement[]> {
    try {
      const prompt = `
Analise o atrativo turístico e sugira melhorias:
Nome: ${inventory.name}, Descrição: ${inventory.description || 'Não informado'}, Endereço: ${inventory.address || 'Não informado'}
Forneça JSON: { "improvements": [{ "field": "...", "currentValue": "...", "suggestedValue": "...", "reason": "...", "priority": "high|medium|low" }] }
`;
      const result = await callGeminiProxy(prompt, { temperature: 0.7, maxOutputTokens: 1500 });
      if (result.ok && result.text) {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed.improvements)) return parsed.improvements;
        }
      }
      return this.getBasicImprovements(inventory);
    } catch (error) {
      console.error('Erro ao sugerir melhorias:', error);
      return this.getBasicImprovements(inventory);
    }
  }

  async compareWithBenchmarks(municipalityId?: string): Promise<BenchmarkComparison[]> {
    try {
      const { data: inventory } = await supabase.from('tourism_inventory').select('*');
      const items = (inventory || []) as TourismAttraction[];
      const totalItems = items.length;
      const averageCompleteness = items.reduce((sum, item) => sum + ((item as any).data_completeness_score || 0), 0) / (totalItems || 1);
      const averageCompliance = items.reduce((sum, item) => sum + ((item as any).setur_compliance_score || 0), 0) / (totalItems || 1);

      return [
        { metric: 'Total de Itens', currentValue: totalItems, averageValue: 100, benchmarkValue: 150, difference: totalItems - 150, status: totalItems >= 150 ? 'above' : 'below' },
        { metric: 'Completude Média', currentValue: Math.round(averageCompleteness), averageValue: 70, benchmarkValue: 85, difference: Math.round(averageCompleteness - 85), status: averageCompleteness >= 85 ? 'above' : averageCompleteness >= 70 ? 'equal' : 'below' },
        { metric: 'Conformidade SeTur', currentValue: Math.round(averageCompliance), averageValue: 75, benchmarkValue: 90, difference: Math.round(averageCompliance - 90), status: averageCompliance >= 90 ? 'above' : averageCompliance >= 75 ? 'equal' : 'below' },
      ];
    } catch (error) {
      console.error('Erro ao comparar com benchmarks:', error);
      return [];
    }
  }

  async checkOutdatedData(municipalityId?: string): Promise<OutdatedAlert[]> {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const { data: outdated, error } = await supabase.from('tourism_inventory').select('id, name, updated_at, last_verified_date').lt('updated_at', oneYearAgo.toISOString()).order('updated_at', { ascending: true });
      if (error) throw error;

      return (outdated || []).map((item: any) => {
        const daysSinceUpdate = Math.floor((Date.now() - new Date(item.updated_at).getTime()) / (1000 * 60 * 60 * 24));
        return { inventoryId: item.id, name: item.name, lastUpdated: item.updated_at, daysSinceUpdate, recommendedAction: daysSinceUpdate > 365 ? 'Atualizar dados urgentemente' : 'Revisar e atualizar dados' };
      });
    } catch (error) {
      console.error('Erro ao verificar dados desatualizados:', error);
      return [];
    }
  }

  private generateCompletenessRecommendations(byCategory: Record<string, any>, overallScore: number): string[] {
    const recommendations: string[] = [];
    if (overallScore < 70) recommendations.push('Score geral de completude abaixo de 70%. Priorize preencher campos obrigatórios.');
    for (const [category, data] of Object.entries(byCategory)) {
      if (data.score < 70) recommendations.push(`Categoria "${category}" com completude baixa (${data.score}%).`);
    }
    if (recommendations.length === 0) recommendations.push('Parabéns! O inventário está bem completo.');
    return recommendations;
  }

  private getBasicImprovements(inventory: TourismAttraction): Improvement[] {
    const improvements: Improvement[] = [];
    if (!inventory.description || inventory.description.trim().length < 50) {
      improvements.push({ field: 'description', currentValue: inventory.description || 'Não informado', suggestedValue: 'Adicione uma descrição detalhada', reason: 'Descrição muito curta', priority: 'high' });
    }
    if (!inventory.phone && !inventory.email) {
      improvements.push({ field: 'contact', currentValue: 'Não informado', suggestedValue: 'Adicione telefone ou email', reason: 'Informações de contato são essenciais', priority: 'high' });
    }
    return improvements;
  }
}

export const inventoryAnalyticsService = new InventoryAnalyticsService();
