import React from 'react';

const ViaJARLogo: React.FC = () => {
  return (
    <div className="flex items-center justify-center flex-1 md:flex-none md:justify-start">
      {/* Logo ViaJAR - Imagem real */}
      <div className="flex items-center">
        <img 
          src="/images/logo-viajar-real.png?v=viajar-2025-final" 
          alt="ViaJAR - Ecossistema inteligente de turismo" 
          className="h-14 w-auto object-contain"
          onError={(e) => {
            console.error('Erro ao carregar logo ViaJAR:', e);
            // Fallback para logo alternativa se necessário
          }}
        />
      </div>
    </div>
  );
};

export default ViaJARLogo;

