import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const SimpleApp = () => {
  console.log("🚀 SIMPLE APP: Carregando aplicação simplificada");
  
  return (
    <BrowserRouter>
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f0f0f0', 
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{ color: '#333', textAlign: 'center' }}>
          🎉 APLICAÇÃO SIMPLIFICADA FUNCIONANDO!
        </h1>
        <p style={{ color: '#666', textAlign: 'center' }}>
          React Router funcionando corretamente.
        </p>
        
        <Routes>
          <Route path="/" element={
            <div style={{ 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              padding: '20px', 
              margin: '20px auto',
              borderRadius: '10px',
              textAlign: 'center',
              maxWidth: '500px'
            }}>
              <h2>🏠 Página Principal</h2>
              <p>Você está na rota raiz (/)</p>
            </div>
          } />
          
          <Route path="/test" element={
            <div style={{ 
              backgroundColor: '#2196F3', 
              color: 'white', 
              padding: '20px', 
              margin: '20px auto',
              borderRadius: '10px',
              textAlign: 'center',
              maxWidth: '500px'
            }}>
              <h2>🧪 Página de Teste</h2>
              <p>Você está na rota /test</p>
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default SimpleApp;
