
import { Region } from "@/types/tourism";

interface RegionListItemProps {
  region: Region;
  index: number;
  regionColor: string;
  densityEmoji: string;
}

const RegionListItem = ({ region, index, regionColor, densityEmoji }: RegionListItemProps) => {
  return (
    <div className="group hover:scale-105 transition-all duration-200">
      <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-white hover:shadow-md transition-all border border-gray-100">
        <div 
          className="w-10 h-10 shrink-0 rounded-lg text-white flex items-center justify-center font-bold text-sm shadow-sm"
          style={{ backgroundColor: regionColor }}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-gray-800 truncate">{region.name || `Região ${index + 1}`}</h4>
            <span className="text-xs font-bold text-white bg-ms-primary-blue px-2 py-1 rounded-full shrink-0">
              {region.visitors.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Densidade:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${region.density * 100}%`,
                  backgroundColor: regionColor
                }}
              ></div>
            </div>
            <span 
              className="text-xs px-2 py-0.5 rounded-full text-white font-medium flex items-center gap-1 shrink-0"
              style={{ backgroundColor: regionColor }}
            >
              {densityEmoji} {(region.density * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionListItem;
