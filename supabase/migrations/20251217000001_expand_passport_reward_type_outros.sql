-- Migration: permitir reward_type = 'outros' e 'avatar' em passport_rewards
-- Data: 2025-12-17

DO $$
BEGIN
  -- Nome padrão que o Postgres costuma gerar para CHECK inline:
  -- passport_rewards_reward_type_check
  ALTER TABLE passport_rewards
    DROP CONSTRAINT IF EXISTS passport_rewards_reward_type_check;

  -- Recriar constraint incluindo "outros" e "avatar"
  ALTER TABLE passport_rewards
    ADD CONSTRAINT passport_rewards_reward_type_check
    CHECK (reward_type IN ('desconto', 'brinde', 'experiencia', 'avatar', 'outros'));
END $$;

-- Adicionar campos para suporte a avatares do Pantanal
ALTER TABLE passport_rewards
  ADD COLUMN IF NOT EXISTS avatar_id UUID REFERENCES pantanal_avatars(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS max_avatars_per_route INTEGER DEFAULT 3;

COMMENT ON COLUMN passport_rewards.reward_type IS 'Tipo: desconto, brinde, experiencia, avatar, outros';
COMMENT ON COLUMN passport_rewards.avatar_id IS 'ID do avatar do Pantanal (quando reward_type = avatar)';
COMMENT ON COLUMN passport_rewards.max_avatars_per_route IS 'Máximo de avatares desbloqueáveis por rota (padrão: 3)';


