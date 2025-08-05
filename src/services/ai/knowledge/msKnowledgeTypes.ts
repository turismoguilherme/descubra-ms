// Tipos para a base de conhecimento de Mato Grosso do Sul

export interface MSKnowledgeItem {
  id: string;
  category: 'restaurant' | 'agency' | 'attraction' | 'event' | 'hotel' | 'transport';
  name: string;
  location: string;
  description: string;
  contact?: string;
  website?: string;
  rating?: number;
  priceRange?: 'low' | 'medium' | 'high';
  specialties?: string[];
  lastUpdated: string;
  verified: boolean;
  isPartner?: boolean; // Prioridade para parceiros da plataforma (quando houver)
  cadasturCode?: string; // Código do Cadastur para agências
  tripAdvisorRating?: number; // Avaliação do TripAdvisor
} 