# Configuração de Variáveis de Ambiente - Função Guatá AI

## Problema Identificado
A função `guata-ai` está retornando erro 500 devido à falta de configuração da variável `GEMINI_API_KEY`.

## Solução

### 1. Configurar Variáveis de Ambiente no Supabase

Execute os seguintes comandos no terminal para configurar as variáveis necessárias:

```bash
# Configurar a chave da API do Gemini
supabase secrets set GEMINI_API_KEY=sua_chave_aqui

# Configurar outras variáveis opcionais
supabase secrets set RATE_LIMIT_PER_MIN=8
supabase secrets set DAILY_BUDGET_CALLS=200
supabase secrets set GEMINI_MAX_OUTPUT_TOKENS=400
supabase secrets set GEMINI_TEMPERATURE=0.6
supabase secrets set GEMINI_MODEL=gemini-1.5-flash-002
```

### 2. Obter Chave da API do Gemini

1. Acesse [Google AI Studio](https://aistudio.google.com/)
2. Faça login com sua conta Google
3. Vá em "Get API Key" 
4. Crie uma nova chave de API
5. Copie a chave gerada

### 3. Deploy da Função

Após configurar as variáveis, faça o deploy:

```bash
supabase functions deploy guata-ai
```

### 4. Verificar Status

```bash
supabase functions list
```

## Fallback Implementado

Enquanto a configuração não estiver completa, o sistema possui fallbacks inteligentes que respondem perguntas básicas sobre Campo Grande e Mato Grosso do Sul.

## Teste da Função

Para testar se a função está funcionando:

```bash
curl -X POST https://hvtrpkbjgbuypkskqcqm.supabase.co/functions/v1/guata-ai \
  -H "Authorization: Bearer SEU_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "ping"}'
```

Deve retornar: `{"response": "pong"}`













