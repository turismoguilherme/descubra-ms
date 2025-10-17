/**
 * Analysis Service
 * Serviço para análise de respostas do questionário com IA
 */

import { QuestionnaireAnswers } from '@/components/diagnostic/DiagnosticQuestionnaire';

export interface BusinessProfile {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  potentialGrowth: number;
  estimatedRevenue: number;
  riskLevel: 'low' | 'medium' | 'high';
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
}

export interface Recommendation {
  id: string;
  name: string;
  description: string;
  priority: 1 | 2 | 3 | 4 | 5;
  confidence: number;
  estimatedROI: number;
  implementationTime: string;
  features: string[];
  benefits: string[];
  requirements: string[];
  category: 'revenue' | 'marketing' | 'operations' | 'technology' | 'analytics';
}

export interface AnalysisResult {
  businessProfile: BusinessProfile;
  recommendations: Recommendation[];
  overallScore: number;
  growthPotential: number;
  estimatedROI: number;
  implementationPlan: {
    phase1: Recommendation[];
    phase2: Recommendation[];
    phase3: Recommendation[];
  };
}

// Configuração das recomendações por categoria
const RECOMMENDATIONS_CONFIG = {
  hotel: {
    revenue: [
      {
        id: 'revenue-optimizer',
        name: 'Revenue Optimizer',
        description: 'Otimização de preços e ocupação em tempo real',
        features: ['Pricing dinâmico', 'Previsão de demanda', 'Gestão de inventário'],
        benefits: ['+25% ocupação', '+40% receita', 'Redução de no-shows'],
        requirements: ['Integração PMS', 'Dados históricos', 'Conectividade']
      },
      {
        id: 'market-intelligence',
        name: 'Market Intelligence',
        description: 'Análise competitiva e tendências de mercado',
        features: ['Benchmarking', 'Análise de preços', 'Tendências sazonais'],
        benefits: ['+15% competitividade', 'Precificação estratégica', 'Oportunidades de mercado'],
        requirements: ['Dados de mercado', 'API de preços', 'Análise histórica']
      }
    ],
    marketing: [
      {
        id: 'ai-conversational',
        name: 'IA Conversacional',
        description: 'Atendimento automatizado 24/7 com IA',
        features: ['Chat inteligente', 'Reservas automáticas', 'Suporte multilíngue'],
        benefits: ['+30% satisfação', 'Redução de custos', 'Disponibilidade 24/7'],
        requirements: ['Integração WhatsApp', 'Base de conhecimento', 'Treinamento IA']
      }
    ],
    operations: [
      {
        id: 'occupancy-system',
        name: 'Sistema de Ocupação',
        description: 'Gestão inteligente de quartos e reservas',
        features: ['Gestão de inventário', 'Previsão de ocupação', 'Otimização de preços'],
        benefits: ['+20% eficiência', 'Redução de overbooking', 'Maximização de receita'],
        requirements: ['PMS integrado', 'Dados em tempo real', 'Algoritmos de previsão']
      }
    ]
  },
  agency: {
    revenue: [
      {
        id: 'package-optimizer',
        name: 'Package Optimizer',
        description: 'Otimização de pacotes e roteiros',
        features: ['Análise de rentabilidade', 'Sugestões de roteiros', 'Precificação dinâmica'],
        benefits: ['+35% margem', 'Personalização', 'Eficiência operacional'],
        requirements: ['Dados de fornecedores', 'Histórico de vendas', 'Análise de custos']
      }
    ],
    marketing: [
      {
        id: 'lead-generation',
        name: 'Lead Generation',
        description: 'Captação e qualificação de leads',
        features: ['Formulários inteligentes', 'Scoring de leads', 'Automação de follow-up'],
        benefits: ['+50% conversão', 'Qualificação automática', 'Redução de custos'],
        requirements: ['Integração CRM', 'Automação de marketing', 'Análise de comportamento']
      }
    ]
  },
  restaurant: {
    revenue: [
      {
        id: 'menu-optimizer',
        name: 'Menu Optimizer',
        description: 'Otimização de cardápio e precificação',
        features: ['Análise de pratos', 'Precificação dinâmica', 'Gestão de estoque'],
        benefits: ['+20% margem', 'Redução de desperdício', 'Aumento de vendas'],
        requirements: ['Dados de vendas', 'Custos de ingredientes', 'Análise de sazonalidade']
      }
    ],
    operations: [
      {
        id: 'reservation-system',
        name: 'Sistema de Reservas',
        description: 'Gestão inteligente de mesas e reservas',
        features: ['Reservas online', 'Gestão de filas', 'Otimização de layout'],
        benefits: ['+25% ocupação', 'Melhor experiência', 'Redução de no-shows'],
        requirements: ['Sistema de mesas', 'Integração POS', 'Gestão de horários']
      }
    ]
  }
};

// Função para calcular perfil do negócio
export const calculateBusinessProfile = (answers: QuestionnaireAnswers): BusinessProfile => {
  const { businessType, businessSize, currentChallenges, goals, technicalLevel, experience } = answers;
  
  // Análise de forças
  const strengths: string[] = [];
  if (experience >= 5) strengths.push('Experiência sólida no mercado');
  if (technicalLevel === 'advanced') strengths.push('Alto nível técnico');
  if (businessSize === 'large') strengths.push('Recursos financeiros robustos');
  if (goals.includes('digitalizar')) strengths.push('Visão de transformação digital');
  
  // Análise de fraquezas
  const weaknesses: string[] = [];
  if (currentChallenges.includes('tecnologia')) weaknesses.push('Defasagem tecnológica');
  if (currentChallenges.includes('marketing')) weaknesses.push('Estratégias de marketing limitadas');
  if (technicalLevel === 'beginner') weaknesses.push('Baixo nível técnico');
  if (businessSize === 'small') weaknesses.push('Recursos limitados');
  
  // Análise de oportunidades
  const opportunities: string[] = [];
  if (goals.includes('aumentar_receita')) opportunities.push('Crescimento de receita');
  if (goals.includes('digitalizar')) opportunities.push('Transformação digital');
  if (goals.includes('automatizar')) opportunities.push('Automação de processos');
  if (businessType === 'hotel' && currentChallenges.includes('ocupacao')) {
    opportunities.push('Otimização de ocupação');
  }
  
  // Análise de ameaças
  const threats: string[] = [];
  if (currentChallenges.includes('concorrencia')) threats.push('Concorrência acirrada');
  if (budget === 'low') threats.push('Orçamento limitado');
  if (timeline === 'immediate') threats.push('Pressão por resultados rápidos');
  
  // Cálculo de potencial de crescimento
  let potentialGrowth = 50; // Base
  if (businessSize === 'small') potentialGrowth += 30;
  if (technicalLevel === 'advanced') potentialGrowth += 20;
  if (goals.includes('expandir')) potentialGrowth += 25;
  if (experience >= 5) potentialGrowth += 15;
  
  // Cálculo de receita estimada
  let estimatedRevenue = 0;
  if (businessSize === 'small') estimatedRevenue = 50000;
  else if (businessSize === 'medium') estimatedRevenue = 200000;
  else estimatedRevenue = 500000;
  
  // Nível de risco
  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  if (technicalLevel === 'advanced' && experience >= 5) riskLevel = 'low';
  else if (technicalLevel === 'beginner' && experience < 2) riskLevel = 'high';
  
  // Posição no mercado
  let marketPosition: 'leader' | 'challenger' | 'follower' | 'niche' = 'follower';
  if (businessSize === 'large' && experience >= 10) marketPosition = 'leader';
  else if (businessSize === 'medium' && technicalLevel === 'advanced') marketPosition = 'challenger';
  else if (businessSize === 'small') marketPosition = 'niche';
  
  return {
    strengths,
    weaknesses,
    opportunities,
    threats,
    potentialGrowth: Math.min(potentialGrowth, 100),
    estimatedRevenue,
    riskLevel,
    marketPosition
  };
};

// Função para gerar recomendações
export const generateRecommendations = (answers: QuestionnaireAnswers, businessProfile: BusinessProfile): Recommendation[] => {
  const { businessType, currentChallenges, goals, budget, timeline } = answers;
  const recommendations: Recommendation[] = [];
  
  // Obter configurações baseadas no tipo de negócio
  const config = RECOMMENDATIONS_CONFIG[businessType] || RECOMMENDATIONS_CONFIG.hotel;
  
  // Gerar recomendações baseadas nos desafios
  currentChallenges.forEach(challenge => {
    if (challenge === 'ocupacao' && businessType === 'hotel') {
      const rec = config.revenue?.find(r => r.id === 'revenue-optimizer');
      if (rec) {
        recommendations.push({
          ...rec,
          priority: 1,
          confidence: 0.9,
          estimatedROI: 40,
          implementationTime: '2-4 semanas',
          category: 'revenue'
        });
      }
    }
    
    if (challenge === 'precos') {
      const rec = config.revenue?.find(r => r.id === 'market-intelligence');
      if (rec) {
        recommendations.push({
          ...rec,
          priority: 2,
          confidence: 0.8,
          estimatedROI: 25,
          implementationTime: '1-2 semanas',
          category: 'revenue'
        });
      }
    }
    
    if (challenge === 'marketing') {
      const rec = config.marketing?.find(r => r.id === 'ai-conversational');
      if (rec) {
        recommendations.push({
          ...rec,
          priority: 3,
          confidence: 0.85,
          estimatedROI: 30,
          implementationTime: '3-6 semanas',
          category: 'marketing'
        });
      }
    }
  });
  
  // Gerar recomendações baseadas nos objetivos
  goals.forEach(goal => {
    if (goal === 'automatizar' && businessType === 'restaurant') {
      const rec = config.operations?.find(r => r.id === 'reservation-system');
      if (rec) {
        recommendations.push({
          ...rec,
          priority: 2,
          confidence: 0.75,
          estimatedROI: 25,
          implementationTime: '2-3 semanas',
          category: 'operations'
        });
      }
    }
  });
  
  // Ajustar prioridades baseado no orçamento
  if (budget === 'low') {
    recommendations.forEach(rec => {
      if (rec.category === 'technology' || rec.category === 'analytics') {
        rec.priority = Math.min(rec.priority + 1, 5);
      }
    });
  }
  
  // Ajustar confiança baseado no perfil
  recommendations.forEach(rec => {
    if (businessProfile.riskLevel === 'low') {
      rec.confidence = Math.min(rec.confidence + 0.1, 1.0);
    } else if (businessProfile.riskLevel === 'high') {
      rec.confidence = Math.max(rec.confidence - 0.1, 0.5);
    }
  });
  
  return recommendations.sort((a, b) => a.priority - b.priority);
};

// Função para criar plano de implementação
export const createImplementationPlan = (recommendations: Recommendation[]) => {
  const phase1 = recommendations.filter(r => r.priority <= 2);
  const phase2 = recommendations.filter(r => r.priority === 3);
  const phase3 = recommendations.filter(r => r.priority >= 4);
  
  return { phase1, phase2, phase3 };
};

// Função principal de análise
export const analyzeBusinessProfile = async (answers: QuestionnaireAnswers): Promise<AnalysisResult> => {
  // Calcular perfil do negócio
  const businessProfile = calculateBusinessProfile(answers);
  
  // Gerar recomendações
  const recommendations = generateRecommendations(answers, businessProfile);
  
  // Criar plano de implementação
  const implementationPlan = createImplementationPlan(recommendations);
  
  // Calcular score geral
  const overallScore = Math.round(
    (businessProfile.potentialGrowth + 
     recommendations.reduce((sum, r) => sum + r.confidence * 20, 0) / recommendations.length) / 2
  );
  
  // Calcular potencial de crescimento
  const growthPotential = businessProfile.potentialGrowth;
  
  // Calcular ROI estimado
  const estimatedROI = recommendations.reduce((sum, r) => sum + r.estimatedROI, 0) / recommendations.length;
  
  return {
    businessProfile,
    recommendations,
    overallScore,
    growthPotential,
    estimatedROI,
    implementationPlan
  };
};

// Função para análise com Gemini (quando disponível)
export const analyzeWithGemini = async (answers: QuestionnaireAnswers): Promise<AnalysisResult> => {
  // Por enquanto, usar análise local
  // TODO: Implementar integração com Gemini
  return analyzeBusinessProfile(answers);
};
