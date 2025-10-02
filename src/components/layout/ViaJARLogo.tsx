import React, { useState } from 'react';

const ViaJARLogo: React.FC = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-center justify-center flex-1 md:flex-none md:justify-start">
      <div className="flex items-center">
        {!imageError ? (
          <img 
            src="/images/logo-viajar-real.png?v=viajar-2025-final" 
            alt="ViaJAR - Ecossistema inteligente de turismo" 
            className="h-14 w-auto object-contain"
            onError={(e) => {
              console.warn('Logo ViaJAR não encontrada, usando fallback');
              setImageError(true);
            }}
          />
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">V</span>
            </div>
            <span className="text-2xl font-bold text-primary">ViaJAR</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViaJARLogo;

