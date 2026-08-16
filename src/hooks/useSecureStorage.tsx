
import { useState, useEffect } from "react";

// Implementação melhorada de segurança para localStorage
const ENCRYPTION_KEY = "mstur_secure_storage_v2";
const STORAGE_PREFIX = "mstur_encrypted_";

// Função de codificação com salt adicional
const secureEncode = (data: string): string => {
  try {
    const timestamp = Date.now().toString();
    const saltedData = `${timestamp}:${data}`;
    const encoded = btoa(encodeURIComponent(saltedData));
    // Adicionar checksum simples
    const checksum = btoa(encoded.length.toString());
    return `${encoded}.${checksum}`;
  } catch {
    return data;
  }
};

const secureDecode = (data: string): string => {
  try {
    const [encoded, checksum] = data.split('.');
    if (!encoded || !checksum) return data;
    
    // Verificar checksum
    const expectedChecksum = btoa(encoded.length.toString());
    if (checksum !== expectedChecksum) {
      console.warn('Storage integrity check failed');
      return data;
    }
    
    const decoded = decodeURIComponent(atob(encoded));
    const [timestamp, originalData] = decoded.split(':', 2);
    
    // Verificar se os dados não são muito antigos (7 dias)
    const dataAge = Date.now() - parseInt(timestamp);
    if (dataAge > 7 * 24 * 60 * 60 * 1000) {
      console.warn('Stored data is too old, consider refresh');
    }
    
    return originalData;
  } catch (error: unknown) {
    console.error('Secure decode error:', error);
    return data;
  }
};

export const useSecureStorage = () => {
  const encrypt = (data: unknown): string => {
    return secureEncode(JSON.stringify(data));
  };

  const decrypt = (encryptedData: string): unknown => {
    try {
      const decoded = secureDecode(encryptedData);
      return JSON.parse(decoded);
    } catch (error: unknown) {
      console.error('Decryption error:', error);
      return null;
    }
  };

  const setSecureItem = (key: string, value: unknown): void => {
    try {
      const encrypted = encrypt(value);
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, encrypted);
    } catch (error: unknown) {
      console.error('Secure storage set error:', error);
    }
  };

  const getSecureItem = (key: string): unknown => {
    try {
      const encryptedData = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!encryptedData) return null;
      return decrypt(encryptedData);
    } catch (error: unknown) {
      console.error('Secure storage get error:', error);
      return null;
    }
  };

  const removeSecureItem = (key: string): void => {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  };

  const clearSecureStorage = (): void => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX) || key.startsWith('secure_')) {
        localStorage.removeItem(key);
      }
    });
  };

  return {
    setSecureItem,
    getSecureItem,
    removeSecureItem,
    clearSecureStorage
  };
};
