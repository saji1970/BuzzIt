import ApiService from './APIService';
import {Linking, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SocialPlatform = 'facebook' | 'instagram' | 'snapchat' | 'twitter';

export interface SocialAccount {
  platform: SocialPlatform;
  username: string;
  profilePicture?: string;
  connectedAt: string;
  isConnected: boolean;
  accessToken?: string;
  expiresAt?: Date;
  profileId?: string;
  status?: 'connected' | 'expired' | 'error' | 'disconnected';
  lastRefresh?: Date;
}

export interface PublishResult {
  platform: SocialPlatform;
  success: boolean;
  postId?: string;
  error?: string;
  message?: string;
}

export interface PublishOptions {
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  platforms: SocialPlatform[];
}

class SocialMediaService {
  private readonly API_BASE = 'https://buzzit-production.up.railway.app';
  private oauthCallbacks: Map<string, (success: boolean, error?: string) => void> = new Map();

  /**
   * Get OAuth URL for a platform
   */
  async getAuthUrl(platform: SocialPlatform): Promise<string | null> {
    try {
      const response = await ApiService.getSocialAuthUrl(platform);
      if (response.success && response.data?.authUrl) {
        return response.data.authUrl;
      }
      return null;
    } catch (error) {
      console.error(`Error getting ${platform} auth URL:`, error);
      return null;
    }
  }

  /**
   * Initiate OAuth flow for a platform
   */
  async connectPlatform(
    platform: SocialPlatform,
    onComplete?: (success: boolean, error?: string) => void
  ): Promise<{success: boolean; error?: string}> {
    try {
      const authUrl = await this.getAuthUrl(platform);
      if (!authUrl) {
        const error = `Failed to get ${platform} authentication URL. Please check server configuration.`;
        onComplete?.(false, error);
        return {success: false, error};
      }

      // Store callback for OAuth completion
      if (onComplete) {
        this.oauthCallbacks.set(platform, onComplete);
        // Set timeout to clear callback after 5 minutes
        setTimeout(() => {
          this.oauthCallbacks.delete(platform);
        }, 5 * 60 * 1000);
      }

      // On Android, add display=popup to try to force browser instead of Facebook app
      console.log('🔵 FACEBOOK OAUTH: Starting connection flow');
      console.log('🔵 Platform:', Platform.OS);
      console.log('🔵 Auth URL:', authUrl);

      let urlToOpen = authUrl;
      if (Platform.OS === 'android' && platform === 'facebook') {
        console.log('🔵 Android Facebook detected - adding display=popup');
        // Add display=popup parameter to encourage browser handling
        const separator = authUrl.includes('?') ? '&' : '?';
        urlToOpen = `${authUrl}${separator}display=popup`;
        console.log('🔵 URL with display=popup:', urlToOpen);
      }

      // Check if URL can be opened
      const canOpen = await Linking.canOpenURL(urlToOpen);
      if (!canOpen) {
        const error = `Cannot open ${platform} authentication URL.`;
        console.log('🔴 Cannot open URL:', error);
        onComplete?.(false, error);
        return {success: false, error};
      }

      console.log('🔵 Opening URL...');
      await Linking.openURL(urlToOpen);
      console.log('🔵 URL opened successfully');

      // Return success - actual connection will be confirmed via OAuth callback
      return {success: true};
    } catch (error: any) {
      console.error(`Error connecting to ${platform}:`, error);
      const errorMsg = error.message || `Failed to connect to ${platform}`;
      return {success: false, error: errorMsg};
    }
  }

  /**
   * Handle OAuth callback from deep link
   */
  async handleOAuthCallback(
    platform: SocialPlatform,
    callbackUrl: string
  ): Promise<{success: boolean; error?: string}> {
    try {
      // Extract code/state from callback URL
      const url = new URL(callbackUrl);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      const state = url.searchParams.get('state');

      if (error) {
        const errorMsg = `OAuth error: ${error}`;
        const callback = this.oauthCallbacks.get(platform);
        callback?.(false, errorMsg);
        this.oauthCallbacks.delete(platform);
        return {success: false, error: errorMsg};
      }

      if (!code) {
        const errorMsg = 'No authorization code received';
        const callback = this.oauthCallbacks.get(platform);
        callback?.(false, errorMsg);
        this.oauthCallbacks.delete(platform);
        return {success: false, error: errorMsg};
      }

      // Call backend to exchange code for token
      const response = await ApiService.handleOAuthCallback(platform, code, state || undefined);

      if (response.success) {
        const callback = this.oauthCallbacks.get(platform);
        callback?.(true);
        this.oauthCallbacks.delete(platform);
        return {success: true};
      }

      const errorMsg = response.error || 'Failed to complete OAuth flow';
      const callback = this.oauthCallbacks.get(platform);
      callback?.(false, errorMsg);
      this.oauthCallbacks.delete(platform);
      return {success: false, error: errorMsg};
    } catch (error: any) {
      console.error(`Error handling OAuth callback for ${platform}:`, error);
      const errorMsg = error.message || 'Failed to handle OAuth callback';
      const callback = this.oauthCallbacks.get(platform);
      callback?.(false, errorMsg);
      this.oauthCallbacks.delete(platform);
      return {success: false, error: errorMsg};
    }
  }

  /**
   * Get all connected social accounts
   */
  async getConnectedAccounts(): Promise<SocialAccount[]> {
    try {
      const response = await ApiService.getConnectedSocialAccounts();
      if (response.success && response.data?.accounts) {
        return response.data.accounts.map((acc: any) => {
          const expiresAt = acc.expiresAt ? new Date(acc.expiresAt) : undefined;
          const now = new Date();
          let status: 'connected' | 'expired' | 'error' | 'disconnected' = 'connected';
          
          if (expiresAt && expiresAt < now) {
            status = 'expired';
          }

          return {
            platform: acc.platform as SocialPlatform,
            username: acc.username || acc.name || 'Unknown',
            profilePicture: acc.profilePicture || acc.picture,
            connectedAt: acc.connectedAt || acc.createdAt,
            isConnected: acc.isConnected !== false && status === 'connected',
            accessToken: acc.accessToken,
            expiresAt,
            profileId: acc.profileId || acc.id,
            status,
            lastRefresh: acc.lastRefresh ? new Date(acc.lastRefresh) : undefined,
          };
        });
      }
      return [];
    } catch (error) {
      console.error('Error loading connected accounts:', error);
      return [];
    }
  }

  /**
   * Check if a platform is connected
   */
  async isPlatformConnected(platform: SocialPlatform): Promise<boolean> {
    const accounts = await this.getConnectedAccounts();
    return accounts.some(acc => acc.platform === platform && acc.isConnected);
  }

  /**
   * Disconnect a platform
   */
  async disconnectPlatform(platform: SocialPlatform): Promise<{success: boolean; error?: string}> {
    try {
      const response = await ApiService.disconnectSocialAccount(platform);
      if (response.success) {
        return {success: true};
      }
      return {
        success: false,
        error: response.error || `Failed to disconnect ${platform}`,
      };
    } catch (error: any) {
      console.error(`Error disconnecting ${platform}:`, error);
      return {
        success: false,
        error: error.message || `Failed to disconnect ${platform}`,
      };
    }
  }

  /**
   * Refresh access token for a platform
   */
  async refreshToken(platform: SocialPlatform): Promise<{success: boolean; error?: string}> {
    try {
      // Use fetch directly since we don't have a specific API method for this yet
      const token = await this.getAuthToken();
      const response = await fetch(`${this.API_BASE}/api/social-auth/${platform}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && {Authorization: `Bearer ${token}`}),
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        return {success: true};
      }
      return {
        success: false,
        error: data.error || `Failed to refresh ${platform} token`,
      };
    } catch (error: any) {
      console.error(`Error refreshing ${platform} token:`, error);
      return {
        success: false,
        error: error.message || `Failed to refresh ${platform} token`,
      };
    }
  }

  /**
   * Check and refresh token if needed
   */
  async ensureValidToken(platform: SocialPlatform): Promise<{valid: boolean; error?: string}> {
    const accounts = await this.getConnectedAccounts();
    const account = accounts.find(acc => acc.platform === platform);
    
    if (!account || !account.isConnected) {
      return {valid: false, error: `${platform} is not connected`};
    }

    // Check if token is expired or expiring soon (within 5 minutes)
    if (account.expiresAt) {
      const now = new Date();
      const expiresAt = account.expiresAt;
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      if (expiresAt < fiveMinutesFromNow) {
        // Token expired or expiring soon, try to refresh
        const refreshResult = await this.refreshToken(platform);
        if (!refreshResult.success) {
          return {valid: false, error: refreshResult.error};
        }
      }
    }

    return {valid: true};
  }

  /**
   * Validate media for a platform
   */
  validateMediaForPlatform(
    platform: SocialPlatform,
    mediaUrl?: string,
    mediaType?: 'image' | 'video'
  ): {valid: boolean; error?: string} {
    // Text-only posts are always valid
    if (!mediaUrl || !mediaType) {
      return {valid: true};
    }

    const requirements = this.getPlatformRequirements(platform);

    switch (platform) {
      case 'facebook':
        // Facebook supports images and videos
        if (mediaType === 'image') {
          // Max 4MB for images (validated on upload)
          return {valid: true};
        } else if (mediaType === 'video') {
          // Max 1GB for videos (validated on upload)
          return {valid: true};
        }
        return {valid: false, error: 'Unsupported media type for Facebook'};

      case 'instagram':
        // Instagram requires images or videos
        if (mediaType === 'image') {
          // Instagram supports 1:1, 4:5, or 16:9 aspect ratios
          return {valid: true};
        } else if (mediaType === 'video') {
          // Max 100MB for videos (validated on upload)
          return {valid: true};
        }
        return {valid: false, error: 'Instagram requires an image or video'};

      case 'snapchat':
        // Snapchat supports images and videos
        if (mediaType === 'image' || mediaType === 'video') {
          return {valid: true};
        }
        return {valid: false, error: 'Snapchat requires an image or video'};

      case 'twitter':
        // Twitter supports text-only, images, and videos
        if (!mediaType) {
          // Text-only tweets are allowed
          return {valid: true};
        }
        if (mediaType === 'image' || mediaType === 'video') {
          return {valid: true};
        }
        return {valid: false, error: 'Twitter supports images and videos'};

      default:
        return {valid: false, error: 'Unknown platform'};
    }
  }

  /**
   * Publish a buzz to selected platforms
   */
  async publishToPlatforms(options: PublishOptions): Promise<PublishResult[]> {
    const results: PublishResult[] = [];

    // Validate all platforms first
    for (const platform of options.platforms) {
      const validation = this.validateMediaForPlatform(
        platform,
        options.mediaUrl,
        options.mediaType
      );
      if (!validation.valid) {
        results.push({
          platform,
          success: false,
          error: validation.error,
        });
        continue;
      }

      // Check if platform is connected
      const isConnected = await this.isPlatformConnected(platform);
      if (!isConnected) {
        results.push({
          platform,
          success: false,
          error: `${platform} is not connected. Please connect in Settings.`,
        });
        continue;
      }
    }

    // Publish to each platform
    for (const platform of options.platforms) {
      // Skip if already failed validation
      if (results.some(r => r.platform === platform && !r.success)) {
        continue;
      }

      try {
        const result = await this.publishToPlatform(platform, options);
        results.push(result);
      } catch (error: any) {
        results.push({
          platform,
          success: false,
          error: error.message || `Failed to publish to ${platform}`,
        });
      }
    }

    return results;
  }

  /**
   * Get auth token from AsyncStorage
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Publish to a single platform
   */
  private async publishToPlatform(
    platform: SocialPlatform,
    options: PublishOptions
  ): Promise<PublishResult> {
    try {
      // Validate content length
      const requirements = this.getPlatformRequirements(platform);
      if (requirements.maxContentLength && options.content.length > requirements.maxContentLength) {
        return {
          platform,
          success: false,
          error: `Content exceeds ${platform}'s limit of ${requirements.maxContentLength} characters (${options.content.length} characters)`,
        };
      }

      // Validate media
      const mediaValidation = this.validateMediaForPlatform(
        platform,
        options.mediaUrl,
        options.mediaType
      );
      if (!mediaValidation.valid) {
        return {
          platform,
          success: false,
          error: mediaValidation.error || `Invalid media for ${platform}`,
        };
      }

      // Ensure token is valid
      const tokenCheck = await this.ensureValidToken(platform);
      if (!tokenCheck.valid) {
        // Try to refresh token once
        const refreshResult = await this.refreshToken(platform);
        if (!refreshResult.success) {
          return {
            platform,
            success: false,
            error: tokenCheck.error || `${platform} token is invalid. Please reconnect in Settings.`,
          };
        }
        // Retry token check after refresh
        const retryCheck = await this.ensureValidToken(platform);
        if (!retryCheck.valid) {
          return {
            platform,
            success: false,
            error: `${platform} token refresh failed. Please reconnect in Settings.`,
          };
        }
      }

      // Prepare publish request
      const publishData: any = {
        content: options.content,
        platform,
      };

      if (options.mediaUrl) {
        publishData.mediaUrl = options.mediaUrl;
        publishData.mediaType = options.mediaType;
      }

      // Call backend API to publish
      const response = await ApiService.publishToSocialPlatform(platform, publishData);

      if (response.success && response.data) {
        return {
          platform,
          success: true,
          postId: response.data.postId,
          message: response.data.message || `Successfully published to ${platform}`,
        };
      }

      // Handle specific error cases
      let errorMessage = response.error || response.data?.error || `Failed to publish to ${platform}`;
      
      // Provide user-friendly error messages
      if (errorMessage.includes('token') || errorMessage.includes('expired')) {
        errorMessage = `${platform} token expired. Please reconnect in Settings.`;
      } else if (errorMessage.includes('permission') || errorMessage.includes('scope')) {
        errorMessage = `Missing permissions for ${platform}. Please reconnect and grant all permissions.`;
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        errorMessage = `${platform} rate limit exceeded. Please try again later.`;
      }

      return {
        platform,
        success: false,
        error: errorMessage,
      };
    } catch (error: any) {
      console.error(`Error publishing to ${platform}:`, error);
      
      let errorMessage = error.message || `Failed to publish to ${platform}`;
      
      // Network errors
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = `Network error. Please check your connection and try again.`;
      }
      
      return {
        platform,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get platform-specific requirements
   */
  getPlatformRequirements(platform: SocialPlatform): {
    maxImageSize?: string;
    maxVideoSize?: string;
    supportedFormats: string[];
    aspectRatios?: string[];
    maxContentLength?: number;
  } {
    switch (platform) {
      case 'facebook':
        return {
          maxImageSize: '4MB',
          maxVideoSize: '1GB',
          supportedFormats: ['jpg', 'png', 'gif', 'mp4', 'mov'],
          maxContentLength: 5000,
        };

      case 'instagram':
        return {
          maxImageSize: '8MB',
          maxVideoSize: '100MB',
          supportedFormats: ['jpg', 'png', 'mp4'],
          aspectRatios: ['1:1', '4:5', '16:9'],
          maxContentLength: 2200,
        };

      case 'snapchat':
        return {
          maxImageSize: '10MB',
          maxVideoSize: '50MB',
          supportedFormats: ['jpg', 'png', 'mp4'],
          maxContentLength: 250,
        };

      case 'twitter':
        return {
          maxImageSize: '5MB',
          maxVideoSize: '512MB',
          supportedFormats: ['jpg', 'png', 'gif', 'mp4'],
          maxContentLength: 280,
        };

      default:
        return {
          supportedFormats: [],
        };
    }
  }
}

export default new SocialMediaService();

