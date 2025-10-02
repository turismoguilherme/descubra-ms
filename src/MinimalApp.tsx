import React from 'react';

const MinimalApp = () => {
  console.log("🧪 MINIMAL APP: Carregando aplicação mínima");
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', textAlign: 'center' }}>
        🎉 APLICAÇÃO MÍNIMA FUNCIONANDO!
      </h1>
      <p style={{ color: '#666', textAlign: 'center' }}>
        Se você está vendo isso, o React está funcionando.
      </p>
      
      <div style={{ 
        backgroundColor: '#4CAF50', 
        color: 'white', 
        padding: '20px', 
        margin: '20px auto',
        borderRadius: '10px',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h2>✅ React funcionando</h2>
        <p>Vite funcionando</p>
        <p>Servidor funcionando</p>
      </div>
      
      <div style={{ 
        backgroundColor: '#2196F3', 
        color: 'white', 
        padding: '20px', 
        margin: '20px auto',
        borderRadius: '10px',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h2>🔧 Próximos passos</h2>
        <p>1. Adicionar roteamento</p>
        <p>2. Adicionar componentes</p>
        <p>3. Adicionar funcionalidades</p>
      </div>
    </div>
  );
};

export default MinimalApp;
