export const CHAT_GUATA_TEST_PATH = '/chatguata-teste';
export const CHAT_GUATA_MS_TEST_PATH = '/descubrams/chatguata-teste';

/** Rota temporária de teste do totem Guatá — remover quando validado. */
export function isChatGuataTestEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  return import.meta.env.VITE_ENABLE_CHATGUATA_TEST === 'true';
}

/** Totem standalone: /chatguata, /chatguata-teste e equivalentes em /descubrams. */
export function isChatGuataTotemPath(pathname: string): boolean {
  return /\/chatguata(-teste)?\/?$/.test(pathname);
}
