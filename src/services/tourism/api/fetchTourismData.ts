
import { TourismData } from "@/types/tourism";
import { mockData } from "../mockData";

export async function fetchTourismData(): Promise<TourismData> {
  try {
    // Como não temos uma API externa configurada, retornamos dados mock
    const data: TourismData = {
      ...mockData,
      source: "mock",
      lastUpdate: new Date().toISOString()
    };
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar dados de turismo da API:", error);
    
    // Fallback para dados mock em caso de erro
    return {
      ...mockData,
      source: "mock",
      lastUpdate: new Date().toISOString()
    };
  }
}

export async function fetchSupabaseData(): Promise<TourismData> {
  try {
    // Implementação futura para buscar dados do Supabase
    // Por enquanto retorna dados mock
    const data: TourismData = {
      ...mockData,
      source: "mock",
      lastUpdate: new Date().toISOString()
    };
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar dados do Supabase:", error);
    
    return {
      ...mockData,
      source: "mock",
      lastUpdate: new Date().toISOString()
    };
  }
}

export async function fetchExternalAPIData(): Promise<TourismData> {
  try {
    // Implementação futura para API externa
    const data: TourismData = {
      ...mockData,
      source: "mock",
      lastUpdate: new Date().toISOString()
    };
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar dados da API externa:", error);
    
    return {
      ...mockData,
      source: "mock",
      lastUpdate: new Date().toISOString()
    };
  }
}
