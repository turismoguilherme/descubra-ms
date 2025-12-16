-- Migration: permitir reward_type = 'outros' em passport_rewards
-- Data: 2025-12-17

DO $$
BEGIN
  -- Nome padrão que o Postgres costuma gerar para CHECK inline:
  -- passport_rewards_reward_type_check
  ALTER TABLE passport_rewards
    DROP CONSTRAINT IF EXISTS passport_rewards_reward_type_check;

  -- Recriar constraint incluindo "outros"
  ALTER TABLE passport_rewards
    ADD CONSTRAINT passport_rewards_reward_type_check
    CHECK (reward_type IN ('desconto', 'brinde', 'experiencia', 'outros'));
END $$;

COMMENT ON COLUMN passport_rewards.reward_type IS 'Tipo: desconto, brinde, experiencia, outros';


