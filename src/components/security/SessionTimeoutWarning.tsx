import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { Clock, AlertTriangle } from "lucide-react";

interface SessionTimeoutWarningProps {
  warningTimeMinutes?: number;
  timeoutMinutes?: number;
  enabled?: boolean;
}

export const SessionTimeoutWarning = ({ 
  warningTimeMinutes = 5, 
  timeoutMinutes = 30,
  enabled = true 
}: SessionTimeoutWarningProps) => {
  const { user, signOut } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const warningTimeMs = warningTimeMinutes * 60 * 1000;
  const timeoutMs = timeoutMinutes * 60 * 1000;

  const resetActivity = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
  }, []);

  const handleLogout = useCallback(async () => {
    await signOut();
    setShowWarning(false);
  }, [signOut]);

  const extendSession = useCallback(() => {
    resetActivity();
    setShowWarning(false);
  }, [resetActivity]);

  // Track user activity
  useEffect(() => {
    if (!enabled || !user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => resetActivity();
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [enabled, user, resetActivity]);

  // Check for timeout
  useEffect(() => {
    if (!enabled || !user) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      
      // Show warning
      if (timeSinceActivity >= (timeoutMs - warningTimeMs) && !showWarning) {
        setShowWarning(true);
        setSecondsLeft(Math.floor((timeoutMs - timeSinceActivity) / 1000));
      }
      
      // Auto logout
      if (timeSinceActivity >= timeoutMs) {
        handleLogout();
        return;
      }
      
      // Update countdown
      if (showWarning) {
        const remaining = Math.floor((timeoutMs - timeSinceActivity) / 1000);
        setSecondsLeft(Math.max(0, remaining));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, user, lastActivity, showWarning, timeoutMs, warningTimeMs, handleLogout]);

  if (!enabled || !user || !showWarning) {
    return null;
  }

  const progressValue = (secondsLeft / (warningTimeMinutes * 60)) * 100;

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Sessão Expirando
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <Clock className="h-12 w-12 text-orange-500 mx-auto" />
            <p className="text-gray-700">
              Sua sessão expirará em <strong>{Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Por motivos de segurança, você será desconectado automaticamente por inatividade.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tempo restante:</span>
              <span>{secondsLeft}s</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleLogout}>
            Sair Agora
          </Button>
          <Button onClick={extendSession} className="bg-ms-primary-blue hover:bg-ms-primary-blue/90">
            Continuar Sessão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionTimeoutWarning;