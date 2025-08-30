export interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
  type: 'badge' | 'discount' | 'access' | 'item';
  category: string;
  icon?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RewardClaim {
  id: string;
  user_id: string;
  reward_id: string;
  claimed_at: string;
  used_at?: string;
}

export type RewardType = Reward['type'];
export type RewardCategory = Reward['category'];