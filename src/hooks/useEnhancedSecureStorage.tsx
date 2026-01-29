import { useState, useEffect } from "react";

// Enhanced encryption using Web Crypto API
const ENCRYPTION_KEY_SIZE = 256;
const IV_SIZE = 12;
const STORAGE_PREFIX = "mstur_secure_v3_";

export class EnhancedSecureStorage {
  private static instance: EnhancedSecureStorage;
  private encryptionKey: CryptoKey | null = null;

  static getInstance(): EnhancedSecureStorage {
    if (!EnhancedSecureStorage.instance) {
      EnhancedSecureStorage.instance = new EnhancedSecureStorage();
    }
    return EnhancedSecureStorage.instance;
  }

  private async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: ENCRYPTION_KEY_SIZE,
      },
      false,
      ["encrypt", "decrypt"]
    );
  }

  private async getOrCreateKey(): Promise<CryptoKey> {
    if (!this.encryptionKey) {
      this.encryptionKey = await this.generateKey();
    }
    return this.encryptionKey;
  }

  async encrypt(data: unknown): Promise<string> {
    try {
      const key = await this.getOrCreateKey();
      const iv = crypto.getRandomValues(new Uint8Array(IV_SIZE));
      
      const encodedData = new TextEncoder().encode(JSON.stringify({
        data,
        timestamp: Date.now(),
        checksum: await this.calculateChecksum(JSON.stringify(data))
      }));

      const encrypted = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        encodedData
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error: unknown) {
      console.error('Enhanced encryption error:', error);
      throw new Error('Encryption failed');
    }
  }

  async decrypt(encryptedData: string): Promise<any> {
    try {
      const key = await this.getOrCreateKey();
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );

      const iv = combined.slice(0, IV_SIZE);
      const encrypted = combined.slice(IV_SIZE);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        encrypted
      );

      const decodedData = new TextDecoder().decode(decrypted);
      const parsed = JSON.parse(decodedData);

      // Verify checksum
      const expectedChecksum = await this.calculateChecksum(JSON.stringify(parsed.data));
      if (parsed.checksum !== expectedChecksum) {
        throw new Error('Data integrity check failed');
      }

      // Check if data is too old (7 days)
      const dataAge = Date.now() - parsed.timestamp;
      if (dataAge > 7 * 24 * 60 * 60 * 1000) {
        console.warn('Stored data is old and may be stale');
      }

      return parsed.data;
    } catch (error: unknown) {
      console.error('Enhanced decryption error:', error);
      throw new Error('Decryption failed');
    }
  }

  private async calculateChecksum(data: string): Promise<string> {
    const encoded = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async setSecureItem(key: string, value: unknown): Promise<void> {
    try {
      const encrypted = await this.encrypt(value);
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, encrypted);
    } catch (error: unknown) {
      console.error('Secure storage set error:', error);
      throw error;
    }
  }

  async getSecureItem(key: string): Promise<any> {
    try {
      const encryptedData = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!encryptedData) return null;
      return await this.decrypt(encryptedData);
    } catch (error: unknown) {
      console.error('Secure storage get error:', error);
      // Remove corrupted data
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      return null;
    }
  }

  removeSecureItem(key: string): void {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  }

  clearSecureStorage(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX) || key.startsWith('secure_') || key.startsWith('mstur_')) {
        localStorage.removeItem(key);
      }
    });
    this.encryptionKey = null; // Reset encryption key
  }

  async validateIntegrity(): Promise<boolean> {
    try {
      const testData = { test: 'integrity_check', timestamp: Date.now() };
      const encrypted = await this.encrypt(testData);
      const decrypted = await this.decrypt(encrypted);
      return JSON.stringify(testData) === JSON.stringify(decrypted);
    } catch {
      return false;
    }
  }
}

export const useEnhancedSecureStorage = () => {
  const [isReady, setIsReady] = useState(false);
  const storage = EnhancedSecureStorage.getInstance();

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        const isValid = await storage.validateIntegrity();
        if (!isValid) {
          console.warn('Storage integrity validation failed, clearing storage');
          storage.clearSecureStorage();
        }
        setIsReady(true);
      } catch (error: unknown) {
        console.error('Failed to initialize enhanced secure storage:', error);
        setIsReady(true); // Continue anyway
      }
    };

    initializeStorage();
  }, []);

  return {
    isReady,
    setSecureItem: storage.setSecureItem.bind(storage),
    getSecureItem: storage.getSecureItem.bind(storage),
    removeSecureItem: storage.removeSecureItem.bind(storage),
    clearSecureStorage: storage.clearSecureStorage.bind(storage),
    validateIntegrity: storage.validateIntegrity.bind(storage)
  };
};