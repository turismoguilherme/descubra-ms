
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Database, Upload, CheckCircle, RefreshCcw } from "lucide-react";
import { fetchTourismDataFromSupabase, saveTourismDataToSupabase } from "@/integrations/supabase/tourism";
import { mockData } from "@/services/tourism/mockData";
import { refreshTourismData } from "@/services/tourism";
import { clearTourismCache } from "@/services/tourism/settings";

const SupabaseDataLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dataJson, setDataJson] = useState("");
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const fetchFromSupabase = async () => {
    setIsFetching(true);
    try {
      const data = await fetchTourismDataFromSupabase();
      if (data) {
        setDataJson(JSON.stringify(data, null, 2));
        setLastFetched(new Date());
        toast.success("Dados carregados do Supabase com sucesso");
      } else {
        toast.error("Não foi possível carregar dados do Supabase");
        // Carregar dados mockados como fallback
        setDataJson(JSON.stringify({...mockData, source: "mockado", lastUpdate: new Date().toISOString()}, null, 2));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados do Supabase");
    } finally {
      setIsFetching(false);
    }
  };

  const saveToSupabase = async () => {
    setIsLoading(true);
    try {
      // Validar o JSON
      const parsedData = JSON.parse(dataJson);
      
      // Enviar para o Supabase
      const success = await saveTourismDataToSupabase(parsedData);
      
      if (success) {
        toast.success("Dados salvos no Supabase com sucesso");
        clearTourismCache(); // Limpar cache para forçar carregamento dos novos dados
      } else {
        toast.error("Não foi possível salvar os dados no Supabase");
      }
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro de validação: certifique-se de que o JSON é válido");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForceRefresh = async () => {
    toast.loading("Atualizando dados de todas as fontes...");
    try {
      const success = await refreshTourismData();
      
      if (success) {
        toast.success("Dados atualizados com sucesso");
        await fetchFromSupabase(); // Recarregar dados após atualização
      } else {
        toast.error("Erro ao atualizar dados");
      }
    } catch (error) {
      console.error("Erro na atualização:", error);
      toast.error("Erro ao atualizar dados");
    }
  };

  useEffect(() => {
    // Carregar dados automaticamente na montagem do componente
    fetchFromSupabase();
  }, []);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-6 w-6 text-[#003087]" />
          Dados do Supabase
        </CardTitle>
        <CardDescription>
          Visualize e atualize manualmente os dados armazenados no Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="data-json" className="text-sm font-medium">
              Dados em formato JSON
            </label>
            <div className="flex gap-2">
              <Button 
                onClick={fetchFromSupabase} 
                disabled={isFetching} 
                variant="outline" 
                size="sm"
              >
                {isFetching ? "Carregando..." : "Atualizar"}
              </Button>
              <Button
                onClick={handleForceRefresh}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <RefreshCcw size={14} />
                Forçar Atualização
              </Button>
            </div>
          </div>
          <Textarea
            id="data-json"
            value={dataJson}
            onChange={(e) => setDataJson(e.target.value)}
            className="font-mono text-sm h-[300px]"
            placeholder="Dados JSON aparecerão aqui quando carregados"
          />
          {lastFetched && (
            <p className="text-xs text-gray-500 mt-1">
              Último carregamento: {lastFetched.toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={saveToSupabase} 
          disabled={isLoading || !dataJson}
          className="bg-[#003087] hover:bg-[#003087]/90"
        >
          {isLoading ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Salvar no Supabase
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SupabaseDataLoader;
