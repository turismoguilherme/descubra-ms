import React from 'react';

const TestPage = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'red', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>TESTE - Página Funcionando!</h1>
        <p style={{ fontSize: '1.2rem' }}>Se você vê isso, o React está funcionando!</p>
      </div>
    </div>
  );
};

export default TestPage;
