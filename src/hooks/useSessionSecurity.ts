import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { securityService } from "@/services/securityService";

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
  const { user } = useAuth();

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

  useEffect(() => {
    if (!enabled || !user || !trackActivity) return;

    let activityCount = 0;
    const logActivity = () => {
      activityCount++;
      
      // Log activity every 50 interactions to avoid spam
      if (activityCount % 50 === 0) {
        securityService.logSecurityEvent({
          action: 'user_activity_tracked',
          user_id: user.id,
          success: true,
          metadata: {
            activity_count: activityCount,
            timestamp: new Date().toISOString()
          }
        });
      }
    };

    const events = ['click', 'keydown', 'scroll', 'mousemove'];
    
    events.forEach(event => {
      document.addEventListener(event, logActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, logActivity);
      });
    };
  }, [enabled, user, trackActivity]);
};