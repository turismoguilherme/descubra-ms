# Corrigir Erros Gemini, Google Search e Supabase - PLANO ATUALIZADO

## Problemas Identificados

1. **Gemini API**: Modelos incorretos - usando `gemini-pro`, `gemini-1.5-pro`, `gemini-1.5-flash` que não existem
2. **Google Search API**: Erro 403 - API não habilitada no projeto
3. **Supabase**: Tabela `guata_user_memory` não existe (404)

## Soluções

### 1. Corrigir Gemini API com Modelos Corretos

**Modelos Disponíveis (da lista fornecida):**
- `models/gemini-2.0-flash-001` - Versão estável (janeiro 2025)
- `models/gemini-2.0-flash` - Versão estável
- `models/gemini-2.5-flash` - Versão estável
- `models/gemini-2.5-pro` - Versão estável (junho 2025)
- `models/gemini-flash-latest` - Última versão
- `models/gemini-pro-latest` - Última versão

**Ordem de prioridade:**
1. `models/gemini-2.0-flash-001` (mais estável e rápido)
2. `models/gemini-2.5-flash` (versão mais recente estável)
3. `models/gemini-2.0-flash` (fallback)
4. `models/gemini-flash-latest` (última versão)
5. `models/gemini-2.5-pro` (se precisar de mais capacidade)
6. `models/gemini-pro-latest` (fallback pro)

**Arquivo**: `src/services/ai/guataGeminiService.ts`
- Modificar método `callGeminiAPI()` (linha ~510)
- Substituir lista de modelos pelos corretos
- Manter lógica de tentar múltiplos modelos

### 2. Melhorar Tratamento Google Search API

**Problema**: API retorna 403 quando não habilitada, quebrando o fluxo

**Solução**:
- Capturar erro 403 especificamente
- Retornar array vazio sem lançar erro
- Adicionar log informativo (não erro)
- Continuar com fallback para dados locais

**Arquivo**: `src/services/ai/guataRealWebSearchService.ts`
- Modificar método `searchWithGoogle()` (linha ~166)
- Adicionar tratamento específico para erro 403
- Retornar array vazio em vez de lançar erro

### 3. Criar Tabela Supabase para ML

**Estrutura da tabela** (seguindo padrão das outras migrations):
```sql
CREATE TABLE IF NOT EXISTS public.guata_user_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  session_id TEXT NOT NULL,
  memory_type TEXT NOT NULL,
  memory_key TEXT NOT NULL,
  memory_value JSONB,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, session_id, memory_type, memory_key)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS guata_user_memory_user_id_idx ON public.guata_user_memory(user_id);
CREATE INDEX IF NOT EXISTS guata_user_memory_session_id_idx ON public.guata_user_memory(session_id);
CREATE INDEX IF NOT EXISTS guata_user_memory_memory_type_idx ON public.guata_user_memory(memory_type);
CREATE INDEX IF NOT EXISTS guata_user_memory_expires_at_idx ON public.guata_user_memory(expires_at);
```

**Arquivo**: `supabase/migrations/20250128000001_create_guata_user_memory.sql`
- Criar migration seguindo padrão das outras
- Usar formato de data YYYYMMDDHHMMSS para nome do arquivo

## Implementação

### Passo 1: Corrigir Gemini API
- Atualizar lista de modelos em `callGeminiAPI()`
- Usar modelos corretos: `models/gemini-2.0-flash-001`, etc.
- Manter lógica de tentar múltiplos até encontrar um que funciona

### Passo 2: Melhorar Google Search
- Capturar erro 403 e retornar vazio
- Adicionar log informativo
- Não quebrar o fluxo

### Passo 3: Criar Migration Supabase
- Criar arquivo SQL na pasta `supabase/migrations/`
- Seguir padrão de nomenclatura das outras migrations
- Adicionar índices para performance

## Resultado Esperado

- Gemini usa modelos corretos e funciona
- Google Search não quebra o fluxo quando API não está habilitada
- Supabase tem tabela `guata_user_memory` para ML funcionar
- Sistema funciona mesmo com APIs desabilitadas

