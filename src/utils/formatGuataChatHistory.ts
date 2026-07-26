/**
 * Formata o histórico do Guatá para a API com papéis claros.
 * O array alterna Usuário / Guatá (começa pelo usuário).
 */
export function formatGuataChatHistory(history: string[], maxTurns = 12): string {
  if (!Array.isArray(history) || history.length === 0) return "";

  const recent = history
    .map((line) => (typeof line === "string" ? line.trim() : ""))
    .filter(Boolean)
    .slice(-maxTurns);

  return recent
    .map((line, index) => {
      const role = index % 2 === 0 ? "Usuário" : "Guatá";
      // Evita duplicar rótulo se já vier formatado
      if (/^(usuário|usuario|guatá|guata|user|assistant)\s*:/i.test(line)) {
        return line;
      }
      return `${role}: ${line}`;
    })
    .join("\n");
}
