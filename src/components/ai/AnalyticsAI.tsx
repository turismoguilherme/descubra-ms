
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, BarChart, BarChart3, PieChart, LineChart } from "lucide-react"; // Alterado ChartBar para BarChart
import { useToast } from "@/components/ui/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
} from "recharts";

import { guataConsciousService } from '@/services/ai/guataConsciousService';

type Message = {
  id: number;
  text: string;
  isBot: boolean;
  hasChart?: boolean;
  chartType?: 'bar' | 'line' | 'pie';
  chartData?: any[];
  source?: string;
  datasource?: string;
};

// Removendo mock data e a lógica de busca baseada em palavras-chave
// const analyticsResponses: Record<string, AnalyticsResponse> = { /* ... */ };
// const generateChartData = (type: string): any[] => { /* ... */ };
// const getKeywordForResponse = (query: string): string => { /* ... */ };

// Colors for the charts (mantido para compatibilidade, mas pode ser removido se não houver gráficos)
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface AnalyticsAIProps {}

const AnalyticsAI: React.FC<AnalyticsAIProps> = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "Olá, sou o Analista Inteligente de Planejamento. Como posso ajudar você hoje com análises e estratégias para o turismo em Mato Grosso do Sul?", 
      isBot: true 
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sistema de IA integrado - não necessita inicialização separada

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Adiciona a mensagem do usuário
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    try {
      // Chama o serviço RAG para gerar a resposta
      const ragResponse: RAGResponse = await tourismRAGService.generateResponse({
        question: userMessage.text,
        context: {},
        filters: {}
      });

      // Adiciona a resposta da IA
      const botMessage: Message = {
        id: messages.length + 2,
        text: ragResponse.answer + (ragResponse.sources.length > 0 ? "\n\nFontes: " + ragResponse.sources.map(s => s.name).join(", ") : ""),
        isBot: true,
        // hasChart: ragResponse.chartData ? true : false, // Desabilitar gráficos por enquanto, RAG não retorna formatado
        // chartType: ragResponse.chartType,
        // chartData: ragResponse.chartData,
        source: "IA Analítica (OverFlow One)"
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Erro ao processar mensagem pela IA Analítica:", error);
      toast({
        title: "Erro de IA",
        description: "Não foi possível obter uma resposta da IA Analítica. Tente novamente mais tarde.",
        variant: "destructive",
      });
      // Adiciona uma mensagem de erro genérica
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: messages.length + 2,
          text: "Desculpe, houve um erro ao processar sua solicitação. Por favor, tente novamente.",
          isBot: true,
          source: "Erro do Sistema"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Render different chart types based on the message type
  // Mantido, mas não será acionado sem chartData vindo do RAG
  const renderChart = (message: Message) => {
    if (!message.hasChart || !message.chartData) return null;
    
    switch (message.chartType) {
      case 'bar':
        return (
          <div className="h-64 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={message.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="valor" fill="#008FD5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'pie':
        return (
          <div className="h-64 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={message.chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {message.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        );
      case 'line':
        return (
          <div className="h-64 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={message.chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="idade" stroke="#8884d8" name="Idade Média" />
                <Line type="monotone" dataKey="permanencia" stroke="#82ca9d" name="Permanência (dias)" />
                <Line type="monotone" dataKey="gastos" stroke="#ff7300" name="Gastos Diários (R$)" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        );
      default:
        return null;
    }
  };

  const getChartIcon = (chartType?: 'bar' | 'line' | 'pie') => {
    switch (chartType) {
      case 'bar':
        return <BarChart3 size={16} className="mr-1" />;
      case 'pie':
        return <PieChart size={16} className="mr-1" />;
      case 'line':
        return <LineChart size={16} className="mr-1" />;
      default:
        return <BarChart size={16} className="mr-1" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <CardHeader className="bg-ms-primary-blue text-white pb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border-2 border-white/30">
            <AvatarImage src="/icons/analytics-ai-logo.png" />
            <AvatarFallback className="bg-blue-700 text-white">
              <BarChart size={20} />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg flex items-center">
              Analista Inteligente de Planejamento
              <Badge variant="outline" className="ml-2 text-xs border-white/30 text-white/90">
                Restrito
              </Badge>
            </CardTitle>
            <p className="text-sm text-white/80 flex items-center">
              <BarChart size={12} className="mr-1" /> Baseado em dados oficiais de turismo
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-[350px] overflow-y-auto p-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.isBot ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.isBot
                    ? "bg-white shadow-sm"
                    : "bg-ms-primary-blue text-white"
                }`}
              >
                <div className="whitespace-pre-line">{message.text}</div>
                
                {/* removido message.hasChart && renderChart(message) por enquanto, RAG não retorna formatado */}
                
                {message.source && (
                  <div className="mt-2 flex items-center">
                    {/* removido message.hasChart && message.chartType && getChartIcon(message.chartType) */}
                    <span className="text-xs text-gray-500">
                      Fonte: {message.source}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 rounded-full bg-ms-primary-blue/50 animate-bounce"></div>
                  <div className="h-2 w-2 rounded-full bg-ms-primary-blue/50 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="h-2 w-2 rounded-full bg-ms-primary-blue/50 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              placeholder="Digite sua pergunta sobre dados e estratégias de turismo..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-ms-primary-blue hover:bg-ms-primary-blue/90"
            >
              <Send size={16} className={isLoading ? "animate-pulse" : ""} />
              <span className="sr-only">Enviar</span>
            </Button>
          </div>
          
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Sugestões de perguntas:</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => setInputMessage("Como está o fluxo turístico em relação ao ano passado?")}
              >
                Fluxo turístico
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => setInputMessage("Quais ações Santa Catarina tem feito para divulgar destinos?")}
              >
                Benchmark Santa Catarina
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => setInputMessage("Sugira campanhas para o Pantanal na baixa temporada")}
              >
                Estratégias baixa temporada
              </Button>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center">
              <Badge variant="secondary" className="text-xs">
                <MessageCircle size={12} className="mr-1" />
                Modo Analítico
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Dados em tempo real via IA
            </p>
          </div>
        </div>
      </CardContent>
    </div>
  );
};

export default AnalyticsAI;
