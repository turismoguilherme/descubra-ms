import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, TrendingUp, FileText, BarChart, Lightbulb, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  attachments?: {
    type: 'chart' | 'report' | 'insight';
    title: string;
    data: any;
  }[];
}

const quickActions = [
  { icon: TrendingUp, label: "Analisar Performance", query: "Como está minha performance este mês?" },
  { icon: FileText, label: "Gerar Relatório", query: "Preciso de um relatório de ocupação" },
  { icon: BarChart, label: "Comparar Concorrentes", query: "Como estou em relação aos concorrentes?" },
  { icon: Lightbulb, label: "Sugestões de Melhoria", query: "Que melhorias você sugere para meu negócio?" }
];

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'assistant',
    content: 'Olá! Eu sou o Guilherme, seu assistente de inteligência empresarial. Estou aqui para ajudar você a interpretar dados, gerar insights e tomar decisões mais assertivas para seu negócio no turismo. Como posso ajudar hoje?',
    timestamp: new Date(),
    suggestions: [
      "Analisar dados de ocupação",
      "Comparar com concorrentes",
      "Sugerir melhorias",
      "Gerar relatório personalizado"
    ]
  }
];

export function IAGuilhermeInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simular resposta da IA
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateResponse(message),
        timestamp: new Date(),
        suggestions: generateSuggestions(message),
        attachments: generateAttachments(message)
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('performance') || lowerQuery.includes('ocupação')) {
      return "📊 Analisando sua performance... Sua taxa de ocupação média este mês está em 78%, acima da média regional de 65%. Identifiquei uma tendência de crescimento de 12% em relação ao mês anterior. Os fins de semana estão com ocupação quase total (95%), mas há oportunidades nos dias úteis.";
    }
    
    if (lowerQuery.includes('concorrente') || lowerQuery.includes('comparar')) {
      return "🎯 Comparação competitiva realizada! Você está posicionado no top 3 da região. Seus pontos fortes: atendimento (4.8/5) e localização. Oportunidade: preços 8% acima da média. Sugestão: criar pacotes promocionais para dias úteis.";
    }
    
    if (lowerQuery.includes('relatório')) {
      return "📋 Relatório personalizado sendo gerado! Com base nos seus dados, criei um dashboard com métricas-chave: receita, ocupação, perfil do cliente e sazonalidade. O relatório completo estará disponível em anexo com recomendações específicas.";
    }
    
    if (lowerQuery.includes('melhoria') || lowerQuery.includes('sugest')) {
      return "💡 Identificei 5 oportunidades de melhoria: 1) Otimizar preços para dias úteis; 2) Investir em marketing digital (ROI 3:1); 3) Expandir serviços de experiência; 4) Programa de fidelidade; 5) Parcerias locais. Quer que eu detalhe alguma?";
    }
    
    return "Entendi sua solicitação! Com base nos dados da sua empresa, posso fornecer insights personalizados. Que tipo de análise específica você gostaria que eu fizesse? Posso ajudar com relatórios, benchmarking, previsões ou recomendações estratégicas.";
  };

  const generateSuggestions = (query: string): string[] => {
    return [
      "Detalhar estratégias de precificação",
      "Analisar sazonalidade",
      "Comparar com período anterior",
      "Gerar plano de ação"
    ];
  };

  const generateAttachments = (query: string): Message['attachments'] => {
    if (query.toLowerCase().includes('relatório') || query.toLowerCase().includes('performance')) {
      return [
        {
          type: 'chart',
          title: 'Gráfico de Ocupação Mensal',
          data: { type: 'line', values: [65, 72, 78, 85, 78] }
        },
        {
          type: 'report',
          title: 'Relatório Executivo - Outubro 2024',
          data: { pages: 12, sections: ['Ocupação', 'Receita', 'Perfil Cliente'] }
        }
      ];
    }
    return [];
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-primary text-primary-foreground">IG</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">IA Guilherme</h1>
              <p className="text-muted-foreground">Assistente de Inteligência Empresarial</p>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-200">Online</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center">
                  <Bot className="h-5 w-5 mr-2" />
                  Conversa com IA Guilherme
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[480px] p-4" ref={scrollAreaRef}>
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
                          <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                            <Avatar className="w-8 h-8">
                              {message.type === 'user' ? (
                                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                              ) : (
                                <AvatarFallback className="bg-primary text-primary-foreground">IG</AvatarFallback>
                              )}
                            </Avatar>
                            <div className={`rounded-lg p-3 ${
                              message.type === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              {message.attachments && (
                                <div className="mt-2 space-y-2">
                                  {message.attachments.map((attachment, index) => (
                                    <div key={index} className="bg-background/50 rounded p-2 border">
                                      <div className="flex items-center space-x-2 text-xs">
                                        <FileText className="h-3 w-3" />
                                        <span>{attachment.title}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {message.suggestions && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-6"
                                  onClick={() => handleSendMessage(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center space-x-2 text-muted-foreground"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">IG</AvatarFallback>
                      </Avatar>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </motion.div>
                  )}
                </ScrollArea>
                
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Digite sua pergunta ou solicite uma análise..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => handleSendMessage(inputValue)}
                      disabled={!inputValue.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => handleSendMessage(action.query)}
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Alertas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-700">Ocupação baixa nos próximos 3 dias</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">Meta mensal atingida!</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">Novo relatório disponível</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}