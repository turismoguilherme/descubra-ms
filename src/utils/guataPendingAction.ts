import type { GuataTransactionalAction } from "./guataTransactionalIntent";

const PENDING_KEY = "guata_pending_action";
const RETURN_KEY = "guata_login_return";
const HISTORY_KEY = "guata_pending_history";
const MESSAGES_KEY = "guata_pending_messages";
const MAX_AGE_MS = 30 * 60 * 1000;

interface PendingPayload {
  action: GuataTransactionalAction;
  at: number;
}

export interface GuataPendingMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp?: string;
}

function normalizePendingMessages(messages: unknown[]): GuataPendingMessage[] {
  return messages
    .map((message) => {
      if (!message || typeof message !== "object") return null;
      const candidate = message as {
        id?: unknown;
        text?: unknown;
        isUser?: unknown;
        timestamp?: unknown;
      };
      if (typeof candidate.text !== "string" || typeof candidate.isUser !== "boolean") {
        return null;
      }

      const timestamp =
        candidate.timestamp instanceof Date
          ? candidate.timestamp.toISOString()
          : typeof candidate.timestamp === "string"
            ? candidate.timestamp
            : undefined;

      return {
        id: typeof candidate.id === "number" ? candidate.id : Date.now(),
        text: candidate.text,
        isUser: candidate.isUser,
        timestamp,
      };
    })
    .filter((message): message is GuataPendingMessage => Boolean(message));
}

/** Paths seguros de retorno ao chat Guatá (nunca home Guatá Labs `/`). */
export function isSafeGuataReturnPath(path: string | null | undefined): boolean {
  if (!path || !path.startsWith("/")) return false;
  if (path === "/" || path.startsWith("/viajar")) return false;
  if (path.startsWith("//")) return false;
  return (
    path.startsWith("/descubrams/guata") ||
    path.startsWith("/descubrams/chatguata") ||
    path.startsWith("/chatguata") ||
    path.includes("guata")
  );
}

export function saveGuataLoginReturn(pathname: string): void {
  try {
    if (!pathname || pathname.startsWith("/descubrams/login") || pathname.startsWith("/login")) {
      return;
    }
    sessionStorage.setItem(RETURN_KEY, pathname);
  } catch {
    /* ignore */
  }
}

/** Lê e remove o path de retorno salvo (para AuthPage / OAuth). */
export function consumeGuataLoginReturn(): string | null {
  try {
    const path = sessionStorage.getItem(RETURN_KEY);
    sessionStorage.removeItem(RETURN_KEY);
    if (!path || path.startsWith("/descubrams/login") || path === "/login") return null;
    if (path === "/" || path.startsWith("/viajar")) return null;
    return path.startsWith("/") ? path : null;
  } catch {
    return null;
  }
}

export function peekGuataLoginReturn(): string | null {
  try {
    return sessionStorage.getItem(RETURN_KEY);
  } catch {
    return null;
  }
}

export function saveGuataPendingContext(
  action: GuataTransactionalAction,
  conversationHistory: string[],
  messages: unknown[] = [],
): void {
  try {
    sessionStorage.setItem(
      PENDING_KEY,
      JSON.stringify({ action, at: Date.now() } satisfies PendingPayload),
    );
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(conversationHistory));
    sessionStorage.setItem(MESSAGES_KEY, JSON.stringify(normalizePendingMessages(messages)));
  } catch {
    /* ignore */
  }
}

export function consumeGuataPendingContext(): {
  action: GuataTransactionalAction;
  history: string[];
  messages: GuataPendingMessage[];
} | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;

    const payload = JSON.parse(raw) as PendingPayload;
    if (!payload?.action || Date.now() - (payload.at ?? 0) > MAX_AGE_MS) {
      sessionStorage.removeItem(PENDING_KEY);
      sessionStorage.removeItem(HISTORY_KEY);
      sessionStorage.removeItem(MESSAGES_KEY);
      return null;
    }

    const historyRaw = sessionStorage.getItem(HISTORY_KEY);
    const history = historyRaw ? (JSON.parse(historyRaw) as string[]) : [];
    const messagesRaw = sessionStorage.getItem(MESSAGES_KEY);
    const messages = messagesRaw ? normalizePendingMessages(JSON.parse(messagesRaw) as unknown[]) : [];

    sessionStorage.removeItem(PENDING_KEY);
    sessionStorage.removeItem(HISTORY_KEY);
    sessionStorage.removeItem(MESSAGES_KEY);
    // NÃO remove RETURN_KEY aqui — Auth/OAuth precisam dele para voltar ao chat

    return {
      action: payload.action,
      history: Array.isArray(history) ? history : [],
      messages,
    };
  } catch {
    try {
      sessionStorage.removeItem(PENDING_KEY);
      sessionStorage.removeItem(HISTORY_KEY);
      sessionStorage.removeItem(MESSAGES_KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
}

export function clearGuataPendingContext(): void {
  try {
    sessionStorage.removeItem(PENDING_KEY);
    sessionStorage.removeItem(HISTORY_KEY);
    sessionStorage.removeItem(MESSAGES_KEY);
    sessionStorage.removeItem(RETURN_KEY);
  } catch {
    /* ignore */
  }
}

export function getGuataResumePrompt(action: GuataTransactionalAction): string {
  switch (action) {
    case "cadastrar_evento":
      return "Voltei após o login. Quero continuar cadastrando o evento que estávamos conversando. Use o histórico acima para manter o contexto e entender referências como 'esse' ou 'aquele'.";
    case "reservar":
      return "Voltei após o login. Quero continuar com a reserva que estávamos fazendo. Use o histórico acima para manter o contexto e entender referências como 'esse' ou 'aquele'.";
    case "pagar":
      return "Voltei após o login. Quero continuar com o pagamento. Use o histórico acima para manter o contexto e entender referências como 'esse' ou 'aquele'.";
    default:
      return "Voltei após o login. Podemos continuar de onde paramos?";
  }
}
