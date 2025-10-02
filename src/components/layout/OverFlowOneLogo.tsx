import React from 'react';
import { Link } from 'react-router-dom';
import { useBrand } from '@/context/BrandContext'; // Importar useBrand

const OverFlowOneLogo: React.FC = () => {
  const { config } = useBrand(); // Usar o contexto da marca
  
  // Adicionado para depuração da logo
  console.log('🔍 OverFlowOneLogo: Configuração da logo recebida:', config.logo.src, config.logo.alt, config.logo.fallback);

  return (
    <div className="flex items-center justify-center flex-1 md:flex-none md:justify-start">
      <div className="flex items-center">
        {/* Logo com fallback para texto */}
        <div className="flex items-center">
          <img 
            alt={config.logo.alt}
            src={config.logo.src}
            className="h-12 w-auto transition-transform duration-300 hover:scale-105 object-contain" 
            loading="eager" 
            onError={(e) => {
              console.error('OverFlow One logo failed to load, showing text fallback', e.currentTarget.src);
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }} 
          />
          {/* Fallback de texto, visível apenas se a imagem falhar */}
          <div 
            className="text-2xl font-bold text-blue-600 hidden items-center"
            style={{ display: 'none' }} // Inicia escondido
          >
            <div className="flex items-center space-x-2">
              {/* Símbolo simplificado */}
              <div className="flex items-center">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-2">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div className="w-4 h-4 bg-blue-400 rounded-full mr-1"></div>
                <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
              </div>
              <span>{config.logo.fallback}</span> {/* Usar o fallback do contexto */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverFlowOneLogo; 