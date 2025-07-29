import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { workflow_id, initial_params, requester_user_id } = await req.json();

    if (!workflow_id) {
      return new Response(JSON.stringify({ error: 'O ID do workflow é obrigatório.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Buscar a definição do workflow
    const { data: workflow, error: workflowError } = await supabaseAdmin
      .from('workflow_definitions')
      .select('*')
      .eq('id', workflow_id)
      .single();

    if (workflowError) {
      console.error('Erro ao buscar definição do workflow:', workflowError);
      return new Response(JSON.stringify({ error: 'Workflow não encontrado ou erro de acesso.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    if (!workflow.is_active) {
      return new Response(JSON.stringify({ error: 'O workflow não está ativo.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // 2. Iniciar a primeira tarefa ou orquestrar conforme a definição
    // Por enquanto, vamos simular o registro de uma tarefa automatizada.
    // A lógica real de orquestração seria mais complexa, iterando sobre workflow.definition.

    const { error: taskInsertError } = await supabaseAdmin.from('automated_tasks').insert({
      task_name: `Execução de Workflow: ${workflow.workflow_name}`,
      description: `Iniciado workflow ${workflow.workflow_name}.`,
      status: 'in_progress',
      scheduled_at: new Date().toISOString(),
      executed_by_ai: true,
      requester_user_id: requester_user_id || null,
      related_workflow_id: workflow.id,
      task_parameters: initial_params || {},
      task_results: { status: 'Workflow iniciado', timestamp: new Date().toISOString() },
    });

    if (taskInsertError) {
      console.error('Erro ao registrar tarefa automatizada:', taskInsertError);
      return new Response(JSON.stringify({ error: 'Falha ao registrar tarefa de workflow.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: `Workflow '${workflow.workflow_name}' iniciado com sucesso.`, workflow_id: workflow.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Erro na Edge Function workflow-orchestrator:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 