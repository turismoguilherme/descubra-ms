/**
 * Remove markdown comum para exibição em bolhas de chat (texto puro).
 * Evita **negrito**, `código`, etc. aparecerem crus na tela.
 */
export function stripChatMarkdown(text: string): string {
  if (!text || typeof text !== "string") return "";

  let s = text;

  // Blocos ``` ... ```
  s = s.replace(/```[\w]*\n?([\s\S]*?)```/g, "$1");

  // Inline `código`
  s = s.replace(/`([^`]+)`/g, "$1");

  // Negrito ** e __
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/__([^_]+)__/g, "$1");

  // Itálico *palavra* (não consome ** já removidos)
  s = s.replace(/(?<!\*)\*(?!\s)([^*\n]+?)\*(?!\*)/g, "$1");

  // Títulos # no início da linha
  s = s.replace(/^#{1,6}\s+/gm, "");

  // Asteriscos/underscores soltos que sobraram
  s = s.replace(/\*\*/g, "");
  s = s.replace(/__/g, "");

  return s.trimEnd();
}
