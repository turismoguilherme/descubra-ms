// Utilitário para forçar recarregamento e evitar cache
export const FORCE_RELOAD_VERSION = Date.now();

// Adicionar timestamp aos imports para evitar cache
export const getVersionedImport = (path: string) => {
  return `${path}?v=${FORCE_RELOAD_VERSION}`;
};

// Limpar todos os caches possíveis
export const clearAllCaches = () => {
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  // Limpar localStorage e sessionStorage
  localStorage.clear();
  sessionStorage.clear();
  
  // Limpar IndexedDB
  if ('indexedDB' in window) {
    indexedDB.databases().then(databases => {
      databases.forEach(db => {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      });
    });
  }
};



