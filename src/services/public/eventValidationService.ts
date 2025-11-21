/**
 * Event Validation Service
 * Serviço para validação de eventos turísticos
 */

import { supabase } from '@/integrations/supabase/client';

export interface ConflictCheck {
  hasConflicts: boolean;
  conflicts: Array<{
    eventId: string;
    eventName: string;
    conflictReason: string;
    startDate: string;
    endDate: string;
  }>;
}

export interface DuplicateEvent {
  id: string;
  name: string;
  similarity: number;
  reason: string;
}

export interface CompletenessReport {
  score: number; // 0-100
  missingFields: string[];
  recommendedFields: string[];
  filledFields: number;
  totalFields: number;
}

export class EventValidationService {
  /**
   * Verificar conflitos de data/hora no mesmo local
   */
  async checkConflicts(event: any): Promise<ConflictCheck> {
    try {
      if (!event.data_inicio || !event.local) {
        return {
          hasConflicts: false,
          conflicts: [],
        };
      }

      const eventStart = new Date(event.data_inicio);
      const eventEnd = event.data_fim ? new Date(event.data_fim) : eventStart;

      // Buscar eventos no mesmo local com datas sobrepostas
      const { data: conflictingEvents, error } = await supabase
        .from('events')
        .select('id, titulo, data_inicio, data_fim, local')
        .eq('local', event.local)
        .neq('id', event.id || '')
        .gte('data_fim', eventStart.toISOString())
        .lte('data_inicio', eventEnd.toISOString());

      if (error) throw error;

      const conflicts = (conflictingEvents || []).map((conflict: any) => ({
        eventId: conflict.id,
        eventName: conflict.titulo || conflict.name || '',
        conflictReason: `Conflito de data/hora no mesmo local`,
        startDate: conflict.data_inicio,
        endDate: conflict.data_fim || conflict.data_inicio,
      }));

      return {
        hasConflicts: conflicts.length > 0,
        conflicts,
      };
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error);
      return {
        hasConflicts: false,
        conflicts: [],
      };
    }
  }

  /**
   * Detectar eventos duplicados
   */
  async detectDuplicates(event: any): Promise<DuplicateEvent[]> {
    try {
      const { data: existingEvents } = await supabase
        .from('events')
        .select('id, titulo, descricao, data_inicio, local')
        .neq('id', event.id || '');

      if (!existingEvents) return [];

      const duplicates: DuplicateEvent[] = [];

      for (const existing of existingEvents) {
        let similarity = 0;
        const reasons: string[] = [];

        // Comparar título
        const titleSimilarity = this.calculateStringSimilarity(
          (event.titulo || event.name || '').toLowerCase(),
          (existing.titulo || existing.name || '').toLowerCase()
        );
        if (titleSimilarity > 0.8) {
          similarity += titleSimilarity * 60;
          reasons.push(`Título muito similar (${Math.round(titleSimilarity * 100)}%)`);
        }

        // Comparar local e data (mesmo dia)
        if (event.local && existing.local && event.data_inicio && existing.data_inicio) {
          const locationMatch = event.local.toLowerCase() === existing.local.toLowerCase();
          const eventDate = new Date(event.data_inicio).toDateString();
          const existingDate = new Date(existing.data_inicio).toDateString();
          const dateMatch = eventDate === existingDate;

          if (locationMatch && dateMatch) {
            similarity += 40;
            reasons.push('Mesmo local e data');
          } else if (locationMatch) {
            similarity += 20;
            reasons.push('Mesmo local');
          } else if (dateMatch) {
            similarity += 20;
            reasons.push('Mesma data');
          }
        }

        if (similarity > 70) {
          duplicates.push({
            id: existing.id,
            name: existing.titulo || existing.name || '',
            similarity: Math.min(100, similarity),
            reason: reasons.join(', '),
          });
        }
      }

      return duplicates.sort((a, b) => b.similarity - a.similarity);
    } catch (error) {
      console.error('Erro ao detectar duplicatas:', error);
      return [];
    }
  }

  /**
   * Validar formato de data/hora
   */
  validateDateTimeFormat(dateTime: string): { isValid: boolean; error?: string } {
    if (!dateTime) {
      return { isValid: false, error: 'Data/hora não fornecida' };
    }

    const date = new Date(dateTime);
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Formato de data/hora inválido' };
    }

    // Verificar se a data não é muito antiga (mais de 10 anos atrás)
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    if (date < tenYearsAgo) {
      return { isValid: false, error: 'Data muito antiga (mais de 10 anos)' };
    }

    // Verificar se a data não é muito futura (mais de 5 anos no futuro)
    const fiveYearsFromNow = new Date();
    fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5);
    if (date > fiveYearsFromNow) {
      return { isValid: false, error: 'Data muito futura (mais de 5 anos)' };
    }

    return { isValid: true };
  }

  /**
   * Validar completude
   */
  async validateCompleteness(event: any): Promise<CompletenessReport> {
    const requiredFields = [
      'titulo',
      'descricao',
      'data_inicio',
      'local',
    ];

    const recommendedFields = [
      'data_fim',
      'categoria',
      'site_oficial',
      'imagem_principal',
      'expected_audience',
      'budget',
      'contact_phone',
      'contact_email',
      'contact_website',
      'features',
    ];

    const missingFields: string[] = [];
    const recommendedMissing: string[] = [];
    let filledFields = 0;
    const totalFields = requiredFields.length + recommendedFields.length;

    // Verificar campos obrigatórios
    for (const field of requiredFields) {
      const value = event[field] || event[field.replace('titulo', 'name')];
      
      // Validação especial para data_inicio
      if (field === 'data_inicio') {
        const dateValue = event.data_inicio || event.start_date || event.date;
        if (!dateValue) {
          missingFields.push(field);
        } else {
          const dateValidation = this.validateDateTimeFormat(dateValue);
          if (!dateValidation.isValid) {
            missingFields.push(field);
          } else {
            filledFields++;
          }
        }
      } else if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(field);
      } else {
        filledFields++;
      }
    }

    // Verificar campos recomendados
    for (const field of recommendedFields) {
      const value = event[field];
      
      // Validação especial para data_fim
      if (field === 'data_fim') {
        const endDate = event.data_fim || event.end_date || event.endDate;
        if (endDate) {
          const dateValidation = this.validateDateTimeFormat(endDate);
          if (dateValidation.isValid) {
            // Verificar se data_fim é posterior a data_inicio
            const startDate = event.data_inicio || event.start_date || event.date;
            if (startDate && new Date(endDate) < new Date(startDate)) {
              recommendedMissing.push(field); // Data fim antes da data início
            } else {
              filledFields++;
            }
          } else {
            recommendedMissing.push(field);
          }
        } else {
          recommendedMissing.push(field);
        }
      } else if (!value || (typeof value === 'string' && value.trim() === '')) {
        recommendedMissing.push(field);
      } else {
        filledFields++;
      }
    }

    // Calcular score
    const score = Math.round((filledFields / totalFields) * 100);

    return {
      score,
      missingFields,
      recommendedFields: recommendedMissing,
      filledFields,
      totalFields,
    };
  }

  /**
   * Calcular similaridade entre strings
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Distância de Levenshtein
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}

export const eventValidationService = new EventValidationService();

