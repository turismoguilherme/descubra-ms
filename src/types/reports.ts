export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'inventory' | 'analytics' | 'performance' | 'custom';
  data_source: string;
  fields: ReportField[];
  filters: ReportFilter[];
  chart_config: ChartConfig;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_public: boolean;
}

export interface ReportField {
  id: string;
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'currency';
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  format?: string;
  required: boolean;
  order: number;
}

export interface ReportFilter {
  id: string;
  field: string;
  label: string;
  type: 'select' | 'date_range' | 'text' | 'number_range' | 'boolean';
  options?: string[];
  default_value?: any;
  required: boolean;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'table';
  title: string;
  x_axis?: string;
  y_axis?: string;
  colors?: string[];
  show_legend: boolean;
  show_data_labels: boolean;
}

export interface ReportData {
  id: string;
  template_id: string;
  name: string;
  parameters: Record<string, any>;
  data: any[];
  generated_at: string;
  generated_by: string;
  status: 'generating' | 'completed' | 'failed';
  file_url?: string;
}

export interface ReportSchedule {
  id: string;
  template_id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string; // HH:MM format
  day_of_week?: number; // 0-6 for weekly
  day_of_month?: number; // 1-31 for monthly
  recipients: string[];
  is_active: boolean;
  last_run?: string;
  next_run: string;
  created_at: string;
  created_by: string;
}

export interface ReportCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}
