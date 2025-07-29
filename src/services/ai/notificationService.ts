import { supabase } from '@/integrations/supabase/client';

interface EmailNotificationParams {
  to: string;
  subject: string;
  body: string;
  relatedTicketId?: string;
  aiGenerated?: boolean;
}

interface WhatsAppNotificationParams {
  to: string; // Formato: whatsapp:+<numero>
  body: string;
  relatedTicketId?: string;
  aiGenerated?: boolean;
}

export class NotificationService {

  async sendAutomatedEmail(params: EmailNotificationParams): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${supabase.functions.url}/send-email-via-gateway`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar e-mail automatizado.');
      }

      const data = await response.json();
      console.log('E-mail automatizado enviado:', data.message);
      return { success: true, message: data.message };

    } catch (error: any) {
      console.error('Falha ao enviar e-mail automatizado:', error);
      return { success: false, message: `Falha ao enviar e-mail: ${error.message}` };
    }
  }

  async sendAutomatedWhatsApp(params: WhatsAppNotificationParams): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${supabase.functions.url}/send-whatsapp-via-gateway`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar mensagem WhatsApp automatizada.');
      }

      const data = await response.json();
      console.log('Mensagem WhatsApp automatizada enviada:', data.message);
      return { success: true, message: data.message };

    } catch (error: any) {
      console.error('Falha ao enviar mensagem WhatsApp automatizada:', error);
      return { success: false, message: `Falha ao enviar mensagem WhatsApp: ${error.message}` };
    }
  }
} 