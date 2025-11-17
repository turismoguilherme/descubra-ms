-- Migration: Create tables for ViaJAR retention features
-- Notifications, Evolution History, Goals Tracking, Weekly Insights

-- Tabela de Notificações Proativas
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('warning', 'info', 'success', 'critical')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('revenue', 'occupancy', 'market', 'competition', 'growth')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    action_url TEXT,
    action_label TEXT,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_acknowledged ON user_notifications(user_id, acknowledged);
CREATE INDEX idx_user_notifications_created_at ON user_notifications(created_at DESC);

-- Tabela de Histórico de Evolução do Negócio
CREATE TABLE IF NOT EXISTS business_evolution_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    score NUMERIC(5,2) NOT NULL,
    roi NUMERIC(5,2) NOT NULL,
    recommendations_count INTEGER NOT NULL DEFAULT 0,
    growth_potential NUMERIC(5,2) NOT NULL,
    metrics JSONB DEFAULT '{}'::jsonb,
    analysis_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_business_evolution_user_id ON business_evolution_history(user_id);
CREATE INDEX idx_business_evolution_date ON business_evolution_history(user_id, date DESC);

-- Tabela de Metas do Negócio
CREATE TABLE IF NOT EXISTS business_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('revenue', 'occupancy', 'rating', 'growth', 'marketing', 'operations')),
    target_value NUMERIC(10,2) NOT NULL,
    current_value NUMERIC(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL DEFAULT '%',
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    progress NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_business_goals_user_id ON business_goals(user_id);
CREATE INDEX idx_business_goals_status ON business_goals(user_id, status);
CREATE INDEX idx_business_goals_deadline ON business_goals(deadline);

-- Tabela de Log de Insights Semanais
CREATE TABLE IF NOT EXISTS weekly_insights_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week VARCHAR(10) NOT NULL, -- Formato: YYYY-WW
    insights_data JSONB NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, week)
);

CREATE INDEX idx_weekly_insights_user_id ON weekly_insights_log(user_id);
CREATE INDEX idx_weekly_insights_week ON weekly_insights_log(week);

-- Row Level Security Policies
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_evolution_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_insights_log ENABLE ROW LEVEL SECURITY;

-- Policies para user_notifications
CREATE POLICY "Users can view their own notifications"
    ON user_notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON user_notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Policies para business_evolution_history
CREATE POLICY "Users can view their own evolution history"
    ON business_evolution_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own evolution history"
    ON business_evolution_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policies para business_goals
CREATE POLICY "Users can manage their own goals"
    ON business_goals FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies para weekly_insights_log
CREATE POLICY "Users can view their own weekly insights"
    ON weekly_insights_log FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly insights"
    ON weekly_insights_log FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_notifications_updated_at BEFORE UPDATE ON user_notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_goals_updated_at BEFORE UPDATE ON business_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

