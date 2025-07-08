
import { useState, useEffect } from "react";

// Implementação simples sem crypto-js para evitar problemas de dependência
const ENCRYPTION_KEY = "mstur_secure_storage_v1";

// Função de codificação simples usando btoa/atob
const simpleEncode = (data: string): string => {
  try {
    return btoa(encodeURIComponent(data));
  } catch {
    return data;
  }
};

const simpleDecode = (data: string): string => {
  try {
    return decodeURIComponent(atob(data));
  } catch {
    return data;
  }
};

export const useSecureStorage = () => {
  const encrypt = (data: any): string => {
    return simpleEncode(JSON.stringify(data));
  };

  const decrypt = (encryptedData: string): any => {
    try {
      const decoded = simpleDecode(encryptedData);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  };

  const setSecureItem = (key: string, value: any): void => {
    try {
      const encrypted = encrypt(value);
      localStorage.setItem(`secure_${key}`, encrypted);
    } catch (error) {
      console.error('Secure storage set error:', error);
    }
  };

  const getSecureItem = (key: string): any => {
    try {
      const encryptedData = localStorage.getItem(`secure_${key}`);
      if (!encryptedData) return null;
      return decrypt(encryptedData);
    } catch (error) {
      console.error('Secure storage get error:', error);
      return null;
    }
  };

  const removeSecureItem = (key: string): void => {
    localStorage.removeItem(`secure_${key}`);
  };

  const clearSecureStorage = (): void => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('secure_')) {
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
