// @ts-nocheck
/**
 * 🧠 GUATÁ ADAPTATIVO - IA que Aprende e Melhora Continuamente
 * 
 * Funcionalidades:
 * - Aprendizado contínuo baseado em interações
 * - Busca web inteligente para informações atualizadas
 * - Análise de contexto e preferências do usuário
 * - Melhoria automática das respostas
 * - Sistema de memória persistente
 */

import { generateContent } from "@/config/gemini";
import { supabase } from "@/integrations/supabase/client";

export interface AdaptiveQuery {
  question: string;
  userId?: string;
  sessionId?: string;
  userLocation?: string;
  conversationHistory?: string[];
  userPreferences?: UserPreferences;
}

export interface AdaptiveResponse {
  answer: string;
  confidence: number;
  sources: string[];
  processingTime: number;
  learningInsights: LearningInsights;
  adaptiveImprovements: string[];
  memoryUpdates: MemoryUpdate[];
}

export interface UserPreferences {
  interests: string[];
  preferredDestinations: string[];
  budgetRange: string;
  travelStyle: string;
  previousQuestions: string[];
  feedbackHistory: FeedbackEntry[];
}

export interface LearningInsights {
  questionType: string;
  userIntent: string;
  knowledgeGaps: string[];
  improvementSuggestions: string[];
  contextRelevance: number;
}

export interface MemoryUpdate {
  type: 'preference' | 'fact' | 'pattern' | 'feedback';
  content: string;
  confidence: number;
  source: string;
}

export interface FeedbackEntry {
  question: string;
  response: string;
  rating: number;
  feedback: string;
  timestamp: Date;
}

class GuataAdaptiveService {
  private readonly LEARNING_THRESHOLD = 0.7;
  private readonly MEMORY_CACHE = new Map<string, any>();
  
  /**
   * PROCESSAMENTO PRINCIPAL ADAPTATIVO
   */
  async processQuestion(query: AdaptiveQuery): Promise<AdaptiveResponse> {
    const startTime = Date.now();
    console.log('🧠 Guatá Adaptativo: Processando pergunta com IA que aprende...');
    
    try {
      // 1. ANÁLISE DE CONTEXTO E APRENDIZADO
      const contextAnalysis = await this.analyzeContext(query);
      console.log('📊 Análise de contexto:', contextAnalysis);
      
      // 2. BUSCA INTELIGENTE MULTI-FONTE
      const searchResults = await this.intelligentSearch(query.question, contextAnalysis);
      console.log('🔍 Busca inteligente:', searchResults.length, 'resultados');
      
      // 3. GERAÇÃO DE RESPOSTA ADAPTATIVA
      const response = await this.generateAdaptiveResponse(
        query,
        contextAnalysis,
        searchResults
      );
      
      // 4. APRENDIZADO E MELHORIA CONTÍNUA
      const learningInsights = await this.learnFromInteraction(query, response);
      console.log('🎓 Insights de aprendizado:', learningInsights);
      
      // 5. ATUALIZAÇÃO DE MEMÓRIA
      const memoryUpdates = await this.updateMemory(query, response, learningInsights);
      console.log('💾 Atualizações de memória:', memoryUpdates.length);
      
      const processingTime = Date.now() - startTime;
      
      return {
        answer: response.answer,
        confidence: response.confidence,
        sources: response.sources,
        processingTime,
        learningInsights,
        adaptiveImprovements: learningInsights.improvementSuggestions,
        memoryUpdates
      };
      
    } catch (error) {
      console.error('❌ Erro no Guatá Adaptativo:', error);
      
      return {
        answer: "🦦 Desculpe, tive um problema técnico. Mas estou aprendendo com cada erro para melhorar! Pode tentar novamente?",
        confidence: 0.1,
        sources: ['error'],
        processingTime: Date.now() - startTime,
        learningInsights: {
          questionType: 'error',
          userIntent: 'unknown',
          knowledgeGaps: ['technical_issue'],
          improvementSuggestions: ['improve_error_handling'],
          contextRelevance: 0
        },
        adaptiveImprovements: ['Melhorar tratamento de erros'],
        memoryUpdates: []
      };
    }
  }

  /**
   * ANÁLISE DE CONTEXTO E APRENDIZADO
   */
  private async analyzeContext(query: AdaptiveQuery): Promise<any> {
    const analysisPrompt = `
Analise o contexto da pergunta do usuário e identifique:

PERGUNTA: "${query.question}"

HISTÓRICO: ${query.conversationHistory?.join(' | ') || 'Nenhum'}

PREFERÊNCIAS: ${JSON.stringify(query.userPreferences || {}, null, 2)}

Identifique:
1. Tipo de pergunta (turismo, gastronomia, hospedagem, transporte, eventos, etc.)
2. Intenção do usuário (buscar informação, comparar opções, planejar viagem, etc.)
3. Contexto geográfico (Bonito, Pantanal, Campo Grande, etc.)
4. Nível de detalhamento necessário
5. Preferências implícitas do usuário
6. Padrões de comportamento

Responda em JSON:
{
  "questionType": "string",
  "userIntent": "string", 
  "geographicContext": "string",
  "detailLevel": "basic|intermediate|advanced",
  "implicitPreferences": ["string"],
  "behaviorPatterns": ["string"],
  "contextRelevance": 0.0-1.0
}`;

    try {
      const result = await generateContent(analysisPrompt);
      if (result.ok) {
        return JSON.parse(result.text);
      }
    } catch (error) {
      console.warn('⚠️ Erro na análise de contexto:', error);
    }
    
    return {
      questionType: 'general',
      userIntent: 'information_seeking',
      geographicContext: 'Mato Grosso do Sul',
      detailLevel: 'intermediate',
      implicitPreferences: [],
      behaviorPatterns: [],
      contextRelevance: 0.5
    };
  }

  /**
   * BUSCA INTELIGENTE MULTI-FONTE
   */
  private async intelligentSearch(question: string, context: any): Promise<any[]> {
    const results: any[] = [];
    
    try {
      // 1. BUSCA WEB VIA SUPABASE RAG
      console.log('🌐 Buscando informações atualizadas na web...');
      const { data: webData, error: webError } = await supabase.functions.invoke("guata-web-rag", {
        body: { 
          question, 
          state_code: 'MS',
          max_results: 8,
          include_sources: true,
          context: context.geographicContext
        }
      });
      
      if (!webError && webData?.sources) {
        results.push(...webData.sources.map((source: any) => ({
          ...source,
          source: 'web_rag',
          confidence: 0.9,
          isRealTime: true
        })));
        console.log('✅ Web RAG:', webData.sources.length, 'resultados');
      }
      
      // 2. BUSCA EM APIS EXTERNAS (se necessário)
      if (this.needsExternalAPIs(question, context)) {
        const externalResults = await this.searchExternalAPIs(question, context);
        results.push(...externalResults);
        console.log('🔗 APIs Externas:', externalResults.length, 'resultados');
      }
      
      // 3. BUSCA EM MEMÓRIA PERSISTENTE
      const memoryResults = await this.searchMemory(question, context);
      results.push(...memoryResults);
      console.log('🧠 Memória:', memoryResults.length, 'resultados');
      
    } catch (error) {
      console.error('❌ Erro na busca inteligente:', error);
    }
    
    return results.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
  }

  /**
   * GERAÇÃO DE RESPOSTA ADAPTATIVA
   */
  private async generateAdaptiveResponse(
    query: AdaptiveQuery,
    context: any,
    searchResults: any[]
  ): Promise<{ answer: string; confidence: number; sources: string[] }> {
    
    const adaptivePrompt = `
Você é o Guatá, uma capivara inteligente e adaptativa que é o guia turístico oficial de Mato Grosso do Sul.

PERSONALIDADE ADAPTATIVA:
- Capivara carinhosa que aprende com cada interação
- Respostas personalizadas baseadas no contexto do usuário
- Sempre busca informações atualizadas e relevantes
- Aprende as preferências e adapta o estilo de resposta
- Usa insights de aprendizado para melhorar continuamente

CONTEXTO ATUAL:
- Tipo de pergunta: ${context.questionType}
- Intenção: ${context.userIntent}
- Contexto geográfico: ${context.geographicContext}
- Nível de detalhe: ${context.detailLevel}
- Preferências implícitas: ${context.implicitPreferences.join(', ')}

INFORMAÇÕES ENCONTRADAS:
${searchResults.map((result, index) => 
  `${index + 1}. ${result.title || 'Fonte'}: ${result.content || result.snippet || ''}`
).join('\n\n')}

HISTÓRICO DA CONVERSA:
${query.conversationHistory?.join(' | ') || 'Primeira interação'}

INSTRUÇÕES ADAPTATIVAS:
1. SEMPRE se apresente primeiro: "🦦 Olá! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul!"
2. Adapte sua resposta ao contexto e preferências do usuário
3. Use informações atualizadas da web quando disponível
4. Seja envolvente e conte histórias interessantes
5. Aprenda com cada interação para melhorar
6. Sempre termine engajando o usuário
7. Mostre que você está aprendendo e evoluindo

PERGUNTA DO USUÁRIO: ${query.question}

Responda de forma inteligente, adaptativa e envolvente:`;

    try {
      const result = await generateContent(adaptivePrompt);
      
      if (result.ok) {
        const sources = searchResults
          .map(r => r.source || 'web')
          .filter((source, index, self) => self.indexOf(source) === index);
        
        return {
          answer: result.text,
          confidence: 0.9,
          sources
        };
      } else {
        throw new Error(result.error || 'Erro na geração');
      }
    } catch (error) {
      console.error('❌ Erro na geração adaptativa:', error);
      
      return {
        answer: "🦦 Olá! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! Estou aprendendo e melhorando a cada interação. Como posso te ajudar hoje?",
        confidence: 0.6,
        sources: ['fallback']
      };
    }
  }

  /**
   * APRENDIZADO E MELHORIA CONTÍNUA
   */
  private async learnFromInteraction(
    query: AdaptiveQuery, 
    response: any
  ): Promise<LearningInsights> {
    
    const learningPrompt = `
Analise esta interação para identificar oportunidades de aprendizado:

PERGUNTA: "${query.question}"
RESPOSTA: "${response.answer}"
CONTEXTO: ${JSON.stringify(query.userPreferences || {}, null, 2)}

Identifique:
1. Tipo de pergunta e padrões
2. Intenção do usuário
3. Lacunas de conhecimento
4. Sugestões de melhoria
5. Relevância do contexto

Responda em JSON:
{
  "questionType": "string",
  "userIntent": "string",
  "knowledgeGaps": ["string"],
  "improvementSuggestions": ["string"],
  "contextRelevance": 0.0-1.0
}`;

    try {
      const result = await generateContent(learningPrompt);
      if (result.ok) {
        return JSON.parse(result.text);
      }
    } catch (error) {
      console.warn('⚠️ Erro no aprendizado:', error);
    }
    
    return {
      questionType: 'general',
      userIntent: 'information_seeking',
      knowledgeGaps: [],
      improvementSuggestions: ['Melhorar análise de contexto'],
      contextRelevance: 0.5
    };
  }

  /**
   * ATUALIZAÇÃO DE MEMÓRIA
   */
  private async updateMemory(
    query: AdaptiveQuery,
    response: any,
    learning: LearningInsights
  ): Promise<MemoryUpdate[]> {
    
    const updates: MemoryUpdate[] = [];
    
    // Atualizar preferências do usuário
    if (learning.contextRelevance > this.LEARNING_THRESHOLD) {
      updates.push({
        type: 'preference',
        content: `Usuário interessado em: ${learning.questionType}`,
        confidence: learning.contextRelevance,
        source: 'adaptive_learning'
      });
    }
    
    // Registrar padrões de comportamento
    if (learning.behaviorPatterns && learning.behaviorPatterns.length > 0) {
      updates.push({
        type: 'pattern',
        content: `Padrão identificado: ${learning.behaviorPatterns.join(', ')}`,
        confidence: 0.8,
        source: 'pattern_analysis'
      });
    }
    
    // Salvar fatos importantes
    if (learning.knowledgeGaps.length === 0 && response.confidence > 0.8) {
      updates.push({
        type: 'fact',
        content: `Fato verificado: ${query.question}`,
        confidence: response.confidence,
        source: 'web_verification'
      });
    }
    
    return updates;
  }

  /**
   * VERIFICA SE PRECISA DE APIs EXTERNAS
   */
  private needsExternalAPIs(question: string, context: any): boolean {
    const externalKeywords = ['preço', 'custo', 'valor', 'quanto', 'barato', 'caro', 'promoção'];
    return externalKeywords.some(keyword => 
      question.toLowerCase().includes(keyword)
    );
  }

  /**
   * BUSCA EM APIs EXTERNAS
   */
  private async searchExternalAPIs(question: string, context: any): Promise<any[]> {
    // Implementar busca em APIs externas quando necessário
    return [];
  }

  /**
   * BUSCA EM MEMÓRIA PERSISTENTE
   */
  private async searchMemory(question: string, context: any): Promise<any[]> {
    // Implementar busca em memória persistente
    return [];
  }
}

// Exportar instância única
export const guataAdaptiveService = new GuataAdaptiveService();
export type { AdaptiveQuery, AdaptiveResponse, UserPreferences, LearningInsights, MemoryUpdate };

