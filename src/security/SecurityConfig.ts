export interface SecurityConfig {
  // Authentication settings
  auth: {
    maxLoginAttempts: number;
    lockoutDuration: number; // in milliseconds
    passwordMinLength: number;
    passwordRequireSpecialChars: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireUppercase: boolean;
    passwordRequireLowercase: boolean;
    sessionTimeout: number; // in milliseconds
    twoFactorRequired: boolean;
  };

  // Encryption settings
  encryption: {
    algorithm: string;
    keySize: number;
    iterations: number;
    saltLength: number;
    ivLength: number;
  };

  // Network security
  network: {
    timeout: number;
    maxRetries: number;
    requireHTTPS: boolean;
    certificatePinning: boolean;
    rateLimitPerMinute: number;
    maxRequestSize: number; // in bytes
  };

  // Data protection
  dataProtection: {
    encryptLocalStorage: boolean;
    encryptUserData: boolean;
    encryptBuzzContent: boolean;
    encryptMediaFiles: boolean;
    dataRetentionDays: number;
    autoDeleteOldData: boolean;
  };

  // Biometric settings
  biometric: {
    enabled: boolean;
    requiredForSensitiveActions: boolean;
    fallbackToPassword: boolean;
    maxBiometricAttempts: number;
  };

  // Monitoring settings
  monitoring: {
    logSecurityEvents: boolean;
    realTimeMonitoring: boolean;
    alertOnSuspiciousActivity: boolean;
    riskScoreThreshold: number;
    maxSecurityEvents: number;
  };

  // Privacy settings
  privacy: {
    collectAnalytics: boolean;
    shareDataWithThirdParties: boolean;
    allowDataExport: boolean;
    anonymizeUserData: boolean;
    trackUserBehavior: boolean;
  };
}

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  auth: {
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    twoFactorRequired: false
  },

  encryption: {
    algorithm: 'AES-256-CBC',
    keySize: 256,
    iterations: 100000,
    saltLength: 128,
    ivLength: 16
  },

  network: {
    timeout: 10000, // 10 seconds
    maxRetries: 3,
    requireHTTPS: true,
    certificatePinning: true,
    rateLimitPerMinute: 100,
    maxRequestSize: 10 * 1024 * 1024 // 10MB
  },

  dataProtection: {
    encryptLocalStorage: true,
    encryptUserData: true,
    encryptBuzzContent: true,
    encryptMediaFiles: true,
    dataRetentionDays: 365,
    autoDeleteOldData: true
  },

  biometric: {
    enabled: true,
    requiredForSensitiveActions: true,
    fallbackToPassword: true,
    maxBiometricAttempts: 3
  },

  monitoring: {
    logSecurityEvents: true,
    realTimeMonitoring: true,
    alertOnSuspiciousActivity: true,
    riskScoreThreshold: 70,
    maxSecurityEvents: 1000
  },

  privacy: {
    collectAnalytics: false,
    shareDataWithThirdParties: false,
    allowDataExport: true,
    anonymizeUserData: true,
    trackUserBehavior: false
  }
};

export const HIGH_SECURITY_CONFIG: SecurityConfig = {
  auth: {
    maxLoginAttempts: 3,
    lockoutDuration: 30 * 60 * 1000, // 30 minutes
    passwordMinLength: 12,
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    sessionTimeout: 15 * 60 * 1000, // 15 minutes
    twoFactorRequired: true
  },

  encryption: {
    algorithm: 'AES-256-GCM',
    keySize: 256,
    iterations: 200000,
    saltLength: 256,
    ivLength: 16
  },

  network: {
    timeout: 5000, // 5 seconds
    maxRetries: 2,
    requireHTTPS: true,
    certificatePinning: true,
    rateLimitPerMinute: 50,
    maxRequestSize: 5 * 1024 * 1024 // 5MB
  },

  dataProtection: {
    encryptLocalStorage: true,
    encryptUserData: true,
    encryptBuzzContent: true,
    encryptMediaFiles: true,
    dataRetentionDays: 90,
    autoDeleteOldData: true
  },

  biometric: {
    enabled: true,
    requiredForSensitiveActions: true,
    fallbackToPassword: false,
    maxBiometricAttempts: 2
  },

  monitoring: {
    logSecurityEvents: true,
    realTimeMonitoring: true,
    alertOnSuspiciousActivity: true,
    riskScoreThreshold: 50,
    maxSecurityEvents: 500
  },

  privacy: {
    collectAnalytics: false,
    shareDataWithThirdParties: false,
    allowDataExport: false,
    anonymizeUserData: true,
    trackUserBehavior: false
  }
};

export const MAXIMUM_SECURITY_CONFIG: SecurityConfig = {
  auth: {
    maxLoginAttempts: 2,
    lockoutDuration: 60 * 60 * 1000, // 1 hour
    passwordMinLength: 16,
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    sessionTimeout: 10 * 60 * 1000, // 10 minutes
    twoFactorRequired: true
  },

  encryption: {
    algorithm: 'AES-256-GCM',
    keySize: 256,
    iterations: 500000,
    saltLength: 512,
    ivLength: 16
  },

  network: {
    timeout: 3000, // 3 seconds
    maxRetries: 1,
    requireHTTPS: true,
    certificatePinning: true,
    rateLimitPerMinute: 25,
    maxRequestSize: 2 * 1024 * 1024 // 2MB
  },

  dataProtection: {
    encryptLocalStorage: true,
    encryptUserData: true,
    encryptBuzzContent: true,
    encryptMediaFiles: true,
    dataRetentionDays: 30,
    autoDeleteOldData: true
  },

  biometric: {
    enabled: true,
    requiredForSensitiveActions: true,
    fallbackToPassword: false,
    maxBiometricAttempts: 1
  },

  monitoring: {
    logSecurityEvents: true,
    realTimeMonitoring: true,
    alertOnSuspiciousActivity: true,
    riskScoreThreshold: 30,
    maxSecurityEvents: 200
  },

  privacy: {
    collectAnalytics: false,
    shareDataWithThirdParties: false,
    allowDataExport: false,
    anonymizeUserData: true,
    trackUserBehavior: false
  }
};

export const SECURITY_LEVELS = {
  BASIC: 'basic',
  ENHANCED: 'enhanced',
  HIGH: 'high',
  MAXIMUM: 'maximum'
} as const;

export type SecurityLevel = typeof SECURITY_LEVELS[keyof typeof SECURITY_LEVELS];

export const getSecurityConfig = (level: SecurityLevel): SecurityConfig => {
  switch (level) {
    case SECURITY_LEVELS.BASIC:
      return DEFAULT_SECURITY_CONFIG;
    case SECURITY_LEVELS.ENHANCED:
      return DEFAULT_SECURITY_CONFIG; // Same as basic for now
    case SECURITY_LEVELS.HIGH:
      return HIGH_SECURITY_CONFIG;
    case SECURITY_LEVELS.MAXIMUM:
      return MAXIMUM_SECURITY_CONFIG;
    default:
      return DEFAULT_SECURITY_CONFIG;
  }
};
