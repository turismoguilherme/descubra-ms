# 📋 Consulta: Remoção de Eventos Mocados e Lógica de Remoção

## 🎯 Objetivos da Consulta

1. Remover eventos mocados do Descubra Mato Grosso do Sul
2. Verificar se eventos cadastrados somem quando a data de término passa
3. Verificar se eventos no admin (aprovados/rejeitados) ficam armazenados para sempre

---

## 🔍 Análise Realizada

### **1. Eventos Mocados** ✅

**Status Atual:**
- ✅ Método `getMockEvents()` já foi removido de `AlumiaService` (comentário encontrado)
- ⚠️ Há uma referência em `EventSystemStatus.tsx` linha 73 que menciona "Eventos Mock" em testes mock, mas é apenas uma mensagem de teste, não dados reais

**Localização Encontrada:**
```
src/components/events/EventSystemStatus.tsx (linha 73)
- Mensagem de teste: "Eventos de demonstração carregados"
- Não retorna eventos mocados, apenas uma mensagem de teste
```

**Conclusão:**
- Eventos mocados reais já foram removidos
- Resta apenas uma mensagem de teste que pode ser atualizada

---

### **2. Remoção Automática Quando Data de Término Passa** ✅

**Status Atual:**
- ✅ Existe lógica de limpeza automática implementada
- ✅ Eventos expirados são automaticamente ocultos da plataforma

**Mecanismos Encontrados:**

#### **A. No Frontend (Filtros):**
- `EventosDestaqueSection.tsx` filtra eventos com:
  ```typescript
  .gte('start_date', today)  // Apenas eventos futuros
  .eq('is_visible', true)    // Apenas visíveis
  .eq('approval_status', 'approved')  // Apenas aprovados
  ```
- **Resultado:** Eventos passados não aparecem mesmo que ainda estejam no banco

#### **B. No Backend (Limpeza Automática):**
- `EventCleanupService` - Serviço de limpeza automática:
  - Busca eventos com `end_date < hoje` ou `start_date < hoje` (se end_date null)
  - **Comportamento:** Depende da configuração `archiveExpiredEvents`:
    - Se `true`: Arquiva (marca `is_visible: false`)
    - Se `false`: Deleta completamente do banco

- `IntelligentEventService` - Limpeza automática:
  - Sempre arquiva (marca `is_visible: false`, `auto_hide: true`)
  - **Não deleta** do banco

#### **C. No Banco de Dados:**
- Função `auto_expire_events()`:
  - Marca eventos com `end_date <= hoje` como `is_active: FALSE`
  - **Não deleta** do banco

**Conclusão:**
- ✅ Eventos **somem da plataforma** quando a data de término passa (filtrados no frontend)
- ⚠️ Eventos **NÃO são deletados** do banco por padrão, apenas **arquivados** (marcados como invisíveis)
- ⚠️ O comportamento depende da configuração do `EventCleanupService`

---

### **3. Eventos no Admin (Aprovados/Rejeitados)** ✅

**Status Atual:**
- ✅ Eventos aprovados e rejeitados **ficam armazenados no banco para sempre**
- ❌ **NÃO há lógica** que remove eventos baseado em `approval_status`

**Comportamento Atual:**

#### **Eventos Aprovados:**
- `approval_status = 'approved'`
- `is_visible = true`
- Aparecem na plataforma pública
- Ficam no banco permanentemente
- Quando expiram, são arquivados (is_visible: false), mas continuam no banco

#### **Eventos Rejeitados:**
- `approval_status = 'rejected'`
- `is_visible = false`
- **NÃO aparecem** na plataforma pública
- Ficam no banco **permanentemente**
- Podem ser visualizados no admin em aba "Rejeitados"

**Conclusão:**
- ✅ Eventos aprovados e rejeitados **ficam armazenados no banco para sempre**
- ✅ Podem ser visualizados no admin
- ❌ **NÃO há limpeza automática** baseada em `approval_status`

---

## ❓ Perguntas para o Usuário

Antes de implementar, preciso de sua confirmação sobre:

### **1. Eventos Mocados:**
- ✅ Confirmado: Remover a mensagem de teste em `EventSystemStatus.tsx` que menciona "Eventos Mock"?
- ✅ Há algum outro local onde você encontrou eventos mocados que precisa ser removido?

### **2. Remoção Automática (Data de Término):**
- ❓ **Comportamento Desejado:** Quando um evento termina (end_date passou), você quer:
  - **Opção A:** Apenas ocultar da plataforma (arquivar) - **mantém no banco**
  - **Opção B:** Deletar completamente do banco
  - **Opção C:** Ocultar da plataforma pública, mas manter visível no admin para histórico

- ❓ **Tempo de Arquivamento:** Se escolher opção A ou C, após quantos dias você quer que eventos arquivados sejam deletados? (ex: 30 dias, 90 dias, nunca)

### **3. Eventos no Admin (Aprovados/Rejeitados):**
- ❓ **Eventos Aprovados:** Você quer que eventos aprovados:
  - Fiquem no banco para sempre (histórico completo)
  - Sejam deletados após X dias de expiração
  - Sejam deletados quando aprovados há mais de X dias

- ❓ **Eventos Rejeitados:** Você quer que eventos rejeitados:
  - Fiquem no banco para sempre (para auditoria)
  - Sejam deletados após X dias (ex: 30, 90 dias)
  - Sejam deletados imediatamente após rejeição

- ❓ **Limpeza Automática:** Você quer uma função automática que:
  - Delete eventos rejeitados antigos (>30 dias)
  - Delete eventos aprovados expirados antigos (>90 dias)
  - Mantenha apenas eventos ativos no banco

---

## 📊 Resumo do Estado Atual

| Aspecto | Status Atual | Comportamento |
|---------|--------------|---------------|
| **Eventos Mocados** | ✅ Removidos | Apenas mensagem de teste restante |
| **Ocultação por Data** | ✅ Funcionando | Eventos passados não aparecem na plataforma |
| **Remoção do Banco** | ⚠️ Parcial | Apenas arquivados (is_visible: false), não deletados |
| **Eventos Aprovados** | ✅ Armazenados | Ficam no banco para sempre |
| **Eventos Rejeitados** | ✅ Armazenados | Ficam no banco para sempre |
| **Limpeza por Status** | ❌ Não existe | Nenhuma limpeza baseada em approval_status |

---

## 🎯 Recomendações Sugeridas

### **1. Eventos Mocados:**
- ✅ Remover mensagem de teste "Eventos Mock" de `EventSystemStatus.tsx`

### **2. Remoção Automática (Data de Término):**
- ✅ **Recomendação:** Manter arquivamento (não deletar imediatamente)
- ✅ Adicionar opção de deletar eventos arquivados após 90 dias (configurável)

### **3. Eventos no Admin:**
- ✅ **Recomendação para Aprovados:** Manter no banco (histórico é importante)
- ✅ **Recomendação para Rejeitados:** Deletar após 30 dias (economizar espaço)
- ✅ Criar função de limpeza automática configurável

---

## ⏳ Aguardando Confirmação

**Por favor, responda as perguntas acima antes de eu implementar as mudanças.**

**Última atualização:** 02/02/2025  
**Status:** ⏳ Aguardando confirmação do usuário

