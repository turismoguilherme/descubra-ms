
export type TourismSource = "supabase" | "mock" | "api";

export interface Region {
  id: string;
  name: string;
  visitors: number;
  growth: number;
  coordinates: [number, number];
  color: string;
  density?: number;
}

export interface TourismData {
  visitors: number;
  revenue: number;
  hotspots: string[];
  trends: Array<{
    month: string;
    visitors: number;
    revenue: number;
  }>;
  demographics: {
    ageGroups: Record<string, number>;
    origins: Record<string, number>;
  };
  events: Array<{
    name: string;
    date: string;
    attendance: number;
  }>;
  source: TourismSource;
  lastUpdate: string;
  
  // Propriedades adicionais necessárias
  totalVisitors: number;
  growthRate: number;
  interests: string[];
  origins: Record<string, number>;
  regions: Region[];
  regionsCount: number;
  citiesCount: number;
  cadasturServices: Array<{
    name: string;
    count: number;
    type?: string;
  }>;
}
