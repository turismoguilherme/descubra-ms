/**
 * Inventory Analytics Service
 * Serviço para análise e insights do inventário turístico
 */

import { supabase } from '@/integrations/supabase/client';
import { TourismAttraction } from './inventoryService';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface CompletenessAnalysis {
  overallScore: number;
  byCategory: Record<string, {
    score: number;
    total: number;
    complete: number;
    incomplete: number;
  }>;
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
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
  }

  /**
   * Analisar completude por categoria
   */
  async analyzeCompleteness(municipalityId?: string): Promise<CompletenessAnalysis> {
    try {
      // Buscar inventário
      let query = supabase
        .from('tourism_inventory')
        .select('*');

      if (municipalityId) {
        // TODO: Filtrar por município quando campo disponível
      }

      const { data: inventory, error } = await query;

      if (error) throw error;

      const items = (inventory || []) as TourismAttraction[];

      // Calcular completude por categoria
      const byCategory: Record<string, any> = {};
      let totalScore = 0;
      let totalItems = 0;

      for (const item of items) {
        const category = item.category_id || 'outros';
        
        if (!byCategory[category]) {
          byCategory[category] = {
            score: 0,
            total: 0,
            complete: 0,
            incomplete: 0,
          };
        }

        const completenessScore = (item as any).data_completeness_score || 0;
        byCategory[category].score += completenessScore;
        byCategory[category].total += 1;
        
        if (completenessScore >= 80) {
          byCategory[category].complete += 1;
        } else {
          byCategory[category].incomplete += 1;
        }

        totalScore += completenessScore;
        totalItems += 1;
      }

      // Calcular média por categoria
      for (const category in byCategory) {
        if (byCategory[category].total > 0) {
          byCategory[category].score = Math.round(byCategory[category].score / byCategory[category].total);
        }
      }

      const overallScore = totalItems > 0 ? Math.round(totalScore / totalItems) : 0;

      // Gerar recomendações
      const recommendations = this.generateCompletenessRecommendations(byCategory, overallScore);

      return {
        overallScore,
        byCategory,
        recommendations,
      };
    } catch (error) {
      console.error('Erro ao analisar completude:', error);
      throw error;
    }
  }

  /**
   * Sugerir melhorias com IA
   */
  async suggestImprovements(inventory: TourismAttraction): Promise<Improvement[]> {
    try {
      if (!this.genAI) {
        return this.getBasicImprovements(inventory);
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
Analise o seguinte atrativo turístico e sugira melhorias específicas:

Nome: ${inventory.name}
Descrição: ${inventory.description || 'Não informado'}
Endereço: ${inventory.address || 'Não informado'}
Categoria: ${inventory.category_id || 'Não informado'}
Telefone: ${inventory.phone || 'Não informado'}
Email: ${inventory.email || 'Não informado'}
Website: ${inventory.website || 'Não informado'}
Horário: ${(inventory as any).opening_hours || 'Não informado'}

Forneça uma resposta em JSON com melhorias:
{
  "improvements": [
    {
      "field": "nome_do_campo",
      "currentValue": "valor atual ou null",
      "suggestedValue": "valor sugerido",
      "reason": "razão da sugestão",
      "priority": "high|medium|low"
    }
  ]
}

Seja específico e acionável. Priorize campos obrigatórios faltando.
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.improvements)) {
          return parsed.improvements;
        }
      }

      return this.getBasicImprovements(inventory);
    } catch (error) {
      console.error('Erro ao sugerir melhorias:', error);
      return this.getBasicImprovements(inventory);
    }
  }

  /**
   * Comparar com benchmarks
   */
  async compareWithBenchmarks(municipalityId?: string): Promise<BenchmarkComparison[]> {
    try {
      // Buscar dados do município
      const { data: inventory } = await supabase
        .from('tourism_inventory')
        .select('*');

      const items = (inventory || []) as TourismAttraction[];

      // Calcular métricas atuais
      const totalItems = items.length;
      const averageCompleteness = items.reduce((sum, item) => {
        return sum + ((item as any).data_completeness_score || 0);
      }, 0) / (totalItems || 1);

      const averageCompliance = items.reduce((sum, item) => {
        return sum + ((item as any).setur_compliance_score || 0);
      }, 0) / (totalItems || 1);

      // Benchmarks (valores de referência)
      const benchmarks: BenchmarkComparison[] = [
        {
          metric: 'Total de Itens',
          currentValue: totalItems,
          averageValue: 100, // Média de outras cidades
          benchmarkValue: 150, // Benchmark ideal
          difference: totalItems - 150,
          status: totalItems >= 150 ? 'above' : 'below',
        },
        {
          metric: 'Completude Média',
          currentValue: Math.round(averageCompleteness),
          averageValue: 70, // Média de outras cidades
          benchmarkValue: 85, // Benchmark ideal
          difference: Math.round(averageCompleteness - 85),
          status: averageCompleteness >= 85 ? 'above' : averageCompleteness >= 70 ? 'equal' : 'below',
        },
        {
          metric: 'Conformidade SeTur',
          currentValue: Math.round(averageCompliance),
          averageValue: 75, // Média de outras cidades
          benchmarkValue: 90, // Benchmark ideal
          difference: Math.round(averageCompliance - 90),
          status: averageCompliance >= 90 ? 'above' : averageCompliance >= 75 ? 'equal' : 'below',
        },
      ];

      return benchmarks;
    } catch (error) {
      console.error('Erro ao comparar com benchmarks:', error);
      return [];
    }
  }

  /**
   * Verificar dados desatualizados
   */
  async checkOutdatedData(municipalityId?: string): Promise<OutdatedAlert[]> {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      let query = supabase
        .from('tourism_inventory')
        .select('id, name, updated_at, last_verified_date')
        .lt('updated_at', oneYearAgo.toISOString())
        .order('updated_at', { ascending: true });

      const { data: outdated, error } = await query;

      if (error) throw error;

      const alerts: OutdatedAlert[] = (outdated || []).map((item: any) => {
        const lastUpdate = new Date(item.updated_at);
        const daysSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

        return {
          inventoryId: item.id,
          name: item.name,
          lastUpdated: item.updated_at,
          daysSinceUpdate,
          recommendedAction: daysSinceUpdate > 365 
            ? 'Atualizar dados urgentemente' 
            : 'Revisar e atualizar dados',
        };
      });

      return alerts;
    } catch (error) {
      console.error('Erro ao verificar dados desatualizados:', error);
      return [];
    }
  }

  /**
   * Gerar recomendações básicas de completude
   */
  private generateCompletenessRecommendations(
    byCategory: Record<string, any>,
    overallScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (overallScore < 70) {
      recommendations.push('Score geral de completude abaixo de 70%. Priorize preencher campos obrigatórios.');
    }

    for (const [category, data] of Object.entries(byCategory)) {
      if (data.score < 70) {
        recommendations.push(`Categoria "${category}" com completude baixa (${data.score}%). Revise ${data.incomplete} item(ns) incompleto(s).`);
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Parabéns! O inventário está bem completo. Continue mantendo os dados atualizados.');
    }

    return recommendations;
  }

  /**
   * Melhorias básicas (fallback)
   */
  private getBasicImprovements(inventory: TourismAttraction): Improvement[] {
    const improvements: Improvement[] = [];

    if (!inventory.description || inventory.description.trim().length < 50) {
      improvements.push({
        field: 'description',
        currentValue: inventory.description || 'Não informado',
        suggestedValue: 'Adicione uma descrição detalhada com pelo menos 50 caracteres',
        reason: 'Descrição muito curta ou ausente',
        priority: 'high',
      });
    }

    if (!inventory.phone && !inventory.email) {
      improvements.push({
        field: 'contact',
        currentValue: 'Não informado',
        suggestedValue: 'Adicione telefone ou email para contato',
        reason: 'Informações de contato são essenciais',
        priority: 'high',
      });
    }

    if (!inventory.latitude || !inventory.longitude) {
      improvements.push({
        field: 'coordinates',
        currentValue: 'Não informado',
        suggestedValue: 'Adicione coordenadas GPS para localização precisa',
        reason: 'Coordenadas facilitam a localização no mapa',
        priority: 'medium',
      });
    }

    if (!inventory.website) {
      improvements.push({
        field: 'website',
        currentValue: 'Não informado',
        suggestedValue: 'Adicione website se disponível',
        reason: 'Website aumenta a visibilidade',
        priority: 'low',
      });
    }

    return improvements;
  }
}

export const inventoryAnalyticsService = new InventoryAnalyticsService();

