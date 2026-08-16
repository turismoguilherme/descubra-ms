// Itinerary types for tourism planning

export interface ItineraryPoint {
  id: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  type: 'attraction' | 'restaurant' | 'hotel' | 'transport' | 'activity';
  duration: number; // minutes
  cost?: number;
  rating?: number;
  order: number;
  // Additional compatibility properties
  priority?: string;
  estimatedTime?: number;
  estimatedCost?: number;
  day?: number;
}

export interface Itinerary {
  id: string;
  name: string;
  title?: string; // For compatibility
  description: string;
  duration: number; // days
  points: ItineraryPoint[];
  totalCost: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string[];
  created_at: string;
  updated_at: string;
  // Additional compatibility properties
  budget?: number;
  interests?: string[];
  startDate?: string;
  endDate?: string;
  attractions?: ItineraryPoint[];
  route?: ItineraryPoint[];
  status?: string;
  userId?: string;
}

export interface ItineraryRequest {
  destination: string;
  location?: string; // For compatibility
  duration: number;
  budget: number | string; // Allow both number and string for compatibility
  interests: string[];
  groupSize: number;
  accessibility: string[];
  startDate?: string; // For compatibility
}

// Additional types for compatibility
export interface ItineraryResponse {
  success: boolean;
  itinerary?: Itinerary;
  error?: string;
}

export interface DynamicItinerary extends Itinerary {
  adaptability: 'high' | 'medium' | 'low';
  alternatives: ItineraryPoint[];
}