import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check, X, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { PartnerNotificationService, PartnerNotification } from '@/services/partners/partnerNotificationService';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface PartnerNotificationsProps {
  partnerId: string;
}

export const PartnerNotifications: React.FC<PartnerNotificationsProps> = ({ partnerId }) => {
  const [notifications, setNotifications] = useState<PartnerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
    subscribeToRealtime();
    
    return () => {
      // Cleanup subscription
    };
  }, [partnerId]);

  const loadNotifications = async () => {
    try {
      const [allNotifications, count] = await Promise.all([
        PartnerNotificationService.getNotifications(partnerId, false),
        PartnerNotificationService.getUnreadCount(partnerId),
      ]);

      setNotifications(allNotifications.slice(0, 20)); // Últimas 20
      setUnreadCount(count);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const subscribeToRealtime = () => {
    // Subscrever a novas reservas
    const reservationChannel = supabase
      .channel(`partner_reservations_${partnerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'partner_reservations',
          filter: `partner_id=eq.${partnerId}`,
        },
        (payload) => {
          console.log('🔔 Nova reserva criada:', payload);
          loadNotifications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'partner_reservations',
          filter: `partner_id=eq.${partnerId}`,
        },
        (payload) => {
          console.log('🔔 Reserva atualizada:', payload);
          if (payload.new.status === 'confirmed' || payload.new.status === 'cancelled') {
            loadNotifications();
          }
        }
      )
      .subscribe();

    // Subscrever a novas notificações
    const notificationChannel = supabase
      .channel(`partner_notifications_${partnerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'partner_notifications',
          filter: `partner_id=eq.${partnerId}`,
        },
        (payload) => {
          console.log('🔔 Nova notificação:', payload);
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      reservationChannel.unsubscribe();
      notificationChannel.unsubscribe();
    };
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await PartnerNotificationService.markAsRead(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await PartnerNotificationService.markAllAsRead(partnerId);
      loadNotifications();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const handleNotificationClick = (notification: PartnerNotification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    if (notification.action_url) {
      navigate(notification.action_url);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: PartnerNotification['type']) => {
    switch (type) {
      case 'new_reservation':
      case 'reservation_confirmed':
        return <Calendar className="w-4 h-4" />;
      case 'commission_paid':
      case 'subscription_payment':
      case 'payout_completed':
        return <DollarSign className="w-4 h-4" />;
      case 'subscription_expiring':
      case 'system_alert':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: PartnerNotification['type']) => {
    switch (type) {
      case 'new_reservation':
        return 'text-ms-cerrado-orange';
      case 'reservation_confirmed':
      case 'commission_paid':
      case 'payout_completed':
        return 'text-ms-pantanal-green';
      case 'reservation_cancelled':
        return 'text-red-600';
      case 'subscription_expiring':
      case 'system_alert':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 hover:bg-gray-50 cursor-pointer transition-colors',
                    !notification.read && 'bg-blue-50/50'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'p-2 rounded-lg mt-0.5',
                      notification.type === 'new_reservation' ? 'bg-ms-cerrado-orange/10' :
                      notification.type === 'commission_paid' ? 'bg-ms-pantanal-green/10' :
                      'bg-gray-100'
                    )}>
                      <div className={cn('w-4 h-4', getNotificationColor(notification.type))}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={cn(
                            'font-semibold text-sm mb-1',
                            !notification.read && 'text-gray-900'
                          )}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {format(new Date(notification.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-ms-primary-blue flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      {notification.action_url && (
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-2 p-0 h-auto text-xs text-ms-primary-blue"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification);
                          }}
                        >
                          {notification.action_label || 'Ver detalhes'} →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
