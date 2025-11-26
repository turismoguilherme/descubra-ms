# Instruções: Executar Migrations do Plano Diretor de Turismo

## Problema
O erro **404 (Not Found)** ao tentar criar um Plano Diretor indica que as tabelas não existem no banco de dados. Isso significa que as migrations não foram executadas.

## Solução

### ⚡ Opção 1: Arquivo SQL Combinado (MAIS RÁPIDO - Recomendado)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Abra o arquivo: `supabase/migrations/COMBINED_plano_diretor_all_migrations.sql`
5. Copie **TODO** o conteúdo do arquivo
6. Cole no SQL Editor do Supabase
7. Clique em **RUN** (ou pressione Ctrl+Enter)
8. Aguarde a execução completa (pode levar alguns segundos)

✅ **Pronto!** Todas as migrations foram executadas de uma vez.

---

### Opção 2: Executar Migrations Separadamente

Se preferir executar uma por uma:

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Execute as migrations na seguinte ordem:

#### Migration 1: Tabelas
```sql
-- Copie e cole o conteúdo completo do arquivo:
-- supabase/migrations/20250203000000_create_plano_diretor_tables.sql
```

#### Migration 2: Funções e Triggers
```sql
-- Copie e cole o conteúdo completo do arquivo:
-- supabase/migrations/20250203000001_create_plano_diretor_functions.sql
```

#### Migration 3: RLS Policies
```sql
-- Copie e cole o conteúdo completo do arquivo:
-- supabase/migrations/20250203000002_create_plano_diretor_rls.sql
```

### Opção 2: Via CLI do Supabase

Se você tem o Supabase CLI instalado:

```bash
# No diretório do projeto
supabase db push
```

Isso executará todas as migrations pendentes automaticamente.

### Opção 3: Via Script SQL

1. Abra cada arquivo de migration em `supabase/migrations/`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Execute cada uma na ordem (1, 2, 3)

## Verificação

Após executar as migrations, verifique se as tabelas foram criadas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'plano_diretor%';
```

Você deve ver as seguintes tabelas:
- `plano_diretor_documents`
- `plano_diretor_objetivos`
- `plano_diretor_estrategias`
- `plano_diretor_acoes`
- `plano_diretor_indicadores`
- `plano_diretor_colaboradores`
- `plano_diretor_comentarios`
- `plano_diretor_documentos_anexos`
- `plano_diretor_historico`

## Nota sobre Usuários de Teste

Se você estiver usando um usuário de teste (como `municipal-1`), pode ser necessário:

1. Criar o usuário no Supabase Auth, OU
2. Ajustar as políticas RLS para permitir usuários de teste

Para ajustar as políticas RLS temporariamente para desenvolvimento:

```sql
-- Desabilitar RLS temporariamente (APENAS PARA DESENVOLVIMENTO)
ALTER TABLE plano_diretor_documents DISABLE ROW LEVEL SECURITY;

-- Ou criar uma política que permite inserção para qualquer usuário autenticado
CREATE POLICY "Allow insert for authenticated users"
ON plano_diretor_documents FOR INSERT
TO authenticated
WITH CHECK (true);
```

**⚠️ ATENÇÃO:** Desabilitar RLS ou criar políticas permissivas deve ser feito APENAS em ambiente de desenvolvimento. Em produção, mantenha as políticas RLS adequadas.

## Após Executar as Migrations

1. Recarregue a página do dashboard
2. Tente criar um novo Plano Diretor
3. O erro 404 não deve mais aparecer

