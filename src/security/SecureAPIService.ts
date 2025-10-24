import NetworkSecurity from './NetworkSecurity';
import EncryptionService from './EncryptionService';
import InputValidation from './InputValidation';
import SecurityMonitor from './SecurityMonitor';
import {SecurityConfig} from './SecurityConfig';

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
  requestId: string;
}

interface SecureRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  data?: any;
  requireAuth?: boolean;
  encryptData?: boolean;
  validateInput?: boolean;
  userId?: string;
}

class SecureAPIService {
  private config: SecurityConfig;
  private baseURL: string;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  constructor(config: SecurityConfig) {
    this.config = config;
    this.baseURL = 'https://api.buzzit.app';
  }

  // Make secure API request
  async makeSecureRequest<T = any>(
    options: SecureRequestOptions
  ): Promise<APIResponse<T>> {
    try {
      // Check rate limiting
      if (!this.checkRateLimit()) {
        throw new Error('Rate limit exceeded');
      }

      // Validate input if required
      if (options.validateInput && options.data) {
        const validation = this.validateRequestData(options.data);
        if (!validation.isValid) {
          throw new Error(`Input validation failed: ${validation.errors.join(', ')}`);
        }
      }

      // Encrypt data if required
      let requestData = options.data;
      if (options.encryptData && options.data && options.userId) {
        requestData = EncryptionService.encryptData(options.data, options.userId);
      }

      // Add security headers
      const headers = this.getSecurityHeaders(options.requireAuth);

      // Make the request
      const response = await NetworkSecurity.secureRequest(
        options.endpoint,
        {
          method: options.method,
          headers,
          body: requestData ? JSON.stringify(requestData) : undefined
        }
      );

      // Validate response
      if (!this.validateResponse(response)) {
        throw new Error('Invalid response received');
      }

      const responseData = await response.json();

      // Log security event
      await SecurityMonitor.logSecurityEvent(
        'login_attempt',
        'low',
        `API request to ${options.endpoint}`,
        options.userId
      );

      return {
        success: true,
        data: responseData,
        timestamp: Date.now(),
        requestId: this.generateRequestId()
      };

    } catch (error) {
      console.error('Secure API request failed:', error);
      
      // Log security event for failed request
      await SecurityMonitor.logSecurityEvent(
        'suspicious_activity',
        'medium',
        `Failed API request to ${options.endpoint}: ${error.message}`,
        options.userId
      );

      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
        requestId: this.generateRequestId()
      };
    }
  }

  // Validate request data
  private validateRequestData(data: any): {isValid: boolean; errors: string[]} {
    const errors: string[] = [];

    if (typeof data === 'string') {
      const validation = InputValidation.validateTextInput(data);
      if (!validation.isValid) {
        errors.push(...validation.errors);
      }
    } else if (typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          const validation = InputValidation.validateTextInput(value);
          if (!validation.isValid) {
            errors.push(`${key}: ${validation.errors.join(', ')}`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Check rate limiting
  private checkRateLimit(): boolean {
    const now = Date.now();
    const timeDiff = now - this.lastRequestTime;

    // Reset counter every minute
    if (timeDiff > 60000) {
      this.requestCount = 0;
    }

    // Check if we've exceeded the rate limit
    if (this.requestCount >= this.config.network.rateLimitPerMinute) {
      return false;
    }

    this.requestCount++;
    this.lastRequestTime = now;
    return true;
  }

  // Get security headers
  private getSecurityHeaders(requireAuth: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'BuzzIt-Secure-Client/1.0',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Client-Version': '1.0.0',
      'X-Platform': 'React-Native'
    };

    if (requireAuth) {
      // Add authentication headers
      headers['Authorization'] = 'Bearer ' + this.getAuthToken();
    }

    return headers;
  }

  // Get authentication token
  private getAuthToken(): string {
    // In a real implementation, get from secure storage
    return 'secure_token_placeholder';
  }

  // Validate response
  private validateResponse(response: Response): boolean {
    // Check status code
    if (response.status >= 400) {
      return false;
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      return false;
    }

    return true;
  }

  // Generate unique request ID
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Secure file upload
  async secureFileUpload(
    file: any,
    endpoint: string,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<APIResponse> {
    try {
      // Validate file
      const validation = InputValidation.validateFileUpload(file.name, file.size);
      if (!validation.isValid) {
        throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
      }

      // Check rate limiting
      if (!this.checkRateLimit()) {
        throw new Error('Rate limit exceeded');
      }

      // Encrypt file if required
      let fileData = file;
      if (this.config.dataProtection.encryptMediaFiles) {
        const encrypted = EncryptionService.encryptFile(file.data, userId);
        fileData = {
          ...file,
          data: encrypted.encrypted,
          iv: encrypted.iv,
          salt: encrypted.salt
        };
      }

      // Upload file
      const response = await NetworkSecurity.secureFileUpload(
        fileData,
        endpoint,
        onProgress
      );

      // Log security event
      await SecurityMonitor.logSecurityEvent(
        'login_attempt',
        'low',
        `File upload to ${endpoint}`,
        userId
      );

      return {
        success: true,
        data: await response.json(),
        timestamp: Date.now(),
        requestId: this.generateRequestId()
      };

    } catch (error) {
      console.error('Secure file upload failed:', error);
      
      // Log security event for failed upload
      await SecurityMonitor.logSecurityEvent(
        'suspicious_activity',
        'medium',
        `Failed file upload to ${endpoint}: ${error.message}`,
        userId
      );

      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
        requestId: this.generateRequestId()
      };
    }
  }

  // Secure user registration
  async registerUser(userData: any): Promise<APIResponse> {
    try {
      // Validate user data
      const validation = this.validateUserData(userData);
      if (!validation.isValid) {
        throw new Error(`User data validation failed: ${validation.errors.join(', ')}`);
      }

      // Make secure request
      const response = await this.makeSecureRequest({
        method: 'POST',
        endpoint: '/auth/register',
        data: userData,
        requireAuth: false,
        encryptData: true,
        validateInput: true
      });

      return response;

    } catch (error) {
      console.error('User registration failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
        requestId: this.generateRequestId()
      };
    }
  }

  // Validate user data
  private validateUserData(userData: any): {isValid: boolean; errors: string[]} {
    const errors: string[] = [];

    // Validate username
    if (userData.username) {
      const usernameValidation = InputValidation.validateUsername(userData.username);
      if (!usernameValidation.isValid) {
        errors.push(...usernameValidation.errors);
      }
    }

    // Validate email
    if (userData.email) {
      const emailValidation = InputValidation.validateEmail(userData.email);
      if (!emailValidation.isValid) {
        errors.push('Invalid email format');
      }
    }

    // Validate password
    if (userData.password) {
      const passwordValidation = InputValidation.validatePassword(userData.password);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Secure user login
  async loginUser(credentials: {username: string; password: string}): Promise<APIResponse> {
    try {
      // Validate credentials
      const validation = this.validateUserData(credentials);
      if (!validation.isValid) {
        throw new Error(`Credentials validation failed: ${validation.errors.join(', ')}`);
      }

      // Make secure request
      const response = await this.makeSecureRequest({
        method: 'POST',
        endpoint: '/auth/login',
        data: credentials,
        requireAuth: false,
        encryptData: true,
        validateInput: true
      });

      return response;

    } catch (error) {
      console.error('User login failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
        requestId: this.generateRequestId()
      };
    }
  }

  // Secure buzz creation
  async createBuzz(buzzData: any, userId: string): Promise<APIResponse> {
    try {
      // Validate buzz data
      const validation = this.validateBuzzData(buzzData);
      if (!validation.isValid) {
        throw new Error(`Buzz data validation failed: ${validation.errors.join(', ')}`);
      }

      // Make secure request
      const response = await this.makeSecureRequest({
        method: 'POST',
        endpoint: '/buzzes',
        data: buzzData,
        requireAuth: true,
        encryptData: true,
        validateInput: true,
        userId
      });

      return response;

    } catch (error) {
      console.error('Buzz creation failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
        requestId: this.generateRequestId()
      };
    }
  }

  // Validate buzz data
  private validateBuzzData(buzzData: any): {isValid: boolean; errors: string[]} {
    const errors: string[] = [];

    // Validate content
    if (buzzData.content) {
      const contentValidation = InputValidation.validateTextInput(buzzData.content, 500);
      if (!contentValidation.isValid) {
        errors.push(...contentValidation.errors);
      }
    }

    // Validate interests
    if (buzzData.interests && Array.isArray(buzzData.interests)) {
      for (const interest of buzzData.interests) {
        if (typeof interest === 'string') {
          const interestValidation = InputValidation.validateTextInput(interest, 50);
          if (!interestValidation.isValid) {
            errors.push(`Invalid interest: ${interestValidation.errors.join(', ')}`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get security status
  async getSecurityStatus(): Promise<APIResponse> {
    try {
      const response = await this.makeSecureRequest({
        method: 'GET',
        endpoint: '/security/status',
        requireAuth: true
      });

      return response;

    } catch (error) {
      console.error('Get security status failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
        requestId: this.generateRequestId()
      };
    }
  }
}

export default SecureAPIService;
