// Tipos para APIs Governamentais - Fase 3

export interface GovernmentAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
  source: string;
}

export interface TourismData {
  id: string;
  name: string;
  type: 'destination' | 'event' | 'attraction';
  state: string;
  category: string;
  rating: number;
  visitors: number;
  lastUpdate: string;
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  images?: string[];
  contact?: {
    phone: string;
    email: string;
    website: string;
  };
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  forecast: WeatherForecast[];
  lastUpdate: string;
  location?: {
    city: string;
    state: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface WeatherForecast {
  day: string;
  max: number;
  min: number;
  condition: string;
  precipitation?: number;
  windSpeed?: number;
}

export interface EventData {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  capacity?: number;
  registeredAttendees?: number;
  price?: number;
  organizer: string;
  contact?: {
    phone: string;
    email: string;
    website: string;
  };
  images?: string[];
  tags?: string[];
}

export interface TransportData {
  id: string;
  type: 'bus' | 'train' | 'plane' | 'boat';
  company: string;
  origin: string;
  destination: string;
  duration: string;
  price: number;
  schedule: string;
  availableSeats?: number;
  status: 'available' | 'full' | 'cancelled';
  departureTime: string;
  arrivalTime: string;
  stops?: string[];
  amenities?: string[];
}

export interface PopulationData {
  municipality: string;
  population: number;
  area: number;
  density: number;
  lastCensus: number;
  growthRate?: number;
  demographics?: {
    ageGroups: {
      '0-14': number;
      '15-64': number;
      '65+': number;
    };
    gender: {
      male: number;
      female: number;
    };
  };
}

export interface EconomicData {
  municipality: string;
  gdp: number;
  gdpPerCapita: number;
  unemploymentRate: number;
  mainEconomicActivities: string[];
  tourismRevenue?: number;
  hotelOccupancy?: number;
  averageStay?: number;
}

export interface InfrastructureData {
  municipality: string;
  hotels: number;
  restaurants: number;
  attractions: number;
  transportOptions: string[];
  internetCoverage: number;
  publicSafety: {
    policeStations: number;
    hospitals: number;
    fireStations: number;
  };
  accessibility: {
    wheelchairAccessible: boolean;
    signLanguage: boolean;
    audioDescription: boolean;
  };
}

export interface AlertData {
  id: string;
  type: 'weather' | 'security' | 'health' | 'transport' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedAreas: string[];
  startDate: string;
  endDate?: string;
  recommendations: string[];
  source: string;
  lastUpdate: string;
}

export interface RealTimeData {
  activeTourists: number;
  availableAccommodations: number;
  weatherCondition: string;
  trafficStatus: 'normal' | 'moderate' | 'heavy';
  eventStatus: {
    ongoing: number;
    upcoming: number;
    completed: number;
  };
  popularDestinations: {
    name: string;
    currentVisitors: number;
    capacity: number;
  }[];
  lastUpdate: string;
}

export interface APIConfig {
  baseURL: string;
  endpoints: Record<string, string>;
  headers?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
}

export interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

export interface APIStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  lastReset: string;
}

// Tipos para configuração de APIs específicas
export interface MinistryTourismConfig extends APIConfig {
  apiKey?: string;
  rateLimit?: number;
}

export interface IBGEConfig extends APIConfig {
  version: string;
}

export interface INMETConfig extends APIConfig {
  stationCode: string;
}

export interface ANTTConfig extends APIConfig {
  licenseKey?: string;
}

export interface FundturMSConfig extends APIConfig {
  apiKey: string;
  environment: 'development' | 'staging' | 'production';
}

// Tipos para respostas específicas
export interface MinistryTourismResponse {
  destinations: TourismData[];
  events: EventData[];
  statistics: {
    totalVisitors: number;
    totalRevenue: number;
    averageRating: number;
  };
  alerts: AlertData[];
}

export interface IBGEResponse {
  municipalities: Array<{
    id: number;
    nome: string;
    microrregiao: {
      id: number;
      nome: string;
      mesorregiao: {
        id: number;
        nome: string;
        UF: {
          id: number;
          sigla: string;
          nome: string;
        };
      };
    };
  }>;
  population: PopulationData[];
}

export interface INMETResponse {
  current: WeatherData;
  forecast: WeatherForecast[];
  alerts: AlertData[];
}

export interface ANTTResponse {
  routes: TransportData[];
  schedules: Array<{
    routeId: string;
    departures: string[];
  }>;
  prices: Array<{
    routeId: string;
    basePrice: number;
    discounts: Array<{
      type: string;
      percentage: number;
    }>;
  }>;
}

export interface FundturMSResponse {
  destinations: TourismData[];
  events: EventData[];
  statistics: {
    totalVisitors: number;
    totalRevenue: number;
    averageRating: number;
    economicImpact: number;
  };
  realTime: RealTimeData;
  infrastructure: InfrastructureData[];
  economic: EconomicData[];
}

// Tipos para hooks React
export interface UseGovernmentAPIState {
  loading: boolean;
  error: string | null;
  data: any | null;
  lastUpdate: string | null;
}

export interface UseGovernmentAPIActions {
  refetch: () => Promise<void>;
  clearCache: () => void;
  getStats: () => APIStats;
}

export interface UseGovernmentAPIResult extends UseGovernmentAPIState, UseGovernmentAPIActions {} 