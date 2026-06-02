export type Gender = 'male' | 'female';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  gender: Gender | null;
  avatar_url: string | null;
  is_subscribed: boolean;
  has_active_trial: boolean;
  can_grant_trial: boolean;
  subscription_expires_at: string | null;
  trial_used_count: number;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
  phone?: string;
  country?: string;
  gender?: Gender;
}
