import type { GeolocationData, GeofenceValidation } from '@/types/passportDigital';
import { supabase } from '@/integrations/supabase/client';

class GeolocationService {
  /**
   * Obter localização atual do usuário
   */
  async getCurrentLocation(): Promise<GeolocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada pelo navegador'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          reject(new Error(`Erro ao obter localização: ${error.message}`));
        },
        options
      );
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

      // Calcular distância
      const distance = this.calculateDistance(
        checkpoint.latitude,
        checkpoint.longitude,
        userLat,
        userLon
      );

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
    } catch (error: any) {
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

