export interface SecretaryFile {
  id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  category?: string;
  description?: string;
  uploaded_by?: string;
  uploaded_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface FileUploadData {
  file: File;
  category: string;
  description: string;
}