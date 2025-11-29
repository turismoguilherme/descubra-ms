
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { InteractionData } from './types';
import { logger } from '@/utils/logger';

class InteractionTrackerService {
  private static instance: InteractionTrackerService;
  private sessionId: string;

  private constructor() {
    this.sessionId = this.getSessionId();
    logger.dev(`📡 InteractionTrackerService inicializado com Session ID: ${this.sessionId}`);
  }

  public static getInstance(): InteractionTrackerService {
    if (!InteractionTrackerService.instance) {
      InteractionTrackerService.instance = new InteractionTrackerService();
    }
    return InteractionTrackerService.instance;
  }

  private getSessionId(): string {
    let sid = sessionStorage.getItem('app_session_id');
    if (!sid) {
      sid = uuidv4();
      sessionStorage.setItem('app_session_id', sid);
    }
    return sid;
  }

  public async track(data: InteractionData): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    // Só rastreia se o usuário estiver logado
    if (!user) {
      // console.log("Usuário não logado. Interação não rastreada.");
      return;
    }

    const interactionPayload = {
      ...data,
      user_id: user.id,
      session_id: this.sessionId,
      path: data.path || window.location.pathname,
    };

    try {
      const { error } = await supabase
        .from('user_interactions')
        .insert(interactionPayload);

      if (error) {
        console.error('❌ Erro ao rastrear interação:', error);
      }
    } catch (e) {
      console.error('❌ Exceção ao rastrear interação:', e);
    }
  }
}

export const InteractionTracker = InteractionTrackerService.getInstance(); 