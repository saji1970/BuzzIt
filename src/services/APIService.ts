import AsyncStorage from '@react-native-async-storage/async-storage';

// Use Railway API for production
const API_BASE_URL = 'https://buzzit-production.up.railway.app';

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
    try {
      const url = `${API_BASE_URL}${endpoint}`;
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
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Request failed',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API Request Error:', error);
      console.error('API URL:', url);
      return {
        success: false,
        error: `Network error: ${error.message || 'Please check your connection.'}`,
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

  async updateUser(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.makeRequest<User>(`/api/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async checkUsernameAvailability(username: string): Promise<ApiResponse<{ available: boolean }>> {
    return this.makeRequest<{ available: boolean }>(`/api/users/check-username/${username}`);
  }

  // Buzzes
  async getBuzzes(): Promise<ApiResponse<Buzz[]>> {
    return this.makeRequest<Buzz[]>('/api/buzzes');
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
}

export default new ApiService();