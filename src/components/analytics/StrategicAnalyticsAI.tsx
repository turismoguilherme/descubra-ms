import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, MapPin, Brain, Send, FileText, Target, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  insights?: AIInsight[];
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  priority: string;
  confidence_score: number;
  recommendations: any;
}

interface UserInteraction {
  interaction_type: string;
  count: number;
  avg_duration: number;
}

interface StrategicAnalyticsAIProps {
  userRegion?: string;
}

const StrategicAnalyticsAI: React.FC<StrategicAnalyticsAIProps> = ({ userRegion = 'all' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userStats, setUserStats] = useState<UserInteraction[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUserStats();
    loadAIInsights();
    // Adicionar mensagem de boas-vindas
    setMessages([{
      id: '1',
      type: 'ai',
      content: `Olá! Sou sua IA Analítica Estratégica para desenvolvimento turístico. Posso ajudar você com:

📊 **Análise de dados** de visitação e comportamento dos usuários
🎯 **Estratégias de desenvolvimento** turístico personalizada para sua região
💡 **Insights automáticos** sobre oportunidades de mercado
📈 **Simulação de cenários** e projeções de ROI
🏛️ **Sugestões de políticas públicas** baseadas em dados
🤝 **Estratégias de parcerias** regionais e investimentos

Digite sua pergunta estratégica ou escolha um dos tópicos acima para começar!`,
      timestamp: new Date()
    }]);
  }, [userRegion]);

  const loadUserStats = async () => {
    try {
      const { data, error } = await supabase
        .from('user_interactions')
        .select('interaction_type, duration_seconds')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      // Agrupar estatísticas
      const stats = data?.reduce((acc: any, interaction) => {
        const type = interaction.interaction_type;
        if (!acc[type]) {
          acc[type] = { count: 0, total_duration: 0 };
        }
        acc[type].count++;
        acc[type].total_duration += interaction.duration_seconds || 0;
        return acc;
      }, {});

      const formattedStats = Object.entries(stats || {}).map(([type, data]: [string, any]) => ({
        interaction_type: type,
        count: data.count,
        avg_duration: data.total_duration / data.count
      }));

      setUserStats(formattedStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadAIInsights = async () => {
    try {
      const query = supabase
        .from('ai_insights')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (userRegion !== 'all') {
        query.eq('region', userRegion);
      }

      const { data, error } = await query;
      if (error) throw error;

      setAIInsights(data || []);
    } catch (error) {
      console.error('Erro ao carregar insights:', error);
    }
  };

  const generateStrategicResponse = async (prompt: string): Promise<string> => {
    // Montar contexto com dados disponíveis
    const context = `
    DADOS DA REGIÃO ${userRegion.toUpperCase()}:
    
    📊 ESTATÍSTICAS DE USUÁRIOS:
    ${userStats.map(stat => 
      `- ${stat.interaction_type}: ${stat.count} interações, ${Math.round(stat.avg_duration)}s médio`
    ).join('\n')}
    
    💡 INSIGHTS ATIVOS:
    ${aiInsights.map(insight => 
      `- ${insight.title} (${insight.priority} prioridade, ${Math.round(insight.confidence_score * 100)}% confiança)`
    ).join('\n')}
    
    PERGUNTA DO GESTOR: ${prompt}
    
    Como IA Analítica Estratégica especializada em turismo, forneça uma resposta detalhada que inclua:
    1. Análise dos dados apresentados
    2. Estratégias específicas e acionáveis
    3. Estimativas de ROI quando possível
    4. Recomendações de políticas públicas
    5. Sugestões de parcerias e investimentos
    6. Métricas para acompanhamento
    
    Seja específico, prático e baseado em dados.`;

    try {
      const { data, error } = await supabase.functions.invoke('delinha-ai', {
        body: {
          prompt: context,
          userInfo: {
            origem: 'Gestão Estratégica - IA Analítica',
            interesses: ['desenvolvimento_turistico', 'politicas_publicas', 'analise_dados']
          },
          useOfficialSources: true
        }
      });

      if (error) throw error;
      return data.response || 'Erro ao processar sua solicitação estratégica.';
    } catch (error) {
      console.error('Erro na IA:', error);
      return 'Desculpe, ocorreu um erro ao processar sua consulta estratégica. Tente novamente.';
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await generateStrategicResponse(inputMessage);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Erro na Análise",
        description: "Não foi possível processar sua consulta estratégica.",
        variant: "destructive"
      });
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const QuickActions = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setInputMessage("Analise o perfil dos turistas da minha região e sugira estratégias de atração de novos segmentos")}
        className="text-xs"
      >
        <Users className="w-3 h-3 mr-1" />
        Perfil Turistas
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setInputMessage("Quais investimentos em infraestrutura dariam melhor ROI para o turismo local?")}
        className="text-xs"
      >
        <Target className="w-3 h-3 mr-1" />
        ROI Investimentos
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setInputMessage("Sugira políticas públicas para aumentar a competitividade turística da região")}
        className="text-xs"
      >
        <FileText className="w-3 h-3 mr-1" />
        Políticas Públicas
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setInputMessage("Identifique oportunidades de parcerias estratégicas para o desenvolvimento turístico")}
        className="text-xs"
      >
        <TrendingUp className="w-3 h-3 mr-1" />
        Parcerias
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setInputMessage("Analise a sazonalidade do turismo e sugira estratégias para períodos de baixa")}
        className="text-xs"
      >
        <BarChart3 className="w-3 h-3 mr-1" />
        Sazonalidade
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setInputMessage("Quais são as tendências emergentes no turismo que posso aproveitar na minha região?")}
        className="text-xs"
      >
        <AlertCircle className="w-3 h-3 mr-1" />
        Tendências
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-white/30">
              <AvatarImage src="/icons/analytics-ai-logo.png" />
              <AvatarFallback className="bg-blue-700 text-white">
                <Brain size={24} />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">IA Analítica Estratégica</CardTitle>
              <p className="text-sm text-white/80 flex items-center">
                <Target size={12} className="mr-1" />
                Consultoria Inteligente para Desenvolvimento Turístico
              </p>
              <Badge variant="outline" className="mt-1 text-xs border-white/30 text-white/90">
                Região: {userRegion === 'all' ? 'Todas' : userRegion}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">Consultoria IA</TabsTrigger>
              <TabsTrigger value="insights">Insights Automáticos</TabsTrigger>
              <TabsTrigger value="stats">Dados da Região</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-4">
              <QuickActions />
              
              <div className="h-[400px] overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${
                      message.type === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block max-w-[80%] p-3 rounded-lg whitespace-pre-wrap ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white ml-auto'
                          : 'bg-white border shadow-sm'
                      }`}
                    >
                      {message.content}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                {isLoading && (
                  <div className="text-center">
                    <div className="animate-pulse text-blue-600">
                      🧠 Analisando dados e gerando insights estratégicos...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex space-x-2">
                <Input
                  placeholder="Digite sua pergunta estratégica sobre desenvolvimento turístico..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send size={16} />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-4">
              <div className="space-y-4">
                {aiInsights.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum insight gerado ainda. Interaja com a IA para gerar análises automáticas.
                  </p>
                ) : (
                  aiInsights.map((insight) => (
                    <Card key={insight.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <Badge 
                            variant={insight.priority === 'critical' ? 'destructive' : 'secondary'}
                          >
                            {insight.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-2">{insight.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Confiança: {Math.round(insight.confidence_score * 100)}%</span>
                          <span>•</span>
                          <span>Recomendações disponíveis</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userStats.length === 0 ? (
                  <p className="col-span-2 text-center text-gray-500 py-8">
                    Ainda não há dados de interação dos usuários para análise.
                  </p>
                ) : (
                  userStats.map((stat) => (
                    <Card key={stat.interaction_type}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          {stat.interaction_type.replace('_', ' ').toUpperCase()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-blue-600">
                            {stat.count}
                          </span>
                          <span className="text-sm text-gray-500">
                            {Math.round(stat.avg_duration)}s médio
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategicAnalyticsAI;