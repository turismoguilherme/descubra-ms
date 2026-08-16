
// Adding utility functions for localStorage access that were previously missing
const getLocalStorageItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return null;
  }
};

const setLocalStorageItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error);
  }
};

import { 
  API_URL, 
  DEFAULT_TOURISM_API_URL, 
  DEFAULT_LOCAL_STORAGE_KEY,
  MOCK_MODE, 
  AUTO_UPDATE_ENABLED_KEY, 
  AUTO_UPDATE_INTERVAL_KEY, 
  AUTO_UPDATE_LAST_RUN_KEY, 
  DEFAULT_UPDATE_INTERVAL 
} from "./config";

// Configurações de API
export const getTourismApiUrl = (): string => {
  const savedUrl = getLocalStorageItem("ms_tourism_api_url");
  return savedUrl || DEFAULT_TOURISM_API_URL;
};

export const setTourismApiUrl = (url: string): void => {
  setLocalStorageItem("ms_tourism_api_url", url);
};

// Configurações de cache
export const getLocalStorageKey = (): string => {
  const savedKey = getLocalStorageItem("ms_tourism_storage_key");
  return savedKey || DEFAULT_LOCAL_STORAGE_KEY;
};

export const setLocalStorageKey = (key: string): void => {
  setLocalStorageItem("ms_tourism_storage_key", key);
};

// Função para limpar o cache do turismo
export const clearTourismCache = (): void => {
  localStorage.removeItem(getLocalStorageKey());
};

// Modo Mock
export const isMockModeEnabled = (): boolean => {
  const savedMode = getLocalStorageItem("ms_tourism_mock_mode");
  return savedMode !== null ? savedMode === "true" : MOCK_MODE;
};

export const setMockMode = (enabled: boolean): void => {
  setLocalStorageItem("ms_tourism_mock_mode", enabled.toString());
};

// Auto atualização
export const isAutoUpdateEnabled = (): boolean => {
  const savedSetting = getLocalStorageItem(AUTO_UPDATE_ENABLED_KEY);
  return savedSetting !== null ? savedSetting === "true" : true;
};

export const setAutoUpdateEnabled = (enabled: boolean): void => {
  setLocalStorageItem(AUTO_UPDATE_ENABLED_KEY, enabled.toString());
};

export const getAutoUpdateInterval = (): number => {
  const savedInterval = getLocalStorageItem(AUTO_UPDATE_INTERVAL_KEY);
  return savedInterval ? parseInt(savedInterval, 10) : DEFAULT_UPDATE_INTERVAL;
};

export const setAutoUpdateInterval = (hours: number): void => {
  setLocalStorageItem(AUTO_UPDATE_INTERVAL_KEY, hours.toString());
};

export const getLastAutoUpdateTime = (): number => {
  const lastRun = getLocalStorageItem(AUTO_UPDATE_LAST_RUN_KEY);
  return lastRun ? parseInt(lastRun, 10) : 0;
};

export const setLastAutoUpdateTime = (timestamp: number): void => {
  setLocalStorageItem(AUTO_UPDATE_LAST_RUN_KEY, timestamp.toString());
};
