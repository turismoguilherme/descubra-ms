
export interface Message {
  id: number;
  text: string;
  isBot: boolean;
  source?: string;
}

export interface CATSupportAIProps {
  onRecordQuestion?: (question: string, answer: string) => void;
}

export interface KnowledgeItem {
  title: string;
  content: string;
  attractions?: string[];
  regions?: string[];
  fees?: string;
  access?: string;
  source: string;
}

export interface OfficialInformation {
  [key: string]: KnowledgeItem;
}

// Tourism data interfaces
export interface TouristRegistration {
  id: string;
  timestamp: Date;
  origin: string; // State or country of origin
  interests: string[]; // Array of interests
  visitedBefore: boolean;
  travelGroup: number; // Number of people traveling together
  stayDuration: number; // Number of days
  accommodationType?: string;
  transportType?: string;
  spendingBudget?: 'low' | 'medium' | 'high';
}

export interface TourismDataSource {
  name: string;
  priority: number;
  lastUpdated: Date | null;
  isAvailable: boolean;
}

export interface TouristInterestData {
  interestType: string;
  count: number;
  percentage: number;
}

export interface TouristOriginData {
  origin: string;
  count: number;
  percentage: number;
}

export interface CollectedTourismData {
  interests: TouristInterestData[];
  origins: TouristOriginData[];
  totalRegistrations: number;
  lastUpdated: Date | null;
  source: string;
}

