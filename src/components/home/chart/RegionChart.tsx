
import { Region } from "@/types/tourism";
import { TooltipProvider } from "@/components/ui/tooltip";
import ChartHeader from "./ChartHeader";
import ChartBar from "./ChartBar";
import ChartCaption from "./ChartCaption";
import RegionListItem from "./RegionListItem";
import { getDensityColor, getDensityEmoji } from "./utils/chartUtils";

interface RegionChartProps {
  regions: Region[];
}

const RegionChart = ({ regions }: RegionChartProps) => {
  const hasRegions = regions && regions.length > 0;
  const maxHeight = 75;
  const maxVisitors = hasRegions 
    ? Math.max(...regions.map(region => region.visitors || 0))
    : 1;

  console.log("RegionChart dados:", { 
    regioes: regions, 
    maxVisitors, 
    numRegioes: regions?.length || 0,
    visitantesPorRegiao: regions?.map(r => ({nome: r.name, visitantes: r.visitors}))
  });

  return (
    <TooltipProvider>
      <div className="w-full space-y-8">
        {/* Header da seção */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-ms-primary-blue mb-2">
            Distribuição de Visitantes por Região
          </h2>
          <p className="text-gray-600">
            Visualize a densidade turística das {regions?.length || 0} regiões do Mato Grosso do Sul
          </p>
        </div>

        {/* Área do gráfico */}
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="h-80 flex items-end justify-between gap-4 mb-6">
            {hasRegions && regions.length > 0 ? (
              regions.map((region, index) => {
                const visitors = region.visitors || 0;
                const heightPercentage = maxVisitors > 0 
                  ? Math.max((visitors / maxVisitors) * maxHeight, 15)
                  : 15;
                
                const barColor = getDensityColor(region.density);
                const densityEmoji = getDensityEmoji(region.density);
                
                return (
                  <ChartBar
                    key={region.id || index}
                    region={region}
                    index={index}
                    heightPercentage={heightPercentage}
                    barColor={barColor}
                    densityEmoji={densityEmoji}
                  />
                );
              })
            ) : (
              <div className="w-full flex items-center justify-center">
                <div className="text-center py-16">
                  <div className="text-4xl text-gray-300 mb-4">📊</div>
                  <p className="text-gray-500 font-medium">Nenhum dado de região disponível</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Caption */}
        <ChartCaption />

        {/* Lista de regiões numeradas */}
        {hasRegions && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Ranking das Regiões</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regions.map((region, index) => {
                const regionColor = getDensityColor(region.density);
                const densityEmoji = getDensityEmoji(region.density);
                
                return (
                  <RegionListItem
                    key={region.id || index}
                    region={region}
                    index={index}
                    regionColor={regionColor}
                    densityEmoji={densityEmoji}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default RegionChart;
