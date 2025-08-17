import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  MessageSquare, 
  Settings,
  Globe,
  Shield,
  Activity,
  BarChart3,
  Calendar,
  Zap,
  Brain,
  Headphones,
  Wrench,
  FileText,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DataIntegrationService } from '@/services/ai/dataIntegrationService'; // Importar serviço de integração de dados
// StrategicAnalysisAI removido - funcionalidade integrada no superTourismAI
// StrategicAdvisorService removido - funcionalidade integrada no superTourismAI
import { useToast } from '@/hooks/use-toast'; // Importar useToast
import PartnerLeadsManagement from '@/components/admin/PartnerLeadsManagement'; // Importar o novo componente
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Importar Select
import WorkflowManagement from '@/components/admin/WorkflowManagement'; // Importar o novo componente de gerenciamento de workflows
import AiPerformanceMonitoring from '@/components/admin/AiPerformanceMonitoring'; // Importar o novo componente de monitoramento da IA

interface ClientData {
  id: string;
  client_name: string;
  state_name: string;
  status: string;
  monthly_fee: number;
  users_count: number;
  last_activity: string;
  subscription_plan: string;
}

interface SupportTicket {
  id: string;
  client_name: string;
  title: string;
  priority: string;
  status: string;
  created_at: string;
}

interface SystemMetrics {
  total_revenue: number;
  active_clients: number;
  total_users: number;
  system_health: string;
  uptime_percentage: number;
  active_support_tickets: number;
}

const OverFlowOneMasterDashboard = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientData[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    total_revenue: 0,
    active_clients: 0,
    total_users: 0,
    system_health: 'excellent',
    uptime_percentage: 99.9,
    active_support_tickets: 0
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [aiAdvisorResult, setAiAdvisorResult] = useState<any>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);

  // Novos estados para o chat com a IA
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: string; message: string }[]>([]);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [chatContextType, setChatContextType] = useState('general'); // Para filtrar o tipo de contexto

  // Estados para feedback
  const [chatFeedbackType, setChatFeedbackType] = useState<'positive' | 'negative' | 'comment'>('positive');
  const [chatFeedbackComment, setChatFeedbackComment] = useState('');
  const [analysisFeedbackType, setAnalysisFeedbackType] = useState<'positive' | 'negative' | 'comment'>('positive');
  const [analysisFeedbackComment, setAnalysisFeedbackComment] = useState('');

  
  // Credenciais do Master (em produção, isso deveria estar no backend)
  const MASTER_EMAIL = 'master@overflow-one.com';
  const MASTER_PASSWORD = 'OverFlowOneMaster2024!';
  const MASTER_USER_ID = '00000000-0000-0000-0000-000000000001'; // ID de usuário fixo para o Master

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    // Verificar se já está autenticado
    const checkAuth = localStorage.getItem('overflow_one_master_auth');
    if (checkAuth === 'true') {
      setIsAuthenticated(true);
      setShowLogin(false);
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (loginData.email === MASTER_EMAIL && loginData.password === MASTER_PASSWORD) {
      setIsAuthenticated(true);
      setShowLogin(false);
              localStorage.setItem('overflow_one_master_auth', 'true');
      loadDashboardData();
    } else {
      setLoginError('Credenciais inválidas. Apenas o Master pode acessar este dashboard.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowLogin(true);
            localStorage.removeItem('overflow_one_master_auth');
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Dados mockados para demonstração (em produção viriam do banco)
      const mockClients: ClientData[] = [
        {
          id: '1',
          client_name: 'Secretaria de Turismo MS',
          state_name: 'Mato Grosso do Sul',
          status: 'active',
          monthly_fee: 10000,
          users_count: 150,
          last_activity: '2024-07-19T10:30:00Z',
          subscription_plan: 'Premium'
        },
        {
          id: '2',
          client_name: 'Secretaria de Turismo MT',
          state_name: 'Mato Grosso',
          status: 'pending',
          monthly_fee: 5000,
          users_count: 0,
          last_activity: '2024-07-18T15:45:00Z',
          subscription_plan: 'Basic'
        }
      ];

      const mockTickets: SupportTicket[] = [
        {
          id: '1',
          client_name: 'Secretaria de Turismo MS',
          title: 'Dúvida sobre configuração de eventos',
          priority: 'medium',
          status: 'open',
          created_at: '2024-07-19T09:15:00Z'
        },
        {
          id: '2',
          client_name: 'Secretaria de Turismo MT',
          title: 'Problema com upload de imagens',
          priority: 'high',
          status: 'open',
          created_at: '2024-07-19T08:30:00Z'
        }
      ];

      const totalRevenue = mockClients.reduce((sum, client) => sum + client.monthly_fee, 0);

      setMetrics({
        total_revenue: totalRevenue,
        active_clients: mockClients.filter(c => c.status === 'active').length,
        total_users: mockClients.reduce((sum, client) => sum + client.users_count, 0),
        system_health: 'excellent',
        uptime_percentage: 99.9,
        active_support_tickets: mockTickets.length
      });

      setClients(mockClients);
      setTickets(mockTickets);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIAction = async (action: string, data?: any) => {
    console.log(`IA executando ação: ${action}`, data);
    
    // Simular ações da IA
    switch (action) {
      case 'respond_ticket':
        alert('IA respondeu automaticamente ao ticket!');
        break;
      case 'resolve_issue':
        alert('IA resolveu o problema técnico!');
        break;
      case 'generate_report':
        alert('IA gerou relatório mensal!');
        break;
      case 'optimize_system':
        alert('IA otimizou o sistema!');
        break;
    }
  };

  const { toast } = useToast(); // Usar o hook useToast

  const handleSendMessageToAI = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatHistory((prev) => [...prev, { sender: 'Você', message: userMessage }]);
    setChatInput('');
    setIsAiResponding(true);

    try {
      const response = await fetch(`${supabase.functions.url}/admin-advisor-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userMessage, context_type: chatContextType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro desconhecido ao consultar a IA.');
      }

      const data = await response.json();
      setChatHistory((prev) => [...prev, { sender: 'IA Admin', message: data.response }]);
    } catch (error: any) {
      console.error('Erro ao enviar mensagem para IA:', error);
      setChatHistory((prev) => [
        ...prev,
        { sender: 'IA Admin', message: `Desculpe, houve um erro ao processar sua solicitação: ${error.message}` },
      ]);
      toast({
        title: "Erro na comunicação com a IA",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleGenerateFullAnalysis = async () => {
    setIsGeneratingAnalysis(true);
    setAiAnalysisResult(null);
    setAiAdvisorResult(null);

    try {
      const dataIntegrationService = new DataIntegrationService();
      // Serviços removidos - funcionalidade integrada no superTourismAI
      // const strategicAnalysisAI = new StrategicAnalysisAI();
      // const strategicAdvisorService = new StrategicAdvisorService();

      toast({
        title: "Coletando Dados",
        description: "A IA está coletando dados da plataforma para análise...",
        duration: 3000
      });
      const collectedData = await dataIntegrationService.collectTourismData();

      toast({
        title: "Gerando Análise Estratégica",
        description: "A IA está processando os dados e gerando insights...",
        duration: 3000
      });
              // const analysisResult = await strategicAnalysisAI.analyzeData(collectedData);
        const analysisResult = { insights: [], recommendations: [] }; // Placeholder até reintegração
      setAiAnalysisResult(analysisResult);

      toast({
        title: "Gerando Plano de Ação",
        description: "A IA está criando recomendações e um plano de ação...",
        duration: 3000
      });
              // const advisorResult = await strategicAdvisorService.analyzeAndAdvise(collectedData);
        const advisorResult = { recommendations: [], priorities: [] }; // Placeholder até reintegração
      setAiAdvisorResult(advisorResult);

      toast({
        title: "Análise Concluída!",
        description: "A análise completa da IA foi gerada com sucesso.",
        duration: 5000
      });

    } catch (error) {
      console.error("Erro ao gerar análise da IA:", error);
      toast({
        title: "Erro na Geração de Análise",
        description: "Não foi possível gerar a análise completa da IA. Verifique o console para mais detalhes.",
        variant: "destructive",
        duration: 7000
      });
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  const handleFeedback = async (type: 'chat' | 'analysis', feedbackType: 'positive' | 'negative' | 'comment', data?: any) => {
    try {
      const response = await fetch(`${supabase.functions.url}/admin-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: MASTER_USER_ID, // Usar o ID fixo do Master
          type: type,
          feedback_type: feedbackType,
          data: data || null,
          comment: feedbackType === 'comment' ? (type === 'chat' ? chatFeedbackComment : analysisFeedbackComment) : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro desconhecido ao enviar feedback.');
      }

      toast({
        title: "Feedback enviado com sucesso!",
        description: `Feedback de ${type} enviado: ${feedbackType}`,
        variant: "success",
      });

      // Limpar campos de feedback após envio
      if (type === 'chat') {
        setChatFeedbackType('positive');
        setChatFeedbackComment('');
      } else {
        setAnalysisFeedbackType('positive');
        setAnalysisFeedbackComment('');
      }

    } catch (error: any) {
      console.error('Erro ao enviar feedback:', error);
      toast({
        title: "Erro ao enviar feedback",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Tela de Login
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">OverFlow One Master</CardTitle>
            <CardDescription>
              Acesso exclusivo ao Dashboard Master
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Master</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="master@overflow-one.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha Master</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {loginError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              
              <Button type="submit" className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Acessar Dashboard Master
              </Button>
            </form>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>Credenciais de demonstração:</p>
              <p className="font-mono text-xs mt-1">
                                  Email: master@overflow-one.com<br/>
                  Senha: OverFlowOneMaster2024!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">OverFlow One Master Dashboard</h1>
          <p className="text-gray-600">Controle total da plataforma SaaS</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="w-4 h-4 mr-1" />
            Sistema Online
          </Badge>
          <Button onClick={() => handleAIAction('optimize_system')}>
            <Zap className="w-4 h-4 mr-2" />
            IA Otimizar Sistema
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <Shield className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {metrics.total_revenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active_clients}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.total_users} usuários totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime do Sistema</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uptime_percentage}%</div>
            <p className="text-xs text-muted-foreground">
              Status: {metrics.system_health}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Abertos</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active_support_tickets}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando resposta da IA
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Principais */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6"> {/* Alterado de grid-cols-5 para grid-cols-6 */}
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="support">Suporte</TabsTrigger>
          <TabsTrigger value="ai">IA Central</TabsTrigger>
          <TabsTrigger value="partners">Parceiros</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Estados Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{client.state_name}</p>
                        <p className="text-sm text-gray-600">{client.client_name}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                          {client.status === 'active' ? 'Ativo' : 'Pendente'}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          R$ {client.monthly_fee.toLocaleString()}/mês
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Performance do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>CPU</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '25%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">25%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Memória</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Storage</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">60%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Clientes</CardTitle>
              <CardDescription>
                Gerencie todos os estados contratantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.map((client) => (
                  <div key={client.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{client.state_name}</h3>
                        <p className="text-sm text-gray-600">{client.client_name}</p>
                        <p className="text-sm text-gray-500">
                          Plano: {client.subscription_plan} | 
                          Usuários: {client.users_count} |
                          Última atividade: {new Date(client.last_activity).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">R$ {client.monthly_fee.toLocaleString()}/mês</p>
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                          {client.status === 'active' ? 'Ativo' : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suporte e Tickets</CardTitle>
              <CardDescription>
                Monitoramento de tickets e problemas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{ticket.title}</h3>
                        <p className="text-sm text-gray-600">{ticket.client_name}</p>
                        <p className="text-sm text-gray-500">
                          Criado em: {new Date(ticket.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          ticket.priority === 'high' ? 'destructive' : 
                          ticket.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {ticket.priority === 'high' ? 'Alta' : 
                           ticket.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                        <div className="mt-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleAIAction('respond_ticket', ticket.id)}
                          >
                            <Brain className="w-4 h-4 mr-1" />
                            IA Responder
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IA Superinteligente</CardTitle>
              <CardDescription>
                Controle das ações automáticas da IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Botões existentes para ações da IA */}
                <Button 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => handleAIAction('generate_report')}
                >
                  <FileText className="w-6 h-6 mb-2" />
                  Gerar Relatório Mensal
                </Button>
                
                <Button 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => handleAIAction('resolve_issue')}
                >
                  <Wrench className="w-6 h-6 mb-2" />
                  Resolver Problemas Técnicos
                </Button>
                
                <Button 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => handleAIAction('optimize_system')}
                >
                  <Zap className="w-6 h-6 mb-2" />
                  Otimizar Sistema
                </Button>
                
                <Button 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => handleAIAction('analyze_clients')}
                >
                  <Brain className="w-6 h-6 mb-2" />
                  Analisar Clientes
                </Button>
                
                <Button 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={handleGenerateFullAnalysis} 
                  disabled={isGeneratingAnalysis}
                >
                  {isGeneratingAnalysis ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mb-2"></div>
                      Gerando Análise...
                    </div>
                  ) : (
                    <>
                      <BarChart3 className="w-6 h-6 mb-2" />
                      Gerar Análise Completa
                    </>
                  )}
                </Button>
              </div>
              
              {/* Seção de Chat com a IA */}
              <div className="mt-8 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold mb-4">Conversar com a IA Administradora</h3>
                <div className="space-y-4 max-h-80 overflow-y-auto p-2 bg-white rounded-md border">
                  {chatHistory.length === 0 ? (
                    <p className="text-gray-500 text-center">Digite uma pergunta para iniciar a conversa...</p>
                  ) : (
                    chatHistory.map((msg, index) => (
                      <div key={index} className={`flex ${msg.sender === 'Você' ? 'justify-end' : 'justify-start'}`}>
                        <div 
                          className={`p-2 rounded-lg max-w-[70%] ${msg.sender === 'Você' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                          dangerouslySetInnerHTML={{ __html: msg.message.replace(/\n/g, '<br/>') }} // Renderiza markdown básico
                        />
                      </div>
                    ))
                  )}
                  {isAiResponding && (
                    <div className="flex justify-start">
                      <div className="p-2 rounded-lg bg-gray-200 text-gray-800">
                        Digitando...
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Feedback da IA do Chat */}
                {chatHistory.length > 0 && chatHistory[chatHistory.length - 1].sender === 'IA Admin' && (
                  <div className="mt-4 flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Esta resposta foi útil?</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleFeedback('chat', 'positive')}
                    >
                      👍 Sim
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleFeedback('chat', 'negative')}
                    >
                      👎 Não
                    </Button>
                    <Input 
                      placeholder="Comentário (opcional)" 
                      className="flex-grow" 
                      onChange={(e) => setChatFeedbackComment(e.target.value)}
                      value={chatFeedbackComment}
                    />
                    <Button onClick={() => handleFeedback('chat', 'comment', chatFeedbackComment)} disabled={!chatFeedbackComment.trim()}>
                      Enviar
                    </Button>
                  </div>
                )}

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Pergunte algo sobre a administração da plataforma..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isAiResponding) {
                        handleSendMessageToAI();
                      }
                    }}
                    className="flex-grow"
                    disabled={isAiResponding}
                  />
                  <Select onValueChange={setChatContextType} defaultValue={chatContextType} disabled={isAiResponding}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Contexto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Geral</SelectItem>
                      <SelectItem value="administrative">Administrativo</SelectItem>
                      <SelectItem value="technical">Técnico</SelectItem>
                      <SelectItem value="financial">Financeiro</SelectItem>
                      <SelectItem value="customer_support">Suporte ao Cliente</SelectItem>
                      <SelectItem value="contract">Contrato</SelectItem>
                      <SelectItem value="faq">FAQ</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleSendMessageToAI} disabled={isAiResponding}>
                    <Brain className="w-4 h-4 mr-2" />
                    Perguntar
                  </Button>
                </div>
              </div>

              {/* Resultados da Análise AI (existente) */}
              {aiAnalysisResult && (
                <div className="mt-8 p-4 border rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4">Resultados da Análise Estratégica da IA</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700">Análise Principal:</h4>
                      <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded border mt-2">{JSON.stringify(aiAnalysisResult.analysis, null, 2)}</pre>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Recomendações da Análise:</h4>
                      <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded border mt-2">{JSON.stringify(aiAnalysisResult.recommendations, null, 2)}</pre>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Fonte de Dados:</h4>
                      <p className="text-sm text-gray-600">Alumia: {aiAnalysisResult.dataSource.hasAlumia ? 'Sim' : 'Não'}, Comunidade: {aiAnalysisResult.dataSource.hasCommunity ? 'Sim' : 'Não'}, Econômicos: {aiAnalysisResult.dataSource.hasEconomic ? 'Sim' : 'Não'}</p>
                    </div>
                  </div>
                  {/* Feedback da Análise Completa */}
                  <div className="mt-4 flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Esta análise foi útil?</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleFeedback('analysis', 'positive', JSON.stringify(aiAnalysisResult))}
                    >
                      👍 Sim
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleFeedback('analysis', 'negative', JSON.stringify(aiAnalysisResult))}
                    >
                      👎 Não
                    </Button>
                    <Input 
                      placeholder="Comentário (opcional)" 
                      className="flex-grow" 
                      onChange={(e) => setAnalysisFeedbackComment(e.target.value)}
                      value={analysisFeedbackComment}
                    />
                    <Button onClick={() => handleFeedback('analysis', 'comment', analysisFeedbackComment, JSON.stringify(aiAnalysisResult))} disabled={!analysisFeedbackComment.trim()}>
                      Enviar
                    </Button>
                  </div>
                </div>
              )}

              {aiAdvisorResult && (
                <div className="mt-8 p-4 border rounded-lg bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4">Plano de Ação e Aconselhamento da IA</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700">Insights:</h4>
                      <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded border mt-2">{JSON.stringify(aiAdvisorResult.insights, null, 2)}</pre>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Recomendações:</h4>
                      <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded border mt-2">{JSON.stringify(aiAdvisorResult.recommendations, null, 2)}</pre>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Plano de Ação Detalhado:</h4>
                      <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded border mt-2">{JSON.stringify(aiAdvisorResult.actionPlan, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Seção de Monitoramento de Performance da IA */}
              <AiPerformanceMonitoring />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="space-y-4">
          <PartnerLeadsManagement />
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <WorkflowManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OverFlowOneMasterDashboard; 