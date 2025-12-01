# 🚀 Executar Migration do Plano Diretor - GUIA RÁPIDO

## ⚡ Método Mais Rápido (2 minutos)

### Passo 1: Abrir Supabase Dashboard
1. Acesse: https://app.supabase.com
2. Faça login na sua conta
3. Selecione o projeto: **hvtrpkbjgbuypkskqcqm**

### Passo 2: Abrir SQL Editor
1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique no botão **New Query** (ou use Ctrl+N)

### Passo 3: Copiar e Colar o SQL
1. Abra o arquivo: `supabase/migrations/COMBINED_plano_diretor_all_migrations.sql`
2. Selecione **TODO** o conteúdo (Ctrl+A)
3. Copie (Ctrl+C)
4. Cole no SQL Editor do Supabase (Ctrl+V)

### Passo 4: Executar
1. Clique no botão **RUN** (ou pressione Ctrl+Enter)
2. Aguarde alguns segundos
3. Você verá uma mensagem de sucesso ✅

### Passo 5: Verificar
Execute esta query para confirmar que as tabelas foram criadas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'plano_diretor%'
ORDER BY table_name;
```

Você deve ver **9 tabelas** listadas:
- plano_diretor_acoes
- plano_diretor_colaboradores
- plano_diretor_comentarios
- plano_diretor_documentos_anexos
- plano_diretor_documents
- plano_diretor_estrategias
- plano_diretor_historico
- plano_diretor_indicadores
- plano_diretor_objetivos

## ✅ Pronto!

Agora você pode:
1. Recarregar a página do dashboard (`/secretary-dashboard`)
2. Tentar criar um novo Plano Diretor
3. O erro 404 não deve mais aparecer!

---

## 🔧 Alternativa: Via Supabase CLI

Se preferir usar o CLI (requer Docker rodando e projeto linkado):

```bash
# 1. Linkar o projeto (se ainda não estiver linkado)
supabase link --project-ref hvtrpkbjgbuypkskqcqm

# 2. Executar migrations
supabase db push
```

**Nota:** O método do Dashboard é mais rápido e não requer configuração adicional.
















