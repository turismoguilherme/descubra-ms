// Serviço de Memória Persistente do Guatá Human
// Simula Redis para armazenar dados de longo prazo dos usuários

export interface PersistentMemory {
    id: string;
    user_id?: string;
    session_id: string;
    memory_type: 'user_preferences' | 'travel_history' | 'conversation_patterns' | 'learning_data';
    memory_key: string;
    memory_value: any;
    expires_at?: string;
    created_at: string;
    updated_at: string;
    access_count: number;
    last_accessed: string;
}

export interface UserPreferences {
    travel_style: 'adventure' | 'relaxation' | 'culture' | 'nature' | 'mixed';
    budget_range: 'low' | 'medium' | 'high' | 'luxury';
    preferred_destinations: string[];
    interests: string[];
    accessibility_needs: string[];
    language_preference: 'pt-BR' | 'en' | 'es';
    notification_preferences: {
        weather_alerts: boolean;
        event_updates: boolean;
        price_changes: boolean;
        new_attractions: boolean;
    };
}

export interface TravelHistory {
    visited_destinations: Array<{
        destination: string;
        visit_date: string;
        duration_days: number;
        rating: number;
        notes: string;
    }>;
    planned_trips: Array<{
        destination: string;
        planned_date: string;
        duration_days: number;
        status: 'planning' | 'booked' | 'completed' | 'cancelled';
        notes: string;
    }>;
    favorite_attractions: string[];
    preferred_accommodations: string[];
    transportation_preferences: string[];
}

export interface ConversationPatterns {
    common_questions: Array<{
        question: string;
        frequency: number;
        last_asked: string;
    }>;
    preferred_response_style: 'detailed' | 'concise' | 'casual' | 'formal';
    interaction_frequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
    feedback_history: Array<{
        question: string;
        answer: string;
        rating: 'positive' | 'negative' | 'neutral';
        timestamp: string;
    }>;
}

export interface LearningData {
    corrected_answers: Array<{
        original_question: string;
        original_answer: string;
        correction: string;
        timestamp: string;
        applied: boolean;
    }>;
    user_suggestions: Array<{
        suggestion: string;
        category: string;
        timestamp: string;
        status: 'pending' | 'approved' | 'rejected';
    }>;
    knowledge_gaps: Array<{
        topic: string;
        frequency: number;
        last_mentioned: string;
    }>;
}

export class PersistentMemoryService {
    private memory: Map<string, PersistentMemory> = new Map();
    private readonly MEMORY_TIMEOUT = 365 * 24 * 60 * 60 * 1000; // 1 ano
    private readonly MAX_MEMORY_ENTRIES = 1000; // Limite de entradas na memória

    // ===== MEMÓRIA PERSISTENTE =====
    async savePersistentMemory(memory: Omit<PersistentMemory, 'id' | 'created_at' | 'updated_at' | 'access_count' | 'last_accessed'>): Promise<string | null> {
        try {
            const id = this.generateId();
            const now = new Date().toISOString();

            const newMemory: PersistentMemory = {
                ...memory,
                id,
                created_at: now,
                updated_at: now,
                access_count: 0,
                last_accessed: now
            };

            // Verificar limite de memória
            if (this.memory.size >= this.MAX_MEMORY_ENTRIES) {
                await this.cleanupOldestEntries();
            }

            this.memory.set(id, newMemory);
            return id;
        } catch (error) {
            console.error('Erro ao salvar memória persistente:', error);
            return null;
        }
    }

    async getPersistentMemory(
        sessionId: string,
        userId?: string,
        memoryType?: string,
        memoryKey?: string
    ): Promise<PersistentMemory[]> {
        try {
            let memories = Array.from(this.memory.values());

            // Filtrar por sessão
            memories = memories.filter(m => m.session_id === sessionId);

            // Filtrar por usuário se especificado
            if (userId) {
                memories = memories.filter(m => m.user_id === userId);
            }

            // Filtrar por tipo de memória
            if (memoryType) {
                memories = memories.filter(m => m.memory_type === memoryType);
            }

            // Filtrar por chave de memória
            if (memoryKey) {
                memories = memories.filter(m => m.memory_key === memoryKey);
            }

            // Atualizar contadores de acesso
            memories.forEach(memory => {
                memory.access_count++;
                memory.last_accessed = new Date().toISOString();
                this.memory.set(memory.id, memory);
            });

            return memories.sort((a, b) => 
                new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime()
            );
        } catch (error) {
            console.error('Erro ao buscar memória persistente:', error);
            return [];
        }
    }

    async updatePersistentMemory(
        memoryId: string,
        updates: Partial<Omit<PersistentMemory, 'id' | 'created_at'>>
    ): Promise<boolean> {
        try {
            const memory = this.memory.get(memoryId);
            if (!memory) return false;

            const updatedMemory: PersistentMemory = {
                ...memory,
                ...updates,
                updated_at: new Date().toISOString(),
                access_count: (memory.access_count || 0) + 1,
                last_accessed: new Date().toISOString()
            };

            this.memory.set(memoryId, updatedMemory);
            return true;
        } catch (error) {
            console.error('Erro ao atualizar memória persistente:', error);
            return false;
        }
    }

    async deletePersistentMemory(memoryId: string): Promise<boolean> {
        try {
            return this.memory.delete(memoryId);
        } catch (error) {
            console.error('Erro ao deletar memória persistente:', error);
            return false;
        }
    }

    // ===== PREFERÊNCIAS DO USUÁRIO =====
    async getUserPreferences(sessionId: string, userId?: string): Promise<UserPreferences | null> {
        try {
            const memories = await this.getPersistentMemory(
                sessionId,
                userId,
                'user_preferences',
                'main_preferences'
            );

            if (memories.length > 0) {
                return memories[0].memory_value as UserPreferences;
            }

            // Retornar preferências padrão se não existirem
            return this.getDefaultUserPreferences();
        } catch (error) {
            console.error('Erro ao buscar preferências do usuário:', error);
            return this.getDefaultUserPreferences();
        }
    }

    async saveUserPreferences(
        sessionId: string,
        preferences: Partial<UserPreferences>,
        userId?: string
    ): Promise<string | null> {
        try {
            const existingPreferences = await this.getUserPreferences(sessionId, userId);
            const updatedPreferences = {
                ...existingPreferences,
                ...preferences
            };

            return await this.savePersistentMemory({
                session_id: sessionId,
                user_id: userId,
                memory_type: 'user_preferences',
                memory_key: 'main_preferences',
                memory_value: updatedPreferences,
                expires_at: new Date(Date.now() + this.MEMORY_TIMEOUT).toISOString()
            });
        } catch (error) {
            console.error('Erro ao salvar preferências do usuário:', error);
            return null;
        }
    }

    // ===== HISTÓRICO DE VIAGEM =====
    async getTravelHistory(sessionId: string, userId?: string): Promise<TravelHistory | null> {
        try {
            const memories = await this.getPersistentMemory(
                sessionId,
                userId,
                'travel_history',
                'main_history'
            );

            if (memories.length > 0) {
                return memories[0].memory_value as TravelHistory;
            }

            return this.getDefaultTravelHistory();
        } catch (error) {
            console.error('Erro ao buscar histórico de viagem:', error);
            return this.getDefaultTravelHistory();
        }
    }

    async saveTravelHistory(
        sessionId: string,
        history: Partial<TravelHistory>,
        userId?: string
    ): Promise<string | null> {
        try {
            const existingHistory = await this.getTravelHistory(sessionId, userId);
            const updatedHistory = {
                ...existingHistory,
                ...history
            };

            return await this.savePersistentMemory({
                session_id: sessionId,
                user_id: userId,
                memory_type: 'travel_history',
                memory_key: 'main_history',
                memory_value: updatedHistory,
                expires_at: new Date(Date.now() + this.MEMORY_TIMEOUT).toISOString()
            });
        } catch (error) {
            console.error('Erro ao salvar histórico de viagem:', error);
            return null;
        }
    }

    async addVisitedDestination(
        sessionId: string,
        destination: string,
        durationDays: number,
        rating: number,
        notes: string,
        userId?: string
    ): Promise<boolean> {
        try {
            const history = await this.getTravelHistory(sessionId, userId);
            if (!history) return false;

            const newVisit = {
                destination,
                visit_date: new Date().toISOString(),
                duration_days: durationDays,
                rating,
                notes
            };

            history.visited_destinations.push(newVisit);
            await this.saveTravelHistory(sessionId, history, userId);
            return true;
        } catch (error) {
            console.error('Erro ao adicionar destino visitado:', error);
            return false;
        }
    }

    // ===== PADRÕES DE CONVERSA =====
    async getConversationPatterns(sessionId: string, userId?: string): Promise<ConversationPatterns | null> {
        try {
            const memories = await this.getPersistentMemory(
                sessionId,
                userId,
                'conversation_patterns',
                'main_patterns'
            );

            if (memories.length > 0) {
                return memories[0].memory_value as ConversationPatterns;
            }

            return this.getDefaultConversationPatterns();
        } catch (error) {
            console.error('Erro ao buscar padrões de conversa:', error);
            return this.getDefaultConversationPatterns();
        }
    }

    async updateConversationPatterns(
        sessionId: string,
        patterns: Partial<ConversationPatterns>,
        userId?: string
    ): Promise<string | null> {
        try {
            const existingPatterns = await this.getConversationPatterns(sessionId, userId);
            const updatedPatterns = {
                ...existingPatterns,
                ...patterns
            };

            return await this.savePersistentMemory({
                session_id: sessionId,
                user_id: userId,
                memory_type: 'conversation_patterns',
                memory_key: 'main_patterns',
                memory_value: updatedPatterns,
                expires_at: new Date(Date.now() + this.MEMORY_TIMEOUT).toISOString()
            });
        } catch (error) {
            console.error('Erro ao atualizar padrões de conversa:', error);
            return null;
        }
    }

    // ===== DADOS DE APRENDIZADO =====
    async getLearningData(sessionId: string, userId?: string): Promise<LearningData | null> {
        try {
            const memories = await this.getPersistentMemory(
                sessionId,
                userId,
                'learning_data',
                'main_learning'
            );

            if (memories.length > 0) {
                return memories[0].memory_value as LearningData;
            }

            return this.getDefaultLearningData();
        } catch (error) {
            console.error('Erro ao buscar dados de aprendizado:', error);
            return this.getDefaultLearningData();
        }
    }

    async addLearningCorrection(
        sessionId: string,
        originalQuestion: string,
        originalAnswer: string,
        correction: string,
        userId?: string
    ): Promise<boolean> {
        try {
            const learningData = await this.getLearningData(sessionId, userId);
            if (!learningData) return false;

            const newCorrection = {
                original_question: originalQuestion,
                original_answer: originalAnswer,
                correction,
                timestamp: new Date().toISOString(),
                applied: false
            };

            learningData.corrected_answers.push(newCorrection);
            await this.savePersistentMemory({
                session_id: sessionId,
                user_id: userId,
                memory_type: 'learning_data',
                memory_key: 'main_learning',
                memory_value: learningData,
                expires_at: new Date(Date.now() + this.MEMORY_TIMEOUT).toISOString()
            });
            return true;
        } catch (error) {
            console.error('Erro ao adicionar correção de aprendizado:', error);
            return false;
        }
    }

    // ===== UTILITÁRIOS =====
    private generateId(): string {
        return `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private getDefaultUserPreferences(): UserPreferences {
        return {
            travel_style: 'mixed',
            budget_range: 'medium',
            preferred_destinations: [],
            interests: [],
            accessibility_needs: [],
            language_preference: 'pt-BR',
            notification_preferences: {
                weather_alerts: true,
                event_updates: true,
                price_changes: false,
                new_attractions: true
            }
        };
    }

    private getDefaultTravelHistory(): TravelHistory {
        return {
            visited_destinations: [],
            planned_trips: [],
            favorite_attractions: [],
            preferred_accommodations: [],
            transportation_preferences: []
        };
    }

    private getDefaultConversationPatterns(): ConversationPatterns {
        return {
            common_questions: [],
            preferred_response_style: 'detailed',
            interaction_frequency: 'occasional',
            feedback_history: []
        };
    }

    private getDefaultLearningData(): LearningData {
        return {
            corrected_answers: [],
            user_suggestions: [],
            knowledge_gaps: []
        };
    }

    async cleanupOldestEntries(): Promise<void> {
        try {
            const memories = Array.from(this.memory.values());
            const sortedMemories = memories.sort((a, b) => 
                new Date(a.last_accessed).getTime() - new Date(b.last_accessed).getTime()
            );

            // Remover 20% das entradas mais antigas
            const entriesToRemove = Math.ceil(this.memory.size * 0.2);
            for (let i = 0; i < entriesToRemove; i++) {
                if (sortedMemories[i]) {
                    this.memory.delete(sortedMemories[i].id);
                }
            }
        } catch (error) {
            console.error('Erro ao limpar entradas antigas:', error);
        }
    }

    async cleanupExpiredData(): Promise<void> {
        try {
            const now = new Date();
            const expiredEntries: string[] = [];

            for (const [id, memory] of this.memory.entries()) {
                if (memory.expires_at && new Date(memory.expires_at) < now) {
                    expiredEntries.push(id);
                }
            }

            expiredEntries.forEach(id => this.memory.delete(id));
        } catch (error) {
            console.error('Erro ao limpar dados expirados:', error);
        }
    }

    getMemoryStats(): {
        totalEntries: number;
        memoryTypes: Record<string, number>;
        oldestEntry: string | null;
        newestEntry: string | null;
    } {
        const memories = Array.from(this.memory.values());
        const memoryTypes: Record<string, number> = {};
        
        memories.forEach(memory => {
            memoryTypes[memory.memory_type] = (memoryTypes[memory.memory_type] || 0) + 1;
        });

        const sortedMemories = memories.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        return {
            totalEntries: this.memory.size,
            memoryTypes,
            oldestEntry: sortedMemories[0]?.created_at || null,
            newestEntry: sortedMemories[sortedMemories.length - 1]?.created_at || null
        };
    }

    exportMemoryData(): PersistentMemory[] {
        return Array.from(this.memory.values());
    }

    importMemoryData(data: PersistentMemory[]): void {
        data.forEach(memory => {
            this.memory.set(memory.id, memory);
        });
    }
}

export const persistentMemoryService = new PersistentMemoryService();

// Limpeza automática a cada 6 horas
setInterval(() => {
    persistentMemoryService.cleanupExpiredData();
}, 6 * 60 * 60 * 1000);

