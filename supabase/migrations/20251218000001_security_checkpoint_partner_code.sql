-- Migration: Segurança e Relacionamento Checkpoint-Parceiro
-- Data: 2025-12-18
-- Descrição: Adiciona relacionamento checkpoint-parceiro, validação server-side e auditoria

-- ============================================
-- 1. ADICIONAR RELACIONAMENTO CHECKPOINT-PARCEIRO
-- ============================================

-- Adicionar coluna partner_id
ALTER TABLE route_checkpoints
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES institutional_partners(id) ON DELETE SET NULL;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_route_checkpoints_partner_id 
ON route_checkpoints(partner_id);

-- Comentário
COMMENT ON COLUMN route_checkpoints.partner_id IS 
'ID do parceiro responsável por este checkpoint. Se NULL, checkpoint não exige código de parceiro. Se definido, o parceiro pode gerenciar seu código no dashboard.';

-- ============================================
-- 2. CRIAR TABELA DE AUDITORIA DE TENTATIVAS
-- ============================================

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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_checkpoint_code_attempts_checkpoint 
ON checkpoint_code_attempts(checkpoint_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_checkpoint_code_attempts_user 
ON checkpoint_code_attempts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_checkpoint_code_attempts_success 
ON checkpoint_code_attempts(checkpoint_id, user_id, success, created_at DESC);

-- Comentários
COMMENT ON TABLE checkpoint_code_attempts IS 
'Log de todas as tentativas de validação de código de parceiro. Usado para rate limiting e auditoria de segurança.';

COMMENT ON COLUMN checkpoint_code_attempts.code_input IS 
'Código digitado pelo usuário (não armazenar em produção se houver preocupação com privacidade)';

COMMENT ON COLUMN checkpoint_code_attempts.success IS 
'TRUE se código estava correto, FALSE se incorreto';

-- RLS (Row Level Security)
ALTER TABLE checkpoint_code_attempts ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem ver tentativas
CREATE POLICY "Admins can view code attempts" ON checkpoint_code_attempts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

-- Política: Sistema pode inserir tentativas (via função)
CREATE POLICY "System can insert code attempts" ON checkpoint_code_attempts
  FOR INSERT
  WITH CHECK (true); -- Função SECURITY DEFINER vai inserir

-- ============================================
-- 3. FUNÇÃO SERVER-SIDE PARA VALIDAÇÃO DE CÓDIGO
-- ============================================

CREATE OR REPLACE FUNCTION validate_partner_code(
  p_checkpoint_id UUID,
  p_code_input TEXT,
  p_user_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_checkpoint RECORD;
  v_attempts_count INTEGER;
  v_code_match BOOLEAN;
  v_normalized_input TEXT;
  v_normalized_expected TEXT;
BEGIN
  -- 1. Buscar checkpoint
  SELECT 
    id,
    partner_code,
    validation_mode,
    partner_id
  INTO v_checkpoint
  FROM route_checkpoints
  WHERE id = p_checkpoint_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Checkpoint não encontrado',
      'blocked', false
    );
  END IF;
  
  -- 2. Verificar se checkpoint exige código
  IF v_checkpoint.validation_mode NOT IN ('code', 'mixed') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Este checkpoint não exige código de parceiro',
      'blocked', false
    );
  END IF;
  
  -- 3. Verificar se código está configurado
  IF v_checkpoint.partner_code IS NULL OR TRIM(v_checkpoint.partner_code) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Código do parceiro não configurado para este checkpoint',
      'blocked', false
    );
  END IF;
  
  -- 4. Verificar rate limiting (últimas 15 minutos)
  -- Contar tentativas falhas do mesmo usuário no mesmo checkpoint
  SELECT COUNT(*) INTO v_attempts_count
  FROM checkpoint_code_attempts
  WHERE checkpoint_id = p_checkpoint_id
    AND user_id = p_user_id
    AND created_at > NOW() - INTERVAL '15 minutes'
    AND success = false;
  
  -- Bloquear após 5 tentativas falhas
  IF v_attempts_count >= 5 THEN
    -- Logar tentativa bloqueada
    INSERT INTO checkpoint_code_attempts (
      checkpoint_id,
      user_id,
      code_input,
      success,
      ip_address,
      user_agent
    ) VALUES (
      p_checkpoint_id,
      p_user_id,
      p_code_input,
      false,
      p_ip_address,
      p_user_agent
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Muitas tentativas falhas. Aguarde 15 minutos antes de tentar novamente.',
      'blocked', true,
      'attempts_remaining', 0
    );
  END IF;
  
  -- 5. Normalizar e comparar códigos
  -- Remove espaços e converte para maiúsculas
  v_normalized_input := UPPER(TRIM(REPLACE(p_code_input, ' ', '')));
  v_normalized_expected := UPPER(TRIM(REPLACE(v_checkpoint.partner_code, ' ', '')));
  
  v_code_match := v_normalized_input = v_normalized_expected;
  
  -- 6. Logar tentativa (sempre, sucesso ou falha)
  INSERT INTO checkpoint_code_attempts (
    checkpoint_id,
    user_id,
    code_input,
    success,
    ip_address,
    user_agent
  ) VALUES (
    p_checkpoint_id,
    p_user_id,
    p_code_input,
    v_code_match,
    p_ip_address,
    p_user_agent
  );
  
  -- 7. Retornar resultado
  IF v_code_match THEN
    RETURN jsonb_build_object(
      'success', true,
      'error', NULL,
      'blocked', false,
      'attempts_remaining', GREATEST(0, 5 - v_attempts_count - 1)
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Código do parceiro inválido. Confirme o código no balcão.',
      'blocked', false,
      'attempts_remaining', GREATEST(0, 5 - v_attempts_count - 1)
    );
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, logar e retornar erro genérico
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Erro ao validar código. Tente novamente.',
      'blocked', false
    );
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION validate_partner_code IS 
'Valida código de parceiro de forma segura no servidor. Implementa rate limiting (5 tentativas em 15 minutos) e logging de todas as tentativas.';

-- ============================================
-- 4. FUNÇÃO PARA GERAR CÓDIGO ALEATÓRIO
-- ============================================

CREATE OR REPLACE FUNCTION generate_partner_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Gerar código no formato MS-XXXX onde XXXX são 4 dígitos aleatórios
    v_code := 'MS-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Verificar se código já existe
    SELECT EXISTS(
      SELECT 1 FROM route_checkpoints 
      WHERE partner_code = v_code
    ) INTO v_exists;
    
    -- Se não existe, retornar
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_code;
END;
$$;

COMMENT ON FUNCTION generate_partner_code IS 
'Gera código único de parceiro no formato MS-XXXX (ex: MS-4281)';

-- ============================================
-- 5. FUNÇÃO PARA OBTER ESTATÍSTICAS DE TENTATIVAS
-- ============================================

CREATE OR REPLACE FUNCTION get_checkpoint_code_stats(
  p_checkpoint_id UUID,
  p_hours INTEGER DEFAULT 24
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_attempts', COUNT(*),
    'successful_attempts', COUNT(*) FILTER (WHERE success = true),
    'failed_attempts', COUNT(*) FILTER (WHERE success = false),
    'unique_users', COUNT(DISTINCT user_id),
    'blocked_users', COUNT(DISTINCT user_id) FILTER (
      WHERE user_id IN (
        SELECT user_id
        FROM checkpoint_code_attempts
        WHERE checkpoint_id = p_checkpoint_id
          AND created_at > NOW() - INTERVAL '15 minutes'
          AND success = false
        GROUP BY user_id
        HAVING COUNT(*) >= 5
      )
    )
  ) INTO v_stats
  FROM checkpoint_code_attempts
  WHERE checkpoint_id = p_checkpoint_id
    AND created_at > NOW() - (p_hours || ' hours')::INTERVAL;
  
  RETURN COALESCE(v_stats, jsonb_build_object(
    'total_attempts', 0,
    'successful_attempts', 0,
    'failed_attempts', 0,
    'unique_users', 0,
    'blocked_users', 0
  ));
END;
$$;

COMMENT ON FUNCTION get_checkpoint_code_stats IS 
'Retorna estatísticas de tentativas de validação de código para um checkpoint';

-- ============================================
-- 6. TRIGGER PARA VALIDAR SE PARCEIRO FOI CONFIGURADO
-- ============================================

-- Função de validação
CREATE OR REPLACE FUNCTION validate_checkpoint_partner_config()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se validation_mode exige código mas não tem parceiro configurado
  IF NEW.validation_mode IN ('code', 'mixed') THEN
    IF (NEW.partner_code IS NULL OR TRIM(NEW.partner_code) = '') 
       AND NEW.partner_id IS NULL THEN
      RAISE WARNING 'Checkpoint exige código mas não tem parceiro ou código configurado. Turistas não conseguirão fazer check-in.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_validate_checkpoint_partner_config ON route_checkpoints;
CREATE TRIGGER trigger_validate_checkpoint_partner_config
  BEFORE INSERT OR UPDATE ON route_checkpoints
  FOR EACH ROW
  EXECUTE FUNCTION validate_checkpoint_partner_config();

-- ============================================
-- 7. ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ============================================

-- Índice composto para consultas de rate limiting
CREATE INDEX IF NOT EXISTS idx_checkpoint_code_attempts_rate_limit 
ON checkpoint_code_attempts(checkpoint_id, user_id, success, created_at DESC)
WHERE success = false;

-- ============================================
-- FIM DA MIGRATION
-- ============================================
