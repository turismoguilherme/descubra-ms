
import { supabase } from "./client";
import { TourismData } from "@/types/tourism";
import { mockData } from "@/services/tourism/mockData";

/**
 * Busca dados de turismo do Supabase
 * Nota: A tabela dados_turismo não existe no schema atual, usando dados mock
 */
export async function fetchTourismDataFromSupabase(): Promise<TourismData | null> {
  try {
    console.log("Tentando buscar dados do Supabase...");
    
    // Como a tabela dados_turismo não existe, retornamos dados mock
    console.log("Tabela dados_turismo não encontrada, usando dados mock");
    return {
      ...mockData,
      source: "mock" as const,
      lastUpdate: new Date().toISOString()
    };
    
  } catch (error) {
    console.error("Erro ao processar dados do Supabase:", error);
    return null;
  }
}

/**
 * Salva dados de turismo no Supabase
 * Nota: Implementação placeholder - tabela dados_turismo não existe
 */
export async function saveTourismDataToSupabase(tourismData: any): Promise<boolean> {
  try {
    console.log("Tentando salvar dados no Supabase...", tourismData);
    
    // Como a tabela dados_turismo não existe, apenas logamos
    console.log("Tabela dados_turismo não encontrada - dados não salvos");
    return false;
    
  } catch (error) {
    console.error("Erro ao processar salvamento no Supabase:", error);
    return false;
  }
}
