import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { StateDirectorPanel } from '@/components/flowtrip/admin/StateDirectorPanel';
import { SecurityValidator } from '@/components/security/SecurityValidator';

const StateAdminRoutes = () => {
  return (
    <SecurityValidator requiredRole="diretor_estadual">
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto p-6">
          <Routes>
            <Route path="/" element={<StateDirectorPanel />} />
            <Route path="/dashboard" element={<StateDirectorPanel />} />
          </Routes>
        </div>
      </div>
    </SecurityValidator>
  );
};

export default StateAdminRoutes;