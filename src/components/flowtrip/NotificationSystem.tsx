
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Zap, Star, MapPin } from 'lucide-react';
import { useFlowTrip } from '@/context/FlowTripContext';

interface Notification {
  id: string;
  type: 'points' | 'level' | 'achievement' | 'stamp';
  title: string;
  message: string;
  icon: React.ReactNode;
  duration?: number;
}

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { userLevel, passportStamps } = useFlowTrip();

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, notification.duration || 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Listen for changes in user data
  useEffect(() => {
    // This would be triggered by context updates
    // For now, we'll simulate notifications
    const handlePointsGained = () => {
      addNotification({
        type: 'points',
        title: 'Pontos Ganhos!',
        message: 'Você ganhou 25 pontos',
        icon: <Zap className="h-5 w-5 text-yellow-500" />
      });
    };

    // Simulate notifications for demo
    const interval = setInterval(() => {
      const randomEvents = [
        () => addNotification({
          type: 'stamp',
          title: 'Novo Selo!',
          message: 'Parabéns! Você coletou um novo selo digital',
          icon: <MapPin className="h-5 w-5 text-green-500" />
        }),
        () => addNotification({
          type: 'achievement',
          title: 'Conquista Desbloqueada!',
          message: 'Você desbloqueou "Explorador Iniciante"',
          icon: <Trophy className="h-5 w-5 text-purple-500" />
        }),
        () => addNotification({
          type: 'level',
          title: 'Subiu de Nível!',
          message: 'Parabéns! Você agora é um Explorador',
          icon: <Star className="h-5 w-5 text-blue-500" />
        })
      ];

      // Random chance to show notification
      if (Math.random() > 0.7) {
        const randomEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        randomEvent();
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'points': return 'border-yellow-200 bg-yellow-50';
      case 'level': return 'border-blue-200 bg-blue-50';
      case 'achievement': return 'border-purple-200 bg-purple-50';
      case 'stamp': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`border rounded-lg p-4 shadow-lg backdrop-blur-sm ${getNotificationColor(notification.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {notification.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                </div>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem;
