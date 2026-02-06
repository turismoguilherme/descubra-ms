// Serviço de APIs Externas do Guatá Human
// Integra clima, Google Places e outras fontes externas

export interface WeatherInfo {
    city: string;
    temperature: number;
    description: string;
    humidity: number;
    wind_speed: number;
    forecast: Array<{
        date: string;
        high: number;
        low: number;
        description: string;
        icon: string;
    }>;
    last_updated: string;
    source: string;
}

export interface PlaceInfo {
    id: string;
    name: string;
    address: string;
    phone?: string;
    website?: string;
    rating?: number;
    review_count?: number;
    opening_hours?: any;
    photos?: string[];
    types: string[];
    location: {
        lat: number;
        lng: number;
    };
    price_level?: number;
    source: string;
}

export interface TransportationInfo {
    type: 'bus' | 'flight' | 'car' | 'train';
    from: string;
    to: string;
    departure_time?: string;
    arrival_time?: string;
    duration?: string;
    price?: number;
    company?: string;
    route?: string;
    source: string;
}

export class GuataExternalAPIsService {
    private readonly WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
    private readonly GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    private readonly GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // ===== CLIMA/TEMPO =====
    async getWeatherInfo(city: string, state: string = 'MS'): Promise<WeatherInfo | null> {
        try {
            if (!this.WEATHER_API_KEY) {
                console.warn('⚠️ OpenWeather API key não configurada, usando dados simulados');
                return this.simulateWeatherInfo(city);
            }

            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city},${state},BR&appid=${this.WEATHER_API_KEY}&units=metric&lang=pt_br`
            );

            if (!response.ok) {
                throw new Error(`Erro na API do clima: ${response.status}`);
            }

            const data = await response.json();
            return this.parseWeatherData(data, city);
        } catch (error) {
            console.error('Erro ao buscar informações do clima:', error);
            return this.simulateWeatherInfo(city);
        }
    }

    private parseWeatherData(data: any, city: string): WeatherInfo {
        const current = data.list[0];
        const forecast = data.list
            .filter((item: any, index: number) => index % 8 === 0) // A cada 24h
            .slice(0, 5)
            .map((item: any) => ({
                date: new Date(item.dt * 1000).toLocaleDateString('pt-BR'),
                high: Math.round(item.main.temp_max),
                low: Math.round(item.main.temp_min),
                description: item.weather[0].description,
                icon: item.weather[0].icon
            }));

        return {
            city,
            temperature: Math.round(current.main.temp),
            description: current.weather[0].description,
            humidity: current.main.humidity,
            wind_speed: Math.round(current.wind.speed * 3.6), // m/s para km/h
            forecast,
            last_updated: new Date().toISOString(),
            source: 'OpenWeather API'
        };
    }

    private simulateWeatherInfo(city: string): WeatherInfo {
        const currentHour = new Date().getHours();
        const isDay = currentHour >= 6 && currentHour <= 18;
        
        return {
            city,
            temperature: isDay ? 28 : 22,
            description: isDay ? 'céu limpo' : 'céu parcialmente nublado',
            humidity: 65,
            wind_speed: 12,
            forecast: [
                { date: new Date().toLocaleDateString('pt-BR'), high: 30, low: 22, description: 'céu limpo', icon: '01d' },
                { date: new Date(Date.now() + 86400000).toLocaleDateString('pt-BR'), high: 29, low: 21, description: 'parcialmente nublado', icon: '02d' },
                { date: new Date(Date.now() + 172800000).toLocaleDateString('pt-BR'), high: 31, low: 23, description: 'céu limpo', icon: '01d' },
                { date: new Date(Date.now() + 259200000).toLocaleDateString('pt-BR'), high: 28, low: 20, description: 'nublado', icon: '03d' },
                { date: new Date(Date.now() + 345600000).toLocaleDateString('pt-BR'), high: 32, low: 24, description: 'céu limpo', icon: '01d' }
            ],
            last_updated: new Date().toISOString(),
            source: 'Dados simulados (OpenWeather não configurado)'
        };
    }

    // ===== GOOGLE PLACES =====
    async searchPlaces(query: string, location: string, type?: string): Promise<PlaceInfo[]> {
        try {
            if (!this.GOOGLE_PLACES_API_KEY) {
                console.warn('⚠️ Google Places API key não configurada, usando dados simulados');
                return this.simulatePlacesSearch(query, location, type);
            }

            // Primeiro, buscar o local para obter coordenadas
            const geocodeResponse = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${this.GOOGLE_MAPS_API_KEY}`
            );

            if (!geocodeResponse.ok) {
                throw new Error('Erro ao geocodificar localização');
            }

            const geocodeData = await geocodeResponse.json();
            if (!geocodeData.results?.[0]?.geometry?.location) {
                throw new Error('Localização não encontrada');
            }

            const { lat, lng } = geocodeData.results[0].geometry.location;

            // Buscar lugares próximos
            const placesResponse = await fetch(
                `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=50000&key=${this.GOOGLE_PLACES_API_KEY}&language=pt-BR`
            );

            if (!placesResponse.ok) {
                throw new Error('Erro na API do Google Places');
            }

            const placesData = await placesResponse.json();
            return this.parsePlacesData(placesData.results);
        } catch (error) {
            console.error('Erro ao buscar lugares:', error);
            return this.simulatePlacesSearch(query, location, type);
        }
    }

    private parsePlacesData(places: any[]): PlaceInfo[] {
        return places.map(place => ({
            id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            phone: place.formatted_phone_number,
            website: place.website,
            rating: place.rating,
            review_count: place.user_ratings_total,
            opening_hours: place.opening_hours,
            photos: place.photos?.map((photo: any) => 
                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.GOOGLE_PLACES_API_KEY}`
            ),
            types: place.types,
            location: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
            },
            price_level: place.price_level,
            source: 'Google Places API'
        }));
    }

    private simulatePlacesSearch(query: string, location: string, type?: string): PlaceInfo[] {
        const simulatedPlaces: PlaceInfo[] = [];

        if (query.toLowerCase().includes('hotel') || type === 'lodging') {
            simulatedPlaces.push({
                id: 'sim_hotel_1',
                name: 'Hotel Pantanal Palace',
                address: 'Av. Afonso Pena, 1234, Centro, Campo Grande - MS',
                phone: '(67) 3321-1234',
                website: 'https://hotelpantanal.com.br',
                rating: 4.5,
                review_count: 127,
                opening_hours: { open_now: true },
                photos: [],
                types: ['lodging', 'establishment'],
                location: { lat: -20.4486, lng: -54.6295 },
                price_level: 3,
                source: 'Dados simulados (Google Places não configurado)'
            });
        }

        if (query.toLowerCase().includes('restaurante') || type === 'restaurant') {
            simulatedPlaces.push({
                id: 'sim_rest_1',
                name: 'Restaurante Sabor Pantaneiro',
                address: 'Rua 14 de Julho, 567, Centro, Campo Grande - MS',
                phone: '(67) 3321-5678',
                website: 'https://saborpantaneiro.com.br',
                rating: 4.2,
                review_count: 89,
                opening_hours: { open_now: true },
                photos: [],
                types: ['restaurant', 'food', 'establishment'],
                location: { lat: -20.4486, lng: -54.6295 },
                price_level: 2,
                source: 'Dados simulados (Google Places não configurado)'
            });
        }

        return simulatedPlaces;
    }

    // ===== TRANSPORTE =====
    async getTransportationInfo(from: string, to: string, type: 'bus' | 'flight' | 'car' = 'car'): Promise<TransportationInfo[]> {
        try {
            // Por enquanto, simulando dados de transporte
            // Futuramente, integrar com APIs de ônibus, voos, etc.
            return this.simulateTransportationInfo(from, to, type);
        } catch (error) {
            console.error('Erro ao buscar informações de transporte:', error);
            return [];
        }
    }

    private simulateTransportationInfo(from: string, to: string, type: 'bus' | 'flight' | 'car'): TransportationInfo[] {
        const info: TransportationInfo[] = [];

        if (type === 'bus') {
            info.push({
                type: 'bus',
                from,
                to,
                departure_time: '08:00',
                arrival_time: '12:00',
                duration: '4h',
                price: 45.00,
                company: 'Viação Cruzeiro do Sul',
                route: `${from} → ${to}`,
                source: 'Dados simulados'
            });
        }

        if (type === 'car') {
            info.push({
                type: 'car',
                from,
                to,
                duration: '3h 30min',
                route: 'BR-163 → MS-178',
                source: 'Dados simulados'
            });
        }

        return info;
    }

    // ===== UTILITÁRIOS =====
    async getPlaceDetails(placeId: string): Promise<PlaceInfo | null> {
        try {
            if (!this.GOOGLE_PLACES_API_KEY) {
                console.warn('⚠️ Google Places API key não configurada');
                return null;
            }

            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,photos,types,geometry,price_level&key=${this.GOOGLE_PLACES_API_KEY}&language=pt-BR`
            );

            if (!response.ok) {
                throw new Error('Erro na API do Google Places');
            }

            const data = await response.json();
            if (data.result) {
                return this.parsePlacesData([data.result])[0];
            }

            return null;
        } catch (error) {
            console.error('Erro ao buscar detalhes do lugar:', error);
            return null;
        }
    }

    getServiceStatus(): {
        weather: boolean;
        places: boolean;
        transportation: boolean;
    } {
        return {
            weather: !!this.WEATHER_API_KEY,
            places: !!this.GOOGLE_PLACES_API_KEY,
            transportation: false // Sempre simulado por enquanto
        };
    }

    // ===== CACHE SIMPLES =====
    private cache = new Map<string, { data: any; timestamp: number }>();
    private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

    private getCachedData(key: string): any | null {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.data;
        }
        return null;
    }

    private setCachedData(key: string, data: any): void {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    clearCache(): void {
        this.cache.clear();
    }

    getCacheStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

export const guataExternalAPIsService = new GuataExternalAPIsService();

