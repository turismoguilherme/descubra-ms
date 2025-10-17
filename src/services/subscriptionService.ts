/**
 * Subscription Service
 * Gerencia planos e assinaturas ViaJAR
 * 
 * PLANOS:
 * - Freemium (R$ 0/mês)
 * - Professional (R$ 199/mês)
 * - Enterprise (R$ 499/mês)
 * - Governo (R$ 2.000+/mês)
 */

import { supabase } from '@/integrations/supabase/client';

export type PlanTier = 'freemium' | 'professional' | 'enterprise' | 'government';
export type BillingPeriod = 'monthly' | 'annual';
export type PaymentMethod = 'credit_card' | 'pix' | 'boleto' | 'invoice';

export interface Plan {
  id: PlanTier;
  name: string;
  price: number;
  annualPrice: number;
  annualDiscount: number;
  currency: string;
  icon: string;
  color: string;
  recommended?: boolean;
  features: PlanFeature[];
  limitations?: string[];
  target: string;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string;
  description?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: PlanTier;
  status: 'active' | 'canceled' | 'past_due' | 'trial';
  billingPeriod: BillingPeriod;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  paymentMethod?: PaymentMethod;
  amount: number;
  currency: string;
}

/**
 * Definição dos planos ViaJAR
 */
export const PLANS: Record<PlanTier, Plan> = {
  freemium: {
    id: 'freemium',
    name: 'Freemium',
    price: 0,
    annualPrice: 0,
    annualDiscount: 0,
    currency: 'BRL',
    icon: 'Package',
    color: 'gray',
    target: 'Pequenos negócios e estabelecimentos iniciantes',
    features: [
      { name: 'Cadastro no inventário turístico', included: true },
      { name: 'Perfil público básico', included: true },
      { name: 'Fotos do estabelecimento', included: true, limit: '5 fotos' },
      { name: 'Aparece nas buscas', included: true },
      { name: 'Localização no mapa', included: true },
      { name: 'Horários de funcionamento', included: true },
      { name: 'Intelligence IA', included: false },
      { name: 'Relatórios', included: false },
      { name: 'Destaque nas buscas', included: false },
      { name: 'Suporte prioritário', included: false },
    ],
    limitations: [
      'Máximo 5 fotos',
      'Sem relatórios analíticos',
      'Sem ferramentas de IA',
      'Suporte apenas por email',
    ],
  },
  
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 199,
    annualPrice: 1912, // 20% desconto
    annualDiscount: 20,
    currency: 'BRL',
    icon: 'Briefcase',
    color: 'blue',
    recommended: true,
    target: 'Hotéis, pousadas e agências de médio porte',
    features: [
      { name: 'Tudo do Freemium', included: true },
      { name: 'Fotos ilimitadas', included: true },
      { name: 'Intelligence IA básica', included: true, description: 'Insights semanais' },
      { name: 'Relatórios mensais', included: true },
      { name: 'Análise de concorrência', included: true },
      { name: 'Destaque nas buscas', included: true, description: 'Posição prioritária' },
      { name: 'Galeria de vídeos', included: true, limit: '3 vídeos' },
      { name: 'Suporte prioritário', included: true, description: 'Resposta em 24h' },
      { name: 'Estatísticas de visualização', included: true },
      { name: 'Gestão de promoções', included: true },
    ],
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    annualPrice: 4792, // 20% desconto
    annualDiscount: 20,
    currency: 'BRL',
    icon: 'Building2',
    color: 'purple',
    target: 'Grandes hotéis, redes e estabelecimentos premium',
    features: [
      { name: 'Tudo do Professional', included: true },
      { name: 'ViaJAR Intelligence Suite completa', included: true },
      { name: 'Revenue Optimizer', included: true, description: 'Precificação dinâmica com IA' },
      { name: 'Market Intelligence', included: true, description: 'Análise de mercado em tempo real' },
      { name: 'Competitive Benchmark', included: true, description: 'Comparação detalhada' },
      { name: 'Relatórios em tempo real', included: true },
      { name: 'Previsão de demanda', included: true, description: 'Algoritmos preditivos' },
      { name: 'API de integração', included: true, description: 'Conecte seus sistemas' },
      { name: 'Consultoria mensal', included: true, limit: '1 hora/mês' },
      { name: 'Selo "Verificado ViaJAR"', included: true },
      { name: 'Suporte premium', included: true, description: '24/7 via WhatsApp' },
      { name: 'Dashboard personalizado', included: true },
    ],
  },
  
  government: {
    id: 'government',
    name: 'Governo / Prefeitura',
    price: 2000,
    annualPrice: 19200, // 20% desconto
    annualDiscount: 20,
    currency: 'BRL',
    icon: 'Building',
    color: 'green',
    target: 'Secretarias de turismo, prefeituras e órgãos públicos',
    features: [
      { name: 'Dashboard municipal completo', included: true },
      { name: 'Gestão de CATs', included: true, description: 'Centros de Atendimento' },
      { name: 'Gestão de atendentes', included: true, description: 'Ponto eletrônico + GPS' },
      { name: 'Analytics estadual/municipal', included: true },
      { name: 'Mapas de calor', included: true, description: 'Fluxo turístico' },
      { name: 'IA Consultora Estratégica', included: true },
      { name: 'Relatórios consolidados', included: true },
      { name: 'Upload de arquivos', included: true, description: 'Documentos oficiais' },
      { name: 'Integração ALUMIA', included: true, description: 'Quando disponível' },
      { name: 'Multi-usuários', included: true, description: 'Ilimitado' },
      { name: 'Treinamento da equipe', included: true },
      { name: 'Suporte dedicado', included: true, description: 'Gerente de conta' },
    ],
  },
};

/**
 * Calcula preço com desconto anual
 */
export function calculateAnnualPrice(monthlyPrice: number, discount: number = 20): number {
  const annual = monthlyPrice * 12;
  return Math.round(annual * (1 - discount / 100));
}

/**
 * Calcula economia anual
 */
export function calculateAnnualSavings(monthlyPrice: number): number {
  const monthly = monthlyPrice * 12;
  const annual = calculateAnnualPrice(monthlyPrice);
  return monthly - annual;
}

/**
 * Obtém plano do usuário
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      planId: data.plan_id,
      status: data.status,
      billingPeriod: data.billing_period,
      currentPeriodStart: new Date(data.current_period_start),
      currentPeriodEnd: new Date(data.current_period_end),
      cancelAtPeriodEnd: data.cancel_at_period_end,
      paymentMethod: data.payment_method,
      amount: data.amount,
      currency: data.currency,
    };
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    return null;
  }
}

/**
 * Verifica se usuário tem acesso a uma funcionalidade
 */
export function hasFeatureAccess(planId: PlanTier, featureName: string): boolean {
  const plan = PLANS[planId];
  const feature = plan.features.find(f => f.name === featureName);
  return feature?.included || false;
}

/**
 * Verifica se pode fazer upgrade
 */
export function canUpgradeTo(currentPlan: PlanTier, targetPlan: PlanTier): boolean {
  const planHierarchy: PlanTier[] = ['freemium', 'professional', 'enterprise', 'government'];
  const currentIndex = planHierarchy.indexOf(currentPlan);
  const targetIndex = planHierarchy.indexOf(targetPlan);
  return targetIndex > currentIndex;
}

/**
 * Cria assinatura
 */
export async function createSubscription(
  userId: string,
  planId: PlanTier,
  billingPeriod: BillingPeriod,
  paymentMethod: PaymentMethod
): Promise<Subscription | null> {
  try {
    const plan = PLANS[planId];
    const amount = billingPeriod === 'annual' ? plan.annualPrice : plan.price;
    const now = new Date();
    const periodEnd = new Date(now);
    
    if (billingPeriod === 'annual') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        billing_period: billingPeriod,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
        payment_method: paymentMethod,
        amount: amount,
        currency: plan.currency,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Erro ao criar assinatura:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      planId: data.plan_id,
      status: data.status,
      billingPeriod: data.billing_period,
      currentPeriodStart: new Date(data.current_period_start),
      currentPeriodEnd: new Date(data.current_period_end),
      cancelAtPeriodEnd: data.cancel_at_period_end,
      paymentMethod: data.payment_method,
      amount: data.amount,
      currency: data.currency,
    };
  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    return null;
  }
}

/**
 * Cancela assinatura
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<boolean> {
  try {
    if (immediately) {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);
      
      return !error;
    } else {
      const { error } = await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: true })
        .eq('id', subscriptionId);
      
      return !error;
    }
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    return false;
  }
}

/**
 * Faz upgrade de plano
 */
export async function upgradePlan(
  userId: string,
  newPlanId: PlanTier,
  billingPeriod: BillingPeriod
): Promise<boolean> {
  try {
    // Cancela assinatura atual
    const currentSub = await getUserSubscription(userId);
    if (currentSub) {
      await cancelSubscription(currentSub.id, true);
    }

    // Cria nova assinatura
    const newSub = await createSubscription(userId, newPlanId, billingPeriod, 'credit_card');
    return !!newSub;
  } catch (error) {
    console.error('Erro ao fazer upgrade:', error);
    return false;
  }
}

/**
 * Calcula próxima data de cobrança
 */
export function getNextBillingDate(subscription: Subscription): Date {
  return subscription.currentPeriodEnd;
}

/**
 * Calcula dias restantes da assinatura
 */
export function getDaysRemaining(subscription: Subscription): number {
  const now = new Date();
  const end = subscription.currentPeriodEnd;
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Verifica se assinatura está próxima do vencimento
 */
export function isExpiringNSoon(subscription: Subscription, days: number = 7): boolean {
  const remaining = getDaysRemaining(subscription);
  return remaining <= days && remaining > 0;
}

/**
 * Retorna plano recomendado baseado no perfil
 */
export function getRecommendedPlan(userProfile: {
  category: string;
  isGovernment: boolean;
  size?: 'small' | 'medium' | 'large';
}): PlanTier {
  if (userProfile.isGovernment) {
    return 'government';
  }

  if (userProfile.size === 'large') {
    return 'enterprise';
  }

  if (userProfile.size === 'medium') {
    return 'professional';
  }

  return 'freemium';
}

/**
 * Métodos de pagamento disponíveis por país
 */
export function getAvailablePaymentMethods(country: string): PaymentMethod[] {
  if (country === 'BR') {
    return ['credit_card', 'pix', 'boleto', 'invoice'];
  }
  return ['credit_card', 'invoice'];
}

/**
 * Calcula trial period (14 dias)
 */
export function getTrialEndDate(): Date {
  const end = new Date();
  end.setDate(end.getDate() + 14);
  return end;
}
