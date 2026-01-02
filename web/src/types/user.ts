import { Interest } from './buzz';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  avatar: string | null;
  city?: string;
  country?: string;
  mobileNumber?: string;
  isVerified?: boolean;
  interests: Interest[];
  followers: number;
  following: number;
  buzzCount: number;
  createdAt: Date | string;
  subscribedChannels?: string[];
  blockedUsers?: string[];
  locationSettings?: {
    enabled: boolean;
    priority: 'location' | 'interests' | 'mixed';
    radius: number;
  };
  privacySettings?: {
    shareEmail: boolean;
    shareMobileNumber: boolean;
    shareLocation: boolean;
    shareBio: boolean;
    shareInterests: boolean;
  };
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}
