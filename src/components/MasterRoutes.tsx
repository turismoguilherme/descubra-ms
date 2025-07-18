import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MasterDashboard from '@/pages/master/MasterDashboard';
import { SecurityValidator } from '@/components/security/SecurityValidator';

const MasterRoutes = () => {
  return (
    <SecurityValidator requiredRole="admin">
      <Routes>
        <Route path="/" element={<MasterDashboard />} />
        <Route path="/dashboard" element={<MasterDashboard />} />
      </Routes>
    </SecurityValidator>
  );
};

export default MasterRoutes;