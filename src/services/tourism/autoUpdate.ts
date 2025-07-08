
import { AUTO_UPDATE_ENABLED_KEY, AUTO_UPDATE_INTERVAL_KEY, AUTO_UPDATE_LAST_RUN_KEY, DEFAULT_UPDATE_INTERVAL } from "./config";
import { refreshTourismData } from "./apiClient";

/**
 * Enable or disable automatic data updates
 */
export function setAutoUpdateEnabled(enabled: boolean): void {
  localStorage.setItem(AUTO_UPDATE_ENABLED_KEY, enabled.toString());
  console.log(`Atualização automática ${enabled ? 'ativada' : 'desativada'}`);
}

/**
 * Check if automatic updates are enabled
 */
export function getAutoUpdateEnabled(): boolean {
  const setting = localStorage.getItem(AUTO_UPDATE_ENABLED_KEY);
  return setting === 'true';
}

/**
 * Set the interval in hours for automatic updates
 */
export function setAutoUpdateInterval(hours: number): void {
  if (hours < 1) {
    hours = 1; // Minimum 1 hour
  } else if (hours > 72) {
    hours = 72; // Maximum 3 days
  }
  
  localStorage.setItem(AUTO_UPDATE_INTERVAL_KEY, hours.toString());
  console.log(`Intervalo de atualização automática definido para ${hours} horas`);
}

/**
 * Get the current automatic update interval in hours
 */
export function getAutoUpdateInterval(): number {
  const interval = localStorage.getItem(AUTO_UPDATE_INTERVAL_KEY);
  return interval ? parseInt(interval) : DEFAULT_UPDATE_INTERVAL;
}

/**
 * Set the timestamp of the last automatic update
 */
export function setAutoUpdateLastRun(timestamp: string): void {
  localStorage.setItem(AUTO_UPDATE_LAST_RUN_KEY, timestamp);
}

/**
 * Get the timestamp of the last automatic update
 */
export function getAutoUpdateLastRun(): string | null {
  return localStorage.getItem(AUTO_UPDATE_LAST_RUN_KEY);
}

/**
 * Check if an automatic update is due and trigger it if necessary
 */
export async function checkAndTriggerAutoUpdate(): Promise<void> {
  // Check if auto-updates are enabled
  if (!getAutoUpdateEnabled()) {
    return;
  }
  
  const lastRun = getAutoUpdateLastRun();
  const interval = getAutoUpdateInterval();
  
  if (!lastRun) {
    // If never run, trigger now
    console.log('Primeira atualização automática iniciada');
    await refreshTourismData();
    return;
  }
  
  const lastRunDate = new Date(lastRun);
  const now = new Date();
  const hoursSinceLastRun = (now.getTime() - lastRunDate.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceLastRun >= interval) {
    console.log(`Atualização automática iniciada (última: ${lastRun})`);
    await refreshTourismData();
  } else {
    console.log(`Atualização automática não necessária. Próxima atualização em ${(interval - hoursSinceLastRun).toFixed(1)} horas`);
  }
}
