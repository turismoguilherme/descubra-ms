/** Detecta intenção transacional (espelha heurística do edge guata-ai). */
export type GuataTransactionalAction = "cadastrar_evento" | "reservar" | "pagar";

export function detectGuataTransactionalAction(prompt: string): GuataTransactionalAction | null {
  const p = prompt.toLowerCase();
  if (/(cadastrar|criar|registrar).{0,20}evento/.test(p)) return "cadastrar_evento";
  if (/(reservar|reserva|booking)/.test(p)) return "reservar";
  if (/(comprar|pagar|checkout|pagamento)/.test(p)) return "pagar";
  return null;
}

export function isGuataTransactionalIntent(prompt: string): boolean {
  return detectGuataTransactionalAction(prompt) !== null;
}
