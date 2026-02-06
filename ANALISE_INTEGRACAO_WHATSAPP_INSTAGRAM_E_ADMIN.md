# 📋 Análise: Integração WhatsApp/Instagram e Edição de Prompts no Admin

**Data:** Fevereiro de 2026  
**Solicitante:** Usuário  
**Objetivo:** Avaliar viabilidade de integração do Guatá/Koda no WhatsApp/Instagram e edição de prompts/base de conhecimento no admin

---

## 🔍 1. INTEGRAÇÃO COM WHATSAPP E INSTAGRAM

### ✅ **VIABILIDADE: SIM, É POSSÍVEL**

Baseado na pesquisa web e análise do código, **é totalmente viável** integrar o Guatá e o Koda no WhatsApp e Instagram com funcionalidades similares à aplicação web.

### 📊 **OPÇÕES DISPONÍVEIS:**

#### **A. WhatsApp Business API**
- ✅ **API Oficial**: WhatsApp Business API permite integração completa
- ✅ **Provedores**: Twilio, MessageBird, ou diretamente via Meta
- ✅ **Funcionalidades**: Envio/recebimento de mensagens, mídia, webhooks
- ✅ **Custo**: Pago (por mensagem enviada), mas há tier gratuito para testes
- ✅ **Status no código**: Já existe estrutura básica (`supabase/functions/receive-whatsapp-webhook/index.ts`)

#### **B. Instagram Direct Messages API**
- ✅ **API Oficial**: Instagram Graph API permite integração com DMs
- ✅ **Requisitos**: Conta Business/Professional, aprovação da Meta
- ✅ **Funcionalidades**: Envio/recebimento de mensagens, webhooks
- ✅ **Custo**: Geralmente gratuito (dentro dos limites da API)
- ⚠️ **Status no código**: Não encontrada estrutura existente

#### **C. Soluções Prontas (Terceiros)**
- ✅ **Exemplos**: "God in a Box", Make.com, Zapier
- ✅ **Vantagem**: Implementação rápida, sem código
- ⚠️ **Desvantagem**: Menos controle, custos adicionais

### 🏗️ **ARQUITETURA RECOMENDADA:**

```
WhatsApp/Instagram → Webhook → Supabase Edge Function → Guatá/Koda Service → Gemini AI → Resposta → WhatsApp/Instagram
```

### 📝 **IMPLEMENTAÇÃO NECESSÁRIA:**

1. **Webhook Receivers** (já existe parcialmente para WhatsApp)
   - Criar/atualizar Edge Functions para receber mensagens
   - Processar mensagens recebidas
   - Chamar serviço do Guatá/Koda

2. **Message Senders**
   - Edge Functions para enviar respostas
   - Integração com WhatsApp Business API
   - Integração com Instagram Graph API

3. **Session Management**
   - Gerenciar sessões de conversa por usuário
   - Manter histórico de conversas
   - Rate limiting por usuário

4. **Configuração no Admin**
   - Interface para configurar credenciais
   - Ativar/desativar integrações
   - Monitoramento de mensagens

---

## 🎛️ 2. EDIÇÃO DE PROMPTS E BASE DE CONHECIMENTO NO ADMIN

### ✅ **STATUS ATUAL:**

#### **Base de Conhecimento:**
- ✅ **JÁ EXISTE**: `src/components/management/KnowledgeBaseManager.tsx`
- ✅ **Funcionalidades**: Criar, editar, deletar itens da base de conhecimento
- ⚠️ **Limitação**: Atualmente apenas em memória (não persiste no banco)
- ⚠️ **Não específico**: Não está vinculado especificamente ao Guatá/Koda

#### **Prompts:**
- ❌ **NÃO EXISTE**: Não há interface de admin para editar prompts do Guatá/Koda
- ⚠️ **Status**: Prompts estão hardcoded nos serviços:
  - `src/services/ai/kodaGeminiService.ts` (linha 366-456)
  - `src/services/ai/guataConsciousService.ts` (provavelmente)
  - Outros serviços de IA

### 📊 **ANÁLISE DO CÓDIGO:**

#### **Guatá:**
- Múltiplos serviços de IA (guataConsciousService, guataIntelligentService, etc.)
- Prompts construídos dinamicamente em cada serviço
- Base de conhecimento pode usar `knowledge_base_entries` (tabela no Supabase)

#### **Koda:**
- Serviço principal: `kodaGeminiService.ts`
- Prompt definido no método `buildPrompt()` (linhas 349-456)
- Personalidade e configurações hardcoded (linhas 32-39)

### 🎯 **RECOMENDAÇÕES:**

#### **1. Criar Tabela de Configuração de Prompts**
```sql
CREATE TABLE ai_prompt_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chatbot_name TEXT NOT NULL, -- 'guata' ou 'koda'
  prompt_type TEXT NOT NULL, -- 'system', 'personality', 'instructions'
  content TEXT NOT NULL,
  variables JSONB, -- Variáveis dinâmicas
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **2. Criar Interface de Admin para Prompts**
- Editor de texto rico para prompts
- Preview de como o prompt será usado
- Versionamento de prompts
- Teste de prompts antes de ativar

#### **3. Melhorar Base de Conhecimento**
- Conectar `KnowledgeBaseManager` ao banco de dados
- Vincular itens ao chatbot específico (Guatá ou Koda)
- Sistema de categorias e tags
- Importação/exportação em massa

#### **4. Sistema de Variáveis Dinâmicas**
- Permitir variáveis nos prompts (ex: `{user_location}`, `{conversation_history}`)
- Editor visual para inserir variáveis
- Validação de prompts antes de salvar

---

## 🚀 3. PLANO DE IMPLEMENTAÇÃO SUGERIDO

### **FASE 1: Edição de Prompts e Base de Conhecimento (Prioridade Alta)**
1. ✅ Criar tabelas no Supabase para prompts e base de conhecimento
2. ✅ Criar interface de admin para editar prompts do Guatá
3. ✅ Criar interface de admin para editar prompts do Koda
4. ✅ Melhorar `KnowledgeBaseManager` para persistir no banco
5. ✅ Atualizar serviços de IA para usar prompts do banco

**Tempo estimado:** 2-3 semanas  
**Complexidade:** Média

### **FASE 2: Integração WhatsApp (Prioridade Média)**
1. ✅ Configurar WhatsApp Business API
2. ✅ Criar/atualizar Edge Functions para webhooks
3. ✅ Implementar sistema de sessões
4. ✅ Criar interface de admin para configuração
5. ✅ Testes e validação

**Tempo estimado:** 3-4 semanas  
**Complexidade:** Alta  
**Custos:** Variável (depende do volume de mensagens)

### **FASE 3: Integração Instagram (Prioridade Baixa)**
1. ✅ Configurar Instagram Graph API
2. ✅ Criar Edge Functions para DMs
3. ✅ Implementar sistema de sessões (reutilizar do WhatsApp)
4. ✅ Criar interface de admin para configuração
5. ✅ Testes e validação

**Tempo estimado:** 2-3 semanas  
**Complexidade:** Média  
**Custos:** Geralmente gratuito

---

## ⚠️ 4. CONSIDERAÇÕES IMPORTANTES

### **WhatsApp:**
- ⚠️ **Custos**: Cobrança por mensagem enviada (após tier gratuito)
- ⚠️ **Aprovação**: Requer aprovação da Meta para produção
- ⚠️ **Limites**: Rate limits e limites de mensagens
- ⚠️ **Template Messages**: Mensagens iniciais precisam de templates aprovados

### **Instagram:**
- ⚠️ **Aprovação**: Requer aprovação da Meta
- ⚠️ **Limitações**: Algumas funcionalidades limitadas vs WhatsApp
- ⚠️ **Business Account**: Requer conta Business/Professional

### **Prompts e Base de Conhecimento:**
- ⚠️ **Versionamento**: Importante ter histórico de mudanças
- ⚠️ **Validação**: Validar prompts antes de ativar
- ⚠️ **Backup**: Sistema de backup antes de mudanças
- ⚠️ **Testes**: Ambiente de teste para validar mudanças

---

## 📋 5. PRÓXIMOS PASSOS RECOMENDADOS

1. **Confirmar prioridades** com o usuário
2. **Decidir ordem de implementação** (Prompts primeiro ou WhatsApp primeiro?)
3. **Avaliar orçamento** para WhatsApp Business API
4. **Criar mockups** das interfaces de admin
5. **Definir especificações técnicas** detalhadas

---

## 🔗 6. REFERÊNCIAS E RECURSOS

### **WhatsApp Business API:**
- Documentação oficial: https://developers.facebook.com/docs/whatsapp
- Twilio WhatsApp: https://www.twilio.com/whatsapp
- MessageBird: https://www.messagebird.com/en/whatsapp

### **Instagram Graph API:**
- Documentação oficial: https://developers.facebook.com/docs/instagram-api
- Direct Messages: https://developers.facebook.com/docs/instagram-api/guides/direct-messages

### **Soluções Prontas:**
- Make.com: https://www.make.com
- Zapier: https://zapier.com

---

## ✅ CONCLUSÃO

**Integração WhatsApp/Instagram:** ✅ **VIÁVEL** - Requer desenvolvimento e aprovação da Meta

**Edição de Prompts no Admin:** ⚠️ **PARCIALMENTE VIÁVEL** - Base de conhecimento existe, mas prompts precisam ser implementados

**Recomendação:** Começar pela FASE 1 (Edição de Prompts e Base de Conhecimento), pois:
- Não requer aprovações externas
- Não tem custos adicionais
- Melhora a experiência de administração
- Facilita futuras integrações

---

**Próxima ação:** Aguardar confirmação do usuário sobre prioridades e início da implementação.

