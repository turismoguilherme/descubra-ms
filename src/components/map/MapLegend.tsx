
import React from "react";

const MapLegend = () => {
  return (
    <div className="bg-white p-4 border-t">
      <h4 className="font-medium mb-2">Legenda</h4>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-ms-pantanal-green mr-2"></div>
          <span className="text-sm">Destino Turístico</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-ms-secondary-yellow mr-2"></div>
          <span className="text-sm">CAT</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-ms-rivers-blue mr-2"></div>
          <span className="text-sm">Hotel</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-ms-guavira-purple mr-2"></div>
          <span className="text-sm">Restaurante</span>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;
