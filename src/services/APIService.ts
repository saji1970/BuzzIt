import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration - use Railway production backend
import { API_CONFIG } from '../config/API_CONFIG';

const getApiBaseUrl = () => {
  // Always use Railway production backend
    return 'https://buzzit-production.up.railway.app';
};

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  mobileNumber: string;
  isVerified: boolean;
  bio?: string;
  avatar?: string;
  interests: any[];
  followers: number;
  following: number;
  buzzCount: number;
  createdAt: string;
  subscribedChannels: string[];
  blockedUsers: string[];
}

export interface Buzz {
  id: string;
  userId: string;
  username: string;
  userAvatar: string | null;
  content: string;
  media: {
    type: 'image' | 'video' | null;
    url: string | null;
  };
  interests: any[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  isLiked: boolean;
}

export interface VerificationRequest {
  mobileNumber: string;
  username: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  verificationId?: string;
}

export interface VerifyCodeRequest {
  mobileNumber: string;
  code: string;
  verificationId: string;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      console.log('Making API request to:', url);
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('Endpoint:', endpoint);
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      console.log('Request config:', JSON.stringify(config, null, 2));
      const response = await fetch(url, config);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      let data;
      try {
        const text = await response.text();
        console.log('Response text:', text);
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }
      console.log('Response data:', data);

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `Request failed with status ${response.status}`,
        };
      }

      // Handle API responses that already have success field
      if (data.success !== undefined && data.success === false) {
        return {
          success: false,
          error: data.message || data.error || 'Request failed',
        };
      }

      // If response has success: true and data field, extract data
      if (data.success === true && data.data !== undefined) {
        return {
          success: true,
          data: data.data,
        };
      }

      // Handle direct response (like user object from POST /api/users)
      // If response is ok (200-299) and has data (not an error object), treat as success
      if (response.ok && !data.error && !data.message?.toLowerCase().includes('error')) {
        // Check if it looks like a valid data object
        // For user creation, we expect an object with id, username, etc.
        if (typeof data === 'object' && data !== null) {
          // If it has an id or username field, it's likely a valid response
          if (data.id || data.username || data.available !== undefined) {
            return {
              success: true,
              data,
            };
          }
          // If it's an empty object but status is ok, still return success
          if (Object.keys(data).length === 0 && response.status >= 200 && response.status < 300) {
            return {
              success: true,
              data,
            };
          }
        }
      }

      // Handle direct response (like {available: boolean})
      // If data doesn't have success field but has expected fields, treat as success
      if (!data.success && !data.error && (data.available !== undefined || Object.keys(data).length > 0)) {
        return {
          success: true,
          data,
        };
      }

      // For successful responses (200-299), return the data
      if (response.ok) {
        return {
          success: true,
          data,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error('API Request Error:', error);
      console.error('API URL:', url);
      console.error('Error details:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
      });
      
      // Provide more specific error messages
      let errorMessage = 'Network error. Please check your connection.';
      if (error?.message) {
        if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
          errorMessage = 'Cannot connect to server. Please check your internet connection.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout. Please try again.';
        } else {
          errorMessage = `Network error: ${error.message}`;
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Authentication
  async sendVerificationCode(request: VerificationRequest): Promise<ApiResponse<VerificationResponse>> {
    return this.makeRequest<VerificationResponse>('/api/auth/send-verification', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async verifyCode(request: VerifyCodeRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.makeRequest<{ user: User; token: string }>('/api/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async login(username: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.makeRequest<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  }

  // Users
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/api/users/me');
  }

  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return this.makeRequest<User>(`/api/users/${userId}`);
  }

  async createUser(userData: {
    username: string;
    displayName: string;
    email?: string;
    mobileNumber?: string;
    password?: string;
    dateOfBirth?: string;
    interests?: any[];
    bio?: string;
    avatar?: string | null;
  }): Promise<ApiResponse<User>> {
    try {
      console.log('Creating user with data:', {
        username: userData.username,
        displayName: userData.displayName,
        email: userData.email,
        hasInterests: !!userData.interests?.length,
      });
      
      const response = await this.makeRequest<User>('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      console.log('Create user response:', {
        success: response.success,
        hasData: !!response.data,
        error: response.error,
      });
      
      if (!response.success) {
        console.error('Create user failed:', response.error);
      }
      
      return response;
    } catch (error: any) {
      console.error('Create user exception:', error);
      return {
        success: false,
        error: error?.message || 'Failed to create user. Please check your internet connection.',
      };
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.makeRequest<User>(`/api/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async checkUsernameAvailability(username: string): Promise<ApiResponse<{ available: boolean }>> {
    try {
      const response = await this.makeRequest<{ available: boolean }>(`/api/users/check-username/${username}`);
      
      // Handle both formats: {available: boolean} and {success: true, available: boolean}
      if (response.success && response.data) {
        // Check if data has available field
        if (typeof response.data === 'object' && response.data !== null) {
          if ('available' in response.data) {
            return {
              success: true,
              data: { available: response.data.available }
            };
          }
        }
        // If data is the available value directly
        return {
          success: true,
          data: { available: response.data as any }
        };
      }
      
      // If response failed but has error, default to available (better UX)
      if (!response.success) {
        console.warn('Username check failed, defaulting to available:', response.error);
        return {
          success: true,
          data: { available: true }
        };
      }
      
      return response;
    } catch (error) {
      console.error('Username availability check error:', error);
      // On error, default to allowing username (better UX)
      return {
        success: true,
        data: { available: true }
      };
    }
  }

  // Buzzes
  async getBuzzes(): Promise<ApiResponse<Buzz[]>> {
    return this.makeRequest<Buzz[]>('/api/buzzes');
  }

  // Get all users (for search)
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return this.makeRequest<User[]>('/api/users');
  }

  async createBuzz(buzz: Omit<Buzz, 'id' | 'createdAt' | 'isLiked'>): Promise<ApiResponse<Buzz>> {
    return this.makeRequest<Buzz>('/api/buzzes', {
      method: 'POST',
      body: JSON.stringify(buzz),
    });
  }

  async likeBuzz(buzzId: string): Promise<ApiResponse<Buzz>> {
    return this.makeRequest<Buzz>(`/api/buzzes/${buzzId}/like`, {
      method: 'PATCH',
    });
  }

  async shareBuzz(buzzId: string): Promise<ApiResponse<Buzz>> {
    return this.makeRequest<Buzz>(`/api/buzzes/${buzzId}/share`, {
      method: 'PATCH',
    });
  }

  // Social Media
  async getSocialAccounts(userId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/api/social/${userId}`);
  }

  async addSocialAccount(platform: string, accountData: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/api/social', {
      method: 'POST',
      body: JSON.stringify({ platform, ...accountData }),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; version: string }>> {
    return this.makeRequest<{ status: string; version: string }>('/health');
  }

  // Admin endpoints
  async getAdminDashboard(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/api/admin/dashboard');
  }

  async getAdminUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.makeRequest<any>(`/api/admin/users?${queryParams.toString()}`);
  }

  async getAdminBuzzes(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.makeRequest<any>(`/api/admin/buzzes?${queryParams.toString()}`);
  }

  async deleteUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async deleteBuzz(buzzId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/api/admin/buzzes/${buzzId}`, {
      method: 'DELETE',
    });
  }

  async banUser(userId: string, banned: boolean): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/api/admin/users/${userId}/ban`, {
      method: 'PATCH',
      body: JSON.stringify({ banned }),
    });
  }

  // Feature management
  async getFeatures(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/api/features');
  }

  async updateFeatures(features: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/api/features', {
      method: 'PATCH',
      body: JSON.stringify({ features }),
    });
  }

  async checkFeatureAccess(feature: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/api/features/check/${feature}`);
  }

  // Subscription management
  async getSubscriptionPlans(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/api/subscriptions/plans');
  }

  async getUserSubscription(userId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/api/subscriptions/user/${userId}`);
  }

  async subscribeToPlan(planId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/api/subscriptions/subscribe', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  }

  async unsubscribe(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/api/subscriptions/unsubscribe', {
      method: 'DELETE',
    });
  }

  async getAdminSubscriptions(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.makeRequest<any>(`/api/admin/subscriptions?${queryParams.toString()}`);
  }

  // Live Streams
  async getLiveStreams(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/api/live-streams');
  }

  async getLiveStream(streamId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/api/live-streams/${streamId}`);
  }

  async createLiveStream(streamData: {
    title: string;
    description?: string;
    streamUrl?: string;
    thumbnailUrl?: string;
    category?: string;
    tags?: string[];
  }): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/api/live-streams', {
      method: 'POST',
      body: JSON.stringify(streamData),
    });
  }

  async updateViewers(streamId: string, action: 'increment' | 'decrement'): Promise<ApiResponse<{ viewers: number }>> {
    return this.makeRequest<{ viewers: number }>(`/api/live-streams/${streamId}/viewers`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    });
  }

  async endLiveStream(streamId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/api/live-streams/${streamId}/end`, {
      method: 'PATCH',
    });
  }

  // Stream Comments
  async getStreamComments(streamId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`/api/live-streams/${streamId}/comments`);
  }

  async addStreamComment(streamId: string, comment: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/api/live-streams/${streamId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  // Channels
  async getChannels(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/api/channels');
  }

  async getAllChannels(): Promise<ApiResponse<any[]>> {
    // Public endpoint to get all channels for search
    return this.makeRequest<any[]>('/api/channels/all');
  }

  async createChannel(channelData: {
    name: string;
    description?: string;
    interests?: any[];
  }): Promise<ApiResponse<any>> {
    console.log('Creating channel:', channelData);
    return this.makeRequest<any>('/api/channels', {
      method: 'POST',
      body: JSON.stringify(channelData),
    });
  }

  async deleteChannel(channelId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/api/channels/${channelId}`, {
      method: 'DELETE',
    });
  }

  // AI Recommendations
  async getUserRecommendations(params: {
    contacts?: Array<{name: string; email?: string; phone?: string}>;
    socialConnections?: Array<{platform: string; userId?: string; username?: string}>;
  } = {}): Promise<ApiResponse<{
    recommendations: Array<{
      user: any;
      score: number;
      reasons: string[];
    }>;
    preferences: any;
  }>> {
    const queryParams = new URLSearchParams();
    if (params.contacts) {
      queryParams.append('contacts', JSON.stringify(params.contacts));
    }
    if (params.socialConnections) {
      queryParams.append('socialConnections', JSON.stringify(params.socialConnections));
    }
    
    const query = queryParams.toString();
    return this.makeRequest<{
      recommendations: Array<{
        user: any;
        score: number;
        reasons: string[];
      }>;
      preferences: any;
    }>(`/api/recommendations/users${query ? `?${query}` : ''}`);
  }

  async getSmartFeed(limit: number = 50): Promise<ApiResponse<{
    buzzes: any[];
    preferences: any;
  }>> {
    return this.makeRequest<{
      buzzes: any[];
      preferences: any;
    }>(`/api/recommendations/buzzes?limit=${limit}`);
  }

  async recordInteraction(buzzId: string, type: 'like' | 'comment' | 'share' | 'view', metadata?: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/api/interactions', {
      method: 'POST',
      body: JSON.stringify({ buzzId, type, metadata }),
    });
  }
}

export default new ApiService();