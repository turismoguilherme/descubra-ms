import { openDB, IDBPDatabase } from 'idb';
import { TouristRoute, RouteCheckpoint, UserStamp, UserRouteCheckin } from '@/types/passport'; // Importar tipos relevantes

interface OfflineStore {
  routes: TouristRoute[];
  checkpoints: RouteCheckpoint[];
  user_stamps: UserStamp[];
}

const DB_NAME = 'flowtrip-offline-db';
const DB_VERSION = 1;

class OfflineCacheService {
  private db: IDBPDatabase | null = null;

  async initDb(): Promise<void> {
    if (this.db) return;

    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('routes')) {
          db.createObjectStore('routes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('checkpoints')) {
          db.createObjectStore('checkpoints', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('user_stamps')) {
          db.createObjectStore('user_stamps', { keyPath: 'id' });
        }
        // Adicionar outros stores conforme necessário (ex: recompensas, user_rewards)
      },
    });
    console.log('IndexedDB inicializado com sucesso.');
  }

  async get<T>(storeName: keyof OfflineStore, id: string): Promise<T | undefined> {
    if (!this.db) await this.initDb();
    return this.db?.get(storeName, id);
  }

  async getAll<T>(storeName: keyof OfflineStore): Promise<T[]> {
    if (!this.db) await this.initDb();
    return this.db?.getAll(storeName) || [];
  }

  async put<T>(storeName: keyof OfflineStore, data: T): Promise<IDBValidKey> {
    if (!this.db) await this.initDb();
    return this.db?.put(storeName, data);
  }

  async putAll<T>(storeName: keyof OfflineStore, data: T[]): Promise<void> {
    if (!this.db) await this.initDb();
    const tx = this.db?.transaction(storeName, 'readwrite');
    if (tx) {
      const store = tx.objectStore(storeName);
      await Promise.all(data.map(item => store.put(item)));
      await tx.done;
    }
  }

  async delete(storeName: keyof OfflineStore, id: string): Promise<void> {
    if (!this.db) await this.initDb();
    await this.db?.delete(storeName, id);
  }

  async clear(storeName: keyof OfflineStore): Promise<void> {
    if (!this.db) await this.initDb();
    await this.db?.clear(storeName);
  }

  // Função utilitária para verificar o status da rede
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Função para salvar dados de uma rota e seus checkpoints offline
  async cacheRoute(route: TouristRoute, checkpoints: RouteCheckpoint[]): Promise<void> {
    try {
      await this.initDb();
      await this.put('routes', route);
      await this.putAll('checkpoints', checkpoints);
      console.log(`✅ Rota '${route.name}' e seus checkpoints cacheados offline.`);
    } catch (error) {
      console.error('❌ Erro ao cachear rota e checkpoints:', error);
    }
  }

  // Função para obter dados de uma rota e seus checkpoints do cache offline
  async getCachedRoute(routeId: string): Promise<{ route: TouristRoute | undefined; checkpoints: RouteCheckpoint[] }> {
    await this.initDb();
    const route = await this.get<TouristRoute>('routes', routeId);
    const allCheckpoints = await this.getAll<RouteCheckpoint>('checkpoints');
    const routeCheckpoints = allCheckpoints.filter(cp => cp.route_id === routeId);
    return { route, checkpoints: routeCheckpoints };
  }

  // Função para adicionar um carimbo do usuário ao cache offline
  async addStampToCache(stamp: UserStamp): Promise<void> {
    try {
      await this.initDb();
      // Ao adicionar ao cache, sempre defina como pending_create
      const stampToCache: UserStamp = { ...stamp, sync_status: 'pending_create' };
      await this.put('user_stamps', stampToCache);
      console.log(`✅ Carimbo para checkpoint ${stamp.checkpoint_id} adicionado ao cache offline com status 'pending_create'.`);
    } catch (error) {
      console.error('❌ Erro ao adicionar carimbo ao cache:', error);
    }
  }

  // Função para obter carimbos do usuário do cache offline
  async getCachedUserStamps(): Promise<UserStamp[]> {
    await this.initDb();
    return this.getAll<UserStamp>('user_stamps');
  }

  // Função para limpar carimbos após sincronização (a ser chamada na Etapa 3.6)
  async clearCachedUserStamps(): Promise<void> {
    await this.initDb();
    await this.clear('user_stamps');
    console.log('✅ Carimbos do usuário no cache offline limpos.');
  }

  // Função para atualizar um carimbo no cache e marcar como pending_update
  async updateStampInCache(stamp: UserStamp): Promise<void> {
    try {
      await this.initDb();
      const stampToUpdate: UserStamp = { ...stamp, sync_status: 'pending_update' };
      await this.put('user_stamps', stampToUpdate);
      console.log(`✅ Carimbo ${stamp.id} atualizado no cache offline com status 'pending_update'.`);
    } catch (error) {
      console.error('❌ Erro ao atualizar carimbo no cache:', error);
    }
  }

  // Função para marcar um carimbo como pending_delete no cache
  async deleteStampInCache(stampId: string): Promise<void> {
    try {
      await this.initDb();
      const stampToDelete = await this.get<UserStamp>('user_stamps', stampId);
      if (stampToDelete) {
        const updatedStamp: UserStamp = { ...stampToDelete, sync_status: 'pending_delete' };
        await this.put('user_stamps', updatedStamp);
        console.log(`✅ Carimbo ${stampId} marcado para exclusão offline com status 'pending_delete'.`);
      } else {
        // Se o carimbo não estiver no cache, apenas tenta excluir do banco de dados na sincronização
        console.warn(`⚠️ Carimbo ${stampId} não encontrado no cache para marcar como pending_delete. Será tentada exclusão direta na próxima sincronização.`);
      }
    } catch (error) {
      console.error('❌ Erro ao marcar carimbo para exclusão no cache:', error);
    }
  }

  // Função para sincronizar carimbos offline com o backend (a ser chamada quando online)
  async syncOfflineStamps(createUserCheckinOnline: (stamp: Omit<UserRouteCheckin, 'id' | 'created_at'>) => Promise<any>,
                          updateUserStampOnline: (stamp: UserStamp) => Promise<any>,
                          deleteUserStampOnline: (stampId: string) => Promise<void>): Promise<void> {
    await this.initDb();
    // Filtra apenas os carimbos pendentes de criação, atualização ou exclusão
    const offlineStamps = await this.getAll<UserStamp>('user_stamps');
    const pendingStamps = offlineStamps.filter(s => 
      s.sync_status === 'pending_create' || 
      s.sync_status === 'pending_update' || 
      s.sync_status === 'pending_delete'
    );
    
    if (pendingStamps.length === 0) {
      console.log('Nenhum carimbo offline para sincronizar.');
      return;
    }

    console.log(`⏳ Sincronizando ${pendingStamps.length} carimbos offline...`);

    for (const stamp of pendingStamps) {
      try {
        if (stamp.sync_status === 'pending_create') {
          // Converte UserStamp para o formato esperado por createUserCheckinOnline
          const checkinData: Omit<UserRouteCheckin, 'id' | 'created_at'> = {
            user_id: stamp.user_id,
            route_id: stamp.route_id || '',
            checkpoint_id: stamp.checkpoint_id,
            checkin_at: stamp.earned_at,
            latitude: stamp.latitude, 
            longitude: stamp.longitude,
          };
          const result = await createUserCheckinOnline(checkinData); // Assume que retorna o objeto completo do stamp do DB

          // Atualiza o stamp no IndexedDB com a ID real do DB e marca como synced
          const syncedStamp: UserStamp = { ...stamp, id: result.checkpoint.id, sync_status: 'synced' };
          await this.put('user_stamps', syncedStamp);
          // Remove o stamp original com a ID temporária se ela for diferente da ID real
          if (stamp.id !== syncedStamp.id) {
            await this.delete('user_stamps', stamp.id);
          }

          console.log(`✅ Carimbo ${syncedStamp.id} sincronizado com sucesso.`);
        } else if (stamp.sync_status === 'pending_update') {
          // Lógica para atualização de carimbos existentes
          const result = await updateUserStampOnline(stamp); // Envia o carimbo completo para atualização
          const syncedStamp: UserStamp = { ...stamp, sync_status: 'synced' };
          await this.put('user_stamps', syncedStamp);
          console.log(`✅ Carimbo ${stamp.id} atualizado e sincronizado com sucesso.`);
        } else if (stamp.sync_status === 'pending_delete') {
          // Lógica para exclusão de carimbos
          await deleteUserStampOnline(stamp.id);
          await this.delete('user_stamps', stamp.id); // Remove do cache local após exclusão online
          console.log(`✅ Carimbo ${stamp.id} excluído e sincronizado com sucesso.`);
        }
      } catch (error) {
        console.error(`❌ Erro ao sincronizar carimbo ${stamp.id}:`, error);
        // Decidir estratégia de re-tentativa ou log de erro para carimbos que falharem
      }
    }
    console.log('✅ Sincronização de carimbos offline concluída.');
  }
}

export const offlineCacheService = new OfflineCacheService(); 