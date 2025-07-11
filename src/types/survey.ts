export interface Survey {
  id: string;
  title: string;
  description?: string;
  objective: string;
  questions: any;
  status?: string;
  start_date?: string;
  end_date?: string;
  target_audience?: string;
  responses_count?: number;
  region?: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface SurveyFormData {
  title: string;
  description: string;
  objective: string;
  questions: any;
  target_audience: string;
  start_date: string;
  end_date: string;
}