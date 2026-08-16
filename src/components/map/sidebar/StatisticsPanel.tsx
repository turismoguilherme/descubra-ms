
import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatisticsPanelProps {
  mapStats: {
    regioes: number;
    municipios: number;
  };
  selectedRegion: string;
  filteredDestinations: Array<{ id: number; nome: string; regiao: string; lat: number; lng: number }>;
}

const StatisticsPanel = ({ mapStats, selectedRegion, filteredDestinations }: StatisticsPanelProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-ms-primary-blue mb-3">
        Resumo da Seleção
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Nº de Regiões Turísticas</span>
          <span className="font-medium">
            {selectedRegion === "Todas" ? mapStats.regioes : 1}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Nº de Municípios</span>
          <span className="font-medium">
            {selectedRegion === "Todas" 
              ? mapStats.municipios 
              : filteredDestinations.length}
          </span>
        </div>
      </div>
      <div className="mt-4">
        <Button variant="outline" className="w-full">
          <Download size={16} className="mr-2" />
          Baixar em PDF
        </Button>
      </div>
    </div>
  );
};

export default StatisticsPanel;
