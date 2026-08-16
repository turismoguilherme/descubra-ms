
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { HeatMapData } from "@/types/management";

interface RegionDensityCardsProps {
  heatMapData: HeatMapData[];
}

const RegionDensityCards = ({ heatMapData }: RegionDensityCardsProps) => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {heatMapData.map((item) => (
        <Card 
          key={item.regionId} 
          className={`p-4 ${selectedRegion === item.regionId ? 'ring-2 ring-ms-primary-blue' : ''}`}
          onClick={() => setSelectedRegion(item.regionId)}
        >
          <div className="flex justify-between">
            <h3 className="font-medium">{item.regionId}</h3>
            <span 
              className={`px-2 py-1 rounded text-xs ${
                item.density > 0.7 ? 'bg-green-100 text-green-800' : 
                item.density > 0.4 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {item.density > 0.7 ? 'Alta' : item.density > 0.4 ? 'Média' : 'Baixa'} Densidade
            </span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  item.density > 0.7 ? 'bg-green-600' : 
                  item.density > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                }`} 
                style={{ width: `${item.density * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Densidade: {Math.round(item.density * 100)}%
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default RegionDensityCards;
