export interface State {
  id: string;
  name: string;
  code: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserLevel {
  id: string;
  user_id: string;
  state_id: string;
  total_points: number;
  current_level: string;
  level_number: number;
  created_at: string;
  updated_at: string;
}

export interface PassportStamp {
  id: string;
  user_id: string;
  state_id: string;
  destination_id?: string;
  route_id?: string;
  checkpoint_id?: string;
  stamp_type?: string;
  activity_type: string;
  points_earned: number;
  latitude?: number;
  longitude?: number;
  stamped_at: string;
}

export interface FlowTripUser {
  id: string;
  level: UserLevel;
  stamps: PassportStamp[];
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required: number;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface FlowTripContextType {
  currentState: State | null;
  userLevel: UserLevel | null;
  passportStamps: PassportStamp[];
  achievements: Achievement[];
  isLoading: boolean;
  setCurrentState: (state: State) => void;
  addPoints: (points: number, activity_type?: string) => Promise<void>;
  addStamp: (stamp: Omit<PassportStamp, 'id' | 'user_id' | 'stamped_at' | 'state_id'>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

export const LEVEL_THRESHOLDS = {
  INICIANTE: 0,
  EXPLORADOR: 101,
  VIAJANTE: 501,
  AVENTUREIRO: 1001,
  MESTRE: 2000
} as const;

export const ACTIVITY_POINTS = {
  CHECK_IN: 10,
  EVENT_PARTICIPATION: 20,
  DESTINATION_REVIEW: 5,
  SOCIAL_SHARE: 3,
  ACHIEVEMENT_UNLOCK: 50
} as const;