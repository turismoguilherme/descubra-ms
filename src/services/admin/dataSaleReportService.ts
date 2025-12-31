/**
 * Data Sale Report Service
 * Serviço para gerar relatórios de dados de turismo agregados para secretarias
 * GARANTE: Apenas dados reais, nunca mocks ou simulações
 */

import { supabase } from '@/integrations/supabase/client';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { alumiaService } from '@/services/alumia';
// @ts-ignore - xlsx não tem tipos oficiais
import * as XLSX from 'xlsx';

export interface DataSaleRequest {
  id: string;
  requester_name: string;
  requester_email: string;
  requester_city?: string;
  report_type: 'explanatory' | 'raw_data' | 'both';
  period_start: Date;
  period_end: Date;
  status: string;
}

export interface DataValidationResult {
  isValid: boolean;
  totalRecords: number;
  alumiaRecordsCount: number;
  descubraMSRecordsCount: number;
  dataSources: string[];
  notes: string[];
}

export interface AggregatedData {
  // Perfil demográfico (agregado)
  demographics: {
    ageGroups: Record<string, number>;
    gender: Record<string, number>;
  };
  
  // Origem dos visitantes (agregado)
  origins: {
    states: Record<string, number>;
    countries: Record<string, number>;
  };
  
  // Propósito de viagem (agregado)
  travelPurposes: Record<string, number>;
  
  // Interações na plataforma (agregado)
  interactions: {
    topPages: Array<{ page: string; views: number }>;
    topSearches: Array<{ search: string; count: number }>;
    totalInteractions: number;
  };
  
  // Pesquisas com turistas (agregado)
  surveys: {
    totalSurveys: number;
    byOrigin: Record<string, number>;
    byMotivation: Record<string, number>;
    byQuestionType: Record<string, number>;
  };
  
  // Dados Alumia (quando disponível)
  alumia?: {
    available: boolean;
    data?: any;
    note?: string;
  };
  
  // Metadados
  metadata: {
    periodStart: string;
    periodEnd: string;
    totalRecords: number;
    dataSources: string[];
    generatedAt: string;
    validationStatus: 'valid' | 'insufficient' | 'invalid';
  };
}

export class DataSaleReportService {
  /**
   * Validar disponibilidade de dados reais no período
   * APENAS Alumia (quando API disponível) e Descubra MS (quando implementado)
   */
  async validateDataAvailability(
    periodStart: Date,
    periodEnd: Date,
    city?: string
  ): Promise<DataValidationResult> {
    try {
      const dataSources: string[] = [];
      const notes: string[] = [];
      let totalRecords = 0;
      let alumiaRecordsCount = 0;
      let descubraMSRecordsCount = 0;

      // 1. Verificar Alumia (quando API estiver disponível)
      const alumiaStatus = alumiaService.getStatus();
      if (alumiaStatus.enabled && alumiaStatus.status === 'connected') {
        try {
          // Tentar buscar dados da Alumia para validar disponibilidade
          const alumiaData = await alumiaService.getAnalytics('30d');
          if (alumiaData) {
            // Contar registros baseado na estrutura retornada pela API Alumia
            alumiaRecordsCount = (alumiaData.popularDestinations?.length || 0) + 
                                 (alumiaData.popularEvents?.length || 0) + 
                                 (alumiaData.totalBookings || 0);
            totalRecords += alumiaRecordsCount;
            dataSources.push('alumia');
            notes.push(`Dados Alumia disponíveis: ${alumiaRecordsCount} registros`);
          }
        } catch (error) {
          notes.push('⚠️ Alumia API configurada mas não disponível no momento');
        }
      } else {
        notes.push('ℹ️ Alumia API ainda não configurada ou não disponível');
      }

      // 2. Verificar Descubra MS (quando implementado)
      // TODO: Implementar quando os dados do Descubra MS estiverem prontos
      // Por enquanto, não há dados do Descubra MS disponíveis
      notes.push('ℹ️ Dados do Descubra MS ainda não implementados');

      // Verificar se há dados suficientes (mínimo 10 registros agregados)
      const isValid = totalRecords >= 10;
      if (!isValid) {
        notes.push('⚠️ ATENÇÃO: Dados insuficientes no período solicitado. Mínimo de 10 registros agregados necessário.');
        notes.push('💡 Os relatórios serão gerados apenas quando houver dados da Alumia ou Descubra MS disponíveis.');
      }

      return {
        isValid,
        totalRecords,
        alumiaRecordsCount,
        descubraMSRecordsCount,
        dataSources,
        notes
      };
    } catch (error) {
      console.error('Erro ao validar disponibilidade de dados:', error);
      throw error;
    }
  }

  /**
   * Agregar dados reais (SEM mocks ou simulações)
   * APENAS Alumia (quando API disponível) e Descubra MS (quando implementado)
   */
  async aggregateRealData(
    periodStart: Date,
    periodEnd: Date,
    city?: string
  ): Promise<AggregatedData> {
    const dataSources: string[] = [];
    const startDate = format(periodStart, 'yyyy-MM-dd');
    const endDate = format(periodEnd, 'yyyy-MM-dd');

    // Inicializar estruturas de dados agregados
    const ageGroups: Record<string, number> = {};
    const gender: Record<string, number> = {};
    const origins: { states: Record<string, number>; countries: Record<string, number> } = {
      states: {},
      countries: {}
    };
    const travelPurposes: Record<string, number> = {};
    const pageViews: Record<string, number> = {};
    const searches: Record<string, number> = {};
    let totalRecords = 0;

    // 1. Buscar dados da Alumia (quando API estiver disponível)
    let alumiaData: any = null;
    const alumiaStatus = alumiaService.getStatus();
    if (alumiaStatus.enabled && alumiaStatus.status === 'connected') {
      try {
        alumiaData = await alumiaService.getAnalytics('30d');
        if (alumiaData) {
          dataSources.push('alumia');
          
          // Processar dados da Alumia conforme estrutura AlumiaAnalytics
          if (alumiaData.visitorDemographics) {
            // Faixas etárias
            if (alumiaData.visitorDemographics.byAge) {
              Object.entries(alumiaData.visitorDemographics.byAge).forEach(([age, count]: [string, any]) => {
                ageGroups[age] = (ageGroups[age] || 0) + (count || 0);
              });
            }
            // Países (origem)
            if (alumiaData.visitorDemographics.byCountry) {
              Object.entries(alumiaData.visitorDemographics.byCountry).forEach(([country, count]: [string, any]) => {
                origins.countries[country] = (origins.countries[country] || 0) + (count || 0);
              });
            }
          }
          
          // Processar destinos populares (pode conter informações de origem)
          if (alumiaData.popularDestinations && alumiaData.popularDestinations.length > 0) {
            // Os destinos já estão agregados, apenas contamos
            alumiaData.popularDestinations.forEach((dest: any) => {
              // Se houver informação de origem no destino, processar
              if (dest.originState) {
                origins.states[dest.originState] = (origins.states[dest.originState] || 0) + (dest.visitors || 0);
              }
            });
          }
          
          // Contar registros baseado na estrutura AlumiaAnalytics
          const alumiaRecords = (alumiaData.popularDestinations?.length || 0) + 
                                (alumiaData.popularEvents?.length || 0) + 
                                (alumiaData.totalBookings || 0);
          totalRecords += alumiaRecords;
        }
      } catch (error) {
        console.log('Alumia API não disponível:', error);
      }
    }

    // 2. Buscar dados do Descubra MS
    const descubraMSData = await this.fetchDescubraMSData(periodStart, periodEnd, city);
    if (descubraMSData && descubraMSData.totalRecords > 0) {
      dataSources.push('descubra_ms');
      
      // Processar demografia (faixas etárias e gênero)
      if (descubraMSData.demographics) {
        Object.entries(descubraMSData.demographics.ageGroups || {}).forEach(([age, count]: [string, any]) => {
          ageGroups[age] = (ageGroups[age] || 0) + (count || 0);
        });
        Object.entries(descubraMSData.demographics.gender || {}).forEach(([gen, count]: [string, any]) => {
          gender[gen] = (gender[gen] || 0) + (count || 0);
        });
      }
      
      // Processar origem (estados e países)
      if (descubraMSData.origins) {
        Object.entries(descubraMSData.origins.states || {}).forEach(([state, count]: [string, any]) => {
          origins.states[state] = (origins.states[state] || 0) + (count || 0);
        });
        Object.entries(descubraMSData.origins.countries || {}).forEach(([country, count]: [string, any]) => {
          origins.countries[country] = (origins.countries[country] || 0) + (count || 0);
        });
      }
      
      // Processar propósitos de viagem
      if (descubraMSData.travelPurposes) {
        Object.entries(descubraMSData.travelPurposes).forEach(([purpose, count]: [string, any]) => {
          travelPurposes[purpose] = (travelPurposes[purpose] || 0) + (count || 0);
        });
      }
      
      // Processar interações (páginas e buscas)
      if (descubraMSData.interactions) {
        Object.entries(descubraMSData.interactions.pageViews || {}).forEach(([page, views]: [string, any]) => {
          pageViews[page] = (pageViews[page] || 0) + (views || 0);
        });
        Object.entries(descubraMSData.interactions.searches || {}).forEach(([search, count]: [string, any]) => {
          searches[search] = (searches[search] || 0) + (count || 0);
        });
      }
      
      totalRecords += descubraMSData.totalRecords || 0;
    }

    // Top páginas (se houver dados de interações)
    const topPages = Object.entries(pageViews)
      .map(([page, views]) => ({ page, views: views as number }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Top buscas (se houver dados de buscas)
    const topSearches = Object.entries(searches)
      .map(([search, count]) => ({ search, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      demographics: {
        ageGroups,
        gender
      },
      origins: {
        states: origins.states,
        countries: origins.countries
      },
      travelPurposes,
      interactions: {
        topPages,
        topSearches,
        totalInteractions: topPages.reduce((sum, p) => sum + p.views, 0) + topSearches.reduce((sum, s) => sum + s.count, 0)
      },
      surveys: {
        totalSurveys: 0,
        byOrigin: {},
        byMotivation: {},
        byQuestionType: {}
      },
      alumia: alumiaStatus.enabled ? {
        available: true,
        data: alumiaData,
        note: 'Dados da plataforma Alumia integrados'
      } : {
        available: false,
        note: 'Integração com Alumia ainda não disponível (API em desenvolvimento)'
      },
      metadata: {
        periodStart: startDate,
        periodEnd: endDate,
        totalRecords,
        dataSources,
        generatedAt: new Date().toISOString(),
        validationStatus: totalRecords >= 10 ? 'valid' : 'insufficient'
      }
    };
  }

  /**
   * Buscar dados do Descubra MS
   * Apenas dados de usuários que finalizaram cadastro e têm consentimento
   */
  private async fetchDescubraMSData(
    periodStart: Date,
    periodEnd: Date,
    city?: string
  ): Promise<{
    totalRecords: number;
    demographics?: { ageGroups: Record<string, number>; gender: Record<string, number> };
    origins?: { states: Record<string, number>; countries: Record<string, number> };
    travelPurposes?: Record<string, number>;
    interactions?: { pageViews: Record<string, number>; searches: Record<string, number> };
  } | null> {
    try {
      const startDate = format(periodStart, 'yyyy-MM-dd');
      const endDate = format(periodEnd, 'yyyy-MM-dd');
      
      // 1. Buscar perfis completados com consentimento
      // Apenas usuários que finalizaram cadastro (têm user_type) e têm consentimento ativo
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select(`
          user_id,
          user_type,
          birth_date,
          gender,
          country,
          state,
          city,
          travel_motives,
          created_at
        `)
        .not('user_type', 'is', null) // Apenas perfis completados
        .gte('created_at', `${startDate}T00:00:00Z`)
        .lte('created_at', `${endDate}T23:59:59Z`);

      if (profilesError) {
        console.error('Erro ao buscar perfis:', profilesError);
        return null;
      }

      if (!profiles || profiles.length === 0) {
        return null;
      }

      // 2. Filtrar apenas usuários com consentimento ativo
      const userIds = profiles.map(p => p.user_id);
      // Query direta usando SQL (data_sharing_consents pode não estar no types.ts)
      const { data: directConsents, error: consentsError } = await supabase
        .from('data_sharing_consents' as any)
        .select('user_id')
        .in('user_id', userIds)
        .eq('consent_given', true)
        .is('revoked_at', null);
      
      if (consentsError) {
        console.error('Erro ao buscar consentimentos:', consentsError);
        return null;
      }
      
      const consentedUserIds = new Set(directConsents?.map((c: any) => c.user_id) || []);
      const consentedProfiles = profiles.filter(p => consentedUserIds.has(p.user_id));

      if (consentedProfiles.length === 0) {
        return null;
      }

      // 3. Agregar dados demográficos
      const ageGroups: Record<string, number> = {};
      const gender: Record<string, number> = {};
      const origins: { states: Record<string, number>; countries: Record<string, number> } = {
        states: {},
        countries: {}
      };
      const travelPurposes: Record<string, number> = {};

      consentedProfiles.forEach(profile => {
        // Calcular faixa etária
        if (profile.birth_date) {
          const birthDate = new Date(profile.birth_date);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          const ageGroup = this.calculateAgeGroup(age);
          ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + 1;
        }

        // Gênero
        if (profile.gender) {
          gender[profile.gender] = (gender[profile.gender] || 0) + 1;
        }

        // Origem (apenas para turistas)
        if (profile.user_type === 'turista' || profile.user_type === 'tourist') {
          if (profile.state) {
            origins.states[profile.state] = (origins.states[profile.state] || 0) + 1;
          }
          if (profile.country) {
            origins.countries[profile.country] = (origins.countries[profile.country] || 0) + 1;
          }
        }

        // Propósitos de viagem (apenas para turistas)
        if ((profile.user_type === 'turista' || profile.user_type === 'tourist') && profile.travel_motives) {
          profile.travel_motives.forEach(motive => {
            if (motive) {
              travelPurposes[motive] = (travelPurposes[motive] || 0) + 1;
            }
          });
        }
      });

      // 4. Buscar interações dos usuários com consentimento
      const { data: interactions, error: interactionsError } = await supabase
        .from('user_interactions')
        .select('interaction_type, page_url, metadata, created_at')
        .in('user_id', Array.from(consentedUserIds))
        .gte('created_at', `${startDate}T00:00:00Z`)
        .lte('created_at', `${endDate}T23:59:59Z`);

      if (interactionsError) {
        console.error('Erro ao buscar interações:', interactionsError);
      }

      const pageViews: Record<string, number> = {};
      const searches: Record<string, number> = {};

      if (interactions && Array.isArray(interactions)) {
        (interactions as any[]).forEach((interaction: any) => {
          // Contar visualizações de páginas principais
          if (interaction.interaction_type === 'page_view' && interaction.page_url) {
            const page = this.normalizePagePath(interaction.page_url);
            if (page) {
              pageViews[page] = (pageViews[page] || 0) + 1;
            }
          }

          // Contar buscas
          if (interaction.interaction_type === 'search' && interaction.metadata) {
            const searchQuery = (interaction.metadata as any)?.search_query || 
                               (interaction.metadata as any)?.query;
            if (searchQuery && typeof searchQuery === 'string') {
              const normalizedSearch = searchQuery.toLowerCase().trim();
              if (normalizedSearch) {
                searches[normalizedSearch] = (searches[normalizedSearch] || 0) + 1;
              }
            }
          }
        });
      }

      return {
        totalRecords: consentedProfiles.length,
        demographics: {
          ageGroups,
          gender
        },
        origins: {
          states: origins.states,
          countries: origins.countries
        },
        travelPurposes,
        interactions: {
          pageViews,
          searches
        }
      };
    } catch (error) {
      console.error('Erro ao buscar dados Descubra MS:', error);
      return null;
    }
  }

  /**
   * Calcular faixa etária baseado na idade
   */
  private calculateAgeGroup(age: number): string {
    if (age < 18) return 'Menor de 18';
    if (age < 26) return '18-25';
    if (age < 36) return '26-35';
    if (age < 46) return '36-45';
    if (age < 56) return '46-55';
    if (age < 66) return '56-65';
    return 'Acima de 65';
  }

  /**
   * Normalizar caminho da página para agrupamento
   */
  private normalizePagePath(path: string): string | null {
    if (!path) return null;
    
    // Normalizar menus principais do Descubra MS
    if (path.includes('/eventos')) return '/eventos';
    if (path.includes('/parceiros')) return '/parceiros';
    if (path.includes('/mapa') || path.includes('mapa-turistico')) return '/mapa-turistico';
    if (path.includes('/guata') || path.includes('/chat')) return '/guata-ia';
    if (path.includes('/passaporte')) return '/passaporte';
    if (path.includes('/sobre')) return '/sobre';
    if (path.includes('/descubrams')) return '/descubrams';
    
    // Se não for uma página principal conhecida, retornar null
    return null;
  }

  /**
   * Carregar logo para o PDF
   */
  private async loadLogo(): Promise<string | null> {
    try {
      const logoUrl = '/images/logo-viajartur.png';
      const response = await fetch(logoUrl);
      
      if (!response.ok) {
        console.warn('Logo não encontrada, continuando sem logo');
        return null;
      }

      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Erro ao carregar logo:', error);
      return null;
    }
  }

  /**
   * Gerar relatório explicativo (PDF)
   */
  async generateExplanatoryReport(
    request: DataSaleRequest,
    aggregatedData: AggregatedData
  ): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = margin;

    // Carregar e adicionar logo
    const logoData = await this.loadLogo();
    if (logoData) {
      try {
        // Adicionar logo no topo centralizado
        // Logo com 80px de largura, altura proporcional
        const logoWidth = 80;
        const logoHeight = (logoWidth * 0.3); // Proporção aproximada
        const logoX = (pageWidth - logoWidth) / 2;
        doc.addImage(logoData, 'PNG', logoX, yPosition, logoWidth, logoHeight);
        yPosition += logoHeight + 10;
      } catch (error) {
        console.warn('Erro ao adicionar logo no PDF:', error);
      }
    }

    // Cabeçalho
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text('Relatório de Dados de Turismo', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Período: ${format(new Date(aggregatedData.metadata.periodStart), 'dd/MM/yyyy', { locale: ptBR })} a ${format(new Date(aggregatedData.metadata.periodEnd), 'dd/MM/yyyy', { locale: ptBR })}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    if (request.requester_city) {
      doc.setFontSize(12);
      doc.text(`Região: ${request.requester_city}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
    }

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    );
    yPosition += 15;

    // Aviso importante sobre dados reais
    doc.setFontSize(11);
    doc.setTextColor(34, 197, 94);
    doc.text('✓ Dados Reais e Verificados', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('Este relatório contém APENAS dados reais coletados da plataforma, sem simulações ou dados mockados.', margin, yPosition, { maxWidth: pageWidth - 2 * margin });
    yPosition += 10;

    // Resumo executivo
    doc.setFontSize(12);
    doc.setTextColor(59, 130, 246);
    doc.text('1. RESUMO EXECUTIVO', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total de registros agregados: ${aggregatedData.metadata.totalRecords}`, margin + 5, yPosition);
    yPosition += 6;
    doc.text(`Fontes de dados: ${aggregatedData.metadata.dataSources.join(', ')}`, margin + 5, yPosition);
    yPosition += 10;

    // Perfil demográfico
    if (Object.keys(aggregatedData.demographics.ageGroups).length > 0) {
      yPosition = this.addSection(doc, '2. PERFIL DEMOGRÁFICO', yPosition, pageWidth, margin);
      yPosition = this.addTable(doc, 'Faixa Etária', aggregatedData.demographics.ageGroups, yPosition, pageWidth, margin);
    }

    // Origem dos visitantes
    if (Object.keys(aggregatedData.origins.states).length > 0) {
      yPosition = this.addSection(doc, '3. ORIGEM DOS VISITANTES', yPosition, pageWidth, margin);
      yPosition = this.addTable(doc, 'Estados', aggregatedData.origins.states, yPosition, pageWidth, margin);
    }

    // Propósito de viagem
    if (Object.keys(aggregatedData.travelPurposes).length > 0) {
      yPosition = this.addSection(doc, '4. PROPÓSITO DE VIAGEM', yPosition, pageWidth, margin);
      yPosition = this.addTable(doc, 'Propósito', aggregatedData.travelPurposes, yPosition, pageWidth, margin);
    }

    // Interações
    if (aggregatedData.interactions.totalInteractions > 0) {
      yPosition = this.addSection(doc, '5. INTERAÇÕES NA PLATAFORMA', yPosition, pageWidth, margin);
      doc.setFontSize(10);
      doc.text(`Total de interações: ${aggregatedData.interactions.totalInteractions}`, margin + 5, yPosition);
      yPosition += 10;
    }

    // Pesquisas (removido - não faz parte das fontes de dados)

    // Alumia
    if (aggregatedData.alumia) {
      yPosition = this.addSection(doc, '7. DADOS ALUMIA', yPosition, pageWidth, margin);
      doc.setFontSize(10);
      doc.text(aggregatedData.alumia.note || '', margin + 5, yPosition, { maxWidth: pageWidth - 2 * margin });
      yPosition += 10;
    }

    // Metodologia e LGPD
    yPosition = this.addSection(doc, '8. METODOLOGIA E CONFORMIDADE LGPD', yPosition, pageWidth, margin);
    doc.setFontSize(9);
    const methodology = [
      '• Dados agregados e anonimizados (sem identificação pessoal)',
      '• Apenas dados com consentimento explícito dos usuários',
      '• Fontes verificadas: ' + aggregatedData.metadata.dataSources.join(', '),
      '• Total de registros reais: ' + aggregatedData.metadata.totalRecords,
      '• Período: ' + format(new Date(aggregatedData.metadata.periodStart), 'dd/MM/yyyy', { locale: ptBR }) + ' a ' + format(new Date(aggregatedData.metadata.periodEnd), 'dd/MM/yyyy', { locale: ptBR })
    ];
    methodology.forEach(line => {
      doc.text(line, margin + 5, yPosition, { maxWidth: pageWidth - 2 * margin });
      yPosition += 5;
    });

    // Rodapé com logo em todas as páginas
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const pageHeight = doc.internal.pageSize.height;
      
      // Linha separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
      
      // Logo pequena no rodapé
      const logoData = await this.loadLogo();
      if (logoData) {
        try {
          const logoWidth = 30;
          const logoHeight = 9;
          doc.addImage(logoData, 'PNG', margin, pageHeight - 20, logoWidth, logoHeight);
        } catch (error) {
          // Ignorar erro
        }
      }
      
      // Texto do rodapé
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `ViajARTur - Dados Reais e Verificados | Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 15,
        { align: 'center' }
      );
    }

    return doc.output('blob');
  }

  private addSection(doc: jsPDF, title: string, yPosition: number, pageWidth: number, margin: number): number {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = margin;
      // Adicionar logo também nas páginas seguintes (menor, no canto)
      this.addPageLogo(doc, pageWidth, margin).catch(() => {});
    }
    doc.setFontSize(12);
    doc.setTextColor(59, 130, 246);
    doc.text(title, margin, yPosition);
    return yPosition + 8;
  }

  /**
   * Adicionar logo menor nas páginas seguintes
   */
  private async addPageLogo(doc: jsPDF, pageWidth: number, margin: number): Promise<void> {
    const logoData = await this.loadLogo();
    if (logoData) {
      try {
        const logoWidth = 40;
        const logoHeight = 12;
        doc.addImage(logoData, 'PNG', pageWidth - margin - logoWidth, margin, logoWidth, logoHeight);
      } catch (error) {
        // Ignorar erro silenciosamente
      }
    }
  }

  private addTable(doc: jsPDF, label: string, data: Record<string, number>, yPosition: number, pageWidth: number, margin: number): number {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = margin;
    }

    const entries = Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    if (entries.length === 0) return yPosition;

    const tableData = entries.map(([key, value]) => [key, value.toString()]);
    (doc as any).autoTable({
      head: [[label, 'Quantidade']],
      body: tableData,
      startY: yPosition,
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 }
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  /**
   * Gerar dados brutos (Excel)
   */
  async generateRawData(aggregatedData: AggregatedData): Promise<Blob> {
    const workbook = XLSX.utils.book_new();

    // Aba 1: Demografia
    if (Object.keys(aggregatedData.demographics.ageGroups).length > 0 || 
        Object.keys(aggregatedData.demographics.gender).length > 0) {
      const demoData: any[] = [];
      
      // Faixas etárias
      if (Object.keys(aggregatedData.demographics.ageGroups).length > 0) {
        demoData.push(['Faixa Etária', 'Quantidade']);
        Object.entries(aggregatedData.demographics.ageGroups).forEach(([age, count]) => {
          demoData.push([age, count]);
        });
        demoData.push([]); // Linha em branco
      }
      
      // Gênero
      if (Object.keys(aggregatedData.demographics.gender).length > 0) {
        demoData.push(['Gênero', 'Quantidade']);
        Object.entries(aggregatedData.demographics.gender).forEach(([gender, count]) => {
          demoData.push([gender, count]);
        });
      }
      
      const demoSheet = XLSX.utils.aoa_to_sheet(demoData);
      XLSX.utils.book_append_sheet(workbook, demoSheet, 'Demografia');
    }

    // Aba 2: Origem
    if (Object.keys(aggregatedData.origins.states).length > 0 || 
        Object.keys(aggregatedData.origins.countries).length > 0) {
      const originData: any[] = [['Tipo', 'Local', 'Quantidade']];
      
      Object.entries(aggregatedData.origins.states).forEach(([state, count]) => {
        originData.push(['Estado', state, count]);
      });
      
      Object.entries(aggregatedData.origins.countries).forEach(([country, count]) => {
        originData.push(['País', country, count]);
      });
      
      const originSheet = XLSX.utils.aoa_to_sheet(originData);
      XLSX.utils.book_append_sheet(workbook, originSheet, 'Origem');
    }

    // Aba 3: Propósito de Viagem
    if (Object.keys(aggregatedData.travelPurposes).length > 0) {
      const purposeData: any[] = [['Propósito', 'Quantidade']];
      Object.entries(aggregatedData.travelPurposes).forEach(([purpose, count]) => {
        purposeData.push([purpose, count]);
      });
      
      const purposeSheet = XLSX.utils.aoa_to_sheet(purposeData);
      XLSX.utils.book_append_sheet(workbook, purposeSheet, 'Propósito');
    }

    // Aba 4: Interações
    if (aggregatedData.interactions.totalInteractions > 0) {
      const interactionData: any[] = [
        ['Total de Interações', aggregatedData.interactions.totalInteractions],
        [],
        ['Página', 'Visualizações']
      ];
      
      aggregatedData.interactions.topPages.forEach(page => {
        interactionData.push([page.page, page.views]);
      });
      
      if (aggregatedData.interactions.topSearches.length > 0) {
        interactionData.push([]);
        interactionData.push(['Busca', 'Quantidade']);
        aggregatedData.interactions.topSearches.forEach(search => {
          interactionData.push([search.search, search.count]);
        });
      }
      
      const interactionSheet = XLSX.utils.aoa_to_sheet(interactionData);
      XLSX.utils.book_append_sheet(workbook, interactionSheet, 'Interações');
    }

    // Aba 5: Pesquisas (removido - não faz parte das fontes de dados)

    // Aba 6: Metadados
    const metadataData: any[] = [
      ['Campo', 'Valor'],
      ['Período Inicial', aggregatedData.metadata.periodStart],
      ['Período Final', aggregatedData.metadata.periodEnd],
      ['Total de Registros', aggregatedData.metadata.totalRecords],
      ['Fontes de Dados', aggregatedData.metadata.dataSources.join(', ')],
      ['Status de Validação', aggregatedData.metadata.validationStatus],
      ['Gerado em', aggregatedData.metadata.generatedAt]
    ];
    
    const metadataSheet = XLSX.utils.aoa_to_sheet(metadataData);
    XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadados');

    // Converter para buffer
    const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  /**
   * Upload de arquivo para Supabase Storage
   */
  async uploadToStorage(
    file: Blob,
    fileName: string,
    requestId: string
  ): Promise<string> {
    try {
      const BUCKET_NAME = 'data-sale-reports';
      const filePath = `${requestId}/${fileName}`;

      // Upload para Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Permitir sobrescrever se já existir
          contentType: file.type
        });

      if (uploadError) {
        // Se o bucket não existir, tentar criar (requer permissões admin)
        if (uploadError.message.includes('Bucket not found')) {
          console.warn('Bucket não encontrado. Certifique-se de que o bucket "data-sale-reports" existe no Supabase Storage.');
        }
        throw uploadError;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload para Storage:', error);
      throw error;
    }
  }

  /**
   * Gerar e fazer upload de relatórios
   */
  async generateAndUploadReports(
    request: DataSaleRequest,
    aggregatedData: AggregatedData
  ): Promise<{ reportUrl?: string; rawDataUrl?: string }> {
    const results: { reportUrl?: string; rawDataUrl?: string } = {};

    try {
      // Gerar PDF (se necessário)
      if (request.report_type === 'explanatory' || request.report_type === 'both') {
        const pdfBlob = await this.generateExplanatoryReport(request, aggregatedData);
        const pdfFileName = `relatorio_tratado_${request.id}_${Date.now()}.pdf`;
        const pdfUrl = await this.uploadToStorage(pdfBlob, pdfFileName, request.id);
        results.reportUrl = pdfUrl;
      }

      // Gerar Excel (se necessário)
      if (request.report_type === 'raw_data' || request.report_type === 'both') {
        const excelBlob = await this.generateRawData(aggregatedData);
        const excelFileName = `dados_brutos_${request.id}_${Date.now()}.xlsx`;
        const excelUrl = await this.uploadToStorage(excelBlob, excelFileName, request.id);
        results.rawDataUrl = excelUrl;
      }

      return results;
    } catch (error) {
      console.error('Erro ao gerar e fazer upload de relatórios:', error);
      throw error;
    }
  }
}

export const dataSaleReportService = new DataSaleReportService();


