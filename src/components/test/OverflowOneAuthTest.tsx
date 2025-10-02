import React from 'react';
import { useOverflowOneAuth } from '@/hooks/useOverflowOneAuth';

const OverflowOneAuthTest: React.FC = () => {
  try {
    const auth = useOverflowOneAuth();
    return (
      <div className="p-4 bg-green-100 border border-green-300 rounded">
        <h3 className="text-green-800 font-semibold">✅ OverflowOneAuth funcionando!</h3>
        <p className="text-green-700">Loading: {auth.loading ? 'Sim' : 'Não'}</p>
        <p className="text-green-700">User: {auth.user ? 'Logado' : 'Não logado'}</p>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded">
        <h3 className="text-red-800 font-semibold">❌ Erro no OverflowOneAuth</h3>
        <p className="text-red-700">Erro: {error instanceof Error ? error.message : 'Erro desconhecido'}</p>
      </div>
    );
  }
};

export default OverflowOneAuthTest;
