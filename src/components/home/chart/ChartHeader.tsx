
import { TrendingUp } from "lucide-react";

interface ChartHeaderProps {
  regionsCount: number;
}

const ChartHeader = ({ regionsCount }: ChartHeaderProps) => {
  return (
    <div className="text-center mb-6 p-6 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="p-2 bg-ms-primary-blue rounded-lg">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-ms-primary-blue">
          Distribuição de Visitantes por Região
        </h2>
      </div>
      <p className="text-gray-600">
        Visualize a densidade turística das {regionsCount} regiões do Mato Grosso do Sul
      </p>
    </div>
  );
};

export default ChartHeader;
