export interface DynamicItinerary {
  id: string;
  userId: string;
  title: string;
  duration: number; // dias
  interests: string[];
  budget: 'budget' | 'moderate' | 'luxury';
  startDate: string;
  endDate: string;
  attractions: ItineraryAttraction[];
  route: RoutePoint[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryAttraction {
  id: string;
  name: string;
  type: 'attraction' | 'restaurant' | 'hotel' | 'transport';
  location: string;
  description: string;
  estimatedTime: number; // horas
  estimatedCost: number;
  priority: 'must' | 'should' | 'optional';
  day: number;
  order: number;
}

export interface RoutePoint {
  id: string;
  name: string;
  type: 'start' | 'attraction' | 'restaurant' | 'hotel' | 'transport' | 'end';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  estimatedTime: number; // minutos
  estimatedCost: number;
  day: number;
  order: number;
  notes?: string;
}

export interface ItineraryRequest {
  duration: number;
  interests: string[];
  budget: 'budget' | 'moderate' | 'luxury';
  startDate: string;
  location: string;
  groupSize?: number;
  specialRequirements?: string[];
}

export interface ItineraryResponse {
  success: boolean;
  itinerary?: DynamicItinerary;
  error?: string;
  message?: string;
} 