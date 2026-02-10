# Análise de Edge Functions e Side-Effects

## Edge Functions Potencialmente Mortas

### 1. test-gemini
**Status**: Função de teste
**Uso**: Não referenciada no frontend
**Ação**: Pode ser removida (função de teste)

### 2. ingest-run
**Status**: Função de setup/ingestão
**Uso**: Não referenciada no frontend
**Ação**: Manter se for usada por scripts/cron jobs, remover se não for mais necessária

### 3. rag-setup
**Status**: Função de setup (cria tabelas DDL)
**Uso**: Não referenciada no frontend
**Ação**: Manter se for usada em setup inicial, remover se já foi executada

### 4. check-data
**Status**: Função de debug/verificação
**Uso**: Não referenciada no frontend
**Ação**: Pode ser removida (função de debug)

### 5. admin-feedback
**Status**: Função de feedback
**Uso**: Não referenciada no frontend
**Nota**: Existe `guata-feedback` que faz função similar
**Ação**: Verificar se é duplicado e remover se for

### 6. crawler-run
**Status**: Função de crawling
**Uso**: Não referenciada no frontend
**Ação**: Manter se for usada por scripts/cron jobs, remover se não for mais necessária

## Side-Effect Imports no App.tsx

### 1. EventServiceInitializer
**Status**: Inicializa serviços de eventos
**Auto-inicialização**: Desabilitada em produção (linha 118: `&& false`)
**Ação**: Manter - não executa automaticamente em produção

### 2. AutoEventActivator
**Status**: Ativa sistema de eventos
**Auto-ativação**: Habilitada (linha 108: `&& true`)
**Ação**: Verificar se é necessário - pode estar consumindo recursos

### 3. IntelligentEventService
**Status**: Serviço principal de eventos inteligentes
**Uso**: Importado como side-effect
**Ação**: Verificar se precisa ser importado como side-effect

### 4. IntelligentEventActivator
**Status**: Ativa sistema inteligente
**Auto-ativação**: Habilitada (linha 98)
**Ação**: Verificar se é necessário - pode estar consumindo recursos

## Recomendações

### Remover Imediatamente:
- `test-gemini` - função de teste
- `check-data` - função de debug

### Verificar Antes de Remover:
- `ingest-run` - pode ser usado por scripts
- `rag-setup` - pode ser usado em setup inicial
- `admin-feedback` - verificar se é duplicado de `guata-feedback`
- `crawler-run` - pode ser usado por scripts/cron

### Otimizar:
- `AutoEventActivator` - verificar se auto-ativação é necessária
- `IntelligentEventActivator` - verificar se auto-ativação é necessária

