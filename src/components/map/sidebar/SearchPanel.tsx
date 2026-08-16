
import React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchPanelProps {
  regions: Array<{ id: number; nome: string; cor: string; lat: number; lng: number }>;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  filteredDestinations: Array<{ id: number; nome: string; regiao: string; lat: number; lng: number }>;
}

const SearchPanel = ({
  regions,
  selectedRegion,
  setSelectedRegion,
  selectedCity,
  setSelectedCity,
  filteredDestinations
}: SearchPanelProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-ms-primary-blue mb-4 flex items-center">
        <Search size={20} className="mr-2" />
        Pesquisar
      </h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Região Turística</label>
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione uma região" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas as regiões</SelectItem>
            {regions.map((regiao) => (
              <SelectItem key={regiao.id} value={regiao.nome}>
                {regiao.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Município</label>
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um município" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos os municípios</SelectItem>
            {filteredDestinations.map((destino) => (
              <SelectItem key={destino.id} value={destino.nome}>
                {destino.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button className="w-full bg-ms-primary-blue hover:bg-ms-rivers-blue">
        Pesquisar
      </Button>
    </div>
  );
};

export default SearchPanel;
