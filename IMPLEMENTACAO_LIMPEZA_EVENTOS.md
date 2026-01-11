# ✅ Implementação: Limpeza Automática de Eventos

## 📋 Resumo da Implementação

Implementei a solução completa para limpeza automática de eventos conforme aprovado:

1. ✅ Removido mensagem "Eventos Mock" de `EventSystemStatus.tsx`
2. ✅ Criada função PostgreSQL para limpar eventos expirados (90 dias)
3. ✅ Criada função PostgreSQL para limpar eventos rejeitados (30 dias)
4. ✅ Criada função unificada com logging para auditoria
5. ✅ Configurado cron job para executar diariamente às 2h da manhã
6. ✅ Criada tabela de logs para auditoria

---

## 📁 Arquivos Modificados/Criados

### **1. EventSystemStatus.tsx**
- ✅ Removida mensagem "Eventos Mock"
- ✅ Substituída por "Sistema de Eventos ativo"

### **2. supabase/migrations/20250202000000_auto_cleanup_events.sql**
- ✅ Função `cleanup_expired_events()` - Remove eventos expirados (90 dias)
- ✅ Função `cleanup_rejected_events()` - Remove eventos rejeitados (30 dias)
- ✅ Função `cleanup_all_events_with_logging()` - Função unificada com logging
- ✅ Função `check_events_to_cleanup()` - Verifica quantos eventos seriam deletados (sem deletar)
- ✅ Tabela `event_cleanup_logs` - Logs de auditoria
- ✅ Cron job `cleanup-events-daily` - Executa diariamente às 2h

---

## 🔧 Funções Criadas

### **1. cleanup_expired_events()**
- **Função:** Remove eventos expirados
- **Critério:** `end_date` passou há mais de 90 dias (ou `start_date` se `end_date` for NULL)
- **Exclui:** Eventos rejeitados (são limpos separadamente)
- **Retorna:** Quantidade deletada e array de IDs deletados

### **2. cleanup_rejected_events()**
- **Função:** Remove eventos rejeitados
- **Critério:** `approval_status = 'rejected'` e `updated_at` < há 30 dias
- **Retorna:** Quantidade deletada e array de IDs deletados

### **3. cleanup_all_events_with_logging()**
- **Função:** Executa ambas as limpezas e registra log
- **Comportamento:** 
  - Executa `cleanup_expired_events()`
  - Executa `cleanup_rejected_events()`
  - Registra log na tabela `event_cleanup_logs`
  - Retorna JSON com resultados

### **4. check_events_to_cleanup()**
- **Função:** Verifica quantos eventos seriam deletados (sem deletar)
- **Uso:** Para diagnóstico e verificação antes da limpeza
- **Retorna:** JSON com contagens

---

## ⏰ Cron Job Configurado

- **Nome:** `cleanup-events-daily`
- **Agendamento:** Todos os dias às 2h da manhã (`0 2 * * *`)
- **Função executada:** `cleanup_all_events_with_logging()`

---

## 📊 Tabela de Logs

**Tabela:** `event_cleanup_logs`

**Colunas:**
- `id` (UUID) - ID único do log
- `execution_date` (TIMESTAMPTZ) - Data/hora da execução
- `expired_events_deleted` (INTEGER) - Quantidade de eventos expirados deletados
- `rejected_events_deleted` (INTEGER) - Quantidade de eventos rejeitados deletados
- `total_deleted` (INTEGER) - Total deletado
- `deleted_event_ids` (UUID[]) - Array com IDs dos eventos deletados
- `result` (JSONB) - Resultado completo em JSON
- `created_at` (TIMESTAMPTZ) - Data de criação do log

---

## 🚀 Como Usar

### **1. Executar Limpeza Manualmente:**

```sql
-- Executar limpeza completa (com logging)
SELECT public.cleanup_all_events_with_logging();

-- Executar apenas eventos expirados
SELECT * FROM public.cleanup_expired_events();

-- Executar apenas eventos rejeitados
SELECT * FROM public.cleanup_rejected_events();
```

### **2. Verificar Quantos Eventos Seriam Deletados:**

```sql
-- Verificar sem deletar
SELECT public.check_events_to_cleanup();
```

### **3. Ver Logs de Limpeza:**

```sql
-- Ver últimos 10 logs
SELECT * 
FROM public.event_cleanup_logs 
ORDER BY execution_date DESC 
LIMIT 10;

-- Ver estatísticas de limpeza
SELECT 
  DATE(execution_date) as data,
  SUM(expired_events_deleted) as eventos_expirados,
  SUM(rejected_events_deleted) as eventos_rejeitados,
  SUM(total_deleted) as total
FROM public.event_cleanup_logs
GROUP BY DATE(execution_date)
ORDER BY data DESC;
```

### **4. Gerenciar Cron Job:**

```sql
-- Ver cron jobs ativos
SELECT * FROM cron.job WHERE jobname = 'cleanup-events-daily';

-- Ver histórico de execuções
SELECT * 
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-events-daily')
ORDER BY start_time DESC 
LIMIT 10;

-- Desabilitar temporariamente
SELECT cron.unschedule('cleanup-events-daily');

-- Reabilitar
SELECT cron.schedule(
  'cleanup-events-daily',
  '0 2 * * *',
  $$SELECT public.cleanup_all_events_with_logging();$$
);
```

---

## ⚙️ Configuração

### **Prazos Configurados:**

| Tipo de Evento | Prazo | Critério |
|----------------|-------|----------|
| **Expirados** | 90 dias | Após `end_date` (ou `start_date` se `end_date` for NULL) |
| **Rejeitados** | 30 dias | Após `updated_at` quando `approval_status = 'rejected'` |

### **Horário de Execução:**

- **Diariamente às 2h da manhã** (horário do servidor)
- Pode ser alterado modificando o cron schedule: `'0 2 * * *'`
  - Formato: `minuto hora dia mês dia-da-semana`
  - Exemplo: `'0 3 * * *'` = 3h da manhã
  - Exemplo: `'0 */6 * * *'` = A cada 6 horas

---

## 🔒 Segurança

- ✅ Funções criadas com `SECURITY DEFINER` para executar com privilégios do criador
- ✅ RLS habilitado na tabela de logs
- ✅ Política de leitura apenas para usuários autenticados
- ✅ Logs preservados para auditoria

---

## ✅ Próximos Passos

1. **Aplicar Migration:**
   - Execute a migration `20250202000000_auto_cleanup_events.sql` no Supabase
   - Vá em **Supabase Dashboard** → **SQL Editor** → Cole o conteúdo da migration → Execute

2. **Verificar Cron Job:**
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'cleanup-events-daily';
   ```

3. **Testar Manualmente:**
   ```sql
   -- Verificar quantos eventos seriam deletados
   SELECT public.check_events_to_cleanup();
   
   -- Executar limpeza manualmente (teste)
   SELECT public.cleanup_all_events_with_logging();
   ```

4. **Verificar Logs:**
   ```sql
   SELECT * FROM public.event_cleanup_logs ORDER BY execution_date DESC LIMIT 5;
   ```

---

## 📝 Notas Importantes

1. ⚠️ **Backup:** A limpeza deleta eventos permanentemente. Certifique-se de ter backup antes da primeira execução.

2. ⚠️ **Teste:** Teste primeiro em ambiente de desenvolvimento antes de aplicar em produção.

3. ⚠️ **Monitoramento:** Monitore os logs nas primeiras semanas para garantir que está funcionando corretamente.

4. ✅ **Reversível:** A configuração pode ser facilmente ajustada (prazos, horários) modificando as funções.

---

**Última atualização:** 02/02/2025  
**Status:** ✅ Implementação completa - Pronta para aplicar

