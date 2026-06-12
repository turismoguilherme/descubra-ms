export const CHAT_GUATA_TEST_PATH = '/chatguata-teste';
export const CHAT_GUATA_MS_TEST_PATH = '/descubrams/chatguata-teste';

/** Totem standalone: /chatguata, /chatguata-teste e equivalentes em /descubrams. */
export function isChatGuataTotemPath(pathname: string): boolean {
  return /\/chatguata(-teste)?\/?$/.test(pathname);
}
