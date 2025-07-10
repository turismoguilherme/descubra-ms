
export interface Collaborator {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  role: string;
  department?: string;
  city_id: string; // Trocado de municipality para city_id
  region?: string;
  status?: string;
  permissions?: any;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CollaboratorFormData {
  name: string;
  email: string;
  position: string;
  role: string;
  // O campo municipality foi removido
}

// Constantes de papéis/funções
export const roles = [
  { value: 'coordenador', label: 'Coordenador de Turismo' },
  { value: 'atendente_cat', label: 'Atendente CAT' },
  { value: 'pesquisador', label: 'Pesquisador' },
  { value: 'gestor', label: 'Gestor Municipal' },
  { value: 'analista', label: 'Analista de Turismo' },
  { value: 'guia', label: 'Guia Turístico' },
];

// A lista de cidades hardcoded foi removida para usar dados do banco de dados.
