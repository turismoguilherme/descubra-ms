// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, User, Building2 } from 'lucide-react';
import { ReservationMessageService, ReservationMessage } from '@/services/partners/reservationMessageService';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface ReservationChatProps {
  reservationId: string;
  reservationCode: string;
  guestName?: string;
  guestEmail?: string;
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Quem está usando o chat: cliente (guest) ou anfitrião (partner) */
  currentUserType: 'guest' | 'partner';
}

export const ReservationChat: React.FC<ReservationChatProps> = ({
  reservationId,
  reservationCode,
  guestName,
  guestEmail,
  partnerId,
  partnerName,
  partnerEmail,
  open,
  onOpenChange,
  currentUserType,
}) => {
  const { user } = useAuth();
  const isPartner = currentUserType === 'partner';
  const senderType = currentUserType;
  const [messages, setMessages] = useState<ReservationMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && reservationId) {
      loadMessages();
      const unsubscribe = subscribeToMessages();
      return unsubscribe;
    }
  }, [open, reservationId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await ReservationMessageService.getMessages(reservationId);
      setMessages(data);

      // Marcar mensagens como lidas
      if (user) {
        await ReservationMessageService.markAsRead(reservationId, senderType);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`reservation_messages_${reservationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reservation_messages',
          filter: `reservation_id=eq.${reservationId}`,
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await ReservationMessageService.sendMessage(
        reservationId,
        senderType,
        isPartner ? partnerId : user?.id,
        isPartner ? partnerName : (guestName || 'Cliente'),
        isPartner ? partnerEmail : (guestEmail || user?.email || ''),
        newMessage.trim()
      );

      setNewMessage('');
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-ms-primary-blue" />
            Chat - Reserva {reservationCode}
          </DialogTitle>
          <DialogDescription>
            {isPartner 
              ? `Conversa sobre a reserva com ${guestName || 'cliente'}`
              : `Conversa sobre a reserva com ${partnerName || 'parceiro'}`
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-primary-blue mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando mensagens...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Nenhuma mensagem ainda</p>
              <p className="text-xs text-gray-400 mt-2">
                Inicie a conversa enviando uma mensagem
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((message) => {
                const fromPartner = message.sender_type === 'partner';
                const isSystem = message.sender_type === 'system';
                const isMine = message.sender_type === currentUserType;

                return (
                  <div
                    key={message.id}
                    className={cn('flex gap-3', isMine && 'flex-row-reverse')}
                  >
                    <div className={cn(
                      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                      isSystem ? 'bg-muted' : fromPartner ? 'bg-primary' : 'bg-secondary'
                    )}>
                      {isSystem ? (
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      ) : fromPartner ? (
                        <Building2 className="w-4 h-4 text-primary-foreground" />
                      ) : (
                        <User className="w-4 h-4 text-secondary-foreground" />
                      )}
                    </div>
                    <div className={cn('flex-1 max-w-[70%]', isMine && 'items-end flex flex-col')}>
                      <p className="text-xs text-muted-foreground mb-1 px-1">{message.sender_name}</p>
                      <div className={cn(
                        'rounded-lg px-4 py-2',
                        isMine
                          ? 'bg-primary text-primary-foreground'
                          : isSystem
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      )}>
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.message}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 px-1">
                        {format(new Date(message.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <div className="px-6 pb-6 pt-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={sending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-ms-primary-blue hover:bg-ms-primary-blue/90"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
