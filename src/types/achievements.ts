export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria: any;
  points_reward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  progress: any;
  achievement?: Achievement;
}

export interface UserLevel {
  level: number;
  name: string;
  icon: string;
  color: string;
  points_to_next: number | null;
}

export interface LevelThresholds {
  [key: number]: {
    name: string;
    minPoints: number;
    icon: string;
    color: string;
  };
}

export interface UserStats {
  totalPoints: number;
  totalStamps: number;
  totalRoutes: number;
  uniqueRegions: number;
  level: UserLevel;
  achievements: UserAchievement[];
}