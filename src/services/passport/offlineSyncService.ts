import { openDB, IDBPDatabase } from 'idb';
import { supabase } from '@/integrations/supabase/client';
import type { OfflineCheckin, OfflineSyncStatus } from '@/types/passportDigital';
import { passportService } from './passportService';

const DB_NAME = 'passport-offline-db';
const DB_VERSION = 1;

interface OfflineStore {
  checkins: OfflineCheckin;
}

class OfflineSyncService {
  private db: IDBPDatabase | null = null;

  /**
   * Inicializar IndexedDB
   */
  async initDb(): Promise<void> {
    if (this.db) return;

    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('checkins')) {
          const store = db.createObjectStore('checkins', { keyPath: 'id' });
          store.createIndex('user_id', 'user_id');
          store.createIndex('synced', 'synced');
          store.createIndex('checkpoint_id', 'checkpoint_id');
        }
      },
    });
  }

  /**
   * Salvar check-in offline
   */
  async saveCheckinOffline(
    userId: string,
    checkpointId: string,
    routeId: string,
    latitude: number,
    longitude: number,
    accuracy?: number,
    photoUrl?: string,
    photoMetadata?: Record<string, any>
  ): Promise<string> {
    await this.initDb();

    const checkin: OfflineCheckin = {
      id: crypto.randomUUID(),
      user_id: userId,
      checkpoint_id: checkpointId,
      route_id: routeId,
      latitude,
      longitude,
      accuracy: accuracy || null,
      photo_url: photoUrl || null,
      photo_metadata: photoMetadata || null,
      device_info: navigator.userAgent,
      synced: false,
      synced_at: null,
      created_at: new Date().toISOString(),
      validated: false,
      validation_error: null,
    };

    await this.db?.put('checkins', checkin);
    return checkin.id;
  }

  /**
   * Obter check-ins pendentes
   */
  async getPendingCheckins(userId: string): Promise<OfflineCheckin[]> {
    await this.initDb();
    const tx = this.db?.transaction('checkins', 'readonly');
    const store = tx?.objectStore('checkins');
    const index = store?.index('user_id');
    const allCheckins = await index?.getAll(userId) || [];
    return allCheckins.filter(c => !c.synced);
  }

  /**
   * Sincronizar check-ins pendentes
   */
  async syncPendingCheckins(userId: string): Promise<{ synced: number; failed: number }> {
    const pending = await this.getPendingCheckins(userId);
    let synced = 0;
    let failed = 0;

    for (const checkin of pending) {
      try {
        // Tentar fazer check-in online
        const result = await passportService.checkIn(
          userId,
          checkin.checkpoint_id,
          checkin.latitude,
          checkin.longitude,
          checkin.photo_url || undefined
        );

        if (result.success) {
          // Marcar como sincronizado
          await this.markAsSynced(checkin.id);
          synced++;
        } else {
          // Marcar como falha
          await this.markAsFailed(checkin.id, result.error || 'Erro desconhecido');
          failed++;
        }
      } catch (error: any) {
        console.error(`Erro ao sincronizar check-in ${checkin.id}:`, error);
        await this.markAsFailed(checkin.id, error.message);
        failed++;
      }
    }

    return { synced, failed };
  }

  /**
   * Marcar check-in como sincronizado
   */
  private async markAsSynced(checkinId: string): Promise<void> {
    await this.initDb();
    const checkin = await this.db?.get('checkins', checkinId);
    if (checkin) {
      checkin.synced = true;
      checkin.synced_at = new Date().toISOString();
      await this.db?.put('checkins', checkin);
    }
  }

  /**
   * Marcar check-in como falha
   */
  private async markAsFailed(checkinId: string, error: string): Promise<void> {
    await this.initDb();
    const checkin = await this.db?.get('checkins', checkinId);
    if (checkin) {
      checkin.validation_error = error;
      await this.db?.put('checkins', checkin);
    }
  }

  /**
   * Remover check-ins sincronizados antigos (limpeza)
   */
  async cleanupSyncedCheckins(daysOld: number = 7): Promise<void> {
    await this.initDb();
    const tx = this.db?.transaction('checkins', 'readwrite');
    const store = tx?.objectStore('checkins');
    const allCheckins = await store?.getAll() || [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    for (const checkin of allCheckins) {
      if (checkin.synced && checkin.synced_at) {
        const syncedDate = new Date(checkin.synced_at);
        if (syncedDate < cutoffDate) {
          await store?.delete(checkin.id);
        }
      }
    }
  }

  /**
   * Obter status de sincronização
   */
  async getOfflineStatus(userId: string): Promise<OfflineSyncStatus> {
    const pending = await this.getPendingCheckins(userId);
    const lastSync = localStorage.getItem(`passport_last_sync_${userId}`);

    return {
      is_online: navigator.onLine,
      pending_checkins: pending.length,
      last_sync: lastSync || undefined,
      syncing: false,
    };
  }

  /**
   * Verificar se está online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Adicionar listener para mudanças de conexão
   */
  onConnectionChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  /**
   * Cachear rota e checkpoints para uso offline
   */
  async cacheRoute(routeId: string, routeData: any, checkpoints: any[]): Promise<void> {
    await this.initDb();
    
    // Salvar no localStorage para acesso rápido
    localStorage.setItem(`passport_route_${routeId}`, JSON.stringify({
      route: routeData,
      checkpoints,
      cached_at: new Date().toISOString(),
    }));
  }

  /**
   * Obter rota do cache
   */
  async getCachedRoute(routeId: string): Promise<{ route: any; checkpoints: any[] } | null> {
    const cached = localStorage.getItem(`passport_route_${routeId}`);
    if (!cached) return null;

    try {
      const data = JSON.parse(cached);
      // Verificar se cache não está muito antigo (24 horas)
      const cachedAt = new Date(data.cached_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        localStorage.removeItem(`passport_route_${routeId}`);
        return null;
      }

      return {
        route: data.route,
        checkpoints: data.checkpoints,
      };
    } catch {
      return null;
    }
  }
}

export const offlineSyncService = new OfflineSyncService();

