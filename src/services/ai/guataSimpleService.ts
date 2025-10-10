/**
 * 🦦 GUATÁ SIMPLE SERVICE - Versão ultra-simples que sempre funciona
 */

import { supabase } from "@/integrations/supabase/client";

export interface SimpleQuery {
  question: string;
  userId?: string;
  sessionId?: string;
  userLocation?: string;
  conversationHistory?: string[];
  userPreferences?: any;
}

export interface SimpleResponse {
  answer: string;
  confidence: number;
  sources: string[];
  processingTime: number;
  learningInsights: any;
  adaptiveImprovements: string[];
  memoryUpdates: any[];
}

class GuataSimpleService {
  private readonly KNOWLEDGE = {
    'bonito': {
      title: 'Bonito - Capital Mundial do Ecoturismo',
      content: 'Bonito é mundialmente reconhecida como a Capital do Ecoturismo, famosa por suas águas cristalinas e preservação ambiental. Os melhores passeios incluem: Rio Sucuri (R$ 120) - Flutuação em águas cristalinas com peixes coloridos, Gruta do Lago Azul (R$ 25) - Patrimônio Natural da Humanidade, Gruta da Anhumas (R$ 300) - Rapel de 72 metros, Buraco das Araras (R$ 15) - Dolina com araras vermelhas, Rio da Prata (R$ 180) - Flutuação premium, Balneário Municipal (R$ 5) - Ideal para famílias.',
      category: 'destinos'
    },
    'pantanal': {
      title: 'Pantanal - Patrimônio Mundial da UNESCO',
      content: 'O Pantanal é a maior planície alagada do mundo, reconhecido pela UNESCO como Patrimônio Mundial. Em MS, principais acessos: Corumbá (420km de CG), Miranda (200km de CG) e Aquidauana (140km de CG). Melhor época: seca (maio-outubro). Principais atividades: observação de onças-pintadas, mais de 600 espécies de aves, pesca esportiva e passeios de barco.',
      category: 'destinos'
    },
    'campo grande': {
      title: 'Campo Grande - Portal de Entrada do MS',
      content: 'Capital conhecida como "Cidade Morena". Principais atrações: Feira Central (qui-sáb, 18h-23h) - Entrada gratuita, Parque das Nações Indígenas - Maior parque urbano do mundo, Memorial da Cultura Indígena (R$ 10), Museu de Arte Contemporânea - Gratuito, Mercadão Municipal - Produtos típicos.',
      category: 'destinos'
    },
    'gastronomia': {
      title: 'Gastronomia Sul-Mato-Grossense',
      content: 'A culinária mistura influências paraguaias, bolivianas e indígenas. Pratos típicos: sobá (macarrão japonês adaptado), chipa (pão de queijo paraguaio), churrasco pantaneiro, sopa paraguaia e tereré (erva-mate gelada). Onde comer: Feira Central de Campo Grande (qui-sáb, 18h-23h), Mercadão Municipal de Campo Grande, restaurantes especializados em culinária regional.',
      category: 'gastronomia'
    }
  };

  // Sistema de parceiros removido - por enquanto não temos parceiros na plataforma
  // Quando tivermos parceiros, será implementado aqui

  /**
   * Busca web assíncrona - não bloqueia a resposta principal
   */
  private async searchWebAsync(question: string, title: string): Promise<string | null> {
    try {
      console.log('🌐 Buscando informações web em background...');
      const { data: webData, error: webError } = await supabase.functions.invoke("guata-web-rag", {
        body: {
          question: question,
          state_code: 'MS',
          max_results: 2,
          include_sources: true
        }
      });
      
      if (!webError && webData?.sources && webData.sources.length > 0) {
        console.log('✅ Informações web encontradas em background:', webData.sources.length, 'resultados');
        return `Informações web adicionais sobre ${title}: ${webData.sources.map(s => s.title).join(', ')}`;
      }
      
      return null;
    } catch (error) {
      console.log('⚠️ Busca web em background falhou:', error);
      return null;
    }
  }

  async processQuestion(query: SimpleQuery): Promise<SimpleResponse> {
    const startTime = Date.now();
    console.log('🦦 Guatá Simple: Processando pergunta...');
    
    try {
      const question = query.question.toLowerCase();
      let answer = "";
      
      // Busca simples por palavras-chave
      let foundKnowledge = null;
      
      if (question.includes('bonito')) {
        foundKnowledge = this.KNOWLEDGE.bonito;
      } else if (question.includes('pantanal')) {
        foundKnowledge = this.KNOWLEDGE.pantanal;
      } else if (question.includes('campo grande') || question.includes('campo grande')) {
        foundKnowledge = this.KNOWLEDGE['campo grande'];
      } else if (question.includes('comida') || question.includes('gastronomia') || question.includes('restaurante')) {
        foundKnowledge = this.KNOWLEDGE.gastronomia;
      }
      
      if (foundKnowledge) {
        answer = `Sobre ${foundKnowledge.title.toLowerCase()}, posso te contar que ${foundKnowledge.content}`;
        
        // Busca web rápida (opcional) - não bloqueia a resposta
        this.searchWebAsync(query.question, foundKnowledge.title).then(webInfo => {
          if (webInfo) {
            console.log('🌐 Informações web adicionadas:', webInfo);
          }
        }).catch(error => {
          console.log('⚠️ Busca web falhou:', error);
        });
        
        answer += `\n\nO que mais você gostaria de saber sobre Mato Grosso do Sul?`;
      } else {
        answer = `Posso te ajudar com informações sobre Bonito, Pantanal, Campo Grande, gastronomia e muito mais! `;
        answer += `Como posso te ajudar hoje?`;
      }
      
      const processingTime = Date.now() - startTime;
      console.log('✅ Guatá Simple: Resposta gerada em', processingTime, 'ms');
      
      return {
        answer,
        confidence: foundKnowledge ? 0.9 : 0.7,
        sources: foundKnowledge ? [foundKnowledge.category] : ['geral'],
        processingTime,
        learningInsights: {
          questionType: foundKnowledge ? 'specific' : 'general',
          userIntent: 'information_seeking',
          knowledgeGaps: foundKnowledge ? [] : ['informação específica'],
          improvementSuggestions: ['Expandir base de conhecimento'],
          contextRelevance: foundKnowledge ? 0.9 : 0.5
        },
        adaptiveImprovements: ['Melhorar detecção de palavras-chave'],
        memoryUpdates: []
      };
      
    } catch (error) {
      console.error('❌ Erro no Guatá Simple:', error);
      
      return {
        answer: "🦦 Olá! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! Estou aqui para te ajudar a descobrir as maravilhas do nosso estado. Como posso te ajudar hoje?",
        confidence: 0.6,
        sources: ['fallback'],
        processingTime: Date.now() - startTime,
        learningInsights: {
          questionType: 'error',
          userIntent: 'unknown',
          knowledgeGaps: ['technical_issue'],
          improvementSuggestions: ['Corrigir erro técnico'],
          contextRelevance: 0
        },
        adaptiveImprovements: ['Melhorar tratamento de erros'],
        memoryUpdates: []
      };
    }
  }
}

// Exportar instância única
export const guataSimpleService = new GuataSimpleService();
export type { SimpleQuery, SimpleResponse };
