
// Este arquivo serve como API de serviço para consumidores externos
// Redireciona para serviços individuais

import { 
  fetchTourismData, 
  refreshTourismData,
  getSourceName
} from './tourism/apiClient';

import {
  getAutoUpdateEnabled,
  setAutoUpdateEnabled,
  getAutoUpdateInterval,
  setAutoUpdateInterval,
  getAutoUpdateLastRun,
  setAutoUpdateLastRun,
  checkAndTriggerAutoUpdate
} from './tourism/autoUpdate';

// Re-exporta todas as funções necessárias
export {
  fetchTourismData,
  refreshTourismData,
  getSourceName,
  getAutoUpdateEnabled,
  setAutoUpdateEnabled,
  getAutoUpdateInterval,
  setAutoUpdateInterval,
  getAutoUpdateLastRun,
  setAutoUpdateLastRun,
  checkAndTriggerAutoUpdate
};
