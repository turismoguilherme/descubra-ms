# 📋 PROPOSTA: Agente Cris e Melhorias do Sistema

## 🔍 ANÁLISE REALIZADA

### 1. ✅ **Templates Existentes Encontrados**

**Situação atual:**
- ✅ Templates estão **hardcoded** na Edge Function `send-notification-email/index.ts`
- ✅ Existem **15 tipos de templates** diferentes:
  - `event_approved`, `event_rejected`, `event_payment_confirmed`
  - `partner_approved`, `partner_rejected`, `partner_welcome`
  - `welcome`, `welcome_subscription`
  - `system_alert`
  - `data_report_approved`, `data_report_ready`
  - `partner_notification`
  - `stripe_connect_complete`
  - `reservation_payment_received`

**Problema:**
- ❌ Templates não estão na tabela `message_templates`
- ❌ Não podem ser editados via interface admin
- ❌ Usuário não consegue ver/editar esses templates

**Solução proposta:**
1. Migrar todos os templates hardcoded para `message_templates`
2. Criar script de migração para inserir templates iniciais
3. Atualizar Edge Function para buscar templates do banco (com fallback para hardcoded)

---

### 2. 🤖 **Agente Autônomo - Estado Atual**

**O que está funcionando:**
- ✅ `pg_cron` configurado (executa a cada minuto)
- ✅ Edge Function `autonomous-agent-scheduler` existe
- ✅ Tarefas básicas implementadas:
  - Análise de Métricas (08:00 diariamente)
  - Relatório Financeiro (Segunda 08:00)
  - Alertas de Anomalias (a cada hora)
  - Limpeza de Cache (Domingo 08:00)
  - **Aprovação Automática de Eventos** (a cada hora) - **DESABILITADO**

**Aprovação Automática Atual:**
```typescript
// Regras atuais (básicas):
- Evento deve ser gratuito (is_free = true ou price = 0)
- Data deve ser pelo menos 7 dias no futuro
- Deve ter nome/título preenchido
- Não pode conter palavras bloqueadas: ['teste', 'test', 'spam', 'xxx']
```

**O que está faltando:**
- ❌ Verificação de apologia a temas inadequados
- ❌ Detecção de palavrões
- ❌ Análise de conteúdo com IA (Gemini)
- ❌ Verificação de contexto e tom da mensagem

---

### 3. 📧 **Agente de Email "Cris" - Proposta**

**Inspiração:** Cursor AI (como funciona)
- Respostas humanas e naturais
- Contexto do usuário e histórico
- Tom profissional mas amigável
- Personalidade consistente

**Proposta para "Cris":**

#### **Identidade:**
- **Nome:** Cris
- **Gênero:** Feminino
- **Papel:** Assistente Virtual do Descubra MS
- **Tom:** Profissional, amigável, prestativa, brasileira

#### **Características:**
- Responde como uma pessoa real (não robótica)
- Usa emojis moderadamente (quando apropriado)
- Assina como "Cris - Equipe Descubra MS"
- Mantém contexto da conversa
- Personaliza respostas baseado no histórico do usuário

#### **Capacidades:**
1. **Responder emails recebidos automaticamente**
   - Analisa conteúdo do email
   - Busca contexto do usuário no banco
   - Gera resposta personalizada com Gemini
   - Envia resposta automaticamente (se confiança > 80%)
   - Encaminha para humano se confiança < 80%

2. **Aprovar eventos com regras avançadas**
   - Verifica apologia a temas inadequados
   - Detecta palavrões e linguagem ofensiva
   - Analisa contexto e tom
   - Verifica se conteúdo é apropriado para turismo
   - Aprova automaticamente se passar em todas as verificações

---

## 🎯 PLANO DE IMPLEMENTAÇÃO

### **FASE 1: Migração de Templates** (2-3 horas)

**Objetivo:** Tornar templates editáveis no admin

**Ações:**
1. Criar script SQL para migrar templates hardcoded para `message_templates`
2. Atualizar Edge Function para buscar templates do banco primeiro
3. Manter fallback para templates hardcoded (compatibilidade)
4. Testar que templates aparecem no `EmailTemplatesManager`

**Arquivos a modificar:**
- `supabase/migrations/XXXX_migrate_email_templates.sql` (NOVO)
- `supabase/functions/send-notification-email/index.ts` (ATUALIZAR)

---

### **FASE 2: Melhorar Aprovação Automática de Eventos** (3-4 horas)

**Objetivo:** Adicionar verificações avançadas de conteúdo

**Regras a implementar:**

1. **Verificação de Apologia:**
   - Lista de temas proibidos: violência, drogas, discriminação, etc.
   - Usar Gemini para análise contextual (não apenas palavras-chave)

2. **Detecção de Palavrões:**
   - Lista de palavras ofensivas em português
   - Verificação de variações e gírias

3. **Análise de Contexto:**
   - Verificar se conteúdo é apropriado para turismo
   - Verificar tom e linguagem profissional
   - Verificar se não é spam ou conteúdo duplicado

4. **Sistema de Pontuação:**
   - Cada verificação dá pontos negativos
   - Se pontuação < 70: rejeitar automaticamente
   - Se pontuação >= 70 e < 90: encaminhar para revisão humana
   - Se pontuação >= 90: aprovar automaticamente

**Arquivos a modificar:**
- `supabase/functions/autonomous-agent-scheduler/index.ts` (função `executeAutoApproveEvents`)
- Criar `src/services/ai/contentModerationService.ts` (NOVO)

---

### **FASE 3: Criar Agente Cris para Emails** (4-5 horas)

**Objetivo:** Agente IA que responde emails como humano

**Componentes:**

1. **Edge Function: `cris-email-agent`** (NOVO)
   - Recebe emails recebidos (via webhook ou polling)
   - Analisa conteúdo com Gemini
   - Busca contexto do usuário
   - Gera resposta personalizada
   - Envia resposta automaticamente

2. **Serviço de Moderação de Conteúdo** (NOVO)
   - `src/services/ai/contentModerationService.ts`
   - Verifica apologia, palavrões, contexto
   - Retorna pontuação e recomendações

3. **Serviço de Resposta de Email** (NOVO)
   - `src/services/ai/crisEmailService.ts`
   - Gera respostas humanas com Gemini
   - Mantém contexto da conversa
   - Personaliza baseado no histórico

4. **Tabela para Histórico de Respostas** (NOVO)
   - `ai_email_responses` - histórico de respostas da Cris
   - `ai_email_context` - contexto de conversas

**Prompt para Gemini (Cris):**
```
Você é Cris, assistente virtual feminina do Descubra MS, uma plataforma de turismo do Mato Grosso do Sul.

CARACTERÍSTICAS:
- Profissional mas amigável
- Brasileira, usa português natural
- Prestativa e solícita
- Usa emojis moderadamente (apenas quando apropriado)
- Assina sempre como "Cris - Equipe Descubra MS"

CONTEXTO DO USUÁRIO:
[Nome]: {userName}
[Email]: {userEmail}
[Histórico]: {conversationHistory}
[Tipo de usuário]: {userType}

EMAIL RECEBIDO:
{emailContent}

TAREFA:
Responda o email de forma natural, como uma pessoa real, não robótica. 
Seja útil, prestativa e mantenha o tom profissional mas amigável.
Se não souber algo, seja honesta e ofereça ajuda para encontrar a resposta.

RESPOSTA (máximo 300 palavras):
```

**Arquivos a criar:**
- `supabase/functions/cris-email-agent/index.ts` (NOVO)
- `supabase/migrations/XXXX_create_cris_tables.sql` (NOVO)
- `src/services/ai/crisEmailService.ts` (NOVO)
- `src/services/ai/contentModerationService.ts` (NOVO)

---

### **FASE 4: Integração e Testes** (2-3 horas)

**Objetivos:**
1. Integrar Cris com webhook de recebimento de emails
2. Configurar agendamento para Cris verificar emails pendentes
3. Criar dashboard para monitorar respostas da Cris
4. Testes end-to-end

---

## 📊 ESTRUTURA DE DADOS PROPOSTA

### **Tabela: `ai_email_responses`**
```sql
CREATE TABLE ai_email_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_email_id UUID REFERENCES communication_logs(id),
  response_text TEXT NOT NULL,
  confidence_score DECIMAL(3,2), -- 0.00 a 1.00
  was_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  reviewed_by_human BOOLEAN DEFAULT FALSE,
  human_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### **Tabela: `ai_email_context`**
```sql
CREATE TABLE ai_email_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  conversation_history JSONB,
  user_type TEXT, -- 'partner', 'tourist', 'admin', etc.
  preferences JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### **Tabela: `content_moderation_logs`**
```sql
CREATE TABLE content_moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- 'event', 'email', 'comment', etc.
  content_id UUID,
  content_text TEXT NOT NULL,
  moderation_score DECIMAL(3,2),
  flags JSONB, -- {'apology': false, 'profanity': true, 'spam': false}
  decision TEXT, -- 'approved', 'rejected', 'needs_review'
  ai_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## ❓ PERGUNTAS PARA CONFIRMAÇÃO

1. **Sobre Templates:**
   - ✅ Migrar todos os 15 templates para o banco?
   - ✅ Manter fallback para hardcoded (segurança)?

2. **Sobre Aprovação de Eventos:**
   - ✅ Pontuação mínima para aprovação automática: 90%?
   - ✅ Lista de temas proibidos: você quer definir ou usar padrão?
   - ✅ Quer que eu pesquise lista de palavrões em português?

3. **Sobre Cris:**
   - ✅ Nome "Cris" está bom?
   - ✅ Confiança mínima para envio automático: 80%?
   - ✅ Quer que Cris responda TODOS os emails ou apenas alguns tipos?
   - ✅ Quer que Cris tenha horário de funcionamento (ex: 8h-18h)?

4. **Sobre Prioridades:**
   - Qual fase você quer que eu comece primeiro?
   - Posso fazer todas de uma vez ou prefere uma por vez?

---

## 🚀 PRÓXIMOS PASSOS

**Aguardando sua aprovação para:**
1. ✅ Migrar templates para banco
2. ✅ Melhorar aprovação automática de eventos
3. ✅ Criar agente Cris para emails
4. ✅ Criar sistema de moderação de conteúdo

**Posso começar agora ou prefere revisar primeiro?**

