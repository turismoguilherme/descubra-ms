/**
 * Security Alert Component
 * Displays security-related notifications to users
 */
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { securityMonitor } from '@/utils/securityMonitor';

interface SecurityAlertProps {
  onSecurityEvent?: (event: string) => void;
}

export const SecurityAlert = ({ onSecurityEvent }: SecurityAlertProps) => {
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'warning' | 'error';
    message: string;
    timestamp: number;
  }>>([]);

  useEffect(() => {
    // Monitor for suspicious activities
    const checkSecurityStatus = () => {
      // Check session integrity
      const currentTime = Date.now();
      const lastActivity = localStorage.getItem('lastActivity');
      
      if (lastActivity) {
        const timeDiff = currentTime - parseInt(lastActivity);
        const thirtyMinutes = 30 * 60 * 1000;
        
        if (timeDiff > thirtyMinutes) {
          // Long inactivity detected
          setAlerts(prev => [...prev, {
            id: `security-${currentTime}`,
            type: 'warning',
            message: 'Sessão inativa detectada. Por segurança, considere fazer login novamente.',
            timestamp: currentTime
          }]);
          
          onSecurityEvent?.('session_inactive');
        }
      }

      // Update last activity
      localStorage.setItem('lastActivity', currentTime.toString());
    };

    // Check security status periodically
    const interval = setInterval(checkSecurityStatus, 5 * 60 * 1000); // Every 5 minutes
    
    // Initial check
    checkSecurityStatus();

    return () => {
      clearInterval(interval);
    };
  }, [onSecurityEvent]);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {alerts.map(alert => (
        <Alert 
          key={alert.id} 
          variant={alert.type === 'error' ? 'destructive' : 'default'}
          className="animate-in slide-in-from-right"
        >
          {alert.type === 'error' ? 
            <AlertTriangle className="h-4 w-4" /> : 
            <Shield className="h-4 w-4" />
          }
          <AlertDescription className="flex items-center justify-between">
            <span className="flex-1">{alert.message}</span>
            <button 
              onClick={() => dismissAlert(alert.id)}
              className="ml-2 text-xs opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};