import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TourismAnalyticsDashboardSimple: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard de Análise de Turismo</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Dashboard de análise em desenvolvimento.</p>
      </CardContent>
    </Card>
  );
};

export default TourismAnalyticsDashboardSimple;