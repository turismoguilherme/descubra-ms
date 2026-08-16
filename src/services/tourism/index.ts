
// Export the main module that consolidates all functionality

// API exports
export { fetchTourismData, refreshTourismData, getSourceName } from './api';

// Auto-update configuration exports
export {
  getAutoUpdateEnabled,
  setAutoUpdateEnabled,
  getAutoUpdateInterval,
  setAutoUpdateInterval,
  getAutoUpdateLastRun,
  setAutoUpdateLastRun,
  checkAndTriggerAutoUpdate
} from './autoUpdate';

// Re-export mockData for tests
export { mockData } from './mockData';
