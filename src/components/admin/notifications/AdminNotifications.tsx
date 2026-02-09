import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Carregar notificações do localStorage ou banco de dados
    loadNotifications();
    
    // Listener para novas notificações em tempo real
    const handleNewNotification = (e: Event) => {
      const customEvent = e as CustomEvent<Notification>;
      if (customEvent.detail) {
        setNotifications(prev => [customEvent.detail, ...prev].slice(0, 50));
      }
    };
    
    window.addEventListener('admin-notification-added', handleNewNotification as EventListener);
    
    // Verificar novas notificações a cada 30 segundos
    const interval = setInterval(checkNewNotifications, 30000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('admin-notification-added', handleNewNotification as EventListener);
    };
  }, []);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const loadNotifications = async () => {
    // Por enquanto, usar localStorage. Em produção, buscar do banco de dados
    const saved = localStorage.getItem('admin_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Array<Record<string, unknown>>;
        const loaded: Notification[] = parsed.map((n) => ({
          id: String(n.id || ''),
          type: (n.type as Notification['type']) || 'info',
          title: String(n.title || ''),
          message: String(n.message || ''),
          timestamp: new Date(String(n.timestamp)),
          read: Boolean(n.read),
          action: n.action ? {
            label: String(n.action.label || ''),
            onClick: typeof n.action.onClick === 'function' ? n.action.onClick : () => {}
          } : undefined,
        }));
        setNotifications(loaded);
      } catch (e) {
        console.error('Erro ao carregar notificações:', e);
        setNotifications([]);
      }
    } else {
      setNotifications([]);
    }
  };

  const checkNewNotifications = async () => {
    // Verificar se há novas notificações do sistema
    // Por enquanto, apenas verificar erros do console ou eventos do sistema
    // Em produção, fazer polling do banco de dados ou usar WebSockets
  };

  const saveNotifications = (currentNotifications: Notification[]) => {
    const toSave = currentNotifications.map(n => ({
      ...n,
      timestamp: n.timestamp instanceof Date ? n.timestamp.toISOString() : n.timestamp,
    }));
    localStorage.setItem('admin_notifications', JSON.stringify(toSave));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveNotifications(updated);
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      saveNotifications(updated);
      return updated;
    });
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Painel de notificações */}
          <Card className="absolute right-0 top-12 z-50 w-96 max-h-[600px] shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notificações</CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Marcar todas como lidas
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                    <Bell className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-sm">Nenhuma notificação</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-4 hover:bg-gray-50 transition-colors',
                          !notification.read && 'bg-blue-50/50',
                          getTypeColor(notification.type)
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className={cn(
                                  'text-sm font-medium',
                                  !notification.read && 'font-semibold'
                                )}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {notification.timestamp.toLocaleString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                {notification.action && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 mt-2 text-xs"
                                    onClick={() => {
                                      notification.action?.onClick();
                                      markAsRead(notification.id);
                                    }}
                                  >
                                    {notification.action.label}
                                  </Button>
                                )}
                              </div>
                              <div className="flex items-start gap-1">
                                {!notification.read && (
                                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-1" />
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => removeNotification(notification.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// Função helper para adicionar notificações
export const addAdminNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    timestamp: new Date(),
    read: false,
  };

  // Salvar no localStorage
  const saved = localStorage.getItem('admin_notifications');
  const notifications = saved ? JSON.parse(saved) : [];
  notifications.unshift(newNotification);
  
  // Manter apenas as últimas 50 notificações
  if (notifications.length > 50) {
    notifications.splice(50);
  }
  
  localStorage.setItem('admin_notifications', JSON.stringify(notifications));

  // Mostrar toast também
  const toastFn = notification.type === 'error' ? toast.error : 
                  notification.type === 'warning' ? toast.warning :
                  notification.type === 'success' ? toast.success : toast.info;
  
  toastFn(notification.title, {
    description: notification.message,
    duration: 5000,
  });

  // Disparar evento customizado para atualizar o componente
  window.dispatchEvent(new CustomEvent('admin-notification-added', { detail: newNotification }));
};
