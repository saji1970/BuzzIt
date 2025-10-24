import {Alert, Platform} from 'react-native';
import TouchID from 'react-native-touch-id';
import {BiometricAuth} from 'react-native-biometric-auth';

interface BiometricResult {
  success: boolean;
  error?: string;
}

class BiometricAuthentication {
  private readonly BIOMETRIC_TYPES = {
    TouchID: 'TouchID',
    FaceID: 'FaceID',
    Fingerprint: 'Fingerprint',
    Face: 'Face',
    Iris: 'Iris'
  };

  // Check if biometric authentication is available
  async isBiometricAvailable(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const available = await TouchID.isSupported();
        return available;
      } else {
        // Android implementation
        const available = await BiometricAuth.isSupported();
        return available;
      }
    } catch (error) {
      console.error('Biometric availability check failed:', error);
      return false;
    }
  }

  // Get available biometric types
  async getAvailableBiometricTypes(): Promise<string[]> {
    try {
      if (Platform.OS === 'ios') {
        const types = await TouchID.getSupportedBiometryType();
        return types ? [types] : [];
      } else {
        const types = await BiometricAuth.getSupportedBiometryType();
        return types || [];
      }
    } catch (error) {
      console.error('Get biometric types failed:', error);
      return [];
    }
  }

  // Authenticate with biometric
  async authenticate(reason: string = 'Authenticate to access Buzz it'): Promise<BiometricResult> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device'
        };
      }

      if (Platform.OS === 'ios') {
        const result = await TouchID.authenticate(reason, {
          title: 'Biometric Authentication',
          subTitle: 'Use your biometric to authenticate',
          description: 'Place your finger on the sensor or look at the camera',
          fallbackLabel: 'Use Passcode',
          cancelLabel: 'Cancel'
        });

        return {
          success: result === true,
          error: result === true ? undefined : 'Authentication failed'
        };
      } else {
        const result = await BiometricAuth.authenticate({
          title: 'Biometric Authentication',
          subtitle: 'Use your biometric to authenticate',
          description: 'Place your finger on the sensor or look at the camera',
          negativeButtonText: 'Cancel',
          fallbackLabel: 'Use Password'
        });

        return {
          success: result.success,
          error: result.success ? undefined : result.error
        };
      }
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return {
        success: false,
        error: 'Authentication failed. Please try again.'
      };
    }
  }

  // Setup biometric authentication
  async setupBiometric(): Promise<BiometricResult> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device'
        };
      }

      // First authenticate to ensure biometric is set up
      const authResult = await this.authenticate('Setup biometric authentication for Buzz it');
      if (!authResult.success) {
        return authResult;
      }

      // Store biometric preference
      await this.setBiometricPreference(true);

      return {
        success: true
      };
    } catch (error) {
      console.error('Setup biometric failed:', error);
      return {
        success: false,
        error: 'Failed to setup biometric authentication'
      };
    }
  }

  // Disable biometric authentication
  async disableBiometric(): Promise<BiometricResult> {
    try {
      // Authenticate before disabling
      const authResult = await this.authenticate('Disable biometric authentication');
      if (!authResult.success) {
        return authResult;
      }

      // Remove biometric preference
      await this.setBiometricPreference(false);

      return {
        success: true
      };
    } catch (error) {
      console.error('Disable biometric failed:', error);
      return {
        success: false,
        error: 'Failed to disable biometric authentication'
      };
    }
  }

  // Check if biometric is enabled
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const preference = await this.getBiometricPreference();
      return preference === true;
    } catch (error) {
      console.error('Check biometric preference failed:', error);
      return false;
    }
  }

  // Store biometric preference
  private async setBiometricPreference(enabled: boolean): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('biometric_enabled', JSON.stringify(enabled));
    } catch (error) {
      console.error('Store biometric preference failed:', error);
    }
  }

  // Get biometric preference
  private async getBiometricPreference(): Promise<boolean> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const preference = await AsyncStorage.getItem('biometric_enabled');
      return preference ? JSON.parse(preference) : false;
    } catch (error) {
      console.error('Get biometric preference failed:', error);
      return false;
    }
  }

  // Secure authentication with fallback
  async secureAuthenticate(
    reason: string = 'Authenticate to access Buzz it',
    fallbackToPassword: boolean = true
  ): Promise<BiometricResult> {
    try {
      const isEnabled = await this.isBiometricEnabled();
      if (!isEnabled) {
        if (fallbackToPassword) {
          return await this.fallbackToPassword();
        }
        return {
          success: false,
          error: 'Biometric authentication is not enabled'
        };
      }

      const result = await this.authenticate(reason);
      if (result.success) {
        return result;
      }

      if (fallbackToPassword) {
        return await this.fallbackToPassword();
      }

      return result;
    } catch (error) {
      console.error('Secure authentication failed:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  // Fallback to password authentication
  private async fallbackToPassword(): Promise<BiometricResult> {
    return new Promise((resolve) => {
      Alert.alert(
        'Biometric Authentication',
        'Biometric authentication failed. Please use your password.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve({
              success: false,
              error: 'Authentication cancelled'
            })
          },
          {
            text: 'Use Password',
            onPress: () => resolve({
              success: true
            })
          }
        ]
      );
    });
  }

  // Check biometric security level
  async getSecurityLevel(): Promise<'none' | 'basic' | 'enhanced' | 'maximum'> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        return 'none';
      }

      const types = await this.getAvailableBiometricTypes();
      const isEnabled = await this.isBiometricEnabled();

      if (!isEnabled) {
        return 'basic';
      }

      if (types.includes('FaceID') || types.includes('Iris')) {
        return 'maximum';
      }

      if (types.includes('TouchID') || types.includes('Fingerprint')) {
        return 'enhanced';
      }

      return 'basic';
    } catch (error) {
      console.error('Get security level failed:', error);
      return 'none';
    }
  }

  // Validate biometric integrity
  async validateBiometricIntegrity(): Promise<boolean> {
    try {
      // Check if biometric data has been tampered with
      const isAvailable = await this.isBiometricAvailable();
      const isEnabled = await this.isBiometricEnabled();

      if (!isAvailable && isEnabled) {
        // Biometric was enabled but is no longer available
        console.warn('Biometric integrity compromised');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Biometric integrity check failed:', error);
      return false;
    }
  }

  // Setup biometric with security questions
  async setupBiometricWithQuestions(securityQuestions: string[]): Promise<BiometricResult> {
    try {
      // First authenticate with biometric
      const authResult = await this.authenticate('Setup enhanced security');
      if (!authResult.success) {
        return authResult;
      }

      // Store security questions
      await this.storeSecurityQuestions(securityQuestions);

      // Enable biometric
      await this.setBiometricPreference(true);

      return {
        success: true
      };
    } catch (error) {
      console.error('Setup biometric with questions failed:', error);
      return {
        success: false,
        error: 'Failed to setup enhanced security'
      };
    }
  }

  // Store security questions
  private async storeSecurityQuestions(questions: string[]): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('security_questions', JSON.stringify(questions));
    } catch (error) {
      console.error('Store security questions failed:', error);
    }
  }

  // Get security questions
  async getSecurityQuestions(): Promise<string[]> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const questions = await AsyncStorage.getItem('security_questions');
      return questions ? JSON.parse(questions) : [];
    } catch (error) {
      console.error('Get security questions failed:', error);
      return [];
    }
  }
}

export default new BiometricAuthentication();
