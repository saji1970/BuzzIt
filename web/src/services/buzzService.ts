import api from './api';
import { Buzz, CreateBuzzPayload } from '../types/buzz';
import { PublishToSocialPayload, PublishToSocialResponse, SocialPlatform } from '../types/social';

export interface CreateBuzzResponse {
  success: boolean;
  data?: Buzz;
  message?: string;
}

/**
 * Create a new buzz
 * @param payload - Buzz creation payload
 * @returns Created buzz
 */
export const createBuzz = async (payload: CreateBuzzPayload): Promise<CreateBuzzResponse> => {
  try {
    const response = await api.post<CreateBuzzResponse>('/api/buzzes', payload);
    return response.data;
  } catch (error) {
    console.error('Create buzz error:', error);
    throw error;
  }
};

/**
 * Publish buzz content to a social media platform
 * @param platform - Social platform ('facebook', 'instagram', 'snapchat', 'twitter')
 * @param payload - Content and media to publish
 * @returns Publish result with post ID
 */
export const publishToSocial = async (
  platform: SocialPlatform,
  payload: PublishToSocialPayload
): Promise<PublishToSocialResponse> => {
  try {
    const response = await api.post<PublishToSocialResponse>(
      `/api/social-share/${platform}/publish`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error(`Publish to ${platform} error:`, error);
    throw error;
  }
};

/**
 * Publish buzz to multiple social platforms
 * @param platforms - Array of platforms to publish to
 * @param payload - Content and media to publish
 * @returns Array of publish results
 */
export const publishToMultiplePlatforms = async (
  platforms: SocialPlatform[],
  payload: PublishToSocialPayload
): Promise<PublishToSocialResponse[]> => {
  const publishPromises = platforms.map((platform) =>
    publishToSocial(platform, payload).catch((error) => ({
      success: false,
      platform,
      error: error.message || 'Publish failed',
    }))
  );

  return Promise.all(publishPromises);
};

/**
 * Get buzzes from the feed
 * @param page - Page number (optional)
 * @param limit - Number of buzzes per page (optional)
 * @returns Array of buzzes
 */
export const getBuzzes = async (page: number = 1, limit: number = 20): Promise<Buzz[]> => {
  try {
    const response = await api.get<{ success: boolean; data: Buzz[] }>('/api/buzzes', {
      params: { page, limit },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Get buzzes error:', error);
    throw error;
  }
};

/**
 * Like a buzz
 * @param buzzId - ID of the buzz to like
 */
export const likeBuzz = async (buzzId: string): Promise<void> => {
  try {
    await api.post(`/api/buzzes/${buzzId}/like`);
  } catch (error) {
    console.error('Like buzz error:', error);
    throw error;
  }
};

/**
 * Unlike a buzz
 * @param buzzId - ID of the buzz to unlike
 */
export const unlikeBuzz = async (buzzId: string): Promise<void> => {
  try {
    await api.delete(`/api/buzzes/${buzzId}/like`);
  } catch (error) {
    console.error('Unlike buzz error:', error);
    throw error;
  }
};

export default {
  createBuzz,
  publishToSocial,
  publishToMultiplePlatforms,
  getBuzzes,
  likeBuzz,
  unlikeBuzz,
};
