import { 
  UserPreference, 
  UserProfile, 
  MLRecommendation, 
  MLModel, 
  MLPrediction, 
  MLFeedback, 
  MLConfig 
} from './mlTypes';
import { searchMSKnowledge } from '../ai/knowledge/msKnowledgeBase';

class MLService {
  private config: MLConfig = {
    enabled: true,
    autoLearning: true,
    minInteractions: 5,
    confidenceThreshold: 0.7,
    updateInterval: 30, // 30 minutos
    models: {
      collaborative: true,
      contentBased: true,
      hybrid: true
    },
    features: {
      locationPreference: true,
      interestMatching: true,
      budgetOptimization: true,
      seasonalAdjustment: true,
      groupSizeConsideration: true
    }
  };

  private userPreferences: UserPreference[] = [];
  private userProfiles: UserProfile[] = [];
  private recommendations: MLRecommendation[] = [];
  private models: MLModel[] = [];
  private feedback: MLFeedback[] = [];

  /**
   * Registrar interação do usuário
   */
  async recordInteraction(preference: UserPreference): Promise<void> {
    console.log(`🤖 ML: Registrando interação para usuário ${preference.userId}`);
    
    this.userPreferences.push(preference);
    
    // Atualizar perfil do usuário
    await this.updateUserProfile(preference.userId);
    
    // Treinar modelo se necessário
    if (this.shouldTrainModel(preference.userId)) {
      await this.trainModel(preference.userId);
    }
  }

  /**
   * Gerar recomendações personalizadas
   */
  async generateRecommendations(
    userId: string, 
    context?: {
      location?: string;
      interests?: string[];
      budget?: string;
      groupSize?: number;
    }
  ): Promise<MLPrediction> {
    console.log(`🤖 ML: Gerando recomendações para usuário ${userId}`);
    
    try {
      // Buscar perfil do usuário
      const userProfile = this.getUserProfile(userId);
      
      if (!userProfile) {
        return this.generateDefaultRecommendations(context);
      }

      // Aplicar diferentes algoritmos
      const collaborativeRecs = await this.collaborativeFiltering(userId, userProfile);
      const contentBasedRecs = await this.contentBasedFiltering(userId, userProfile, context);
      const hybridRecs = await this.hybridRecommendations(collaborativeRecs, contentBasedRecs);

      // Combinar e ordenar recomendações
      const finalRecommendations = this.combineRecommendations(hybridRecs, context);
      
      const prediction: MLPrediction = {
        userId,
        recommendations: finalRecommendations.slice(0, 10), // Top 10
        confidence: this.calculateConfidence(finalRecommendations),
        modelUsed: 'hybrid',
        timestamp: new Date().toISOString()
      };

      // Salvar recomendações
      this.recommendations.push(...finalRecommendations);
      
      console.log(`✅ ML: ${finalRecommendations.length} recomendações geradas`);
      return prediction;
      
    } catch (error) {
      console.error('❌ Erro ao gerar recomendações:', error);
      return this.generateDefaultRecommendations(context);
    }
  }

  /**
   * Filtragem colaborativa baseada em usuários similares
   */
  private async collaborativeFiltering(userId: string, userProfile: UserProfile): Promise<MLRecommendation[]> {
    const recommendations: MLRecommendation[] = [];
    
    // Encontrar usuários similares
    const similarUsers = this.findSimilarUsers(userId, userProfile);
    
    // Analisar preferências dos usuários similares
    for (const similarUser of similarUsers) {
      const similarUserPrefs = this.userPreferences.filter(p => p.userId === similarUser.userId);
      
      for (const pref of similarUserPrefs) {
        if (pref.rating >= 4) { // Só recomendar itens bem avaliados
          const existingRec = recommendations.find(r => r.itemId === pref.itemId);
          
          if (existingRec) {
            existingRec.score += pref.rating * similarUser.similarity;
            existingRec.confidence = Math.min(existingRec.confidence + 0.1, 1.0);
          } else {
            recommendations.push({
              id: `rec-${Date.now()}-${Math.random()}`,
              userId,
              itemId: pref.itemId,
              itemName: pref.itemName,
              category: pref.category,
              confidence: 0.6,
              reason: `Recomendado por usuários com interesses similares`,
              score: pref.rating * similarUser.similarity,
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    }
    
    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * Filtragem baseada em conteúdo
   */
  private async contentBasedFiltering(
    userId: string, 
    userProfile: UserProfile, 
    context?: any
  ): Promise<MLRecommendation[]> {
    const recommendations: MLRecommendation[] = [];
    
    // Buscar itens na base de conhecimento
    const allItems = searchMSKnowledge('', 'all');
    
    for (const item of allItems) {
      const score = this.calculateContentScore(item, userProfile, context);
      
      if (score > 0.5) { // Threshold mínimo
        recommendations.push({
          id: `rec-${Date.now()}-${Math.random()}`,
          userId,
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          confidence: score,
          reason: this.generateReason(item, userProfile),
          score: score,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * Recomendações híbridas
   */
  private async hybridRecommendations(
    collaborative: MLRecommendation[],
    contentBased: MLRecommendation[]
  ): Promise<MLRecommendation[]> {
    const hybrid: MLRecommendation[] = [];
    const itemScores = new Map<string, { score: number; count: number; reasons: string[] }>();
    
    // Combinar scores dos dois métodos
    for (const rec of [...collaborative, ...contentBased]) {
      const existing = itemScores.get(rec.itemId);
      
      if (existing) {
        existing.score += rec.score;
        existing.count += 1;
        existing.reasons.push(rec.reason);
      } else {
        itemScores.set(rec.itemId, {
          score: rec.score,
          count: 1,
          reasons: [rec.reason]
        });
      }
    }
    
    // Criar recomendações híbridas
    for (const [itemId, data] of itemScores) {
      const rec = collaborative.find(r => r.itemId === itemId) || 
                  contentBased.find(r => r.itemId === itemId);
      
      if (rec) {
        hybrid.push({
          ...rec,
          score: data.score / data.count, // Média dos scores
          confidence: Math.min(data.score / data.count, 1.0),
          reason: `Híbrido: ${data.reasons.slice(0, 2).join('; ')}`
        });
      }
    }
    
    return hybrid.sort((a, b) => b.score - a.score);
  }

  /**
   * Calcular score baseado em conteúdo
   */
  private calculateContentScore(item: any, userProfile: UserProfile, context?: any): number {
    let score = 0;
    
    // Score por localização
    if (this.config.features.locationPreference) {
      const locationMatch = userProfile.preferences.locations.some(loc => 
        item.location.toLowerCase().includes(loc.toLowerCase())
      );
      if (locationMatch) score += 0.3;
    }
    
    // Score por interesses
    if (this.config.features.interestMatching) {
      const interestMatches = userProfile.preferences.interests.filter(interest =>
        item.specialties?.some(specialty => 
          specialty.toLowerCase().includes(interest.toLowerCase())
        )
      );
      score += (interestMatches.length / userProfile.preferences.interests.length) * 0.4;
    }
    
    // Score por orçamento
    if (this.config.features.budgetOptimization && context?.budget) {
      const budgetMatch = this.checkBudgetCompatibility(item.priceRange, context.budget);
      if (budgetMatch) score += 0.2;
    }
    
    // Score por avaliação
    if (item.rating) {
      score += (item.rating / 5) * 0.1;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Encontrar usuários similares
   */
  private findSimilarUsers(userId: string, userProfile: UserProfile): Array<{userId: string, similarity: number}> {
    const similarUsers: Array<{userId: string, similarity: number}> = [];
    
    for (const profile of this.userProfiles) {
      if (profile.userId === userId) continue;
      
      const similarity = this.calculateUserSimilarity(userProfile, profile);
      
      if (similarity > 0.3) { // Threshold mínimo de similaridade
        similarUsers.push({
          userId: profile.userId,
          similarity
        });
      }
    }
    
    return similarUsers.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
  }

  /**
   * Calcular similaridade entre usuários
   */
  private calculateUserSimilarity(profile1: UserProfile, profile2: UserProfile): number {
    let similarity = 0;
    
    // Similaridade por interesses
    const commonInterests = profile1.preferences.interests.filter(interest =>
      profile2.preferences.interests.includes(interest)
    );
    similarity += (commonInterests.length / Math.max(profile1.preferences.interests.length, 1)) * 0.4;
    
    // Similaridade por localizações
    const commonLocations = profile1.preferences.locations.filter(location =>
      profile2.preferences.locations.includes(location)
    );
    similarity += (commonLocations.length / Math.max(profile1.preferences.locations.length, 1)) * 0.3;
    
    // Similaridade por estilo de viagem
    if (profile1.preferences.travelStyle === profile2.preferences.travelStyle) {
      similarity += 0.2;
    }
    
    // Similaridade por orçamento
    if (profile1.preferences.budget === profile2.preferences.budget) {
      similarity += 0.1;
    }
    
    return Math.min(similarity, 1.0);
  }

  /**
   * Verificar compatibilidade de orçamento
   */
  private checkBudgetCompatibility(itemBudget: string, userBudget: string): boolean {
    const budgetOrder = ['budget', 'moderate', 'luxury'];
    const itemIndex = budgetOrder.indexOf(itemBudget);
    const userIndex = budgetOrder.indexOf(userBudget);
    
    return itemIndex <= userIndex + 1; // Permite um nível acima
  }

  /**
   * Gerar razão para recomendação
   */
  private generateReason(item: any, userProfile: UserProfile): string {
    const reasons = [];
    
    if (userProfile.preferences.interests.some(interest => 
      item.specialties?.some(specialty => specialty.toLowerCase().includes(interest.toLowerCase()))
    )) {
      reasons.push('Combina com seus interesses');
    }
    
    if (userProfile.preferences.locations.some(location => 
      item.location.toLowerCase().includes(location.toLowerCase())
    )) {
      reasons.push('Localização preferida');
    }
    
    if (item.rating && item.rating >= 4.5) {
      reasons.push('Excelente avaliação');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Baseado em suas preferências';
  }

  /**
   * Combinar recomendações
   */
  private combineRecommendations(recommendations: MLRecommendation[], context?: any): MLRecommendation[] {
    // Aplicar filtros de contexto
    let filtered = recommendations;
    
    if (context?.location) {
      filtered = filtered.filter(rec => 
        rec.reason.toLowerCase().includes(context.location.toLowerCase())
      );
    }
    
    if (context?.budget) {
      // Filtrar por orçamento se possível
      filtered = filtered.filter(rec => rec.confidence > this.config.confidenceThreshold);
    }
    
    return filtered;
  }

  /**
   * Calcular confiança geral
   */
  private calculateConfidence(recommendations: MLRecommendation[]): number {
    if (recommendations.length === 0) return 0;
    
    const avgConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length;
    return Math.min(avgConfidence, 1.0);
  }

  /**
   * Atualizar perfil do usuário
   */
  private async updateUserProfile(userId: string): Promise<void> {
    const userPrefs = this.userPreferences.filter(p => p.userId === userId);
    
    if (userPrefs.length === 0) return;
    
    const profile: UserProfile = {
      id: `profile-${userId}`,
      userId,
      preferences: {
        locations: this.extractLocations(userPrefs),
        interests: this.extractInterests(userPrefs),
        budget: this.determineBudget(userPrefs),
        travelStyle: this.determineTravelStyle(userPrefs),
        groupSize: this.calculateAverageGroupSize(userPrefs),
        preferredSeasons: this.extractSeasons(userPrefs)
      },
      behavior: {
        averageRating: this.calculateAverageRating(userPrefs),
        totalInteractions: userPrefs.length,
        favoriteCategories: this.extractFavoriteCategories(userPrefs),
        searchPatterns: this.extractSearchPatterns(userPrefs),
        feedbackHistory: this.calculateFeedbackHistory(userId)
      },
      lastUpdated: new Date().toISOString()
    };
    
    // Atualizar ou criar perfil
    const existingIndex = this.userProfiles.findIndex(p => p.userId === userId);
    if (existingIndex >= 0) {
      this.userProfiles[existingIndex] = profile;
    } else {
      this.userProfiles.push(profile);
    }
  }

  /**
   * Métodos auxiliares para extração de dados
   */
  private extractLocations(prefs: UserPreference[]): string[] {
    const locations = new Set<string>();
    prefs.forEach(pref => {
      if (pref.context?.location) {
        locations.add(pref.context.location);
      }
    });
    return Array.from(locations);
  }

  private extractInterests(prefs: UserPreference[]): string[] {
    const interests = new Set<string>();
    prefs.forEach(pref => {
      if (pref.context?.interests) {
        pref.context.interests.forEach(interest => interests.add(interest));
      }
    });
    return Array.from(interests);
  }

  private determineBudget(prefs: UserPreference[]): 'budget' | 'moderate' | 'luxury' {
    const budgetCounts = { budget: 0, moderate: 0, luxury: 0 };
    
    prefs.forEach(pref => {
      if (pref.context?.budget) {
        budgetCounts[pref.context.budget as keyof typeof budgetCounts]++;
      }
    });
    
    const maxBudget = Object.entries(budgetCounts).reduce((a, b) => 
      budgetCounts[a[0] as keyof typeof budgetCounts] > budgetCounts[b[0] as keyof typeof budgetCounts] ? a : b
    )[0];
    
    return maxBudget as 'budget' | 'moderate' | 'luxury';
  }

  private determineTravelStyle(prefs: UserPreference[]): 'adventure' | 'relaxation' | 'culture' | 'family' | 'romantic' | 'business' {
    // Lógica simplificada baseada nas categorias
    const categoryCounts: { [key: string]: number } = {};
    
    prefs.forEach(pref => {
      categoryCounts[pref.category] = (categoryCounts[pref.category] || 0) + 1;
    });
    
    // Mapear categorias para estilos
    if (categoryCounts['attraction'] > categoryCounts['hotel']) return 'adventure';
    if (categoryCounts['hotel'] > categoryCounts['attraction']) return 'relaxation';
    return 'culture';
  }

  private calculateAverageGroupSize(prefs: UserPreference[]): number {
    const groupSizes = prefs
      .map(pref => pref.context?.groupSize)
      .filter(size => size && size > 0);
    
    if (groupSizes.length === 0) return 2;
    
    return Math.round(groupSizes.reduce((sum, size) => sum + size, 0) / groupSizes.length);
  }

  private extractSeasons(prefs: UserPreference[]): string[] {
    const seasons = new Set<string>();
    prefs.forEach(pref => {
      if (pref.context?.season) {
        seasons.add(pref.context.season);
      }
    });
    return Array.from(seasons);
  }

  private calculateAverageRating(prefs: UserPreference[]): number {
    if (prefs.length === 0) return 0;
    
    const totalRating = prefs.reduce((sum, pref) => sum + pref.rating, 0);
    return Math.round((totalRating / prefs.length) * 10) / 10;
  }

  private extractFavoriteCategories(prefs: UserPreference[]): string[] {
    const categoryCounts: { [key: string]: number } = {};
    
    prefs.forEach(pref => {
      categoryCounts[pref.category] = (categoryCounts[pref.category] || 0) + 1;
    });
    
    return Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  }

  private extractSearchPatterns(prefs: UserPreference[]): string[] {
    const patterns = new Set<string>();
    prefs.forEach(pref => {
      if (pref.interactionType === 'search') {
        patterns.add(pref.itemName);
      }
    });
    return Array.from(patterns);
  }

  private calculateFeedbackHistory(userId: string): { positive: number; negative: number; total: number } {
    const userFeedback = this.feedback.filter(f => f.userId === userId);
    
    return {
      positive: userFeedback.filter(f => f.feedback === 'helpful').length,
      negative: userFeedback.filter(f => f.feedback === 'not_helpful').length,
      total: userFeedback.length
    };
  }

  /**
   * Verificar se deve treinar modelo
   */
  private shouldTrainModel(userId: string): boolean {
    const userPrefs = this.userPreferences.filter(p => p.userId === userId);
    return userPrefs.length >= this.config.minInteractions;
  }

  /**
   * Treinar modelo
   */
  private async trainModel(userId: string): Promise<void> {
    console.log(`🤖 ML: Treinando modelo para usuário ${userId}`);
    
    // Simulação de treinamento
    const model: MLModel = {
      id: `model-${userId}`,
      name: 'PersonalizedRecommendationModel',
      version: '1.0',
      type: 'hybrid',
      accuracy: 0.85,
      lastTrained: new Date().toISOString(),
      parameters: {
        learningRate: 0.01,
        epochs: 100,
        batchSize: 32
      },
      status: 'active'
    };
    
    this.models.push(model);
  }

  /**
   * Gerar recomendações padrão
   */
  private generateDefaultRecommendations(context?: any): MLPrediction {
    const allItems = searchMSKnowledge('', 'all');
    const defaultRecs = allItems.slice(0, 5).map((item, index) => ({
      id: `default-rec-${index}`,
      userId: 'default',
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      confidence: 0.5,
      reason: 'Recomendação popular',
      score: 5 - index,
      timestamp: new Date().toISOString()
    }));
    
    return {
      userId: 'default',
      recommendations: defaultRecs,
      confidence: 0.5,
      modelUsed: 'default',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Obter perfil do usuário
   */
  private getUserProfile(userId: string): UserProfile | null {
    return this.userProfiles.find(p => p.userId === userId) || null;
  }

  /**
   * Registrar feedback
   */
  async recordFeedback(feedback: MLFeedback): Promise<void> {
    this.feedback.push(feedback);
    console.log(`🤖 ML: Feedback registrado para recomendação ${feedback.recommendationId}`);
  }

  /**
   * Obter configuração
   */
  getConfig(): MLConfig {
    return this.config;
  }

  /**
   * Atualizar configuração
   */
  updateConfig(newConfig: Partial<MLConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🤖 ML: Configuração atualizada');
  }
}

export const mlService = new MLService(); 