import {Alert} from 'react-native';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
}

class InputValidation {
  // Sanitize HTML content
  sanitizeHTML(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Validate and sanitize text input
  validateTextInput(input: string, maxLength: number = 500): ValidationResult {
    const errors: string[] = [];
    let sanitizedValue = input.trim();

    // Check length
    if (sanitizedValue.length === 0) {
      errors.push('Input cannot be empty');
    }

    if (sanitizedValue.length > maxLength) {
      errors.push(`Input must be less than ${maxLength} characters`);
    }

    // Check for XSS attempts
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]+src[^>]*>/gi,
      /<link[^>]+>/gi,
      /<meta[^>]+>/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(sanitizedValue)) {
        errors.push('Invalid content detected');
        break;
      }
    }

    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
      /(\b(OR|AND)\s+'.*'\s*=\s*'.*')/gi,
      /(\b(OR|AND)\s+".*"\s*=\s*".*")/gi,
      /(\b(OR|AND)\s+\w+\s*=\s*\w+)/gi
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(sanitizedValue)) {
        errors.push('Invalid content detected');
        break;
      }
    }

    // Check for command injection
    const commandPatterns = [
      /[;&|`$()]/g,
      /\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig)\b/gi,
      /\b(rm|del|format|fdisk|mkfs)\b/gi
    ];

    for (const pattern of commandPatterns) {
      if (pattern.test(sanitizedValue)) {
        errors.push('Invalid content detected');
        break;
      }
    }

    // Sanitize the input
    if (errors.length === 0) {
      sanitizedValue = this.sanitizeHTML(sanitizedValue);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? sanitizedValue : undefined
    };
  }

  // Validate email input
  validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    const sanitizedEmail = email.trim().toLowerCase();

    if (sanitizedEmail.length === 0) {
      errors.push('Email is required');
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(sanitizedEmail)) {
      errors.push('Invalid email format');
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(sanitizedEmail)) {
        errors.push('Invalid email format');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? sanitizedEmail : undefined
    };
  }

  // Validate username input
  validateUsername(username: string): ValidationResult {
    const errors: string[] = [];
    const sanitizedUsername = username.trim();

    if (sanitizedUsername.length === 0) {
      errors.push('Username is required');
    }

    if (sanitizedUsername.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (sanitizedUsername.length > 20) {
      errors.push('Username must be less than 20 characters');
    }

    // Only allow alphanumeric and underscore
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(sanitizedUsername)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }

    // Check for reserved usernames
    const reservedUsernames = [
      'admin', 'administrator', 'root', 'system', 'api', 'www',
      'support', 'help', 'info', 'contact', 'buzzit', 'official',
      'moderator', 'staff', 'team', 'buzz', 'user', 'test'
    ];

    if (reservedUsernames.includes(sanitizedUsername.toLowerCase())) {
      errors.push('This username is reserved');
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /[;&|`$()]/g
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(sanitizedUsername)) {
        errors.push('Invalid username format');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? sanitizedUsername : undefined
    };
  }

  // Validate password input
  validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey',
      '12345678', 'password1', '123123', '1234567890'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common. Please choose a stronger password');
    }

    // Check for sequential patterns
    const sequentialPatterns = [
      /123456/,
      /abcdef/gi,
      /qwerty/gi,
      /asdfgh/gi
    ];

    for (const pattern of sequentialPatterns) {
      if (pattern.test(password)) {
        errors.push('Password contains sequential patterns');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate file upload
  validateFileUpload(fileName: string, fileSize: number, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']): ValidationResult {
    const errors: string[] = [];

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileSize > maxSize) {
      errors.push('File size must be less than 10MB');
    }

    // Check file extension
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    const allowedExtensions = allowedTypes.map(type => type.split('/')[1]);
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      errors.push(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`);
    }

    // Check for suspicious file names
    const suspiciousPatterns = [
      /<script/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /[;&|`$()]/g,
      /\.\.\//g,
      /\.\.\\/g
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(fileName)) {
        errors.push('Invalid file name');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate URL input
  validateURL(url: string): ValidationResult {
    const errors: string[] = [];
    const sanitizedURL = url.trim();

    if (sanitizedURL.length === 0) {
      errors.push('URL is required');
    }

    try {
      const url = new URL(sanitizedURL);
      
      // Check protocol
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.push('Only HTTP and HTTPS URLs are allowed');
      }

      // Check for suspicious domains
      const suspiciousDomains = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        'file://',
        'ftp://',
        'javascript:',
        'data:'
      ];

      for (const domain of suspiciousDomains) {
        if (sanitizedURL.includes(domain)) {
          errors.push('Suspicious URL detected');
          break;
        }
      }

    } catch (error) {
      errors.push('Invalid URL format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: errors.length === 0 ? sanitizedURL : undefined
    };
  }

  // Rate limiting check
  private rateLimitMap = new Map<string, {count: number; resetTime: number}>();

  checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const key = identifier;
    const current = this.rateLimitMap.get(key);

    if (!current || now > current.resetTime) {
      this.rateLimitMap.set(key, {count: 1, resetTime: now + windowMs});
      return true;
    }

    if (current.count >= maxRequests) {
      return false;
    }

    current.count++;
    this.rateLimitMap.set(key, current);
    return true;
  }

  // Show validation errors
  showValidationErrors(errors: string[]): void {
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
    }
  }
}

export default new InputValidation();
