
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MapPin } from "lucide-react";
import { Region } from "@/types/tourism";

interface ChartBarProps {
  region: Region;
  index: number;
  heightPercentage: number;
  barColor: string;
  densityEmoji: string;
}

const ChartBar = ({ region, index, heightPercentage, barColor, densityEmoji }: ChartBarProps) => {
  const visitors = region.visitors || 0;

  return (
    <div className="flex-1 flex flex-col items-center group">
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className="w-full hover:scale-105 transition-all duration-300 rounded-t-lg cursor-pointer shadow-sm hover:shadow-md relative"
            style={{ 
              height: `${heightPercentage}%`,
              backgroundColor: barColor
            }}
          >
            {/* Número da posição no topo da barra */}
            <div 
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-sm"
              style={{ backgroundColor: barColor }}
            >
              {index + 1}
            </div>

            {/* Value display on hover */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white px-3 py-2 rounded-lg shadow-lg border">
              <div className="text-center">
                <div className="font-bold">{visitors.toFixed(1)}%</div>
                <div className="text-gray-500">visitantes</div>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-white border shadow-lg rounded-lg p-4">
          <div className="text-center">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-ms-primary-blue" />
              <p className="font-bold text-gray-800">{region.name}</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4 p-2 bg-blue-50 rounded">
                <span className="text-gray-600">Visitantes:</span>
                <span className="font-bold text-blue-700">{visitors.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between gap-4 p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Densidade:</span>
                <span className="font-bold" style={{ color: barColor }}>
                  {(region.density * 100).toFixed(0)}%
                </span>
              </div>
              <div className="mt-3 p-2 rounded text-xs font-semibold text-center" style={{ 
                backgroundColor: `${barColor}20`,
                color: barColor 
              }}>
                {densityEmoji} {region.density > 0.7 ? 'Alta densidade' : 
                 region.density > 0.4 ? 'Média densidade' : 'Baixa densidade'}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
      
      {/* Label da região abaixo da barra */}
      <div className="mt-4 text-xs text-gray-600 text-center font-medium">
        {region.name}
      </div>
    </div>
  );
};

export default ChartBar;
