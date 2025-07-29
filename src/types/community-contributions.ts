export interface CommunitySuggestion {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'atrativo' | 'evento' | 'melhoria' | 'roteiro' | 'outros';
  location?: string;
  coordinates?: { lat: number; lng: number };
  image_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  votes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityVote {
  id: string;
  suggestion_id: string;
  user_id: string;
  created_at: string;
}

export interface CommunityComment {
  id: string;
  suggestion_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

export interface CommunityModerationLog {
  id: string;
  suggestion_id: string;
  moderator_id: string;
  action: 'approved' | 'rejected' | 'edited' | 'archived';
  reason?: string;
  created_at: string;
} 