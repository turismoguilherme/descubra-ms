
import { supabase } from "@/integrations/supabase/client";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  context?: string;
  locationName?: string;
}

export const saveLocationToSupabase = async (locationData: LocationData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    // Como a tabela location_logs não existe no Supabase, vamos usar user_interactions
    const { data, error } = await supabase
      .from('user_interactions')
      .insert([
        {
          user_id: user.id,
          interaction_type: 'location_log',
          interaction_data: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            accuracy: locationData.accuracy,
            context: locationData.context || 'general',
            location_name: locationData.locationName
          }
        }
      ]);

    if (error) {
      console.error("Erro ao salvar localização:", error);
      throw error;
    }

    console.log("Localização salva no Supabase:", data);
    return data;
  } catch (error) {
    console.error("Erro no serviço de geolocalização:", error);
    throw error;
  }
};

export const getUserLocationHistory = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    const { data, error } = await supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('interaction_type', 'location_log')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error("Erro ao buscar histórico de localização:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    throw error;
  }
};
