// Sistema de Atualizações Automáticas da Base de Conhecimento
import { MSKnowledgeItem } from '../knowledge/msKnowledgeBase';

export interface KnowledgeUpdate {
  id: string;
  type: 'add' | 'update' | 'remove';
  data?: MSKnowledgeItem;
  reason: string;
  source: string;
  date: string;
}

export class KnowledgeUpdater {
  private static instance: KnowledgeUpdater;
  private updates: KnowledgeUpdate[] = [];

  static getInstance(): KnowledgeUpdater {
    if (!KnowledgeUpdater.instance) {
      KnowledgeUpdater.instance = new KnowledgeUpdater();
    }
    return KnowledgeUpdater.instance;
  }

  // Adicionar nova informação
  addKnowledge(item: MSKnowledgeItem, source: string): void {
    const update: KnowledgeUpdate = {
      id: `add-${Date.now()}`,
      type: 'add',
      data: item,
      reason: 'Nova informação adicionada',
      source,
      date: new Date().toISOString()
    };
    
    this.updates.push(update);
    console.log(`📝 KnowledgeUpdater: Nova informação adicionada - ${item.name}`);
  }

  // Atualizar informação existente
  updateKnowledge(id: string, updates: Partial<MSKnowledgeItem>, source: string): void {
    const update: KnowledgeUpdate = {
      id: `update-${Date.now()}`,
      type: 'update',
      data: updates as MSKnowledgeItem,
      reason: 'Informação atualizada',
      source,
      date: new Date().toISOString()
    };
    
    this.updates.push(update);
    console.log(`📝 KnowledgeUpdater: Informação atualizada - ${id}`);
  }

  // Marcar informação para remoção
  markForRemoval(id: string, reason: string, source: string): void {
    const update: KnowledgeUpdate = {
      id: `remove-${Date.now()}`,
      type: 'remove',
      reason,
      source,
      date: new Date().toISOString()
    };
    
    this.updates.push(update);
    console.log(`📝 KnowledgeUpdater: Informação marcada para remoção - ${id}`);
  }

  // Obter histórico de atualizações
  getUpdateHistory(): KnowledgeUpdate[] {
    return [...this.updates];
  }

  // Verificar se há atualizações pendentes
  hasPendingUpdates(): boolean {
    return this.updates.length > 0;
  }

  // Limpar histórico de atualizações
  clearHistory(): void {
    this.updates = [];
    console.log('📝 KnowledgeUpdater: Histórico limpo');
  }
}

// Função para verificar informações desatualizadas
export function checkOutdatedInformation(): string[] {
  const currentDate = new Date();
  const outdatedItems: string[] = [];
  
  // Aqui você pode implementar lógica para verificar informações desatualizadas
  // Por exemplo, verificar se há informações com mais de 6 meses
  
  return outdatedItems;
}

// Função para sugerir atualizações baseadas em feedback
export function suggestUpdatesFromFeedback(feedback: string): KnowledgeUpdate[] {
  const suggestions: KnowledgeUpdate[] = [];
  
  // Análise simples do feedback para sugerir atualizações
  if (feedback.toLowerCase().includes('preço') || feedback.toLowerCase().includes('valor')) {
    suggestions.push({
      id: `suggestion-${Date.now()}`,
      type: 'update',
      reason: 'Atualização de preços sugerida pelo feedback',
      source: 'user_feedback',
      date: new Date().toISOString()
    });
  }
  
  if (feedback.toLowerCase().includes('contato') || feedback.toLowerCase().includes('telefone')) {
    suggestions.push({
      id: `suggestion-${Date.now()}`,
      type: 'update',
      reason: 'Atualização de contatos sugerida pelo feedback',
      source: 'user_feedback',
      date: new Date().toISOString()
    });
  }
  
  return suggestions;
} 