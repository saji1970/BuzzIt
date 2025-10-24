import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

class EncryptionService {
  private readonly MASTER_KEY = 'BuzzIt_Master_Key_2024_Ultra_Secure';
  private readonly IV_LENGTH = 16;

  // Generate encryption key from master key and user-specific data
  private generateKey(userId: string, salt: string): string {
    return CryptoJS.PBKDF2(this.MASTER_KEY + userId, salt, {
      keySize: 256 / 32,
      iterations: 100000
    }).toString();
  }

  // Generate random IV
  private generateIV(): string {
    return CryptoJS.lib.WordArray.random(this.IV_LENGTH).toString();
  }

  // Encrypt data with AES-256-GCM
  encryptData(data: any, userId: string): {encrypted: string; iv: string; salt: string} {
    try {
      const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
      const key = this.generateKey(userId, salt);
      const iv = this.generateIV();
      
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return {
        encrypted: encrypted.toString(),
        iv,
        salt
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt data with AES-256-GCM
  decryptData(encryptedData: string, iv: string, salt: string, userId: string): any {
    try {
      const key = this.generateKey(userId, salt);
      
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      if (!decryptedString) {
        throw new Error('Failed to decrypt data');
      }

      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Encrypt and store sensitive data
  async storeEncryptedData(key: string, data: any, userId: string): Promise<void> {
    try {
      const encrypted = this.encryptData(data, userId);
      const encryptedData = {
        ...encrypted,
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(encryptedData));
    } catch (error) {
      console.error('Store encrypted data error:', error);
      throw new Error('Failed to store encrypted data');
    }
  }

  // Retrieve and decrypt sensitive data
  async getEncryptedData(key: string, userId: string): Promise<any> {
    try {
      const encryptedDataString = await AsyncStorage.getItem(key);
      if (!encryptedDataString) return null;

      const encryptedData = JSON.parse(encryptedDataString);
      return this.decryptData(
        encryptedData.encrypted,
        encryptedData.iv,
        encryptedData.salt,
        userId
      );
    } catch (error) {
      console.error('Get encrypted data error:', error);
      return null;
    }
  }

  // Encrypt buzz content
  encryptBuzzContent(content: string, userId: string): string {
    try {
      const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
      const key = this.generateKey(userId, salt);
      const iv = this.generateIV();
      
      const encrypted = CryptoJS.AES.encrypt(content, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return JSON.stringify({
        encrypted: encrypted.toString(),
        iv,
        salt
      });
    } catch (error) {
      console.error('Encrypt buzz content error:', error);
      throw new Error('Failed to encrypt buzz content');
    }
  }

  // Decrypt buzz content
  decryptBuzzContent(encryptedContent: string, userId: string): string {
    try {
      const data = JSON.parse(encryptedContent);
      const key = this.generateKey(userId, data.salt);
      
      const decrypted = CryptoJS.AES.decrypt(data.encrypted, key, {
        iv: CryptoJS.enc.Hex.parse(data.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decrypt buzz content error:', error);
      throw new Error('Failed to decrypt buzz content');
    }
  }

  // Hash sensitive data for integrity checking
  hashData(data: any): string {
    return CryptoJS.SHA256(JSON.stringify(data)).toString();
  }

  // Verify data integrity
  verifyDataIntegrity(data: any, expectedHash: string): boolean {
    const actualHash = this.hashData(data);
    return actualHash === expectedHash;
  }

  // Secure random string generation
  generateSecureRandom(length: number = 32): string {
    return CryptoJS.lib.WordArray.random(length / 2).toString();
  }

  // Encrypt file data
  encryptFile(fileData: string, userId: string): {encrypted: string; iv: string; salt: string} {
    try {
      const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
      const key = this.generateKey(userId, salt);
      const iv = this.generateIV();
      
      const encrypted = CryptoJS.AES.encrypt(fileData, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return {
        encrypted: encrypted.toString(),
        iv,
        salt
      };
    } catch (error) {
      console.error('Encrypt file error:', error);
      throw new Error('Failed to encrypt file');
    }
  }

  // Decrypt file data
  decryptFile(encryptedFile: string, iv: string, salt: string, userId: string): string {
    try {
      const key = this.generateKey(userId, salt);
      
      const decrypted = CryptoJS.AES.decrypt(encryptedFile, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decrypt file error:', error);
      throw new Error('Failed to decrypt file');
    }
  }
}

export default new EncryptionService();
