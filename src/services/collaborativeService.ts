import { supabase } from '@/integrations/supabase/client';

export interface CollaborationSession {
  id: string;
  title: string;
  description: string;
  participants: string[];
  created_by: string;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
  shared_resources: SharedResource[];
  chat_messages: ChatMessage[];
}

export interface SharedResource {
  id: string;
  name: string;
  type: 'document' | 'image' | 'link' | 'file';
  url: string;
  uploaded_by: string;
  uploaded_at: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  message: string;
  timestamp: string;
  type: 'text' | 'system' | 'file_shared' | 'action';
}

export interface CollaborationInvite {
  id: string;
  session_id: string;
  invited_user: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  expires_at: string;
}

export interface RealTimeUpdate {
  type: 'user_joined' | 'user_left' | 'message_sent' | 'resource_shared' | 'session_updated';
  data: any;
  timestamp: string;
}

class CollaborativeService {
  private realtimeSubscription: any = null;
  private callbacks: Map<string, Function[]> = new Map();

  // Criar sessão de colaboração
  async createCollaborationSession(
    title: string,
    description: string,
    participants: string[] = []
  ): Promise<CollaborationSession> {
    try {
      const session: CollaborationSession = {
        id: `session_${Date.now()}`,
        title,
        description,
        participants,
        created_by: 'current-user', // TODO: pegar do contexto de autenticação
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        shared_resources: [],
        chat_messages: []
      };

      // Simular salvamento no banco
      await new Promise(resolve => setTimeout(resolve, 500));

      // Notificar participantes
      this.notifyParticipants(session, 'session_created');

      return session;
    } catch (error) {
      console.error('Error creating collaboration session:', error);
      throw error;
    }
  }

  // Convidar usuário para sessão
  async inviteUserToSession(
    sessionId: string,
    userId: string,
    invitedBy: string
  ): Promise<CollaborationInvite> {
    try {
      const invite: CollaborationInvite = {
        id: `invite_${Date.now()}`,
        session_id: sessionId,
        invited_user: userId,
        invited_by: invitedBy,
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
      };

      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 300));

      // Notificar usuário convidado
      this.notifyUser(userId, {
        type: 'collaboration_invite',
        data: invite,
        timestamp: new Date().toISOString()
      });

      return invite;
    } catch (error) {
      console.error('Error inviting user to session:', error);
      throw error;
    }
  }

  // Enviar mensagem no chat
  async sendChatMessage(
    sessionId: string,
    userId: string,
    userName: string,
    message: string
  ): Promise<ChatMessage> {
    try {
      const chatMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        session_id: sessionId,
        user_id: userId,
        user_name: userName,
        message,
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 200));

      // Notificar todos os participantes
      this.notifySessionParticipants(sessionId, {
        type: 'message_sent',
        data: chatMessage,
        timestamp: new Date().toISOString()
      });

      return chatMessage;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  // Compartilhar recurso
  async shareResource(
    sessionId: string,
    name: string,
    type: 'document' | 'image' | 'link' | 'file',
    url: string,
    uploadedBy: string,
    description?: string
  ): Promise<SharedResource> {
    try {
      const resource: SharedResource = {
        id: `resource_${Date.now()}`,
        name,
        type,
        url,
        uploaded_by: uploadedBy,
        uploaded_at: new Date().toISOString(),
        description
      };

      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 400));

      // Notificar participantes
      this.notifySessionParticipants(sessionId, {
        type: 'resource_shared',
        data: resource,
        timestamp: new Date().toISOString()
      });

      return resource;
    } catch (error) {
      console.error('Error sharing resource:', error);
      throw error;
    }
  }

  // Subscrever a atualizações em tempo real
  subscribeToSessionUpdates(sessionId: string, callback: (update: RealTimeUpdate) => void) {
    const eventKey = `session_${sessionId}`;
    this.addCallback(eventKey, callback);

    // Simular conexão em tempo real
    const interval = setInterval(() => {
      // Simular atualizações ocasionais
      if (Math.random() < 0.1) { // 10% de chance a cada segundo
        callback({
          type: 'session_updated',
          data: { sessionId, timestamp: new Date().toISOString() },
          timestamp: new Date().toISOString()
        });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      this.removeCallback(eventKey, callback);
    };
  }

  // Sistema de callbacks
  private addCallback(event: string, callback: Function) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  private removeCallback(event: string, callback: Function) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private triggerCallbacks(event: string, data: any) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Notificações
  private notifyParticipants(session: CollaborationSession, event: string) {
    session.participants.forEach(participant => {
      this.notifyUser(participant, {
        type: event,
        data: session,
        timestamp: new Date().toISOString()
      });
    });
  }

  private notifySessionParticipants(sessionId: string, update: RealTimeUpdate) {
    this.triggerCallbacks(`session_${sessionId}`, update);
  }

  private notifyUser(userId: string, notification: any) {
    // Simular notificação para usuário
    console.log(`📧 Notificação para ${userId}:`, notification);
  }

  // Funcionalidades avançadas
  async getSessionAnalytics(sessionId: string) {
    try {
      // Simular análise de sessão
      return {
        total_messages: Math.floor(Math.random() * 100),
        active_participants: Math.floor(Math.random() * 10) + 1,
        shared_resources: Math.floor(Math.random() * 20),
        session_duration: Math.floor(Math.random() * 120) + 30, // minutos
        engagement_score: Math.floor(Math.random() * 40) + 60 // 60-100
      };
    } catch (error) {
      console.error('Error getting session analytics:', error);
      return null;
    }
  }

  async exportSessionData(sessionId: string) {
    try {
      // Simular exportação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        session_id: sessionId,
        exported_at: new Date().toISOString(),
        format: 'json',
        size: '2.3 MB',
        download_url: `/exports/session_${sessionId}.json`
      };
    } catch (error) {
      console.error('Error exporting session data:', error);
      throw error;
    }
  }

  // Limpeza de recursos
  cleanup() {
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
    }
    this.callbacks.clear();
  }
}

export const collaborativeService = new CollaborativeService();

