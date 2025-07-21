import React from 'react';
import LeaderboardDisplay from '@/components/common/LeaderboardDisplay';
import Layout from '@/components/layout/Layout';

const LeaderboardsPage = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Ranking de Viajantes Descubra MS</h1>
        <LeaderboardDisplay />
      </div>
    </Layout>
  );
};

export default LeaderboardsPage; 