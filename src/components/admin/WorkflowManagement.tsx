import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  List, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  FileText,
  Workflow
} from 'lucide-react';

interface WorkflowDefinition {
  id: string;
  workflow_name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface AutomatedTask {
  id: string;
  task_name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  scheduled_at: string | null;
  executed_at: string | null;
  completed_at: string | null;
  failed_reason: string | null;
  executed_by_ai: boolean;
  related_workflow_id: string | null;
  created_at: string;
}

const WorkflowManagement = () => {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [tasks, setTasks] = useState<AutomatedTask[]>([]);
  const [loadingWorkflows, setLoadingWorkflows] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkflows();
    fetchTasks();
  }, []);

  const fetchWorkflows = async () => {
    setLoadingWorkflows(true);
    // Simplified workflow fetch - just return empty array for now since automated_tasks doesn't exist
    const data: any[] = [];
    const error = null;
    
    if (error) {
      console.error('Erro ao buscar definições de workflows:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar definições de workflows.",
        variant: "destructive",
      });
    } else {
      setWorkflows(data || []);
    }
    setLoadingWorkflows(false);
  };

  const fetchTasks = async () => {
    setLoadingTasks(true);
    // Simplified - return empty tasks since automated_tasks doesn't exist
    const data: any[] = [];
    const error = null;
    
    if (error) {
      console.error('Erro ao buscar tarefas automatizadas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar tarefas automatizadas.",
        variant: "destructive",
      });
    } else {
      setTasks(data || []);
    }
    setLoadingTasks(false);
  };

  const handleRunWorkflow = async (workflowId: string, workflowName: string) => {
    toast({
      title: "Iniciando Workflow",
      description: `Iniciando o workflow '${workflowName}'...`,
      duration: 3000
    });
    try {
      // Chamar a Edge Function workflow-orchestrator
      const response = await fetch(`https://hvtrpkbjgbuypkskqcqm.supabase.co/functions/v1/workflow-orchestrator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow_id: workflowId,
          initial_params: { triggeredBy: 'Manual via Dashboard' },
          requester_user_id: '00000000-0000-0000-0000-000000000001', // ID do usuário Master
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro desconhecido ao iniciar workflow.');
      }

      const data = await response.json();
      toast({
        title: "Workflow Iniciado",
        description: data.message,
        variant: "default",
      });
      fetchTasks(); // Atualiza a lista de tarefas para mostrar a nova
    } catch (error: any) {
      console.error('Erro ao iniciar workflow:', error);
      toast({
        title: "Erro ao Iniciar Workflow",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'outline';
      case 'failed': return 'destructive';
      case 'cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />;
      case 'in_progress': return <Loader2 className="w-4 h-4 mr-1 animate-spin text-blue-500" />;
      case 'failed': return <XCircle className="w-4 h-4 mr-1 text-red-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 mr-1 text-gray-500" />;
      default: return <Clock className="w-4 h-4 mr-1 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Workflow className="w-5 h-5 mr-2" /> Definições de Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingWorkflows ? (
            <p>Carregando definições de workflows...</p>
          ) : workflows.length === 0 ? (
            <p>Nenhum workflow definido ainda.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex justify-between items-center">
                      {workflow.workflow_name}
                      <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                        {workflow.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-gray-600">{workflow.description || 'Sem descrição.'}</p>
                    <p className="text-xs text-gray-500">Criado em: {new Date(workflow.created_at).toLocaleDateString()}</p>
                    <Button 
                      size="sm" 
                      onClick={() => handleRunWorkflow(workflow.id, workflow.workflow_name)}
                      disabled={!workflow.is_active}
                    >
                      <Play className="w-4 h-4 mr-1" /> Iniciar Workflow
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><List className="w-5 h-5 mr-2" /> Tarefas Automatizadas</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTasks ? (
            <p>Carregando tarefas automatizadas...</p>
          ) : tasks.length === 0 ? (
            <p>Nenhuma tarefa automatizada encontrada.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <Card key={task.id} className="shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold flex items-center">
                        {getStatusIcon(task.status)} {task.task_name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{task.description || 'Sem descrição.'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Status: <Badge variant={getStatusBadgeVariant(task.status)}>{task.status}</Badge>
                        {task.scheduled_at && ` | Agendado: ${new Date(task.scheduled_at).toLocaleString()}`}
                        {task.executed_at && ` | Executado: ${new Date(task.executed_at).toLocaleString()}`}
                        {task.completed_at && ` | Concluído: ${new Date(task.completed_at).toLocaleString()}`}
                      </p>
                      {task.failed_reason && (
                        <p className="text-xs text-red-500 mt-1">Falha: {task.failed_reason}</p>
                      )}
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm text-gray-700">
                        Por: {task.executed_by_ai ? 'IA' : 'Manual'}
                      </p>
                      {task.related_workflow_id && (
                        <p className="text-xs text-gray-500">Workflow ID: {task.related_workflow_id.substring(0, 8)}...</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowManagement; 