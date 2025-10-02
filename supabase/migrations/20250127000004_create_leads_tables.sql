-- Create lead_sources table
CREATE TABLE lead_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lead_statuses table
CREATE TABLE lead_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6B7280',
    order_index INTEGER DEFAULT 0,
    is_final BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lead_priorities table
CREATE TABLE lead_priorities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#F59E0B',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lead_pipelines table
CREATE TABLE lead_pipelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create lead_pipeline_stages table
CREATE TABLE lead_pipeline_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_id UUID REFERENCES lead_pipelines(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    color TEXT DEFAULT '#6B7280',
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    source_id UUID REFERENCES lead_sources(id),
    status_id UUID REFERENCES lead_statuses(id),
    priority_id UUID REFERENCES lead_priorities(id),
    assigned_to UUID REFERENCES auth.users(id),
    value NUMERIC(12, 2),
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_follow_up TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create lead_activities table
CREATE TABLE lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'task', 'status_change')),
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER, -- in minutes
    outcome TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lead_sources (read-only for all users)
CREATE POLICY "Lead sources are viewable by everyone"
  ON lead_sources FOR SELECT USING (TRUE);

-- RLS Policies for lead_statuses (read-only for all users)
CREATE POLICY "Lead statuses are viewable by everyone"
  ON lead_statuses FOR SELECT USING (TRUE);

-- RLS Policies for lead_priorities (read-only for all users)
CREATE POLICY "Lead priorities are viewable by everyone"
  ON lead_priorities FOR SELECT USING (TRUE);

-- RLS Policies for lead_pipelines
CREATE POLICY "Lead pipelines are viewable by everyone"
  ON lead_pipelines FOR SELECT USING (TRUE);
CREATE POLICY "Users can create lead pipelines"
  ON lead_pipelines FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own lead pipelines"
  ON lead_pipelines FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own lead pipelines"
  ON lead_pipelines FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for lead_pipeline_stages
CREATE POLICY "Lead pipeline stages are viewable by everyone"
  ON lead_pipeline_stages FOR SELECT USING (TRUE);
CREATE POLICY "Users can create lead pipeline stages"
  ON lead_pipeline_stages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM lead_pipelines WHERE id = pipeline_id AND created_by = auth.uid())
  );
CREATE POLICY "Users can update lead pipeline stages"
  ON lead_pipeline_stages FOR UPDATE USING (
    EXISTS (SELECT 1 FROM lead_pipelines WHERE id = pipeline_id AND created_by = auth.uid())
  );
CREATE POLICY "Users can delete lead pipeline stages"
  ON lead_pipeline_stages FOR DELETE USING (
    EXISTS (SELECT 1 FROM lead_pipelines WHERE id = pipeline_id AND created_by = auth.uid())
  );

-- RLS Policies for leads
CREATE POLICY "Users can view their own leads"
  ON leads FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can view leads assigned to them"
  ON leads FOR SELECT USING (auth.uid() = assigned_to);
CREATE POLICY "Users can create leads"
  ON leads FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own leads"
  ON leads FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can update leads assigned to them"
  ON leads FOR UPDATE USING (auth.uid() = assigned_to);
CREATE POLICY "Users can delete their own leads"
  ON leads FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for lead_activities
CREATE POLICY "Users can view activities for their leads"
  ON lead_activities FOR SELECT USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM leads WHERE id = lead_id AND (created_by = auth.uid() OR assigned_to = auth.uid()))
  );
CREATE POLICY "Users can create activities for their leads"
  ON lead_activities FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (SELECT 1 FROM leads WHERE id = lead_id AND (created_by = auth.uid() OR assigned_to = auth.uid()))
  );
CREATE POLICY "Users can update their own activities"
  ON lead_activities FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own activities"
  ON lead_activities FOR DELETE USING (auth.uid() = created_by);

-- Create indexes for better performance
CREATE INDEX idx_leads_created_by ON leads(created_by);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_status_id ON leads(status_id);
CREATE INDEX idx_leads_source_id ON leads(source_id);
CREATE INDEX idx_leads_priority_id ON leads(priority_id);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_date ON lead_activities(date);
CREATE INDEX idx_lead_pipeline_stages_pipeline_id ON lead_pipeline_stages(pipeline_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default data
INSERT INTO lead_sources (id, name, description, color) VALUES
('1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a', 'Website', 'Leads from website contact forms', '#3B82F6'),
('2a2a2a2a-2a2a-2a2a-2a2a-2a2a2a2a2a2a', 'Email', 'Leads from email campaigns', '#10B981'),
('3a3a3a3a-3a3a-3a3a-3a3a-3a3a3a3a3a3a', 'Phone', 'Leads from phone calls', '#F59E0B'),
('4a4a4a4a-4a4a-4a4a-4a4a-4a4a4a4a4a4a', 'Social Media', 'Leads from social media platforms', '#8B5CF6'),
('5a5b5c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d', 'Referral', 'Leads from referrals', '#EF4444'),
('6a6b6c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d', 'Event', 'Leads from events and conferences', '#06B6D4'),
('7a7b7c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d', 'Cold Outreach', 'Leads from cold outreach', '#84CC16'),
('8a8b8c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d', 'Other', 'Leads from other sources', '#6B7280');

INSERT INTO lead_statuses (id, name, description, color, order_index, is_final) VALUES
('1b1b1b1b-1b1b-1b1b-1b1b-1b1b1b1b1b1b', 'New', 'Newly created lead', '#6B7280', 1, FALSE),
('2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b', 'Contacted', 'Initial contact made', '#3B82F6', 2, FALSE),
('3b3b3b3b-3b3b-3b3b-3b3b-3b3b3b3b3b3b', 'Qualified', 'Lead qualified as potential customer', '#10B981', 3, FALSE),
('4b4b4b4b-4b4b-4b4b-4b4b-4b4b4b4b4b4b', 'Proposal', 'Proposal sent to lead', '#F59E0B', 4, FALSE),
('5b5b5b5b-5b5b-5b5b-5b5b-5b5b5b5b5b5b', 'Negotiation', 'In negotiation phase', '#8B5CF6', 5, FALSE),
('6b6b6b6b-6b6b-6b6b-6b6b-6b6b6b6b6b6b', 'Won', 'Lead converted to customer', '#059669', 6, TRUE),
('7b7b7b7b-7b7b-7b7b-7b7b-7b7b7b7b7b7b', 'Lost', 'Lead lost or disqualified', '#DC2626', 7, TRUE);

INSERT INTO lead_priorities (id, name, description, color, order_index) VALUES
('1c1c1c1c-1c1c-1c1c-1c1c-1c1c1c1c1c1c', 'Low', 'Low priority lead', '#6B7280', 1),
('2c2c2c2c-2c2c-2c2c-2c2c-2c2c2c2c2c2c', 'Medium', 'Medium priority lead', '#F59E0B', 2),
('3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c3c', 'High', 'High priority lead', '#EF4444', 3),
('4c4c4c4c-4c4c-4c4c-4c4c-4c4c4c4c4c4c', 'Urgent', 'Urgent priority lead', '#DC2626', 4);

-- Create default pipeline
INSERT INTO lead_pipelines (id, name, description, is_default, is_active, created_by) VALUES
('1d1d1d1d-1d1d-1d1d-1d1d-1d1d1d1d1d1d', 'Default Sales Pipeline', 'Standard sales process pipeline', TRUE, TRUE, NULL);

-- Create default pipeline stages
INSERT INTO lead_pipeline_stages (id, pipeline_id, name, description, order_index, color, probability) VALUES
('1e1e1e1e-1e1e-1e1e-1e1e-1e1e1e1e1e1e', '1d1d1d1d-1d1d-1d1d-1d1d-1d1d1d1d1d1d', 'Lead', 'New lead', 1, '#6B7280', 10),
('2e2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e', '1d1d1d1d-1d1d-1d1d-1d1d-1d1d1d1d1d1d', 'Contacted', 'Initial contact made', 2, '#3B82F6', 20),
('3e3e3e3e-3e3e-3e3e-3e3e-3e3e3e3e3e3e', '1d1d1d1d-1d1d-1d1d-1d1d-1d1d1d1d1d1d', 'Qualified', 'Lead qualified', 3, '#10B981', 40),
('4e4e4e4e-4e4e-4e4e-4e4e-4e4e4e4e4e4e', '1d1d1d1d-1d1d-1d1d-1d1d-1d1d1d1d1d1d', 'Proposal', 'Proposal sent', 4, '#F59E0B', 60),
('5e5e5e5e-5e5e-5e5e-5e5e-5e5e5e5e5e5e', '1d1d1d1d-1d1d-1d1d-1d1d-1d1d1d1d1d1d', 'Negotiation', 'In negotiation', 5, '#8B5CF6', 80),
('6e6e6e6e-6e6e-6e6e-6e6e-6e6e6e6e6e6e', '1d1d1d1d-1d1d-1d1d-1d1d-1d1d1d1d1d1d', 'Closed Won', 'Deal closed successfully', 6, '#059669', 100),
('7e7e7e7e-7e7e-7e7e-7e7e-7e7e7e7e7e7e', '1d1d1d1d-1d1d-1d1d-1d1d-1d1d1d1d1d1d', 'Closed Lost', 'Deal lost', 7, '#DC2626', 0);
