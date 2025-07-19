// Tipos para IA de Atendimento Presencial - Fase 4

export interface AttendanceAIMessage {
  id: string;
  type: 'tourist_message' | 'ai_response' | 'system_message';
  content: string;
  timestamp: string;
  language: string;
  touristId?: string;
  suggestions?: RouteSuggestion[];
  metadata?: {
    intent?: string;
    confidence?: number;
    entities?: any[];
    sentiment?: 'positive' | 'negative' | 'neutral';
  };
}

export interface TouristProfile {
  id: string;
  name: string;
  language: string;
  interests: string[];
  accessibility: string[];
  preferences: Record<string, any>;
  contact?: {
    email?: string;
    phone?: string;
    whatsapp?: string;
  };
  demographics?: {
    age?: number;
    country?: string;
    city?: string;
    travelGroup?: 'solo' | 'couple' | 'family' | 'group';
  };
  history?: {
    previousVisits?: number;
    favoriteDestinations?: string[];
    averageStay?: number;
    budget?: 'low' | 'medium' | 'high' | 'luxury';
  };
}

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  context?: string;
}

export interface RouteSuggestion {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'fácil' | 'moderado' | 'difícil';
  price: string;
  highlights: string[];
  accessibility: string[];
  languages: string[];
  images?: string[];
  rating?: number;
  reviews?: number;
  availability?: {
    startDate?: string;
    endDate?: string;
    maxCapacity?: number;
    currentBookings?: number;
  };
  requirements?: {
    age?: number;
    health?: string[];
    equipment?: string[];
    experience?: string;
  };
}

export interface AccessibilitySupport {
  type: 'wheelchair' | 'visual_impairment' | 'hearing_impairment' | 'mobility_assistance' | 'general';
  details: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  touristId?: string;
}

export interface BookingRequest {
  service: 'hotel' | 'restaurant' | 'transport' | 'activity' | 'guide';
  details: {
    destination?: string;
    date?: string;
    time?: string;
    people?: number;
    specialRequirements?: string[];
    budget?: number;
  };
  touristId?: string;
  preferredContact?: 'email' | 'sms' | 'whatsapp' | 'phone';
}

export interface BookingConfirmation {
  success: boolean;
  bookingId?: string;
  confirmation: string;
  details?: {
    service: string;
    date: string;
    time: string;
    location: string;
    price: number;
    contact: string;
  };
  nextSteps?: string[];
}

export interface AIConfiguration {
  // Configurações de tradução
  translation: {
    enabled: boolean;
    supportedLanguages: string[];
    defaultLanguage: string;
    fallbackLanguage: string;
    autoDetect: boolean;
  };
  
  // Configurações de roteiros
  routes: {
    enabled: boolean;
    maxSuggestions: number;
    categories: string[];
    durationOptions: string[];
    personalization: boolean;
  };
  
  // Configurações de acessibilidade
  accessibility: {
    enabled: boolean;
    supportedFeatures: string[];
    priorityLevels: string[];
    autoDetect: boolean;
  };
  
  // Configurações de reservas
  booking: {
    enabled: boolean;
    supportedServices: string[];
    confirmationMethods: string[];
    autoConfirm: boolean;
  };
  
  // Configurações gerais
  general: {
    responseTimeout: number;
    maxConversationLength: number;
    enableLogging: boolean;
    enableAnalytics: boolean;
  };
}

export interface AIStats {
  totalConversations: number;
  totalTourists: number;
  averageResponseTime: number;
  translationUsage: {
    total: number;
    byLanguage: Record<string, number>;
  };
  routeSuggestions: {
    total: number;
    accepted: number;
    byCategory: Record<string, number>;
  };
  accessibilitySupport: {
    total: number;
    byType: Record<string, number>;
  };
  bookingAssistance: {
    total: number;
    successful: number;
    byService: Record<string, number>;
  };
  uptime: {
    total: number;
    current: number;
    percentage: number;
  };
}

export interface ConversationSession {
  id: string;
  touristId: string;
  startTime: string;
  endTime?: string;
  messages: AttendanceAIMessage[];
  summary?: {
    topics: string[];
    intent: string;
    satisfaction?: number;
    followUp?: string;
  };
}

export interface LanguageDetectionResult {
  detectedLanguage: string;
  confidence: number;
  alternatives?: Array<{
    language: string;
    confidence: number;
  }>;
}

export interface IntentAnalysisResult {
  intent: string;
  confidence: number;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  sentiment: 'positive' | 'negative' | 'neutral';
  suggestions?: string[];
}

export interface RoutePersonalizationData {
  touristId: string;
  interests: string[];
  preferences: {
    budget: 'low' | 'medium' | 'high' | 'luxury';
    duration: string;
    difficulty: 'fácil' | 'moderado' | 'difícil';
    groupSize: number;
    accessibility: string[];
  };
  history: {
    previousRoutes: string[];
    ratings: Record<string, number>;
    feedback: Record<string, string>;
  };
}

export interface AccessibilityFeature {
  type: string;
  name: string;
  description: string;
  availability: boolean;
  details?: string;
  contact?: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  type: 'hotel' | 'restaurant' | 'transport' | 'activity' | 'guide';
  location: string;
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  accessibility: string[];
  languages: string[];
  rating: number;
  priceRange: string;
  availability: boolean;
}

export interface EmergencyContact {
  type: 'police' | 'hospital' | 'fire' | 'tourism' | 'general';
  name: string;
  phone: string;
  description: string;
  location?: string;
  available24h: boolean;
}

export interface AINotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionRequired?: boolean;
  actions?: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
}

export interface AILogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  context?: {
    touristId?: string;
    sessionId?: string;
    action?: string;
    data?: any;
  };
  performance?: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

// Tipos para integração com ALUMIA (futuro)
export interface AlumiaIntegration {
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  endpoints: {
    destinations: string;
    events: string;
    bookings: string;
    analytics: string;
  };
  syncInterval: number; // em minutos
  lastSync?: string;
  status: 'connected' | 'disconnected' | 'error';
}

export interface AlumiaDestination {
  id: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
  };
  category: string;
  rating: number;
  price: string;
  images: string[];
  availability: boolean;
  accessibility: string[];
  languages: string[];
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  operatingHours: {
    open: string;
    close: string;
    days: string[];
  };
  capacity: {
    max: number;
    current: number;
  };
}

export interface AlumiaEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  price: number;
  capacity: number;
  registered: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  organizer: string;
  contact: {
    phone: string;
    email: string;
  };
  images: string[];
  tags: string[];
}

export interface AlumiaBooking {
  id: string;
  touristId: string;
  serviceType: 'destination' | 'event' | 'transport' | 'accommodation';
  serviceId: string;
  date: string;
  time?: string;
  people: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialRequirements?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AlumiaAnalytics {
  period: string;
  totalVisitors: number;
  totalBookings: number;
  totalRevenue: number;
  popularDestinations: Array<{
    id: string;
    name: string;
    visitors: number;
    revenue: number;
  }>;
  popularEvents: Array<{
    id: string;
    name: string;
    attendees: number;
    revenue: number;
  }>;
  visitorDemographics: {
    byCountry: Record<string, number>;
    byAge: Record<string, number>;
    byLanguage: Record<string, number>;
  };
  bookingTrends: Array<{
    date: string;
    bookings: number;
    revenue: number;
  }>;
} 