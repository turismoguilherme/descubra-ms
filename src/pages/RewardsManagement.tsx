import React from 'react';
import UniversalLayout from '@/components/layout/UniversalLayout';
import RewardsManager from '@/components/admin/RewardsManager';

const RewardsManagement: React.FC = () => {
  return (
    <UniversalLayout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-ms-primary-blue">Gestão de Recompensas</h1>
        <RewardsManager />
      </div>
    </UniversalLayout>
  );
};

export default RewardsManagement; 