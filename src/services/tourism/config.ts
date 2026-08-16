
import { fetchCompatible, fetchWithTimeout, checkApiAvailability } from "./fetchCompatible";

export { fetchCompatible, fetchWithTimeout, checkApiAvailability };

// API URL para o serviço de dados turísticos
export const API_URL = "https://api-turismo-ms.vercel.app";

// Default API URL for tourism data service
export const DEFAULT_TOURISM_API_URL = API_URL;

// Key for storing tourism data in localStorage
export const DEFAULT_LOCAL_STORAGE_KEY = "ms_tourism_data";

// Modo mock para desenvolvimento e testes
export const MOCK_MODE = false; // Alterado para false para priorizar dados reais

// Chaves para armazenamento local (localStorage)
export const AUTO_UPDATE_ENABLED_KEY = "ms_tourism_auto_update_enabled";
export const AUTO_UPDATE_INTERVAL_KEY = "ms_tourism_auto_update_interval";
export const AUTO_UPDATE_LAST_RUN_KEY = "ms_tourism_auto_update_last_run";
export const DEFAULT_UPDATE_INTERVAL = 6; // em horas
