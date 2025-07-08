
export interface Collaborator {
  id: string;
  name: string;
  email: string;
  position: string;
  role: string;
  city: string;
  is_active?: boolean;
  manager_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CollaboratorFormData {
  name: string;
  email: string;
  position: string;
  role: string;
  city: string;
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

// Constantes de cidades
export const cities = [
  'Campo Grande',
  'Dourados',
  'Três Lagoas',
  'Corumbá',
  'Ponta Porã',
  'Aquidauana',
  'Coxim',
  'Nova Andradina',
  'Paranaíba',
  'Bonito',
  'Naviraí',
  'Miranda',
  'Jardim',
  'Sidrolândia',
  'Maracaju',
];
