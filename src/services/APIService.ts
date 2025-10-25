// API Service for connecting to Railway backend
// Change this URL to your Railway deployment URL
const API_BASE_URL = 'https://buzzit-production.up.railway.app'; // Replace with your Railway URL

// Types
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
  interests: Interest[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date | string;
  isLiked: boolean;
}

export interface Interest {
  id: string;
  name: string;
  category: string;
  emoji: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  avatar: string | null;
  interests: Interest[];
  followers: number;
  following: number;
  buzzCount: number;
  createdAt: Date | string;
}

export interface SocialAccount {
  id: string;
  userId: string;
  platform: string;
  username: string;
  isConnected: boolean;
  createdAt: Date | string;
}

// API Service Class
class APIService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Generic fetch method
  private async fetchAPI(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Health check
  async checkHealth() {
    return this.fetchAPI('/health');
  }

  // User methods
  async getUsers() {
    return this.fetchAPI('/api/users') as Promise<User[]>;
  }

  async getUser(id: string) {
    return this.fetchAPI(`/api/users/${id}`) as Promise<User>;
  }

  async createUser(userData: Partial<User>) {
    return this.fetchAPI('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }) as Promise<User>;
  }

  async updateUser(id: string, userData: Partial<User>) {
    return this.fetchAPI(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }) as Promise<User>;
  }

  // Buzz methods
  async getBuzzes(options?: { userId?: string; interests?: string[] }) {
    const params = new URLSearchParams();
    if (options?.userId) params.append('userId', options.userId);
    if (options?.interests && options.interests.length > 0) {
      params.append('interests', options.interests.join(','));
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/api/buzzes?${queryString}` : '/api/buzzes';
    return this.fetchAPI(endpoint) as Promise<Buzz[]>;
  }

  async getBuzz(id: string) {
    return this.fetchAPI(`/api/buzzes/${id}`) as Promise<Buzz>;
  }

  async createBuzz(buzzData: Partial<Buzz>) {
    return this.fetchAPI('/api/buzzes', {
      method: 'POST',
      body: JSON.stringify(buzzData),
    }) as Promise<Buzz>;
  }

  async likeBuzz(id: string) {
    return this.fetchAPI(`/api/buzzes/${id}/like`, {
      method: 'PATCH',
    }) as Promise<Buzz>;
  }

  async shareBuzz(id: string) {
    return this.fetchAPI(`/api/buzzes/${id}/share`, {
      method: 'PATCH',
    }) as Promise<Buzz>;
  }

  async deleteBuzz(id: string) {
    return this.fetchAPI(`/api/buzzes/${id}`, {
      method: 'DELETE',
    });
  }

  // Social accounts methods
  async getSocialAccounts(userId: string) {
    return this.fetchAPI(`/api/social/${userId}`) as Promise<SocialAccount[]>;
  }

  async createSocialAccount(accountData: Partial<SocialAccount>) {
    return this.fetchAPI('/api/social', {
      method: 'POST',
      body: JSON.stringify(accountData),
    }) as Promise<SocialAccount>;
  }

  async updateSocialAccount(id: string, accountData: Partial<SocialAccount>) {
    return this.fetchAPI(`/api/social/${id}`, {
      method: 'PUT',
      body: JSON.stringify(accountData),
    }) as Promise<SocialAccount>;
  }

  async deleteSocialAccount(id: string) {
    return this.fetchAPI(`/api/social/${id}`, {
      method: 'DELETE',
    });
  }

  // Update the base URL (useful for switching between local and production)
  setBaseURL(url: string) {
    this.baseURL = url;
  }

  getBaseURL() {
    return this.baseURL;
  }
}

// Export singleton instance
export default new APIService();

// Export class for custom instances
export { APIService };
