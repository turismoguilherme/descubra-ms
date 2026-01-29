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
import { toast } from 'sonner';
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
    {
      id: '8',
      type: 'notification',
      name: 'Aprovação Automática de Eventos',
      description: 'Aprova automaticamente eventos gratuitos que atendem aos critérios.',
      schedule: 'A cada hora',
      enabled: false, // Desabilitado por padrão - admin pode ativar
      status: 'idle',
      nextRun: (() => {
        const next = new Date(now);
        next.setHours(next.getHours() + 1, 0, 0, 0);
        return next;
      })(),
    },
  ];
};

export default function AutonomousAIAgent() {
  const [agentActive, setAgentActive] = useState(false);
  const [tasks, setTasks] = useState<AITask[]>(getDefaultTasks());
  const [logs, setLogs] = useState<AILog[]>([]);
  const [autonomyLevel, setAutonomyLevel] = useState([50]);
  const [selectedTask, setSelectedTask] = useState<AITask | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Estados para novas abas
  const [lastMetricsAnalysis, setLastMetricsAnalysis] = useState<any>(null);
  const [lastFinancialReport, setLastFinancialReport] = useState<any>(null);
  const [seoImprovements, setSeoImprovements] = useState<any[]>([]);
  const [autoApprovals, setAutoApprovals] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // Estados para as permissões
  const [permissions, setPermissions] = useState({
    modifyDatabase: false,
    sendNotifications: true,
    generateReports: true,
    accessFinancialData: false,
  });

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:useEffect:mount',message:'Componente montado, iniciando carregamento de configurações',data:{hasLocalStorage:typeof localStorage !== 'undefined',navigatorOnline:navigator.onLine},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // Carregar configuração do Supabase (prioridade) ou localStorage (fallback)
    const loadConfig = async () => {
      try {
        // Tentar carregar do Supabase primeiro (última configuração, ativa ou inativa)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:loadConfig',message:'Iniciando query ao Supabase para ai_agent_config',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        const { data: dbConfig, error: dbError } = await supabase
          .from('ai_agent_config')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:loadConfig',message:'Resultado da query ai_agent_config recebido',data:{hasError:!!dbError,errorMessage:dbError?.message,errorCode:dbError?.code,errorDetails:dbError?.details,errorHint:dbError?.hint,hasData:!!dbConfig,dataKeys:dbConfig ? Object.keys(dbConfig) : []},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        if (!dbError && dbConfig) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:useEffect:mount',message:'Configuração encontrada no Supabase, aplicando estado',data:{configActive:dbConfig.active,configAutonomyLevel:dbConfig.autonomy_level,configUpdatedAt:dbConfig.updated_at},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          setAgentActive(dbConfig.active || false);
          setAutonomyLevel([dbConfig.autonomy_level || 50]);
          if (dbConfig.tasks && Array.isArray(dbConfig.tasks)) {
            setTasks(dbConfig.tasks as unknown as AITask[]);
          }
          
          // Carregar permissões
          if (dbConfig.permissions && typeof dbConfig.permissions === 'object' && !Array.isArray(dbConfig.permissions)) {
            const perms = dbConfig.permissions as any;
            setPermissions({
              modifyDatabase: perms.modifyDatabase ?? false,
              sendNotifications: perms.sendNotifications ?? true,
              generateReports: perms.generateReports ?? true,
              accessFinancialData: perms.accessFinancialData ?? false,
            });
          } else {
            const initialAutonomy = dbConfig.autonomy_level || 50;
            setPermissions({
              modifyDatabase: initialAutonomy > 50,
              sendNotifications: true,
              generateReports: true,
              accessFinancialData: initialAutonomy > 70,
            });
          }
          return; // Configuração carregada do banco
        }

        // Fallback: tentar localStorage
        const saved = localStorage.getItem('ai_agent_config');
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:useEffect:mount',message:'Verificando localStorage para configurações (fallback)',data:{hasSavedConfig:!!saved,savedConfigLength:saved?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        if (saved) {
          try {
            const config = JSON.parse(saved);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:useEffect:mount',message:'Configuração encontrada no localStorage, aplicando estado',data:{configActive:config.active,configAutonomyLevel:config.autonomyLevel,configSavedAt:config.savedAt},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
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
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:useEffect:mount',message:'Erro ao parsear configuração do localStorage',data:{error:error?.message,errorString:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
          }
        } else {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:useEffect:mount',message:'Nenhuma configuração encontrada, usando valores padrão',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          // Valores padrão baseados no nível de autonomia inicial (50)
          setPermissions({
            modifyDatabase: false,
            sendNotifications: true,
            generateReports: true,
            accessFinancialData: false,
          });
        }
      } catch (error) {
        console.error('Erro ao carregar configuração:', error);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:useEffect:mount',message:'Erro ao carregar configuração do Supabase',data:{error:error?.message,errorString:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
      }
    };

    loadConfig();

    // Add welcome message
    setChatMessages([
      {
        role: 'assistant',
        content: 'Olá! Sou seu Agente de IA Autônomo. Posso ajudar com análises, relatórios, e executar tarefas automáticas. O que você gostaria de fazer hoje?'
      }
    ]);

    // Carregar dados das novas abas
    loadAnalysesData();
    loadSEOImprovements();
    loadAutoApprovals();
  }, []);

  // Carregar análises salvas
  const loadAnalysesData = async () => {
    try {
      setLoadingData(true);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:loadAnalysesData',message:'Iniciando carregamento de análises',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      const [metricsResult, financialResult] = await Promise.all([
        supabase
          .from('ai_analyses')
          .select('*')
          .eq('type', 'metrics')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('ai_analyses')
          .select('*')
          .eq('type', 'financial')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:loadAnalysesData',message:'Resultados das queries recebidos',data:{metricsError:metricsResult.error?.message,financialError:financialResult.error?.message,hasMetricsData:!!metricsResult.data,hasFinancialData:!!financialResult.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion

      if (metricsResult.error) {
        console.error('Erro ao carregar análise de métricas:', metricsResult.error);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:loadAnalysesData',message:'Erro ao carregar análise de métricas',data:{error:metricsResult.error.message,code:metricsResult.error.code,details:metricsResult.error.details,hint:metricsResult.error.hint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
      } else if (metricsResult.data) {
        setLastMetricsAnalysis(metricsResult.data);
      }
      
      if (financialResult.error) {
        console.error('Erro ao carregar relatório financeiro:', financialResult.error);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:loadAnalysesData',message:'Erro ao carregar relatório financeiro',data:{error:financialResult.error.message,code:financialResult.error.code,details:financialResult.error.details,hint:financialResult.error.hint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
      } else if (financialResult.data) {
        setLastFinancialReport(financialResult.data);
      }
    } catch (error: unknown) {
      console.warn('Erro ao carregar análises:', error);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:loadAnalysesData',message:'Exceção ao carregar análises',data:{error:error?.message,errorString:String(error),stack:error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
    } finally {
      setLoadingData(false);
    }
  };

  // Carregar melhorias de SEO
  const loadSEOImprovements = async () => {
    try {
      const { data } = await supabase
        .from('ai_seo_improvements')
        .select('*')
        .eq('status', 'pending')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) setSeoImprovements(data);
    } catch (error) {
      console.warn('Erro ao carregar melhorias de SEO:', error);
    }
  };

  // Carregar aprovações automáticas
  const loadAutoApprovals = async () => {
    try {
      const { data } = await supabase
        .from('ai_auto_approvals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) setAutoApprovals(data);
    } catch (error) {
      console.warn('Erro ao carregar aprovações:', error);
    }
  };

  // Sistema de agendamento automático
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:useEffect:scheduling',message:'Sistema de agendamento verificado',data:{agentActive,navigatorOnline:navigator.onLine,pageVisible:!document.hidden},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    if (!agentActive) {
      console.log('🤖 [AutonomousAgent] Agente desativado - tarefas automáticas pausadas');
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:useEffect:scheduling',message:'Agente desativado, sistema de agendamento não iniciado',data:{agentActive},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      return;
    }

    console.log('🤖 [AutonomousAgent] Agente ativado - iniciando verificação de tarefas agendadas');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:useEffect:scheduling',message:'Agente ativado, iniciando sistema de agendamento',data:{agentActive,navigatorOnline:navigator.onLine,pageVisible:!document.hidden},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    // #endregion

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

    // A cada hora (inclui aprovação automática e alertas)
    if (schedule.includes('a cada hora')) {
      return minute === 0; // Executa no início de cada hora
    }

    return false;
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const saveConfig = async () => {
    console.log('🔵 [DEBUG] saveConfig chamado', { agentActive, autonomyLevel: autonomyLevel[0], permissions });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:saveConfig',message:'Iniciando salvamento de configurações',data:{agentActive,autonomyLevel:autonomyLevel[0],permissions},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      const config = {
        active: agentActive,
        autonomyLevel: autonomyLevel[0],
        tasks: tasks,
        permissions: permissions,
        savedAt: new Date().toISOString()
      };
      console.log('🔵 [DEBUG] Configuração preparada:', config);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:saveConfig',message:'Configuração preparada, salvando no Supabase e localStorage',data:{config},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Salvar no Supabase (prioridade para execução 24/7)
      // Buscar última configuração (ativa ou inativa)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:saveConfig',message:'Buscando configuração existente no Supabase',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const { data: existingConfig, error: queryError } = await supabase
        .from('ai_agent_config')
        .select('id')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:saveConfig',message:'Resultado da busca de configuração existente',data:{hasError:!!queryError,errorMessage:queryError?.message,errorCode:queryError?.code,errorDetails:queryError?.details,errorHint:queryError?.hint,hasExistingConfig:!!existingConfig,existingConfigId:existingConfig?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      const configData = {
        active: agentActive,
        autonomy_level: autonomyLevel[0],
        tasks: tasks,
        permissions: permissions,
        updated_at: new Date().toISOString()
      };

      if (queryError && queryError.code !== 'PGRST116') { // PGRST116 = no rows returned (normal)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:saveConfig',message:'Erro ao buscar configuração existente, tentando criar nova',data:{error:queryError.message,code:queryError.code,details:queryError.details,hint:queryError.hint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
      }

      if (existingConfig) {
        // Atualizar configuração existente
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:saveConfig',message:'Atualizando configuração existente',data:{configId:existingConfig.id,configData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        const { error: updateError } = await supabase
          .from('ai_agent_config')
          .update(configData as any)
          .eq('id', existingConfig.id);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:saveConfig',message:'Resultado da atualização',data:{hasError:!!updateError,errorMessage:updateError?.message,errorCode:updateError?.code,errorDetails:updateError?.details,errorHint:updateError?.hint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        if (updateError) throw updateError;
        console.log('🔵 [DEBUG] Configuração atualizada no Supabase');
      } else {
        // Criar nova configuração
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:saveConfig',message:'Criando nova configuração',data:{configData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        const { error: insertError } = await supabase
          .from('ai_agent_config')
          .insert([configData] as any);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:saveConfig',message:'Resultado da inserção',data:{hasError:!!insertError,errorMessage:insertError?.message,errorCode:insertError?.code,errorDetails:insertError?.details,errorHint:insertError?.hint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        if (insertError) throw insertError;
        console.log('🔵 [DEBUG] Configuração criada no Supabase');
      }

      // Também salvar no localStorage como backup
      localStorage.setItem('ai_agent_config', JSON.stringify(config));
      console.log('🔵 [DEBUG] Configuração salva no localStorage (backup)');
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:saveConfig',message:'Configuração salva com sucesso no Supabase e localStorage',data:{saved:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return config;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('🔴 [DEBUG] Erro em saveConfig:', err);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:saveConfig',message:'Erro ao salvar configuração',data:{error:error?.message,errorString:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      throw error;
    }
  };

  useEffect(() => {
    // Salvar automaticamente quando mudanças relevantes ocorrerem (debounced)
    const timeoutId = setTimeout(async () => {
      try {
        const config = {
          active: agentActive,
          autonomyLevel: autonomyLevel[0],
          tasks: tasks,
          permissions: permissions,
          savedAt: new Date().toISOString()
        };
        
        // Salvar no Supabase (async, não bloqueia)
        // Buscar última configuração (ativa ou inativa)
        const { data: existingConfig } = await supabase
          .from('ai_agent_config')
          .select('id')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const configData = {
          active: agentActive,
          autonomy_level: autonomyLevel[0],
          tasks: tasks,
          permissions: permissions,
          updated_at: new Date().toISOString()
        };

        if (existingConfig) {
          await supabase
            .from('ai_agent_config')
            .update(configData as any)
            .eq('id', existingConfig.id);
        } else {
          await supabase
            .from('ai_agent_config')
            .insert([configData] as any);
        }

        // Também salvar no localStorage como backup
        localStorage.setItem('ai_agent_config', JSON.stringify(config));
      } catch (error) {
        console.warn('Erro ao salvar configuração automaticamente:', error);
        // Fallback: salvar apenas no localStorage
        const config = {
          active: agentActive,
          autonomyLevel: autonomyLevel[0],
          tasks: tasks,
          permissions: permissions,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem('ai_agent_config', JSON.stringify(config));
      }
    }, 2000); // Debounce de 2 segundos

    return () => clearTimeout(timeoutId);
  }, [agentActive, autonomyLevel, tasks, permissions]);

  const toggleAgent = () => {
    setAgentActive(!agentActive);
                    toast.success(!agentActive ? 'Agente IA Ativado!' : 'Agente IA Desativado', {
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
    let result: unknown = null;
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

      if (success) {
        toast.success('Tarefa concluída!', {
          description: result.message || task.name,
        });
      } else {
        toast.error('Erro na tarefa', {
          description: result.message || task.name,
        });
      }

      // Recarregar dados após execução
      if (task.type === 'analysis' || task.type === 'report') {
        loadAnalysesData();
      }
      if (task.type === 'optimization') {
        loadSEOImprovements();
      }
      if (task.name === 'Aprovação Automática de Eventos') {
        loadAutoApprovals();
      }

    } catch (error: unknown) {
      success = false;
      errorMessage = err.message || 'Erro desconhecido';
      
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

      toast.error('Erro na tarefa', {
        description: errorMessage,
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
    } else {
      // Fallback: próxima hora
      next.setHours(next.getHours() + 1, 0, 0, 0);
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro no chat:', err);
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
          <TabsTrigger value="analyses">📊 Análises</TabsTrigger>
          <TabsTrigger value="chat">Chat com IA</TabsTrigger>
          <TabsTrigger value="logs">Histórico de Execuções</TabsTrigger>
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

        {/* Análises */}
        <TabsContent value="analyses">
          <div className="space-y-4">
            {/* Análise de Métricas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                  Análise de Métricas Unificada
                </CardTitle>
                <CardDescription>
                  Métricas combinadas das plataformas ViajARTur e Descubra MS
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
                    <p className="text-sm text-slate-500 mt-2">Carregando análise...</p>
                  </div>
                ) : lastMetricsAnalysis ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {lastMetricsAnalysis.analysis_data?.unified?.totalUsers || 0}
                        </div>
                        <div className="text-sm text-slate-600">Total de Usuários</div>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">
                          {lastMetricsAnalysis.analysis_data?.unified?.newUsersLast30Days || 0}
                        </div>
                        <div className="text-sm text-slate-600">Novos (30 dias)</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {lastMetricsAnalysis.analysis_data?.unified?.totalEvents || 0}
                        </div>
                        <div className="text-sm text-slate-600">Eventos Ativos</div>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">
                          R$ {((lastMetricsAnalysis.analysis_data?.viajar?.revenue || 0) / 1000).toFixed(1)}k
                        </div>
                        <div className="text-sm text-slate-600">Receita (30 dias)</div>
                      </div>
                    </div>
                    {lastMetricsAnalysis.insights && (
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="font-semibold text-slate-800 mb-2">Insights da IA</h4>
                        <p className="text-sm text-slate-700 whitespace-pre-line">
                          {lastMetricsAnalysis.insights}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          Gerado em {format(new Date(lastMetricsAnalysis.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>Nenhuma análise disponível</p>
                    <p className="text-sm mt-1">Execute a tarefa "Análise de Métricas" para gerar</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Relatório Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Relatório Financeiro
                </CardTitle>
                <CardDescription>
                  Relatório financeiro mensal gerado automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lastFinancialReport ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-emerald-50 rounded-lg">
                        <div className="text-xl font-bold text-emerald-600">
                          R$ {((lastFinancialReport.analysis_data?.revenue || 0) / 1000).toFixed(1)}k
                        </div>
                        <div className="text-sm text-slate-600">Receitas</div>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <div className="text-xl font-bold text-red-600">
                          R$ {((lastFinancialReport.analysis_data?.expenses || 0) / 1000).toFixed(1)}k
                        </div>
                        <div className="text-sm text-slate-600">Despesas</div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                          R$ {((lastFinancialReport.analysis_data?.profit || 0) / 1000).toFixed(1)}k
                        </div>
                        <div className="text-sm text-slate-600">Lucro</div>
                      </div>
                    </div>
                    {lastFinancialReport.insights && (
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="font-semibold text-slate-800 mb-2">Relatório Completo</h4>
                        <p className="text-sm text-slate-700 whitespace-pre-line">
                          {lastFinancialReport.insights}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          Período: {lastFinancialReport.analysis_data?.period?.start} a {lastFinancialReport.analysis_data?.period?.end}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>Nenhum relatório disponível</p>
                    <p className="text-sm mt-1">Execute a tarefa "Relatório Financeiro" para gerar</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SEO - Dentro de Análises */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Melhorias de SEO Sugeridas
                </CardTitle>
                <CardDescription>
                  Melhorias sugeridas pela IA para eventos e destinos existentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
                  </div>
                ) : seoImprovements.length > 0 ? (
                  <div className="space-y-4">
                    {seoImprovements.map((improvement) => (
                      <div key={improvement.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={improvement.priority === 'high' ? 'destructive' : improvement.priority === 'medium' ? 'default' : 'secondary'}>
                                {improvement.priority === 'high' ? 'Alta' : improvement.priority === 'medium' ? 'Média' : 'Baixa'}
                              </Badge>
                              <span className="text-sm text-slate-500">
                                {improvement.content_type === 'event' ? 'Evento' : 'Destino'} ID: {improvement.content_id}
                              </span>
                            </div>
                            {improvement.seo_analysis && (
                              <p className="text-sm text-slate-700 mb-2">{improvement.seo_analysis}</p>
                            )}
                            {improvement.improvements && typeof improvement.improvements === 'object' && (
                              <div className="text-xs text-slate-600 space-y-1">
                                {Object.entries(improvement.improvements).map(([key, value]) => (
                                  <div key={key}>
                                    <strong>{key}:</strong> {String(value)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              // TODO: Implementar aplicação de melhorias
                              toast.info('Em desenvolvimento', {
                                description: 'Funcionalidade de aplicar melhorias será implementada em breve',
                              });
                            }}
                          >
                            Aplicar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>Nenhuma melhoria de SEO pendente</p>
                    <p className="text-sm mt-1">Execute a tarefa "Otimização de SEO" para gerar sugestões</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Aprovações - Dentro de Análises */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  Aprovações Automáticas
                </CardTitle>
                <CardDescription>
                  Eventos aprovados automaticamente pela IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
                  </div>
                ) : autoApprovals.length > 0 ? (
                  <div className="space-y-3">
                    {autoApprovals.map((approval) => (
                      <div key={approval.id} className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                              <span className="font-medium text-slate-800">
                                Evento ID: {approval.event_id}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 mb-1">
                              {approval.approval_reason}
                            </p>
                            {approval.event_data && (
                              <p className="text-xs text-slate-500">
                                {approval.event_data.name || approval.event_data.title}
                              </p>
                            )}
                            <p className="text-xs text-slate-400 mt-2">
                              {format(new Date(approval.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>Nenhuma aprovação automática registrada</p>
                    <p className="text-sm mt-1">Ative a tarefa "Aprovação Automática de Eventos" para começar</p>
                  </div>
                )}
              </CardContent>
            </Card>
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
                type="button"
                onClick={async (e) => {
                  console.log('🔵 [DEBUG] Botão Salvar Configurações clicado!', { event: e, type: e.type });
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:onClick',message:'Botão Salvar Configurações clicado',data:{eventType:e.type,currentTarget:e.currentTarget?.tagName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                  // #endregion
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔵 [DEBUG] Prevenindo comportamento padrão, iniciando saveConfig...');
                  try {
                    const config = await saveConfig();
                    console.log('🔵 [DEBUG] Configuração salva:', config);
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:onClick',message:'Chamando toast para exibir sucesso',data:{config},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                    console.log('🔵 [DEBUG] Chamando toast...');
                    toast.success('✅ Configurações salvas!', {
                      description: `Nível de autonomia: ${config.autonomyLevel}% | Agente: ${config.active ? 'Ativo' : 'Inativo'}`,
                      duration: 3000
                    });
                    console.log('🔵 [DEBUG] Toast chamado com sucesso!', { toastFunction: typeof toast });
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:onClick',message:'Toast chamado com sucesso',data:{toastCalled:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                  } catch (error: unknown) {
                    const err = error instanceof Error ? error : new Error(String(error));
                    console.error('🔴 [DEBUG] Erro ao salvar configurações:', err);
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AutonomousAIAgent.tsx:onClick',message:'Erro ao salvar configurações',data:{error:error?.message,errorString:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                    toast.error('❌ Erro ao salvar', {
                      description: error?.message || 'Não foi possível salvar as configurações',
                      duration: 5000
                    });
                  }
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

