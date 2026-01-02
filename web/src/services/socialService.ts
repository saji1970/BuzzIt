import api from './api';
import {
  SocialPlatform,
  ConnectedAccountsResponse,
  OAuthUrlResponse,
  OAuthCallbackPayload,
  OAuthCallbackResponse,
  DisconnectAccountResponse,
} from '../types/social';

/**
 * Get all connected social media accounts for the current user
 * @returns Array of connected accounts
 */
export const getConnectedAccounts = async (): Promise<ConnectedAccountsResponse> => {
  try {
    const response = await api.get<ConnectedAccountsResponse>('/api/social-auth/connected');
    return response.data;
  } catch (error) {
    console.error('Get connected accounts error:', error);
    throw error;
  }
};

/**
 * Get OAuth authorization URL for a platform
 * @param platform - Social platform to connect
 * @returns OAuth URL to redirect user to
 */
export const getOAuthUrl = async (platform: SocialPlatform): Promise<string> => {
  try {
    const response = await api.get<OAuthUrlResponse>(
      `/api/social-auth/oauth/${platform}/url`
    );

    if (response.data.success && response.data.authUrl) {
      return response.data.authUrl;
    }

    throw new Error('Failed to get OAuth URL');
  } catch (error) {
    console.error(`Get OAuth URL for ${platform} error:`, error);
    throw error;
  }
};

/**
 * Handle OAuth callback after user authorizes the app
 * @param platform - Social platform
 * @param code - Authorization code from OAuth provider
 * @returns Callback response with account info
 */
export const handleOAuthCallback = async (
  platform: SocialPlatform,
  code: string
): Promise<OAuthCallbackResponse> => {
  try {
    const payload: OAuthCallbackPayload = { code };
    const response = await api.post<OAuthCallbackResponse>(
      `/api/social-auth/oauth/${platform}/callback`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error(`OAuth callback for ${platform} error:`, error);
    throw error;
  }
};

/**
 * Disconnect a social media account
 * @param platform - Social platform to disconnect
 * @returns Disconnect response
 */
export const disconnectAccount = async (
  platform: SocialPlatform
): Promise<DisconnectAccountResponse> => {
  try {
    const response = await api.delete<DisconnectAccountResponse>(
      `/api/social-auth/${platform}`
    );
    return response.data;
  } catch (error) {
    console.error(`Disconnect ${platform} error:`, error);
    throw error;
  }
};

/**
 * Initiate OAuth flow by redirecting to platform's authorization page
 * @param platform - Social platform to connect
 */
export const connectPlatform = async (platform: SocialPlatform): Promise<void> => {
  try {
    const authUrl = await getOAuthUrl(platform);
    // Redirect to OAuth URL
    window.location.href = authUrl;
  } catch (error) {
    console.error(`Connect ${platform} error:`, error);
    throw error;
  }
};

export default {
  getConnectedAccounts,
  getOAuthUrl,
  handleOAuthCallback,
  disconnectAccount,
  connectPlatform,
};
