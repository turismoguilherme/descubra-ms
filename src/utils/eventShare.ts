import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DEFAULT_SITE_ORIGIN = 'https://descubrams.com';
const DEFAULT_OG_IMAGE = `${DEFAULT_SITE_ORIGIN}/branding/descubra-ms-mark.png`;

export interface EventShareInput {
  id: string;
  name: string;
  location?: string;
  start_date?: string;
  logo_evento?: string | null;
  image_url?: string | null;
}

export function getSiteOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return DEFAULT_SITE_ORIGIN;
}

/** URL pública com Open Graph (preview WhatsApp) — /evento/:id */
export function buildEventSharePageUrl(eventId: string, origin = getSiteOrigin()): string {
  return `${origin.replace(/\/$/, '')}/evento/${eventId}`;
}

/** Destino no app após abrir o link */
export function buildEventAppUrl(
  eventId: string,
  pathname = typeof window !== 'undefined' ? window.location.pathname : '/descubrams/eventos'
): string {
  const base = pathname.startsWith('/eventos') && !pathname.includes('/descubrams')
    ? '/eventos'
    : '/descubrams/eventos';
  return `${base}?evento=${eventId}`;
}

export function formatEventShareDate(startDate?: string): string {
  if (!startDate) return '';
  try {
    return format(new Date(startDate), 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return '';
  }
}

export function buildEventShareText(event: EventShareInput): string {
  const datePart = formatEventShareDate(event.start_date);
  const locationPart = (event.location || '').trim();
  const meta = [datePart, locationPart].filter(Boolean).join(' · ');
  const headline = meta ? `${event.name} — ${meta}` : event.name;
  return `🎉 ${headline}\nConfira no Descubra MS:`;
}

export function buildEventShareMessage(event: EventShareInput, origin = getSiteOrigin()): string {
  return `${buildEventShareText(event)}\n${buildEventSharePageUrl(event.id, origin)}`;
}

export function resolveEventShareImage(event: Pick<EventShareInput, 'logo_evento' | 'image_url'>): string {
  const candidate = (event.logo_evento || event.image_url || '').trim();
  if (!candidate) return DEFAULT_OG_IMAGE;
  if (candidate.startsWith('http://') || candidate.startsWith('https://')) return candidate;
  return DEFAULT_OG_IMAGE;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
