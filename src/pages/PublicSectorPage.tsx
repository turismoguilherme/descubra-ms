import React from 'react';
import Layout from '@/components/layout/Layout';
import { Building2 } from 'lucide-react';

const PublicSectorPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-2">Setor Público</h1>
          <p>Dashboard do setor público temporariamente indisponível</p>
        </div>
      </div>
    </Layout>
  );
};

export default PublicSectorPage;
