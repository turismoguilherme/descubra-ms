
export interface ConversationItem {
  id: string;
  query: string;
  response: string;
  source?: string; // Tornando opcional
  timestamp: Date;
  isLoading?: boolean;
}

export interface IASupportTabProps {
  isAttendant: boolean;
}
