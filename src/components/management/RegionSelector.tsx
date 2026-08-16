
import { msRegions } from "@/data/msRegions";

interface RegionSelectorProps {
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  userRegion: string;
  userRole: string;
}

const RegionSelector = ({ selectedRegion, setSelectedRegion, userRegion, userRole }: RegionSelectorProps) => {
  // Convert region IDs to display names for dropdown
  const regions = Object.entries(msRegions).map(([id, name]) => ({
    id,
    name
  }));

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-ms-primary-blue">🏞️ Painel de Gestão do Turismo MS</h1>
        {userRole && (
          <p className="text-gray-600 mt-2">
            <strong>Acesso:</strong> {' '}
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium">
              {userRole === 'gestor' ? '👤 Gestor Regional' : 
               userRole === 'atendente' ? '🎯 Atendente CAT' :
               userRole === 'admin' ? '🔴 Administrador' :
               userRole === 'tech' ? '🔧 Técnico' :
               userRole === 'municipal' ? '🏛️ Municipal' : userRole}
            </span>
            {userRegion !== 'all' && userRegion && msRegions[userRegion as keyof typeof msRegions] && (
              <span className="ml-2">
                | <strong>Região:</strong> {msRegions[userRegion as keyof typeof msRegions]}
              </span>
            )}
          </p>
        )}
      </div>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border-[2px] border-blue-200">
          <span className="text-gray-700 font-semibold">📍 Região Ativa:</span>
          <select
            className="border-2 border-blue-300 p-2 rounded-md bg-white text-gray-800 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            {regions.map(region => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default RegionSelector;
