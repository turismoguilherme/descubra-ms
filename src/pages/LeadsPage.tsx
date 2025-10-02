import React from 'react';
import LeadManager from '@/components/leads/LeadManager';
import Layout from '@/components/layout/Layout';

const LeadsPage: React.FC = () => {
  return (
    <Layout>
      <LeadManager />
    </Layout>
  );
};

export default LeadsPage;
