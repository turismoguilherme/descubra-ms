
// Tipos para as funcionalidades municipais

export interface SecretaryFile {
  id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  file_type: string;
  category?: string;
  description?: string;
  city?: string;
  is_public?: boolean;
  uploaded_by: string;
  uploader_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  objective: string;
  questions: any; // JSONB
  city?: string;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  respondent_name?: string;
  respondent_email?: string;
  responses: any; // JSONB
  location?: string;
  created_at?: string;
}
