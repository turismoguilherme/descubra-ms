# 🔒 Análise de Vulnerabilidades - Sistema de Passaporte Digital

## 📋 Resumo Executivo

Esta análise identifica vulnerabilidades de segurança no sistema de checkpoints e códigos de parceiro, e propõe melhorias estruturais para tornar o sistema mais seguro e escalável.

---

## 🚨 VULNERABILIDADES IDENTIFICADAS

### 1. **Falta de Relacionamento Checkpoint-Parceiro**
**Severidade: ALTA**

**Problema:**
- Checkpoints não têm relacionamento direto com parceiros
- Código do parceiro é armazenado diretamente no checkpoint
- Não há controle de qual parceiro gerencia qual checkpoint
- Parceiro não tem acesso ao seu próprio código

**Impacto:**
- Parceiro não pode gerenciar seu próprio código
- Admin precisa comunicar código manualmente
- Sem auditoria de quem alterou o código
- Impossível ter múltiplos parceiros no mesmo checkpoint

**Solução:**
- Adicionar coluna `partner_id` na tabela `route_checkpoints`
- Criar relacionamento com `institutional_partners` ou `commercial_partners`
- Permitir que parceiro veja/altere seu código no dashboard

---

### 2. **Validação de Código Apenas Client-Side**
**Severidade: CRÍTICA**

**Problema:**
```typescript
// src/services/passport/passportService.ts:489
const normalize = (value: string) => value.replace(/\s+/g, '').toUpperCase();
if (normalize(inputCode) !== normalize(expectedCode)) {
  // Validação apenas no cliente
}
```

**Impacto:**
- Código pode ser interceptado no tráfego
- Sem rate limiting adequado
- Vulnerável a brute force attacks
- Sem logging de tentativas falhas

**Solução:**
- Mover validação para função SQL server-side
- Implementar rate limiting por IP/usuário
- Adicionar logging de tentativas
- Implementar bloqueio temporário após X tentativas

---

### 3. **Falta de Rate Limiting**
**Severidade: MÉDIA**

**Problema:**
- Existe função `check_checkin_rate_limit` mas não é usada para validação de código
- Sem proteção contra brute force em códigos
- Turista pode tentar infinitas vezes

**Impacto:**
- Ataques de força bruta para descobrir códigos
- Sobrecarga do servidor
- Possível descoberta de códigos por tentativa e erro

**Solução:**
- Implementar rate limiting específico para validação de código
- Bloquear após 5 tentativas falhas em 15 minutos
- Adicionar CAPTCHA após 3 tentativas

---

### 4. **Código Armazenado em Texto Plano**
**Severidade: BAIXA-MÉDIA**

**Problema:**
- Código do parceiro armazenado em VARCHAR sem hash
- Se banco for comprometido, todos os códigos são expostos

**Impacto:**
- Se houver vazamento de dados, códigos ficam expostos
- Sem possibilidade de rotação de códigos

**Solução:**
- Considerar hash de códigos (mas pode complicar validação)
- Implementar rotação periódica de códigos
- Adicionar expiração de códigos

---

### 5. **Falta de Auditoria**
**Severidade: MÉDIA**

**Problema:**
- Sem log de quem alterou código do parceiro
- Sem histórico de tentativas de validação
- Sem rastreamento de check-ins suspeitos

**Impacto:**
- Impossível investigar fraudes
- Sem accountability
- Dificulta detecção de padrões suspeitos

**Solução:**
- Criar tabela `checkpoint_code_audit`
- Logar todas as alterações de código
- Logar tentativas de validação (sucesso/falha)

---

### 6. **Admin Pode Marcar Qualquer Checkpoint para Exigir Código**
**Severidade: BAIXA**

**Problema:**
- Admin pode marcar checkpoint para exigir código sem configurar parceiro
- Não há validação se checkpoint tem parceiro associado

**Impacto:**
- Checkpoints podem ficar inacessíveis se código não for configurado
- UX ruim para turistas

**Solução:**
- Validar se checkpoint tem parceiro antes de permitir `validation_mode = 'code'`
- Adicionar aviso no admin
- Permitir desativar código se parceiro não estiver configurado

---

## ✅ MELHORIAS PROPOSTAS

### 1. **Criar Relacionamento Checkpoint-Parceiro**

**Migration:**
```sql
-- Adicionar coluna partner_id
ALTER TABLE route_checkpoints
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES institutional_partners(id) ON DELETE SET NULL;

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_route_checkpoints_partner_id 
ON route_checkpoints(partner_id);

-- Atualizar comentário
COMMENT ON COLUMN route_checkpoints.partner_id IS 
'ID do parceiro responsável por este checkpoint. Se NULL, checkpoint não exige código de parceiro.';
```

---

### 2. **Função Server-Side para Validação de Código**

**Migration:**
```sql
CREATE OR REPLACE FUNCTION validate_partner_code(
  p_checkpoint_id UUID,
  p_code_input TEXT,
  p_user_id UUID,
  p_ip_address INET DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_checkpoint RECORD;
  v_attempts_count INTEGER;
  v_is_blocked BOOLEAN;
  v_code_match BOOLEAN;
  v_result JSONB;
BEGIN
  -- Buscar checkpoint
  SELECT * INTO v_checkpoint
  FROM route_checkpoints
  WHERE id = p_checkpoint_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Checkpoint não encontrado'
    );
  END IF;
  
  -- Verificar rate limiting (últimas 15 minutos)
  SELECT COUNT(*) INTO v_attempts_count
  FROM checkpoint_code_attempts
  WHERE checkpoint_id = p_checkpoint_id
    AND user_id = p_user_id
    AND created_at > NOW() - INTERVAL '15 minutes'
    AND success = false;
  
  -- Bloquear após 5 tentativas
  IF v_attempts_count >= 5 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Muitas tentativas. Aguarde 15 minutos.',
      'blocked', true
    );
  END IF;
  
  -- Normalizar e comparar códigos
  v_code_match := UPPER(TRIM(REPLACE(p_code_input, ' ', ''))) = 
                  UPPER(TRIM(REPLACE(v_checkpoint.partner_code, ' ', '')));
  
  -- Logar tentativa
  INSERT INTO checkpoint_code_attempts (
    checkpoint_id,
    user_id,
    code_input,
    success,
    ip_address
  ) VALUES (
    p_checkpoint_id,
    p_user_id,
    p_code_input,
    v_code_match,
    p_ip_address
  );
  
  -- Retornar resultado
  RETURN jsonb_build_object(
    'success', v_code_match,
    'blocked', false
  );
END;
$$;
```

---

### 3. **Tabela de Auditoria**

**Migration:**
```sql
CREATE TABLE IF NOT EXISTS checkpoint_code_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkpoint_id UUID NOT NULL REFERENCES route_checkpoints(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  code_input TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkpoint_code_attempts_checkpoint 
ON checkpoint_code_attempts(checkpoint_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_checkpoint_code_attempts_user 
ON checkpoint_code_attempts(user_id, created_at DESC);

COMMENT ON TABLE checkpoint_code_attempts IS 
'Log de todas as tentativas de validação de código de parceiro';
```

---

### 4. **Interface no Dashboard do Parceiro**

**Componente:** `PartnerCheckpointManager.tsx`

**Funcionalidades:**
- Listar checkpoints associados ao parceiro
- Ver código atual
- Gerar novo código
- Ver histórico de check-ins
- Ver estatísticas

---

### 5. **Melhorias no Admin**

**Alterações:**
- Adicionar campo "Parceiro" ao criar checkpoint
- Validar se parceiro foi selecionado antes de permitir `validation_mode = 'code'`
- Mostrar aviso se checkpoint exige código mas não tem parceiro

---

## 📊 PRIORIZAÇÃO

### 🔴 CRÍTICO (Fazer Imediatamente)
1. ✅ Validação server-side de código
2. ✅ Rate limiting e proteção contra brute force
3. ✅ Relacionamento checkpoint-parceiro

### 🟡 IMPORTANTE (Próxima Sprint)
4. ✅ Interface no dashboard do parceiro
5. ✅ Tabela de auditoria
6. ✅ Melhorias no admin

### 🟢 DESEJÁVEL (Backlog)
7. ⏳ Rotação periódica de códigos
8. ⏳ Hash de códigos (se necessário)
9. ⏳ CAPTCHA após tentativas

---

## 🔐 CHECKLIST DE SEGURANÇA

- [ ] Validação server-side implementada
- [ ] Rate limiting ativo
- [ ] Logging de tentativas
- [ ] Relacionamento checkpoint-parceiro criado
- [ ] Dashboard do parceiro funcional
- [ ] Validações no admin
- [ ] Testes de segurança realizados
- [ ] Documentação atualizada

---

## 📝 NOTAS

- Esta análise foi feita em 15/12/2025
- Revisar após implementação das correções
- Considerar pentest após correções críticas
