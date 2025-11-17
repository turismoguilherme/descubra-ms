/**
 * Proactive Notifications Component
 * Exibe notificações proativas baseadas em métricas e desempenho
 */

import React, { useState, useEffect } from 'react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  X,
  TrendingDown,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { proactiveNotificationsService, ProactiveNotification } from '@/services/private/proactiveNotificationsService';
import { AnalysisResult } from '@/services/diagnostic/analysisService';

interface ProactiveNotificationsProps {
  analysisResult: AnalysisResult | null;
  currentMetrics?: {
    occupancy?: number;
    revenue?: number;
    rating?: number;
    marketAverage?: {
      occupancy?: number;
      revenue?: number;
      rating?: number;
    };
  };
}

const ProactiveNotifications: React.FC<ProactiveNotificationsProps> = ({
  analysisResult,
  currentMetrics
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ProactiveNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [analysisResult, currentMetrics, user]);

  const loadNotifications = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Gerar notificações baseadas em análise atual
      const newNotifications = await proactiveNotificationsService.analyzeAndGenerateNotifications(
        analysisResult,
        currentMetrics
      );

      // Buscar notificações salvas não lidas
      const savedNotifications = await proactiveNotificationsService.getUserNotifications(user.id);

      // Combinar e remover duplicatas
      const allNotifications = [...newNotifications, ...savedNotifications];
      const uniqueNotifications = allNotifications.filter((notif, index, self) =>
        index === self.findIndex(n => n.id === notif.id)
      );

      setNotifications(uniqueNotifications);

      // Salvar novas notificações
      if (newNotifications.length > 0) {
        await proactiveNotificationsService.saveNotifications(user.id, newNotifications);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledge = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      await proactiveNotificationsService.acknowledgeNotification(notificationId, user.id);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const getNotificationIcon = (type: ProactiveNotification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: ProactiveNotification['type']) => {
    switch (type) {
      case 'warning':
        return 'border-amber-200 bg-amber-50';
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  if (isLoading) {
    return null;
  }

  if (notifications.length === 0) {
    return null;
  }

  return (
    <SectionWrapper
      variant="default"
      title="Notificações Proativas"
      subtitle="Alertas e recomendações baseadas no desempenho do seu negócio"
    >
      <div className="space-y-3">
        {notifications.slice(0, 5).map((notification) => (
          <CardBox key={notification.id} className={getNotificationColor(notification.type)}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-slate-800">{notification.title}</h4>
                  <Badge 
                    variant="secondary" 
                    className="rounded-full text-xs px-2 py-0.5"
                  >
                    {notification.priority}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">{notification.message}</p>
                <div className="flex items-center gap-2">
                  {notification.actionUrl && notification.actionLabel && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.location.href = notification.actionUrl!;
                      }}
                      className="rounded-full text-xs px-3 py-1"
                    >
                      {notification.actionLabel}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAcknowledge(notification.id)}
                    className="rounded-full text-xs px-3 py-1"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </CardBox>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default ProactiveNotifications;

