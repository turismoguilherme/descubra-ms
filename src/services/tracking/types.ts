
export type InteractionType = 
  | 'page_view'
  | 'destination_click'
  | 'event_click'
  | 'route_click'
  | 'search'
  | 'filter_usage'
  | 'passport_stamp'
  | 'share'
  | 'form_submission';

export interface InteractionData {
  interaction_type: InteractionType;
  target_id?: string;
  target_name?: string;
  path?: string;
  duration_seconds?: number;
  details?: Record<string, any>;
} 