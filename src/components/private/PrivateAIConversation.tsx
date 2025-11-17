/**
 * Private AI Conversation Component
 * Interface de IA conversacional para empresários do setor privado
 * Baseado em CATAIInterface, adaptado para contexto de negócios
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  MessageCircle, 
  Send, 
  Clock,
  RefreshCw,
  CheckCircle,
  Brain,
  TrendingUp,
  Target,
  BarChart3
} from 'lucide-react';
import { aiConversationService } from '@/services/cat/aiConversationService';
import { AIConversation } from '@/services/cat/aiConversationService';

interface PrivateAIConversationProps {
  businessType?: string;
}

const PrivateAIConversation: React.FC<PrivateAIConversationProps> = ({ businessType }) => {
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
  const [sessionId] = useState(() => `private-session-${Date.now()}`);
  const [conversationHistory, setConversationHistory] = useState<AIConversation[]>([]);
  const [aiAssistantStatus, setAiAssistantStatus] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    loadConversationHistory();
  }, [user]);

  const loadConversationHistory = async () => {
    if (!user?.id) return;

    try {
      const conversations = await aiConversationService.getConversations({
        attendant_id: user.id,
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
      'Precificação': 'Como posso otimizar os preços do meu negócio?',
      'Marketing': 'Quais estratégias de marketing funcionam melhor para o meu tipo de negócio?',
      'Métricas': 'Quais métricas devo acompanhar para melhorar minha performance?',
      'Concorrência': 'Como me comparo com meus concorrentes?',
      'Receita': 'Como aumentar minha receita?',
      'Estratégia': 'Quais são as melhores práticas para o meu setor?'
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

      // Resposta contextualizada para empresários
      const mockAnswer = `Com base na sua pergunta sobre "${messageToSend}", posso ajudá-lo com insights estratégicos. Para uma análise mais precisa, recomendo verificar as métricas do seu dashboard e usar as ferramentas de Revenue Optimizer e Market Intelligence.`;

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant' as const,
        content: mockAnswer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Salvar conversa no Supabase
      try {
        await aiConversationService.saveConversation({
          attendant_id: user.id,
          session_id: sessionId,
          question: messageToSend,
          answer: mockAnswer,
          category: 'business',
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
    <SectionWrapper 
      variant="default" 
      title="IA Conversacional"
      subtitle="Assistente inteligente para estratégias e análises do seu negócio"
      actions={
        <Badge variant="secondary" className="rounded-full text-xs px-2 py-0.5 gap-1">
          <div className={`w-2 h-2 rounded-full ${aiAssistantStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {aiAssistantStatus === 'online' ? 'Online' : 'Offline'}
        </Badge>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <CardBox>
            {/* Área de Mensagens */}
            <div className="p-4 min-h-[400px] max-h-[500px] overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 bg-blue-50 rounded-lg p-4">
                    <p className="text-slate-800 font-medium mb-1">
                      Olá! Sou sua assistente de IA da ViaJAR.
                    </p>
                    <p className="text-sm text-slate-600">
                      Posso ajudá-lo com estratégias de precificação, análise de métricas, comparação com concorrentes e recomendações para o seu negócio. Como posso ajudá-lo hoje?
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
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                    <span className="text-sm text-slate-600">Analisando...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Ações Rápidas */}
            <div className="p-4 border-t border-slate-200">
              <div className="flex flex-wrap gap-2 mb-3">
                {['Precificação', 'Marketing', 'Métricas', 'Concorrência', 'Receita', 'Estratégia'].map((action) => (
                  <Button
                    key={action}
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs px-3 py-1 border-slate-300 text-slate-700 hover:bg-slate-100"
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
                  placeholder="Pergunte sobre estratégias, métricas, precificação..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAIMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardBox>
        </div>

        {/* Funcionalidades da IA */}
        <div className="space-y-4">
          <CardBox>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-slate-800">Funcionalidades</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Análise de estratégias de precificação</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Interpretação de métricas e KPIs</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Recomendações baseadas em dados</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Comparação com mercado</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Insights sobre tendências</span>
              </div>
            </div>
          </CardBox>

          <CardBox>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-800">Dicas Rápidas</h3>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <p>• Use as ferramentas de Revenue Optimizer para otimizar preços</p>
              <p>• Consulte Market Intelligence para entender tendências</p>
              <p>• Compare-se com concorrentes no Competitive Benchmark</p>
            </div>
          </CardBox>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default PrivateAIConversation;

