-- Migration: Create AI Prompt Configs table
-- Description: Stores editable prompts for Guatá and Koda chatbots

CREATE TABLE IF NOT EXISTS ai_prompt_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação
    chatbot_name TEXT NOT NULL CHECK (chatbot_name IN ('guata', 'koda')),
    prompt_type TEXT NOT NULL CHECK (prompt_type IN ('system', 'personality', 'instructions', 'rules', 'disclaimer')),
    
    -- Conteúdo
    content TEXT NOT NULL,
    variables JSONB DEFAULT '{}'::jsonb, -- Variáveis dinâmicas como {user_location}, {conversation_history}
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Metadados
    description TEXT,
    notes TEXT,
    
    -- Auditoria
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_prompt_configs_chatbot ON ai_prompt_configs(chatbot_name);
CREATE INDEX IF NOT EXISTS idx_prompt_configs_type ON ai_prompt_configs(prompt_type);
CREATE INDEX IF NOT EXISTS idx_prompt_configs_active ON ai_prompt_configs(is_active) WHERE is_active = true;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_ai_prompt_configs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_prompt_configs_timestamp
    BEFORE UPDATE ON ai_prompt_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_prompt_configs_timestamp();

-- RLS
ALTER TABLE ai_prompt_configs ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Allow public read access to active prompt configs"
    ON ai_prompt_configs
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage prompt configs"
    ON ai_prompt_configs
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Comentários
COMMENT ON TABLE ai_prompt_configs IS 'Stores editable prompts for Guatá and Koda chatbots';
COMMENT ON COLUMN ai_prompt_configs.chatbot_name IS 'Which chatbot: guata or koda';
COMMENT ON COLUMN ai_prompt_configs.prompt_type IS 'Type of prompt: system, personality, instructions, rules, disclaimer';
COMMENT ON COLUMN ai_prompt_configs.variables IS 'JSON object with available variables that can be used in the prompt';

