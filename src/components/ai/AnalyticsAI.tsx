
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, ChartBar, BarChart3, PieChart, LineChart } from "lucide-react";
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

// Define a proper type for analytics responses
type AnalyticsResponse = {
  response: string;
  chart?: 'bar' | 'line' | 'pie';
  source: string;
};

// Mock data for AI responses with proper typing
const analyticsResponses: Record<string, AnalyticsResponse> = {
  "fluxo turístico": {
    response: "O fluxo turístico em Mato Grosso do Sul aumentou 32% no primeiro semestre de 2025 em comparação com o mesmo período de 2024. Os principais destinos que impulsionaram esse crescimento foram:\n\n• Bonito: aumento de 45%\n• Pantanal: aumento de 38%\n• Corumbá: aumento de 29%\n• Campo Grande: aumento de 22%\n\nO turismo internacional também cresceu 18%, com destaque para visitantes da Argentina (27%), Paraguai (22%) e Estados Unidos (15%).",
    chart: "bar",
    source: "Observatório do Turismo de MS, 2025"
  },
  "santa catarina": {
    response: "Santa Catarina tem implementado as seguintes estratégias para divulgação de seus destinos naturais:\n\n1. Marketing digital focado em micro-influenciadores especializados em ecoturismo e aventura\n\n2. Programa 'SC Naturalmente' que conecta operadoras de turismo internacionais diretamente com destinos catarinenses\n\n3. Participação em feiras internacionais de turismo sustentável na Europa e América do Norte\n\n4. Investimento em conteúdo audiovisual imersivo (realidade virtual) para apresentação em feiras\n\n5. Integração entre municípios para criação de rotas temáticas de natureza",
    source: "Secretaria de Turismo de Santa Catarina, 2025"
  },
  "baixa temporada": {
    response: "Com base nos dados de sazonalidade do Pantanal, sugiro estas campanhas para a baixa temporada:\n\n1. \"Pantanal Exclusivo\" - focada na experiência mais íntima e personalizada possível durante a baixa temporada (menos turistas, maior proximidade com a natureza)\n\n2. \"Fotógrafos do Pantanal\" - programa específico para entusiastas de fotografia, destacando a maior facilidade de avistamento de animais em certos períodos\n\n3. \"Tarifa Pantaneira\" - pacotes com desconto progressivo (quanto mais dias, maior o desconto) para estimular estadias mais longas\n\n4. \"Ciência no Pantanal\" - turismo científico em parceria com universidades e institutos de pesquisa durante períodos específicos",
    source: "Análises comparativas com estratégias bem-sucedidas em destinos similares"
  },
  "origem turistas": {
    response: "Análise da origem dos turistas em MS no último semestre:\n\nDomésticos:\n• São Paulo: 32%\n• Paraná: 17%\n• Minas Gerais: 12%\n• Rio de Janeiro: 9%\n• Santa Catarina: 7%\n• Outros estados: 23%\n\nInternacionais:\n• Argentina: 28%\n• Paraguai: 25%\n• EUA: 12%\n• Chile: 10%\n• Europa (principalmente Alemanha e França): 17%\n• Outros países: 8%",
    chart: "pie",
    source: "Sistema de Monitoramento Turístico de MS, 2025"
  },
  "perfil visitante": {
    response: "Evolução do perfil do visitante de Bonito nos últimos 3 anos:\n\n• Idade média: diminuiu de 42 para 38 anos\n• Tempo médio de permanência: aumentou de 3,2 para 4,5 dias\n• Gastos médios diários: aumentaram de R$320 para R$480\n• Viagens em grupo: cresceram 25%\n• Busca por experiências sustentáveis: aumento de 65%\n• Uso do aplicativo durante a viagem: crescimento de 320%\n• Planejamento pelo app antes da viagem: aumento de 185%",
    chart: "line",
    source: "Dados consolidados do Observatório do Turismo e app MS, 2023-2025"
  },
  "tendências": {
    response: "As principais tendências e oportunidades identificadas para o turismo em MS incluem:\n\n1. Turismo regenerativo: visitantes buscando destinos onde possam contribuir positivamente para a preservação (oportunidade para programas de compensação de carbono e atividades de conservação)\n\n2. Maior interesse por turismo rural e experiências autênticas com comunidades locais\n\n3. Crescimento do workation (trabalho + férias) exigindo melhor infraestrutura digital nos destinos\n\n4. Aumento na demanda por experiências gastronômicas com produtos locais e orgânicos\n\n5. Interesse crescente no turismo de observação de vida selvagem, especialmente para espécies emblemáticas como onças-pintadas",
    source: "Cruzamento de dados de pesquisas de interesse no app e tendências globais"
  }
};

// Mock data for charts
const generateChartData = (type: string): any[] => {
  if (type === "fluxo turístico") {
    return [
      { name: 'Bonito', valor: 45 },
      { name: 'Pantanal', valor: 38 },
      { name: 'Corumbá', valor: 29 },
      { name: 'C. Grande', valor: 22 }
    ];
  } else if (type === "origem turistas") {
    return [
      { name: 'São Paulo', valor: 32 },
      { name: 'Paraná', valor: 17 },
      { name: 'Minas Gerais', valor: 12 },
      { name: 'Rio de Janeiro', valor: 9 },
      { name: 'Santa Catarina', valor: 7 },
      { name: 'Outros', valor: 23 }
    ];
  } else if (type === "perfil visitante") {
    return [
      { name: '2023', idade: 42, permanencia: 3.2, gastos: 320 },
      { name: '2024', idade: 40, permanencia: 3.8, gastos: 380 },
      { name: '2025', idade: 38, permanencia: 4.5, gastos: 480 }
    ];
  }
  return [];
};

// Colors for the charts
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findRelevantResponse = (query: string): {
    text: string;
    hasChart: boolean;
    chartType?: 'bar' | 'line' | 'pie';
    source: string;
  } | null => {
    const queryLower = query.toLowerCase();
    
    for (const [key, data] of Object.entries(analyticsResponses)) {
      if (queryLower.includes(key)) {
        return {
          text: data.response,
          hasChart: !!data.chart,
          chartType: data.chart,
          source: data.source
        };
      }
    }
    
    // Fallback response when no specific match is found
    if (queryLower.includes("turismo") || queryLower.includes("dados") || queryLower.includes("análise")) {
      return {
        text: "Para responder sua pergunta de forma mais precisa, precisaria de dados específicos sobre o tema. Posso ajudar com análises sobre fluxo turístico, perfil de visitantes, origens dos turistas, tendências ou comparativos com outros destinos. Poderia reformular sua pergunta com mais detalhes?",
        hasChart: false,
        source: "Analista IA"
      };
    }
    
    return null;
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    // Find a response based on keywords
    const response = findRelevantResponse(inputMessage);
    
    // Simulate AI response with a delay
    setTimeout(() => {
      if (response) {
        const botMessage: Message = {
          id: messages.length + 2,
          text: response.text,
          isBot: true,
          hasChart: response.hasChart,
          chartType: response.chartType,
          chartData: response.hasChart ? generateChartData(getKeywordForResponse(inputMessage)) : undefined,
          source: response.source
        };
        
        setMessages(prevMessages => [...prevMessages, botMessage]);
      } else {
        // Generic response when no relevant information is found
        const botMessage: Message = {
          id: messages.length + 2,
          text: "Não tenho dados específicos sobre esse tema. Posso ajudar com informações sobre fluxo turístico, perfil de visitantes, origens dos turistas, comparativos com outros destinos como Santa Catarina, ou estratégias para períodos como a baixa temporada.",
          isBot: true,
          source: "Analista IA"
        };
        
        setMessages(prevMessages => [...prevMessages, botMessage]);
      }
      
      setIsLoading(false);
    }, 1500);
  };

  const getKeywordForResponse = (query: string): string => {
    const queryLower = query.toLowerCase();
    
    for (const key of Object.keys(analyticsResponses)) {
      if (queryLower.includes(key)) {
        return key;
      }
    }
    
    return "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Render different chart types based on the message type
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
        return <ChartBar size={16} className="mr-1" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <CardHeader className="bg-ms-primary-blue text-white pb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border-2 border-white/30">
            <AvatarImage src="/icons/analytics-ai-logo.png" />
            <AvatarFallback className="bg-blue-700 text-white">
              <ChartBar size={20} />
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
              <ChartBar size={12} className="mr-1" /> Baseado em dados oficiais de turismo
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
                
                {message.hasChart && renderChart(message)}
                
                {message.source && (
                  <div className="mt-2 flex items-center">
                    {message.hasChart && message.chartType && getChartIcon(message.chartType)}
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
                Dados oficiais
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Dados atualizados até Maio/2025
            </p>
          </div>
        </div>
      </CardContent>
    </div>
  );
};

export default AnalyticsAI;
