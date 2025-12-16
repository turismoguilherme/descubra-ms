# 🤖 Configuração: IA Autônoma 24/7

## 📋 Pré-requisitos

1. ✅ Tabelas criadas (`ai_analyses`, `ai_seo_improvements`, `ai_auto_approvals`)
2. ✅ Edge Function criada (`autonomous-agent-scheduler`)
3. ⚠️ **Configurar secrets no Supabase Vault** (passo manual)
4. ⚠️ **Habilitar extensões pg_cron e pg_net** (se ainda não estiverem)

---

## 🔧 Passo 1: Habilitar Extensões

No Supabase Dashboard:
1. Vá em **Database** → **Extensions**
2. Procure e habilite:
   - ✅ `pg_cron`
   - ✅ `pg_net`

---

## 🔐 Passo 2: Configurar Secrets no Vault

No Supabase Dashboard:
1. Vá em **Database** → **Vault**
2. Clique em **Create Secret**

### Secret 1: URL do Projeto
- **Name:** `autonomous_agent_project_url`
- **Secret:** `https://YOUR_PROJECT_REF.supabase.co`
  - Substitua `YOUR_PROJECT_REF` pelo ID do seu projeto
  - Exemplo: `https://hvtrpkbjgbuypkskqcqm.supabase.co`

### Secret 2: Anon Key
- **Name:** `autonomous_agent_anon_key`
- **Secret:** Sua `anon` key (encontre em **Settings** → **API** → **Project API keys** → **anon public**)

---

## 🚀 Passo 3: Executar Migration

Execute a migration no Supabase SQL Editor:

```sql
-- Arquivo: supabase/migrations/20250215000002_setup_autonomous_agent_cron.sql
```

Ou execute manualmente:

```sql
-- 1. Habilitar extensões (se ainda não estiverem)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Criar cron job (substitua os valores pelos seus secrets)
SELECT cron.schedule(
  'autonomous-agent-scheduler',
  '* * * * *', -- A cada minuto
  $$
  SELECT
    net.http_post(
      url := (
        SELECT decrypted_secret 
        FROM vault.decrypted_secrets 
        WHERE name = 'autonomous_agent_project_url'
      ) || '/functions/v1/autonomous-agent-scheduler',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (
          SELECT decrypted_secret 
          FROM vault.decrypted_secrets 
          WHERE name = 'autonomous_agent_anon_key'
        )
      ),
      body := jsonb_build_object(
        'timestamp', now(),
        'source', 'pg_cron'
      )
    ) as request_id;
  $$
);
```

---

## ✅ Passo 4: Verificar Funcionamento

### Verificar se o cron job foi criado:
```sql
SELECT * FROM cron.job WHERE jobname = 'autonomous-agent-scheduler';
```

### Ver histórico de execuções:
```sql
SELECT 
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details 
WHERE jobid = (
  SELECT jobid FROM cron.job WHERE jobname = 'autonomous-agent-scheduler'
) 
ORDER BY start_time DESC 
LIMIT 10;
```

### Ver logs da Edge Function:
- Vá em **Edge Functions** → **autonomous-agent-scheduler** → **Logs**

---

## 🎯 Como Funciona

1. **pg_cron** executa a cada minuto
2. Chama a **Edge Function** `autonomous-agent-scheduler`
3. A função verifica quais tarefas devem ser executadas:
   - Análise de Métricas (08:00 diariamente)
   - Relatório Financeiro (Segunda 08:00)
   - Alertas de Anomalias (a cada hora)
   - Limpeza de Cache (Domingo 08:00)
   - Aprovação Automática (a cada hora, se habilitada)
4. Executa as tarefas e salva resultados no banco
5. Resultados aparecem automaticamente nas abas do componente

---

## 🛠️ Gerenciamento

### Desabilitar temporariamente:
```sql
SELECT cron.unschedule('autonomous-agent-scheduler');
```

### Reabilitar:
```sql
-- Execute novamente o SELECT cron.schedule do Passo 3
```

### Alterar frequência:
- `'* * * * *'` = A cada minuto
- `'0 * * * *'` = A cada hora
- `'0 8 * * *'` = Diariamente às 08:00
- `'0 8 * * 1'` = Toda segunda às 08:00

---

## 📊 Monitoramento

### Ver últimas execuções:
```sql
SELECT 
  start_time,
  status,
  return_message,
  end_time - start_time as duration
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'autonomous-agent-scheduler')
ORDER BY start_time DESC 
LIMIT 20;
```

### Ver análises geradas:
```sql
SELECT 
  type,
  created_at,
  insights
FROM ai_analyses
ORDER BY created_at DESC
LIMIT 10;
```

### Ver aprovações automáticas:
```sql
SELECT 
  event_id,
  approval_reason,
  created_at
FROM ai_auto_approvals
ORDER BY created_at DESC
LIMIT 20;
```

---

## ⚠️ Observações Importantes

1. **Custo**: pg_cron executa a cada minuto, mas a função só executa tarefas quando necessário (horários específicos)
2. **Rate Limits**: A função verifica horários, então não executa tarefas desnecessariamente
3. **Segurança**: Usa Service Role Key apenas na Edge Function (não exposta)
4. **Logs**: Todas as execuções são registradas em `cron.job_run_details`

---

## 🐛 Troubleshooting

### Cron job não executa:
1. Verifique se as extensões estão habilitadas
2. Verifique se os secrets estão configurados corretamente
3. Verifique os logs da Edge Function

### Tarefas não executam:
1. Verifique se o horário está correto (a função verifica hora/minuto/dia)
2. Verifique se a tarefa está habilitada (no código da função)
3. Verifique os logs da Edge Function

### Erro de autenticação:
1. Verifique se o `anon_key` está correto no Vault
2. Verifique se a URL do projeto está correta


