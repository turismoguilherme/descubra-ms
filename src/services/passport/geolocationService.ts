import type { GeolocationData, GeofenceValidation } from '@/types/passportDigital';
import { supabase } from '@/integrations/supabase/client';

class GeolocationService {
  /**
   * Obter localização atual do usuário
   */
  private readonly positionOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
  };

  private positionToData(position: GeolocationPosition): GeolocationData {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };
  }

  async getCurrentLocation(): Promise<GeolocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada pelo navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(this.positionToData(position)),
        (error) => {
          reject(new Error(`Erro ao obter localização: ${error.message}`));
        },
        this.positionOptions
      );
    });
  }

  /**
   * Coleta leituras por alguns segundos e retorna a de melhor precisão (útil no admin).
   */
  async getBestCurrentLocation(maxWaitMs = 12000): Promise<GeolocationData> {
    if (!navigator.geolocation) {
      throw new Error('Geolocalização não suportada pelo navegador');
    }

    return new Promise((resolve, reject) => {
      let best: GeolocationData | null = null;
      let settled = false;

      const consider = (position: GeolocationPosition) => {
        const data = this.positionToData(position);
        if (!best || data.accuracy < best.accuracy) {
          best = data;
        }
      };

      const done = (error?: GeolocationPositionError) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
        if (best) {
          resolve(best);
        } else {
          reject(
            new Error(
              error
                ? `Erro ao obter localização: ${error.message}`
                : 'Não foi possível obter localização a tempo'
            )
          );
        }
      };

      let watchId: number | null = null;
      watchId = navigator.geolocation.watchPosition(
        (position) => consider(position),
        () => {},
        this.positionOptions
      );

      navigator.geolocation.getCurrentPosition(
        (position) => consider(position),
        () => {},
        this.positionOptions
      );

      const timer = window.setTimeout(() => done(), maxWaitMs);
    });
  }

  /**
   * Calcular distância entre dois pontos (Haversine)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Raio da Terra em metros
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Converter graus para radianos
   */
  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Validar se usuário está dentro do geofence
   */
  async validateProximity(
    checkpointId: string,
    userLat: number,
    userLon: number
  ): Promise<GeofenceValidation> {
    try {
      // Buscar checkpoint
      const { data: checkpoint, error } = await supabase
        .from('route_checkpoints')
        .select('id, name, latitude, longitude, geofence_radius')
        .eq('id', checkpointId)
        .single();

      if (error || !checkpoint) {
        return {
          valid: false,
          distance: 0,
          within_radius: false,
          checkpoint_id: checkpointId,
          checkpoint_name: '',
          required_radius: 100,
        };
      }

      if (!checkpoint.latitude || !checkpoint.longitude) {
        return {
          valid: false,
          distance: 0,
          within_radius: false,
          checkpoint_id: checkpointId,
          checkpoint_name: checkpoint.name,
          required_radius: checkpoint.geofence_radius || 100,
        };
      }

      // Calcular distância usando fórmula de Haversine (precisa para distâncias curtas)
      const distance = this.calculateDistance(
        checkpoint.latitude,
        checkpoint.longitude,
        userLat,
        userLon
      );

      console.log('🔵 [geolocationService.validateProximity] Cálculo de distância:', {
        checkpointId: checkpoint.id,
        checkpointName: checkpoint.name,
        checkpointLat: checkpoint.latitude,
        checkpointLon: checkpoint.longitude,
        userLat,
        userLon,
        calculatedDistance: Math.round(distance),
        requiredRadius: checkpoint.geofence_radius || 100,
      });

      const requiredRadius = checkpoint.geofence_radius || 100;
      const withinRadius = distance <= requiredRadius;

      return {
        valid: withinRadius,
        distance: Math.round(distance),
        within_radius: withinRadius,
        checkpoint_id: checkpointId,
        checkpoint_name: checkpoint.name,
        required_radius: requiredRadius,
      };
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Erro ao validar proximidade:', error);
      return {
        valid: false,
        distance: 0,
        within_radius: false,
        checkpoint_id: checkpointId,
        checkpoint_name: '',
        required_radius: 100,
      };
    }
  }

  /**
   * Validar usando função SQL do Supabase (mais preciso)
   */
  async validateProximitySQL(
    checkpointLat: number,
    checkpointLon: number,
    userLat: number,
    userLon: number,
    radiusMeters: number = 100
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_geofence', {
        checkpoint_lat: checkpointLat,
        checkpoint_lon: checkpointLon,
        user_lat: userLat,
        user_lon: userLon,
        radius_meters: radiusMeters,
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Erro ao validar geofence via SQL:', error);
      return false;
    }
  }

  /**
   * Solicitar permissão de geolocalização
   */
  async requestPermission(): Promise<boolean> {
    if (!navigator.permissions) {
      // Navegadores que não suportam Permissions API
      return true;
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state === 'granted' || result.state === 'prompt';
    } catch (error) {
      console.warn('Erro ao verificar permissão:', error);
      return true; // Assume que pode solicitar
    }
  }
}

export const geolocationService = new GeolocationService();

