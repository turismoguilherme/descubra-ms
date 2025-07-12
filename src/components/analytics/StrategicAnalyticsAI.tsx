import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Send, AlertTriangle, BrainCircuit } from 'lucide-react';
import { useStrategicAnalytics } from '@/hooks/useStrategicAnalytics';
import ChatMessage from '@/components/ai/ChatMessage';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function StrategicAnalyticsAI() {
  const { messages, isLoading, error, sendMessage } = useStrategicAnalytics();
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-gray-50 rounded-lg border">
      <div className="flex-1 p-4">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <BrainCircuit size={48} className="mb-4" />
                <h2 className="text-xl font-semibold">IA Analítica Estratégica</h2>
                <p>Faça uma pergunta sobre as tendências de turismo para começar.</p>
                <p className="text-sm text-gray-400">Ex: "Quais os destinos mais visitados no último mês?"</p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className="p-2 border rounded">
                <strong>{msg.isUser ? 'Você' : 'IA'}:</strong> {msg.text}
              </div>
            ))}
            {isLoading && <div className="p-2 border rounded">IA: Analisando dados...</div>}
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 border-t bg-white">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte algo sobre os dados de turismo..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}