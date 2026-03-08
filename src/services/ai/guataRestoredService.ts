// @ts-nocheck
/**
 * 🦦 GUATÁ RESTAURADO - Serviço Principal Inteligente
 * 
 * Funcionalidades:
 * - Google Gemini para respostas inteligentes
 * - Busca web real para informações atualizadas
 * - Supabase Edge Functions para RAG
 * - Personalidade de capivara focada em turismo de MS
 * - Sistema de parceiros com prioridade
 * - Respostas envolventes que despertam curiosidade
 */

import { generateContent } from "@/config/gemini";
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeItem } from "@/types/ai";

export interface GuataQuery {
  question: string;
  userId?: string;
  sessionId?: string;
  userLocation?: string;
  conversationHistory?: string[];
}

export interface GuataResponse {
  answer: string;
  confidence: number;
  sources: string[];
  processingTime: number;
  isFromWeb?: boolean;
  partnersSuggested?: string[];
  reasoning: string[];
}

export interface Partner {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  contact?: string;
  website?: string;
  priority: number; // 1 = mais prioritário
}

class GuataRestoredService {
  private readonly PARTNERS: Partner[] = [
    {
      id: "hotel-bonito-1",
      name: "Hotel Fazenda Águas de Bonito",
      category: "hospedagem",
      description: "Pousada familiar com acesso direto aos principais atrativos de Bonito",
      location: "Bonito",
      priority: 1
    },
    {
      id: "restaurante-cg-1", 
      name: "Restaurante Casa do Pantanal",
      category: "gastronomia",
      description: "Culinária típica pantaneira com ingredientes frescos da região",
      location: "Campo Grande",
      priority: 1
    },
    {
      id: "agencia-bonito-1",
      name: "Agência Bonito Ecoturismo",
      category: "passeios",
      description: "Especializada em ecoturismo e passeios sustentáveis em Bonito. Oferece Rio Sucuri, Gruta do Lago Azul, Buraco das Araras e outros atrativos com guias especializados",
      location: "Bonito", 
      priority: 1
    },
    {
      id: "pousada-pantanal-1",
      name: "Fazenda San Francisco",
      category: "hospedagem",
      description: "Fazenda histórica no Pantanal com observação de vida selvagem",
      location: "Aquidauana",
      priority: 2
    }
  ];

  private readonly KNOWLEDGE_BASE: KnowledgeItem[] = [
    {
      id: "bonito-geral",
      title: "Bonito - Capital Mundial do Ecoturismo",
      content: "Bonito é mundialmente reconhecida como a Capital do Ecoturismo, famosa por suas águas cristalinas e preservação ambiental. Principais atrativos: Gruta do Lago Azul, Rio Sucuri, Gruta da Anhumas, Buraco das Araras e Rio da Prata.",
      category: "destinos",
      source: "Fundtur-MS",
      lastUpdated: "2024-01-19"
    },
    {
      id: "bonito-passeios",
      title: "Passeios em Bonito - Principais Atrações",
      content: "Os melhores passeios em Bonito incluem: 1) Rio Sucuri (R$ 120) - Flutuação em águas cristalinas com peixes coloridos, 2) Gruta do Lago Azul (R$ 25) - Patrimônio Natural da Humanidade com lago subterrâneo azul, 3) Gruta da Anhumas (R$ 300) - Rapel de 72 metros em caverna com lago, 4) Buraco das Araras (R$ 15) - Dolina com araras vermelhas, 5) Rio da Prata (R$ 180) - Flutuação premium com águas transparentes, 6) Balneário Municipal (R$ 5) - Ideal para famílias. IMPORTANTE: Reserve com antecedência, especialmente jul-set e feriados.",
      category: "passeios",
      source: "Fundtur-MS",
      lastUpdated: "2024-01-19"
    },
    {
      id: "pantanal-geral", 
      title: "Pantanal - Patrimônio Mundial da UNESCO",
      content: "O Pantanal é a maior planície alagada do mundo, reconhecido pela UNESCO como Patrimônio Mundial. Em MS, principais acessos: Corumbá (420km de CG), Miranda (200km de CG) e Aquidauana (140km de CG). Melhor época: seca (maio-outubro).",
      category: "destinos",
      source: "SETESC",
      lastUpdated: "2024-01-19"
    },
    {
      id: "campo-grande-geral",
      title: "Campo Grande - Portal de Entrada do MS", 
      content: "Capital conhecida como 'Cidade Morena'. Principais atrações: Feira Central (qui-sáb, 18h-23h), Parque das Nações Indígenas, Memorial da Cultura Indígena, Museu de Arte Contemporânea e Mercadão Municipal.",
      category: "destinos",
      source: "Prefeitura de Campo Grande",
      lastUpdated: "2024-01-19"
    },
    {
      id: "gastronomia-ms",
      title: "Gastronomia Sul-Mato-Grossense",
      content: "A culinária mistura influências paraguaias, bolivianas e indígenas. Pratos típicos: sobá (macarrão japonês adaptado), chipa (pão de queijo paraguaio), churrasco pantaneiro e tereré (erva-mate gelada).",
      category: "gastronomia", 
      source: "Secretaria de Cultura e Turismo de MS",
      lastUpdated: "2024-01-19"
    }
  ];

  /**
   * MÉTODO PRINCIPAL - Processa pergunta com IA inteligente
   */
  async processQuestion(query: GuataQuery): Promise<GuataResponse> {
    const startTime = Date.now();
    const reasoning: string[] = [];
    
    console.log('🦦 Guatá Restaurado: Processando pergunta:', query.question);
    
    try {
      // 1. BUSCAR NA BASE DE CONHECIMENTO LOCAL
      const localKnowledge = this.searchLocalKnowledge(query.question);
      reasoning.push(`1. Base local: ${localKnowledge.length} resultados encontrados`);

      // 2. BUSCAR PARCEIROS RELEVANTES
      const relevantPartners = this.findRelevantPartners(query.question);
      reasoning.push(`2. Parceiros: ${relevantPartners.length} sugestões encontradas`);

      // 3. TENTAR BUSCA WEB VIA SUPABASE RAG
      let webResults: any[] = [];
      let webAnswer: string | null = null;
      
      try {
        console.log('🌐 Buscando informações atualizadas na web...');
        const { data, error } = await supabase.functions.invoke("guata-web-rag", {
          body: { 
            question: query.question, 
            state_code: 'MS',
            max_results: 5,
            include_sources: true
          }
        });
        
        if (!error && data) {
          webResults = data.sources || [];
          webAnswer = data.answer;
          reasoning.push(`3. Web RAG: ${webResults.length} fontes encontradas`);
        } else {
          reasoning.push('3. Web RAG: Indisponível, usando base local');
        }
      } catch (webError) {
        console.warn('⚠️ Erro na busca web:', webError);
        reasoning.push('3. Web RAG: Erro, usando base local');
      }

      // 4. GERAR RESPOSTA INTELIGENTE COM GEMINI
      const response = await this.generateIntelligentResponse(
        query.question,
        localKnowledge,
        webResults,
        relevantPartners,
        webAnswer,
        query.conversationHistory || []
      );

      const processingTime = Date.now() - startTime;
      
      return {
        answer: response.answer,
        confidence: response.confidence,
        sources: response.sources,
        processingTime,
        isFromWeb: webResults.length > 0,
        partnersSuggested: relevantPartners.map(p => p.name),
        reasoning
      };

    } catch (error) {
      console.error('❌ Erro no Guatá Restaurado:', error);
      
      return {
        answer: "Desculpe, tive um problema técnico. Pode tentar novamente?",
        confidence: 0.1,
        sources: ['error'],
        processingTime: Date.now() - startTime,
        reasoning: ['Erro no processamento']
      };
    }
  }

  /**
   * BUSCA NA BASE DE CONHECIMENTO LOCAL
   */
  private searchLocalKnowledge(question: string): KnowledgeItem[] {
    const questionLower = question.toLowerCase();
    const results: KnowledgeItem[] = [];

    for (const item of this.KNOWLEDGE_BASE) {
      const content = (item.title + ' ' + item.content).toLowerCase();
      let confidence = 0;

      // Busca por palavras-chave específicas
      if (questionLower.includes('passeios') && item.category === 'passeios') {
        confidence = 0.9;
      } else if (questionLower.includes('bonito') && item.title.toLowerCase().includes('bonito')) {
        confidence = 0.8;
      } else if (questionLower.includes('pantanal') && item.title.toLowerCase().includes('pantanal')) {
        confidence = 0.8;
      } else if (questionLower.includes('gastronomia') && item.category === 'gastronomia') {
        confidence = 0.8;
      } else if (questionLower.includes('campo grande') && item.title.toLowerCase().includes('campo grande')) {
        confidence = 0.8;
      } else {
        // Busca por palavras-chave gerais
        const keywords = questionLower.split(' ').filter(word => word.length > 3);
        const matches = keywords.filter(keyword => 
          content.includes(keyword) || 
          keyword.includes(item.title.toLowerCase()) ||
          keyword.includes(item.category.toLowerCase())
        );
        confidence = matches.length / keywords.length;
      }

      if (confidence > 0.3) {
        results.push({
          ...item,
          confidence
        });
      }
    }

    return results.sort((a, b) => (b as any).confidence - (a as any).confidence);
  }

  /**
   * ENCONTRA PARCEIROS RELEVANTES
   */
  private findRelevantPartners(question: string): Partner[] {
    const questionLower = question.toLowerCase();
    const relevant: Partner[] = [];

    for (const partner of this.PARTNERS) {
      let isRelevant = false;

      // Busca específica por categoria
      if (questionLower.includes('passeios') && partner.category === 'passeios') {
        isRelevant = true;
      } else if (questionLower.includes('comer') || questionLower.includes('gastronomia') || questionLower.includes('restaurante')) {
        if (partner.category === 'gastronomia') {
          isRelevant = true;
        }
      } else if (questionLower.includes('hotel') || questionLower.includes('hospedagem') || questionLower.includes('pousada')) {
        if (partner.category === 'hospedagem') {
          isRelevant = true;
        }
      } else if (questionLower.includes('bonito') && partner.location.toLowerCase().includes('bonito')) {
        isRelevant = true;
      } else if (questionLower.includes('pantanal') && partner.location.toLowerCase().includes('pantanal')) {
        isRelevant = true;
      } else if (questionLower.includes('campo grande') && partner.location.toLowerCase().includes('campo grande')) {
        isRelevant = true;
      }

      if (isRelevant) {
        relevant.push(partner);
      }
    }

    return relevant.sort((a, b) => a.priority - b.priority);
  }

  /**
   * GERA RESPOSTA INTELIGENTE COM GEMINI
   */
  private async generateIntelligentResponse(
    question: string,
    localKnowledge: KnowledgeItem[],
    webResults: any[],
    partners: Partner[],
    webAnswer: string | null,
    conversationHistory: string[]
  ): Promise<{ answer: string; confidence: number; sources: string[] }> {
    
    // Montar contexto completo
    const knowledgeContext = localKnowledge.map(item => 
      `${item.title}: ${item.content}`
    ).join('\n\n');

    const webContext = webResults.map(result => 
      `${result.title || 'Fonte Web'}: ${result.snippet || result.content || ''}`
    ).join('\n\n');

    const partnersContext = partners.length > 0 ? 
      `\n\nPARCEIROS RECOMENDADOS:\n${partners.map(p => 
        `• ${p.name} (${p.category}): ${p.description} - ${p.location}`
      ).join('\n')}` : '';

    const historyContext = conversationHistory.length > 0 ?
      `\n\nHISTÓRICO DA CONVERSA:\n${conversationHistory.slice(-3).join(' | ')}` : '';

    // Prompt principal para o Gemini
    const systemPrompt = `Você é o Guatá, uma capivara simpática e experiente que é o guia turístico oficial de Mato Grosso do Sul. 

PERSONALIDADE:
- Capivara carinhosa usando chapéu de safari
- Conhece profundamente MS e ama compartilhar curiosidades
- Respostas envolventes que despertam curiosidade
- Sempre sugere parceiros quando relevante
- Nunca inventa informações - sempre baseado em fatos

APRESENTAÇÃO OBRIGATÓRIA:
SEMPRE comece se apresentando assim:
"🦦 Olá! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! Estou aqui para te ajudar a descobrir as maravilhas do nosso estado. Como posso te ajudar hoje?"

ENTENDIMENTO DE PERGUNTAS:
- Leia ATENTAMENTE a pergunta do usuário
- Se perguntar sobre "passeios em Bonito", responda especificamente sobre PASSEIOS EM BONITO
- Se perguntar sobre "Pantanal", responda sobre PANTANAL
- Se perguntar sobre "gastronomia", responda sobre GASTRONOMIA
- NUNCA confunda os assuntos - responda exatamente o que foi perguntado

ESTILO DE RESPOSTA:
- Use emojis ocasionalmente (🦦, 🏞️, 🍽️, etc.)
- Seja envolvente e conte histórias interessantes
- Exemplo: "Você já ouviu falar no Mercado Municipal de Campo Grande? Além de provar a chipa e a sopa paraguaia, muitos turistas se encantam com a diversidade da gastronomia local. É como dar um passeio pela história da imigração na cidade."
- Sempre termine com uma pergunta ou sugestão para engajar

INFORMAÇÕES DISPONÍVEIS:
${knowledgeContext}

${webContext ? `\nINFORMAÇÕES ATUALIZADAS DA WEB:\n${webContext}` : ''}

${partnersContext}

${historyContext}

INSTRUÇÕES:
1. SEMPRE se apresente primeiro com a mensagem obrigatória
2. Leia e entenda EXATAMENTE o que o usuário perguntou
3. Responda especificamente sobre o assunto perguntado
4. Priorize informações de parceiros quando relevante
5. Se não souber algo específico, seja honesto e sugira onde encontrar
6. Sempre termine engajando o usuário
7. Use informações atualizadas da web quando disponível
8. Foque em turismo de MS, mas seja útil para qualquer pergunta`;

    try {
      const result = await generateContent(systemPrompt, question);
      
      if (result.ok) {
        const sources = [
          ...localKnowledge.map(item => item.source),
          ...webResults.map(result => result.source || 'Web'),
          ...partners.map(p => `Parceiro: ${p.name}`)
        ].filter((source, index, self) => self.indexOf(source) === index);

        return {
          answer: result.text,
          confidence: webAnswer ? 0.9 : 0.8,
          sources
        };
      } else {
        throw new Error(result.error || 'Erro na geração');
      }
    } catch (error) {
      console.error('❌ Erro no Gemini:', error);
      
      // Fallback com resposta básica
      return {
        answer: this.generateFallbackResponse(question, localKnowledge, partners),
        confidence: 0.6,
        sources: localKnowledge.map(item => item.source)
      };
    }
  }

  /**
   * RESPOSTA DE FALLBACK QUANDO GEMINI FALHA
   */
  private generateFallbackResponse(
    question: string, 
    knowledge: KnowledgeItem[], 
    partners: Partner[]
  ): string {
    if (knowledge.length > 0) {
      const mainInfo = knowledge[0];
      let response = `🦦 Olá! Sobre ${mainInfo.title.toLowerCase()}, posso te contar que ${mainInfo.content}`;
      
      if (partners.length > 0) {
        response += `\n\n💡 Dica: Recomendo especialmente ${partners[0].name} para ${partners[0].category}. ${partners[0].description}`;
      }
      
      response += `\n\nO que mais você gostaria de saber sobre ${mainInfo.title}?`;
      return response;
    }
    
    return "🦦 Olá! Sou o Guatá, seu guia de Mato Grosso do Sul. Como posso te ajudar hoje? Posso falar sobre destinos, gastronomia, hospedagem e muito mais!";
  }
}

// Exportar instância única
export const guataRestoredService = new GuataRestoredService();
export type { GuataQuery, GuataResponse, Partner };
