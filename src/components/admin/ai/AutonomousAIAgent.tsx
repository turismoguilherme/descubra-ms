import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Bot, Zap, Activity, Play, Pause, Settings, Clock, Target,
  CheckCircle, AlertTriangle, Loader2, Brain, Sparkles, 
  MessageSquare, FileText, Image, Send, BarChart3, 
  TrendingUp, RefreshCw, Eye, Edit3, Mail, Bell,
  Database, Users, Calendar, DollarSign, Shield,
  GitBranch, Code, Workflow
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AITask {
  id: string;
  type: 'analysis' | 'report' | 'content' | 'optimization' | 'notification' | 'backup' | 'cleanup';
  name: string;
  description: string;
  schedule: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  status: 'idle' | 'running' | 'completed' | 'error';
  result?: string;
}

interface AILog {
  id: string;
  taskId: string;
  taskName: string;
  action: string;
  status: 'success' | 'error' | 'warning';
  timestamp: Date;
  details?: string;
}

const defaultTasks: AITask[] = [
  {
    id: '1',
    type: 'analysis',
    name: 'Análise de Métricas',
    description: 'Analisa métricas de usuários, receitas e engajamento. Gera insights automáticos.',
    schedule: 'Diariamente às 08:00',
    enabled: true,
    status: 'idle',
  },
  {
    id: '2',
    type: 'report',
    name: 'Relatório Financeiro',
    description: 'Gera relatório financeiro com receitas, despesas e projeções.',
    schedule: 'Semanalmente (Segunda)',
    enabled: true,
    status: 'idle',
  },
  {
    id: '3',
    type: 'content',
    name: 'Sugestões de Conteúdo',
    description: 'Sugere novos conteúdos baseado em tendências e comportamento dos usuários.',
    schedule: 'Diariamente às 10:00',
    enabled: false,
    status: 'idle',
  },
  {
    id: '4',
    type: 'optimization',
    name: 'Otimização de SEO',
    description: 'Analisa e sugere melhorias de SEO para páginas e conteúdos.',
    schedule: 'Semanalmente (Quarta)',
    enabled: false,
    status: 'idle',
  },
  {
    id: '5',
    type: 'notification',
    name: 'Alertas de Anomalias',
    description: 'Detecta padrões incomuns e envia alertas automáticos.',
    schedule: 'A cada hora',
    enabled: true,
    status: 'idle',
  },
  {
    id: '6',
    type: 'backup',
    name: 'Backup de Dados',
    description: 'Realiza backup automático dos dados críticos do sistema.',
    schedule: 'Diariamente às 03:00',
    enabled: true,
    status: 'idle',
  },
  {
    id: '7',
    type: 'cleanup',
    name: 'Limpeza de Cache',
    description: 'Limpa cache e dados temporários para otimizar performance.',
    schedule: 'Semanalmente (Domingo)',
    enabled: true,
    status: 'idle',
  },
];

export default function AutonomousAIAgent() {
  const { toast } = useToast();
  const [agentActive, setAgentActive] = useState(false);
  const [tasks, setTasks] = useState<AITask[]>(defaultTasks);
  const [logs, setLogs] = useState<AILog[]>([]);
  const [autonomyLevel, setAutonomyLevel] = useState([50]);
  const [selectedTask, setSelectedTask] = useState<AITask | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load saved state
    const saved = localStorage.getItem('ai_agent_config');
    if (saved) {
      const config = JSON.parse(saved);
      setAgentActive(config.active || false);
      setAutonomyLevel([config.autonomyLevel || 50]);
      if (config.tasks) setTasks(config.tasks);
    }

    // Add welcome message
    setChatMessages([
      {
        role: 'assistant',
        content: 'Olá! Sou seu Agente de IA Autônomo. Posso ajudar com análises, relatórios, e executar tarefas automáticas. O que você gostaria de fazer hoje?'
      }
    ]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const saveConfig = () => {
    localStorage.setItem('ai_agent_config', JSON.stringify({
      active: agentActive,
      autonomyLevel: autonomyLevel[0],
      tasks: tasks
    }));
  };

  useEffect(() => {
    saveConfig();
  }, [agentActive, autonomyLevel, tasks]);

  const toggleAgent = () => {
    setAgentActive(!agentActive);
    toast({
      title: !agentActive ? 'Agente IA Ativado!' : 'Agente IA Desativado',
      description: !agentActive 
        ? 'O agente irá executar tarefas automaticamente conforme configurado.'
        : 'Todas as tarefas automáticas foram pausadas.',
    });
    
    addLog({
      taskId: 'system',
      taskName: 'Sistema',
      action: !agentActive ? 'Agente ativado' : 'Agente desativado',
      status: 'success',
    });
  };

  const addLog = (log: Omit<AILog, 'id' | 'timestamp'>) => {
    setLogs(prev => [{
      ...log,
      id: Date.now().toString(),
      timestamp: new Date()
    }, ...prev].slice(0, 100));
  };

  const runTask = async (task: AITask) => {
    setTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, status: 'running' as const } : t
    ));

    addLog({
      taskId: task.id,
      taskName: task.name,
      action: 'Tarefa iniciada',
      status: 'success',
    });

    // Simular execução
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000));

    const success = Math.random() > 0.1;
    
    setTasks(prev => prev.map(t => 
      t.id === task.id ? { 
        ...t, 
        status: success ? 'completed' as const : 'error' as const,
        lastRun: new Date(),
        result: success ? 'Tarefa executada com sucesso' : 'Erro durante execução'
      } : t
    ));

    addLog({
      taskId: task.id,
      taskName: task.name,
      action: success ? 'Tarefa concluída' : 'Erro na execução',
      status: success ? 'success' : 'error',
      details: success ? `Executada em ${(2 + Math.random() * 3).toFixed(1)}s` : 'Erro de conexão'
    });

    toast({
      title: success ? 'Tarefa concluída!' : 'Erro na tarefa',
      description: task.name,
      variant: success ? 'default' : 'destructive',
    });

    // Reset status after a while
    setTimeout(() => {
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: 'idle' as const } : t
      ));
    }, 5000);
  };

  const toggleTaskEnabled = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, enabled: !t.enabled } : t
    ));
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setProcessing(true);

    // Simulate AI response
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));

    const responses = [
      'Analisei os dados e encontrei alguns insights interessantes. A receita aumentou 15% este mês em relação ao anterior.',
      'Baseado nos padrões de uso, recomendo publicar novos conteúdos às terças e quintas-feiras, quando o engajamento é maior.',
      'Identifiquei 3 tarefas pendentes que podem ser automatizadas. Gostaria que eu configure isso para você?',
      'O relatório financeiro do mês passado foi gerado. As principais métricas estão acima da meta.',
      'Notei que alguns usuários estão tendo dificuldades no fluxo de cadastro. Sugiro simplificar o processo.',
      'A análise de SEO indica que 5 páginas podem ser otimizadas para melhorar o ranking.',
    ];

    setChatMessages(prev => [...prev, { 
      role: 'assistant', 
      content: responses[Math.floor(Math.random() * responses.length)] 
    }]);
    setProcessing(false);
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'analysis': return BarChart3;
      case 'report': return FileText;
      case 'content': return Edit3;
      case 'optimization': return TrendingUp;
      case 'notification': return Bell;
      case 'backup': return Database;
      case 'cleanup': return RefreshCw;
      default: return Workflow;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running': 
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Executando
        </Badge>;
      case 'completed': 
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
          <CheckCircle className="h-3 w-3 mr-1" /> Concluída
        </Badge>;
      case 'error': 
        return <Badge className="bg-red-100 text-red-700 border-red-200">
          <AlertTriangle className="h-3 w-3 mr-1" /> Erro
        </Badge>;
      default: 
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200">
          <Clock className="h-3 w-3 mr-1" /> Aguardando
        </Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bot className="h-7 w-7 text-emerald-600" />
            Agente IA Autônomo
          </h2>
          <p className="text-slate-500 mt-1">
            Inteligência artificial que trabalha por você automaticamente
          </p>
        </div>
        <Button 
          onClick={toggleAgent}
          className={cn(
            "gap-2 px-6",
            agentActive 
              ? "bg-red-500 hover:bg-red-600" 
              : "bg-emerald-600 hover:bg-emerald-700"
          )}
        >
          {agentActive ? (
            <>
              <Pause className="h-4 w-4" />
              Pausar Agente
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Ativar Agente
            </>
          )}
        </Button>
      </div>

      {/* Status Card */}
      <Card className={cn(
        "border-2 transition-all",
        agentActive 
          ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200" 
          : "bg-slate-50 border-slate-200"
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-xl",
                agentActive ? "bg-emerald-100" : "bg-slate-200"
              )}>
                <Brain className={cn(
                  "h-8 w-8",
                  agentActive ? "text-emerald-600" : "text-slate-400"
                )} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {agentActive ? 'Agente Ativo' : 'Agente Inativo'}
                </h3>
                <p className="text-slate-500">
                  {agentActive 
                    ? `${tasks.filter(t => t.enabled).length} tarefas ativas` 
                    : 'Ative o agente para executar tarefas automaticamente'}
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {tasks.filter(t => t.enabled).length}
                </div>
                <div className="text-xs text-slate-500">Tarefas Ativas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {logs.filter(l => l.status === 'success').length}
                </div>
                <div className="text-xs text-slate-500">Executadas Hoje</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {autonomyLevel[0]}%
                </div>
                <div className="text-xs text-slate-500">Autonomia</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="tasks">Tarefas Automáticas</TabsTrigger>
          <TabsTrigger value="chat">Chat com IA</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        {/* Tarefas */}
        <TabsContent value="tasks">
          <div className="grid gap-4">
            {tasks.map(task => {
              const Icon = getTaskIcon(task.type);
              return (
                <Card 
                  key={task.id} 
                  className={cn(
                    "bg-white border transition-all",
                    task.enabled ? "border-emerald-200" : "border-slate-200",
                    task.status === 'running' && "border-blue-300 shadow-blue-100 shadow-md"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={cn(
                          "p-2 rounded-lg",
                          task.enabled ? "bg-emerald-100" : "bg-slate-100"
                        )}>
                          <Icon className={cn(
                            "h-5 w-5",
                            task.enabled ? "text-emerald-600" : "text-slate-400"
                          )} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-slate-800">{task.name}</h4>
                            {getStatusBadge(task.status)}
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">{task.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.schedule}
                            </span>
                            {task.lastRun && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Última: {format(task.lastRun, 'dd/MM HH:mm', { locale: ptBR })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={task.enabled}
                          onCheckedChange={() => toggleTaskEnabled(task.id)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => runTask(task)}
                          disabled={task.status === 'running'}
                        >
                          {task.status === 'running' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Chat com IA */}
        <TabsContent value="chat">
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-slate-800 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Assistente Inteligente
              </CardTitle>
              <CardDescription>
                Converse com a IA para obter insights, análises e executar ações
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "flex gap-3",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="p-2 rounded-full bg-emerald-100 h-8 w-8 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-emerald-600" />
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[70%] p-3 rounded-lg",
                      msg.role === 'user' 
                        ? "bg-emerald-600 text-white" 
                        : "bg-slate-100 text-slate-700"
                    )}>
                      {msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <div className="p-2 rounded-full bg-slate-200 h-8 w-8 flex items-center justify-center">
                        <Users className="h-4 w-4 text-slate-600" />
                      </div>
                    )}
                  </div>
                ))}
                {processing && (
                  <div className="flex gap-3">
                    <div className="p-2 rounded-full bg-emerald-100 h-8 w-8 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="bg-slate-100 p-3 rounded-lg">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-slate-100">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                    disabled={processing}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleChat} 
                    disabled={processing || !chatInput.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={() => setChatInput('Gerar relatório de hoje')}>
                    📊 Relatório
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setChatInput('Analisar métricas')}>
                    📈 Análise
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setChatInput('Sugestões de melhoria')}>
                    💡 Sugestões
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs */}
        <TabsContent value="logs">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">Histórico de Execuções</CardTitle>
              <CardDescription>Logs das tarefas executadas pelo agente</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length > 0 ? (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {logs.map(log => (
                    <div 
                      key={log.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border",
                        log.status === 'success' && "bg-emerald-50/50 border-emerald-100",
                        log.status === 'error' && "bg-red-50/50 border-red-100",
                        log.status === 'warning' && "bg-amber-50/50 border-amber-100"
                      )}
                    >
                      {log.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : log.status === 'error' ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-700">{log.taskName}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-sm text-slate-500">{log.action}</span>
                        </div>
                        {log.details && (
                          <p className="text-xs text-slate-400 mt-0.5">{log.details}</p>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        {format(log.timestamp, 'HH:mm:ss', { locale: ptBR })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-600">Nenhuma execução registrada</p>
                  <p className="text-sm text-slate-400">As atividades do agente aparecerão aqui</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="config">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">Configurações do Agente</CardTitle>
              <CardDescription>Personalize o comportamento da IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nível de Autonomia */}
              <div className="space-y-4 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-800">Nível de Autonomia</h4>
                    <p className="text-sm text-slate-500">
                      Define quanto a IA pode agir sem sua confirmação
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-emerald-600">{autonomyLevel[0]}%</span>
                </div>
                
                <Slider
                  value={autonomyLevel}
                  onValueChange={setAutonomyLevel}
                  max={100}
                  step={10}
                  className="py-4"
                />
                
                <div className="flex justify-between text-xs text-slate-400">
                  <span>0% - Só com aprovação</span>
                  <span>50% - Balanceado</span>
                  <span>100% - Totalmente autônomo</span>
                </div>

                <div className={cn(
                  "p-3 rounded-lg text-sm",
                  autonomyLevel[0] < 30 && "bg-blue-50 text-blue-700",
                  autonomyLevel[0] >= 30 && autonomyLevel[0] < 70 && "bg-amber-50 text-amber-700",
                  autonomyLevel[0] >= 70 && "bg-emerald-50 text-emerald-700"
                )}>
                  {autonomyLevel[0] < 30 && (
                    <p>🔒 <strong>Modo Conservador:</strong> A IA sempre pedirá sua aprovação antes de executar qualquer ação.</p>
                  )}
                  {autonomyLevel[0] >= 30 && autonomyLevel[0] < 70 && (
                    <p>⚖️ <strong>Modo Balanceado:</strong> A IA executa tarefas rotineiras sozinha e pede aprovação para ações importantes.</p>
                  )}
                  {autonomyLevel[0] >= 70 && (
                    <p>🚀 <strong>Modo Autônomo:</strong> A IA executa todas as tarefas automaticamente e só notifica sobre resultados.</p>
                  )}
                </div>
              </div>

              {/* Permissões */}
              <div className="space-y-4 p-4 rounded-lg border border-slate-200">
                <h4 className="font-medium text-slate-800">Permissões do Agente</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">Modificar dados no banco</span>
                    </div>
                    <Switch defaultChecked={autonomyLevel[0] > 50} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">Enviar notificações</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">Gerar relatórios</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">Acessar dados financeiros</span>
                    </div>
                    <Switch defaultChecked={autonomyLevel[0] > 70} />
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => {
                  saveConfig();
                  toast({ title: 'Configurações salvas!' });
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

