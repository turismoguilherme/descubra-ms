-- Create report_categories table
CREATE TABLE report_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#3B82F6',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create report_templates table
CREATE TABLE report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL REFERENCES report_categories(name),
    data_source TEXT NOT NULL, -- Table or view name
    fields JSONB NOT NULL, -- Array of ReportField objects
    filters JSONB NOT NULL, -- Array of ReportFilter objects
    chart_config JSONB NOT NULL, -- ChartConfig object
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    is_public BOOLEAN DEFAULT FALSE
);

-- Create report_data table
CREATE TABLE report_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES report_templates(id),
    name TEXT NOT NULL,
    parameters JSONB NOT NULL, -- User input parameters
    data JSONB NOT NULL, -- Generated report data
    generated_at TIMESTAMP WITH TIME ZONE,
    generated_by UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
    file_url TEXT, -- URL to exported file (PDF, Excel, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create report_schedules table
CREATE TABLE report_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES report_templates(id),
    name TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
    time TEXT NOT NULL, -- HH:MM format
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0-6 for weekly
    day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31), -- 1-31 for monthly
    recipients TEXT[] NOT NULL, -- Array of email addresses
    is_active BOOLEAN DEFAULT TRUE,
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- RLS for report_categories (read-only for public)
ALTER TABLE report_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone."
  ON report_categories FOR SELECT USING (TRUE);

-- RLS for report_templates
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public templates are viewable by everyone."
  ON report_templates FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Users can view their own templates."
  ON report_templates FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create their own templates."
  ON report_templates FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own templates."
  ON report_templates FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own templates."
  ON report_templates FOR DELETE USING (auth.uid() = created_by);

-- RLS for report_data
ALTER TABLE report_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own reports."
  ON report_data FOR SELECT USING (auth.uid() = generated_by);
CREATE POLICY "Users can create their own reports."
  ON report_data FOR INSERT WITH CHECK (auth.uid() = generated_by);
CREATE POLICY "Users can update their own reports."
  ON report_data FOR UPDATE USING (auth.uid() = generated_by);
CREATE POLICY "Users can delete their own reports."
  ON report_data FOR DELETE USING (auth.uid() = generated_by);

-- RLS for report_schedules
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own schedules."
  ON report_schedules FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create their own schedules."
  ON report_schedules FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own schedules."
  ON report_schedules FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own schedules."
  ON report_schedules FOR DELETE USING (auth.uid() = created_by);

-- Insert default categories
INSERT INTO report_categories (id, name, description, icon, color, order_index) VALUES
('1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a', 'Inventário', 'Relatórios de inventário turístico', 'Package', '#10B981', 1),
('2a2a2a2a-2a2a-2a2a-2a2a-2a2a2a2a2a2a', 'Analytics', 'Relatórios de análise e métricas', 'BarChart', '#3B82F6', 2),
('3a3a3a3a-3a3a-3a3a-3a3a-3a3a3a3a3a3a', 'Performance', 'Relatórios de performance e KPIs', 'TrendingUp', '#F59E0B', 3),
('4a4a4a4a-4a4a-4a4a-4a4a-4a4a4a4a4a4a', 'Custom', 'Relatórios personalizados', 'Settings', '#8B5CF6', 4);

-- Insert default templates
INSERT INTO report_templates (id, name, description, category, data_source, fields, filters, chart_config, is_public, created_by) VALUES
('1b1b1b1b-1b1b-1b1b-1b1b-1b1b1b1b1b1b', 'Inventário por Categoria', 'Relatório de itens do inventário agrupados por categoria', 'Inventário', 'tourism_inventory', 
 '[{"id":"name","name":"name","label":"Nome","type":"string","required":true,"order":1},{"id":"category","name":"category","label":"Categoria","type":"string","required":true,"order":2},{"id":"average_rating","name":"average_rating","label":"Avaliação Média","type":"number","aggregation":"avg","required":false,"order":3}]',
 '[{"id":"category_filter","field":"category_id","label":"Categoria","type":"select","required":false},{"id":"rating_filter","field":"average_rating","label":"Avaliação Mínima","type":"number_range","required":false}]',
 '{"type":"bar","title":"Inventário por Categoria","x_axis":"category","y_axis":"count","show_legend":true,"show_data_labels":true}',
 true, null),

('2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b', 'Avaliações e Reviews', 'Análise de avaliações e reviews dos itens do inventário', 'Analytics', 'inventory_reviews',
 '[{"id":"inventory_name","name":"inventory_name","label":"Item","type":"string","required":true,"order":1},{"id":"rating","name":"rating","label":"Avaliação","type":"number","required":true,"order":2},{"id":"comment","name":"comment","label":"Comentário","type":"string","required":false,"order":3}]',
 '[{"id":"rating_range","field":"rating","label":"Faixa de Avaliação","type":"number_range","required":false},{"id":"date_range","field":"created_at","label":"Período","type":"date_range","required":false}]',
 '{"type":"pie","title":"Distribuição de Avaliações","show_legend":true,"show_data_labels":true}',
 true, null),

('3b3b3b3b-3b3b-3b3b-3b3b-3b3b3b3b3b3b', 'Performance Mensal', 'Relatório de performance mensal do inventário', 'Performance', 'tourism_inventory',
 '[{"id":"month","name":"month","label":"Mês","type":"date","required":true,"order":1},{"id":"total_items","name":"total_items","label":"Total de Itens","type":"number","aggregation":"count","required":true,"order":2},{"id":"avg_rating","name":"avg_rating","label":"Avaliação Média","type":"number","aggregation":"avg","required":true,"order":3}]',
 '[{"id":"year_filter","field":"year","label":"Ano","type":"select","options":["2024","2025"],"required":true},{"id":"category_filter","field":"category_id","label":"Categoria","type":"select","required":false}]',
 '{"type":"line","title":"Performance Mensal","x_axis":"month","y_axis":"total_items","show_legend":true,"show_data_labels":false}',
 true, null);
