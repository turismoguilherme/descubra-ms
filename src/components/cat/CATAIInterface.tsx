
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Copy, Heart, Clock, Bot, User, Send, Lightbulb, TrendingUp, MapPin, Utensils, Hotel, Car, Calendar, AlertTriangle, Star, Sparkles, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { guataIntelligentService } from '@/services/ai/guataIntelligentService';
import { useAuth } from '@/hooks/useAuth';

interface CATAIInterfaceProps {
  attendantId: string;
  attendantName: string;
  catLocation: string;
  latitude?: number;
  longitude?: number;
}

interface QuickCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  examples: string[];
  color: string;
  bgColor: string;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  category?: string;
  confidence?: number;
  sources?: any[];
  suggestions?: string[];
  response?: any;
}

// Componente principal com layout igual aos gestores - ATUALIZADO
const CATAIInterface = ({ 
  attendantId, 
  attendantName, 
  catLocation, 
  latitude, 
  longitude 
}: CATAIInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const quickCategories: QuickCategory[] = [
    {
      id: 'pontos-turisticos',
      name: 'Pontos Turísticos',
      icon: <MapPin className="h-4 w-4" />,
      examples: ['Gruta do Lago Azul', 'Aquário Natural', 'Rio Sucuri'],
      color: 'text-blue-600',
      bgColor: 'bg-blue-500'
    },
    {
      id: 'eventos',
      name: 'Eventos',
      icon: <Calendar className="h-4 w-4" />,
      examples: ['Festival de Inverno', 'Shows hoje', 'Eventos em Bonito'],
      color: 'text-purple-600',
      bgColor: 'bg-purple-500'
    },
    {
      id: 'restaurantes',
      name: 'Restaurantes',
      icon: <Utensils className="h-4 w-4" />,
      examples: ['Casa do João', 'Comida regional', 'Peixe pintado'],
      color: 'text-orange-600',
      bgColor: 'bg-orange-500'
    },
    {
      id: 'hoteis',
      name: 'Hotéis',
      icon: <Hotel className="h-4 w-4" />,
      examples: ['Pousadas em Bonito', 'Hotel com piscina'],
      color: 'text-green-600',
      bgColor: 'bg-green-500'
    },
    {
      id: 'transporte',
      name: 'Transporte',
      icon: <Car className="h-4 w-4" />,
      examples: ['Como chegar', 'Ônibus Campo Grande'],
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500'
    },
    {
      id: 'emergencias',
      name: 'Emergências',
      icon: <AlertTriangle className="h-4 w-4" />,
      examples: ['Hospital', 'Polícia', 'Emergência'],
      color: 'text-red-600',
      bgColor: 'bg-red-500'
    }
  ];

  const suggestedQuestions = [
    "Onde fica a Gruta do Lago Azul?",
    "Quanto custa o Aquário Natural?",
    "Melhor restaurante de peixe em Bonito?",
    "Como chegar ao hospital?",
    "Horário do ônibus para Campo Grande?"
  ];

  useEffect(() => {
    initializeAI();
    loadUserData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeAI = async () => {
    try {
      console.log('🚀 Inicializando Guatá IA...');
      
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'ai',
        content: `🌟 **Olá, ${attendantName}!**\n\nSou o **Guatá**, seu assistente IA especializado em turismo de Mato Grosso do Sul. Estou aqui para te ajudar a responder qualquer pergunta dos turistas com informações **verdadeiras e atualizadas**.\n\n💡 **Como posso ajudar:**\n• Informações sobre pontos turísticos (busca web + dados verificados)\n• Preços e horários atualizados\n• Restaurantes e hotéis\n• Transporte e como chegar\n• Parceiros da plataforma\n• Sugestões da comunidade\n• Emergências e contatos importantes\n\nDigite sua pergunta ou escolha uma categoria abaixo! 👇`,
        timestamp: new Date(),
        confidence: 1.0
      };
      
      setMessages([welcomeMessage]);
      console.log('✅ Guatá IA inicializado com busca web ilimitada');
    } catch (error) {
      console.error('❌ Erro ao inicializar IA:', error);
    }
  };

  const loadUserData = () => {
    const savedFavorites = localStorage.getItem(`attendant_favorites_${attendantId}`);
    const savedHistory = localStorage.getItem(`attendant_search_history_${attendantId}`);
    
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const question = inputValue.trim();
    setInputValue('');
    setLoading(true);

    try {
      const response = await guataIntelligentService.processQuestion({
        question: question,
        userId: attendantId,
        sessionId: `cat-session-${attendantId}`,
        context: 'cat-interface',
        userLocation: catLocation
      });

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: response.answer,
        timestamp: new Date(),
        confidence: response.confidence,
        sources: response.sources,
        suggestions: [], // guataIntelligentService não retorna suggestions
        response: response
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update search history
      setSearchHistory(prev => {
        const updated = [question, ...prev.filter(q => q !== question)].slice(0, 10);
        localStorage.setItem(`attendant_search_history_${attendantId}`, JSON.stringify(updated));
        return updated;
      });

      toast({
        title: "✅ Resposta gerada",
        description: `Confiança: ${Math.round(response.confidence * 100)}%`,
      });

    } catch (error) {
      console.error('❌ Erro ao processar pergunta:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: '😔 Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente em alguns instantes.',
        timestamp: new Date(),
        confidence: 0
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Erro",
        description: "Não foi possível processar a pergunta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "✅ Copiado",
      description: "Texto copiado para a área de transferência",
    });
  };

  const addToFavorites = (message: Message) => {
    const updatedFavorites = [...favorites, { ...message, savedAt: new Date() }];
    setFavorites(updatedFavorites);
    localStorage.setItem(`attendant_favorites_${attendantId}`, JSON.stringify(updatedFavorites));
    
    toast({
      title: "⭐ Adicionado aos favoritos",
      description: "Resposta salva para uso futuro",
    });
  };

  const renderResponseCards = (response: any) => {
    if (!response.sources || response.sources.length === 0) return null;

    return (
      <div className="mt-6 space-y-4">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          Fontes de Informação
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {response.sources.slice(0, 4).map((source: any, index: number) => {
            const icons = [MapPin, Utensils, Hotel, Car];
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
                    <h5 className="font-semibold text-gray-900 text-sm mb-1">{source.name}</h5>
                    <p className="text-gray-600 text-xs leading-relaxed">{source.description}</p>
                    {source.contact?.phone && (
                      <div className="mt-2">
                        <Badge variant="secondary" className={getBadgeClasses(index)}>
                          {source.contact.phone}
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
    <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-8 pb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 rounded-t-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              IA Turística MS
            </h2>
            <p className="text-gray-600 mt-1">
              Assistente especializada para {attendantName} • {catLocation}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </Badge>
              <Badge variant="outline" className="text-blue-700">
                <Star className="h-3 w-3 mr-1" />
                Dados em tempo real
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-8">
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
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
                
                <div className="flex-1 min-w-0">
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    message.type === 'ai' 
                      ? 'bg-white border border-gray-200 rounded-bl-none' 
                      : 'bg-blue-500 text-white rounded-br-none'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                    
                    {message.type === 'ai' && message.confidence && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(message.confidence * 100)}% confiança
                        </Badge>
                        {message.sources && message.sources.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {message.sources.length} fonte(s)
                          </Badge>
                        )}
                      </div>
                    )}

                    {message.type === 'ai' && message.response && renderResponseCards(message.response)}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className={`text-xs flex items-center gap-1 ${
                      message.type === 'ai' ? 'text-gray-500' : 'text-blue-600'
                    }`}>
                      <Clock className="h-3 w-3" />
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    
                    {message.type === 'ai' && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => copyToClipboard(message.content)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copiar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => addToFavorites(message)}
                        >
                          <Heart className="h-3 w-3 mr-1" />
                          Favoritar
                        </Button>
                      </div>
                    )}
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
                    <span className="text-sm">Analisando dados e gerando resposta...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="p-8 bg-gray-50 border-t border-gray-200 rounded-b-xl">
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
              placeholder="Digite sua pergunta sobre turismo em MS..."
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
              <span>Dados atualizados</span>
            </div>
          </div>
          <span>Pressione Enter para enviar</span>
        </div>
      </div>
    </div>
  );
};

export default CATAIInterface;
