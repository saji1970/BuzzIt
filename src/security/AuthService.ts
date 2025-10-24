import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import {Alert} from 'react-native';

export interface UserCredentials {
  username: string;
  password: string;
  email: string;
  displayName: string;
}

export interface SecureUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  avatar: string | null;
  interests: string[];
  followers: number;
  following: number;
  buzzCount: number;
  createdAt: Date;
  isVerified: boolean;
  securityLevel: 'basic' | 'enhanced' | 'maximum';
  lastLogin: Date;
  failedLoginAttempts: number;
  accountLocked: boolean;
  twoFactorEnabled: boolean;
}

class AuthService {
  private readonly SECRET_KEY = 'BuzzIt_Secure_Key_2024_Ultra_Safe';
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  // Password validation
  validatePassword(password: string): {isValid: boolean; errors: string[]} {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
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
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common. Please choose a stronger password');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Email validation
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Username validation
  validateUsername(username: string): {isValid: boolean; errors: string[]} {
    const errors: string[] = [];
    
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    if (username.length > 20) {
      errors.push('Username must be less than 20 characters');
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }
    
    // Check for reserved usernames
    const reservedUsernames = [
      'admin', 'administrator', 'root', 'system', 'api', 'www',
      'support', 'help', 'info', 'contact', 'buzzit', 'official'
    ];
    
    if (reservedUsernames.includes(username.toLowerCase())) {
      errors.push('This username is reserved');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Hash password with salt
  private hashPassword(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000
    }).toString();
  }

  // Generate secure salt
  private generateSalt(): string {
    return CryptoJS.lib.WordArray.random(128 / 8).toString();
  }

  // Generate secure token
  private generateSecureToken(): string {
    return CryptoJS.lib.WordArray.random(256 / 8).toString();
  }

  // Encrypt sensitive data
  private encryptData(data: string): string {
    return CryptoJS.AES.encrypt(data, this.SECRET_KEY).toString();
  }

  // Decrypt sensitive data
  private decryptData(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Register new user
  async register(credentials: UserCredentials): Promise<{success: boolean; message: string}> {
    try {
      // Validate input
      const passwordValidation = this.validatePassword(credentials.password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: passwordValidation.errors.join(', ')
        };
      }

      const emailValidation = this.validateEmail(credentials.email);
      if (!emailValidation) {
        return {
          success: false,
          message: 'Invalid email format'
        };
      }

      const usernameValidation = this.validateUsername(credentials.username);
      if (!usernameValidation.isValid) {
        return {
          success: false,
          message: usernameValidation.errors.join(', ')
        };
      }

      // Check if user already exists
      const existingUser = await this.getUserByUsername(credentials.username);
      if (existingUser) {
        return {
          success: false,
          message: 'Username already exists'
        };
      }

      // Generate salt and hash password
      const salt = this.generateSalt();
      const hashedPassword = this.hashPassword(credentials.password, salt);

      // Create secure user object
      const secureUser: SecureUser = {
        id: this.generateSecureToken(),
        username: credentials.username,
        displayName: credentials.displayName,
        email: credentials.email,
        bio: '',
        avatar: null,
        interests: [],
        followers: 0,
        following: 0,
        buzzCount: 0,
        createdAt: new Date(),
        isVerified: false,
        securityLevel: 'basic',
        lastLogin: new Date(),
        failedLoginAttempts: 0,
        accountLocked: false,
        twoFactorEnabled: false
      };

      // Encrypt and store user data
      const encryptedUser = this.encryptData(JSON.stringify(secureUser));
      const encryptedPassword = this.encryptData(hashedPassword);
      const encryptedSalt = this.encryptData(salt);

      await AsyncStorage.setItem(`user_${credentials.username}`, encryptedUser);
      await AsyncStorage.setItem(`password_${credentials.username}`, encryptedPassword);
      await AsyncStorage.setItem(`salt_${credentials.username}`, encryptedSalt);

      return {
        success: true,
        message: 'Account created successfully'
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  }

  // Login user
  async login(username: string, password: string): Promise<{success: boolean; user?: SecureUser; message: string}> {
    try {
      // Check if account is locked
      const user = await this.getUserByUsername(username);
      if (!user) {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }

      if (user.accountLocked) {
        const lockoutTime = user.lastLogin.getTime() + this.LOCKOUT_DURATION;
        if (Date.now() < lockoutTime) {
          return {
            success: false,
            message: 'Account is temporarily locked due to too many failed attempts'
          };
        } else {
          // Unlock account
          user.accountLocked = false;
          user.failedLoginAttempts = 0;
          await this.updateUser(user);
        }
      }

      // Get stored password and salt
      const encryptedPassword = await AsyncStorage.getItem(`password_${username}`);
      const encryptedSalt = await AsyncStorage.getItem(`salt_${username}`);

      if (!encryptedPassword || !encryptedSalt) {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }

      const storedPassword = this.decryptData(encryptedPassword);
      const salt = this.decryptData(encryptedSalt);
      const hashedPassword = this.hashPassword(password, salt);

      if (hashedPassword !== storedPassword) {
        // Increment failed attempts
        user.failedLoginAttempts += 1;
        user.lastLogin = new Date();

        if (user.failedLoginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
          user.accountLocked = true;
          await this.updateUser(user);
          return {
            success: false,
            message: 'Account locked due to too many failed attempts'
          };
        }

        await this.updateUser(user);
        return {
          success: false,
          message: `Invalid credentials. ${this.MAX_LOGIN_ATTEMPTS - user.failedLoginAttempts} attempts remaining`
        };
      }

      // Successful login
      user.failedLoginAttempts = 0;
      user.lastLogin = new Date();
      await this.updateUser(user);

      return {
        success: true,
        user,
        message: 'Login successful'
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  // Get user by username
  private async getUserByUsername(username: string): Promise<SecureUser | null> {
    try {
      const encryptedUser = await AsyncStorage.getItem(`user_${username}`);
      if (!encryptedUser) return null;

      const userData = this.decryptData(encryptedUser);
      return JSON.parse(userData);
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Update user data
  private async updateUser(user: SecureUser): Promise<void> {
    try {
      const encryptedUser = this.encryptData(JSON.stringify(user));
      await AsyncStorage.setItem(`user_${user.username}`, encryptedUser);
    } catch (error) {
      console.error('Update user error:', error);
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('current_user');
      await AsyncStorage.removeItem('session_token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Change password
  async changePassword(username: string, oldPassword: string, newPassword: string): Promise<{success: boolean; message: string}> {
    try {
      // Validate new password
      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: passwordValidation.errors.join(', ')
        };
      }

      // Verify old password
      const loginResult = await this.login(username, oldPassword);
      if (!loginResult.success) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }

      // Generate new salt and hash
      const salt = this.generateSalt();
      const hashedPassword = this.hashPassword(newPassword, salt);

      // Update stored password
      const encryptedPassword = this.encryptData(hashedPassword);
      const encryptedSalt = this.encryptData(salt);

      await AsyncStorage.setItem(`password_${username}`, encryptedPassword);
      await AsyncStorage.setItem(`salt_${username}`, encryptedSalt);

      return {
        success: true,
        message: 'Password changed successfully'
      };

    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Password change failed'
      };
    }
  }

  // Enable two-factor authentication
  async enable2FA(username: string): Promise<{success: boolean; secret?: string; message: string}> {
    try {
      // Generate 2FA secret (in real app, use proper TOTP library)
      const secret = this.generateSecureToken();
      
      const user = await this.getUserByUsername(username);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      user.twoFactorEnabled = true;
      await this.updateUser(user);

      return {
        success: true,
        secret,
        message: 'Two-factor authentication enabled'
      };

    } catch (error) {
      console.error('Enable 2FA error:', error);
      return {
        success: false,
        message: 'Failed to enable two-factor authentication'
      };
    }
  }
}

export default new AuthService();
