import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CATAttendantPanel } from '@/components/flowtrip/attendant/CATAttendantPanel';
import { SecurityValidator } from '@/components/security/SecurityValidator';

const AttendantRoutes = () => {
  return (
    <SecurityValidator requiredRole="atendente">
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto p-6">
          <Routes>
            <Route path="/" element={<CATAttendantPanel />} />
            <Route path="/dashboard" element={<CATAttendantPanel />} />
          </Routes>
        </div>
      </div>
    </SecurityValidator>
  );
};

export default AttendantRoutes;