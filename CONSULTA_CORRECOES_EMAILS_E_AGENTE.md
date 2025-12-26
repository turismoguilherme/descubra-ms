# 🔍 CONSULTA: Correções de Emails, Templates e Agente Autônomo

## 📋 PROBLEMAS IDENTIFICADOS

### 1. ❌ **Seletores não funcionam no EmailDashboard**

**Problema:**
- O componente `Select` dentro do `Dialog` não está funcionando corretamente
- O `SelectContent` já usa `Portal` e `z-[9999]`, mas pode estar sendo bloqueado pelo Dialog

**Causa provável:**
- O Dialog pode estar interceptando eventos de clique
- Z-index pode não ser suficiente
- Portal pode não estar renderizando corretamente

**Solução proposta:**
- Usar `position="popper"` no SelectContent dentro do Dialog
- Aumentar z-index do SelectContent para `z-[10000]`
- Verificar se o Dialog não está bloqueando eventos

---

### 2. 📝 **Templates existentes precisam ser editáveis**

**Situação atual:**
- ✅ Tabela `message_templates` existe no banco
- ✅ Componente `EmailTemplatesManager` foi criado
- ❌ Templates existentes não aparecem para edição
- ❌ Não há integração com templates já usados no sistema

**O que o usuário quer:**
- Editar templates existentes da mesma forma que edita avatares
- Ver todos os templates (não apenas criar novos)
- Interface similar ao `PantanalAvatarsManager`

**Solução proposta:**
- ✅ `EmailTemplatesManager` já existe e funciona
- ⚠️ Verificar se está carregando templates do banco corretamente
- ⚠️ Adicionar busca/filtro de templates
- ⚠️ Mostrar templates existentes na aba "Templates"

---

### 3. 🔔 **Notificações do Admin não funcionam**

**Problema identificado:**
```typescript
// AdminNotifications.tsx usa localStorage
const saved = localStorage.getItem('admin_notifications');
```

**Problemas:**
- ❌ Usa `localStorage` (não persiste entre dispositivos)
- ❌ Não há tabela no banco para notificações
- ❌ Não há integração com eventos do sistema
- ❌ Notificações não são compartilhadas entre admins

**Solução proposta:**
1. **Criar tabela `admin_notifications`:**
   ```sql
   CREATE TABLE admin_notifications (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     type TEXT NOT NULL CHECK (type IN ('success', 'error', 'warning', 'info')),
     title TEXT NOT NULL,
     message TEXT NOT NULL,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     read BOOLEAN DEFAULT FALSE,
     action_url TEXT,
     action_label TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
     read_at TIMESTAMP WITH TIME ZONE
   );
   ```

2. **Migrar `AdminNotifications.tsx`:**
   - Buscar do banco ao invés de localStorage
   - Salvar no banco quando criar notificação
   - Marcar como lida no banco
   - Polling ou WebSocket para atualizações em tempo real

3. **Integrar com eventos do sistema:**
   - Criar notificações quando eventos são aprovados/rejeitados
   - Criar notificações quando há erros no sistema
   - Criar notificações quando há novas solicitações pendentes

---

### 4. 🤖 **Agente Autônomo não está realmente autônomo**

**Situação atual:**
- ✅ `pg_cron` está configurado (executa a cada minuto)
- ✅ Edge Function `autonomous-agent-scheduler` existe
- ✅ Tarefas estão definidas no componente
- ⚠️ **PROBLEMA:** Agente só executa tarefas pré-definidas e limitadas

**O que o usuário quer:**
> "ele tinha que pode fazer tudo, não?"

**Tarefas atuais do agente:**
1. ✅ Análise de Métricas (08:00 diariamente)
2. ✅ Relatório Financeiro (Segunda 08:00)
3. ✅ Sugestões de Conteúdo (10:00 diariamente) - **DESABILITADO**
4. ✅ Otimização de SEO (Quarta 08:00) - **DESABILITADO**
5. ✅ Alertas de Anomalias (a cada hora)
6. ✅ Backup de Dados (03:00 diariamente)
7. ✅ Limpeza de Cache (Domingo 08:00)
8. ✅ Aprovação Automática de Eventos (a cada hora) - **DESABILITADO**

**O que está faltando:**
- ❌ Agente não pode criar/modificar conteúdo automaticamente
- ❌ Agente não pode responder emails automaticamente
- ❌ Agente não pode tomar decisões complexas
- ❌ Agente não pode executar ações baseadas em contexto
- ❌ Agente não tem "autonomia total" - precisa de aprovação para muitas ações

**Solução proposta:**

### **FASE 1: Expandir Capacidades do Agente**
1. **Adicionar tarefas automáticas:**
   - Responder emails simples automaticamente
   - Aprovar eventos que atendem critérios (já existe, mas desabilitado)
   - Criar conteúdo baseado em tendências
   - Modificar configurações baseado em métricas

2. **Sistema de permissões:**
   - Nível de autonomia (0-100%)
   - Permitir ações automáticas baseado no nível
   - Log de todas as ações do agente

3. **IA Contextual:**
   - Usar Gemini para análise de contexto
   - Tomar decisões baseadas em dados históricos
   - Aprender com ações anteriores

### **FASE 2: Verificar se está executando**
- Verificar se `pg_cron` está realmente executando
- Verificar logs da Edge Function
- Verificar se há erros silenciosos

---

## 🎯 PLANO DE AÇÃO PROPOSTO

### **PRIORIDADE ALTA (Fazer agora):**

1. ✅ **Corrigir seletores no EmailDashboard**
   - Tempo estimado: 30 minutos
   - Impacto: Alto (bloqueia uso do dashboard)

2. ✅ **Verificar e corrigir carregamento de templates**
   - Tempo estimado: 1 hora
   - Impacto: Alto (usuário quer editar templates existentes)

3. ✅ **Migrar notificações para banco de dados**
   - Tempo estimado: 2-3 horas
   - Impacto: Médio-Alto (melhora experiência do admin)

### **PRIORIDADE MÉDIA (Próximos passos):**

4. ⚠️ **Expandir capacidades do agente autônomo**
   - Tempo estimado: 4-6 horas
   - Impacto: Alto (usuário quer "fazer tudo")

5. ⚠️ **Verificar execução do pg_cron**
   - Tempo estimado: 1 hora
   - Impacto: Médio (garantir que está funcionando)

---

## ❓ PERGUNTAS PARA O USUÁRIO

1. **Sobre templates:**
   - Você já tem templates criados no banco que não aparecem?
   - Quer que eu busque templates existentes e mostre na interface?

2. **Sobre notificações:**
   - Quer que notificações sejam compartilhadas entre todos os admins?
   - Ou cada admin vê apenas suas próprias notificações?

3. **Sobre o agente autônomo:**
   - Quais ações específicas você quer que o agente possa fazer automaticamente?
   - Qual nível de autonomia você quer (0-100%)?
   - Quer que o agente possa modificar dados sem aprovação?

4. **Sobre prioridades:**
   - Qual problema você quer que eu resolva primeiro?
   - Posso começar pelos seletores e templates (mais rápido)?

---

## 📝 PRÓXIMOS PASSOS

**Aguardando sua confirmação para:**
1. ✅ Corrigir seletores
2. ✅ Verificar templates existentes
3. ✅ Migrar notificações para banco
4. ✅ Expandir agente autônomo

**Posso começar agora ou prefere revisar primeiro?**

