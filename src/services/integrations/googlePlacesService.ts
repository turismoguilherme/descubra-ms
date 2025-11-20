/**
 * Google Places API Service
 * Integração com Google Places API para validação e busca de lugares
 */

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  rating?: number;
  user_ratings_total?: number;
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  opening_hours?: {
    weekday_text: string[];
    open_now: boolean;
  };
  rating?: number;
  user_ratings_total?: number;
  types: string[];
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
  }>;
}

export interface AddressValidation {
  isValid: boolean;
  formattedAddress?: string;
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  suggestions?: string[];
  confidence: number;
}

export class GooglePlacesService {
  private apiKey: string | null = null;

  constructor() {
    // Tentar usar Google Places API Key ou Google Maps API Key
    this.apiKey = GOOGLE_PLACES_API_KEY || GOOGLE_MAPS_API_KEY || null;
  }

  /**
   * Verificar se API está configurada
   */
  isConfigured(): boolean {
    return this.apiKey !== null;
  }

  /**
   * Buscar lugar no Google Places
   */
  async searchPlace(query: string): Promise<PlaceResult[]> {
    if (!this.apiKey) {
      console.warn('Google Places API não configurada');
      return [];
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${this.apiKey}&language=pt-BR&region=br`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results) {
        return data.results.map((result: any) => ({
          place_id: result.place_id,
          name: result.name,
          formatted_address: result.formatted_address,
          geometry: {
            location: {
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng,
            },
          },
          types: result.types || [],
          rating: result.rating,
          user_ratings_total: result.user_ratings_total,
        }));
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar lugar no Google Places:', error);
      return [];
    }
  }

  /**
   * Obter detalhes completos de um lugar
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    if (!this.apiKey) {
      console.warn('Google Places API não configurada');
      return null;
    }

    try {
      const fields = [
        'name',
        'formatted_address',
        'formatted_phone_number',
        'international_phone_number',
        'website',
        'geometry',
        'opening_hours',
        'rating',
        'user_ratings_total',
        'types',
        'photos',
        'reviews',
      ].join(',');

      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}&language=pt-BR`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        const result = data.result;
        return {
          place_id: result.place_id,
          name: result.name,
          formatted_address: result.formatted_address,
          formatted_phone_number: result.formatted_phone_number,
          international_phone_number: result.international_phone_number,
          website: result.website,
          geometry: {
            location: {
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng,
            },
          },
          opening_hours: result.opening_hours
            ? {
                weekday_text: result.opening_hours.weekday_text || [],
                open_now: result.opening_hours.open_now || false,
              }
            : undefined,
          rating: result.rating,
          user_ratings_total: result.user_ratings_total,
          types: result.types || [],
          photos: result.photos,
          reviews: result.reviews,
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao obter detalhes do lugar:', error);
      return null;
    }
  }

  /**
   * Validar e corrigir endereço
   */
  async validateAddress(address: string): Promise<AddressValidation> {
    if (!this.apiKey) {
      return {
        isValid: false,
        confidence: 0,
        suggestions: [],
      };
    }

    try {
      // Buscar endereço
      const results = await this.searchPlace(address);

      if (results.length === 0) {
        return {
          isValid: false,
          confidence: 0,
          suggestions: [],
        };
      }

      // Pegar o primeiro resultado (mais relevante)
      const bestMatch = results[0];

      // Se houver múltiplos resultados, sugerir alternativas
      const suggestions = results.slice(1, 4).map(r => r.formatted_address);

      return {
        isValid: true,
        formattedAddress: bestMatch.formatted_address,
        placeId: bestMatch.place_id,
        coordinates: {
          lat: bestMatch.geometry.location.lat,
          lng: bestMatch.geometry.location.lng,
        },
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        confidence: 0.8, // Alta confiança no primeiro resultado
      };
    } catch (error) {
      console.error('Erro ao validar endereço:', error);
      return {
        isValid: false,
        confidence: 0,
        suggestions: [],
      };
    }
  }

  /**
   * Obter URL de foto do Google Places
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    if (!this.apiKey) {
      return '';
    }

    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`;
  }
}

export const googlePlacesService = new GooglePlacesService();

