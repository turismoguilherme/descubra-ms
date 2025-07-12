import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AIMessage } from "@/types/ai";

export function useStrategicAnalytics() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    setIsLoading(true);
    setError(null);

    const userMessage: AIMessage = {
      id: Date.now(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await supabase.functions.invoke("strategic-analytics-ai", {
        body: { query: message },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const aiMessage: AIMessage = {
        id: Date.now() + 1,
        text: response.data.reply,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (e: any) {
      console.error('Error calling strategic-analytics-ai function:', e);
      setError('Desculpe, não foi possível obter uma resposta da IA. Tente novamente mais tarde.');
    }
    
    setIsLoading(false);
  }, []);

  return { messages, isLoading, error, sendMessage };
} 