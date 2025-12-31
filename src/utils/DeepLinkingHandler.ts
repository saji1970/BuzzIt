import {Linking} from 'react-native';
import SocialMediaService, {SocialPlatform} from '../services/SocialMediaService';

/**
 * Deep Linking Handler for OAuth Callbacks
 * Handles OAuth redirects from social media platforms
 */
class DeepLinkingHandler {
  private static instance: DeepLinkingHandler;
  private listeners: Array<() => void> = [];

  private constructor() {
    this.setupDeepLinking();
  }

  static getInstance(): DeepLinkingHandler {
    if (!DeepLinkingHandler.instance) {
      DeepLinkingHandler.instance = new DeepLinkingHandler();
    }
    return DeepLinkingHandler.instance;
  }

  /**
   * Setup deep linking listeners
   */
  private setupDeepLinking() {
    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          this.handleDeepLink(url);
        }
      })
      .catch(err => console.error('Error getting initial URL:', err));

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', ({url}) => {
      this.handleDeepLink(url);
    });

    this.listeners.push(() => subscription.remove());
  }

  /**
   * Handle incoming deep link
   */
  private async handleDeepLink(url: string) {
    console.log('[DeepLinkingHandler] Received deep link:', url);

    try {
      const parsedUrl = new URL(url);
      
      // Check if it's an OAuth callback
      if (parsedUrl.pathname.includes('/oauth/callback') || parsedUrl.searchParams.has('code')) {
        await this.handleOAuthCallback(url);
        return;
      }

      // Handle other deep link types here
      console.log('[DeepLinkingHandler] Unknown deep link type:', url);
    } catch (error) {
      console.error('[DeepLinkingHandler] Error handling deep link:', error);
    }
  }

  /**
   * Handle OAuth callback from social platforms
   */
  private async handleOAuthCallback(url: string) {
    try {
      const parsedUrl = new URL(url);
      const code = parsedUrl.searchParams.get('code');
      const error = parsedUrl.searchParams.get('error');
      const state = parsedUrl.searchParams.get('state');
      
      // Extract platform from URL
      // Format: buzzit://oauth/callback/facebook?code=...
      // or: https://buzzit.app/oauth/callback/instagram?code=...
      let platform: SocialPlatform | null = null;
      
      const pathParts = parsedUrl.pathname.split('/');
      const callbackIndex = pathParts.findIndex(part => part === 'callback');
      
      if (callbackIndex !== -1 && pathParts[callbackIndex + 1]) {
        const platformName = pathParts[callbackIndex + 1].toLowerCase();
        if (['facebook', 'instagram', 'snapchat'].includes(platformName)) {
          platform = platformName as SocialPlatform;
        }
      }

      // Fallback: try to detect from state parameter or URL host
      if (!platform) {
        if (state) {
          // State might contain platform info
          const stateParts = state.split('_');
          if (stateParts.length > 0) {
            const platformName = stateParts[0].toLowerCase();
            if (['facebook', 'instagram', 'snapchat'].includes(platformName)) {
              platform = platformName as SocialPlatform;
            }
          }
        }
      }

      if (!platform) {
        console.error('[DeepLinkingHandler] Could not determine platform from URL:', url);
        return;
      }

      if (error) {
        console.error(`[DeepLinkingHandler] OAuth error for ${platform}:`, error);
        await SocialMediaService.handleOAuthCallback(platform, url);
        return;
      }

      if (!code) {
        console.error(`[DeepLinkingHandler] No authorization code in callback for ${platform}`);
        return;
      }

      console.log(`[DeepLinkingHandler] Processing OAuth callback for ${platform}`);
      await SocialMediaService.handleOAuthCallback(platform, url);
    } catch (error) {
      console.error('[DeepLinkingHandler] Error processing OAuth callback:', error);
    }
  }

  /**
   * Cleanup listeners
   */
  cleanup() {
    this.listeners.forEach(remove => remove());
    this.listeners = [];
  }
}

export default DeepLinkingHandler.getInstance();



