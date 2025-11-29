import React, { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, AlertTriangle, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { enhancedSecurityService } from "@/services/enhancedSecurityService";

interface SessionTimeoutWarningProps {
  warningTimeMinutes?: number;
  timeoutMinutes?: number;
  onExtendSession?: () => void;
  onForceLogout?: () => void;
}

export const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  warningTimeMinutes = 5,
  timeoutMinutes = 30,
  onExtendSession,
  onForceLogout
}) => {
  const { user, signOut } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(warningTimeMinutes * 60);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [warningTimer, setWarningTimer] = useState<NodeJS.Timeout | null>(null);
  const [logoutTimer, setLogoutTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Use refs to avoid dependency issues
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resetCountRef = useRef(0);

  // Reset activity and timers
  const resetTimers = useCallback(() => {
    // Log removido para reduzir verbosidade
    ++resetCountRef.current;
    
    const now = Date.now();
    setLastActivity(now);
    setShowWarning(false);
    setRemainingTime(warningTimeMinutes * 60);

    // Clear existing timers using refs
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    // Set new warning timer
    const warningDelay = (timeoutMinutes - warningTimeMinutes) * 60 * 1000;
    const newWarningTimer = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, warningDelay);
    warningTimerRef.current = newWarningTimer;

    // Set new logout timer
    const logoutDelay = timeoutMinutes * 60 * 1000;
    const newLogoutTimer = setTimeout(() => {
      handleAutoLogout();
    }, logoutDelay);
    logoutTimerRef.current = newLogoutTimer;
  }, [warningTimeMinutes, timeoutMinutes]);

  // Start countdown when warning is shown
  const startCountdown = useCallback(() => {
    const countdown = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          handleAutoLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  // Handle automatic logout
  const handleAutoLogout = useCallback(async () => {
    try {
      await enhancedSecurityService.logSecurityEvent({
        action: 'session_timeout_auto_logout',
        user_id: user?.id,
        success: true,
        metadata: {
          timeout_duration_minutes: timeoutMinutes,
          last_activity: new Date(lastActivity).toISOString(),
          logout_reason: 'session_timeout'
        }
      });

      if (onForceLogout) {
        onForceLogout();
      } else {
        await signOut();
        window.location.href = '/auth?message=session_expired';
      }
    } catch (error) {
      console.error('Auto logout failed:', error);
      // Force logout even if logging fails
      window.location.href = '/auth?message=session_expired';
    }
  }, [user?.id, timeoutMinutes, lastActivity, onForceLogout, signOut]);

  // Extend session
  const handleExtendSession = useCallback(async () => {
    try {
      await enhancedSecurityService.logSecurityEvent({
        action: 'session_extended',
        user_id: user?.id,
        success: true,
        metadata: {
          extension_timestamp: new Date().toISOString(),
          previous_warning_time: warningTimeMinutes,
          remaining_time_when_extended: remainingTime
        }
      });

      if (onExtendSession) {
        onExtendSession();
      }
      
      resetTimers();
    } catch (error) {
      console.error('Session extension failed:', error);
    }
  }, [user?.id, warningTimeMinutes, remainingTime, onExtendSession, resetTimers]);

  // Activity tracking - FIXED: Removed problematic dependencies
  useEffect(() => {
    if (!user) return;

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetTimers();
    };

    // Add throttling to prevent excessive resets
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledHandleActivity = () => {
      if (throttleTimeout) return;
      
      throttleTimeout = setTimeout(() => {
        handleActivity();
        throttleTimeout = null;
      }, 5000); // Throttle to once every 5 seconds
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, throttledHandleActivity, { passive: true });
    });

    // Initialize timers
    resetTimers();

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledHandleActivity);
      });
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [user]); // FIXED: Only depend on user, not on resetTimers or timers

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progressPercentage = ((warningTimeMinutes * 60 - remainingTime) / (warningTimeMinutes * 60)) * 100;

  if (!user || !showWarning) return null;

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="w-5 h-5" />
            Sessão Expirando
          </DialogTitle>
          <DialogDescription>
            Sua sessão expirará automaticamente por segurança
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Countdown Display */}
          <div className="text-center">
            <div className="text-4xl font-bold text-red-600 mb-2">
              {formatTime(remainingTime)}
            </div>
            <div className="text-sm text-muted-foreground">
              Tempo restante para logout automático
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground text-center">
              {Math.floor(progressPercentage)}% do tempo de aviso decorrido
            </div>
          </div>

          {/* Security Information */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Medida de Segurança:</strong> Sessões são limitadas para proteger sua conta. 
              Mova o mouse ou clique em qualquer lugar para manter a sessão ativa.
            </AlertDescription>
          </Alert>

          {/* Warning Levels */}
          {remainingTime <= 60 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção!</strong> Menos de 1 minuto restante. 
                Sua sessão será encerrada automaticamente.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleExtendSession}
              className="flex-1"
              variant="default"
            >
              <Clock className="w-4 h-4 mr-2" />
              Estender Sessão
            </Button>
            <Button
              onClick={handleAutoLogout}
              variant="outline"
              className="flex-1"
            >
              Sair Agora
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            <div>Última atividade: {new Date(lastActivity).toLocaleTimeString('pt-BR')}</div>
            <div>Tempo limite da sessão: {timeoutMinutes} minutos</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionTimeoutWarning;