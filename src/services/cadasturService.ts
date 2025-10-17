/**
 * CADASTUR Service
 * Sistema de verificação de registro no CADASTUR (Ministério do Turismo)
 * 
 * CADASTUR é obrigatório para:
 * - Meios de Hospedagem (hotéis, pousadas)
 * - Agências de Turismo
 * - Transportadoras Turísticas
 * - Organizadoras de Eventos
 * - Parques Temáticos
 * - Acampamentos Turísticos
 * - Guias de Turismo
 */

import { supabase } from '@/integrations/supabase/client';

export interface CadastURVerificationResult {
  isValid: boolean;
  status: 'active' | 'inactive' | 'pending' | 'not_found';
  companyName?: string;
  category?: string;
  registrationDate?: string;
  expirationDate?: string;
  message: string;
}

export interface BusinessCategory {
  id: string;
  name: string;
  requiresCadastUR: boolean;
  icon: string;
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  { id: 'hotel', name: 'Hotel/Pousada', requiresCadastUR: true, icon: 'Hotel' },
  { id: 'agency', name: 'Agência de Turismo', requiresCadastUR: true, icon: 'Plane' },
  { id: 'transport', name: 'Transportadora Turística', requiresCadastUR: true, icon: 'Bus' },
  { id: 'event', name: 'Organizadora de Eventos', requiresCadastUR: true, icon: 'Calendar' },
  { id: 'park', name: 'Parque Temático', requiresCadastUR: true, icon: 'TreePine' },
  { id: 'camping', name: 'Acampamento Turístico', requiresCadastUR: true, icon: 'Tent' },
  { id: 'guide', name: 'Guia de Turismo', requiresCadastUR: true, icon: 'Map' },
  { id: 'restaurant', name: 'Restaurante', requiresCadastUR: false, icon: 'UtensilsCrossed' },
  { id: 'attraction', name: 'Atração Turística', requiresCadastUR: false, icon: 'Star' },
  { id: 'other', name: 'Outro', requiresCadastUR: false, icon: 'MoreHorizontal' },
];

/**
 * Verifica se uma categoria requer CADASTUR
 */
export function requiresCadastUR(categoryId: string): boolean {
  const category = BUSINESS_CATEGORIES.find(c => c.id === categoryId);
  return category?.requiresCadastUR || false;
}

/**
 * Valida formato do número CADASTUR
 * Formato: XX.XXX.XXX/XXXX-XX (15 dígitos)
 */
export function validateCadastURFormat(cadastur: string): boolean {
  // Remove pontos, barras e traços
  const cleanCadastur = cadastur.replace(/[.\-/]/g, '');
  
  // Deve ter 15 dígitos
  if (cleanCadastur.length !== 15) {
    return false;
  }
  
  // Deve conter apenas números
  return /^\d+$/.test(cleanCadastur);
}

/**
 * Formata número CADASTUR
 * Exemplo: 12345678901234 → 12.345.678/9012-34
 */
export function formatCadastUR(cadastur: string): string {
  const clean = cadastur.replace(/[.\-/]/g, '');
  if (clean.length !== 15) return cadastur;
  
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12, 15)}`;
}

/**
 * Verifica CADASTUR no banco de dados local
 * (Em produção, isso consultaria a API oficial do MTur)
 */
async function verifyInLocalDatabase(cadastur: string, cnpj: string): Promise<CadastURVerificationResult> {
  try {
    const { data, error } = await supabase
      .from('cadastur_records')
      .select('*')
      .eq('cadastur_number', cadastur)
      .single();

    if (error || !data) {
      return {
        isValid: false,
        status: 'not_found',
        message: 'CADASTUR não encontrado em nossa base de dados.'
      };
    }

    // Verifica se CNPJ corresponde
    if (data.cnpj !== cnpj) {
      return {
        isValid: false,
        status: 'not_found',
        message: 'CADASTUR não corresponde ao CNPJ informado.'
      };
    }

    // Verifica se está ativo
    if (data.status !== 'active') {
      return {
        isValid: false,
        status: data.status,
        message: 'CADASTUR encontrado mas está inativo. Regularize junto ao MTur.'
      };
    }

    return {
      isValid: true,
      status: 'active',
      companyName: data.company_name,
      category: data.category,
      registrationDate: data.registration_date,
      expirationDate: data.expiration_date,
      message: 'CADASTUR válido e ativo!'
    };
  } catch (error) {
    console.error('Erro ao verificar CADASTUR local:', error);
    return {
      isValid: false,
      status: 'not_found',
      message: 'Erro ao verificar CADASTUR. Tente novamente.'
    };
  }
}

/**
 * Consulta API oficial do MTur (mockado por enquanto)
 * TODO: Integrar com API real quando disponível
 */
async function verifyWithMTurAPI(cadastur: string, cnpj: string): Promise<CadastURVerificationResult> {
  // MOCK - Simula consulta à API do MTur
  // Em produção, fazer requisição real à API oficial
  
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simula delay de rede
  
  // Para testes, aceita CADASTUR específicos
  const testCadasturs = [
    '12.345.678/9012-34',
    '98.765.432/1098-76',
    '11.111.111/1111-11',
  ];
  
  const cleanCadastur = cadastur.replace(/[.\-/]/g, '');
  const formattedCadastur = formatCadastUR(cleanCadastur);
  
  if (testCadasturs.includes(formattedCadastur)) {
    return {
      isValid: true,
      status: 'active',
      companyName: 'Empresa Turística Exemplo Ltda',
      category: 'Meio de Hospedagem',
      registrationDate: '2023-01-15',
      message: 'CADASTUR válido e ativo!'
    };
  }
  
  return {
    isValid: false,
    status: 'not_found',
    message: 'CADASTUR não encontrado na base do Ministério do Turismo. Verifique o número ou obtenha seu registro.'
  };
}

/**
 * Verifica CADASTUR (função principal)
 * Tenta primeiro API oficial, depois banco local
 */
export async function verifyCadastUR(
  cadastur: string,
  cnpj: string
): Promise<CadastURVerificationResult> {
  // Valida formato
  if (!validateCadastURFormat(cadastur)) {
    return {
      isValid: false,
      status: 'not_found',
      message: 'Formato de CADASTUR inválido. Deve conter 15 dígitos.'
    };
  }

  const formattedCadastur = formatCadastUR(cadastur);

  try {
    // Tenta API oficial primeiro
    const apiResult = await verifyWithMTurAPI(formattedCadastur, cnpj);
    
    if (apiResult.isValid) {
      // Salva no banco local para cache
      await cacheCadastURRecord(formattedCadastur, cnpj, apiResult);
      return apiResult;
    }
    
    // Se API não encontrou, tenta banco local
    const localResult = await verifyInLocalDatabase(formattedCadastur, cnpj);
    return localResult;
  } catch (error) {
    console.error('Erro na verificação CADASTUR:', error);
    return {
      isValid: false,
      status: 'not_found',
      message: 'Erro ao verificar CADASTUR. Verifique sua conexão e tente novamente.'
    };
  }
}

/**
 * Salva registro CADASTUR no cache local
 */
async function cacheCadastURRecord(
  cadastur: string,
  cnpj: string,
  result: CadastURVerificationResult
): Promise<void> {
  try {
    await supabase.from('cadastur_records').upsert({
      cadastur_number: cadastur,
      cnpj: cnpj,
      company_name: result.companyName,
      category: result.category,
      status: result.status,
      registration_date: result.registrationDate,
      expiration_date: result.expirationDate,
      verified_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao salvar cache CADASTUR:', error);
  }
}

/**
 * Salva CADASTUR verificado no perfil do usuário
 */
export async function saveCadastURToProfile(
  userId: string,
  cadasturData: CadastURVerificationResult
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        cadastur_number: cadasturData.companyName,
        cadastur_verified: true,
        cadastur_verified_at: new Date().toISOString(),
        cadastur_status: cadasturData.status,
      })
      .eq('id', userId);

    return !error;
  } catch (error) {
    console.error('Erro ao salvar CADASTUR no perfil:', error);
    return false;
  }
}

/**
 * Informações sobre como obter CADASTUR
 */
export const CADASTUR_INFO = {
  officialSite: 'https://cadastur.turismo.gov.br',
  requirements: [
    'CNPJ ativo e regular',
    'Inscrição Municipal (Alvará de Funcionamento)',
    'Documento de Identidade do responsável legal',
    'Comprovante de endereço da empresa',
    'Certidões negativas (Federal, Estadual, Municipal)',
  ],
  benefits: [
    'Acesso a linhas de crédito e financiamento do governo',
    'Participação em feiras e eventos oficiais do MTur',
    'Certificação oficial de qualidade',
    'Visibilidade nos canais do Ministério do Turismo',
    'Programas de capacitação e treinamento',
    'Regularização legal para operar no setor turístico',
  ],
  cost: 'Gratuito',
  time: '15-30 dias',
  support: {
    phone: '136 (Alô Turismo)',
    email: 'cadastur@turismo.gov.br',
    whatsapp: '+55 61 2023-8080',
  },
};

/**
 * Envia lembrete de regularização CADASTUR
 */
export async function sendCadastURReminder(userId: string, email: string): Promise<void> {
  // TODO: Integrar com serviço de email
  console.log(`Enviando lembrete CADASTUR para ${email}`);
  
  try {
    await supabase.from('cadastur_reminders').insert({
      user_id: userId,
      email: email,
      sent_at: new Date().toISOString(),
      reminder_type: 'pending_verification',
    });
  } catch (error) {
    console.error('Erro ao registrar lembrete:', error);
  }
}

/**
 * Verifica se usuário está no período de graça (60 dias sem CADASTUR)
 */
export async function checkGracePeriod(userId: string): Promise<{
  inGracePeriod: boolean;
  daysRemaining: number;
  expiresAt: Date | null;
}> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at, cadastur_verified, cadastur_grace_period_ends')
      .eq('id', userId)
      .single();

    if (!profile) {
      return { inGracePeriod: false, daysRemaining: 0, expiresAt: null };
    }

    // Se já verificado, não precisa período de graça
    if (profile.cadastur_verified) {
      return { inGracePeriod: false, daysRemaining: 0, expiresAt: null };
    }

    // Calcula período de graça (60 dias desde criação)
    const createdAt = new Date(profile.created_at);
    const gracePeriodEnd = new Date(createdAt);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 60);

    const now = new Date();
    const daysRemaining = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      inGracePeriod: daysRemaining > 0,
      daysRemaining: Math.max(0, daysRemaining),
      expiresAt: gracePeriodEnd,
    };
  } catch (error) {
    console.error('Erro ao verificar período de graça:', error);
    return { inGracePeriod: false, daysRemaining: 0, expiresAt: null };
  }
}
