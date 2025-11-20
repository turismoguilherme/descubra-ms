/**
 * SeTur Validation Service
 * Serviço para validação e geração de códigos conforme padrão SeTur
 * (Sistema de Estatísticas de Turismo - Ministério do Turismo)
 */

import { supabase } from '@/integrations/supabase/client';
import { TourismAttraction } from './inventoryService';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
}

export interface SeTurCodeParts {
  uf: string; // Unidade Federativa (MS, SP, etc)
  category: string; // Categoria (NAT, CUL, GAS, HOS, etc)
  sequence: number; // Sequencial
}

export class SeTurValidationService {
  // Mapeamento de categorias para códigos SeTur
  private readonly categoryCodes: Record<string, string> = {
    'natural': 'NAT', // Atrativos Naturais
    'cultural': 'CUL', // Atrativos Culturais
    'gastronomic': 'GAS', // Gastronomia
    'adventure': 'AVT', // Aventura
    'religious': 'REL', // Religioso
    'entertainment': 'ENT', // Entretenimento
    'hospedagem': 'HOS', // Hospedagem
    'servicos': 'SER', // Serviços
    'comercio': 'COM', // Comércio
  };

  // Campos obrigatórios do padrão SeTur
  private readonly requiredFields = [
    'name',
    'description',
    'address',
    'city',
    'state',
    'category_id',
    'phone',
    'email',
  ];

  // Campos recomendados (afetam score)
  private readonly recommendedFields = [
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
    'accessibility_features',
    'payment_methods',
    'languages_spoken',
    'certifications',
  ];

  /**
   * Gerar código SeTur único no formato SETUR-{UF}-{CAT}-{SEQ}
   */
  async generateSeTurCode(inventory: TourismAttraction): Promise<string> {
    try {
      // Obter UF do estado (padrão MS se não especificado)
      const uf = (inventory.state || 'MS').toUpperCase().substring(0, 2);
      
      // Obter código da categoria
      const categoryCode = await this.getCategoryCode(inventory);
      
      // Obter próximo sequencial para esta combinação UF-CAT
      const sequence = await this.getNextSequence(uf, categoryCode);
      
      // Formatar sequencial com 4 dígitos
      const seqStr = sequence.toString().padStart(4, '0');
      
      return `SETUR-${uf}-${categoryCode}-${seqStr}`;
    } catch (error) {
      console.error('Erro ao gerar código SeTur:', error);
      throw error;
    }
  }

  /**
   * Obter código da categoria SeTur
   */
  private async getCategoryCode(inventory: TourismAttraction): Promise<string> {
    // Se já tiver setur_category_code, usar ele
    if ((inventory as any).setur_category_code) {
      return (inventory as any).setur_category_code;
    }

    // Buscar categoria no banco
    if (inventory.category_id) {
      const { data: category } = await supabase
        .from('inventory_categories')
        .select('name')
        .eq('id', inventory.category_id)
        .single();

      if (category) {
        // Mapear nome da categoria para código
        const categoryName = category.name.toLowerCase();
        for (const [key, code] of Object.entries(this.categoryCodes)) {
          if (categoryName.includes(key)) {
            return code;
          }
        }
      }
    }

    // Fallback: usar categoria genérica
    return 'GEN';
  }

  /**
   * Obter próximo sequencial para UF-CAT
   */
  private async getNextSequence(uf: string, categoryCode: string): Promise<number> {
    try {
      // Buscar último código com este prefixo
      const prefix = `SETUR-${uf}-${categoryCode}-`;
      
      const { data: existing } = await supabase
        .from('tourism_inventory')
        .select('setur_code')
        .like('setur_code', `${prefix}%`)
        .order('setur_code', { ascending: false })
        .limit(1);

      if (!existing || existing.length === 0) {
        return 1;
      }

      // Extrair sequencial do último código
      const lastCode = existing[0].setur_code;
      const lastSeq = parseInt(lastCode.split('-')[3] || '0', 10);
      
      return lastSeq + 1;
    } catch (error) {
      console.error('Erro ao obter sequencial:', error);
      return 1;
    }
  }

  /**
   * Validar conformidade com padrão SeTur
   */
  async validateSeTurCompliance(inventory: TourismAttraction): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Validar campos obrigatórios
    for (const field of this.requiredFields) {
      const value = (inventory as any)[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push(`Campo obrigatório ausente: ${field}`);
        score -= 10;
      }
    }

    // Validar formato de email
    if (inventory.email && !this.isValidEmail(inventory.email)) {
      errors.push('Email inválido');
      score -= 5;
    }

    // Validar formato de telefone
    if (inventory.phone && !this.isValidPhone(inventory.phone)) {
      warnings.push('Formato de telefone pode estar incorreto');
      score -= 2;
    }

    // Validar coordenadas GPS
    if (inventory.latitude && inventory.longitude) {
      if (
        inventory.latitude < -90 || inventory.latitude > 90 ||
        inventory.longitude < -180 || inventory.longitude > 180
      ) {
        errors.push('Coordenadas GPS inválidas');
        score -= 10;
      }
    } else {
      warnings.push('Coordenadas GPS não informadas');
      score -= 5;
    }

    // Validar campos recomendados
    for (const field of this.recommendedFields) {
      const value = (inventory as any)[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        warnings.push(`Campo recomendado ausente: ${field}`);
        score -= 1;
      }
    }

    // Validar CNPJ/CPF se informado
    if ((inventory as any).registration_number) {
      if (!this.isValidCNPJOrCPF((inventory as any).registration_number)) {
        errors.push('CNPJ/CPF inválido');
        score -= 5;
      }
    }

    // Garantir que score não seja negativo
    score = Math.max(0, score);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score,
    };
  }

  /**
   * Calcular score de completude dos dados (0-100)
   */
  async calculateCompletenessScore(inventory: TourismAttraction): Promise<number> {
    let totalFields = 0;
    let filledFields = 0;

    // Campos básicos
    const basicFields = ['name', 'description', 'address', 'city', 'state', 'phone', 'email'];
    totalFields += basicFields.length;
    for (const field of basicFields) {
      const value = (inventory as any)[field];
      if (value && (typeof value !== 'string' || value.trim() !== '')) {
        filledFields++;
      }
    }

    // Campos de localização
    const locationFields = ['latitude', 'longitude', 'postal_code'];
    totalFields += locationFields.length;
    for (const field of locationFields) {
      const value = (inventory as any)[field];
      if (value) {
        filledFields++;
      }
    }

    // Campos de negócio
    const businessFields = ['opening_hours', 'price_range', 'capacity', 'website'];
    totalFields += businessFields.length;
    for (const field of businessFields) {
      const value = (inventory as any)[field];
      if (value) {
        filledFields++;
      }
    }

    // Campos SeTur
    const seturFields = [
      'legal_name',
      'registration_number',
      'license_number',
      'responsible_name',
      'responsible_cpf',
      'responsible_email',
      'responsible_phone',
      'accessibility_features',
      'capacity_details',
      'payment_methods',
      'languages_spoken',
      'certifications',
    ];
    totalFields += seturFields.length;
    for (const field of seturFields) {
      const value = (inventory as any)[field];
      if (value && (typeof value !== 'string' || value.trim() !== '')) {
        filledFields++;
      }
    }

    // Calcular porcentagem
    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  }

  /**
   * Calcular score de conformidade SeTur (0-100)
   */
  async calculateComplianceScore(inventory: TourismAttraction): Promise<number> {
    const validation = await this.validateSeTurCompliance(inventory);
    return validation.score;
  }

  /**
   * Validar email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar telefone (formato brasileiro básico)
   */
  private isValidPhone(phone: string): boolean {
    // Remove caracteres não numéricos
    const digits = phone.replace(/\D/g, '');
    // Telefone brasileiro tem 10 ou 11 dígitos
    return digits.length >= 10 && digits.length <= 11;
  }

  /**
   * Validar CNPJ ou CPF
   */
  private isValidCNPJOrCPF(value: string): boolean {
    // Remove caracteres não numéricos
    const digits = value.replace(/\D/g, '');
    
    // CPF tem 11 dígitos, CNPJ tem 14
    if (digits.length === 11) {
      return this.isValidCPF(digits);
    } else if (digits.length === 14) {
      return this.isValidCNPJ(digits);
    }
    
    return false;
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
}

export const seturValidationService = new SeTurValidationService();

