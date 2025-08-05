export interface Reservation {
  id: string;
  userId: string;
  partnerId: string;
  serviceType: 'hotel' | 'restaurant' | 'tour' | 'transport' | 'attraction';
  serviceName: string;
  date: string;
  time?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  details: {
    guests?: number;
    specialRequests?: string;
    contactPhone?: string;
    totalPrice?: number;
    currency?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Partner {
  id: string;
  name: string;
  type: 'hotel' | 'restaurant' | 'tour' | 'transport' | 'attraction';
  location: string;
  description: string;
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  availability: {
    days: string[];
    hours: string;
  };
  pricing: {
    minPrice: number;
    maxPrice: number;
    currency: string;
  };
  isActive: boolean;
}

export interface ReservationRequest {
  partnerId: string;
  serviceType: Reservation['serviceType'];
  date: string;
  time?: string;
  guests?: number;
  specialRequests?: string;
  contactPhone?: string;
}

export interface ReservationResponse {
  success: boolean;
  reservation?: Reservation;
  error?: string;
  message?: string;
} 