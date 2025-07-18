import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { StateDirectorPanel } from '@/components/flowtrip/admin/StateDirectorPanel';
import { useFlowTripAuth } from '@/hooks/useFlowTripAuth';

const StateAdminRoutes = () => {
  const { hasPermission, loading } = useFlowTripAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (!hasPermission(['admin', 'tech', 'diretor_estadual', 'gestor_igr', 'gestor_municipal'])) {
    return <div className="flex items-center justify-center h-screen">Acesso negado</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto p-6">
        <Routes>
          <Route path="/" element={<StateDirectorPanel />} />
          <Route path="/dashboard" element={<StateDirectorPanel />} />
        </Routes>
      </div>
    </div>
  );
};

export default StateAdminRoutes;