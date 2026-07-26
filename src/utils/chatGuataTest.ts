/** Totem standalone de produção: /chatguata e /descubrams/chatguata */
export function isChatGuataTotemPath(pathname: string): boolean {
  return /\/chatguata\/?$/.test(pathname);
}
