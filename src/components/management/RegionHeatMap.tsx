
import { mockHeatMapData } from "@/data/heatMapData";
import HeatMapVisualization from "./map/HeatMapVisualization";
import RegionDensityCards from "./map/RegionDensityCards";

interface RegionHeatMapProps {
  region: string;
}

const RegionHeatMap = ({ region }: RegionHeatMapProps) => {
  // Get the appropriate data based on region
  const heatMapData = mockHeatMapData[region] || mockHeatMapData["all"];
  
  return (
    <div className="flex flex-col space-y-6">
      <HeatMapVisualization heatMapData={heatMapData} region={region} />
      <RegionDensityCards heatMapData={heatMapData} />
    </div>
  );
};

export default RegionHeatMap;
