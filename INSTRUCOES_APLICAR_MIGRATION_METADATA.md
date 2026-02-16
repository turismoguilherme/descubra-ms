# 📋 Instruções: Aplicar Migration de Metadata

## ✅ Status do Deploy

- ✅ **Edge Functions deployadas com sucesso:**
  - `stripe-connect-onboarding`
  - `stripe-connect-callback`
  - `reservation-checkout-connect`

- ⚠️ **Migration precisa ser aplicada manualmente**

---

## 🎯 Objetivo

Adicionar a coluna `metadata` na tabela `security_audit_log` para armazenar informações adicionais dos eventos de segurança.

---

## 📝 Passo a Passo

### 1. Acesse o Supabase Dashboard

1. Vá para: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: **hvtrpkbjgbuypkskqcqm** (Descubra MS)

### 2. Abra o SQL Editor

1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New query"** (Nova consulta)

### 3. Execute a Migration

1. Abra o arquivo: `supabase/migrations/20250216000001_add_metadata_to_security_audit_log.sql`
2. **Copie TODO o conteúdo** do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **"RUN"** (ou pressione `Ctrl+Enter`)
5. Aguarde a execução completar

### 4. Verificação

Após executar, verifique se funcionou executando esta query:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'security_audit_log' 
AND column_name = 'metadata';
```

**Resultado esperado:**
- `column_name`: `metadata`
- `data_type`: `jsonb`
- `is_nullable`: `YES`
- `column_default`: `'{}'::jsonb`

---

## ✅ Após Aplicar a Migration

Tudo estará funcionando:

1. ✅ **Rate Limiting** - Ativo nas Edge Functions
2. ✅ **Logs de Segurança** - Registrando todos os eventos
3. ✅ **Notificações no Admin** - Aparecerão automaticamente
4. ✅ **Auditoria** - Todos os logs visíveis no admin

---

## 🔍 Onde Ver os Logs no Admin

Após aplicar a migration, os logs aparecerão automaticamente em:

1. **Security Alert Monitor** - `/viajar/admin/system/security`
2. **Security Monitoring Dashboard** - Dashboard de métricas
3. **Audit Logs** - `/viajar/admin/system/audit-logs`
4. **Admin Notifications** - Sino de notificações (eventos críticos)

---

## ⚠️ Problemas Comuns

### Erro: "column already exists"
- **Causa**: A coluna `metadata` já existe na tabela
- **Solução**: A migration verifica se existe antes de criar, então é seguro executar novamente
- **Ação**: Se já existir, apenas verifique com a query acima

### Erro de permissão
- **Causa**: Você não tem permissão de administrador
- **Solução**: Certifique-se de estar logado com a conta correta

---

## 📊 Conteúdo da Migration

A migration faz o seguinte:

1. ✅ Adiciona coluna `metadata JSONB DEFAULT '{}'::jsonb`
2. ✅ Cria índice GIN para buscas eficientes
3. ✅ Adiciona comentário na coluna

**É seguro executar múltiplas vezes** - a migration verifica se a coluna já existe antes de criar.

---

**Dúvidas?** Verifique os logs no SQL Editor do Supabase ou consulte a documentação.

