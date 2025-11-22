/**
 * Profile AI Service
 * Serviço de IA para preenchimento automático de perfil de negócio turístico
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface ProfileAutoFillData {
  description?: string;
  shortDescription?: string;
  services?: string[];
  amenities?: string[];
  openingHours?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  tags?: string[];
}

export class ProfileAIService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
  }

  /**
   * Preencher perfil automaticamente baseado em informações básicas
   */
  async autoFillProfile(
    companyName: string,
    category: string,
    cnpj?: string,
    location?: { city?: string; state?: string; address?: string }
  ): Promise<ProfileAutoFillData> {
    try {
      if (!this.genAI) {
        console.warn('Gemini API não configurada, retornando dados básicos');
        return this.getBasicAutoFill(companyName, category);
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const locationStr = location 
        ? `${location.address || ''}, ${location.city || ''}, ${location.state || ''}`.trim()
        : '';

      const prompt = `
Você é um assistente especializado em turismo brasileiro. Com base nas informações fornecidas, preencha os dados do perfil do negócio turístico.

Nome da Empresa: ${companyName}
Categoria: ${category}
${cnpj ? `CNPJ: ${cnpj}` : ''}
${locationStr ? `Localização: ${locationStr}` : ''}

Forneça uma resposta em JSON com os seguintes campos:
{
  "description": "Descrição detalhada e atrativa do negócio (3-5 parágrafos)",
  "shortDescription": "Descrição curta e impactante (máximo 200 caracteres)",
  "services": ["serviço1", "serviço2", "serviço3"],
  "amenities": ["comodidade1", "comodidade2", "comodidade3"],
  "openingHours": "Horário de funcionamento em formato legível (ex: Segunda a Sexta: 08:00 às 18:00)",
  "contactPhone": "Telefone formatado se inferível",
  "contactEmail": "Email se inferível",
  "website": "Site se inferível",
  "tags": ["tag1", "tag2", "tag3"]
}

Seja específico e baseado em conhecimento real sobre turismo no Brasil, especialmente Mato Grosso do Sul.
Para ${category}, considere os serviços e comodidades típicos desse tipo de negócio.
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Tentar extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          description: parsed.description || '',
          shortDescription: parsed.shortDescription || '',
          services: parsed.services || [],
          amenities: parsed.amenities || [],
          openingHours: parsed.openingHours || '',
          contactPhone: parsed.contactPhone || '',
          contactEmail: parsed.contactEmail || '',
          website: parsed.website || '',
          tags: parsed.tags || [],
        };
      }

      return this.getBasicAutoFill(companyName, category);
    } catch (error) {
      console.error('Erro ao preencher perfil automaticamente com IA:', error);
      return this.getBasicAutoFill(companyName, category);
    }
  }

  /**
   * Fallback básico sem IA
   */
  private getBasicAutoFill(companyName: string, category: string): ProfileAutoFillData {
    const categoryServices: Record<string, string[]> = {
      hotel: ['Hospedagem', 'Café da manhã', 'Recepção 24h', 'Limpeza diária'],
      pousada: ['Hospedagem', 'Café da manhã caseiro', 'Ambiente familiar'],
      restaurante: ['Almoço', 'Jantar', 'Delivery', 'Reservas'],
      agencia: ['Pacotes turísticos', 'Guias', 'Transporte', 'Reservas'],
    };

    const categoryAmenities: Record<string, string[]> = {
      hotel: ['Wi-Fi', 'Ar condicionado', 'TV', 'Estacionamento', 'Café da manhã'],
      pousada: ['Wi-Fi', 'Estacionamento', 'Café da manhã', 'Ambiente familiar'],
      restaurante: ['Wi-Fi', 'Estacionamento', 'Acessibilidade', 'Ar condicionado'],
      agencia: ['Atendimento presencial', 'Atendimento online', 'Consultoria'],
    };

    return {
      description: `${companyName} é um estabelecimento do setor de ${category}, comprometido em oferecer serviços de qualidade para seus clientes.`,
      shortDescription: `Conheça ${companyName}, seu destino ideal para ${category}.`,
      services: categoryServices[category] || ['Serviços turísticos'],
      amenities: categoryAmenities[category] || ['Atendimento de qualidade'],
      openingHours: 'Segunda a Sexta: 08:00 às 18:00',
      tags: [category, 'turismo'],
    };
  }
}

export const profileAIService = new ProfileAIService();

