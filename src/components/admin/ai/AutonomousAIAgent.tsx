import { useState, useEffect, useRef, useCallback } from 'react';
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
import { autonomousAgentService } from '@/services/admin/autonomousAgentService';
import { generateContent } from '@/config/gemini';
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

const getDefaultTasks = (): AITask[] => {
  const now = new Date();
  
  return [
    {
      id: '1',
      type: 'analysis',
      name: 'Análise de Métricas',
      description: 'Analisa métricas de usuários, receitas e engajamento. Gera insights automáticos.',
      schedule: 'Diariamente às 08:00',
      enabled: true,
      status: 'idle',
      nextRun: (() => {
        const next = new Date(now);
        next.setHours(8, 0, 0, 0);
        if (next <= now) next.setDate(next.getDate() + 1);
        return next;
      })(),
    },
    {
      id: '2',
      type: 'report',
      name: 'Relatório Financeiro',
      description: 'Gera relatório financeiro com receitas, despesas e projeções.',
      schedule: 'Semanalmente (Segunda)',
      enabled: true,
      status: 'idle',
      nextRun: (() => {
        const next = new Date(now);
        const daysUntilMonday = (1 - next.getDay() + 7) % 7 || 7;
        next.setDate(next.getDate() + daysUntilMonday);
        next.setHours(8, 0, 0, 0);
        return next;
      })(),
    },
    {
      id: '3',
      type: 'content',
      name: 'Sugestões de Conteúdo',
      description: 'Sugere novos conteúdos baseado em tendências e comportamento dos usuários.',
      schedule: 'Diariamente às 10:00',
      enabled: false,
      status: 'idle',
      nextRun: (() => {
        const next = new Date(now);
        next.setHours(10, 0, 0, 0);
        if (next <= now) next.setDate(next.getDate() + 1);
        return next;
      })(),
    },
    {
      id: '4',
      type: 'optimization',
      name: 'Otimização de SEO',
      description: 'Analisa e sugere melhorias de SEO para páginas e conteúdos.',
      schedule: 'Semanalmente (Quarta)',
      enabled: false,
      status: 'idle',
      nextRun: (() => {
        const next = new Date(now);
        const daysUntilWednesday = (3 - next.getDay() + 7) % 7 || 7;
        next.setDate(next.getDate() + daysUntilWednesday);
        next.setHours(8, 0, 0, 0);
        return next;
      })(),
    },
    {
      id: '5',
      type: 'notification',
      name: 'Alertas de Anomalias',
      description: 'Detecta padrões incomuns e envia alertas automáticos.',
      schedule: 'A cada hora',
      enabled: true,
      status: 'idle',
      nextRun: (() => {
        const next = new Date(now);
        next.setHours(next.getHours() + 1, 0, 0, 0);
        return next;
      })(),
    },
    {
      id: '6',
      type: 'backup',
      name: 'Backup de Dados',
      description: 'Realiza backup automático dos dados críticos do sistema.',
      schedule: 'Diariamente às 03:00',
      enabled: true,
      status: 'idle',
      nextRun: (() => {
        const next = new Date(now);
        next.setHours(3, 0, 0, 0);
        if (next <= now) next.setDate(next.getDate() + 1);
        return next;
      })(),
    },
    {
      id: '7',
      type: 'cleanup',
      name: 'Limpeza de Cache',
      description: 'Limpa cache e dados temporários para otimizar performance.',
      schedule: 'Semanalmente (Domingo)',
      enabled: true,
      status: 'idle',
      nextRun: (() => {
        const next = new Date(now);
        const daysUntilSunday = (0 - next.getDay() + 7) % 7 || 7;
        next.setDate(next.getDate() + daysUntilSunday);
        next.setHours(8, 0, 0, 0);
        return next;
      })(),
    },
  ];
};

export default function AutonomousAIAgent() {
  const { toast } = useToast();
  const [agentActive, setAgentActive] = useState(false);
  const [tasks, setTasks] = useState<AITask[]>(getDefaultTasks());
  const [logs, setLogs] = useState<AILog[]>([]);
  const [autonomyLevel, setAutonomyLevel] = useState([50]);
  const [selectedTask, setSelectedTask] = useState<AITask | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Estados para as permissões
  const [permissions, setPermissions] = useState({
    modifyDatabase: false,
    sendNotifications: true,
    generateReports: true,
    accessFinancialData: false,
  });

  useEffect(() => {
    // Load saved state
    const saved = localStorage.getItem('ai_agent_config');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setAgentActive(config.active || false);
        setAutonomyLevel([config.autonomyLevel || 50]);
        if (config.tasks) setTasks(config.tasks);
        
        // Carregar permissões salvas
        if (config.permissions) {
          setPermissions({
            modifyDatabase: config.permissions.modifyDatabase ?? false,
            sendNotifications: config.permissions.sendNotifications ?? true,
            generateReports: config.permissions.generateReports ?? true,
            accessFinancialData: config.permissions.accessFinancialData ?? false,
          });
        } else {
          // Valores padrão baseados no nível de autonomia inicial
          const initialAutonomy = config.autonomyLevel || 50;
          setPermissions({
            modifyDatabase: initialAutonomy > 50,
            sendNotifications: true,
            generateReports: true,
            accessFinancialData: initialAutonomy > 70,
          });
        }
      } catch (error) {
        console.error('Erro ao carregar configurações salvas:', error);
      }
    } else {
      // Valores padrão baseados no nível de autonomia inicial (50)
      setPermissions({
        modifyDatabase: false,
        sendNotifications: true,
        generateReports: true,
        accessFinancialData: false,
      });
    }

    // Add welcome message
    setChatMessages([
      {
        role: 'assistant',
        content: 'Olá! Sou seu Agente de IA Autônomo. Posso ajudar com análises, relatórios, e executar tarefas automáticas. O que você gostaria de fazer hoje?'
      }
    ]);
  }, []);

  // Sistema de agendamento automático
  useEffect(() => {
    if (!agentActive) {
      console.log('🤖 [AutonomousAgent] Agente desativado - tarefas automáticas pausadas');
      return;
    }

    console.log('🤖 [AutonomousAgent] Agente ativado - iniciando verificação de tarefas agendadas');

    const checkScheduledTasks = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDay = now.getDay(); // 0 = Domingo, 1 = Segunda, etc.

      console.log(`🕐 [AutonomousAgent] Verificando tarefas - Hora: ${currentHour}:${currentMinute.toString().padStart(2, '0')}, Dia: ${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][currentDay]}`);

      setTasks(currentTasks => {
        const tasksToRun: AITask[] = [];
        const enabledTasks = currentTasks.filter(t => t.enabled);
        
        console.log(`📋 [AutonomousAgent] Total de tarefas: ${currentTasks.length}, Habilitadas: ${enabledTasks.length}`);

        currentTasks.forEach(task => {
          if (!task.enabled) {
            console.log(`⏸️ [AutonomousAgent] Tarefa ${task.name} está desabilitada`);
            return;
          }
          
          if (task.status === 'running') {
            console.log(`⏳ [AutonomousAgent] Tarefa ${task.name} já está em execução`);
            return;
          }

          const shouldRun = checkIfTaskShouldRun(task, currentHour, currentMinute, currentDay);
          
          if (shouldRun) {
            // Verificar se já executou hoje (evitar múltiplas execuções)
            const lastRun = task.lastRun ? new Date(task.lastRun) : null;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Verificar também se já executou na última hora (para tarefas horárias)
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            
            const canRun = !lastRun || 
              (task.schedule.includes('a cada hora') 
                ? lastRun < oneHourAgo 
                : lastRun < today);
            
            if (canRun) {
              console.log(`⏰ [AutonomousAgent] ✅ Tarefa agendada detectada: ${task.name} (${task.schedule})`);
              console.log(`   Última execução: ${lastRun ? lastRun.toLocaleString('pt-BR') : 'Nunca'}`);
              tasksToRun.push(task);
            } else {
              const lastRunStr = lastRun ? lastRun.toLocaleString('pt-BR') : 'Nunca';
              console.log(`⏭️ [AutonomousAgent] Tarefa ${task.name} já executou (${lastRunStr}), pulando...`);
            }
          } else {
            // Log apenas para debug - mostrar quando a tarefa não deve rodar
            const nextRun = task.nextRun ? new Date(task.nextRun) : null;
            if (nextRun) {
              console.log(`⏰ [AutonomousAgent] ${task.name} - Próxima execução: ${nextRun.toLocaleString('pt-BR')}`);
            }
          }
        });

        // Executar tarefas encontradas
        if (tasksToRun.length > 0) {
          console.log(`🚀 [AutonomousAgent] ${tasksToRun.length} tarefa(s) pronta(s) para execução`);
          tasksToRun.forEach(task => {
            console.log(`🚀 [AutonomousAgent] Iniciando execução: ${task.name}`);
            setTimeout(() => runTask(task), 100);
          });
        } else {
          console.log(`✅ [AutonomousAgent] Nenhuma tarefa precisa ser executada no momento`);
        }

        return currentTasks; // Não modificar o estado aqui
      });
    };

    // Verificar a cada minuto
    const interval = setInterval(() => {
      console.log('🔄 [AutonomousAgent] Verificando tarefas agendadas...');
      checkScheduledTasks();
    }, 60000);
    
    // Verificar imediatamente ao ativar (com delay para evitar execução imediata)
    const initialCheck = setTimeout(() => {
      console.log('🔄 [AutonomousAgent] Verificação inicial de tarefas agendadas...');
      checkScheduledTasks();
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialCheck);
      console.log('🛑 [AutonomousAgent] Sistema de agendamento parado');
    };
  }, [agentActive, tasks.length]); // Usar tasks.length para detectar mudanças sem causar loop

  const checkIfTaskShouldRun = (task: AITask, hour: number, minute: number, day: number): boolean => {
    const schedule = task.schedule.toLowerCase();

    // Diariamente às 08:00
    if (schedule.includes('diariamente') && schedule.includes('08:00')) {
      return hour === 8 && minute === 0;
    }

    // Diariamente às 10:00
    if (schedule.includes('diariamente') && schedule.includes('10:00')) {
      return hour === 10 && minute === 0;
    }

    // Diariamente às 03:00
    if (schedule.includes('diariamente') && schedule.includes('03:00')) {
      return hour === 3 && minute === 0;
    }

    // Semanalmente (Segunda)
    if (schedule.includes('semanalmente') && schedule.includes('segunda')) {
      return day === 1 && hour === 8 && minute === 0;
    }

    // Semanalmente (Quarta)
    if (schedule.includes('semanalmente') && schedule.includes('quarta')) {
      return day === 3 && hour === 8 && minute === 0;
    }

    // Semanalmente (Domingo)
    if (schedule.includes('semanalmente') && schedule.includes('domingo')) {
      return day === 0 && hour === 8 && minute === 0;
    }

    // A cada hora
    if (schedule.includes('a cada hora')) {
      return minute === 0; // Executa no início de cada hora
    }

    return false;
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const saveConfig = () => {
    const config = {
      active: agentActive,
      autonomyLevel: autonomyLevel[0],
      tasks: tasks,
      permissions: permissions,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('ai_agent_config', JSON.stringify(config));
    return config;
  };

  useEffect(() => {
    // Salvar automaticamente quando mudanças relevantes ocorrerem
    const config = {
      active: agentActive,
      autonomyLevel: autonomyLevel[0],
      tasks: tasks,
      permissions: permissions,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('ai_agent_config', JSON.stringify(config));
  }, [agentActive, autonomyLevel, tasks, permissions]);

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

    const startTime = Date.now();
    let result: any = null;
    let success = false;
    let errorMessage = '';

    try {
      // Executar tarefa real baseada no tipo
      switch (task.type) {
        case 'analysis':
          result = await autonomousAgentService.runMetricsAnalysis();
          break;
        case 'report':
          result = await autonomousAgentService.generateFinancialReport();
          break;
        case 'notification':
          result = await autonomousAgentService.detectAnomalies();
          break;
        case 'content':
          result = await autonomousAgentService.suggestContent();
          break;
        case 'optimization':
          result = await autonomousAgentService.analyzeSEO();
          break;
        case 'cleanup':
          result = await autonomousAgentService.cleanupCache();
          break;
        case 'backup':
          // Backup ainda não implementado - usar simulação
          await new Promise(r => setTimeout(r, 2000));
          result = { success: true, message: 'Backup simulado (não implementado ainda)' };
          break;
        default:
          throw new Error('Tipo de tarefa não reconhecido');
      }

      success = result.success;
      errorMessage = result.error || '';

      const executionTime = ((Date.now() - startTime) / 1000).toFixed(1);

      setTasks(prev => prev.map(t => 
        t.id === task.id ? { 
          ...t, 
          status: success ? 'completed' as const : 'error' as const,
          lastRun: new Date(),
          result: success ? result.message : errorMessage,
          nextRun: calculateNextRun(task)
        } : t
      ));

      addLog({
        taskId: task.id,
        taskName: task.name,
        action: success ? 'Tarefa concluída' : 'Erro na execução',
        status: success ? 'success' : 'error',
        details: success 
          ? `Executada em ${executionTime}s${result.data ? ` - ${JSON.stringify(result.data).substring(0, 100)}...` : ''}` 
          : errorMessage
      });

      toast({
        title: success ? 'Tarefa concluída!' : 'Erro na tarefa',
        description: result.message || task.name,
        variant: success ? 'default' : 'destructive',
      });

    } catch (error: any) {
      success = false;
      errorMessage = error.message || 'Erro desconhecido';
      
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { 
          ...t, 
          status: 'error' as const,
          lastRun: new Date(),
          result: errorMessage
        } : t
      ));

      addLog({
        taskId: task.id,
        taskName: task.name,
        action: 'Erro na execução',
        status: 'error',
        details: errorMessage
      });

      toast({
        title: 'Erro na tarefa',
        description: errorMessage,
        variant: 'destructive',
      });
    }

    // Reset status after a while
    setTimeout(() => {
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: 'idle' as const } : t
      ));
    }, 10000);
  };

  const calculateNextRun = (task: AITask): Date => {
    const now = new Date();
    const next = new Date(now);
    
    const schedule = task.schedule.toLowerCase();
    
    if (schedule.includes('a cada hora')) {
      next.setHours(next.getHours() + 1, 0, 0, 0);
    } else if (schedule.includes('diariamente')) {
      next.setDate(next.getDate() + 1);
      if (schedule.includes('08:00')) next.setHours(8, 0, 0, 0);
      else if (schedule.includes('10:00')) next.setHours(10, 0, 0, 0);
      else if (schedule.includes('03:00')) next.setHours(3, 0, 0, 0);
    } else if (schedule.includes('semanalmente')) {
      next.setDate(next.getDate() + 7);
      next.setHours(8, 0, 0, 0);
    }
    
    return next;
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

    try {
      // Construir contexto do chat
      const conversationHistory = chatMessages
        .slice(-5) // Últimas 5 mensagens
        .map(msg => `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`)
        .join('\n');

      // Buscar dados do sistema para contexto
      let usersCount = 0;
      let eventsCount = 0;
      
      try {
        const [usersResult, eventsResult] = await Promise.all([
          supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
          supabase.from('events').select('id', { count: 'exact', head: true }).eq('is_visible', true),
        ]);
        usersCount = usersResult.count || 0;
        eventsCount = eventsResult.count || 0;
      } catch (error) {
        console.warn('Erro ao buscar dados para contexto:', error);
      }

      const context = `Você é o Agente IA Autônomo do sistema de turismo do Mato Grosso do Sul.
Você ajuda administradores com análises, relatórios e automação de tarefas.

CONTEXTO DO SISTEMA:
- Total de usuários: ${usersCount}
- Eventos ativos: ${eventsCount}
- Tarefas ativas: ${tasks.filter(t => t.enabled).length}
- Nível de autonomia: ${autonomyLevel[0]}%

HISTÓRICO DA CONVERSA:
${conversationHistory}

PERGUNTA DO USUÁRIO: ${userMessage}

INSTRUÇÕES:
- Seja útil, objetivo e profissional
- Use os dados do sistema quando relevante
- Sugira ações práticas quando apropriado
- Se não souber algo, seja honesto
- Mantenha respostas concisas mas informativas

RESPOSTA:`;

      const aiResponse = await generateContent(context);
      
      if (aiResponse.ok) {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: aiResponse.text 
        }]);
      } else {
        throw new Error(aiResponse.error || 'Erro ao gerar resposta');
      }
    } catch (error: any) {
      console.error('Erro no chat:', error);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.' 
      }]);
    } finally {
      setProcessing(false);
    }
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
                            {task.nextRun && (
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                Próxima: {format(task.nextRun, 'dd/MM HH:mm', { locale: ptBR })}
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
                    <Switch 
                      checked={permissions.modifyDatabase}
                      onCheckedChange={(checked) => 
                        setPermissions(prev => ({ ...prev, modifyDatabase: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">Enviar notificações</span>
                    </div>
                    <Switch 
                      checked={permissions.sendNotifications}
                      onCheckedChange={(checked) => 
                        setPermissions(prev => ({ ...prev, sendNotifications: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">Gerar relatórios</span>
                    </div>
                    <Switch 
                      checked={permissions.generateReports}
                      onCheckedChange={(checked) => 
                        setPermissions(prev => ({ ...prev, generateReports: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">Acessar dados financeiros</span>
                    </div>
                    <Switch 
                      checked={permissions.accessFinancialData}
                      onCheckedChange={(checked) => 
                        setPermissions(prev => ({ ...prev, accessFinancialData: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => {
                  const config = saveConfig();
                  toast({ 
                    title: '✅ Configurações salvas!', 
                    description: `Nível de autonomia: ${config.autonomyLevel}% | Agente: ${config.active ? 'Ativo' : 'Inativo'}`,
                    duration: 3000
                  });
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

