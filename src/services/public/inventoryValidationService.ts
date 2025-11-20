/**
 * Inventory Validation Service
 * Serviço para validação inteligente de inventário turístico
 */

import { TourismAttraction } from './inventoryService';
import { googlePlacesService } from '@/services/integrations/googlePlacesService';
import { supabase } from '@/integrations/supabase/client';

export interface AddressValidation {
  isValid: boolean;
  formattedAddress?: string;
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  suggestions?: string[];
  confidence: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
}

export interface DuplicateCheck {
  hasDuplicates: boolean;
  duplicates: Array<{
    id: string;
    name: string;
    similarity: number;
    reason: string;
  }>;
}

export interface CompletenessReport {
  score: number; // 0-100
  missingFields: string[];
  recommendedFields: string[];
  filledFields: number;
  totalFields: number;
}

export class InventoryValidationService {
  /**
   * Validar endereço com Google Places
   */
  async validateAddress(address: string): Promise<AddressValidation> {
    try {
      if (!address || address.trim().length === 0) {
        return {
          isValid: false,
          confidence: 0,
        };
      }

      return await googlePlacesService.validateAddress(address);
    } catch (error) {
      console.error('Erro ao validar endereço:', error);
      return {
        isValid: false,
        confidence: 0,
      };
    }
  }

  /**
   * Validar CNPJ/CPF
   */
  async validateRegistrationNumber(number: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    if (!number || number.trim().length === 0) {
      return {
        isValid: false,
        errors: ['Número de registro não informado'],
        warnings: [],
        score: 0,
      };
    }

    // Remove caracteres não numéricos
    const digits = number.replace(/\D/g, '');

    // Validar formato
    if (digits.length === 11) {
      // CPF
      if (!this.isValidCPF(digits)) {
        errors.push('CPF inválido');
        score -= 50;
      }
    } else if (digits.length === 14) {
      // CNPJ
      if (!this.isValidCNPJ(digits)) {
        errors.push('CNPJ inválido');
        score -= 50;
      }
    } else {
      errors.push('Número de registro deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)');
      score -= 50;
    }

    // Validar formato com máscara
    if (!/^(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{3}\.\d{3}\.\d{3}-\d{2})$/.test(number) && digits.length > 0) {
      warnings.push('Formato recomendado: CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00)');
      score -= 10;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score),
    };
  }

  /**
   * Detectar duplicatas
   */
  async checkDuplicates(inventory: TourismAttraction): Promise<DuplicateCheck> {
    try {
      const duplicates: DuplicateCheck['duplicates'] = [];

      // Buscar inventários similares
      const { data: existing } = await supabase
        .from('tourism_inventory')
        .select('id, name, address, latitude, longitude')
        .neq('id', inventory.id || '');

      if (!existing) {
        return {
          hasDuplicates: false,
          duplicates: [],
        };
      }

      for (const item of existing) {
        let similarity = 0;
        const reasons: string[] = [];

        // Comparar nome (similaridade de texto)
        const nameSimilarity = this.calculateStringSimilarity(
          (inventory.name || '').toLowerCase(),
          (item.name || '').toLowerCase()
        );
        if (nameSimilarity > 0.8) {
          similarity += nameSimilarity * 50;
          reasons.push(`Nome similar (${Math.round(nameSimilarity * 100)}%)`);
        }

        // Comparar endereço
        if (inventory.address && item.address) {
          const addressSimilarity = this.calculateStringSimilarity(
            inventory.address.toLowerCase(),
            item.address.toLowerCase()
          );
          if (addressSimilarity > 0.7) {
            similarity += addressSimilarity * 30;
            reasons.push(`Endereço similar (${Math.round(addressSimilarity * 100)}%)`);
          }
        }

        // Comparar coordenadas (distância < 100m)
        if (
          inventory.latitude &&
          inventory.longitude &&
          item.latitude &&
          item.longitude
        ) {
          const distance = this.calculateDistance(
            Number(inventory.latitude),
            Number(inventory.longitude),
            Number(item.latitude),
            Number(item.longitude)
          );
          if (distance < 0.1) {
            // 100 metros
            similarity += 20;
            reasons.push(`Localização muito próxima (${Math.round(distance * 1000)}m)`);
          }
        }

        if (similarity > 50) {
          duplicates.push({
            id: item.id,
            name: item.name,
            similarity: Math.min(100, similarity),
            reason: reasons.join(', '),
          });
        }
      }

      // Ordenar por similaridade
      duplicates.sort((a, b) => b.similarity - a.similarity);

      return {
        hasDuplicates: duplicates.length > 0,
        duplicates: duplicates.slice(0, 5), // Top 5
      };
    } catch (error) {
      console.error('Erro ao verificar duplicatas:', error);
      return {
        hasDuplicates: false,
        duplicates: [],
      };
    }
  }

  /**
   * Validar completude
   */
  async validateCompleteness(inventory: TourismAttraction): Promise<CompletenessReport> {
    const requiredFields = [
      'name',
      'description',
      'address',
      'city',
      'state',
      'category_id',
      'phone',
      'email',
    ];

    const recommendedFields = [
      'legal_name',
      'registration_number',
      'license_number',
      'responsible_name',
      'responsible_cpf',
      'responsible_email',
      'responsible_phone',
      'opening_hours',
      'price_range',
      'capacity',
      'latitude',
      'longitude',
      'website',
      'images',
      'accessibility_features',
      'payment_methods',
      'languages_spoken',
      'certifications',
    ];

    const missingFields: string[] = [];
    const recommendedMissing: string[] = [];
    let filledFields = 0;
    const totalFields = requiredFields.length + recommendedFields.length;

    // Verificar campos obrigatórios
    for (const field of requiredFields) {
      const value = (inventory as any)[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(field);
      } else {
        filledFields++;
      }
    }

    // Verificar campos recomendados
    for (const field of recommendedFields) {
      const value = (inventory as any)[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
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
   * Validar CPF
   */
  private isValidCPF(cpf: string): boolean {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  /**
   * Validar CNPJ
   */
  private isValidCNPJ(cnpj: string): boolean {
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
      return false;
    }

    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    const digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
  }

  /**
   * Calcular similaridade entre strings (Levenshtein)
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

  /**
   * Calcular distância entre coordenadas (Haversine)
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
}

export const inventoryValidationService = new InventoryValidationService();

