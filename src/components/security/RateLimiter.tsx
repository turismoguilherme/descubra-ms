
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface RateLimiterProps {
  children: React.ReactNode;
  maxAttempts: number;
  windowMs: number;
  identifier: string;
}

export const RateLimiter: React.FC<RateLimiterProps> = ({
  children,
  maxAttempts,
  windowMs,
  identifier
}) => {
  const [attempts, setAttempts] = useState<number[]>([]);
  const [blocked, setBlocked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load attempts from localStorage
    const stored = localStorage.getItem(`rate_limit_${identifier}`);
    if (stored) {
      const storedAttempts = JSON.parse(stored);
      const now = Date.now();
      const validAttempts = storedAttempts.filter((timestamp: number) => 
        now - timestamp < windowMs
      );
      setAttempts(validAttempts);
      setBlocked(validAttempts.length >= maxAttempts);
    }
  }, [identifier, windowMs, maxAttempts]);

  const recordAttempt = () => {
    const now = Date.now();
    const newAttempts = [...attempts, now].filter(timestamp => 
      now - timestamp < windowMs
    );
    
    setAttempts(newAttempts);
    localStorage.setItem(`rate_limit_${identifier}`, JSON.stringify(newAttempts));
    
    if (newAttempts.length >= maxAttempts) {
      setBlocked(true);
      toast({
        title: "Muitas tentativas",
        description: `Aguarde ${Math.ceil(windowMs / 60000)} minutos antes de tentar novamente.`,
        variant: "destructive",
      });
    }
  };

  const resetAttempts = () => {
    setAttempts([]);
    setBlocked(false);
    localStorage.removeItem(`rate_limit_${identifier}`);
  };

  return (
    <div>
      {React.cloneElement(children as React.ReactElement, {
        onAttempt: recordAttempt,
        blocked,
        remainingAttempts: Math.max(0, maxAttempts - attempts.length),
        resetAttempts
      })}
    </div>
  );
};

export default RateLimiter;
