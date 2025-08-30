import { supabase } from '@/integrations/supabase/client';
import { geminiClient } from '@/config/gemini';
import { UserStamp } from "@/types/passport"; // Importar o tipo UserStamp
import { offlineCacheService } from "../offlineCacheService"; // Importar o serviço de cache offline
import rewardService, { Reward } from '../rewardService'; // Importar o novo serviço de recompensas
import { toast } from '@/hooks/use-toast'; // Importar useToast

// Tipos para passaporte turístico
export interface TourismPassport {
  id: string;
  user_id: string;
  passport_number: string;
  level: 'bronze' | 'prata' | 'ouro' | 'diamante';
  points: number;
  total_visits: number;
  cities_visited: string[];
  attractions_visited: string[];
  checkpoints_completed: PassportCheckpoint[];
  benefits_unlocked: string[];
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface PassportCheckpoint {
  id: string;
  name: string;
  location: {
    address: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
  category: 'cultural' | 'natureza' | 'gastronomia' | 'aventura' | 'historia';
  points_reward: number;
  completed_at: string;
  photo_url?: string;
  notes?: string;
}

export interface PassportBenefit {
  id: string;
  name: string;
  description: string;
  level_required: 'bronze' | 'prata' | 'ouro' | 'diamante';
  points_required: number;
  discount_percentage?: number;
  free_entry?: boolean;
  priority_access?: boolean;
  exclusive_experience?: boolean;
  active: boolean;
}

export interface PassportChallenge {
  id: string;
  name: string;
  description: string;
  points_reward: number;
  requirements: {
    checkpoints_required: number;
    cities_required: number;
    categories_required: string[];
    time_limit_days?: number;
  };
  active: boolean;
  expires_at?: string;
}

class TourismPassportService {
  // Criar novo passaporte
  async createPassport(userId: string): Promise<TourismPassport> {
    try {
      const passportNumber = this.generatePassportNumber();
      
      const passport: Omit<TourismPassport, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        passport_number: passportNumber,
        level: 'bronze',
        points: 0,
        total_visits: 0,
        cities_visited: [],
        attractions_visited: [],
        checkpoints_completed: [],
        benefits_unlocked: [],
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 ano
      };

      const { data, error } = await supabase
        .from('tourism_passports')
        .insert([{
          ...passport,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Passaporte criado:', passportNumber);
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar passaporte:', error);
      throw error;
    }
  }

  // Gerar número do passaporte
  private generatePassportNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `MS-${timestamp}-${random}`.toUpperCase();
  }

  // Buscar passaporte do usuário
  async getPassport(userId: string): Promise<TourismPassport | null> {
    try {
      const { data, error } = await supabase
        .from('tourism_passports')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar passaporte:', error);
      throw error;
    }
  }

  // Registrar visita a checkpoint
  async registerCheckpointVisit(
    userId: string, 
    checkpointData: Omit<PassportCheckpoint, 'id' | 'completed_at'>
  ): Promise<{ checkpoint: PassportCheckpoint; newUnlockedBenefits: PassportBenefit[] }> {
    try {
      const passport = await this.getPassport(userId);
      if (!passport) throw new Error('Passaporte não encontrado');

      const checkpoint: PassportCheckpoint = {
        ...checkpointData,
        id: `checkpoint-${Date.now()}`,
        completed_at: new Date().toISOString()
      };

      // Calcular pontos e atualizar passaporte
      const newPoints = passport.points + checkpoint.points_reward;
      const newLevel = this.calculateLevel(newPoints);
      const newCities = [...new Set([...passport.cities_visited, checkpoint.location.city])];
      const newAttractions = [...new Set([...passport.attractions_visited, checkpoint.name])];
      const newCheckpoints = [...passport.checkpoints_completed, checkpoint];

      // Verificar benefícios desbloqueados
      const newUnlockedBenefits = await this.checkUnlockedBenefits(newPoints, newLevel);
      const newBenefitsIds = newUnlockedBenefits.map(b => b.id); // Mapear para IDs para o DB

      // Atualizar passaporte
      await supabase
        .from('tourism_passports')
        .update({
          points: newPoints,
          level: newLevel,
          total_visits: passport.total_visits + 1,
          cities_visited: newCities,
          attractions_visited: newAttractions,
          checkpoints_completed: newCheckpoints,
          benefits_unlocked: newBenefitsIds, // Armazenar apenas IDs no DB
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      // --- ATRIBUIÇÃO DE RECOMPENSAS CUSTOMIZADAS APÓS AÇÃO DO USUÁRIO ---
      await this._checkAndAssignCustomRewards(userId, passport.total_visits + 1, newPoints); // Passa total_visits atualizado
      // --- FIM DA ATRIBUIÇÃO ---

      console.log(`✅ Checkpoint registrado: ${checkpoint.name} (+${checkpoint.points_reward} pontos)`);
      return { checkpoint, newUnlockedBenefits };
    } catch (error) {
      console.error('❌ Erro ao registrar checkpoint:', error);
      throw error;
    }
  }

  // Criar check-in do usuário (adaptado para offline)
  async createUserCheckin(checkinData: any): Promise<{ checkpoint: PassportCheckpoint; newUnlockedBenefits: PassportBenefit[] }> {
    if (offlineCacheService.isOnline()) {
      try {
        const { data, error } = await supabase
          .from('passport_stamps')
          .insert([{
            user_id: checkinData.user_id,
            route_id: checkinData.route_id,
            checkpoint_id: checkinData.checkpoint_id,
            latitude: checkinData.latitude,
            longitude: checkinData.longitude,
            stamp_type: 'route_checkin',
            stamped_at: checkinData.checkin_at
          }])
          .select()
          .single();

        if (error) throw error;

        const passport = await this.getPassport(checkinData.user_id);
        const newPoints = (passport?.points || 0) + 10; // Suponha pontos para o check-in
        const newLevel = this.calculateLevel(newPoints);
        const newUnlockedBenefits = await this.checkUnlockedBenefits(newPoints, newLevel);
        const newBenefitsIds = newUnlockedBenefits.map(b => b.id);

        // Atualizar passaporte com base no check-in
        await supabase
          .from('tourism_passports')
          .update({
            points: newPoints,
            level: newLevel,
            benefits_unlocked: newBenefitsIds,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', checkinData.user_id);
        
        // --- ATRIBUIÇÃO DE RECOMPENSAS CUSTOMIZADAS APÓS AÇÃO DO USUÁRIO ---
        await this._checkAndAssignCustomRewards(checkinData.user_id, (passport?.total_visits || 0) + 1, newPoints); // Passa total_visits atualizado
        // --- FIM DA ATRIBUIÇÃO ---

        return {
          checkpoint: {
            id: data.id,
            name: 'Check-in', // Nome genérico para o checkpoint
            location: { address: '', city: '', coordinates: { lat: data.latitude || 0, lng: data.longitude || 0 } },
            category: 'aventura',
            points_reward: 10,
            completed_at: data.stamped_at,
          } as PassportCheckpoint, // Cast para PassportCheckpoint
          newUnlockedBenefits,
        };
      } catch (error) {
        console.warn("Erro ao criar checkin online, salvando offline:", error);
        // Salva offline se houver erro
        const stamp: UserStamp = {
          id: `offline-stamp-${Date.now()}`,
          user_id: checkinData.user_id,
          route_id: checkinData.route_id,
          checkpoint_id: checkinData.checkpoint_id,
          stamp_name: `Check-in em ${checkinData.checkpoint_id}`,
          earned_at: new Date().toISOString(),
          latitude: checkinData.latitude,
          longitude: checkinData.longitude,
          sync_status: 'pending_create', // Marcar como pendente de criação
        };
        await offlineCacheService.addStampToCache(stamp);

        return {
          checkpoint: {
            id: stamp.id,
            name: 'Check-in Offline',
            location: { address: '', city: '', coordinates: { lat: stamp.latitude || 0, lng: stamp.longitude || 0 } },
            category: 'aventura',
            points_reward: 0,
            completed_at: stamp.earned_at,
          } as PassportCheckpoint,
          newUnlockedBenefits: [],
        };
      }
    } else {
      // Se estiver offline, salva diretamente no cache
      const stamp: UserStamp = {
        id: `offline-stamp-${Date.now()}`,
        user_id: checkinData.user_id,
        route_id: checkinData.route_id,
        checkpoint_id: checkinData.checkpoint_id,
        stamp_name: `Check-in em ${checkinData.checkpoint_id}`,
        earned_at: new Date().toISOString(),
        latitude: checkinData.latitude,
        longitude: checkinData.longitude,
        sync_status: 'pending_create', // Marcar como pendente de criação
      };
      await offlineCacheService.addStampToCache(stamp);

      return {
        checkpoint: {
          id: stamp.id,
          name: 'Check-in Offline',
          location: { address: '', city: '', coordinates: { lat: stamp.latitude || 0, lng: stamp.longitude || 0 } },
          category: 'aventura',
          points_reward: 0,
          completed_at: stamp.earned_at,
        } as PassportCheckpoint,
        newUnlockedBenefits: [],
      };
    }
  }

  // Calcular nível baseado nos pontos
  private calculateLevel(points: number): 'bronze' | 'prata' | 'ouro' | 'diamante' {
    if (points >= 1000) return 'diamante';
    if (points >= 500) return 'ouro';
    if (points >= 200) return 'prata';
    return 'bronze';
  }

  // Verificar benefícios desbloqueados
  private async checkUnlockedBenefits(points: number, level: string): Promise<PassportBenefit[]> {
    try {
      const { data: benefits, error } = await supabase
        .from('passport_benefits')
        .select('*')
        .eq('active', true)
        .lte('points_required', points)
        .eq('level_required', level);

      if (error) throw error;

      return benefits || [];
    } catch (error) {
      console.error('❌ Erro ao verificar benefícios:', error);
      return [];
    }
  }

  // Buscar benefícios disponíveis
  async getAvailableBenefits(userId: string): Promise<PassportBenefit[]> {
    try {
      const passport = await this.getPassport(userId);
      if (!passport) throw new Error('Passaporte não encontrado');

      const { data, error } = await supabase
        .from('passport_benefits')
        .select('*')
        .eq('active', true)
        .lte('points_required', passport.points)
        .eq('level_required', passport.level);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar benefícios:', error);
      throw error;
    }
  }

  // Buscar desafios disponíveis
  async getAvailableChallenges(userId: string): Promise<PassportChallenge[]> {
    try {
      const passport = await this.getPassport(userId);
      if (!passport) throw new Error('Passaporte não encontrado');

      const { data, error } = await supabase
        .from('passport_challenges')
        .select('*')
        .eq('active', true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      if (error) throw error;

      // Filtrar desafios que o usuário pode completar
      const availableChallenges = data?.filter(challenge => {
        const requirements = challenge.requirements;
        
        // Verificar checkpoints necessários
        if (passport.checkpoints_completed.length < requirements.checkpoints_required) {
          return false;
        }

        // Verificar cidades necessárias
        if (passport.cities_visited.length < requirements.cities_required) {
          return false;
        }

        // Verificar categorias necessárias
        const userCategories = [...new Set(passport.checkpoints_completed.map(cp => cp.category))];
        const hasAllCategories = requirements.categories_required.every(cat => 
          userCategories.includes(cat)
        );

        return hasAllCategories;
      }) || [];

      return availableChallenges;
    } catch (error) {
      console.error('❌ Erro ao buscar desafios:', error);
      throw error;
    }
  }

  // Completar desafio
  async completeChallenge(userId: string, challengeId: string): Promise<void> {
    try {
      const passport = await this.getPassport(userId);
      if (!passport) throw new Error('Passaporte não encontrado');

      const { data: challenge, error: challengeError } = await supabase
        .from('passport_challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (challengeError) throw challengeError;

      // Verificar se o desafio já foi completado
      const { data: existingCompletion } = await supabase
        .from('challenge_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .single();

      if (existingCompletion) {
        throw new Error('Desafio já foi completado');
      }

      // Registrar conclusão do desafio
      await supabase
        .from('challenge_completions')
        .insert([{
          user_id: userId,
          challenge_id: challengeId,
          completed_at: new Date().toISOString()
        }]);

      // Adicionar pontos ao passaporte
      const newPoints = passport.points + challenge.points_reward;
      const newLevel = this.calculateLevel(newPoints);
      const unlockedBenefits = await this.checkUnlockedBenefits(newPoints, newLevel); // Obter objetos de benefício
      const newBenefitsIds = unlockedBenefits.map(b => b.id); // Mapear para IDs para o DB

      await supabase
        .from('tourism_passports')
        .update({
          points: newPoints,
          level: newLevel,
          benefits_unlocked: newBenefitsIds, // Armazenar apenas IDs no DB
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      // --- ATRIBUIÇÃO DE RECOMPENSAS CUSTOMIZADAS APÓS AÇÃO DO USUÁRIO ---
      await this._checkAndAssignCustomRewards(userId, passport.total_visits, newPoints); // total_visits não muda aqui, mas os pontos sim.
      // --- FIM DA ATRIBUIÇÃO ---

      console.log(`✅ Desafio completado: ${challenge.name} (+${challenge.points_reward} pontos)`);
    } catch (error) {
      console.error('❌ Erro ao completar desafio:', error);
      throw error;
    }
  }

  // Gerar relatório do passaporte com IA
  async generatePassportReport(userId: string): Promise<string> {
    try {
      const passport = await this.getPassport(userId);
      if (!passport) throw new Error('Passaporte não encontrado');

      const prompt = `
Você é um especialista em turismo de Mato Grosso do Sul. Analise o passaporte turístico do usuário e gere um relatório personalizado.

DADOS DO PASSAPORTE:
- Nível: ${passport.level}
- Pontos: ${passport.points}
- Total de visitas: ${passport.total_visits}
- Cidades visitadas: ${passport.cities_visited.join(', ')}
- Atrações visitadas: ${passport.attractions_visited.length}
- Checkpoints completados: ${passport.checkpoints_completed.length}

CHECKPOINTS COMPLETADOS:
${passport.checkpoints_completed.map(cp => `- ${cp.name} (${cp.category}) - ${cp.location.city}`).join('\n')}

BENEFÍCIOS DESBLOQUEADOS:
${passport.benefits_unlocked.join(', ')}

INSTRUÇÕES:
1. Analise o perfil turístico do usuário
2. Identifique padrões de preferência
3. Sugira próximos destinos baseado no histórico
4. Recomende desafios para ganhar mais pontos
5. Destaque conquistas importantes
6. Forneça dicas para maximizar a experiência
7. Sugira roteiros personalizados

Responda em português brasileiro de forma motivacional e envolvente.
`;

      const report = await geminiClient.generateContent(prompt);
      
      if (!report.ok) {
        throw new Error(`Erro na geração do relatório: ${report.error}`);
      }
      return report;
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      throw error;
    }
  }

  // Buscar estatísticas do passaporte
  async getPassportStats(userId: string): Promise<{
    total_points: number;
    level: string;
    checkpoints_completed: number;
    cities_visited: number;
    benefits_unlocked: number;
    challenges_completed: number;
    progress_to_next_level: {
      current_level: string;
      next_level: string;
      points_needed: number;
      progress_percentage: number;
    };
  }> {
    try {
      const passport = await this.getPassport(userId);
      if (!passport) throw new Error('Passaporte não encontrado');

      // Calcular progresso para próximo nível
      const levelThresholds = {
        bronze: 0,
        prata: 200,
        ouro: 500,
        diamante: 1000
      };

      const currentThreshold = levelThresholds[passport.level as keyof typeof levelThresholds];
      const nextLevel = this.getNextLevel(passport.level);
      const nextThreshold = levelThresholds[nextLevel as keyof typeof levelThresholds];
      const pointsNeeded = nextThreshold - passport.points;
      const progressPercentage = Math.min(100, (passport.points - currentThreshold) / (nextThreshold - currentThreshold) * 100);

      // Buscar desafios completados
      const { data: completedChallenges } = await supabase
        .from('challenge_completions')
        .select('*')
        .eq('user_id', userId);

      return {
        total_points: passport.points,
        level: passport.level,
        checkpoints_completed: passport.checkpoints_completed.length,
        cities_visited: passport.cities_visited.length,
        benefits_unlocked: passport.benefits_unlocked.length,
        challenges_completed: completedChallenges?.length || 0,
        progress_to_next_level: {
          current_level: passport.level,
          next_level: nextLevel,
          points_needed: pointsNeeded,
          progress_percentage: progressPercentage
        }
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  // Obter próximo nível
  private getNextLevel(currentLevel: string): string {
    switch (currentLevel) {
      case 'bronze': return 'prata';
      case 'prata': return 'ouro';
      case 'ouro': return 'diamante';
      default: return 'diamante';
    }
  }

  // Buscar ranking de passaportes
  async getPassportRanking(limit: number = 10): Promise<{
    user_id: string;
    passport_number: string;
    level: string;
    points: number;
    total_visits: number;
    rank: number;
  }[]> {
    try {
      const { data, error } = await supabase
        .from('tourism_passports')
        .select('user_id, passport_number, level, points, total_visits')
        .order('points', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((passport, index) => ({
        ...passport,
        rank: index + 1
      }));
    } catch (error) {
      console.error('❌ Erro ao buscar ranking:', error);
      throw error;
    }
  }

  // Buscar carimbos do usuário
  async getUserStamps(userId: string): Promise<UserStamp[]> {
    try {
      const { data, error } = await supabase
        .from('passport_stamps')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar carimbos do usuário:', error);
      throw error;
    }
  }

  // Atualizar carimbo do usuário online
  async updateUserStampOnline(stamp: UserStamp): Promise<UserStamp> {
    try {
      const { data, error } = await supabase
        .from('passport_stamps')
        .update({
          route_id: stamp.route_id,
          city_id: stamp.city_id,
          region_id: stamp.region_id,
          stamp_name: stamp.stamp_name,
          stamp_icon_url: stamp.stamp_icon_url,
          earned_at: stamp.earned_at,
          completion_percentage: stamp.completion_percentage,
          cultural_phrase: stamp.cultural_phrase,
          animal_id: stamp.animal_id,
          // Não atualiza created_at, mas atualiza updated_at automaticamente pelo Supabase
        })
        .eq('id', stamp.id)
        .select()
        .single();

      if (error) throw error;

      return data as UserStamp; // Retorna o objeto atualizado
    } catch (error) {
      console.error('❌ Erro ao atualizar carimbo do usuário online:', error);
      throw error;
    }
  }

  // Excluir carimbo do usuário online
  async deleteUserStampOnline(stampId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('passport_stamps')
        .delete()
        .eq('id', stampId);

      if (error) throw error;
      console.log(`✅ Carimbo ${stampId} excluído com sucesso do backend.`);
    } catch (error) {
      console.error('❌ Erro ao excluir carimbo do usuário online:', error);
      throw error;
    }
  }

  private async _checkAndAssignCustomRewards(
    userId: string,
    totalVisits: number,
    totalPoints: number
  ): Promise<void> {
    try {
      const activeRewards = await rewardService.listRewards(true); // Buscar apenas recompensas ativas
      
      for (const reward of activeRewards) {
        const hasReceived = await rewardService.hasUserReceivedReward(userId, reward.id);
        if (!hasReceived) {
          let eligible = false;
          const criteria = reward.criteria; // Critérios definidos pelo gestor

          if (criteria.type === 'checkin_count' && typeof criteria.count === 'number') {
            if (totalVisits >= criteria.count) {
              eligible = true;
            }
          } else if (criteria.type === 'points_milestone' && typeof criteria.points === 'number') {
            if (totalPoints >= criteria.points) {
              eligible = true;
            }
          }
          // Adicionar outras lógicas de critério aqui (ex: route_completion, category_visits, etc.)

          if (eligible) {
            await rewardService.assignRewardToUser(userId, reward.id, `Critério: ${criteria.type} (${JSON.stringify(criteria)})` );
            console.log(`🎉 Recompensa '${reward.name}' atribuída ao usuário ${userId}`);
            
            // Notificação Toast para o usuário
            toast({
              title: "Recompensa Desbloqueada! 🎉",
              description: `Você ganhou a recompensa: ${reward.name}! ${reward.local_resgate ? `Resgate em: ${reward.local_resgate}` : ''}`,
              duration: 5000,
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar e atribuir recompensas customizadas:', error);
    }
  }
}

// Instância singleton
export const tourismPassportService = new TourismPassportService();

// Export individual functions for backward compatibility
export const createUserCheckin = tourismPassportService.createUserCheckin.bind(tourismPassportService);
export const updateUserStampOnline = tourismPassportService.updateUserStampOnline.bind(tourismPassportService);
export const deleteUserStampOnline = tourismPassportService.deleteUserStampOnline.bind(tourismPassportService);