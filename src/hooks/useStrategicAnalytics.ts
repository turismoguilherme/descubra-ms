import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  text: string;
  isUser: boolean;
}

export function useStrategicAnalytics() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (prompt: string) => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    const userMessage: Message = { text: prompt, isUser: true };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('strategic-analytics-ai', {
        body: { prompt },
      });

      if (functionError) {
        throw functionError;
      }
      
      const aiMessage: Message = { text: data.content, isUser: false };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (e: any) { {
      console.error('Error calling strategic-analytics-ai function:', e);
      setError('Desculpe, não foi possível obter uma resposta da IA. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, error, sendMessage };
} 