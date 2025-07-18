import React from 'react';
import { MasterDashboard as MasterDashboardComponent } from '@/components/flowtrip/master/MasterDashboard';
import { SecurityValidator } from '@/components/security/SecurityValidator';

const MasterDashboard = () => {
  return (
    <SecurityValidator requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto p-6">
          <MasterDashboardComponent />
        </div>
      </div>
    </SecurityValidator>
  );
};

export default MasterDashboard;