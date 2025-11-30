# 🔧 Troubleshooting: Passaporte Digital

## Problema: Migration não funciona

### Passo 1: Executar Diagnóstico

Execute o arquivo `DIAGNOSTICO_PASSAPORTE.sql` no SQL Editor do Supabase para identificar o problema específico.

### Passo 2: Erros Comuns e Soluções

#### ❌ Erro: "relation 'routes' does not exist"
**Causa:** A tabela `routes` não existe no banco.

**Solução:** 
1. Verifique se a migration `20250721200842_remote_schema.sql` foi executada
2. Se não, execute-a primeiro antes da migration do passaporte

#### ❌ Erro: "column 'role' does not exist"
**Causa:** As políticas RLS estão tentando acessar `user_profiles.role`, mas essa coluna não existe.

**Solução:** ✅ JÁ CORRIGIDO - A migration foi atualizada para usar `user_roles` em vez de `user_profiles.role`

#### ❌ Erro: "relation 'user_roles' does not exist"
**Causa:** A tabela `user_roles` não existe.

**Solução:** 
1. Verifique se a migration que cria `user_roles` foi executada
2. Se não existir, crie temporariamente:
```sql
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### ❌ Erro: "duplicate key value violates unique constraint"
**Causa:** Tentando criar uma política RLS que já existe.

**Solução:** 
1. Remova as políticas antigas antes de executar a migration:
```sql
DROP POLICY IF EXISTS "Anyone can view active passport configurations" ON passport_configurations;
DROP POLICY IF EXISTS "Admins can manage passport configurations" ON passport_configurations;
DROP POLICY IF EXISTS "Anyone can view active rewards" ON passport_rewards;
DROP POLICY IF EXISTS "Admins can manage rewards" ON passport_rewards;
DROP POLICY IF EXISTS "Users can view their own rewards" ON user_rewards;
DROP POLICY IF EXISTS "Users can update their own rewards (marcar como usado)" ON user_rewards;
DROP POLICY IF EXISTS "System can insert rewards for users" ON user_rewards;
DROP POLICY IF EXISTS "Users can manage their own offline checkins" ON offline_checkins;
DROP POLICY IF EXISTS "Users can view their own passport" ON user_passports;
DROP POLICY IF EXISTS "System can create passports for users" ON user_passports;
DROP POLICY IF EXISTS "Users can update their own passport" ON user_passports;
```

#### ❌ Erro: "function already exists"
**Causa:** As funções SQL já foram criadas.

**Solução:** Isso é normal. A migration usa `CREATE OR REPLACE FUNCTION`, então deve funcionar. Se ainda der erro, execute:
```sql
DROP FUNCTION IF EXISTS generate_passport_number(VARCHAR);
DROP FUNCTION IF EXISTS calculate_distance(NUMERIC, NUMERIC, NUMERIC, NUMERIC);
DROP FUNCTION IF EXISTS check_geofence(NUMERIC, NUMERIC, NUMERIC, NUMERIC, INTEGER);
DROP FUNCTION IF EXISTS check_checkin_rate_limit(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS unlock_rewards(UUID, UUID);
```

### Passo 3: Executar Migration em Partes

Se a migration completa falhar, execute em partes:

#### Parte 1: Expandir Tabelas Existentes
```sql
-- Expandir route_checkpoints
ALTER TABLE route_checkpoints 
ADD COLUMN IF NOT EXISTS stamp_fragment_number INTEGER,
ADD COLUMN IF NOT EXISTS geofence_radius INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS requires_photo BOOLEAN DEFAULT false;

-- Expandir routes
ALTER TABLE routes 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS passport_number_prefix VARCHAR(10) DEFAULT 'MS';
```

#### Parte 2: Criar Novas Tabelas
Execute apenas a seção "NOVAS TABELAS" da migration.

#### Parte 3: Criar Funções
Execute apenas a seção "FUNÇÕES SQL" da migration.

#### Parte 4: Criar RLS
Execute apenas a seção "ROW LEVEL SECURITY" da migration.

### Passo 4: Verificar Resultado

Execute `VERIFICAR_PASSAPORTE_TABELAS.sql` para confirmar que tudo foi criado.

## Problema: Sistema não funciona após migration

### Verificar se as tabelas existem:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'passport_configurations',
  'passport_rewards',
  'user_rewards',
  'offline_checkins',
  'user_passports'
);
```

### Verificar se as funções existem:
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'generate_passport_number',
  'calculate_distance',
  'check_geofence',
  'check_checkin_rate_limit',
  'unlock_rewards'
);
```

### Verificar RLS:
```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'passport_configurations',
  'passport_rewards',
  'user_rewards',
  'offline_checkins',
  'user_passports'
);
```

## Problema: Erro no Frontend

### Erro: "Tabela user_passports não existe"
**Solução:** Execute a migration completa.

### Erro: "404" ao acessar passaporte
**Solução:** 
1. Verifique se o usuário está logado
2. Verifique se as políticas RLS permitem acesso
3. Verifique os logs do console do navegador

### Erro: "Rota não encontrada"
**Solução:**
1. Crie uma rota no painel admin: `/viajar/admin/descubra-ms/passport`
2. Configure checkpoints para a rota
3. Ative a configuração de passaporte para a rota

## Contato

Se nenhuma das soluções acima funcionar, forneça:
1. O erro completo do SQL Editor
2. O resultado do `DIAGNOSTICO_PASSAPORTE.sql`
3. Screenshots dos erros

