
import { Compass } from "lucide-react";

const MapLegend = () => {
  return (
    <div className="bg-white rounded-lg p-6 border shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
          <Compass className="w-5 h-5 text-white" />
        </div>
        <h4 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Legenda do Mapa Colorido
        </h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Alta Densidade - Verde Neon */}
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300 border border-green-200">
          <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg border-4 border-white" 
               style={{ 
                 background: 'linear-gradient(45deg, #00FF80, #00CC66)',
                 boxShadow: '0 0 20px #00FF8066, 0 4px 15px rgba(0,0,0,0.2)'
               }}>
            <span className="text-white text-2xl font-bold animate-pulse">🟢</span>
          </div>
          <div className="text-sm font-bold text-gray-800 mb-1">Alta Densidade</div>
          <div className="text-xs text-gray-600 mb-2">Maior fluxo turístico</div>
          <div className="text-xs font-bold text-white px-3 py-1 rounded-full shadow-md" 
               style={{ backgroundColor: '#00FF80' }}>
            70%+
          </div>
        </div>
        
        {/* Média Densidade - Laranja Elétrico */}
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-all duration-300 border border-orange-200">
          <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg border-4 border-white" 
               style={{ 
                 background: 'linear-gradient(45deg, #FF8000, #FF6600)',
                 boxShadow: '0 0 20px #FF800066, 0 4px 15px rgba(0,0,0,0.2)'
               }}>
            <span className="text-white text-2xl font-bold animate-pulse">🟡</span>
          </div>
          <div className="text-sm font-bold text-gray-800 mb-1">Média Densidade</div>
          <div className="text-xs text-gray-600 mb-2">Fluxo moderado</div>
          <div className="text-xs font-bold text-white px-3 py-1 rounded-full shadow-md" 
               style={{ backgroundColor: '#FF8000' }}>
            40-70%
          </div>
        </div>
        
        {/* Baixa Densidade - Pink Neon */}
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-lg transition-all duration-300 border border-pink-200">
          <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg border-4 border-white" 
               style={{ 
                 background: 'linear-gradient(45deg, #FF0080, #FF0066)',
                 boxShadow: '0 0 20px #FF008066, 0 4px 15px rgba(0,0,0,0.2)'
               }}>
            <span className="text-white text-2xl font-bold animate-pulse">🔴</span>
          </div>
          <div className="text-sm font-bold text-gray-800 mb-1">Baixa Densidade</div>
          <div className="text-xs text-gray-600 mb-2">Potencial a explorar</div>
          <div className="text-xs font-bold text-white px-3 py-1 rounded-full shadow-md" 
               style={{ backgroundColor: '#FF0080' }}>
            &lt;40%
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <p className="text-xs text-gray-600 text-center">
          ✨ Mapa com cores vibrantes e animações para melhor visualização das regiões turísticas
        </p>
      </div>
    </div>
  );
};

export default MapLegend;
