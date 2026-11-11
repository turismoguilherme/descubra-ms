const STOP = new Set(['DE', 'DA', 'DO', 'DAS', 'DOS', 'E', 'A', 'O', 'EM']);

const words = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w));

/** Sigla curta: iniciais (até 3) ou primeiras letras de palavra única. */
const acronym = (text: string, max = 4) => {
  const w = words(text);
  if (w.length === 0) return '';
  if (w.length === 1) return w[0].slice(0, max);
  return w.map((x) => x[0]).join('').slice(0, max);
};

/** Prefixo inteligente a partir da rota e do parceiro. Ex: "Descubra Campo Grande" + "Hotel Ibis" -> "DCG-HI". */
export const generateSmartPrefix = (routeName: string, partnerName: string): string => {
  const parts = [acronym(routeName, 3), acronym(partnerName, 4)].filter(Boolean);
  return parts.length ? parts.join('-') : randomPrefix();
};

/** Prefixo aleatório curto. Ex: "MS-7K2Q". */
export const randomPrefix = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `MS-${s}`;
};

export const sanitizePrefix = (v: string) =>
  v.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 16);
