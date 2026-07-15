export const GUATA_TRANSACTIONAL_SUGGESTION =
  'Quero cadastrar um evento ou reservar um passeio';

const LEGACY_SUGGESTION_TO_DROP =
  'Quais são os principais pontos turísticos de Campo Grande?';

/** Fallback quando `guata_chat_suggestion_questions` não existe no institutional_content */
export const GUATA_DEFAULT_SUGGESTION_QUESTIONS: string[] = [
  GUATA_TRANSACTIONAL_SUGGESTION,
  'Quais são os melhores passeios em Bonito?',
  'Melhor época para visitar o Pantanal?',
  'Me conte sobre a comida típica de MS',
  'O que fazer em Corumbá?',
  'O que fazer em Campo Grande?',
];

/** Garante bolão transacional no topo e remove sugestão legada do CMS. */
export function mergeGuataSuggestionQuestions(items: string[]): string[] {
  const cleaned = items
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => item !== LEGACY_SUGGESTION_TO_DROP)
    .filter((item) => item !== GUATA_TRANSACTIONAL_SUGGESTION);

  return [GUATA_TRANSACTIONAL_SUGGESTION, ...cleaned].slice(0, 6);
}
