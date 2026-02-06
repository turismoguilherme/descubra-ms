/**
 * 🎨 RESPONSE VARIATION SERVICE
 * Sistema para variar respostas e nunca repetir
 */

export interface ResponseTemplate {
  id: string;
  pattern: string;
  variations: string[];
  lastUsed: number;
  usageCount: number;
}

export class ResponseVariationService {
  private templates: Map<string, ResponseTemplate> = new Map();
  private responseHistory: Map<string, string[]> = new Map(); // Histórico por usuário/sessão

  /**
   * Gera variação de resposta baseada em template
   */
  generateVariation(templateId: string, baseResponse: string, userId?: string, sessionId?: string): string {
    const template = this.templates.get(templateId);
    if (!template) {
      return this.createVariation(baseResponse, userId, sessionId);
    }

    // Verificar histórico do usuário para não repetir
    const userKey = userId || sessionId || 'anonymous';
    const userHistory = this.responseHistory.get(userKey) || [];
    
    // Encontrar variação que não foi usada recentemente
    const availableVariations = template.variations.filter(v => 
      !userHistory.some(h => this.isSimilar(h, v))
    );

    let variation: string;
    if (availableVariations.length > 0) {
      variation = availableVariations[Math.floor(Math.random() * availableVariations.length)];
    } else {
      // Se todas foram usadas, criar nova variação
      variation = this.createVariation(baseResponse, userId, sessionId);
      template.variations.push(variation);
    }

    // Atualizar histórico
    userHistory.push(variation);
    if (userHistory.length > 10) {
      userHistory.shift(); // Manter apenas últimas 10
    }
    this.responseHistory.set(userKey, userHistory);

    // Atualizar template
    template.lastUsed = Date.now();
    template.usageCount++;
    this.templates.set(templateId, template);

    return variation;
  }

  /**
   * Cria variação de uma resposta
   */
  private createVariation(baseResponse: string, userId?: string, sessionId?: string): string {
    // Técnicas de variação:
    // 1. Variação de início
    const starts = [
      "🦦 Nossa, que pergunta incrível!",
      "🦦 Que alegria te ajudar com isso!",
      "🦦 Imagina só, que pergunta interessante!",
      "🦦 Que legal que você quer saber sobre isso!",
      "🦦 Olha, que pergunta maravilhosa!"
    ];

    // 2. Variação de meio
    const connectors = [
      "Deixa eu te contar...",
      "Sabe o que é mais incrível?",
      "Quer saber o melhor?",
      "O que eu mais amo sobre isso é...",
      "O que vai te surpreender é..."
    ];

    // 3. Variação de fim
    const endings = [
      "É uma experiência que vai te marcar para sempre!",
      "Você vai adorar conhecer isso!",
      "É de tirar o fôlego!",
      "É uma verdadeira maravilha!",
      "Vai ser uma experiência única!"
    ];

    // Aplicar variações aleatórias
    const randomStart = starts[Math.floor(Math.random() * starts.length)];
    const randomConnector = connectors[Math.floor(Math.random() * connectors.length)];
    const randomEnding = endings[Math.floor(Math.random() * endings.length)];

    // Remover início e fim originais se existirem
    const content = baseResponse
      .replace(/^🦦[^!]*!?\s*/i, '')
      .replace(/[.!?]$/, '');

    // Criar nova variação
    return `${randomStart} ${randomConnector} ${content} ${randomEnding}`;
  }

  /**
   * Verifica se duas respostas são similares
   */
  private isSimilar(response1: string, response2: string): boolean {
    const words1 = response1.toLowerCase().split(/\s+/);
    const words2 = response2.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(w => words2.includes(w));
    return commonWords.length / Math.max(words1.length, words2.length) > 0.7;
  }

  /**
   * Registra template de resposta
   */
  registerTemplate(pattern: string, variations: string[]): string {
    const templateId = `template-${pattern.toLowerCase().replace(/\s+/g, '-').substring(0, 50)}`;
    const template: ResponseTemplate = {
      id: templateId,
      pattern,
      variations,
      lastUsed: Date.now(),
      usageCount: 0
    };
    this.templates.set(templateId, template);
    return templateId;
  }

  /**
   * Limpa histórico antigo
   */
  cleanOldHistory(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [key, history] of this.responseHistory.entries()) {
      if (history.length === 0) {
        this.responseHistory.delete(key);
      }
    }
  }
}

// Exportar instância única
export const responseVariationService = new ResponseVariationService();

