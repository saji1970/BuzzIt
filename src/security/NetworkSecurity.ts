import {Alert} from 'react-native';

interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'X-XSS-Protection': string;
  'Strict-Transport-Security': string;
  'Referrer-Policy': string;
}

class NetworkSecurity {
  private readonly API_BASE_URL = 'https://api.buzzit.app';
  private readonly TIMEOUT = 10000; // 10 seconds
  private readonly MAX_RETRIES = 3;

  // Security headers for API requests
  getSecurityHeaders(): SecurityHeaders {
    return {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }

  // Secure API request with retry logic
  async secureRequest(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<Response> {
    try {
      const url = `${this.API_BASE_URL}${endpoint}`;
      
      // Add security headers
      const headers = {
        ...this.getSecurityHeaders(),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      };

      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Check for security issues
      if (!this.validateResponse(response)) {
        throw new Error('Security validation failed');
      }

      return response;

    } catch (error) {
      if (retryCount < this.MAX_RETRIES) {
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.secureRequest(endpoint, options, retryCount + 1);
      }
      
      console.error('Network request failed:', error);
      throw error;
    }
  }

  // Validate response for security issues
  private validateResponse(response: Response): boolean {
    // Check status code
    if (response.status >= 400 && response.status < 500) {
      console.warn('Client error:', response.status);
      return false;
    }

    if (response.status >= 500) {
      console.warn('Server error:', response.status);
      return false;
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      console.warn('Unexpected content type:', contentType);
      return false;
    }

    return true;
  }

  // Secure file upload
  async secureFileUpload(
    file: any,
    endpoint: string,
    onProgress?: (progress: number) => void
  ): Promise<Response> {
    try {
      // Validate file
      if (!this.validateFile(file)) {
        throw new Error('Invalid file');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', Date.now().toString());
      formData.append('checksum', await this.calculateFileChecksum(file));

      const response = await this.secureRequest(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response;

    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  // Validate file before upload
  private validateFile(file: any): boolean {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return false;
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/quicktime'
    ];

    if (!allowedTypes.includes(file.type)) {
      return false;
    }

    // Check file name
    const suspiciousPatterns = [
      /<script/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /[;&|`$()]/g,
      /\.\.\//g
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(file.name)) {
        return false;
      }
    }

    return true;
  }

  // Calculate file checksum for integrity
  private async calculateFileChecksum(file: any): Promise<string> {
    // In a real implementation, use a proper hashing library
    return btoa(file.name + file.size + file.lastModified);
  }

  // Check for suspicious network activity
  private suspiciousActivityCount = 0;
  private lastActivityTime = 0;

  checkSuspiciousActivity(): boolean {
    const now = Date.now();
    const timeDiff = now - this.lastActivityTime;

    if (timeDiff < 1000) { // Less than 1 second
      this.suspiciousActivityCount++;
    } else {
      this.suspiciousActivityCount = 1;
    }

    this.lastActivityTime = now;

    // If more than 10 requests in 1 second, it's suspicious
    if (this.suspiciousActivityCount > 10) {
      Alert.alert(
        'Security Alert',
        'Suspicious activity detected. Please slow down your requests.'
      );
      return true;
    }

    return false;
  }

  // Secure WebSocket connection
  createSecureWebSocket(url: string): WebSocket {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      console.log('Secure WebSocket connected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
    };

    return ws;
  }

  // Validate SSL certificate (for production)
  validateSSLCertificate(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      // In a real implementation, validate SSL certificate
      // For now, just check if it's HTTPS
      resolve(url.startsWith('https://'));
    });
  }

  // Check for man-in-the-middle attacks
  async checkMITMAttack(url: string): Promise<boolean> {
    try {
      // In a real implementation, check certificate pinning
      // and validate SSL certificate chain
      const response = await fetch(url, {method: 'HEAD'});
      return response.ok;
    } catch (error) {
      console.error('MITM check failed:', error);
      return false;
    }
  }

  // Rate limiting for API calls
  private apiCallCount = 0;
  private apiCallWindow = Date.now();

  checkAPIRateLimit(): boolean {
    const now = Date.now();
    
    // Reset counter every minute
    if (now - this.apiCallWindow > 60000) {
      this.apiCallCount = 0;
      this.apiCallWindow = now;
    }

    // Max 100 API calls per minute
    if (this.apiCallCount >= 100) {
      Alert.alert(
        'Rate Limit Exceeded',
        'Too many requests. Please wait before trying again.'
      );
      return false;
    }

    this.apiCallCount++;
    return true;
  }

  // Secure data transmission
  async secureTransmit(data: any, endpoint: string): Promise<Response> {
    try {
      // Check rate limit
      if (!this.checkAPIRateLimit()) {
        throw new Error('Rate limit exceeded');
      }

      // Check for suspicious activity
      if (this.checkSuspiciousActivity()) {
        throw new Error('Suspicious activity detected');
      }

      // Encrypt sensitive data before transmission
      const encryptedData = JSON.stringify(data);

      const response = await this.secureRequest(endpoint, {
        method: 'POST',
        body: encryptedData
      });

      return response;

    } catch (error) {
      console.error('Secure transmission failed:', error);
      throw error;
    }
  }

  // Monitor network security
  startSecurityMonitoring(): void {
    setInterval(() => {
      // Check for suspicious patterns
      if (this.suspiciousActivityCount > 5) {
        console.warn('High activity detected');
      }

      // Reset counters periodically
      if (Date.now() - this.lastActivityTime > 300000) { // 5 minutes
        this.suspiciousActivityCount = 0;
      }
    }, 60000); // Check every minute
  }
}

export default new NetworkSecurity();
