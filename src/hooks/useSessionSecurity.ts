import { useEffect, useState, useCallback, useRef, useContext } from "react";
import { AuthContext } from "@/hooks/auth/AuthContext";
import { securityService } from "@/services/securityService";
import { useToast } from "@/components/ui/use-toast";

interface UseSessionSecurityOptions {
  enabled?: boolean;
  timeoutMinutes?: number;
  warningMinutes?: number;
  trackActivity?: boolean;
}

export const useSessionSecurity = ({
  enabled = true,
  timeoutMinutes = 30,
  warningMinutes = 5,
  trackActivity = true
}: UseSessionSecurityOptions = {}) => {
  // Sempre chamar useContext para manter a ordem dos hooks consistente
  const authContext = useContext(AuthContext);
  const user = authContext?.user ?? null;
  
  const { toast } = useToast();
  const [sessionWarningShown, setSessionWarningShown] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  // Use refs to avoid dependency issues
  const timeoutWarningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activityCountRef = useRef(0);

  // Enhanced device fingerprinting
  const generateDeviceFingerprint = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    return btoa(JSON.stringify({
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL(),
      timestamp: Date.now()
    }));
  }, []);

  // Enhanced logout with cleanup
  const performSecureLogout = useCallback(async () => {
    try {
      // Logout silencioso
      await securityService.logSecurityEvent({
        action: 'automatic_session_timeout',
        user_id: user?.id,
        success: true,
        metadata: {
          session_duration: Date.now() - lastActivity,
          timeout_reason: 'inactivity'
        }
      });
      
      // Clear all timers using refs
      if (timeoutWarningTimerRef.current) clearTimeout(timeoutWarningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      
      // Force logout
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [user?.id, lastActivity]);

  // Show session timeout warning
  const showSessionWarning = useCallback(() => {
    if (!sessionWarningShown) {
      // Mostrar aviso de sessão
      setSessionWarningShown(true);
      toast({
        title: "⚠️ Sessão expirando",
        description: `Sua sessão expirará em ${warningMinutes} minutos por inatividade. Mova o mouse para manter a sessão ativa.`,
        variant: "destructive",
        duration: 10000
      });
    }
  }, [sessionWarningShown, warningMinutes, toast]);

  // Reset activity timers
  const resetActivityTimers = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);
    setSessionWarningShown(false);
    
    // Clear existing timers using refs
    if (timeoutWarningTimerRef.current) clearTimeout(timeoutWarningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    
    // Set warning timer
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    const newWarningTimer = setTimeout(showSessionWarning, warningTime);
    timeoutWarningTimerRef.current = newWarningTimer;
    
    // Set logout timer
    const logoutTime = timeoutMinutes * 60 * 1000;
    const newLogoutTimer = setTimeout(performSecureLogout, logoutTime);
    logoutTimerRef.current = newLogoutTimer;
  }, [timeoutMinutes, warningMinutes, showSessionWarning, performSecureLogout]);

  // Session start/end logging
  useEffect(() => {
    if (!enabled || !user) return;

    // Log session start
    securityService.logSecurityEvent({
      action: 'session_started',
      user_id: user.id,
      success: true,
      metadata: {
        timeout_minutes: timeoutMinutes,
        warning_minutes: warningMinutes,
        tracking_enabled: trackActivity
      }
    });

    // Log session end on unmount
    return () => {
      securityService.logSecurityEvent({
        action: 'session_ended',
        user_id: user.id,
        success: true
      });
    };
  }, [enabled, user, timeoutMinutes, warningMinutes, trackActivity]);

  // Enhanced activity tracking with session management - FIXED
  useEffect(() => {
    if (!enabled || !user || !trackActivity) return;

    // Configurar rastreamento de atividade
    
    activityCountRef.current = 0;
    const deviceFingerprint = generateDeviceFingerprint();

    // Log session start with device fingerprint
    securityService.logSecurityEvent({
      action: 'enhanced_session_started',
      user_id: user.id,
      success: true,
      metadata: {
        device_fingerprint: deviceFingerprint,
        session_start: new Date().toISOString(),
        timeout_config: { timeoutMinutes, warningMinutes }
      }
    });

    const logActivity = () => {
      activityCountRef.current++;
      resetActivityTimers(); // Reset timers on any activity
      
      // Log activity every 50 interactions to avoid spam
      if (activityCountRef.current % 50 === 0) {
        // Contador de atividade (log removido para reduzir verbosidade)
        securityService.logSecurityEvent({
          action: 'user_activity_tracked',
          user_id: user.id,
          success: true,
          metadata: {
            activity_count: activityCountRef.current,
            timestamp: new Date().toISOString(),
            device_fingerprint: deviceFingerprint
          }
        });
      }
    };

    const events = ['click', 'keydown', 'scroll', 'mousemove', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, logActivity, { passive: true });
    });

    // Initialize timers
    resetActivityTimers();

    return () => {
      // Limpar rastreamento de atividade
      events.forEach(event => {
        document.removeEventListener(event, logActivity);
      });
      
      // Clear timers on cleanup using refs
      if (timeoutWarningTimerRef.current) clearTimeout(timeoutWarningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [enabled, user, trackActivity]); // FIXED: Removed problematic dependencies

  return {
    lastActivity,
    sessionWarningShown,
    performSecureLogout,
    resetActivityTimers
  };
};