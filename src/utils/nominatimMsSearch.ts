const NOMINATIM_HEADERS = { 'User-Agent': 'ViaJAR-Tourism-Platform/1.0' };

export interface NominatimAddress {
  house_number?: string;
  road?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  postcode?: string;
}

export interface NominatimRawResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
  importance?: number;
}

export interface MsSearchResult {
  name: string;
  address: string;
  addressShort?: string;
  houseNumber?: string | null;
  latitude: number;
  longitude: number;
  type: 'busca';
}

/** Extrai número e logradouro comuns em consultas BR (ex.: "Rua X, 123, Bonito"). */
export function parseBrazilianStreetQuery(query: string): {
  houseNumber: string | null;
  streetLine: string;
  cityHint: string | null;
} {
  const trimmed = query.trim();
  const parts = trimmed.split(/[,;]/).map((p) => p.trim()).filter(Boolean);

  let houseNumber: string | null = null;
  let streetLine = trimmed;

  const numAtEnd = trimmed.match(/^(.+?)[,\s]+(\d{1,6})\s*$/);
  const numAtStart = trimmed.match(/^(\d{1,6})[,\s]+(.+)$/);

  if (parts.length >= 2 && /^\d{1,6}$/.test(parts[1])) {
    houseNumber = parts[1];
    streetLine = parts[0];
  } else if (numAtEnd) {
    streetLine = numAtEnd[1].trim();
    houseNumber = numAtEnd[2];
  } else if (numAtStart) {
    houseNumber = numAtStart[1];
    streetLine = numAtStart[2].trim();
  } else {
    const inline = trimmed.match(/\b(\d{1,6})\b/);
    if (inline) houseNumber = inline[1];
  }

  const cityHint =
    parts.length >= 3
      ? parts[parts.length - 1].replace(/\s*-\s*MS$/i, '').trim()
      : parts.length === 2 && !/^\d+$/.test(parts[1])
        ? parts[1].replace(/\s*-\s*MS$/i, '').trim()
        : null;

  return { houseNumber, streetLine, cityHint };
}

function houseNumberFromItem(item: NominatimRawResult): string | null {
  const fromAddr = item.address?.house_number?.trim();
  if (fromAddr) return fromAddr;
  const first = item.display_name.split(',')[0] || '';
  const m = first.match(/\s+(\d{1,6})\b/);
  return m ? m[1] : null;
}

function streetLabel(item: NominatimRawResult): string {
  const road = item.address?.road;
  const hn = houseNumberFromItem(item);
  if (road && hn) return `${road}, ${hn}`;
  if (road) return road;
  return item.display_name.split(',')[0]?.trim() || item.display_name;
}

function mapRawToResult(item: NominatimRawResult): MsSearchResult {
  const houseNumber = houseNumberFromItem(item);
  const streetName = item.address?.road || item.display_name.split(',')[0]?.trim() || '';
  return {
    name: streetName,
    address: item.display_name,
    addressShort: houseNumber ? `${streetName}, ${houseNumber}` : streetName,
    houseNumber,
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
    type: 'busca',
  };
}

function scoreResult(
  item: NominatimRawResult,
  requestedNumber: string | null
): number {
  let score = item.importance ?? 0;
  const hn = houseNumberFromItem(item);
  if (requestedNumber && hn === requestedNumber) score += 10;
  else if (requestedNumber && !hn) score -= 2;
  return score;
}

async function nominatimFetch(url: string): Promise<NominatimRawResult[]> {
  const response = await fetch(url, { headers: NOMINATIM_HEADERS });
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Busca endereços no MS via Nominatim (texto livre + tentativa estruturada com número).
 */
export async function searchAddressInMs(query: string): Promise<{
  results: MsSearchResult[];
  requestedHouseNumber: string | null;
}> {
  const { houseNumber, streetLine, cityHint } = parseBrazilianStreetQuery(query);
  const qFree = `${query}, Mato Grosso do Sul, Brasil`;

  const freeUrl =
    `https://nominatim.openstreetmap.org/search?format=jsonv2` +
    `&q=${encodeURIComponent(qFree)}` +
    `&limit=8&addressdetails=1&countrycodes=br`;

  const rawFree = await nominatimFetch(freeUrl);

  let rawStructured: NominatimRawResult[] = [];
  if (houseNumber && streetLine.length > 2) {
    const streetParam = houseNumber ? `${houseNumber} ${streetLine}` : streetLine;
    const city = cityHint || '';
    const structuredUrl =
      `https://nominatim.openstreetmap.org/search?format=jsonv2` +
      `&street=${encodeURIComponent(streetParam)}` +
      `&city=${encodeURIComponent(city)}` +
      `&state=Mato Grosso do Sul` +
      `&country=Brasil` +
      `&limit=5&addressdetails=1&countrycodes=br`;
    rawStructured = await nominatimFetch(structuredUrl);
  }

  const byKey = new Map<string, NominatimRawResult>();
  for (const item of [...rawStructured, ...rawFree]) {
    const key = `${item.lat},${item.lon}`;
    const existing = byKey.get(key);
    if (!existing || scoreResult(item, houseNumber) > scoreResult(existing, houseNumber)) {
      byKey.set(key, item);
    }
  }

  const sorted = [...byKey.values()].sort(
    (a, b) => scoreResult(b, houseNumber) - scoreResult(a, houseNumber)
  );

  return {
    results: sorted.slice(0, 5).map(mapRawToResult),
    requestedHouseNumber: houseNumber,
  };
}

export function resultsIncludeHouseNumber(
  results: MsSearchResult[],
  requested: string | null
): boolean {
  if (!requested) return true;
  return results.some((r) => r.houseNumber === requested);
}
