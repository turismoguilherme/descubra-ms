CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('metrics', 'financial')),
  analysis_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  insights TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_ai_analyses_type_created ON ai_analyses(type, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_seo_improvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('event', 'destination')),
  content_id UUID NOT NULL,
  improvements JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo_analysis TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  applied_at TIMESTAMPTZ,
  applied_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_ai_seo_improvements_content ON ai_seo_improvements(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_ai_seo_improvements_status ON ai_seo_improvements(status);
CREATE INDEX IF NOT EXISTS idx_ai_seo_improvements_priority ON ai_seo_improvements(priority, status);

CREATE TABLE IF NOT EXISTS ai_auto_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  approval_reason TEXT NOT NULL,
  rules_applied JSONB DEFAULT '{}'::jsonb,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_auto_approvals_event ON ai_auto_approvals(event_id);
CREATE INDEX IF NOT EXISTS idx_ai_auto_approvals_created ON ai_auto_approvals(created_at DESC);

ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_seo_improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_auto_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view ai_analyses" ON ai_analyses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

CREATE POLICY "Admins can insert ai_analyses" ON ai_analyses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

CREATE POLICY "Admins can view ai_seo_improvements" ON ai_seo_improvements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

CREATE POLICY "Admins can insert ai_seo_improvements" ON ai_seo_improvements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

CREATE POLICY "Admins can update ai_seo_improvements" ON ai_seo_improvements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

CREATE POLICY "Admins can view ai_auto_approvals" ON ai_auto_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

CREATE POLICY "Admins can insert ai_auto_approvals" ON ai_auto_approvals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );


