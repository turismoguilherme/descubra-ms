/**
 * CAT AI Interface
 * Interface padronizada de IA para atendimento aos turistas
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  MessageCircle, 
  Send, 
  Clock,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { aiConversationService } from '@/services/cat/aiConversationService';
import { AIConversation } from '@/services/cat/aiConversationService';

interface CATAIInterfaceProps {
  catId?: string;
}

const CATAIInterface: React.FC<CATAIInterfaceProps> = ({ catId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'assistant' | 'user';
    content: string;
    timestamp: Date;
  }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [conversationHistory, setConversationHistory] = useState<AIConversation[]>([]);
  const [aiAssistantStatus, setAiAssistantStatus] = useState<'online' | 'offline'>('online');
  const [aiResponse, setAiResponse] = useState<string>('');

  useEffect(() => {
    loadConversationHistory();
  }, [user, catId]);

  const loadConversationHistory = async () => {
    if (!user?.id) return;

    try {
      const conversations = await aiConversationService.getConversations({
        attendant_id: user.id,
        cat_id: catId,
        session_id: sessionId
      });
      setConversationHistory(conversations);

      // Converter conversas para mensagens
      const historyMessages = conversations.map((conv, index) => [
        {
          id: `user-${index}`,
          role: 'user' as const,
          content: conv.question,
          timestamp: new Date(conv.created_at)
        },
        {
          id: `assistant-${index}`,
          role: 'assistant' as const,
          content: conv.answer,
          timestamp: new Date(conv.created_at)
        }
      ]).flat();

      setMessages(historyMessages);
    } catch (error) {
      console.error('Erro ao carregar histórico de conversas:', error);
    }
  };

  const handleQuickAction = async (action: string) => {
    const quickMessages: { [key: string]: string } = {
      'Boas-vindas': 'Olá! Bem-vindo ao Mato Grosso do Sul. Como posso ajudá-lo?',
      'Atrativos': 'Quais são os principais pontos turísticos da região?',
      'Restaurantes': 'Onde posso encontrar bons restaurantes?',
      'Hospedagem': 'Quais são as melhores opções de hospedagem?',
      'Transporte': 'Como posso me locomover pela cidade?',
      'Eventos': 'Quais eventos estão acontecendo na região?'
    };

    const question = quickMessages[action] || action;
    await sendMessage(question);
  };

  const sendMessage = async (question?: string) => {
    const messageToSend = question || inputMessage.trim();
    if (!messageToSend || !user?.id) return;

    setIsLoading(true);

    // Adicionar mensagem do usuário
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: messageToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      // Simular resposta da IA (mockado por enquanto)
      // TODO: Integrar com serviço real de IA quando disponível
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockAnswer = `Esta é uma resposta de exemplo da IA para: "${messageToSend}". Em produção, isso seria gerado pelo serviço de IA integrado.`;

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant' as const,
        content: mockAnswer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setAiResponse(mockAnswer);

      // Salvar conversa no Supabase
      try {
        await aiConversationService.saveConversation({
          attendant_id: user.id,
          cat_id: catId,
          session_id: sessionId,
          question: messageToSend,
          answer: mockAnswer,
          category: 'general',
          language: 'pt-BR',
          confidence_score: 0.85
        });
      } catch (saveError) {
        console.error('Erro ao salvar conversa:', saveError);
        // Continuar mesmo se falhar ao salvar
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAIMessage = async () => {
    await sendMessage();
  };

  return (
    <div className="space-y-6">
      {/* IA Guilherme - Layout Melhorado */}
      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Bot className="h-5 w-5" />
              IA Guilherme - Assistente Inteligente
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${aiAssistantStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-purple-900">
                Status: {aiAssistantStatus === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Interface - Área Principal */}
          <div className="bg-white rounded-lg border border-purple-200">
            {/* Área de Mensagens */}
            <div className="p-4 min-h-[300px] max-h-[400px] overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 bg-purple-50 rounded-lg p-4">
                    <p className="text-slate-800">
                      Olá! Sou o IA Guilherme. Como posso ajudá-lo hoje?
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>{new Date().toLocaleTimeString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      {message.role === 'user' ? (
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Bot className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block rounded-lg p-3 ${
                        message.role === 'user' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'bg-purple-50 text-slate-800'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className={`flex items-center gap-2 mt-1 text-xs text-slate-500 ${message.role === 'user' ? 'justify-end' : ''}`}>
                        <Clock className="h-3 w-3" />
                        <span>{message.timestamp.toLocaleTimeString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 animate-spin text-purple-600" />
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <span className="text-sm text-slate-600">Pensando...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Ações Rápidas */}
            <div className="p-4 border-t border-purple-200">
              <div className="flex flex-wrap gap-2 mb-3">
                {['Boas-vindas', 'Atrativos', 'Restaurantes', 'Hospedagem', 'Transporte', 'Eventos'].map((action) => (
                  <Button
                    key={action}
                    variant="outline"
                    size="sm"
                    className="rounded-full border-purple-300 text-purple-700 hover:bg-purple-100"
                    onClick={() => handleQuickAction(action)}
                    disabled={isLoading}
                  >
                    {action}
                  </Button>
                ))}
              </div>

              {/* Campo de Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1 border-purple-200"
                />
                <Button 
                  onClick={handleAIMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Funcionalidades da IA */}
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-3">Funcionalidades:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Sugestões personalizadas de roteiros
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Informações em tempo real sobre destinos
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Assistência para reservas e agendamentos
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Suporte para pessoas com deficiência
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CATAIInterface;
