
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MapboxTokenInputProps {
  mapboxToken: string;
  onTokenSubmit: (token: string) => void;
}

const MapboxTokenInput = ({ mapboxToken, onTokenSubmit }: MapboxTokenInputProps) => {
  const [token, setToken] = useState<string>(mapboxToken);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Por favor, insira um token válido");
      return;
    }
    onTokenSubmit(token);
    toast.success("Token atualizado com sucesso!");
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
      <p className="text-gray-600 mb-4 text-center">
        Para visualizar o mapa, você precisa criar uma conta no Mapbox e inserir seu token de acesso público.
      </p>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-2">
        <Input
          type="text"
          placeholder="Insira seu token do Mapbox aqui..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full"
        />
        <Button type="submit" className="w-full" variant="default">Aplicar Token</Button>
      </form>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Você pode obter um token gratuito em <a href="https://www.mapbox.com/account/access-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">mapbox.com</a>
      </p>
    </div>
  );
};

export default MapboxTokenInput;
