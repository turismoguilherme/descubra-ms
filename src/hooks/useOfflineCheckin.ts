import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { offlineSyncService } from '@/services/passport/offlineSyncService';
import type { OfflineSyncStatus, OfflineCheckin } from '@/types/passportDigital';

export const useOfflineCheckin = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<OfflineSyncStatus>({
    is_online: navigator.onLine,
    pending_checkins: 0,
    syncing: false,
  });
  const [pendingCheckins, setPendingCheckins] = useState<OfflineCheckin[]>([]);

  /**
   * Atualizar status
   */
  const updateStatus = useCallback(async () => {
    if (!user) return;

    const syncStatus = await offlineSyncService.getOfflineStatus(user.id);
    setStatus(syncStatus);

    const pending = await offlineSyncService.getPendingCheckins(user.id);
    setPendingCheckins(pending);
  }, [user]);

  /**
   * Sincronizar check-ins pendentes
   */
  const sync = useCallback(async () => {
    if (!user) return;

    try {
      setStatus(prev => ({ ...prev, syncing: true }));
      const result = await offlineSyncService.syncPendingCheckins(user.id);
      
      // Atualizar status após sincronização
      await updateStatus();
      
      // Salvar timestamp da última sincronização
      if (user.id) {
        localStorage.setItem(`passport_last_sync_${user.id}`, new Date().toISOString());
      }

      return result;
    } catch (error: any) {
      console.error('Erro ao sincronizar:', error);
      throw error;
    } finally {
      setStatus(prev => ({ ...prev, syncing: false }));
    }
  }, [user, updateStatus]);

  /**
   * Limpar check-ins sincronizados antigos
   */
  const cleanup = useCallback(async () => {
    await offlineSyncService.cleanupSyncedCheckins(7);
    await updateStatus();
  }, [updateStatus]);

  // Atualizar status inicial
  useEffect(() => {
    updateStatus();
  }, [updateStatus]);

  // Listener para mudanças de conexão
  useEffect(() => {
    const unsubscribe = offlineSyncService.onConnectionChange((isOnline) => {
      setStatus(prev => ({ ...prev, is_online: isOnline }));
      
      // Se voltou online, tentar sincronizar automaticamente
      if (isOnline && user) {
        sync().catch(console.error);
      }
    });

    return unsubscribe;
  }, [user, sync]);

  // Atualizar status periodicamente quando offline
  useEffect(() => {
    if (!status.is_online) {
      const interval = setInterval(() => {
        updateStatus();
      }, 30000); // A cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [status.is_online, updateStatus]);

  return {
    status,
    pendingCheckins,
    sync,
    cleanup,
    refresh: updateStatus,
  };
};

