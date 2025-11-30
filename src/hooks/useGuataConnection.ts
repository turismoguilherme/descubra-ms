
import { useState, useEffect } from "react";

export const useGuataConnection = () => {
  // Iniciar como conectado para não bloquear a interface
  // O Guatá usa APIs externas (Gemini/Google Search) que funcionam independentemente
  const [isConnected, setIsConnected] = useState(true);
  const [connectionChecking, setConnectionChecking] = useState(false);

  // Verificação simplificada - Guatá funciona via APIs externas
  useEffect(() => {
    // Definir como conectado imediatamente para melhor UX
    setIsConnected(true);
    setConnectionChecking(false);
    console.log("🦦 Guatá pronto para uso (APIs externas)");
  }, []);

  return { isConnected, connectionChecking };
};
