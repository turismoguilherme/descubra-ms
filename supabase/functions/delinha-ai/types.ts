
// Type definitions for Delinha AI

// Interface for the incoming request
export interface RequestBody {
  prompt: string;
  knowledgeBase?: any[];
  userInfo?: {
    origem?: string;
    interesses?: string[];
    visitouAnteriormente?: boolean;
  };
  threadId?: string | null;
  useOfficialSources?: boolean;
}

// Interface for the response
export interface ResponseBody {
  response: string;
  threadId?: string;
  source?: string;
}

// Knowledge base item
export interface KnowledgeItem {
  title: string;
  content: string;
  lastUpdated: string;
}
