import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Lightbulb, 
  TrendingUp, 
  MapPin, 
  Users,
  Calendar,
  DollarSign,
  Target,
  BarChart3
} from 'lucide-react';
import { geminiClient } from '@/config/gemini';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type: 'text' | 'analysis' | 'recommendation' | 'data';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
}

const ManagerAIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContext, setSelectedContext] = useState<string>('general');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Ações rápidas para gestores
  const quickActions: QuickAction[] = [
    {
      id: 'retention-analysis',
      title: 'Análise de Retenção',
      description: 'Como aumentar o tempo de permanência dos visitantes',
      icon: <Target className="w-5 h-5" />,
      prompt: 'Analise como podemos aumentar o tempo de permanência dos visitantes em Campo Grande, especialmente considerando que é uma cidade de passagem. Quais estratégias podemos implementar?'
    },
    {
      id: 'bioceanic-opportunities',
      title: 'Rota Bioceânica',
      description: 'Oportunidades da Rota Bioceânica para turismo',
      icon: <MapPin className="w-5 h-5" />,
      prompt: 'Como podemos aproveitar o fato de Campo Grande ser considerada a capital da Rota Bioceânica para desenvolver o turismo? Quais ações específicas podemos implementar?'
    },
    {
      id: 'event-strategy',
      title: 'Estratégia de Eventos',
      description: 'Planejamento de eventos para atrair visitantes',
      icon: <Calendar className="w-5 h-5" />,
      prompt: 'Sugira uma estratégia de eventos para Campo Grande que possa transformar a cidade de passagem em destino turístico. Que tipos de eventos seriam mais eficazes?'
    },
    {
      id: 'economic-impact',
      title: 'Impacto Econômico',
      description: 'Análise do impacto econômico do turismo',
      icon: <DollarSign className="w-5 h-5" />,
      prompt: 'Analise o potencial impacto econômico do turismo em Campo Grande. Como podemos maximizar os benefícios econômicos para a cidade?'
    },
    {
      id: 'visitor-profile',
      title: 'Perfil do Visitante',
      description: 'Análise do perfil dos visitantes',
      icon: <Users className="w-5 h-5" />,
      prompt: 'Analise o perfil dos visitantes de Campo Grande. Quem são nossos turistas e como podemos melhorar a experiência para cada segmento?'
    },
    {
      id: 'trends-analysis',
      title: 'Tendências Turísticas',
      description: 'Análise de tendências do setor',
      icon: <TrendingUp className="w-5 h-5" />,
      prompt: 'Quais são as principais tendências do turismo que podemos aproveitar em Campo Grande? Como podemos nos posicionar diante dessas tendências?'
    }
  ];

  // Contextos específicos para diferentes tipos de análise
  const contexts = [
    { id: 'general', name: 'Geral', icon: <Bot className="w-4 h-4" /> },
    { id: 'strategic', name: 'Estratégico', icon: <Target className="w-4 h-4" /> },
    { id: 'operational', name: 'Operacional', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'financial', name: 'Financeiro', icon: <DollarSign className="w-4 h-4" /> }
  ];

  useEffect(() => {
    // Mensagem de boas-vindas
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Olá! Sou seu assistente de IA especializado em turismo e gestão pública. 

Posso ajudá-lo com:
• Análises estratégicas de turismo
• Planejamento de eventos e atrações
• Otimização da experiência do visitante
• Análise de dados e tendências
• Recomendações para retenção de turistas
• Estratégias para a Rota Bioceânica

Como posso ajudá-lo hoje?`,
        timestamp: new Date(),
        type: 'text'
      }]);
    }
  }, []);

  useEffect(() => {
    // Auto-scroll para a última mensagem
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateAIResponse(input, selectedContext);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    setInput(action.prompt);
    await handleSendMessage();
  };

  const generateAIResponse = async (userInput: string, context: string): Promise<string> => {
    const contextPrompts = {
      general: 'Você é um assistente de IA especializado em turismo e gestão pública de Mato Grosso do Sul.',
      strategic: 'Você é um consultor estratégico especializado em desenvolvimento turístico e planejamento urbano.',
      operational: 'Você é um especialista em operações turísticas e gestão de destinos.',
      financial: 'Você é um analista financeiro especializado em economia do turismo e investimentos públicos.'
    };

    const prompt = `
${contextPrompts[context as keyof typeof contextPrompts] || contextPrompts.general}

CONTEXTO: O usuário é um gestor público responsável pelo turismo em Campo Grande, MS. Campo Grande é considerada uma cidade de passagem, mas tem potencial para se tornar um destino turístico. A cidade é também considerada a capital da Rota Bioceânica.

PERGUNTA DO GESTOR: ${userInput}

INSTRUÇÕES:
1. Forneça uma resposta detalhada e prática
2. Inclua dados específicos sobre MS quando relevante
3. Sugira ações concretas e implementáveis
4. Considere o contexto de cidade de passagem vs destino turístico
5. Mencione oportunidades da Rota Bioceânica quando apropriado
6. Use linguagem clara e profissional
7. Inclua métricas e indicadores quando possível

Responda em português brasileiro de forma estruturada e acionável.
`;

    const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assistente de IA para Gestores</h1>
          <p className="text-gray-600 mt-2">
            Sua ferramenta inteligente para tomada de decisões estratégicas em turismo
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Bot className="w-4 h-4 mr-2" />
          IA Especializada
        </Badge>
      </div>

      {/* Contextos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Contexto da Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {contexts.map((context) => (
              <Button
                key={context.id}
                variant={selectedContext === context.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedContext(context.id)}
                className="flex items-center gap-2"
              >
                {context.icon}
                {context.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2 text-left"
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
              >
                <div className="flex items-center gap-2 w-full">
                  {action.icon}
                  <span className="font-semibold">{action.title}</span>
                </div>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Principal */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Conversa com IA
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Mensagens */}
              <ScrollArea 
                ref={scrollAreaRef}
                className="flex-1 mb-4 pr-4"
              >
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.role === 'assistant' && (
                            <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-xs mt-2 ${
                              message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTimestamp(message.timestamp)}
                            </p>
                          </div>
                          {message.role === 'user' && (
                            <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-gray-600">IA está pensando...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua pergunta ou solicite uma análise..."
                  className="flex-1 resize-none"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="self-end"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Painel Lateral */}
        <div className="space-y-4">
          {/* Estatísticas Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mensagens</span>
                <Badge variant="secondary">{messages.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Contexto</span>
                <Badge variant="outline">
                  {contexts.find(c => c.id === selectedContext)?.name}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Dicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dicas de Uso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>• Use ações rápidas para análises comuns</p>
              <p>• Mude o contexto para diferentes tipos de análise</p>
              <p>• Seja específico nas suas perguntas</p>
              <p>• Peça dados e métricas quando relevante</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManagerAIAssistant; 