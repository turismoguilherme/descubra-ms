import React from "react";

const LoadingFallback = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg font-medium">Carregando...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;