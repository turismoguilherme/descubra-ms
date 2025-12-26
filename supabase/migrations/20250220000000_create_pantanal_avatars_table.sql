-- Migration: Create Pantanal Avatars Table
-- Description: Table for managing Pantanal animal avatars with all information fields

-- ============================================
-- PANTANAL AVATARS
-- ============================================
CREATE TABLE IF NOT EXISTS pantanal_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  scientific_name TEXT,
  description TEXT,
  image_url TEXT,
  habitat TEXT,
  diet TEXT,
  curiosities TEXT[] DEFAULT '{}',
  is_unlocked BOOLEAN DEFAULT true,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  unlock_requirement TEXT,
  personality_traits TEXT[] DEFAULT '{}',
  personality_why TEXT,
  threats TEXT[] DEFAULT '{}',
  conservation_actions TEXT[] DEFAULT '{}',
  ecosystem_importance TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pantanal_avatars_rarity ON pantanal_avatars(rarity);
CREATE INDEX IF NOT EXISTS idx_pantanal_avatars_is_active ON pantanal_avatars(is_active);
CREATE INDEX IF NOT EXISTS idx_pantanal_avatars_display_order ON pantanal_avatars(display_order);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_pantanal_avatars_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pantanal_avatars_updated_at
    BEFORE UPDATE ON pantanal_avatars
    FOR EACH ROW
    EXECUTE FUNCTION update_pantanal_avatars_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE pantanal_avatars ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read active avatars
CREATE POLICY "Public can view active avatars"
    ON pantanal_avatars FOR SELECT
    USING (is_active = true);

-- Policy: Admins can manage all avatars
CREATE POLICY "Admins can manage pantanal_avatars"
    ON pantanal_avatars FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'tech', 'master_admin')
        )
    );

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE pantanal_avatars IS 'Tabela para gerenciar avatares de animais do Pantanal';
COMMENT ON COLUMN pantanal_avatars.rarity IS 'Raridade do avatar: common, rare, epic, legendary';
COMMENT ON COLUMN pantanal_avatars.personality_traits IS 'Array de traços de personalidade associados ao avatar';
COMMENT ON COLUMN pantanal_avatars.personality_why IS 'Explicação de por que escolher este avatar';
COMMENT ON COLUMN pantanal_avatars.threats IS 'Array de principais ameaças à espécie';
COMMENT ON COLUMN pantanal_avatars.conservation_actions IS 'Array de ações de conservação';
COMMENT ON COLUMN pantanal_avatars.ecosystem_importance IS 'Importância da espécie no ecossistema';
