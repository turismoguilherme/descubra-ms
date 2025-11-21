import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Lightbulb, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  AlertCircle,
  BarChart3,
  Users,
  Activity,
  Star,
  Clock,
  Brain,
  Sparkles
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  response?: any;
}

interface ChatInterfaceProps {
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('last_month');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const timeframeOptions = [
    { value: 'last_week', label: 'Última Semana' },
    { value: 'last_month', label: 'Último Mês' },
    { value: 'last_quarter', label: 'Último Trimestre' },
    { value: 'last_year', label: 'Último Ano' }
  ];

  const suggestedQuestions = [
    "Como está o desempenho do turismo na minha região?",
    "Quais são as tendências de visitação?",
    "Que estratégias você recomenda para aumentar o turismo?",
    "Como posso melhorar a experiência dos visitantes?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      addWelcomeMessage();
    }
  }, []);

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: 'Olá! Sou o Guilherme, sua IA estratégica para o turismo. Estou aqui para ajudar você a tomar decisões mais inteligentes com base em dados reais. Como posso ajudar hoje?',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Simular resposta da IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Esta é uma resposta simulada do Guilherme. Em uma implementação real, aqui seria processada a consulta com dados reais do turismo.',
        timestamp: new Date(),
        response: {
          insights: [
            {
              title: 'Crescimento de 15%',
              description: 'Aumento significativo na visitação este mês',
              value: '+15%'
            },
            {
              title: 'Satisfação Alta',
              description: 'Avaliação média de 4.6 estrelas',
              value: '4.6/5'
            }
          ]
        }
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro ao processar consulta:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Desculpe, ocorreu um erro ao processar sua consulta. Tente novamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const renderResponseCards = (response: any) => {
    if (!response.insights || response.insights.length === 0) return null;

    return (
      <div className="mt-6 space-y-4">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          Insights Estratégicos
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {response.insights.slice(0, 4).map((insight: any, index: number) => {
            const icons = [TrendingUp, Users, BarChart3, MapPin];
            const Icon = icons[index % icons.length];
            
            const getCardClasses = (index: number) => {
              const variants = [
                'p-4 rounded-xl border-l-4 bg-gradient-to-r from-blue-50 to-white border-blue-400 shadow-sm hover:shadow-md transition-all duration-200',
                'p-4 rounded-xl border-l-4 bg-gradient-to-r from-green-50 to-white border-green-400 shadow-sm hover:shadow-md transition-all duration-200',
                'p-4 rounded-xl border-l-4 bg-gradient-to-r from-purple-50 to-white border-purple-400 shadow-sm hover:shadow-md transition-all duration-200',
                'p-4 rounded-xl border-l-4 bg-gradient-to-r from-orange-50 to-white border-orange-400 shadow-sm hover:shadow-md transition-all duration-200'
              ];
              return variants[index % variants.length];
            };

            const getIconClasses = (index: number) => {
              const variants = [
                'w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0',
                'w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0',
                'w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0',
                'w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0'
              ];
              return variants[index % variants.length];
            };

            const getIconColorClasses = (index: number) => {
              const variants = [
                'h-5 w-5 text-blue-600',
                'h-5 w-5 text-green-600',
                'h-5 w-5 text-purple-600',
                'h-5 w-5 text-orange-600'
              ];
              return variants[index % variants.length];
            };

            const getBadgeClasses = (index: number) => {
              const variants = [
                'bg-blue-100 text-blue-700 text-xs',
                'bg-green-100 text-green-700 text-xs',
                'bg-purple-100 text-purple-700 text-xs',
                'bg-orange-100 text-orange-700 text-xs'
              ];
              return variants[index % variants.length];
            };
            
            return (
              <div key={index} className={getCardClasses(index)}>
                <div className="flex items-start gap-3">
                  <div className={getIconClasses(index)}>
                    <Icon className={getIconColorClasses(index)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-gray-900 text-sm mb-1">{insight.title}</h5>
                    <p className="text-gray-600 text-xs leading-relaxed">{insight.description}</p>
                    {insight.value && (
                      <div className="mt-2">
                        <Badge variant="secondary" className={getBadgeClasses(index)}>
                          {insight.value}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-xl overflow-hidden ${className}`}>
      {/* Header Premium */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <g fill="none" fillRule="evenodd">
              <g fill="#ffffff" fillOpacity="0.1">
                <circle cx="7" cy="7" r="1"/>
              </g>
            </g>
          </svg>
        </div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">Guilherme</h2>
              <p className="text-blue-100 text-sm">Seu assistente inteligente para decisões estratégicas em turismo</p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="bg-white/20 border-white/30 text-white text-xs px-3 py-1 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by Gemini AI
            </Badge>
            <div className="flex items-center gap-2 mt-2 text-blue-200 text-xs">
              <Activity className="h-3 w-3" />
              <span>Análise em tempo real</span>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="text-blue-200 text-sm font-medium mr-2">Período de análise:</span>
          {timeframeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeframe(option.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                timeframe === option.value
                  ? 'bg-white/30 text-white backdrop-blur-sm shadow-sm'
                  : 'bg-white/10 text-blue-200 hover:bg-white/20 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0 p-8">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-8">
            {messages.map((message, index) => (
              <div key={message.id} className={`flex items-start gap-4 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                  message.type === 'ai' 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-br from-gray-500 to-gray-600'
                }`}>
                  {message.type === 'ai' ? (
                    <Bot className="h-5 w-5 text-white" />
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex-1 max-w-[85%] ${message.type === 'user' ? 'flex flex-col items-end' : ''}`}>
                  <div className={`p-4 rounded-2xl shadow-sm relative ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Response Cards */}
                    {message.response && renderResponseCards(message.response)}
                    
                    {/* Timestamp */}
                    <div className={`mt-3 text-xs flex items-center gap-1 ${
                      message.type === 'user' ? 'text-blue-200 justify-end' : 'text-gray-500'
                    }`}>
                      <Clock className="h-3 w-3" />
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-none shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analisando dados e gerando insights...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="p-8 bg-gray-50 border-t border-gray-200">
        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Sugestões para começar:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(question)}
                  className="text-left p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md group"
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 group-hover:text-blue-700 leading-relaxed">{question}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Field */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="Digite sua pergunta sobre turismo e estratégias..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="h-14 text-base pr-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
              disabled={loading}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <Button 
            onClick={handleSendMessage} 
            className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200" 
            disabled={loading || !inputValue.trim()}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            <span className="ml-2 font-medium">
              {loading ? 'Analisando...' : 'Enviar'}
            </span>
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>IA Online</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span>Dados em tempo real</span>
            </div>
          </div>
          <span>Pressione Enter para enviar</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;




