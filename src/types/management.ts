
export type Region = {
  id: string;
  name: string;
  visitorCount: number;
  checkinsCount: number;
  mainInterests: string[];
};

export type Suggestion = {
  id: string;
  regionId: string;
  text: string;
  priority: "high" | "medium" | "low";
  category: "event" | "promotion" | "infrastructure" | "partnership" | "training" | "experience";
  timestamp: string;
  status: "pending" | "approved" | "rejected";
};

export type HeatMapData = {
  regionId: string;
  density: number;
  coordinates: {
    lat: number;
    lng: number;
  };
};

export type UserFeedback = {
  id: string;
  userId: string;
  text: string;
  rating: number;
  regionId: string;
  timestamp: string;
};

export type PerformanceMetric = {
  regionId: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
};

export type OfficialSource = 
  | "fundtur-ms" 
  | "setesc" 
  | "ms-gov" 
  | "sectur" 
  | "rio-verde" 
  | "visit-ms" 
  | "manual"
  | "cadastur"
  | "alumia";

export type KnowledgeCategory = 
  | "news" 
  | "itinerary" 
  | "event" 
  | "attraction" 
  | "policy" 
  | "sustainability"
  | "gastronomy"
  | "service"
  | "analytics";

export type KnowledgeBaseEntry = {
  id: string;
  source: OfficialSource;
  category: KnowledgeCategory;
  content: string;
  region: string;
  timestamp: string;
  approved: boolean;
  approvedBy?: string;
  url?: string;
};

export type TourismService = {
  id: string;
  name: string;
  type: "hotel" | "agency" | "guide" | "restaurant" | "transport" | "event" | "attraction";
  region: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  status: "regular" | "pending" | "suspended" | "cancelled";
  cadasturNumber?: string;
  lastUpdate: string;
};

export type RegionalAnalytics = {
  regionId: string;
  period: string;
  visitorProfile: {
    ageGroups: Record<string, number>;
    origins: Record<string, number>;
    stayDuration: number;
    spendingAverage: number;
  };
  trends: {
    name: string;
    growth: number;
    potential: number;
  }[];
  recommendations: string[];
};
