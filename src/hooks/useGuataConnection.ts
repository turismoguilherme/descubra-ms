
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useGuataConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionChecking, setConnectionChecking] = useState(true);

  // Verificar conexão com a API
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionChecking(true);
      try {
        // Testar conexão com um ping simples
        await supabase.functions.invoke("guata-ai", {
          body: { prompt: "ping" }
        });
        setIsConnected(true);
        console.log("Conexão com a API Guatá estabelecida com sucesso");
      } catch (error) {
        console.error("Falha na conexão com a API Guatá:", error);
        setIsConnected(false);
      } finally {
        setConnectionChecking(false);
      }
    };

    checkConnection();
  }, []);

  return { isConnected, connectionChecking };
};
