import { generateContent } from '@/config/gemini';
import { supabase } from '@/integrations/supabase/client';
import { UserProfileData } from '@/hooks/useUserProfile';
import { GoogleSearchAPI } from '@/services/ai/search/googleSearchAPI';

/**
 * Interface para dados de entrada do roteiro
 */
export interface RouteGenerationInput {
  cidade: string;
  datas?: string;
  duracao: string;
  interesses: string[];
  orcamento: 'baixo' | 'médio' | 'alto' | string;
  hospedagem: string;
  perfil: 'solo' | 'casal' | 'família' | 'grupo' | string;
  ocasiao: string;
  userProfile?: UserProfileData | null;
}

/**
 * Interface para o roteiro gerado
 */
export interface GeneratedRoute {
  resumo: {
    cidade: string;
    duracao: string;
    interesses: string[];
    hospedagem: string;
    perfil: string;
    orcamento: string;
  };
  dias: Array<{
    titulo: string;
    data?: string;
    atividades: string[];
    descricao?: string;
    parceiros_sugeridos?: string[];
  }>;
  eventos: Array<{
    nome: string;
    data: string;
    local?: string;
    descricao?: string;
  }>;
  parceiros: Array<{
    id: string;
    nome: string;
    tipo: string;
    endereco?: string;
    descricao?: string;
  }>;
  passaporte?: {
    match: boolean;
    rota?: string;
    descricao?: string;
  };
  dicas?: string[];
  estimativa_custo?: {
    minimo: number;
    maximo: number;
    moeda: string;
  };
}

/**
 * Serviço para gerar roteiros personalizados com IA
 */
export class IARouteService {
  private googleSearch: GoogleSearchAPI;

  constructor() {
    this.googleSearch = new GoogleSearchAPI();
  }
  /**
   * Busca parceiros relevantes para o roteiro
   */
  private async fetchRelevantPartners(
    cidade: string,
    interesses: string[]
  ): Promise<any[]> {
    try {
      // Mapear interesses para tipos de parceiros
      const interestToPartnerType: Record<string, string[]> = {
        'natureza': ['atrativo_turistico', 'agencia_turismo'],
        'gastronomia': ['restaurante'],
        'cultura': ['atrativo_turistico'],
        'aventura': ['agencia_turismo', 'atrativo_turistico'],
        'historia': ['atrativo_turistico'],
        'compras': ['atrativo_turistico'],
        'relaxamento': ['hotel', 'pousada', 'resort'],
      };

      const partnerTypes: string[] = [];
      interesses.forEach(interest => {
        const types = interestToPartnerType[interest] || [];
        types.forEach(type => {
          if (!partnerTypes.includes(type)) {
            partnerTypes.push(type);
          }
        });
      });

      // Se não encontrou tipos específicos, busca todos
      if (partnerTypes.length === 0) {
        partnerTypes.push('hotel', 'restaurante', 'atrativo_turistico');
      }

      // Buscar parceiros aprovados
      let query = supabase
        .from('institutional_partners')
        .select('id, name, partner_type, address, description, logo_url')
        .eq('status', 'approved')
        .limit(20);

      // Filtrar por cidade se possível (usando address que pode conter cidade)
      if (cidade) {
        query = query.ilike('address', `%${cidade}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar parceiros:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar parceiros:', error);
      return [];
    }
  }

  /**
   * Busca eventos relevantes
   */
  private async fetchRelevantEvents(
    cidade: string,
    datas?: string
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('events')
        .select('id, title, start_date, end_date, location, description')
        .eq('status', 'published')
        .limit(10);

      if (cidade) {
        query = query.ilike('location', `%${cidade}%`);
      }

      // Filtrar por datas se fornecidas
      if (datas) {
        // Tentar parsear datas (formato esperado: "10-12/03" ou "10/03/2025")
        // Por enquanto, busca eventos próximos
        const now = new Date();
        query = query.gte('start_date', now.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar eventos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      return [];
    }
  }

  /**
   * Busca rotas do Passaporte Digital relevantes
   */
  private async fetchRelevantPassportRoutes(
    interesses: string[]
  ): Promise<any[]> {
    try {
      // Buscar rotas do passaporte que possam fazer sentido
      const { data, error } = await supabase
        .from('passport_routes')
        .select('id, name, description, category')
        .eq('is_active', true)
        .limit(5);

      if (error) {
        console.error('Erro ao buscar rotas do passaporte:', error);
        return [];
      }

      // Filtrar por interesses se possível
      const relevantRoutes = (data || []).filter((route: any) => {
        if (!interesses.length) return true;
        const routeText = `${route.name} ${route.description || ''} ${route.category || ''}`.toLowerCase();
        return interesses.some(interest => {
          const interestMap: Record<string, string[]> = {
            'cultura': ['cultura', 'cultural', 'história', 'historia'],
            'natureza': ['natureza', 'ecoturismo', 'pantanal', 'cerrado'],
            'gastronomia': ['gastronomia', 'culinária', 'culinaria', 'comida'],
          };
          const keywords = interestMap[interest] || [interest];
          return keywords.some(keyword => routeText.includes(keyword));
        });
      });

      return relevantRoutes;
    } catch (error) {
      console.error('Erro ao buscar rotas do passaporte:', error);
      return [];
    }
  }

  /**
   * Gera roteiro personalizado usando IA
   */
  async generateRoute(input: RouteGenerationInput): Promise<GeneratedRoute> {
    try {
      // 1. Buscar dados relevantes
      const [partners, events, passportRoutes] = await Promise.all([
        this.fetchRelevantPartners(input.cidade, input.interesses),
        this.fetchRelevantEvents(input.cidade, input.datas),
        this.fetchRelevantPassportRoutes(input.interesses),
      ]);

      // 2. Buscar informações adicionais na web (inteligente)
      let webContext = '';
      try {
        const webQuery = `roteiro turístico ${input.cidade} Mato Grosso do Sul ${input.interesses.join(' ')}`;
        const webResults = await this.googleSearch.searchMSInfo(webQuery, 'turismo');
        
        if (webResults.success && webResults.results.length > 0) {
          webContext = `\n\nINFORMAÇÕES ATUALIZADAS DA WEB:\n${webResults.results.slice(0, 5).map((r, i) => 
            `${i + 1}. ${r.title}\n   ${r.snippet || ''}\n   Fonte: ${r.url || ''}`
          ).join('\n\n')}`;
          console.log('✅ Busca web enriqueceu o contexto do roteiro');
        }
      } catch (webError) {
        console.warn('⚠️ Busca web não disponível, continuando sem ela:', webError);
        // Não bloquear se a busca web falhar
      }

      // 3. Construir contexto para a IA
      const partnersContext = partners.length > 0
        ? `\n\nPARCEIROS DISPONÍVEIS:\n${partners.map((p, i) => 
            `${i + 1}. ${p.name} (${p.partner_type}) - ${p.address || 'Endereço não informado'}\n   ${p.description || ''}`
          ).join('\n')}`
        : '';

      const eventsContext = events.length > 0
        ? `\n\nEVENTOS DISPONÍVEIS:\n${events.map((e, i) => 
            `${i + 1}. ${e.title} - ${e.start_date} - ${e.location || 'Local não informado'}\n   ${e.description || ''}`
          ).join('\n')}`
        : '';

      const passportContext = passportRoutes.length > 0
        ? `\n\nROTAS DO PASSAPORTE DIGITAL:\n${passportRoutes.map((r, i) => 
            `${i + 1}. ${r.name} - ${r.description || ''}`
          ).join('\n')}`
        : '';

      // 3. Construir prompt para a IA
      const userProfileContext = input.userProfile
        ? `\n\nPERFIL DO USUÁRIO:\n- Tipo: ${input.userProfile.user_type}\n- Origem: ${input.userProfile.country || input.userProfile.residence_city || 'Não informado'}\n- Motivos de viagem: ${input.userProfile.travel_motives?.join(', ') || 'Não informado'}\n- Duração preferida: ${input.userProfile.stay_duration || 'Não informado'}`
        : '';

      const systemPrompt = `Você é um assistente especializado em criar roteiros turísticos personalizados para Mato Grosso do Sul.

Sua tarefa é criar um roteiro detalhado e realista baseado nas preferências fornecidas.

REGRAS IMPORTANTES:
1. Use APENAS informações reais sobre Mato Grosso do Sul
2. Priorize parceiros, eventos e rotas fornecidos quando fizer sentido
3. Crie atividades realistas e viáveis
4. Considere distâncias e logística entre pontos
5. Adapte o roteiro ao perfil do viajante (${input.perfil})
6. Considere o orçamento: ${input.orcamento}
7. Inclua os interesses: ${input.interesses.join(', ')}
8. Duração: ${input.duracao}
9. Cidade/Região: ${input.cidade}
${input.datas ? `10. Datas: ${input.datas}` : ''}

${userProfileContext}

${partnersContext}

${eventsContext}

${passportContext}

${webContext}

FORMATO DE RESPOSTA (JSON):
{
  "resumo": {
    "cidade": "${input.cidade}",
    "duracao": "${input.duracao}",
    "interesses": ${JSON.stringify(input.interesses)},
    "hospedagem": "${input.hospedagem}",
    "perfil": "${input.perfil}",
    "orcamento": "${input.orcamento}"
  },
  "dias": [
    {
      "titulo": "Dia 1 - [Título descritivo]",
      "atividades": [
        "Atividade 1 com horário sugerido",
        "Atividade 2 com horário sugerido",
        "..."
      ],
      "descricao": "Breve descrição do dia"
    }
  ],
  "eventos": [
    {
      "nome": "Nome do evento",
      "data": "Data do evento",
      "local": "Local do evento",
      "descricao": "Descrição breve"
    }
  ],
  "parceiros": [
    {
      "id": "ID do parceiro se disponível",
      "nome": "Nome do parceiro",
      "tipo": "Tipo do parceiro",
      "endereco": "Endereço",
      "descricao": "Por que foi sugerido"
    }
  ],
  "passaporte": {
    "match": true/false,
    "rota": "Nome da rota se aplicável",
    "descricao": "Por que faz sentido"
  },
  "dicas": [
    "Dica prática 1",
    "Dica prática 2"
  ],
  "estimativa_custo": {
    "minimo": 0,
    "maximo": 0,
    "moeda": "BRL"
  }
}

IMPORTANTE:
- Crie um roteiro realista e detalhado
- Use os parceiros fornecidos quando fizer sentido
- Inclua eventos se estiverem nas datas
- Sugira rotas do passaporte se fizer sentido para os interesses
- Seja específico com horários e atividades
- Considere o perfil do viajante (${input.perfil})
- Adapte ao orçamento (${input.orcamento})`;

      // 4. Gerar roteiro com IA
      console.log('🤖 Gerando roteiro com IA...');
      const response = await generateContent(systemPrompt);

      if (!response.ok || !response.text) {
        throw new Error(response.error || 'Erro ao gerar roteiro');
      }

      // 5. Parsear resposta JSON
      let generatedRoute: GeneratedRoute;
      try {
        // Tentar extrair JSON da resposta (pode ter texto antes/depois)
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          generatedRoute = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Resposta não contém JSON válido');
        }
      } catch (parseError) {
        console.error('Erro ao parsear resposta da IA:', parseError);
        console.log('Resposta recebida:', response.text);
        // Fallback: criar roteiro básico
        generatedRoute = this.createFallbackRoute(input, partners, events, passportRoutes);
      }

      // 6. Enriquecer com dados reais dos parceiros
      if (generatedRoute.parceiros && partners.length > 0) {
        generatedRoute.parceiros = generatedRoute.parceiros.map(p => {
          const realPartner = partners.find(partner => 
            partner.name.toLowerCase().includes(p.nome.toLowerCase()) ||
            p.nome.toLowerCase().includes(partner.name.toLowerCase())
          );
          if (realPartner) {
            return {
              id: realPartner.id,
              nome: realPartner.name,
              tipo: realPartner.partner_type || 'Parceiro',
              endereco: realPartner.address || undefined,
              descricao: realPartner.description || undefined,
            };
          }
          return p;
        });
      }

      // 7. Enriquecer eventos com dados reais
      if (generatedRoute.eventos && events.length > 0) {
        generatedRoute.eventos = generatedRoute.eventos.map(e => {
          const realEvent = events.find(event => 
            event.title.toLowerCase().includes(e.nome.toLowerCase()) ||
            e.nome.toLowerCase().includes(event.title.toLowerCase())
          );
          if (realEvent) {
            return {
              nome: realEvent.title,
              data: realEvent.start_date || e.data,
              local: realEvent.location || e.local,
              descricao: realEvent.description || e.descricao,
            };
          }
          return e;
        });
      }

      return generatedRoute;
    } catch (error: any) {
      console.error('Erro ao gerar roteiro:', error);
      throw new Error(error.message || 'Erro ao gerar roteiro personalizado');
    }
  }

  /**
   * Cria roteiro fallback caso a IA falhe
   */
  private createFallbackRoute(
    input: RouteGenerationInput,
    partners: any[],
    events: any[],
    passportRoutes: any[]
  ): GeneratedRoute {
    const numDays = parseInt(input.duracao) || 3;
    const dias = Array.from({ length: numDays }, (_, i) => ({
      titulo: `Dia ${i + 1}`,
      atividades: [
        'Manhã: Exploração da região',
        'Tarde: Atividades relacionadas aos interesses',
        'Noite: Descanso e gastronomia local',
      ],
    }));

    return {
      resumo: {
        cidade: input.cidade,
        duracao: input.duracao,
        interesses: input.interesses,
        hospedagem: input.hospedagem,
        perfil: input.perfil,
        orcamento: input.orcamento,
      },
      dias,
      eventos: events.slice(0, 3).map(e => ({
        nome: e.title,
        data: e.start_date || 'Em breve',
        local: e.location,
        descricao: e.description,
      })),
      parceiros: partners.slice(0, 5).map(p => ({
        id: p.id,
        nome: p.name,
        tipo: p.partner_type || 'Parceiro',
        endereco: p.address,
        descricao: p.description,
      })),
      passaporte: passportRoutes.length > 0 ? {
        match: true,
        rota: passportRoutes[0].name,
        descricao: passportRoutes[0].description,
      } : undefined,
      dicas: [
        'Leve protetor solar e repelente',
        'Reserve com antecedência em alta temporada',
        'Considere contratar guias locais para melhor experiência',
      ],
    };
  }
}

export const iaRouteService = new IARouteService();

