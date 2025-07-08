
import { Region } from "@/types/tourism";

interface RegionListProps {
  regions: Region[];
}

const RegionList = ({ regions }: RegionListProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
      {regions.map((region, index) => (
        <div 
          key={region.id} 
          className="flex items-center p-1.5 rounded-md bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
        >
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-ms-primary-blue text-white flex items-center justify-center text-xs font-medium mr-2">
            {index + 1}
          </div>
          <span className="text-sm font-medium text-gray-700 truncate" title={region.name}>
            {region.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default RegionList;
