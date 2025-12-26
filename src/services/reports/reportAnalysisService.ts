/**
 * Report Analysis Service
 * Serviço para análise de dados e geração de textos explicativos para relatórios
 * 
 * IMPORTANTE: Este serviço NÃO inventa dados. Todas as análises são baseadas
 * em dados reais fornecidos. Se não houver dados suficientes, informa claramente.
 */

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface AnalysisContext {
  reportType: string;
  period: { start: Date; end: Date };
  previousPeriod?: { start: Date; end: Date };
  generatedBy: string;
  userRole?: string;
}

export interface MetricAnalysis {
  value: number;
  previousValue?: number;
  variation?: number;
  variationPercent?: number;
  trend: 'up' | 'down' | 'stable' | 'unknown';
  explanation: string;
}

export interface ReportAnalysis {
  executiveSummary: string[];
  metricsAnalysis: Record<string, MetricAnalysis>;
  insights: string[];
  recommendations: string[];
  dataQualityNote?: string;
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Calcula variação percentual entre dois valores
 */
function calculateVariation(current: number, previous: number): { absolute: number; percent: number } {
  const absolute = current - previous;
  const percent = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
  return { absolute, percent };
}

/**
 * Determina a tendência baseada na variação
 */
function determineTrend(variation: number): 'up' | 'down' | 'stable' {
  if (variation > 5) return 'up';
  if (variation < -5) return 'down';
  return 'stable';
}

/**
 * Formata número para exibição em português
 */
function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('pt-BR', { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
}

/**
 * Formata valor monetário
 */
function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });
}

/**
 * Retorna texto descritivo da tendência
 */
function getTrendText(trend: 'up' | 'down' | 'stable' | 'unknown', context: string): string {
  switch (trend) {
    case 'up':
      return `aumento em ${context}`;
    case 'down':
      return `redução em ${context}`;
    case 'stable':
      return `estabilidade em ${context}`;
    default:
      return `dados insuficientes para análise de ${context}`;
  }
}

// ============================================================================
// ANÁLISE DE RELATÓRIOS CAT
// ============================================================================

export interface CATReportData {
  attendances: {
    total: number;
    today?: number;
    previousPeriod?: number;
  };
  averageRating?: number;
  previousAverageRating?: number;
  topOrigins?: Array<{ origin: string; count: number }>;
  averageDuration?: number;
  attendancesByType?: Record<string, number>;
}

/**
 * Analisa dados de relatório CAT e gera textos explicativos
 */
export function analyzeCATReport(
  data: CATReportData,
  context: AnalysisContext
): ReportAnalysis {
  const { attendances, averageRating, topOrigins, averageDuration } = data;
  
  const executiveSummary: string[] = [];
  const insights: string[] = [];
  const recommendations: string[] = [];
  const metricsAnalysis: Record<string, MetricAnalysis> = {};

  // Análise de atendimentos
  if (attendances.total > 0) {
    let attendanceExplanation = `Foram realizados ${formatNumber(attendances.total)} atendimento(s) no período.`;
    let trend: 'up' | 'down' | 'stable' | 'unknown' = 'unknown';
    let variationPercent: number | undefined;

    if (attendances.previousPeriod !== undefined && attendances.previousPeriod > 0) {
      const variation = calculateVariation(attendances.total, attendances.previousPeriod);
      variationPercent = variation.percent;
      trend = determineTrend(variation.percent);
      
      if (trend === 'up') {
        attendanceExplanation += ` Isso representa um aumento de ${formatNumber(Math.abs(variation.percent), 1)}% em relação ao período anterior (${formatNumber(attendances.previousPeriod)}).`;
        insights.push(`O volume de atendimentos cresceu ${formatNumber(Math.abs(variation.percent), 1)}%, indicando maior fluxo turístico.`);
      } else if (trend === 'down') {
        attendanceExplanation += ` Isso representa uma redução de ${formatNumber(Math.abs(variation.percent), 1)}% em relação ao período anterior (${formatNumber(attendances.previousPeriod)}).`;
        insights.push(`Houve queda de ${formatNumber(Math.abs(variation.percent), 1)}% nos atendimentos. Recomenda-se investigar possíveis causas.`);
      } else {
        attendanceExplanation += ` O volume manteve-se estável em relação ao período anterior.`;
      }
    }

    metricsAnalysis['attendances'] = {
      value: attendances.total,
      previousValue: attendances.previousPeriod,
      variationPercent,
      trend,
      explanation: attendanceExplanation
    };

    executiveSummary.push(attendanceExplanation);
  } else {
    executiveSummary.push('Não foram registrados atendimentos no período selecionado.');
    metricsAnalysis['attendances'] = {
      value: 0,
      trend: 'unknown',
      explanation: 'Sem atendimentos registrados no período.'
    };
  }

  // Análise de avaliação média
  if (averageRating !== undefined && averageRating > 0) {
    let ratingExplanation = `A avaliação média dos atendimentos foi de ${formatNumber(averageRating, 1)} pontos.`;
    let ratingTrend: 'up' | 'down' | 'stable' | 'unknown' = 'unknown';

    if (averageRating >= 4.5) {
      ratingExplanation += ' Excelente desempenho na qualidade do atendimento.';
      insights.push('A qualidade do atendimento está em nível de excelência.');
    } else if (averageRating >= 4.0) {
      ratingExplanation += ' Bom desempenho, com espaço para melhorias.';
    } else if (averageRating >= 3.0) {
      ratingExplanation += ' Desempenho satisfatório, mas requer atenção.';
      recommendations.push('Considerar treinamentos para melhorar a qualidade do atendimento.');
    } else {
      ratingExplanation += ' Atenção necessária: avaliação abaixo do esperado.';
      recommendations.push('Ação urgente: revisar processos de atendimento e capacitar equipe.');
    }

    if (data.previousAverageRating !== undefined && data.previousAverageRating > 0) {
      const ratingVariation = calculateVariation(averageRating, data.previousAverageRating);
      ratingTrend = determineTrend(ratingVariation.percent);
    }

    metricsAnalysis['averageRating'] = {
      value: averageRating,
      previousValue: data.previousAverageRating,
      trend: ratingTrend,
      explanation: ratingExplanation
    };

    executiveSummary.push(ratingExplanation);
  }

  // Análise de origens
  if (topOrigins && topOrigins.length > 0) {
    const totalFromOrigins = topOrigins.reduce((sum, o) => sum + o.count, 0);
    const topOrigin = topOrigins[0];
    const topOriginPercent = totalFromOrigins > 0 
      ? (topOrigin.count / totalFromOrigins) * 100 
      : 0;

    insights.push(
      `A principal origem dos turistas atendidos foi ${topOrigin.origin}, representando ${formatNumber(topOriginPercent, 1)}% do total.`
    );

    if (topOrigins.length >= 3) {
      const top3 = topOrigins.slice(0, 3).map(o => o.origin).join(', ');
      insights.push(`As três principais origens foram: ${top3}.`);
    }
  }

  // Análise de duração média
  if (averageDuration !== undefined && averageDuration > 0) {
    let durationExplanation = `O tempo médio de atendimento foi de ${formatNumber(averageDuration, 0)} minutos.`;
    
    if (averageDuration > 30) {
      durationExplanation += ' Atendimentos mais longos podem indicar demandas complexas.';
    } else if (averageDuration < 5) {
      durationExplanation += ' Atendimentos rápidos podem indicar consultas simples ou filas.';
    }

    metricsAnalysis['averageDuration'] = {
      value: averageDuration,
      trend: 'stable',
      explanation: durationExplanation
    };
  }

  // Recomendações baseadas nos dados
  if (attendances.total > 0 && !averageRating) {
    recommendations.push('Implementar sistema de avaliação pós-atendimento para monitorar qualidade.');
  }

  if (topOrigins && topOrigins.length > 0) {
    recommendations.push(`Desenvolver materiais informativos focados nos turistas de ${topOrigins[0].origin}.`);
  }

  // Nota sobre qualidade dos dados
  let dataQualityNote: string | undefined;
  if (attendances.previousPeriod === undefined) {
    dataQualityNote = 'Nota: Não há dados do período anterior para comparação. As análises de tendência estarão disponíveis nos próximos relatórios.';
  }

  return {
    executiveSummary,
    metricsAnalysis,
    insights,
    recommendations,
    dataQualityNote
  };
}

// ============================================================================
// ANÁLISE DE RELATÓRIOS DE PARCEIROS
// ============================================================================

export interface PartnerReportData {
  reservations: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    previousPeriodTotal?: number;
  };
  revenue: {
    total: number;
    previousPeriod?: number;
  };
  commission: {
    total: number;
    rate: number;
  };
  averageTicket?: number;
  occupancyRate?: number;
}

/**
 * Analisa dados de relatório de Parceiros
 */
export function analyzePartnerReport(
  data: PartnerReportData,
  context: AnalysisContext
): ReportAnalysis {
  const { reservations, revenue, commission, averageTicket, occupancyRate } = data;
  
  const executiveSummary: string[] = [];
  const insights: string[] = [];
  const recommendations: string[] = [];
  const metricsAnalysis: Record<string, MetricAnalysis> = {};

  // Análise de reservas
  const confirmationRate = reservations.total > 0 
    ? ((reservations.confirmed + reservations.completed) / reservations.total) * 100 
    : 0;

  let reservationsExplanation = `O estabelecimento recebeu ${formatNumber(reservations.total)} reserva(s) no período.`;
  let reservationsTrend: 'up' | 'down' | 'stable' | 'unknown' = 'unknown';

  if (reservations.total > 0) {
    reservationsExplanation += ` Destas, ${formatNumber(reservations.confirmed)} confirmadas, ${formatNumber(reservations.completed)} concluídas e ${formatNumber(reservations.cancelled)} canceladas.`;
    
    if (reservations.previousPeriodTotal !== undefined && reservations.previousPeriodTotal > 0) {
      const variation = calculateVariation(reservations.total, reservations.previousPeriodTotal);
      reservationsTrend = determineTrend(variation.percent);
      
      if (reservationsTrend === 'up') {
        insights.push(`As reservas aumentaram ${formatNumber(Math.abs(variation.percent), 1)}% em relação ao período anterior.`);
      } else if (reservationsTrend === 'down') {
        insights.push(`Houve redução de ${formatNumber(Math.abs(variation.percent), 1)}% nas reservas.`);
      }
    }

    // Taxa de confirmação
    if (confirmationRate >= 80) {
      insights.push(`Excelente taxa de confirmação: ${formatNumber(confirmationRate, 1)}% das reservas foram confirmadas ou concluídas.`);
    } else if (confirmationRate < 50) {
      recommendations.push(`A taxa de confirmação está em ${formatNumber(confirmationRate, 1)}%. Considere revisar políticas de reserva.`);
    }
  }

  metricsAnalysis['reservations'] = {
    value: reservations.total,
    previousValue: reservations.previousPeriodTotal,
    trend: reservationsTrend,
    explanation: reservationsExplanation
  };

  executiveSummary.push(reservationsExplanation);

  // Análise de receita
  if (revenue.total > 0) {
    let revenueExplanation = `A receita bruta do período foi de ${formatCurrency(revenue.total)}.`;
    let revenueTrend: 'up' | 'down' | 'stable' | 'unknown' = 'unknown';

    if (revenue.previousPeriod !== undefined && revenue.previousPeriod > 0) {
      const variation = calculateVariation(revenue.total, revenue.previousPeriod);
      revenueTrend = determineTrend(variation.percent);
      
      if (revenueTrend === 'up') {
        revenueExplanation += ` Crescimento de ${formatNumber(Math.abs(variation.percent), 1)}% em relação ao período anterior.`;
      } else if (revenueTrend === 'down') {
        revenueExplanation += ` Redução de ${formatNumber(Math.abs(variation.percent), 1)}% em relação ao período anterior.`;
      }
    }

    const netRevenue = revenue.total - commission.total;
    revenueExplanation += ` Receita líquida (após comissões de ${formatNumber(commission.rate, 1)}%): ${formatCurrency(netRevenue)}.`;

    metricsAnalysis['revenue'] = {
      value: revenue.total,
      previousValue: revenue.previousPeriod,
      trend: revenueTrend,
      explanation: revenueExplanation
    };

    executiveSummary.push(revenueExplanation);
  }

  // Ticket médio
  if (averageTicket !== undefined && averageTicket > 0) {
    insights.push(`O ticket médio por reserva foi de ${formatCurrency(averageTicket)}.`);
    
    metricsAnalysis['averageTicket'] = {
      value: averageTicket,
      trend: 'stable',
      explanation: `Valor médio por reserva: ${formatCurrency(averageTicket)}.`
    };
  }

  // Taxa de ocupação (para hotéis/pousadas)
  if (occupancyRate !== undefined) {
    let occupancyExplanation = `A taxa de ocupação foi de ${formatNumber(occupancyRate, 1)}%.`;
    
    if (occupancyRate >= 80) {
      occupancyExplanation += ' Excelente desempenho de ocupação.';
    } else if (occupancyRate >= 60) {
      occupancyExplanation += ' Desempenho satisfatório.';
    } else if (occupancyRate >= 40) {
      occupancyExplanation += ' Há espaço para melhorias.';
      recommendations.push('Considerar promoções ou parcerias para aumentar a ocupação.');
    } else {
      occupancyExplanation += ' Atenção necessária.';
      recommendations.push('Urgente: revisar estratégias de marketing e precificação.');
    }

    metricsAnalysis['occupancyRate'] = {
      value: occupancyRate,
      trend: 'stable',
      explanation: occupancyExplanation
    };

    executiveSummary.push(occupancyExplanation);
  }

  // Recomendações baseadas nos dados
  if (reservations.cancelled > reservations.total * 0.2) {
    recommendations.push(`A taxa de cancelamento está alta (${formatNumber((reservations.cancelled / reservations.total) * 100, 1)}%). Revisar política de cancelamento.`);
  }

  if (reservations.pending > reservations.total * 0.3) {
    recommendations.push('Há muitas reservas pendentes. Considere contatar os clientes para confirmação.');
  }

  return {
    executiveSummary,
    metricsAnalysis,
    insights,
    recommendations
  };
}

// ============================================================================
// ANÁLISE DE RELATÓRIOS DE SECRETARIA
// ============================================================================

export interface SecretaryReportData {
  cats: {
    total: number;
    active: number;
  };
  tourists: {
    total: number;
    today: number;
    previousPeriod?: number;
  };
  attractions: {
    total: number;
    active: number;
  };
  events: {
    total: number;
    confirmed: number;
    planning: number;
  };
  topOrigins?: Array<{ origin: string; count: number }>;
}

/**
 * Analisa dados de relatório de Secretaria
 */
export function analyzeSecretaryReport(
  data: SecretaryReportData,
  context: AnalysisContext
): ReportAnalysis {
  const { cats, tourists, attractions, events, topOrigins } = data;
  
  const executiveSummary: string[] = [];
  const insights: string[] = [];
  const recommendations: string[] = [];
  const metricsAnalysis: Record<string, MetricAnalysis> = {};

  // Análise de CATs
  const catsExplanation = `O município conta com ${formatNumber(cats.total)} Centro(s) de Atendimento ao Turista, sendo ${formatNumber(cats.active)} ativo(s).`;
  metricsAnalysis['cats'] = {
    value: cats.total,
    trend: 'stable',
    explanation: catsExplanation
  };
  executiveSummary.push(catsExplanation);

  // Análise de turistas
  if (tourists.total > 0) {
    let touristsExplanation = `Foram registrados ${formatNumber(tourists.total)} turista(s) no período.`;
    let touristsTrend: 'up' | 'down' | 'stable' | 'unknown' = 'unknown';

    if (tourists.previousPeriod !== undefined && tourists.previousPeriod > 0) {
      const variation = calculateVariation(tourists.total, tourists.previousPeriod);
      touristsTrend = determineTrend(variation.percent);
      
      if (touristsTrend === 'up') {
        touristsExplanation += ` Crescimento de ${formatNumber(Math.abs(variation.percent), 1)}% em relação ao período anterior.`;
        insights.push('O fluxo turístico apresenta tendência de crescimento.');
      } else if (touristsTrend === 'down') {
        touristsExplanation += ` Redução de ${formatNumber(Math.abs(variation.percent), 1)}% em relação ao período anterior.`;
        insights.push('Observa-se redução no fluxo turístico. Recomenda-se investigar causas.');
      }
    }

    metricsAnalysis['tourists'] = {
      value: tourists.total,
      previousValue: tourists.previousPeriod,
      trend: touristsTrend,
      explanation: touristsExplanation
    };
    executiveSummary.push(touristsExplanation);
  }

  // Análise de atrações
  const attractionsExplanation = `O inventário turístico conta com ${formatNumber(attractions.total)} atração(ões), sendo ${formatNumber(attractions.active)} ativa(s).`;
  metricsAnalysis['attractions'] = {
    value: attractions.total,
    trend: 'stable',
    explanation: attractionsExplanation
  };
  executiveSummary.push(attractionsExplanation);

  // Análise de eventos
  if (events.total > 0) {
    const eventsExplanation = `Há ${formatNumber(events.total)} evento(s) no período: ${formatNumber(events.confirmed)} confirmado(s) e ${formatNumber(events.planning)} em planejamento.`;
    metricsAnalysis['events'] = {
      value: events.total,
      trend: 'stable',
      explanation: eventsExplanation
    };
    executiveSummary.push(eventsExplanation);
  }

  // Análise de origens
  if (topOrigins && topOrigins.length > 0) {
    const topOrigin = topOrigins[0];
    insights.push(`A principal origem dos turistas é ${topOrigin.origin} (${formatNumber(topOrigin.count)} registros).`);
    
    if (topOrigins.length >= 3) {
      recommendations.push(`Desenvolver ações de marketing focadas nas principais origens: ${topOrigins.slice(0, 3).map(o => o.origin).join(', ')}.`);
    }
  }

  // Recomendações gerais
  if (cats.active < cats.total) {
    recommendations.push(`${formatNumber(cats.total - cats.active)} CAT(s) não está(ão) ativo(s). Verificar necessidade de ativação.`);
  }

  if (attractions.active < attractions.total * 0.8) {
    recommendations.push('Menos de 80% das atrações estão ativas. Revisar status do inventário turístico.');
  }

  return {
    executiveSummary,
    metricsAnalysis,
    insights,
    recommendations
  };
}

// ============================================================================
// ANÁLISE DE RELATÓRIOS DE EMPRESÁRIOS (DIAGNÓSTICO)
// ============================================================================

export interface DiagnosticReportData {
  overallScore: number;
  previousScore?: number;
  estimatedROI: number;
  growthPotential: number;
  recommendationsCount: number;
  businessProfile: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    riskLevel: string;
    marketPosition: string;
  };
  businessType?: string;
  completedModules?: number;
  totalModules?: number;
}

/**
 * Analisa dados de relatório de Diagnóstico (Empresários)
 */
export function analyzeDiagnosticReport(
  data: DiagnosticReportData,
  context: AnalysisContext
): ReportAnalysis {
  const { 
    overallScore, 
    previousScore, 
    estimatedROI, 
    growthPotential,
    recommendationsCount,
    businessProfile 
  } = data;
  
  const executiveSummary: string[] = [];
  const insights: string[] = [];
  const recommendations: string[] = [];
  const metricsAnalysis: Record<string, MetricAnalysis> = {};

  // Análise do Score Geral
  let scoreExplanation = `O diagnóstico resultou em um score geral de ${formatNumber(overallScore)}%.`;
  let scoreTrend: 'up' | 'down' | 'stable' | 'unknown' = 'unknown';

  if (overallScore >= 80) {
    scoreExplanation += ' Este é um excelente resultado, indicando que o negócio está bem estruturado.';
    insights.push('O negócio apresenta maturidade elevada, com processos bem definidos.');
  } else if (overallScore >= 60) {
    scoreExplanation += ' O resultado indica bom desempenho, com espaço para melhorias específicas.';
    insights.push('Há oportunidades claras de otimização em áreas específicas.');
  } else if (overallScore >= 40) {
    scoreExplanation += ' O resultado sugere necessidade de atenção em várias áreas do negócio.';
    recommendations.push('Priorizar as recomendações de alta prioridade para elevar o score.');
  } else {
    scoreExplanation += ' O resultado indica necessidade urgente de reestruturação.';
    recommendations.push('Iniciar plano de ação imediato focando nos pontos críticos identificados.');
  }

  if (previousScore !== undefined && previousScore > 0) {
    const variation = calculateVariation(overallScore, previousScore);
    scoreTrend = determineTrend(variation.percent);
    
    if (scoreTrend === 'up') {
      scoreExplanation += ` Houve evolução de ${formatNumber(Math.abs(variation.percent), 1)}% em relação ao diagnóstico anterior.`;
      insights.push('O negócio está evoluindo positivamente.');
    } else if (scoreTrend === 'down') {
      scoreExplanation += ` Houve queda de ${formatNumber(Math.abs(variation.percent), 1)}% em relação ao diagnóstico anterior.`;
      recommendations.push('Investigar causas da queda no score e implementar ações corretivas.');
    }
  }

  metricsAnalysis['overallScore'] = {
    value: overallScore,
    previousValue: previousScore,
    trend: scoreTrend,
    explanation: scoreExplanation
  };
  executiveSummary.push(scoreExplanation);

  // Análise de ROI Estimado
  const roiExplanation = `O ROI estimado com a implementação das recomendações é de +${formatNumber(estimatedROI)}%.`;
  metricsAnalysis['estimatedROI'] = {
    value: estimatedROI,
    trend: estimatedROI > 20 ? 'up' : 'stable',
    explanation: roiExplanation
  };
  executiveSummary.push(roiExplanation);

  if (estimatedROI >= 50) {
    insights.push('O potencial de retorno sobre o investimento é muito alto.');
  } else if (estimatedROI >= 20) {
    insights.push('As melhorias propostas oferecem bom retorno sobre o investimento.');
  }

  // Análise de Potencial de Crescimento
  const growthExplanation = `O potencial de crescimento identificado é de ${formatNumber(growthPotential)}%.`;
  metricsAnalysis['growthPotential'] = {
    value: growthPotential,
    trend: growthPotential > 30 ? 'up' : 'stable',
    explanation: growthExplanation
  };
  executiveSummary.push(growthExplanation);

  // Análise SWOT
  if (businessProfile.strengths.length > 0) {
    insights.push(`Principais forças: ${businessProfile.strengths.slice(0, 3).join(', ')}.`);
  }

  if (businessProfile.weaknesses.length > 0) {
    recommendations.push(`Trabalhar nas principais fraquezas: ${businessProfile.weaknesses.slice(0, 2).join(', ')}.`);
  }

  if (businessProfile.opportunities.length > 0) {
    insights.push(`Oportunidades identificadas: ${businessProfile.opportunities.slice(0, 2).join(', ')}.`);
  }

  if (businessProfile.threats.length > 0) {
    recommendations.push(`Atenção às ameaças: ${businessProfile.threats.slice(0, 2).join(', ')}.`);
  }

  // Análise de Risco
  if (businessProfile.riskLevel === 'alto') {
    recommendations.push('O nível de risco é alto. Implementar medidas de mitigação urgentes.');
  } else if (businessProfile.riskLevel === 'medio') {
    insights.push('O nível de risco é moderado. Monitorar indicadores regularmente.');
  } else {
    insights.push('O nível de risco é baixo, indicando boa saúde do negócio.');
  }

  // Posição no Mercado
  insights.push(`Posição no mercado: ${businessProfile.marketPosition}.`);

  // Recomendações baseadas no número de melhorias
  if (recommendationsCount > 10) {
    recommendations.push(`Foram identificadas ${recommendationsCount} recomendações. Priorize as 5 primeiras para implementação imediata.`);
  } else if (recommendationsCount > 5) {
    recommendations.push(`${recommendationsCount} recomendações foram identificadas. Crie um cronograma de implementação.`);
  }

  return {
    executiveSummary,
    metricsAnalysis,
    insights,
    recommendations
  };
}

// ============================================================================
// SERVIÇO EXPORTADO
// ============================================================================

export const reportAnalysisService = {
  analyzeCATReport,
  analyzePartnerReport,
  analyzeSecretaryReport,
  analyzeDiagnosticReport,
  
  // Utilitários
  formatNumber,
  formatCurrency,
  calculateVariation,
  determineTrend
};

