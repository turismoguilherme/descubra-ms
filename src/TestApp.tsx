import React from 'react';

const TestApp = () => {
  console.log("🧪 TEST APP: Componente de teste carregado");
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', textAlign: 'center' }}>
        🎉 TESTE FUNCIONANDO!
      </h1>
      <p style={{ color: '#666', textAlign: 'center' }}>
        Se você está vendo isso, o React está funcionando.
      </p>
      <div style={{ 
        backgroundColor: '#4CAF50', 
        color: 'white', 
        padding: '10px', 
        margin: '20px auto',
        borderRadius: '5px',
        textAlign: 'center',
        maxWidth: '300px'
      }}>
        ✅ Aplicação carregando corretamente!
      </div>
    </div>
  );
};

export default TestApp;
