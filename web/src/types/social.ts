export type SocialPlatform = 'facebook' | 'instagram' | 'snapchat' | 'twitter';

export interface SocialAccount {
  id: number;
  user_id: string;
  platform: SocialPlatform;
  platform_user_id: string;
  username: string;
  display_name: string;
  profile_picture_url: string | null;
  is_connected: boolean;
  token_expires_at: string | null;
  last_published_at: string | null;
  publish_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConnectedAccountsResponse {
  success: boolean;
  accounts: SocialAccount[];
}

export interface OAuthUrlResponse {
  success: boolean;
  authUrl: string;
}

export interface OAuthCallbackPayload {
  code: string;
  state?: string;
}

export interface OAuthCallbackResponse {
  success: boolean;
  account?: SocialAccount;
  message?: string;
}

export interface PublishToSocialPayload {
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export interface PublishToSocialResponse {
  success: boolean;
  platform: SocialPlatform;
  postId?: string;
  error?: string;
}

export interface DisconnectAccountResponse {
  success: boolean;
  message?: string;
}
