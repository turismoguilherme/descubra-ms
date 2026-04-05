const STORAGE_KEY = "guata_session_id";

function newSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `session-${crypto.randomUUID()}`;
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Um ID por aba; persiste em sessionStorage até fechar a aba. */
export function getGuataSessionId(): string {
  if (typeof window === "undefined") return newSessionId();
  try {
    let id = sessionStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = newSessionId();
      sessionStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return newSessionId();
  }
}

/** Nova conversa = novo ID (ex.: após "Limpar conversa"). */
export function resetGuataSessionId(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
