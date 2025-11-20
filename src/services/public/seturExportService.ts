/**
 * SeTur Export Service
 * Serviço para exportar dados do inventário turístico em formato SeTur oficial
 */

import { TourismAttraction } from './inventoryService';
import { inventoryService } from './inventoryService';

export interface SeTurExport {
  format: 'xml' | 'json';
  content: string;
  filename: string;
  mimeType: string;
}

export interface SeTurReport {
  municipality: string;
  state: string;
  generatedAt: string;
  totalItems: number;
  byCategory: Record<string, number>;
  completenessAverage: number;
  complianceAverage: number;
  summary: string;
}

export class SeTurExportService {
  /**
   * Exportar inventário para formato SeTur (XML ou JSON)
   */
  async exportToSeTurFormat(
    inventory: TourismAttraction[],
    format: 'xml' | 'json' = 'json'
  ): Promise<SeTurExport> {
    try {
      if (format === 'xml') {
        return this.exportToXML(inventory);
      } else {
        return this.exportToJSON(inventory);
      }
    } catch (error) {
      console.error('Erro ao exportar para formato SeTur:', error);
      throw error;
    }
  }

  /**
   * Exportar para JSON (formato SeTur)
   */
  private exportToJSON(inventory: TourismAttraction[]): SeTurExport {
    const data = {
      versao: '1.0',
      data_exportacao: new Date().toISOString(),
      origem: 'ViaJAR - Sistema de Gestão Turística',
      municipio: this.extractMunicipality(inventory),
      estado: this.extractState(inventory),
      total_itens: inventory.length,
      itens: inventory.map(item => this.mapToSeTurFormat(item)),
    };

    const content = JSON.stringify(data, null, 2);
    const filename = `setur_export_${new Date().toISOString().split('T')[0]}.json`;

    return {
      format: 'json',
      content,
      filename,
      mimeType: 'application/json',
    };
  }

  /**
   * Exportar para XML (formato SeTur)
   */
  private exportToXML(inventory: TourismAttraction[]): SeTurExport {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const root = 'inventario_turistico';
    
    let xml = xmlHeader + '\n';
    xml += `<${root} versao="1.0" data_exportacao="${new Date().toISOString()}">\n`;
    xml += `  <origem>ViaJAR - Sistema de Gestão Turística</origem>\n`;
    xml += `  <municipio>${this.escapeXML(this.extractMunicipality(inventory))}</municipio>\n`;
    xml += `  <estado>${this.escapeXML(this.extractState(inventory))}</estado>\n`;
    xml += `  <total_itens>${inventory.length}</total_itens>\n`;
    xml += `  <itens>\n`;

    for (const item of inventory) {
      xml += this.itemToXML(item, 4);
    }

    xml += `  </itens>\n`;
    xml += `</${root}>`;

    const filename = `setur_export_${new Date().toISOString().split('T')[0]}.xml`;

    return {
      format: 'xml',
      content: xml,
      filename,
      mimeType: 'application/xml',
    };
  }

  /**
   * Converter item para formato SeTur
   */
  private mapToSeTurFormat(item: TourismAttraction): any {
    const seturItem: any = {
      codigo_setur: (item as any).setur_code || null,
      nome: item.name,
      descricao: item.description,
      descricao_curta: item.short_description || null,
      categoria: {
        codigo: (item as any).setur_category_code || null,
        id: item.category_id || null,
      },
      localizacao: {
        endereco: item.address || null,
        cidade: item.city || null,
        estado: item.state || null,
        pais: item.country || 'BR',
        cep: item.postal_code || null,
        coordenadas: {
          latitude: item.latitude || null,
          longitude: item.longitude || null,
        },
      },
      contato: {
        telefone: item.phone || null,
        email: item.email || null,
        website: item.website || null,
      },
      informacoes_negocio: {
        horario_funcionamento: item.opening_hours || null,
        faixa_preco: item.price_range || null,
        capacidade: item.capacity || null,
        comodidades: item.amenities || [],
      },
      midia: {
        imagens: item.images || [],
        videos: item.videos || [],
      },
      seo: {
        meta_titulo: item.meta_title || null,
        meta_descricao: item.meta_description || null,
        tags: item.tags || [],
      },
      status: {
        status: item.status || 'draft',
        ativo: item.is_active !== undefined ? item.is_active : true,
        destaque: item.is_featured || false,
      },
    };

    // Adicionar campos SeTur se existirem
    if ((item as any).legal_name) {
      seturItem.razao_social = (item as any).legal_name;
    }
    if ((item as any).registration_number) {
      seturItem.numero_registro = (item as any).registration_number;
    }
    if ((item as any).license_number) {
      seturItem.numero_licenca = (item as any).license_number;
    }
    if ((item as any).license_expiry_date) {
      seturItem.validade_licenca = (item as any).license_expiry_date;
    }
    if ((item as any).responsible_name) {
      seturItem.responsavel = {
        nome: (item as any).responsible_name,
        cpf: (item as any).responsible_cpf || null,
        email: (item as any).responsible_email || null,
        telefone: (item as any).responsible_phone || null,
      };
    }
    if ((item as any).accessibility_features) {
      seturItem.acessibilidade = (item as any).accessibility_features;
    }
    if ((item as any).capacity_details) {
      seturItem.detalhes_capacidade = (item as any).capacity_details;
    }
    if ((item as any).payment_methods) {
      seturItem.formas_pagamento = (item as any).payment_methods;
    }
    if ((item as any).languages_spoken) {
      seturItem.idiomas = (item as any).languages_spoken;
    }
    if ((item as any).certifications) {
      seturItem.certificacoes = (item as any).certifications;
    }
    if ((item as any).data_completeness_score !== undefined) {
      seturItem.score_completude = (item as any).data_completeness_score;
    }
    if ((item as any).setur_compliance_score !== undefined) {
      seturItem.score_conformidade = (item as any).setur_compliance_score;
    }
    if ((item as any).last_verified_date) {
      seturItem.ultima_verificacao = (item as any).last_verified_date;
    }
    if ((item as any).verification_status) {
      seturItem.status_verificacao = (item as any).verification_status;
    }

    return seturItem;
  }

  /**
   * Converter item para XML
   */
  private itemToXML(item: TourismAttraction, indent: number): string {
    const spaces = ' '.repeat(indent);
    const seturItem = this.mapToSeTurFormat(item);
    
    let xml = `${spaces}<item>\n`;
    xml += `${spaces}  <codigo_setur>${this.escapeXML(seturItem.codigo_setur || '')}</codigo_setur>\n`;
    xml += `${spaces}  <nome>${this.escapeXML(seturItem.nome)}</nome>\n`;
    xml += `${spaces}  <descricao>${this.escapeXML(seturItem.descricao || '')}</descricao>\n`;
    
    if (seturItem.localizacao) {
      xml += `${spaces}  <localizacao>\n`;
      xml += `${spaces}    <endereco>${this.escapeXML(seturItem.localizacao.endereco || '')}</endereco>\n`;
      xml += `${spaces}    <cidade>${this.escapeXML(seturItem.localizacao.cidade || '')}</cidade>\n`;
      xml += `${spaces}    <estado>${this.escapeXML(seturItem.localizacao.estado || '')}</estado>\n`;
      if (seturItem.localizacao.coordenadas) {
        xml += `${spaces}    <coordenadas>\n`;
        xml += `${spaces}      <latitude>${seturItem.localizacao.coordenadas.latitude || ''}</latitude>\n`;
        xml += `${spaces}      <longitude>${seturItem.localizacao.coordenadas.longitude || ''}</longitude>\n`;
        xml += `${spaces}    </coordenadas>\n`;
      }
      xml += `${spaces}  </localizacao>\n`;
    }
    
    if (seturItem.contato) {
      xml += `${spaces}  <contato>\n`;
      xml += `${spaces}    <telefone>${this.escapeXML(seturItem.contato.telefone || '')}</telefone>\n`;
      xml += `${spaces}    <email>${this.escapeXML(seturItem.contato.email || '')}</email>\n`;
      xml += `${spaces}  </contato>\n`;
    }
    
    xml += `${spaces}</item>\n`;
    
    return xml;
  }

  /**
   * Escapar caracteres XML
   */
  private escapeXML(str: string | null | undefined): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Extrair município dos itens
   */
  private extractMunicipality(inventory: TourismAttraction[]): string {
    if (inventory.length === 0) return '';
    const cities = inventory.map(item => item.city).filter(Boolean);
    const uniqueCities = [...new Set(cities)];
    return uniqueCities.length === 1 ? uniqueCities[0] : 'Múltiplos';
  }

  /**
   * Extrair estado dos itens
   */
  private extractState(inventory: TourismAttraction[]): string {
    if (inventory.length === 0) return '';
    const states = inventory.map(item => item.state).filter(Boolean);
    const uniqueStates = [...new Set(states)];
    return uniqueStates.length === 1 ? uniqueStates[0] : 'Múltiplos';
  }

  /**
   * Gerar relatório SeTur
   */
  async generateSeTurReport(municipalityId?: string): Promise<SeTurReport> {
    try {
      // Buscar inventário
      const filters: any = {};
      if (municipalityId) {
        // Se tiver filtro por município, aplicar aqui
        // Por enquanto, buscar todos os itens ativos
      }
      
      const inventory = await inventoryService.getAttractions({
        is_active: true,
        ...filters,
      });

      // Calcular estatísticas
      const byCategory: Record<string, number> = {};
      let totalCompleteness = 0;
      let totalCompliance = 0;
      let validScores = 0;

      for (const item of inventory) {
        // Contar por categoria
        const category = item.category_id || 'outros';
        byCategory[category] = (byCategory[category] || 0) + 1;

        // Somar scores
        if ((item as any).data_completeness_score !== undefined) {
          totalCompleteness += (item as any).data_completeness_score;
          validScores++;
        }
        if ((item as any).setur_compliance_score !== undefined) {
          totalCompliance += (item as any).setur_compliance_score;
        }
      }

      const completenessAverage = validScores > 0 
        ? Math.round(totalCompleteness / validScores) 
        : 0;
      const complianceAverage = validScores > 0 
        ? Math.round(totalCompliance / validScores) 
        : 0;

      // Gerar resumo
      const summary = this.generateSummary(inventory, byCategory, completenessAverage, complianceAverage);

      return {
        municipality: this.extractMunicipality(inventory),
        state: this.extractState(inventory),
        generatedAt: new Date().toISOString(),
        totalItems: inventory.length,
        byCategory,
        completenessAverage,
        complianceAverage,
        summary,
      };
    } catch (error) {
      console.error('Erro ao gerar relatório SeTur:', error);
      throw error;
    }
  }

  /**
   * Gerar resumo textual do relatório
   */
  private generateSummary(
    inventory: TourismAttraction[],
    byCategory: Record<string, number>,
    completenessAverage: number,
    complianceAverage: number
  ): string {
    let summary = `Relatório do Inventário Turístico - ${this.extractMunicipality(inventory)}, ${this.extractState(inventory)}\n\n`;
    summary += `Total de itens cadastrados: ${inventory.length}\n\n`;
    
    summary += `Distribuição por categoria:\n`;
    for (const [category, count] of Object.entries(byCategory)) {
      summary += `  - ${category}: ${count} itens\n`;
    }
    
    summary += `\nScore médio de completude: ${completenessAverage}%\n`;
    summary += `Score médio de conformidade SeTur: ${complianceAverage}%\n`;
    
    if (completenessAverage < 70) {
      summary += `\n⚠️ Atenção: Score de completude abaixo do recomendado (70%). Considere revisar os dados cadastrados.`;
    }
    
    if (complianceAverage < 80) {
      summary += `\n⚠️ Atenção: Score de conformidade SeTur abaixo do recomendado (80%). Verifique se todos os campos obrigatórios estão preenchidos.`;
    }

    return summary;
  }
}

export const seturExportService = new SeTurExportService();

